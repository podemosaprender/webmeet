/** Coordinate io and transports for a call
 *
 */

import * as Peer from './transport/peer'; //XXX: import ONLY needed functions
import * as IOAudio from './io/audio/index'; //XXX: import ONLY needed functions

let _myId: string;
export const peers: Record<string,any> = {}; //XXX: para tener lista de ids, usar setters, getters, etc.

export function connectAs(myId: string) {
	Peer.open(myId);
	_myId= myId;
}

export function sendTo(data: any, peerId: string) {
	data= data || `from ${_myId} ${(new Date()).toString()}`;
	Peer.send(data, peerId);
}

export function sendToAll(data: any) {
	Object.keys(peers).forEach( peerId => sendTo(data, peerId) );
}

function onAudioData(e: Event) {
	sendToAll({t: 'audio-chunk', blob: (e as CustomEvent).detail.blob});
}

function onAudioSilence(_) {
	console.log("onAudioSilence");
	sendToAll({t: 'audio-end'});
}

export const audioOn = async ()=> {
	IOAudio.getMicAudioEmitter().addEventListener('data',onAudioData);
	IOAudio.getMicAudioEmitter().addEventListener('silence',onAudioSilence);
	const r= await IOAudio.getMicAudioEmitter().start();
	console.log("audioOn",r);
}

export const audioOff = async ()=> {
	const r= await IOAudio.getMicAudioEmitter().stop();
	IOAudio.getMicAudioEmitter().removeEventListener('data',onAudioData);
	console.log("audioOff",r);
}

