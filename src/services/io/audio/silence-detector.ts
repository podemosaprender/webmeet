/** Detect Silence, raise Events
 * XXX: usage ex
 * SEE: https://github.com/webrtc/samples/blob/gh-pages/src/content/getusermedia/volume/js/soundmeter.js
 */


/**
 * **WARNING:** don't forget to call stop() before destroying!
 */

export class SilenceDetector extends EventTarget {
	isSilent= true; //XXX:readonly
	_isStopped= false; 

	constructor(stream: MediaStream, silence_after_ms = 100) {
		super();

		silence_after_ms= 500;
		const ctx = new AudioContext();
		const analyser = ctx.createAnalyser();
		analyser.fftSize= 256; //U: sample bytes, SEE: https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize

		const streamNode = ctx.createMediaStreamSource(stream);
		streamNode.connect(analyser);

		const freqDataBuff = new Uint8Array(analyser.frequencyBinCount); 
		const timeDataBuff = new Uint8Array(analyser.fftSize);

		let sound_last_t = performance.now();
		let threshold_last= 0;
		let loop_timer= 0;

		const loop= () => {
			if (this._isStopped) return;

			const currentTime= performance.now();
			analyser.getByteFrequencyData(freqDataBuff); 
			analyser.getByteTimeDomainData(timeDataBuff);
			let s= timeDataBuff.reduce((acc,v) => acc+((v-128)*(v-128)),0)
			let freqs= freqDataBuff.slice(5,25)
			if (s>200 && freqs.some(v => (v>threshold_last))) { //A: some freq above db min //XXX:CFG
				if (this.isSilent) {
					this.isSilent = false;
					console.log("AUDIO SOUND"); //DBG
					this.dispatchEvent(new Event('sound'));
				}
				let v_max= Math.max.apply(null, Array.from(freqs))
				let f_max= freqs.indexOf(v_max)
				//DBG: 
				console.log("AUDIO MAXMIN", freqDataBuff.length, threshold_last, v_max, f_max, s, s<200)
				threshold_last= Math.max(30,v_max-30)
				sound_last_t = currentTime; 
			}
			const sound_last_dt= currentTime - sound_last_t; 
			if (!this.isSilent) {
				console.log("AUDIO WAITING",sound_last_dt);
				if (sound_last_dt > silence_after_ms) {
					this.isSilent = true;
					threshold_last= 0;
					this.dispatchEvent(new Event('silence'));
					console.log("AUDIO SILENCE"); //DBG
				}
			}

			clearTimeout(loop_timer);
			loop_timer= setTimeout(loop, silence_after_ms/5); 
		}


		loop()
	}

	stop() {
		this._isStopped= true;
	}
}

