import {callMgr} from './services/call'

import { useState, useCallback, useEffect } from 'react'

import { PrimeReactProvider } from 'primereact/api';

import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'; //SEE: https://primereact.org/icons/#list

import 'primereact/resources/themes/lara-dark-purple/theme.css'
//OPT: import "primereact/resources/themes/lara-light-cyan/theme.css";
import './App.css'

//SEE: https://primereact.org/configuration/

import { Helmet } from 'react-helmet';
import { MyInput } from './components/prototyping';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

function App() {
	const [myId, setMyId] = useState('');
	const [peerId, setPeerId] = useState('');
	const [micOn, setMicOn] = useState(false);
	const [micAudioOn, setMicAudioOn] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [text, setText] = useState('');

	const onUpdate= useCallback( (e: Event) => {
		setIsOpen(callMgr.isOpen);	
		setPeerId(Object.keys(callMgr.peers).join(','));
		if (e.type=='silence') { setMicAudioOn(false) }
		else if (e.type=='sound') { setMicAudioOn(true) }
		else if (e.type=='text') { setText((e as CustomEvent).detail) }
	}, [setMicAudioOn, setIsOpen, setPeerId, setText]);

	useEffect( () => {
		callMgr.events.forEach(n => callMgr.addEventListener(n, onUpdate));
		return () => { callMgr.events.forEach(n => callMgr.removeEventListener(n,onUpdate)); }
	});

	const mySend = ()=> {
		peerId.split(',').forEach(peerId => (callMgr.peers[peerId]=true));
		callMgr.sendToAll({t:'text', text: `from ${myId} ${(new Date()).toString()}`});
	}

	const micToggle = ()=>  {
		const newStatus= ! micOn;
		setMicOn( newStatus ); 
		if (newStatus) callMgr.audioOn(); else callMgr.audioOff();
	}

	const isLocalhost= window.location.href.match(/(localhost)|(127\.0\.0\.1)/)!=null;

	return (
		<PrimeReactProvider>
			<Helmet>
				<title>WebMeet</title>
			</Helmet>
			<p><small>WebMeet</small></p>
			{ isLocalhost 
				? <Message severity="error" text="WARNING: does NOT work if the page is loaded from localhost, use your LAN IP" />
				: null
			}

			<div className="card flex flex-column md:flex-row gap-3">
				<div className="p-inputgroup flex-1">
					<MyInput id="MyId" value={myId} setValue={setMyId} />
					<Button icon="pi pi-user" onClick={() => callMgr.connectAs(myId)} outlined={ isOpen }/>
				</div>

				<div className="p-inputgroup flex-1">
					<MyInput id="PeerIds" value={peerId} setValue={setPeerId} />
					<Button icon="pi pi-users" onClick={mySend} />
				</div>

				<div className="p-inputgroup flex-1">
					<Button icon="pi pi-microphone" 
						onClick={micToggle} 
						outlined={! micOn} 
						badge={ micAudioOn ? '*' : '.' }
					/>
					<Button icon="pi pi-sort-alt" 
						onClick={() => callMgr.ping(Object.keys(callMgr.peers)[0])} 
					/>
				</div>

			</div>
			<div className="card">
				{text}
			</div>
		</PrimeReactProvider>
	)
}

export default App
