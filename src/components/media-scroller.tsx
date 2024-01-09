/** a scrollable list of media for all views
 *
 */

import { MediaItem } from '../types/content';
import { Player } from '../components/player';

import { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { VirtualScroller, VirtualScrollerTemplateOptions } from 'primereact/virtualscroller';

export function MediaScroller({items}: {items: string[]}) { //XXX: unify a scrollable list of media for all views
	//XXX: make the player composable e.g. as a parameter {
	const [showInPlayer, setShowInPlayer]= useState<MediaItem|null>(null);
	// }

	const scrollerRef= useRef<VirtualScroller>(null);

	useEffect(() => { 
		setTimeout( () => { //A: after the list was redrawn //XXX: don't scroll if the user scrolled manually
			scrollerRef.current?.scrollTo({top: 99999999, left: 0, behavior: 'smooth'}) //XXX: why the other methods fail?
		},100 );
	},[items]);

	const itemTemplate = (item: MediaItem, options: VirtualScrollerTemplateOptions) => {
		const needsPlayer= item.type!=null; //XXX: length?
		return (
			<div style={{ border: '1px solid red', height: options.props.itemSize + 'px' }}>
				{item.author}: {item.text}
				{ needsPlayer 
					? <Button icon="pi pi-play" onClick={() => setShowInPlayer(item)}/>
					: ''
				}
			</div>
		);
	};

	return (<>
		{ showInPlayer!=null
			? <Player item={showInPlayer} onClose={() => setShowInPlayer(null)} />
			: null
		}
		<VirtualScroller ref={scrollerRef}
			items={items} 
			itemTemplate={itemTemplate} 
			itemSize={50}
			inline 
			style={{height: '100%'}}
		/>
	</>)
}


