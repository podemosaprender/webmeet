/** The View where chat and voice happens
*/

import { MediaItem } from '../types/content';

import { MediaScroller } from '../components/media-scroller';

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
	return (<div className="flex flex-column gap-2" style={{height: '80vh'}}>
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
				<MyInput id="msg" value={props.msg} setValue={props.setMsg}/>
				<Button icon="pi pi-caret-right" onClick={() => props.mySend(props.msg)} />
			</div>
		</div>
	</div>)
}


