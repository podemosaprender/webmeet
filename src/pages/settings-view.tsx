/** The View where your user is chosen
*/

import { WebMeetTerminal } from '../components/terminal';
import { MyInput } from '../components/prototyping';
import { Button } from 'primereact/button';
//XXX: for terminal component SEE: https://primereact.org/terminal/

interface SettingsViewProps {
	myId: string,
	setMyId: (id: string) => void,
	myConnect: () => void,
	isOpen: boolean,
}

export function SettingsView(props: SettingsViewProps) {
	return (<>
		<div className="card flex flex-column md:flex-row gap-3">
				<div className="p-inputgroup flex-1">
					<MyInput id="MyId" value={props.myId} setValue={props.setMyId} />
					<Button icon="pi pi-user" onClick={props.myConnect} outlined={ props.isOpen }/>
				</div>
		</div>
		<div className="card">
				<WebMeetTerminal />
		</div>
	</>)	
}


