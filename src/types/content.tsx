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
	date: Date,
	text: string
}


