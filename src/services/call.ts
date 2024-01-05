/** Coordinate io and transports for a call
 *
 */

import * as Peer from './transport/peer'; //XXX: import ONLY needed functions
import * as IOAudio from './io/audio/index'; //XXX: import ONLY needed functions

class CallMgr extends EventTarget {
	_myId= '';
	peers: Record<string,any> = {}; //XXX: para tener lista de ids, usar setters, getters, etc.

	_onAudioData= (e: Event) => {
		this.sendToAll({t: 'audio-chunk', blob: (e as CustomEvent).detail.blob});
	}

	_onAudioSilence=  () => {
		console.log("onAudioSilence");
		this.sendToAll({t: 'audio-end'});
	}

	connectAs(myId: string) {
		Peer.open(myId);
		this._myId= myId;
	}

	sendTo(data: any, peerId: string) {
		data= data || `from ${this._myId} ${(new Date()).toString()}`;
		Peer.send(data, peerId);
	}

	sendToAll(data: any) {
		Object.keys(this.peers).forEach( peerId => this.sendTo(data, peerId) );
	}

	async audioOn() {
		IOAudio.getMicAudioEmitter().addEventListener('data',this._onAudioData);
		IOAudio.getMicAudioEmitter().addEventListener('silence',this._onAudioSilence);
		const r= await IOAudio.getMicAudioEmitter().start();
		console.log("audioOn",r);
	}

	async audioOff() {
		const r= await IOAudio.getMicAudioEmitter().stop();
		IOAudio.getMicAudioEmitter().removeEventListener('data',this._onAudioData);
		IOAudio.getMicAudioEmitter().removeEventListener('data',this._onAudioSilence);
		console.log("audioOff",r);
	}
}

export const callMgr= new CallMgr(); //A: singleton
