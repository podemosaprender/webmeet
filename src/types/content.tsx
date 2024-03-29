/** Common types to the UI and various services implementations
*/

/** an mp3, image, etc stored in OPFS
 * can be sent, viewed locally, exported, etc.
*/
export interface UploadedItem {
	name: string,
	type: string,
	url?: () => Promise<string>,
	blob: () => Promise<Blob>
}

/** a message with just text, an image, file, board drawing
*/
export interface MediaItem extends UploadedItem {
	author: string,
	date?: Date,
	text: string
}

export interface BoardType {
    scene: THREE.Scene | null,
    camera: THREE.Camera | null,
    renderer: THREE.WebGLRenderer | null
}

export interface BoardElement {
    id: number,
    data: any
}

export function mkMediaItem(d: Partial<MediaItem>) {
	const date= d.date || new Date();
	const author= d.author || 'anon';
	const	type= d.type || 'file';
	const text=	d.text || '';
	const it: MediaItem= {
		type, author, date,
		text,
		name: d.name || author+'__'+date.toJSON(),
		blob: d.blob || (async () => (new Blob([text])))
	};
	return it;
}

//try {save(['x1',(new Date()).toJSON()+'.mp3'], new Blob(chunks));} catch(ex) { console.log("AUDIO SAVE",ex) } //XXX: handle errors!

