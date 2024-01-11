/** 
 * Coordinate io and transports for a call
 *
 * only a `const` with a **SINGLETON** is exported
 *
 * @module
 */

import * as Peer from './transport/peer'; //XXX: import ONLY needed functions
import * as IOAudio from './io/audio/index'; //XXX: import ONLY needed functions
import { MediaItem } from '../types/content';
import { NodeId, Route, Message, StdMessageTypes, MediaItemDataFirstPart, MediaItemDataPart, MediaItemData } from '../types/transport';

import Emittery from 'emittery';

/** 
 * Listen with `on` to these {@link callMgr} singleton events
 */
type CallMgrEvents= {
	error: Message,
	open: undefined,
	peer: undefined,
	item: MediaItem,
	sound: undefined,
	silence: undefined
}


let emuIdToChunks: Record<string,MediaItemDataPart[]>= {}; //XXX: must be per peer

/**
 * The CallMgr class extends Emittery with CallMgrEvents
 *
 * @see How it's used in [App.App](../functions/App.default.html)
 *
 * XXX: inject dependencies eg transports, message handlers, etc.
 */
class CallMgr extends Emittery<CallMgrEvents> {
	_myId= '';
	routes: Route[] = []; 

	_isOpen= false;
	get isOpen() { return this._isOpen }

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
			name: author+'__'+date.toJSON(),
			author, date,
		}
		this.emit('item', item);
		// DRY }
	}

	_onTransportMsg= (msg: Message) => { //U: standard event handler for all transports
		if (msg.type == StdMessageTypes.Open) {
			this._isOpen= true;
			this.emit('open');
		} else if (msg.type == StdMessageTypes.Peer) {
			this.emit('peer');
		} else if (msg.type == StdMessageTypes.Error) {
			this.emit('peer');
			this.emit('error', msg );
/*
		} else if (data.t =='forward') {
			this.sendTo(data.d, data.r, data.ri);
			console.log("forwarding message", data);
			//this._onTransportMsg(data.d); //XXX:@Maxi why?

		} else if (data.t=='ping') {
			this.sendTo({...data, t: 'pong', pong_t: Date.now()}, data.r.toReversed().slice(1, data.r.length));
		} else if (data.t=='pong') {
			let dt= Date.now() - data.ping_t
			console.log('CALL pong', data.r[0],dt)	 
//XXX			this.emit('text', {text: `PONG ${dt}`, id: data.r[0]}}));

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

			this.emit('item', item);
*/
		} else if (msg.type == StdMessageTypes.MediaItem) {
			//XXX:SEC validations?
			const it: MediaItem= {... msg.payload,
				text: msg.payload?.type=='text' ? msg.payload.blob : null,
				blob: async () => msg.payload?.blob,
			}
			this.emit('item', it);
		} else if (msg.type == StdMessageTypes.MediaItemPart) {
			//XXX:SEC validations?
			const part: MediaItemDataPart= msg.payload;

			const parts= emuIdToChunks[ part.mediaItemDataId ] || new Array<MediaItemDataPart>();
			emuIdToChunks[ part.mediaItemDataId ]= parts; 
			//XXX:SEC limit, timeout, etc.

			parts.push(part);
			console.log("CALL MediaItemPart", part.mediaItemDataId, parts.length);

			if (part.isLastPart) {
				const head= parts[0] as MediaItemDataFirstPart;
				const blob= new Blob(parts.map((p) => p.data));
				const it: MediaItem= {
					type: head.type,
					author: head.author,
					name: head.name,
					date: head.date,
					text: head.name,
					blob: async () =>blob
				}
				console.log("CALL MediaItemPart last", part.mediaItemDataId, parts.length, head);

				delete emuIdToChunks[ part.mediaItemDataId ] //A: cleanup buffer

				this.emit('item', it);
			}
		} else {
			console.log("CALL onMsg", msg);
		}
	}

	connectAs(myId: string) {
		Peer.open(myId, this._onTransportMsg);
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

		Peer.send(dataToSend, packetRoute[nextPeerIndex], this._onTransportMsg);
	}

	sendToAll(data: any) {
		this.routes.forEach( route => this.sendTo(data, route) );
	}

	sendMessageToAll(msg: Message) {
		this.sendToAll(msg);
	}

	ping(peerId: NodeId) {
		this.sendTo({t:'ping', ping_t: Date.now()}, [peerId]);
	}

	pingAll() {
		this.routes.forEach( route => this.sendTo({t:'ping', ping_t: Date.now()}, route));
	}

	/**
		* audio source / mic event handling
	*/
	_audioLastId= 0;
	_audioLastIdx= -1;
	_audioLastDate= new Date()
	_onAudioData= (e: Event) => {
		this._audioLastIdx++;
		const payload: MediaItemDataPart= (
	 		(this._audioLastIdx==0)
			? {
				type: 'audio',
				date: this._audioLastDate,
				author: this._myId,
				name: `mic-${this._myId}-${this._audioLastDate.toJSON()}`,

				mediaItemDataId: `a_${this._audioLastId}`,
				data: (e as CustomEvent).detail.blob
			} as MediaItemDataFirstPart
			: {
				mediaItemDataId: `a_${this._audioLastId}`,
				data: (e as CustomEvent).detail.blob
			}
		)

		this.sendToAll(new Message({
			source: this._myId,
			type: StdMessageTypes.MediaItemPart,
			topics: ['mic'],
			payload
		}));

		this.emit('sound')
	}

	_onAudioSilence=  () => {
		console.log("onAudioSilence");
		if (this._audioLastIdx>-1) {
			const payload: MediaItemDataPart = {
				mediaItemDataId: `a_${this._audioLastId}`,
				data: new Blob(),
				isLastPart: true
			}

			this.sendToAll(new Message({
				source: this._myId,
				type: StdMessageTypes.MediaItemPart,
				topics: ['mic'],
				payload
			}));

			this._audioLastId++; //A: for the next audio
			this._audioLastIdx= -1;
		}
		this.emit('silence')
	}

	/**
		* Turn on audio recording and sending
	*/
	async audioOn(wantsSilenceDetector=true) {
		IOAudio.getMicAudioEmitter().addEventListener('data',this._onAudioData);
		IOAudio.getMicAudioEmitter().addEventListener('silence',this._onAudioSilence);
		const r= await IOAudio.getMicAudioEmitter().start(wantsSilenceDetector);
		console.log("audioOn",r);
	}

	/**
		* Turn off audio recording and sending
	*/
	async audioOff() {
		const r= await IOAudio.getMicAudioEmitter().stop();
		IOAudio.getMicAudioEmitter().removeEventListener('data',this._onAudioData);
		IOAudio.getMicAudioEmitter().removeEventListener('data',this._onAudioSilence);
		console.log("audioOff",r);
	}
}

export const callMgr= new CallMgr({debug: { name: 'callMgr', enabled: false}}); //A: singleton
