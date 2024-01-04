/** camara, pantalla, microfono

SEE: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia

*/

//S: Move to Library {
// }

const AUDIO_SETTINGS = {
  channels: 1,
  codec: "audio/webm;codecs=opus",
  sampleSize: 8,
  sampleRate: 8192,
  dBSampleSize: 10
}

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;  
const supported_constraints= navigator.mediaDevices.getSupportedConstraints();

export function emitterStart(soloAudio: boolean) {
	var opts= { audio: {}, video: { width: 320, }, };

	if (supported_constraints.channelCount) { opts.audio.channelCount= AUDIO_SETTINGS.channels; }
	if (supported_constraints.echoCancellation) { opts.audio.echoCancellation= true ; }
	if (supported_constraints.sampleSize) { opts.audio.sampleSize= AUDIO_SETTINGS.sampleSize; }
	if (supported_constraints.sampleRate) { opts.audio.sampleRate= { ideal: AUDIO_SETTINGS.sampleRate}; }
	if (supported_constraints.noiseSuppression) { opts.audio.noiseSuppression = true; }
	//A: audio configured

	if (soloAudio) { opts.video= false; }
	else {
		if (supported_constraints.frameRate) { opts.video.frameRate= 1; }
	}
	return new Promise( (on_ok, on_err) => navigator.getUserMedia(opts, on_ok, on_err));
}
