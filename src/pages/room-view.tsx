/** The View where chat and voice happens
*/

import { useRef, useEffect } from 'react';

import { MyInput } from '../components/prototyping';
import { Button } from 'primereact/button';
import { VirtualScroller, VirtualScrollerTemplateOptions } from 'primereact/virtualscroller';

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
	text: string[], setText: (t: string[]) => void,
}

function ChatScroller({text}: {text: string[]}) {
	const scrollerRef= useRef<VirtualScroller>(null);

	const itemTemplate = (data: string, options: VirtualScrollerTemplateOptions) => {
		return (
			<div className="col-12" style={{ border: '1px solid red', height: options.props.itemSize + 'px' }}>
				{data}
			</div>
		);
	};

	useEffect(() => { 
		setTimeout( () => { //A: after the list was redrawn //XXX: don't scroll if the user scrolled manually
			scrollerRef.current?.scrollTo({top: 99999999, left: 0, behavior: 'smooth'}) //XXX: why the other methods fail?
		},100 );
	},[text]);

	return (
		<div className="card flex-column flex-1">
			<VirtualScroller ref={scrollerRef}
				items={text} 
				itemTemplate={itemTemplate} 
				inline 
				itemSize={50}
				style={{height: '100%'}}
			/>
		</div>
	)
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

		<ChatScroller text={props.text}/>

		<div className="card flex flex-column md:flex-row gap-3 flex-none">
			<div className="p-inputgroup flex-1">
				<MyInput id="msg" value={props.msg} setValue={props.setMsg}/>
				<Button icon="pi pi-caret-right" onClick={() => props.mySend(props.msg)} />
			</div>
		</div>
	</div>)
}


