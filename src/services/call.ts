/** 
 * Coordinate io and transports for a call
 *
 * only a `const` with the {@link callMgr} **SINGLETON** is exported
 *
 * @module
 */

import * as Peer from './transport/peer'; //XXX: import ONLY needed functions
import * as IOAudio from './io/audio/index'; //XXX: import ONLY needed functions

import { MediaItem, UploadedItem, BoardElement } from '../types/content';
import { NodeId, Route, Message, StdMessageTypes, MediaItemDataFirstPart, MediaItemDataPart, MediaItemData } from '../types/transport';

import Emittery from 'emittery';


/** 
 * Listen with `on` to these {@link callMgr} singleton events
 */
type CallMgrEvents= {
	error: Message,

	/** 
	 * Our [node](XXX:DOC:NODE) is ready to receive and send {@link @MediaItem} 
	 */
	open: undefined,

	/** 
	 * A connection is established with other  [node](XXX:DOC:NODE)
	 */
	peer: undefined,

	/** 
	 * when a MediaItem is received from others or our own [node](XXX:DOC)
	 */
	item: MediaItem,

	/**
	 * mic recording is on and sound is detected
	 */
	sound: undefined,
	/**
	 * mic recording is on and silence is detected
	 */
	silence: undefined,
}


let emuIdToChunks: Record<string,MediaItemDataPart[]>= {}; //XXX: must be per peer

/**
 * The CallMgr class extends Emittery with {@link CallMgrEvents}
 *
 * @see How it's used in [App.App](../functions/App.default.html)
 *
 * XXX: inject dependencies eg transports, message handlers, etc.
 *
 * @category net
 *
 */
class CallMgr extends Emittery<CallMgrEvents> {
	/**
	 * The @NodeId used to identify this node to other nodes
	 *
	 * XXX: allow UserId to be != NodeId to be != TransportId
	 * so I can be MauricioCap in my mobile and PC
	 * using websockets in one and WebRTC on the other
	 *
 	 * @category net
	 */
	get myId() { return this._myId }
	private _myId: NodeId= '';

	/**
	 * Are we ready to receive and send @MediaItem
 	 * @category net
		*/
	get isOpen() { return this._isOpen }
	private _isOpen= false;

	/**
	 * Set the XXX:UserId and connect to available transports
	 *
	 * @category net
	 */
	connectAs(myId: string) {
		Peer.open(myId, this._onTransportMsg);
		this._myId= myId;
	}

	/**
	 * Routes we send to
	 *
	 * XXX: encapsulate in a method
	 * XXX: let peers / signaling server coordinate routes, forwarding, etc
	 *
	 * @category net
	 */
	routes: Route[] = []; 

	//S: Transport /////////////////////////////////////////////
	
	/**
	 * Transport implementations send recieved messages to this callback.
	 *
	 * Some message types may be ignored.
	 *
	 * XXX: reimplement `forward` and `ping` with the new {@link Message} format.
	 *
	 *    * Make `forward` independent of the packet type
	 *    * Replace `ping` with a flag to make receivers/forwarders to add a timestamp to the data
	 *
	 * @category net
	 */
	private _onTransportMsg= async (msg: Message) => { //U: standard event handler for all transports
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
			this._sendTo(data.d, data.r, data.ri);
			console.log("forwarding message", data);
			//this._onTransportMsg(data.d); //XXX:@Maxi why?

		} else if (data.t=='ping') {
			this._sendTo({...data, t: 'pong', pong_t: Date.now()}, data.r.toReversed().slice(1, data.r.length));
		} else if (data.t=='pong') {
			let dt= Date.now() - data.ping_t
			console.log('CALL pong', data.r[0],dt)	 
//XXX			this.emit('text', {text: `PONG ${dt}`, id: data.r[0]}}));

*/
		} else if (msg.type == StdMessageTypes.MediaItem) {
			//XXX:SEC validations?
			const itemData: MediaItemData= msg.payload;
			const it: MediaItem= {... itemData,
				blob: async () => new Blob(itemData.data ? [itemData.data] : undefined),//A: uint8array -> blobParts
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


	private _sendTo(data: any, route: string[], currentPeerIndex: number = 0) {
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

	private _sendToAll(data: any) {
		this._onTransportMsg(data) //A: all means ourselves too!
		this.routes.forEach( route => this._sendTo(data, route) );
	}

	/**
	 * send a {@link MediaItem} to all connected peers including myself
	 *
	 * peers get the item listening to `callMgr.on('item', (it: MediaItem) => ...`
	 *
	 * @category net
	 *
	 */
	async sendItemToAll(item: MediaItem) {
		const blob= await item.blob();
		const msg= new Message();
		msg.topics=['meet']; //XXX: add e.g. name of this meeting
		msg.source= this._myId;
		msg.type= 'item';
		msg.payload= { //XXX: extract from MediaItem
			type: item.type,
			author: item.author, date: item.date,
			name: item.name, 
			text: item.text,
			data: blob, 
		} as MediaItemData;
		this._sendToAll(msg);
	}

	/**
	 * @category net
	 */
	ping(peerId: NodeId) {
		this._sendTo({t:'ping', ping_t: Date.now()}, [peerId]);
	}

	/**
	 * @category net
	 */
	pingAll() {
		this.routes.forEach( route => this._sendTo({t:'ping', ping_t: Date.now()}, route));
	}

	//S: AUDIO /////////////////////////////////////////////////
	// audio source / mic event handling
	private _audioLastId= 0;
	private _audioLastIdx= -1;
	private _audioLastDate= new Date()
	private _onAudioData= (e: Event) => {
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

		this._sendToAll(new Message({
			source: this._myId,
			type: StdMessageTypes.MediaItemPart,
			topics: ['mic'],
			payload
		}));

		this.emit('sound')
	}

	private _onAudioSilence=  () => {
		console.log("onAudioSilence");
		if (this._audioLastIdx>-1) {
			const payload: MediaItemDataPart = {
				mediaItemDataId: `a_${this._audioLastId}`,
				data: new Blob(),
				isLastPart: true
			}

			this._sendToAll(new Message({
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
	*
	* @category audio-mic
	*/
	async audioOn(wantsSilenceDetector=true) {
		IOAudio.getMicAudioEmitter().addEventListener('data',this._onAudioData);
		IOAudio.getMicAudioEmitter().addEventListener('silence',this._onAudioSilence);
		const r= await IOAudio.getMicAudioEmitter().start(wantsSilenceDetector);
		console.log("audioOn",r);
	}

	/**
	* Turn off audio recording and sending
	*
	* @category audio-mic
	*/
	async audioOff() {
		const r= await IOAudio.getMicAudioEmitter().stop();
		IOAudio.getMicAudioEmitter().removeEventListener('data',this._onAudioData);
		IOAudio.getMicAudioEmitter().removeEventListener('data',this._onAudioSilence);
		console.log("audioOff",r);
	}
}

/**
 * The `callMgr` **SINGLETON** is the single point to
 *
 *    * control mic recording and sending
 *    * control all network transports: WebRTC, WebSockets, etc.
 *    * [sendItemToAll](../classes/services_call._internal_.CallMgr.html#sendItemToAll) peers
 *    * receive {@link MediaItem} s subscribing to `callMgr.on('item', (it: MediaItem) => ...`
 *
 * @category net
 *
 */
export const callMgr= new CallMgr({debug: { name: 'callMgr', enabled: false}}); //A: singleton
