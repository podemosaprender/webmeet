/** INFO: WebRTC peerjs transport
* SEE: https://github.com/peers/peerjs#setup
* SEE: https://peerjs.com/docs/#peeron
* SEE: https://peerjs.com/docs/#dataconnection-on
*/
import { NodeId, Message, StdMessageTypes } from '../../types/transport';
import { Peer } from 'peerjs';

let _myCx : Peer;
/**
 * peerId -> connection
 */
let _peerCx: Record<NodeId,any>= {}

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
		const msg= new Message();
		msg.type= StdMessageTypes.Open;
		msg.source= id;
		onData(msg);
	});
	_myCx.on('error', (err) => {
		const msg= new Message();
		msg.type= StdMessageTypes.Error;
		msg.source= myId;
		msg.payload= err;
		onData(msg) 
		//A: Can't connect to peer is reported here.
	})
	_myCx.on("connection", (cx) => { 
		console.log("PEER ON CX", cx);

		cx.on("open", () => {
			_peerCx[ cx.peer ]= cx;
			const msg= new Message();
			msg.source= cx.peer;
			msg.type= StdMessageTypes.Peer;
			cx.send(msg);
			onData(msg);
		});

		cx.on("data", (data: any) => { 
			console.log("PEER DATA",data); 

			const msg= new Message();

			if (typeof(data)=="object") { //A: ANY object will be considered a Message
				msg.assign(data)
			}

			onData(msg);
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

	//XXX: Check if connected, handle error, retry.
	let cx = _peerCx[dstId];
	console.log("Peer send cx", cx);
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
			delete _peerCx[cx.peer];
			console.log("PEER ERROR");
			onData({t: 'error', id: cx.peer, err} ) 
		});
		cx.on('close', () => {
			delete _peerCx[cx.peer];
			console.log("PEER CLOSE");
			onData({t: 'error', id: cx.peer, err: 'close'} ) 
		});
	}
}

