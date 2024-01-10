/** Store files in the browser's OriginPrivateFileSystem
 * XXX: upgrade to API interface for other storage types
 * SEE: https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream/write
 */

import { MediaItem } from '../../types/content';

function pathElementsToDirsAndFile( path: string[] ): [string[], string] {
	return [ path.slice(0,-1), path.slice(-1)[0] ];
}

async function dirHandle( pathElements: string[], wantsCreate=false ) {
	let r = await navigator.storage.getDirectory();
	for (let i=0; i<pathElements.length; i++) {
		r= await r.getDirectoryHandle(pathElements[i], {create: wantsCreate});
	}
	return r;
}

export async function save( path: string[], blob: Blob ) {
	const [ dirs, fname ]= pathElementsToDirsAndFile(path);
	//DBG: console.log("FILE SAVE OPFS",{path, dirs, fname});
	const subDir = await dirHandle(dirs, true);
	const newFile   = await subDir.getFileHandle( fname , { "create" : true });
	const wtr = await newFile.createWritable();
	try { await wtr.write( blob ); }
	finally { await wtr.close(); }
	//DBG: console.log("FILE SAVE OPFS OK",{path, dirs, fname});
}

export async function load( path: string[] ): Promise<Blob> { 
	const [ dirs, fname ]= pathElementsToDirsAndFile(path);
	const subDir = await dirHandle(dirs);
	const savedFile = await subDir.getFileHandle( fname ); 
	return await savedFile.getFile();
}

export async function remove( path: string[] ) { 
	const [ dirs, fname ]= pathElementsToDirsAndFile(path);
	const subDir = await dirHandle( dirs );
	return await subDir.removeEntry( fname, {recursive: true} );
}

export interface FSMediaItem extends MediaItem {
	_handle?: any,
}

export async function entries( path: string[] ): Promise<FSMediaItem[]> { 
	const subDir = await dirHandle(path);
	let r= new Array<FSMediaItem>();
	for await (let [name, _handle] of subDir.entries()) {
		let type= _handle.kind=='directory' ? 'dir' : name.replace(/[^]*\.([^\.]*)$/,'$1');  //A: extension
		r.push({
			author: 'you', 
			date: undefined, //A: not available, was deprecated SEE: https://developer.mozilla.org/en-US/docs/Web/API/File/lastModifiedDate
			text: name, //A: so it shows in MediaScroller
			name,
			type,
			blob: () => load([...path, name]),
			_handle,
		})
	}
	return r;
}

//XXX: there isn't a "fileExists()", iterate over all files

/**
 * @return a function to save a File object to a path
 */
export function saveToPathHandler(path: string[]) {
	return (file: File) => save([...path, file.name], file)
}


