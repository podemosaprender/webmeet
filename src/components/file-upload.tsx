/** INFO: upload files to OriginPrivateFileStorage or Peers
 * SEE: https://primereact.org/fileupload/#advanced
*/

import { save, load, entries } from '../services/storage/browser-opfs';
import { UploadedItem } from '../types/content';

import { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { FileUpload as PrimeFileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';

//DBG: window.xf= { load, save, entries, remove }

/**
 * @return a function to save a File object to a path
 */
export function saveToPathHandler(path: string[]) {
	return (file: File) => save([path, file.name], file)
}

/**
 * a FileUpload component
 */
export interface FileUploadProps {
	onFileUploaded: (f: File) => Promise<any>
}

export function FileUpload(props: FileUploadProps) {
	const fileUploadCtl= useRef<PrimeFileUpload>(null);

	const customUploader = async (event: FileUploadHandlerEvent) => {
		await Promise.all( event.files.map(props.onFileUploaded) );
		fileUploadCtl.current?.clear();
	};

	return (
			<PrimeFileUpload ref={fileUploadCtl}
				accept="*" 
				multiple maxFileSize={100000000} 
				customUpload uploadHandler={customUploader} 
				emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>}
			/>
	);
}

export function MyFileUpload() {
	const curPath= ['x1'];

	const [uploadedItems, setUploadedItems]= useState(new Array<UploadedItem>());

	useEffect( () => {
		entries(curPath).then( es => {
			setUploadedItems( es.map( e=>	({
				name: e.name, 
				type: e.name.replace(/[^]*\.([^\.]*)$/,'$1'),  //A: extension
				blob: () => load([...curPath, e.name]),
			})) );
		});
	});

//DBG:	window.xm= uploadedItems;
	/*
	*/
	return (<>

		<div className="card flex justify-content-center">
			XXX:FileUpload
		</div>
		
		<div className="card flex justify-content-center">
			<ul>{ uploadedItems.map( (item,idx) => (
				<li key={idx}>{item.name}<Button icon="pi pi-play" onClick={() => setShowInPlayer(item)}/></li>
			)) }
			</ul>
		</div>
	</>)
}

