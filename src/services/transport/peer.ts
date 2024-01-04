/** INFO: WebRTC peerjs transport
* SEE: https://github.com/peers/peerjs#setup
*/
import { Peer } from 'peerjs';
import { playAudioChunks } from '../io/audio/util';

let _myCx : Peer;
/**
 * peerId -> connection
 */
let _peerCx: Record<string,any>= {}

let emuChunks= new Array(); //XXX: must be per peer

/** accept connections with myId
* @param myId: string with the nick/id other users recognize
*/
export function open(myId: string) {
	_myCx= new Peer(myId, {
		//XXX: host: location.host, //U: puede ser otro ej 'call-s.podemosaprender.org',
		host: 'call-s.podemosaprender.org',
		path:'/call', //U: coordinar con app.use en server!
		secure: true,
		debug: 3, //SEE: https://peerjs.com/docs/#peer-options-debug
	});
	console.log("PEER MY CX START");
	_myCx.on('open', function(id) {
		console.log('My peer ID is: ' + id);
  });
	_myCx.on("connection", (conn) => { //XXX:EMU
		console.log("PEER ON CX");
		conn.on("data", (data: any) => { 
			console.log("PEER DATA",data); 
			if (data.t=='audio-chunk') {
				emuChunks.push(data.blob);
				//XXX: se puede reproducir de a uno? playAudioChunks(emuChunks.length>1 ? [emuChunks[0],data.blob] : emuChunks);
			} else if (data.t=='audio-end') {
				playAudioChunks( emuChunks );
				emuChunks= new Array();
			}
		});
		conn.on("open", () => void(conn.send(`hello from ${myId}!`)));
	});
}

/** send data to other peer based on their id
* @param data: any serializable type
* @param dstId: string with the nick/id other users recognize
*/
export function send(data: any, dstId: string) {
	const doSend= async (conn: any) => {
		console.log("PEER THEIR CX OK");
		try { await conn.send(data); }
		catch (ex) { console.log("PEER SEND ERROR",ex) }
	}

	let conn = _peerCx[dstId];
	if (conn) {
		doSend(conn);
	} else {
		conn= _myCx.connect(dstId);
		console.log("PEER THEIR CX START");
		conn.on("open", async (): Promise<void> => {
			_peerCx[dstId]= conn;
			await doSend(conn) 
		}); //XXX: handle errors and timeouts
	}
}

