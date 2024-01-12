/** INFO: Controls at the bottom of the screen
 * SEE: https://primereact.org/dock/
 */

import { Dock } from 'primereact/dock';
import { MenuItem } from 'primereact/menuitem';

interface BoardControlProps {
	onCommand: (cmd: string) => void
}

export function BoardControls({onCommand} : BoardControlProps) {
	const items: MenuItem[] = [
		{
			label: 'Cube',
			icon: () => <i className="pi pi-stop text-3xl"></i>,
			command: () => (onCommand('cube')),
		},
		{
			label: 'Circle',
			icon: () => <i className="pi pi-circle text-3xl"></i>,
			command: () => (onCommand('circle')),
		},
		{
			label: 'Line',
			icon: () => <i className="pi pi-minus text-3xl"></i>,
			command: () => (onCommand('line')),
		},
		{
			label: 'Text',
			icon: () => <i className='pi pi-align-justify text-3xl'></i>,
			command: () => (onCommand('text')),
		},
	];

	return (
        <Dock model={items} 
            magnification={false}
            position='left'
            pt={{
                menu: { className: 'p-dock-list p-1'},
                menuitem: {className: 'p-0'},
                action: {className: 'p-2'},
            }}
        />
	)
}