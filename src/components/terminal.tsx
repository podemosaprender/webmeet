/** a terminal for fast prototyping, field tests, etc.
 * SEE: https://primereact.org/terminal/
 * XXX: implement!
 */
import { handleCommand } from '../services/terminal';

import * as IOScreen from '../services/io/screen/index'; //XXX: import ONLY needed functions, must be AFTER Commands is declared
window.DBG._.IOScreen= IOScreen

import { useEffect } from 'react'

import { Terminal } from 'primereact/terminal';
import { TerminalService } from 'primereact/terminalservice';

export function WebMeetTerminal() {
	const commandHandler= async (text: string) => {
		const response=  await handleCommand(text)
		if (response) { TerminalService.emit('response', response); 
		} else { TerminalService.emit('clear'); }
	};

	useEffect(() => {
		TerminalService.on('command', commandHandler);
		return () => {
			TerminalService.off('command', commandHandler);
		};
	}, []);

	return (
		<div className="card">
			<p>
				Enter "<strong>help</strong>", "<strong>see</strong>" or "<strong>clear</strong>"
			</p>
			<Terminal
				welcomeMessage="WebMeet super powers!"
				prompt=">"
				pt={{
					root: {className: 'h-11rem bg-gray-900 text-white border-2 border-round border-900'},
					prompt: {className: 'text-gray-400 mr-2'},
					command: {className: 'text-primary-300'},
					response: {className: 'text-primary-300'}
				}}
			/>
		</div>
	);
}

