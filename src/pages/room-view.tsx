/** The View where chat and voice happens
*/

import { useState } from 'react';

import { MediaItem } from '../types/content';

import { MediaScroller } from '../components/media-scroller';
import { FileUploadDialog } from '../components/file-upload';
import { VideoAndScreenCaptureDialog } from '../components/video-and-screen-capture';

import { MyInput } from '../components/prototyping';
import { Button } from 'primereact/button';

interface RoomViewProps {
	peerId: string, setPeerId: (id: string) => void,
	micToggle: () => void,
	micToggleDetector: () => void,
	micOn: boolean,
	micAudioOn: boolean,
	micWantsDetector: boolean, setMicWantsDetector: (v: boolean) => void,
	mySend: (txt: any) => void,
	ping: () => void,
	msg: string, setMsg: (v: string) => void,
	items: MediaItem[], setItems: (t: MediaItem[]) => void,
}

export function RoomView(props: RoomViewProps) {
	const [wantsUpload, setWantsUpload]= useState(false);
	const [wantsCapture, setWantsCapture]= useState(false);

	return (<>
		<FileUploadDialog 
			header={'Upload to peers'}
			onFileUploaded={async (f: File) => {props.mySend(f); return true}}
			visible={wantsUpload} onClose={() => {setWantsUpload(false)}}
		/>
		<VideoAndScreenCaptureDialog 
			onCaptured={async (b: Blob) => {props.mySend(b); return true}}
			visible={wantsCapture} onClose={() => {setWantsCapture(false)}}
			wantsAutoRefresh={true}
		/>

		<div className="flex flex-column gap-2" style={{height: '80vh'}}>
			<div className="card flex flex-column sm:flex-row gap-3 flex-none">
				<div className="p-inputgroup flex-auto">
					<MyInput id="PeerIds" value={props.peerId} setValue={props.setPeerId} />
					<Button icon="pi pi-users" onClick={props.mySend} />
				</div>

				<div className="p-inputgroup flex-1">
					<Button icon="pi pi-microphone"
						onClick={props.micToggle} 
						outlined={! props.micOn} 
						badge={ props.micAudioOn ? '*' : '.' }
					/>
					<Button 
						onClick={props.micToggleDetector} 
						label={props.micWantsDetector ? "auto" : "ptt"}
						outlined={! props.setMicWantsDetector }
					/>
					<Button icon="pi pi-sort-alt" 
						onClick={props.ping} 
					/>
				</div>

			</div>

			<div className="card flex-column flex-1">
				<MediaScroller items={props.items}/>
			</div>

			<div className="card flex flex-column md:flex-row gap-3 flex-none">
				<div className="p-inputgroup flex-1">
					<MyInput id="msg" value={props.msg} setValue={props.setMsg} onEnter={() => props.mySend(props.msg)}/>
					<Button className="m-0" aria-label="send text" icon="pi pi-caret-right" onClick={() => props.mySend(props.msg)} />
					<Button className="m-0" aria-label="upload" icon="pi pi-upload" onClick={() => setWantsUpload(true)} />
					<Button className="m-0" aria-label="screen capture" icon="pi pi-external-link" onClick={() => setWantsCapture(true)} />
				</div>
			</div>
		</div>
	</>)
}


