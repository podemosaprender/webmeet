/** INFO: Controls at the bottom of the screen
 * SEE: https://primereact.org/dock/
 */

import { Dock } from 'primereact/dock';
import { MenuItem } from 'primereact/menuitem';

interface BottomControlProps {
	onCommand: (cmd: string) => void,
	callAudioEnabled: boolean,
	callAudioRecording: boolean,
}

export function BottomControls({onCommand, callAudioEnabled, callAudioRecording} : BottomControlProps) {
	const items: MenuItem[] = [
		{
			label: 'Settings',
			icon: () => <i className="pi pi-cog text-3xl"></i>,
			command: () => (onCommand('settings')),
		},
		{
			label: 'Files',
			icon: () => <i className="pi pi-briefcase text-3xl"></i>,
			command: () => (onCommand('files')),
		},
		{
			label: 'Room',
			icon: () => <i className="pi pi-comments text-3xl"></i>,
			command: () => (onCommand('room')),
		},
		{
			label: 'Board',
			icon: () => <i className='pi pi-pencil text-3xl'></i>,
			command: () => (onCommand('board')),
		},
	];

	if (callAudioEnabled) {
		items.push(
		{
			label: 'Mic',
			icon: () => <i className={"pi pi-microphone text-3xl"+(callAudioRecording ? " bg-primary border-round-md" : "")}></i>,
			command: () => (onCommand('mic')),
		}
		);
	}
	return (
		<div className="card">
			<Dock model={items} 
				position="bottom" magnification={false} className="fixed"
				pt={{
					menu: { class: 'p-dock-list p-1'},
					menuitem: {class: 'p-0'},
					action: {class: 'p-2'},
				}}
			/>
		</div>
	)
}

