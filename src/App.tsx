import { MediaItem } from './types/content'
import { callMgr } from './services/call'

import { useState, useCallback, useEffect } from 'react'

import { PrimeReactProvider } from 'primereact/api';

import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'; //SEE: https://primereact.org/icons/#list

import 'primereact/resources/themes/lara-dark-purple/theme.css'
//OPT: import "primereact/resources/themes/lara-light-cyan/theme.css";
import './App.css'

//SEE: https://primereact.org/configuration/

import { BottomControls } from './components/bottom-controls';

import { SettingsView } from './pages/settings-view';
import { RoomView } from './pages/room-view';
import { AssetsView } from './pages/assets-view';
import { BoardView } from './pages/board-view';

import { Helmet } from 'react-helmet';
import { Message } from 'primereact/message';

//XXX: for mic control position SEE: https://primereact.org/dock/

function App() {
	const [view, setView]= useState('');

	const [myId, setMyId] = useState('');
	const [peerId, setPeerId] = useState('');
	const [error, setError] = useState('');

	const [micOn, setMicOn] = useState(false);
	const [micAudioOn, setMicAudioOn] = useState(false);
	const [micWantsDetector, setMicWantsDetector] = useState(false);

	const [isOpen, setIsOpen] = useState(false);
	const [items, setItems] = useState(new Array<MediaItem>());
	const [msg, setMsg] = useState('');

	//XXX: is this the best way to share props with views? use a context although it overlaps with CallMgr?
	const WebMeetProps= {
		myId, setMyId,
		peerId, setPeerId,
		error, setError,

		micOn, setMicOn,
		micAudioOn, setMicAudioOn,
		micWantsDetector, setMicWantsDetector,

		isOpen, setIsOpen,
		items, setItems,
		msg, setMsg,

		addItem: (m: any) => {
			const t2= [
				...(items.slice(Math.max(0, items.length-500))),
				{author: m.id, date: new Date(), text: m.text} as MediaItem
			]
			setItems(t2)	
		},

		myConnect:  () => {
			const v= myId.trim(); setMyId(v);
			if (v!='') {
				callMgr.connectAs(v);
				setError('');
			} else {
				setError('Please write your id');
			}
		},

		mySend:  (txt: any)=> {
			txt= typeof(txt)=='string' ? txt.trim() : `from ${myId} ${(new Date()).toString()}`
			callMgr.routes = [];
			peerId.trim().split(',').forEach(pids => {
				callMgr.routes.push(pids.trim().split('>').map(x => x.trim()));
			});
			callMgr.sendToAll({t:'text', text: txt });
			WebMeetProps.addItem({id: myId, text: msg});
			setError('');
			setMsg('');
		},

		micToggle:  ()=>  {
			const newStatus= ! micOn;
			setMicOn( newStatus ); 
			if (newStatus) callMgr.audioOn(micWantsDetector); else callMgr.audioOff();
			setError('');
		},

		micToggleDetector:  ()=>  {
			if (! micOn ) {
				setMicWantsDetector( ! micWantsDetector );
			}
			setError('');
		},

		ping:  () => callMgr.pingAll(),

		isLocalhost:  window.location.href.match(/(localhost)|(127\.0\.0\.1)/)!=null,
	}

	const onUpdate= useCallback( (e: Event) => {
		WebMeetProps.setIsOpen(callMgr.isOpen);	

		WebMeetProps.setPeerId(callMgr.routes.map(route => route.join('>')).join(','));
		if (e.type=='silence') { WebMeetProps.setMicAudioOn(false) }
		else if (e.type=='sound') { WebMeetProps.setMicAudioOn(true) }
		else if (e.type=='text') { WebMeetProps.addItem( (e as CustomEvent).detail ); }
		else if (e.type=='error') { const d=(e as CustomEvent).detail; WebMeetProps.setError(`${d.id}: ${d.msg}`) }
	}, [setMicAudioOn, setIsOpen, setPeerId, setItems, items]);

	useEffect( () => {
		callMgr.events.forEach(n => callMgr.addEventListener(n, onUpdate));
		return () => { callMgr.events.forEach(n => callMgr.removeEventListener(n,onUpdate)); }
	});

	useEffect( () => {
		if (view=='' && callMgr.isOpen) { //A: after first login
			setView('room');
		}
	}, [myId, callMgr.isOpen]);

	const onCommand= (cmd: string) => {
		if (cmd=='mic') { WebMeetProps.micToggle() }
		else { setView(cmd) }
	}

	const roomElements = {
		defaultView: <SettingsView {...WebMeetProps} />,
		unknownView: <p>Unknown view {view}</p>,
		views: [
			{name:'settings', src:<SettingsView {...WebMeetProps} />},
			{name:'room', src: <RoomView {...WebMeetProps} />},
			{name:'files', src: <AssetsView />},
			{name:'board', src:<BoardView />}
		]
	};

	return (
		<PrimeReactProvider>
			<Helmet>
				<title>WebMeet</title>
			</Helmet>
			<div className="dock-window">
				<BottomControls 
					onCommand={ onCommand } 
					callAudioEnabled={ callMgr.isOpen }
					callAudioRecording={ WebMeetProps.micOn }
				/>

				<p><small>WebMeet {view} as {myId}</small></p>

				{ WebMeetProps.isLocalhost 
					? <Message severity="error" text="WARNING: does NOT work if the page is loaded from localhost, use your LAN IP" />
					: null
				}

				<div className="card">
					{ WebMeetProps.error!=''
						? <Message severity="error" text={WebMeetProps.error} />
						: null
					}
				</div>

				{ 
					!callMgr.isOpen || view=='' || myId=='' ? roomElements.defaultView : 
					roomElements.views.some( v => v.name == view) ? roomElements.views.find( v => v.name == view)?.src :
					roomElements.unknownView
				}

			</div>
		</PrimeReactProvider>
	)
}

export default App
