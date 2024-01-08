/** Store files in the browser's OriginPrivateFileSystem
 * XXX: upgrade to API interface for other storage types
 * SEE: https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream/write
 */

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
	const subDir = await dirHandle(dirs, true);
	const newFile   = await subDir.getFileHandle( fname , { "create" : true });
	const wtr = await newFile.createWritable();
	try { await wtr.write( blob ); }
	finally { await wtr.close(); }
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
	return await subDir.removeEntry( fname );
}

export enum DirEntryType { file= "file", dir= "dir"}
export interface DirEntry {
	name: string,
	type: DirEntryType,
	_handle?: any,
}

export async function entries( path: string[] ): Promise<DirEntry[]> { 
	const subDir = await dirHandle(path);
	let r= new Array<DirEntry>();
	for await (let [name, _handle] of subDir.entries()) {
		r.push({ name, type:  _handle.isFile ? DirEntryType.file : DirEntryType.dir, _handle });
	}
	return r;
}

//XXX: there isn't a "fileExists()", iterate over all files


