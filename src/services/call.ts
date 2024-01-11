/** Coordinate io and transports for a call
 *
 */

import * as Peer from './transport/peer'; //XXX: import ONLY needed functions
import * as IOAudio from './io/audio/index'; //XXX: import ONLY needed functions
import { MediaItem } from '../types/content';

let emuChunks= new Array(); //XXX: must be per peer

class CallMgr extends EventTarget {
	_myId= '';
	peers: Record<string,any> = {}; //XXX: para tener lista de ids, usar setters, getters, etc.
	routes: Array<string>[] = []; 

	_isOpen= false;
	get isOpen() { return this._isOpen }
	get events() { return ['error','open','sound','silence','peer','item']}

	async _onAudioEnd(chunks: any[], data: any) {
		//try {save(['x1',(new Date()).toJSON()+'.mp3'], new Blob(chunks));} catch(ex) { console.log("AUDIO SAVE",ex) } //XXX: handle errors!
		if (chunks.length<1) return; //XXX:error?

		const blob= new Blob(chunks);
		//XXX: copied, DRY {
		const author= data.r[0];
		const date= new Date(); //XXX: use from sender+NTP
		const item: MediaItem= {
			type: 'mp3', text: 'audio',
			blob: async () => blob,
			name: author+'__'+date,
			author, date,
		}
		this.dispatchEvent(new CustomEvent('item',{detail: item}));
		// DRY }
	}

	_onTransportData= (data: any) => { //U: standard event handler for all transports
		if (data.t=='open') {
			this._isOpen= true;
			this.dispatchEvent(new Event('open'));
		} else if (data.t=='peer') {
			this.dispatchEvent(new Event('peer'));
		} else if (data.t=='error') {
			this.dispatchEvent(new Event('peer'));
			this.dispatchEvent(new CustomEvent('error',{detail:{msg: String(data.err), id: (data.r||[])[0]}}) );

		} else if (data.t=='audio-chunk') { //XXX:make extensible/composable with a kv data.t => handler?
			emuChunks.push(data.blob);
			//XXX: @Maxi se puede reproducir de a uno? playAudioChunks(emuChunks.length>1 ? [emuChunks[0],data.blob] : emuChunks);
		} else if (data.t=='audio-end') { //XXX: receive from multiple peers simultaneously!
			this._onAudioEnd( emuChunks, data ); //A: don't start before previous finishes, use a queue!
			emuChunks= new Array();

		} else if (data.t=='text') {
			const author= data.r[0];
			const date= new Date(); //XXX: use from sender+NTP
			const item: MediaItem= {
				type: 'text',
				text: data.text,
				blob: async () => (new Blob([data.text])),
				name: author+'__'+date,
				author, date,
			}

			this.dispatchEvent(new CustomEvent('item',{detail: item}));

		} else if (data.t=='ping') {
			this.sendTo({...data, t: 'pong', pong_t: Date.now()}, data.r.toReversed().slice(1, data.r.length));
		} else if (data.t=='pong') {
			let dt= Date.now() - data.ping_t
			console.log('CALL pong', data.r[0],dt)	 
			this.dispatchEvent(new CustomEvent('text', {detail: {text: `PONG ${dt}`, id: data.r[0]}}));

		} else if (data.t =='forward') {
			this.sendTo(data.d, data.r, data.ri);
			console.log("forwarding message", data);
			//this._onTransportData(data.d); //XXX:@Maxi why?
		} else {
			console.log("CALL data", data);
		}
	}

	_audioLastIdx= -1;
	_onAudioData= (e: Event) => {
		this._audioLastIdx++;
		this.sendToAll({t: 'audio-chunk', idx: this._audioLastIdx, blob: (e as CustomEvent).detail.blob});
		this.dispatchEvent(new Event('sound'))
	}

	_onAudioSilence=  () => {
		console.log("onAudioSilence");
		if (this._audioLastIdx>-1) {
			this.sendToAll({t: 'audio-end', idx: this._audioLastIdx});
		}
		this.dispatchEvent(new Event('silence'))
		this._audioLastIdx= -1;
	}

	connectAs(myId: string) {
		Peer.open(myId, this._onTransportData);
		this._myId= myId;
	}

	sendTo(data: any, route: string[], currentPeerIndex: number = 0) {
		let packetRoute = (currentPeerIndex == 0) ? [this._myId, ...route] : route;
		let nextPeerIndex = currentPeerIndex+1;
		let dataToSend: any;
		data = data || {t:'text', text: `from ${this._myId} ${(new Date()).toString()}`};

		if (nextPeerIndex < packetRoute.length-1) {
			dataToSend = {t:'forward', d:data, r:packetRoute, ri:nextPeerIndex};
		} else {
			dataToSend = {...data, r:packetRoute, ri:nextPeerIndex};
		}

		console.log("Sending with route ", dataToSend);

		Peer.send(dataToSend, packetRoute[nextPeerIndex], this._onTransportData);
	}

	sendToAll(data: any) {
		this.routes.forEach( route => this.sendTo(data, route) );
	}

	pingAll() {
		this.routes.forEach( route => this.sendTo({t:'ping', ping_t: Date.now()}, route));
	}

	ping(peerId: string) {
		this.sendTo({t:'ping', ping_t: Date.now()}, [peerId]);
	}


	async audioOn(wantsSilenceDetector=true) {
		IOAudio.getMicAudioEmitter().addEventListener('data',this._onAudioData);
		IOAudio.getMicAudioEmitter().addEventListener('silence',this._onAudioSilence);
		const r= await IOAudio.getMicAudioEmitter().start(wantsSilenceDetector);
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
