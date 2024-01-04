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

	constructor(stream: MediaStream, silence_delay = 500) {
		super();

		const ctx = new AudioContext();
		const analyser = ctx.createAnalyser();
		const streamNode = ctx.createMediaStreamSource(stream);
		streamNode.connect(analyser);

		const freqDataBuff = new Uint8Array(analyser.frequencyBinCount); 

		let silence_t0 = performance.now();

		const loop= (currentTime: number) => {
			if (this._isStopped) return;

			requestAnimationFrame(loop); //A: check ca. every 1/60th of a second

			analyser.getByteFrequencyData(freqDataBuff); // get current data
			if (freqDataBuff.some(v => (v!=0))) { //A: some freq above db min
				if (this.isSilent) {
					this.isSilent = false;
					console.log("AUDIO SOUND"); //DBG
					this.dispatchEvent(new Event('sound'));
				}

				silence_t0 = currentTime; 
			}

			if (!this.isSilent && currentTime - silence_t0 > silence_delay) {
				this.dispatchEvent(new Event('silence'));
				console.log("AUDIO SILENCE"); //DBG
				this.isSilent = true;
			}
		}

		requestAnimationFrame(loop);
	}

	stop() {
		this._isStopped= true;
	}
}

