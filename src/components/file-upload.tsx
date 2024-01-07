/** INFO: upload files to OriginPrivateFileStorage or Peers
 * SEE: https://primereact.org/fileupload/#advanced
*/
import { useState, useRef } from 'react';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Image } from 'primereact/image';

export function MyFileUpload() {
	const fileUploadCtl= useRef(null);
	const [uploadedItems, setUploadedItems]= useState(new Array<Blob>());

	const customUploader = (event: FileUploadHandlerEvent) => {
		setUploadedItems([
			...uploadedItems, 
			...event.files.map( (file: File) =>(
					{name: file.name, type: file.type, url: URL.createObjectURL(file) }
			))
		]); 
		fileUploadCtl.current?.clear();
	};

	return (<>
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
				<li key={idx}>{item.name}<br />{
					item.type.startsWith('image/') ? (
						<Image src={item.url || URL.createObjectURL(item.blob)} width="250" preview/> 
					) :
					item.type.startsWith('audio') ? (
						<audio controls="controls"> 
							<source src={item.url || URL.createObjectURL(item.blob)} type="audio/mp3" />
						</audio>
					) :
					`??? ${item.blob.type}`
				}</li>
			)) }
			</ul>
		</div>
	</>)
}

