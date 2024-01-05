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
	
	return new Promise( (onOk, _) => {
		setTimeout(() => { 
			var a = new Audio(audioURL); 
			//SEE: https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement#events
			a.addEventListener('ended', onOk);
			a.addEventListener('error', onOk); //A: only to know it finished
			a.play(); 
		},200); //TODO: usar promise 
	});

}
