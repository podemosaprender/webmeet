import {callMgr} from './services/call'

import { useState } from 'react'

import { PrimeReactProvider } from 'primereact/api';

import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'; //SEE: https://primereact.org/icons/#list

import 'primereact/resources/themes/lara-dark-purple/theme.css'
//OPT: import "primereact/resources/themes/lara-light-cyan/theme.css";


//SEE: https://primereact.org/configuration/
import './App.css'

import { MyInput } from './components/prototyping';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

function App() {
	const [myId, setMyId] = useState('');
	const [peerId, setPeerId] = useState('');
	const [micOn, setMicOn] = useState(false);

	const mySend = ()=> {
		peerId.split(',').forEach(peerId => (callMgr.peers[peerId]=true));
		callMgr.sendToAll(`from ${myId} ${(new Date()).toString()}`);
	}

	const micToggle = ()=>  {
		const newStatus= ! micOn;
		setMicOn( newStatus ); 
		if (newStatus) callMgr.audioOn(); else callMgr.audioOff();
	}

	const isLocalhost= window.location.href.match(/(localhost)|(127\.0\.0\.1)/)!=null;

	return (
		<PrimeReactProvider>
			<p><small>WebMeet</small></p>
			{ isLocalhost 
				? <Message severity="error" text="WARNING: does NOT work if the page is loaded from localhost, use your LAN IP" />
				: null
			}

			<div className="card flex flex-column md:flex-row gap-3">
				<div className="p-inputgroup flex-1">
					<MyInput id="MyId" value={myId} setValue={setMyId} />
					<Button icon="pi pi-user" onClick={() => callMgr.connectAs(myId)} />
				</div>

				<div className="p-inputgroup flex-1">
					<MyInput id="PeerIds" value={peerId} setValue={setPeerId} />
					<Button icon="pi pi-users" onClick={mySend} />
				</div>

				<div className="p-inputgroup flex-1">
					<Button icon="pi pi-microphone" onClick={micToggle} outlined={! micOn}/>
				</div>

			</div>
		</PrimeReactProvider>
	)
}

export default App
