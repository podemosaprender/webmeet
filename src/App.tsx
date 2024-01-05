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
	const [error, setError] = useState('');

	const [micOn, setMicOn] = useState(false);
	const [micAudioOn, setMicAudioOn] = useState(false);
	const [micWantsDetector, setMicWantsDetector] = useState(false);

	const [isOpen, setIsOpen] = useState(false);
	const [text, setText] = useState(new Array());
	const [msg, setMsg] = useState('');

	const addText= (m: any) => {
		let t2= [
			...(text.slice(Math.max(0, text.length-5))),
			`${m.id}: ${m.text}`	
		]
		setText(t2)	
	}

	const onUpdate= useCallback( (e: Event) => {
		setIsOpen(callMgr.isOpen);	
		setPeerId(Object.keys(callMgr.peers).join(','));
		if (e.type=='silence') { setMicAudioOn(false) }
		else if (e.type=='sound') { setMicAudioOn(true) }
		else if (e.type=='text') { addText( (e as CustomEvent).detail ); }
		else if (e.type=='error') { const d=(e as CustomEvent).detail; setError(`${d.id}: ${d.msg}`) }
	}, [setMicAudioOn, setIsOpen, setPeerId, setText, text]);

	useEffect( () => {
		callMgr.events.forEach(n => callMgr.addEventListener(n, onUpdate));
		return () => { callMgr.events.forEach(n => callMgr.removeEventListener(n,onUpdate)); }
	});

	const myConnect = () => {
		let v= myId.trim(); setMyId(v);
		if (v!='') {
			callMgr.connectAs(v);
			setError('');
		} else {
			setError('Please write your id');
		}
	}

	const mySend = (txt: any)=> {
		txt= typeof(txt)=='string' ? txt.trim() : `from ${myId} ${(new Date()).toString()}`
		peerId.split(',').forEach(peerId => (callMgr.peers[peerId]=true));
		callMgr.sendToAll({t:'text', text: txt });
		addText({id: myId, text: msg});
		setError('');
		setMsg('');
	}

	const micToggle = ()=>  {
		const newStatus= ! micOn;
		setMicOn( newStatus ); 
		if (newStatus) callMgr.audioOn(micWantsDetector); else callMgr.audioOff();
		setError('');
	}

	const micToggleDetector = ()=>  {
		if (! micOn ) {
			setMicWantsDetector( ! micWantsDetector );
		}
		setError('');
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
					<Button icon="pi pi-user" onClick={myConnect} outlined={ isOpen }/>
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
					<Button 
						onClick={micToggleDetector} 
						label={micWantsDetector ? "auto" : "ptt"}
						outlined={! setMicWantsDetector }
					/>
					<Button icon="pi pi-sort-alt" 
						onClick={() => callMgr.ping(Object.keys(callMgr.peers)[0])} 
					/>
				</div>

			</div>

			<div className="card flex flex-column md:flex-row gap-3">
				<div className="p-inputgroup flex-1">
					<MyInput id="msg" value={msg} setValue={setMsg}/>
					<Button icon="pi pi-caret-right" onClick={() => mySend(msg)} />
				</div>
			</div>

			<div className="card">
				{ error!=''
					? <Message severity="error" text={error} />
					: null
				}
			</div>
			<div className="card">
				{text.map((t,i) => <p key={i}>{t}</p>)}
			</div>
		</PrimeReactProvider>
	)
}

export default App
