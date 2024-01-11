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

/** e.g. a message received 
*/
export interface MediaItem extends UploadedItem {
	author: string,
	date?: Date,
	text: string
}

export function mkMediaItem(data: any, chunks: any[]) {
	//try {save(['x1',(new Date()).toJSON()+'.mp3'], new Blob(chunks));} catch(ex) { console.log("AUDIO SAVE",ex) } //XXX: handle errors!
	if (chunks.length<1) return; //XXX:error?

	const blob= new Blob(chunks);

	const author= data.r[0];
	const date= new Date(); //XXX: use from sender+NTP
	const item: MediaItem= {
		type: 'mp3', text: 'audio',
		blob: async () => blob,
			name: author+'__'+date,
		author, date,
	}

	return item;
}
