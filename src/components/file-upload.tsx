/** INFO: upload files to OriginPrivateFileStorage or Peers
 * SEE: https://primereact.org/fileupload/#advanced
*/

import { save, load, entries } from '../services/storage/browser-opfs';

import { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Dialog } from 'primereact/dialog';
import { Image } from 'primereact/image';

interface UploadedItem {
	name: string,
	type: string,
	url?: () => Promise<string>,
	blob: () => Promise<Blob>
}

//DBG: window.xf= { load, save, entries, remove }

function Player({item, onClose}: {item: UploadedItem, onClose: () => void}) {
	const [url, setUrl]= useState('');
	useEffect( () => {
		item.blob().then(u => setUrl(URL.createObjectURL(u)))
	},[item]);

	return (
		<Dialog header={item.name} visible={item!=null} onHide={onClose}>
		{
			url=='' ? <Button loading />
			: (
			 item.type=='png' ? ( //XXX: isImage(...) o "playerFor(...)"
					<Image src={url} width="250" preview/> 
			 ) :
			 item.type=='mp3' ? (
				 <audio controls> 
					 <source src={url} type="audio/mp3" />
				 </audio>
			 ) :
			 `??? ${item.type}`
			)
		}
	 </Dialog>
	)
}

export function MyFileUpload() {
	const curPath= ['x1'];

	const fileUploadCtl= useRef<FileUpload>(null);
	const [uploadedItems, setUploadedItems]= useState(new Array<UploadedItem>());
	const [showInPlayer, setShowInPlayer]= useState<UploadedItem|null>(null);

	const customUploader = (event: FileUploadHandlerEvent) => {
		Promise.all( event.files.map( (file: File) =>
			save([...curPath, file.name], file)
		));
		fileUploadCtl.current?.clear();
	};

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
		{ showInPlayer!=null
			? <Player item={showInPlayer} onClose={() => setShowInPlayer(null)} />
			: null
		}

		<div className="card flex justify-content-center">
			<FileUpload ref={fileUploadCtl}
				accept="*" 
				multiple maxFileSize={100000000} 
				customUpload uploadHandler={customUploader} 
				emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>}
			/>
		</div>
		
		<div className="card flex justify-content-center">
			<ul>{ uploadedItems.map( (item,idx) => (
				<li key={idx}>{item.name}<Button icon="pi pi-play" onClick={() => setShowInPlayer(item)}/></li>
			)) }
			</ul>
		</div>
	</>)
}

