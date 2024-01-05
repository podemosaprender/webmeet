/** Coordinate io and transports for a call
 *
 */

import * as Peer from './transport/peer'; //XXX: import ONLY needed functions
import * as IOAudio from './io/audio/index'; //XXX: import ONLY needed functions
import { playAudioChunks } from './io/audio/util';

let emuChunks= new Array(); //XXX: must be per peer
class CallMgr extends EventTarget {
	_myId= '';
	peers: Record<string,any> = {}; //XXX: para tener lista de ids, usar setters, getters, etc.

	_isOpen= false;
	get isOpen() { return this._isOpen }
	get events() { return ['open','sound','silence','peer','text']}

	_onTransportData= (data: any) => { //U: standard event handler for all transports
		if (data.t=='audio-chunk') {
			emuChunks.push(data.blob);
			//XXX: se puede reproducir de a uno? playAudioChunks(emuChunks.length>1 ? [emuChunks[0],data.blob] : emuChunks);
		} else if (data.t=='audio-end') {
			playAudioChunks( emuChunks );
			emuChunks= new Array();
		} else if (data.t=='open') {
			this._isOpen= true;
			this.dispatchEvent(new Event('open'));
		} else if (data.t=='peer') {
			this.peers[data.id]= true;
			this.dispatchEvent(new Event('peer'));
		} else if (data.t=='text') {
			this.dispatchEvent(new CustomEvent('text', {detail: data.text}));
		} else {
			console.log("CALL data", data);
		}
	}

	_onAudioData= (e: Event) => {
		this.sendToAll({t: 'audio-chunk', blob: (e as CustomEvent).detail.blob});
		this.dispatchEvent(new Event('sound'))
	}

	_onAudioSilence=  () => {
		console.log("onAudioSilence");
		this.sendToAll({t: 'audio-end'});
		this.dispatchEvent(new Event('silence'))
	}

	connectAs(myId: string) {
		Peer.open(myId, this._onTransportData);
		this._myId= myId;
	}

	sendTo(data: any, peerId: string) {
		data= data || {t:'text', text: `from ${this._myId} ${(new Date()).toString()}`};
		Peer.send(data, peerId, this._onTransportData);
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
