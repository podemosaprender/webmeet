/** camara, microfono

SEE: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia

 */

import { SilenceDetector } from './silence-detector';

//S: Move to Library {
// }

/**
 * XXX:try https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Audio_codecs#amr_adaptive_multi-rate
 */
const AUDIO_SETTINGS = { //XXX:CFG
	channels: 1,
	codec: "audio/webm;codecs=opus", 
	sampleSize: 8,
	sampleRate: 8192,
	dBSampleSize: 10
}

/**
 * @group: Navigator API
 * SEE: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#browser_compatibility
*/

/**
 * compute the best options for required mediaStreams (pure)
 */
function getMediaStreamsOpts(wantsVideo=false) {
	let opts= { audio: {}, video: { width: 320, }, };

	const supported_constraints= navigator.mediaDevices.getSupportedConstraints();
	if (supported_constraints.channelCount) { opts.audio.channelCount= AUDIO_SETTINGS.channels; }
	if (supported_constraints.echoCancellation) { opts.audio.echoCancellation= true ; }
	if (supported_constraints.sampleSize) { opts.audio.sampleSize= AUDIO_SETTINGS.sampleSize; }
	if (supported_constraints.sampleRate) { opts.audio.sampleRate= { ideal: AUDIO_SETTINGS.sampleRate}; }
	if (supported_constraints.noiseSuppression) { opts.audio.noiseSuppression = true; }
	//A: audio configured

	if (!wantsVideo) { opts.video= false; }
	else {
		if (supported_constraints.frameRate) { opts.video.frameRate= 1; } //XXX:CFG
	}
	//A: video configured
	//A: video and audio configured
	console.log("AUDIO getMediaStreams", {opts, supported_constraints});

	return opts;
}

function getMediaStreams(wantsVideo: boolean) {
	const opts= getMediaStreamsOpts(wantsVideo);
	return navigator.mediaDevices.getUserMedia(opts); 
}

//S: media recorder
		//SEE: https://github.com/mdn/dom-examples/tree/main/media/web-dictaphone
		//SEE: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

class ChunkMediaRecorder extends EventTarget {
	_stream: MediaStream;
	_datareceived_ms= 200;

	_mediaRecorder?: MediaRecorder;
	_mediaRecorderChunks= new Array(); //U: guardar a medida que graba

	constructor(stream: MediaStream, datareceived_ms=200) {
		super();
		this._stream= stream;
		this._datareceived_ms= datareceived_ms;
	}

	_getMediaRecorder() {
		if (this._mediaRecorder==null) {
			this._mediaRecorder= new MediaRecorder(this._stream, {
				mimeType: AUDIO_SETTINGS.codec,
				bitsPerSecond: AUDIO_SETTINGS.sampleRate
			});

			this._mediaRecorder.onstop = (_) => {
				this.dispatchEvent(new Event('stop'));	
				this._mediaRecorder = undefined;
			}

			this._mediaRecorder.ondataavailable = (e) => {
				this._mediaRecorderChunks.push(e.data);
				//DBG: console.log("CHUNK",(window.xd= e.data));	
				this.dispatchEvent(new CustomEvent('data', {detail: {blob: e.data}}));	
			};

		}
		return this._mediaRecorder;
	}

	start() {
		this._getMediaRecorder().start(this._datareceived_ms);
	}

	stop() {
		if (this._mediaRecorder) {
			//		setTimeout(() => { var a = new Audio(audioURL); a.play(); },200); //TODO: usar promise con grabar
			this._mediaRecorder.stop();
		}
	}

	getAudioBlob() {
		return new Blob(this._mediaRecorderChunks, { type: AUDIO_SETTINGS.codec });
	}

	getAudioURL() {
		return URL.createObjectURL(this.getAudioBlob());
	}
}

/**
* XXX: replace params for EventEmitter
*/
class AudioEmitter extends EventTarget {
	_recorder?: ChunkMediaRecorder;
	_silenceDetector?: SilenceDetector;

	_onSound= () => { //A: event listeners must be "the same pointer" to be removed, arrows capture "this"
		console.log("AUDIO SOUND")
		this._recorder?.start();
	}
	_onSilence= () => {
		console.log("AUDIO SILENCE")
		this._recorder?.stop();
	}
	_onData= (e: Event) => {
		if (this._silenceDetector?.isSilent === false) { //A: only if value is set
			console.log("MIC DATA",e);
		}
	}

	async start() {
		const stream= await getMediaStreams(false)
		this._recorder= new ChunkMediaRecorder(stream);
		this._silenceDetector= new SilenceDetector(stream, 500); //XXX:CFG

		this._silenceDetector.addEventListener('sound', this._onSound)
		this._silenceDetector.addEventListener('silence', this._onSilence)
		this._recorder?.addEventListener('data', this._onData);
	}

	async stop() {
		this._recorder?.stop();
		this._silenceDetector?.stop();

		this._silenceDetector?.removeEventListener('sound', this._onSound)
		this._silenceDetector?.removeEventListener('silence', this._onSilence)
		this._recorder?.removeEventListener('data', this._onData);

		this._recorder= undefined;
		this._silenceDetector= undefined;
		//A: eventListeners removed to ensure objects are destroyed
	}
}

let _micAudioEmitter: AudioEmitter; //A: singleton
export function getMicAudioEmitter() { 
	_micAudioEmitter= _micAudioEmitter || new AudioEmitter();
	return _micAudioEmitter;
}
