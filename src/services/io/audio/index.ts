/** camara, pantalla, microfono

SEE: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia

 */

//S: Move to Library {
// }

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

//S: detect silence
let mediaRecorder; //XXX: can't be encapsulated in function?

//VER: https://github.com/webrtc/samples/blob/gh-pages/src/content/getusermedia/volume/js/soundmeter.js

function detectSilence(stream, onSoundEnd = _=>{}, onSoundStart = _=>{}, onSoundStream = _=>{}, silence_delay = 500, min_decibels = -80) {
	const ctx = new AudioContext();
	const analyser = ctx.createAnalyser();
	const streamNode = ctx.createMediaStreamSource(stream);
	streamNode.connect(analyser);
	analyser.minDecibels = min_decibels;

	const data = new Uint8Array(analyser.frequencyBinCount); // will hold our data
	let silence_start = performance.now();
	let triggered = true; // trigger only once per silence even

	function loop(time) {
		requestAnimationFrame(loop); // we'll loop every 60th of a second to check
		analyser.getByteFrequencyData(data); // get current data

		if (data.some(v => v)) { // if there is data above the given db limit
			if (triggered) {
				triggered = false;
				onSoundStart(mediaRecorder, stream);
			}

			silence_start = time; // set it to now
		}

		if (!triggered && time - silence_start > silence_delay) {
			onSoundEnd(mediaRecorder, stream);
			triggered = true;
		}

		if (mediaRecorder) {
			mediaRecorder.onAudioChunkUpdated = onSoundStream;
		}
	}

	loop();
}

//S: media recorder
function mediaRecorderStart(stream, datareceived_ms=200) {
	if (mediaRecorder!=null) {
    console.log(`mediaRecorder already started`);
		return;
	}

	//SEE: https://github.com/mdn/dom-examples/tree/main/media/web-dictaphone
	//SEE: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
	mediaRecorder= new MediaRecorder(stream, {
    mimeType: AUDIO_SETTINGS.codec,
    bitsPerSecond: AUDIO_SETTINGS.sampleRate
  });

	var mediaRecorderChunks= []; //U: guardar a medida que graba

	mediaRecorder.onstop = (e) => {
		let blob = new Blob(mediaRecorderChunks, { type: AUDIO_SETTINGS.codec });
    let audioUrl = URL.createObjectURL(blob);
    mediaRecorder.onStopCallback(audioUrl, blob, mediaRecorderChunks);
    mediaRecorder = null;
	}

  mediaRecorder["onStopCallback"] = () => {}; //XXX: replace by EventEmitter or callbacks, DON'T add props to API objects
  mediaRecorder["onAudioChunkUpdated"] = () => {};

	mediaRecorder.ondataavailable = (e) => {
    let headerBlob = (mediaRecorderChunks.length == 0);
    mediaRecorderChunks.push(e.data);
    let blob = new Blob([e.data], { type: AUDIO_SETTINGS.codec });
    mediaRecorder.onAudioChunkUpdated(blob, mediaRecorderChunks, headerBlob);
	};

	mediaRecorder.start(datareceived_ms);
}

function mediaRecorderStop(mediaRec) {
	if (mediaRec) {
    mediaRec.onStopCallback = (audioURL, blob, audioChunks) => {
      setTimeout(() => { var a = new Audio(audioURL); a.play(); },200); //TODO: usar promise con grabar
			//XXX: don't force replay
    }
		mediaRec.stop();
	}
}

//S: 
function onSilence(mediaRec) {
	mediaRecorderStop(mediaRec);
}

function onSpeak(mediaRec, stream) {
   mediaRecorderStart(stream);
}

/**
* XXX: replace params for EventEmitter
*/
export async function emitterStart(onSilenceFunc, onSpeakFunc, onReceiveDataFunc) {
	onSilenceFunc= onSilenceFunc || onSilence; 
	onSpeakFunc= onSpeakFunc || onSpeak; 
	onReceiveDataFunc= () => console.log("AUDIO CHUNK");

	return await getMediaStreams()
		.then(stream => {
				window.xs= stream; //XXX:DBG
				detectSilence(stream, onSilenceFunc, onSpeakFunc, onReceiveDataFunc, 500, -70);
		})
		.catch(ex => console.log("AUDIO ERROR",ex));
}

