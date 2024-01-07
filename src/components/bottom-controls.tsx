/** INFO: Controls at the bottom of the screen
 * SEE: https://primereact.org/dock/
 */

import { Dock } from 'primereact/dock';
import { MenuItem } from 'primereact/menuitem';

interface BottomControlProps {
	onCommand: (cmd: string) => void
}

export function BottomControls({onCommand} : BottomControlProps) {
	const items: MenuItem[] = [
		{
			label: 'Settings',
			icon: () => <i className="pi pi-cog" style={{color: 'var(--primary-color)', fontSize: '2.5rem' }}></i>,
			command: () => (onCommand('settings')),
		},
		{
			label: 'Room',
			icon: () => <i className="pi pi-comments" style={{color: 'var(--primary-color)', fontSize: '2.5rem' }}></i>,
			command: () => (onCommand('room')),
		},
		{
			label: 'Files',
			icon: () => <i className="pi pi-briefcase" style={{color: 'var(--primary-color)', fontSize: '2.5rem' }}></i>,
			command: () => (onCommand('files')),
		},
	];

	return (
		<div className="card">
			<Dock model={items} position="bottom" className="fixed"/>
		</div>
	)
}

