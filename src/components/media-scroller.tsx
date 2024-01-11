/** 
 * A scrollable list of media for all views
 *
 * <uml>
 * Bob -> Alice: Hello
 * </uml>
 *
 * @module
 */

import { MediaItem } from '../types/content';
import { Player, canPlayInline } from '../components/player';

import { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { DataScroller } from 'primereact/datascroller';

export interface MediaScrollerProps {
	items: MediaItem[],
	onCommand?: (cmd: string, item: MediaItem) => void,
	commands?: Record<string,string> //U: commandName -> icon string
}

/**
 * @Category component
 */
export function MediaScroller(props: MediaScrollerProps) { //XXX: unify a scrollable list of media for all views
	//XXX: make the player composable e.g. as a parameter {
	const [showInPlayer, setShowInPlayer]= useState<MediaItem|null>(null);
	// }

	const scrollerRef= useRef<DataScroller>(null);

	useEffect(() => { 
		setTimeout( () => { //A: after the list was redrawn //XXX: don't scroll if the user scrolled manually
			//scrollerRef.current?.scrollTo({top: 99999999, left: 0, behavior: 'smooth'}) //XXX: why the other methods fail?
		},100 );
	},[props.items]);

	const itemTemplate = (item: MediaItem) => {
		const needsPlayer= item.type!=null && item.type!='text'; //XXX: length?
		const playInline= canPlayInline(item);
		const cmdButtons= [];
		for (let cmd in props.commands) { 
			cmdButtons.push(
				 <Button key={cmd} size="small" aria-label={cmd} icon={"pi "+props.commands[cmd]} onClick={() => { if (props.onCommand) { props.onCommand(cmd, item)}}} />
			)
		}

		return (
			<div key={item.text+item.name} className="flex flex-row">
				<div className="flex-1">
					{item.author || 'you'}: {item.text} <br />
					{ playInline ? <Player item={item} /> : null }
				</div>
				<div className="flex-initial">
					{ cmdButtons }
					{ needsPlayer 
						? item.type=='dir' 
							? <Button size="small" aria-label="open dir" icon="pi pi-arrow-down-right" onClick={() => {if (props.onCommand) { props.onCommand('cd',item)}}} />
							: playInline 
								? null
								: <Button size="small" aria-label="play" icon="pi pi-play" onClick={() => setShowInPlayer(item)}/>
						: ''
					}
				</div>
			</div>
		);
	};

	return (<>
		{ showInPlayer!=null
			? <Player item={showInPlayer} />
			: null
		}
		<DataScroller ref={scrollerRef}
			value={props.items} 
			itemTemplate={itemTemplate} 
			inline 
			rows={100}
			pt={{
				root: {style: {height: '100%', overflowY: 'scroll'}}
			}}
		/>
	</>)
}


