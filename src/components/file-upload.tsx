/** INFO: upload files to OriginPrivateFileStorage or Peers
 * SEE: https://primereact.org/fileupload/#advanced
*/

import { save, entries } from '../services/storage/browser-opfs';
import { UploadedItem } from '../types/content';

import { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { FileUpload as PrimeFileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';

//DBG: window.xf= { load, save, entries, remove }

/**
 * a FileUpload component
 */
export interface FileUploadProps {
	onFileUploaded: (f: File) => Promise<any>,
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

/** a FileUploadDialog
*/
export interface FileUploadDialogProps extends FileUploadProps {
	header?: string,
	visible: boolean,
	onClose: () => void,
}

export function FileUploadDialog(props: FileUploadDialogProps) {
	return (
		<Dialog header={props.header || 'Upload'} visible={props.visible} onHide={props.onClose}>
			<FileUpload onFileUploaded={props.onFileUploaded} />
		</Dialog>
	)
}
