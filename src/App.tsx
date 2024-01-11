/**
 * Main component/vieport
 *
 * @remark
 * Other views are controlled through useState (no router)
 *
 * @module
 */

import { MediaItem } from './types/content'
import { Message, MediaItemData } from './types/transport'
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
import { Message as PrimeMessage } from 'primereact/message';

//XXX: for mic control position SEE: https://primereact.org/dock/

/**
 * @component
 */
export default function App() {
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

		addItem: useCallback( (it: MediaItem) => {
			const t2= [
				...(items.slice(Math.max(0, items.length-500))),
				it	
			]
			setItems(t2)	
		}, [items]),

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

			peerId.trim().split(',').forEach(pids => { //XXX:toLIB
				callMgr.routes.push(pids.trim().split('>').map(x => x.trim()));
			});


			const date= new Date();
			const it: MediaItem= {
				type: 'text',
				text: msg,
				author: myId, date,
				name: myId+'__'+date.toJSON(),
				blob: async () => (new Blob([msg]))
			};

			const tmsg= new Message(); //XXX:send just MediaItem instead, move to CallMgr {
			tmsg.topics=['meet']; //XXX: add e.g. name of this meeting
			tmsg.source= myId;
			tmsg.type= 'item';
			tmsg.payload= { //XXX: extract from MediaItem
				type: 'text',
				author: myId, date,
				name: myId+'__'+date.toJSON(),
				blob: msg
			} as MediaItemData;
			callMgr.sendToAll(tmsg); 
			//XXX: move to CallMgr }

			WebMeetProps.addItem(it);
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

	const onUpdate= useCallback( () => {
		WebMeetProps.setIsOpen(callMgr.isOpen);	
		WebMeetProps.setPeerId(callMgr.routes.map(route => route.join('>')).join(','));
	}, [setIsOpen, setPeerId]);

	useEffect( () => {
		callMgr.on('item', WebMeetProps.addItem );
		return () => { callMgr.off('item', WebMeetProps.addItem) }
	}, [WebMeetProps.addItem] )

	useEffect( () => {
		const hOn= () => {WebMeetProps.setMicAudioOn(false)}
		const hOff= () => {WebMeetProps.setMicAudioOn(true)}
		callMgr.on('silence', hOn),
		callMgr.on('sound', hOff)
		return () => {
			callMgr.off('silence', hOn),
			callMgr.off('sound', hOff)
		}
	}, [WebMeetProps.setMicAudioOn] )

	useEffect( () => {
		const hError= (msg: Message) => { WebMeetProps.setError(`${msg.source}: ${msg.payload}`); onUpdate(); }
		callMgr.on('error', hError); 
		callMgr.on('open', onUpdate);
		callMgr.on('peer', onUpdate);
		return () => { 
			callMgr.off('error', hError); 
			callMgr.off('open', onUpdate);
			callMgr.off('peer', onUpdate);
		}
	},[onUpdate]); 

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
					? <PrimeMessage severity="error" text="WARNING: does NOT work if the page is loaded from localhost, use your LAN IP" />
					: null
				}

				<div className="card">
					{ WebMeetProps.error!=''
						? <PrimeMessage severity="error" text={WebMeetProps.error} />
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

