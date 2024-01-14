/** 
 * Screen sharing stream
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture
 *
 * @module
*/

import { getScreenStream } from '../media/util';
export { getScreenStream } from '../media/util';

//S: utils /////////////////////////////////////////////////

/**
 * Capture a video element on a canvas element, created if null
 *
 * XXX: quality, size, region options
 */
export async function videoElToCanvas(v: HTMLVideoElement, canvas: HTMLCanvasElement | null) {
	const w= v.width || 300; const h= v.height || 300;  //XXX:params
	const canvasOk = canvas || document.createElement('canvas');
	canvasOk.width  = w; canvasOk.height = h;
	const ctx= canvasOk.getContext('2d');
	if (ctx) { ctx.drawImage(v, 0, 0, w, h); }
	else { console.log("SCREEN ERROR ctx 2d") }
	return canvasOk;
}

export async function canvasToBlob(canvas: HTMLCanvasElement) {
	const blob= await new Promise<Blob|null>( (onOk) => canvas.toBlob(b => onOk(b)));
	return blob;
}

/**
 * XXX: quality, size, region options
 */
export async function canvasToDataURL(canvas: HTMLCanvasElement) {
	return canvas.toDataURL();
}

/**
 * get width, height, etc. from a (video) MediaStream
 */
export function streamVideoProps(st: MediaStream) {
	const r= { isVideo: false, width: 0, height: 0 } //DFLT, it's not video
	const videoTrack= st.getVideoTracks()[0];
	if (videoTrack) {
		const settings= videoTrack.getSettings()
		r.isVideo= true;
		r.width= settings.width || 0;
		r.height= settings.height || 0;
	}
	return r;
}

/**
 * Connect a MediaStream to a <video> element. The element is created if null.
 * @category io-video
 */
export async function streamPlayOnVideoEl(st: MediaStream, v: HTMLVideoElement | null) {
	const vProps= streamVideoProps(st);
	const vOk= v || document.createElement('video');
	vOk.height= vOk.height || vProps.height || 300; 
	vOk.width= vOk.width || vProps.width || 300; 

	vOk.srcObject= st;
	await new Promise( (onOk) => {
		vOk.onloadedmetadata = (_: Event) => { vOk.play(); onOk(true) };
	});
	return vOk;
}

//S: Class for cache and lazy init /////////////////////////
/**
 * a SourceData class to lazy initialize and cache captured data
 *
 * @categoty io-video
 *
 */
class SourceData {
	constructor(
		readonly st: MediaStream,
		private _video_el: HTMLVideoElement | null = null,
		private _canvas_el: HTMLCanvasElement | null = null,
		private _capture_dataUrl: string= '',
		private _capture_time: number= 0
 ) {}

	/**
	 * videoEl playing the stream, cached and lazy initialized
	 */
	async getVideoEl() {
		this._video_el= this._video_el || await streamPlayOnVideoEl(this.st, this._video_el);
		return this._video_el!;
	}

	/**
	 * canvasEl capturing the stream, cached and lazy initialized
	 */
	async getCanvasEl() {
		this._canvas_el= await videoElToCanvas( await this.getVideoEl() , this._canvas_el)
		return this._canvas_el!
	}

	/**
	 * capture and return DataURL limiting capture frequency
	 */
	async getDataURL(maxAgeMiliseconds= 2000) {
		if (this._capture_dataUrl=='' || this._capture_time< Date.now()-maxAgeMiliseconds) {
			this._capture_dataUrl= await canvasToDataURL( await this.getCanvasEl() );
			this._capture_time= Date.now();
		}
		return this._capture_dataUrl;
	}
}


const Sources: Record<string, SourceData>= {};

export function sources() {
	return Object.keys(Sources);
}

export async function sourceGetOrOpen(name: string) {
	let src= Sources[name];
	if (src==null) {
		src= new SourceData(await getScreenStream()); //XXX:error?
		Sources[name]= src;

		const track0= src.st.getVideoTracks()[0];
		if (track0!=undefined) { //XXX: error?
			track0.onended= () => { 
				delete Sources[name]; 
				console.log("SCREEN XXX: event! onended",name);
			}
		}
	}
	return src!;
}

export async function sourceClose(name: string) {
	Sources[name]?.st.getVideoTracks()[0]?.stop(); //A: if was open
	delete Sources[name];
}

export async function sourceCapture(name: string) {
	const src= await sourceGetOrOpen(name);
	return src.getDataURL()
}

//XXX: guard with if for dead code elimination
import { Commands, TEnv } from '../../terminal';
Commands['media-screen']= async (env: TEnv, argv: string[]) => { 
	const name= argv[1] || 'dflt';
	await sourceGetOrOpen(name);
	env['screen-sources']= Sources;  
	return 'see screen-sources';
};

Commands['media-screen-capture']= async (env: TEnv, argv: string[]) => { 
	const name= argv[1] || 'dflt';
	const src= await sourceGetOrOpen(name);
	env['screen-sources']= Sources;

	const url= await src.getDataURL()
	window.open(url, 'capture');
	return 'window should open';	
}
