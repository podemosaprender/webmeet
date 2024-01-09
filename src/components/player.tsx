import { useState, useEffect } from 'react';

import { UploadedItem } from '../types/content';

import { Dialog } from 'primereact/dialog';
import { Image } from 'primereact/image';
import { Button } from 'primereact/button';

export function Player({item, onClose}: {item: UploadedItem, onClose: () => void}) {
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


