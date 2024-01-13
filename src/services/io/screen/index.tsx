/** 
 * Screen sharing stream
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture
 *
 * @module
*/

import { getScreenStream } from '../media/util';
export { getScreenStream } from '../media/util';

const Streams: Record<string, MediaStream>= {};

/* 
	.then(s =>{
		var video = document.querySelector('#mivideo');
		video.srcObject = s;
		video.onloadedmetadata = (e) => { video.play(); };
	});
*/

//XXX: guard with if for dead code elimination
import { Commands, TEnv } from '../../terminal';
Commands['media-screen']= async (env: TEnv, argv: string[]) => { 
	const name= argv[1] || 'dflt';
	const st= await getScreenStream(); //XXX:error?

	Streams[name]?.getVideoTracks()[0]?.stop(); //A: if was open
	Streams[name]= st;
	const track0= st.getVideoTracks()[0];
	if (track0!=undefined) { //XXX: error?
		track0.onended= () => { 
			delete Streams[name]; 
			console.log("SCREEN XXX: event! onended",name);
		}
	}

	env['screen-stream-'+name]= st;  
	return 'see screen-stream-'+name 
};

const Capture= async (env: TEnv) => {
	let v= env['media-v'];
	const w=300; const h=300;  //XXX:params
	const canvas = document.createElement('canvas');
	canvas.width  = w;
	canvas.height = h;
	const ctx= canvas.getContext('2d');
	if (ctx) { ctx.drawImage(v, 0, 0, w, h); }
	else { console.log("SCREEN ERROR ctx 2d") }

	env['cnv']= canvas;

	const blob= await new Promise<Blob|null>( (onOk) => canvas.toBlob(b => onOk(b)));
	if (blob) {
		env['b']= blob;
		const url= URL.createObjectURL(blob);
		window.open(url,'capture');
	}
	return 'window should open';
}

Commands['media-screen-capturev']= Capture;

Commands['media-screen-capture']= async (env: TEnv, argv: string[]) => { 
	const name= argv[1] || 'dflt';
	const st= Streams[name];
	
	let v= env['media-v'];
	if (v==null) {
		v= document.createElement('video');
		v.height= 300; v.width= 300; //XXX: use from stream
		env['media-v']= v;
	}

	v.srcObject= st;
	await new Promise( (onOk) => {
		v.onloadedmetadata = (_: Event) => { v.play(); onOk(true) };
	});

	return await Capture(env);
}
console.log(Object.keys(Commands));
