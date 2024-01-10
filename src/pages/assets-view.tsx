/** The View where you prepare files for presentations, sound effects, etc
*/

import { useState, useEffect } from 'react';
import { MediaItem } from '../types/content';
import { entries, remove, saveToPathHandler, FSMediaItem } from '../services/storage/browser-opfs';

import { MediaScroller } from '../components/media-scroller';
import { FileUploadDialog } from '../components/file-upload';

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

export function AssetsView() {
	const [path, setPath]= useState(new Array<string>())
	
	const [wantsUpload, setWantsUpload]= useState(false);
	const [uploadedItems, setUploadedItems]= useState(new Array<FSMediaItem>());

	const [newFolderName, setNewFolderName]= useState('');
	const [wantsNewFolder, setWantsNewFolder]= useState(false);

	const updateItems= () => {
		entries(path)
			.then(es => setUploadedItems( es ))
			.catch(_ => setUploadedItems([]))
	};

	const onNewFolder= () => {
		let n= newFolderName.trim();
		if (n!='') { 
			setPath([...path, n]) 
			setWantsNewFolder(false);
			setNewFolderName('');
		}
	}

	useEffect( updateItems, [path]);

	return (<>
		<Dialog visible={wantsNewFolder} onHide={() => setWantsNewFolder(false)}>
			<div>
				<span className="p-float-label">
					<InputText id="newFolderName" 
						value={newFolderName} 
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFolderName(e.target.value)} 
					/>
					<label htmlFor="newFolderName">new folder name</label>
				</span>
			</div>
			<div className="text-center">
				<Button label="Ok" icon="pi pi-check" severity="success" onClick={onNewFolder} />
			</div>
		</Dialog>	

		<FileUploadDialog 
			header={'Upload to '+path.join('/')}
			onFileUploaded={saveToPathHandler(path) } 
			visible={wantsUpload} onClose={() => {setWantsUpload(false); updateItems()}}
		/>

		<div className="card">
			{path.join('/')}
		</div>	

		<div className="card" style={{height: '60vh'}}>
			<MediaScroller 
				items={uploadedItems} 
				commands={{
					remove: 'pi-trash',
				}}
				onCommand={async (cmd: string, item: MediaItem) => {
					if (cmd=='remove') { await remove([...path, item.name]); updateItems(); } //XXX: ask before?
					else if (cmd=='cd') { setPath([...path, item.name]) }
				}}
			/>
		</div>

		<div className="card text-right">
			<Button className="m-1" arialabel="on folder up" icon="pi pi-arrow-up-left" onClick={()=> setPath(path.slice(0,-1))} />
			<Button className="m-1" arialabel="new folder" icon="pi pi-folder" onClick={() => setWantsNewFolder(true)} />
			<Button className="m-1" arialabel="upload" icon="pi pi-upload" onClick={() => setWantsUpload(true)} />
		</div>
	</>)
}


