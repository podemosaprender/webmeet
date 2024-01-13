import { AUDIO_SETTINGS } from '../media/util';

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
		},200); 
	});

}


