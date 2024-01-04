import { useState } from 'react'

import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-dark-purple/theme.css'
//OPT: import "primereact/resources/themes/lara-light-cyan/theme.css";

//SEE: https://primereact.org/configuration/
import './App.css'

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

import * as Peer from './services/transport/peer'; //XXX: import ONLY needed functions
import * as IOAudio from './services/io/audio'; //XXX: import ONLY needed functions

//SEE: https://react.dev/learn/typescript#typescript-with-react-components
type SetValueFn = (v: string) => void;
interface MyInputProps {id: string, value: string, setValue: SetValueFn}
function MyInput({id, value, setValue}: MyInputProps) {
	return (
		<span className="p-float-label">
			<InputText id={id} value={value} onChange={(e) => setValue(String(e.target.value))} />
			<label htmlFor={id}>{id}</label>
		</span>
	)
}

function App() {
	const [myId, setMyId] = useState('');
	const [peerId, setPeerId] = useState('');
	const mySend = ()=> Peer.send(`from ${myId} ${(new Date()).toString()}`, peerId);
	const audioOn = async ()=> {
		const r= await IOAudio.emitterStart();
		console.log("audioOn",r);
	}

	return (
		<PrimeReactProvider>
			<h1>WebMeet</h1>
			<p> WARNING: does NOT work if the page is loaded from localhost, use your LAN IP</p>
			<p> Edit <code>src/App.tsx</code> and save to test HMR </p>
			<div className="card flex justify-content-center">
				<MyInput id="MyId" value={myId} setValue={setMyId} />
				<Button label="Connect" onClick={() => Peer.open(myId)} />
			</div>
			<div className="card flex justify-content-center">
				<MyInput id="PeerId" value={peerId} setValue={setPeerId} />
				<Button label="Send" onClick={mySend} />
			</div>
			<div className="card flex justify-content-center">
				<Button label="Start Audio" onClick={audioOn} />
			</div>
		</PrimeReactProvider>
	)
}

export default App
