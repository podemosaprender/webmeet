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
	mySend: () => void,
	ping: () => void,
	msg: any[], setMsg: (v: any[]) => void,
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
		window.xf= scrollerRef.current;
		setTimeout( () => { //A: after the list was redrawn //XXX: don't scroll if the user scrolled manually
			xf.scrollTo({top: 99999999}) //XXX: why the other methods fail?
		},100 );
	},[text]);

	return (
		<div className="card">
			<VirtualScroller ref={scrollerRef}
				items={text} 
				itemTemplate={itemTemplate} 
				inline 
				itemSize="50"
				scrollHeight="300px" 
			/>
		</div>
	)
}

export function RoomView(props: RoomViewProps) {
	return (<>
		<div className="card flex flex-column md:flex-row gap-3">
			<div className="p-inputgroup flex-1">
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

		<div className="card flex flex-column md:flex-row gap-3">
			<div className="p-inputgroup flex-1">
				<MyInput id="msg" value={props.msg} setValue={props.setMsg}/>
				<Button icon="pi pi-caret-right" onClick={() => props.mySend(props.msg)} />
			</div>
		</div>

		<ChatScroller text={props.text} />
	</>)
}


