/** INFO: WebRTC peerjs transport
* SEE: https://github.com/peers/peerjs#setup
*/
import { Peer } from 'peerjs';

let _myCx : Peer;

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
		conn.on("data", (data) => { console.log("PEER DATA",data); });
		conn.on("open", () => void(conn.send(`hello from ${myId}!`)));
	});
}

export function send(data: any, dstId: string) {
	const conn = _myCx.connect(dstId);
	console.log("PEER THEIR CX START");
	conn.on("open", async (): Promise<void> => {
		console.log("PEER THEIR CX OK");
		try { await conn.send(data); }
		catch (ex) { console.log("PEER SEND ERROR",ex) }
	});
}

