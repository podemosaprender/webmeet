
/**
 * XXX:try https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Audio_codecs#amr_adaptive_multi-rate
 */
export const AUDIO_SETTINGS = { //XXX:CFG
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
function getMediaStreamsOpts(wantsVideo=false, defaultOptions: any={}) {
	let opts: any= Object.assign({}, { 
		audio: {}, 
		video: { width: 320, }, 
	}, defaultOptions);;

	const supported_constraints= navigator.mediaDevices.getSupportedConstraints();
	//XXX: type: if (supported_constraints.channelCount) { opts.audio.channelCount= AUDIO_SETTINGS.channels; }
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
	console.log("MEDIA getMediaStreams", {opts, supported_constraints});

	return opts;
}

/**
 * Get audio and optionally video media streams
 *
 * **USE** high-level functions at [io/audio](XXX:LINK)
 */
export function getMediaStreams(wantsVideo: boolean) {
	const opts= getMediaStreamsOpts(wantsVideo);
	return navigator.mediaDevices.getUserMedia(opts); 
}

/**
 * Get screen capture stream
 *
 * **USE** high-level functions at [io/screen](XXX:LINK)
 */
export async function getScreenStream() {
	let opts= getMediaStreamsOpts(true, { video: { width: { max: 1440, }, } }); //XXX:CFG
	return await navigator.mediaDevices.getDisplayMedia(opts)
}


