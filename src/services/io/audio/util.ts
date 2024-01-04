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

export function	getAudioBlob(chunks: any) {
	return new Blob(chunks, { type: AUDIO_SETTINGS.codec });
}

export function	getAudioURL(chunks: any) {
	return URL.createObjectURL(getAudioBlob(chunks));
}

export function playAudioChunks(chunks: any) {
	const audioURL= getAudioURL(chunks);
	setTimeout(() => { var a = new Audio(audioURL); a.play(); },200); //TODO: usar promise 
}
