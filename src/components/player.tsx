/**
 * Play any media item
 *
 * @module
 */

import { useState, useEffect, useCallback } from 'react';

import { UploadedItem } from '../types/content';

import { Dialog } from 'primereact/dialog';
import { Image } from 'primereact/image';
import { Button } from 'primereact/button';

type PlayFn= () => Promise<any>;

let PlayQueue= new Array<PlayFn>();
let _queueIsPlaying= false;

async function PlayQueueAdd(playFn: PlayFn) { //XXX:move to module, coordinate queue jumping, stopping, etc.
	//XXX: move elsewhere try {save(['x1',(new Date()).toJSON()+'.mp3'], new Blob(chunks));} catch(ex) { console.log("AUDIO SAVE",ex) } //XXX: handle errors!
	
	PlayQueue.push(playFn);
	console.log("PlayQueue add", PlayQueue.length, _queueIsPlaying);
	if (_queueIsPlaying) return; 

	_queueIsPlaying= true;
	console.log("PlayQueue poll", PlayQueue.length, _queueIsPlaying);
	let nextFn;
	while (nextFn= PlayQueue.shift()) {
		console.log("PlayQueue next", PlayQueue.length, _queueIsPlaying);
		await nextFn() //A: do not start before previous finishes
	} 
	_queueIsPlaying= false;

	console.log("PlayQueue done", PlayQueue.length, _queueIsPlaying);
}

export function isImage(item: UploadedItem) { 
	return item.type.startsWith('image/') || ['png','jpg','svg'].indexOf(item.type)>-1 
}

export function isAudio(item: UploadedItem) { 
	return ['mp3','ogg','audio'].indexOf(item.type)>-1 
}

export function canPlayInline(item: UploadedItem) {
	return isImage(item) || isAudio(item);
}

export function Player({item}: {item: UploadedItem}) {
	const [url, setUrl]= useState('');
	useEffect( () => {
		item.blob().then(u => setUrl(URL.createObjectURL(u)))
	},[item]);

	const onAudioRef= useCallback( (audioEl: HTMLMediaElement | null) => {
		if (audioEl) {
			console.log("PlayQueue item", item.name);
			const el= audioEl as HTMLMediaElement;

			PlayQueueAdd(() => {
				const r= new Promise((onOk,_) => { 
					const h= (e:Event) => { console.log("PlayQueue item end", item.name,e.type); onOk(null) };
					el.addEventListener('ended', h);
					el.addEventListener('error', h); //A: only to know it finished
				})
				el.onplaying= () => console.log("PlayQueue item play", item.name);
				el.play();
				return r;
			});
		}
	},[]);

	return (<>
		{
			url=='' ? <Button loading />
			: (
			isImage(item) ? ( //XXX: isImage(...) o "playerFor(...)"
			 	<Image src={url} preview downloadable
					alt={item.name}
			 		imageStyle={{maxHeight: '10vh'}}
				/> 
			 ) :
			 isAudio(item) ? (
				 <audio ref={onAudioRef} controls> 
					 <source src={url} type="audio/mp3" />
				 </audio>
			 ) :
			 `??? ${item.type}`
			)
		}
	</>)
}

export function PlayerDialog({item, onClose}: {item: UploadedItem, onClose: () => void}) {
	return (
		<Dialog header={item.name} visible={item!=null} onHide={onClose}>
			<Player item={item} />
	 	</Dialog>
	)
}


