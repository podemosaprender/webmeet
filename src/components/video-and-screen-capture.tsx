/** 
 * Capture from camera or screen, open stream if needed
*/

import * as IOScreen from '../services/io/screen/index'; 

import { useState, useEffect, useCallback } from 'react';

import { MyInput } from './prototyping';

import { Image } from 'primereact/image';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';

/**
 * a VideoAndScreenCapture component
 */
export interface VideoAndScreenCaptureProps {
	sourceName: string,
	wantsAutoRefresh: boolean,
	onCaptured: (b: Blob ) => Promise<any>,
}

export function VideoAndScreenCapture(props: VideoAndScreenCaptureProps) {
	const [imageURL, setImageURL]= useState('');
	const [refreshTime, setRefreshTime]= useState(0);

	/**
	 * update images of screen capture every time "refreshTime" is changed
	 * as each image is available (async inside forEach).
	 *
	 * {@link IOScreen} caches the captures limiting the real capture freq to +1 second
	 */
	useEffect( () => {
		(async () => {
			setImageURL(await IOScreen.sourceCapture(props.sourceName))
		})();
	}, [refreshTime]);

	/**
	 * only when the dialog is visible! trigger refresh periodically through setRefreshTime
	 */
	useEffect( () => {
		if (props.wantsAutoRefresh) {
			const timer= setInterval(() => { setRefreshTime(Date.now()) }, 1000);
			return () => { clearInterval(timer); }
		}
	}, [props.wantsAutoRefresh, setRefreshTime]);

	const onCapture= async () => {
		const b= await (await fetch(imageURL)).blob(); //XXX:TOLIB
		props.onCaptured(b);
	}

	return (<div className="flex flex-row" key={props.sourceName}>
		<div className="flex-1">
			<Image src={imageURL} preview downloadable
				alt={props.sourceName}
				imageStyle={{maxHeight: '20vh'}}
			/> 
		</div>
		<div className="flex-initial">
			{props.sourceName}
			<Button aria-label="capture" icon="pi pi-camera" onClick={onCapture}/>
		</div>
	</div>);
}

/** a VideoAndScreenCaptureDialog
*/
export interface VideoAndScreenCaptureDialogProps extends Omit<VideoAndScreenCaptureProps,'sourceName'> {
	header?: string,
	visible: boolean,
	onClose: () => void,
}

export function VideoAndScreenCaptureDialog(props: VideoAndScreenCaptureDialogProps) {
	const [name, setName]= useState('');
	const [sourceNames, setSourceNames]= useState(IOScreen.sources()); //A: to trigger refresh 
	
	const onNewSource= async () => {
		const nameOk=name.trim();
		if (nameOk!='') {
			await IOScreen.sourceGetOrOpen(name);
			setSourceNames(IOScreen.sources());
		}
		setName('') //A: triggers re-render
	}
	//XXX: use emittery on IOScreen, this FAILS e.g. if sources changed elsewhere

	return (
		<Dialog header={props.header || 'Capture'} visible={props.visible} onHide={props.onClose}>
			<div className="flex flex-column">
			{ 
				sourceNames.map( name => (
					<VideoAndScreenCapture 
						wantsAutoRefresh={props.wantsAutoRefresh && props.visible} 
						sourceName={name} 
						onCaptured={props.onCaptured}
					/>
				))
			}
			</div>
			<div>
				<MyInput id="name" value={name} setValue={setName}/>
				<Button aria-label="add screen" icon="pi pi-external-link" onClick={onNewSource}/>
			</div>
		</Dialog>
	)
}
