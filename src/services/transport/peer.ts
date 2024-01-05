/** INFO: WebRTC peerjs transport
* SEE: https://github.com/peers/peerjs#setup
* SEE: https://peerjs.com/docs/#peeron
* SEE: https://peerjs.com/docs/#dataconnection-on
*/
import { Peer } from 'peerjs';

let _myCx : Peer;
/**
 * peerId -> connection
 */
let _peerCx: Record<string,any>= {}


/** accept connections with myId
* @param myId: string with the nick/id other users recognize
*/
export function open(myId: string, onData: (data: any) => void) {
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
		onData({t: 'open', id});
	});
	_myCx.on('error', (err) => {
		onData({t: 'error', id: myId, err} ) 
	})
	_myCx.on("connection", (cx) => { 
		console.log("PEER ON CX", cx);

		cx.on("open", () => {
			_peerCx[ cx.peer ]= cx;
			cx.send({t: 'hello', from: myId});
			onData({t: 'peer', id: cx.peer});
		});
		cx.on("data", (data: any) => { 
			console.log("PEER DATA",data); 
			onData(data);
		});
		cx.on('error', (err: any) => {
			onData({t: 'error', id: cx.peer, err} ) 
		})
		cx.on('close', () => {
			onData({t: 'error', id: cx.peer, err: 'close'} ) 
		});
	});
}

/** send data to other peer based on their id
* @param data: any serializable type
* @param dstId: string with the nick/id other users recognize
*/
export async function send(data: any, dstId: string, onData: (data: any) => void) {
	const doSend= async (cx: any) => {
		console.log("PEER THEIR CX OK");
		try { await cx.send(data); }
		catch (ex) { console.log("PEER SEND ERROR",ex) }
	}

	let cx = _peerCx[dstId];
	if (cx) {
		await doSend(cx);
	} else {
		cx= _myCx.connect(dstId);//XXX: handle errors and timeouts
		console.log("PEER THEIR CX START");
		cx.on("open", async (): Promise<void> => {
			_peerCx[dstId]= cx;
			await doSend(cx) 
		}); 
		cx.on("data", (data: any) => { 
			data.id= cx.peer;
			console.log("PEER DATA",data); 
			onData(data);
		});
		cx.on('error', (err: any) => {
			onData({t: 'error', id: cx.peer, err} ) 
		});
		cx.on('close', () => {
			onData({t: 'error', id: cx.peer, err: 'close'} ) 
		});
	}
}

