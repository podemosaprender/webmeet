/**
 * Message types for any transport
 *
 * @module
 */


/**
 * each computer is a Node identified by a NodeId
 *
 * can be reached through many transports and connections
 * e.g. WebRTC, websockers, etc.
 */
export type NodeId= string;

/**
 * A Route is a list of connected NodeIds 
 *
 * It's bidirectional so 
 *    * A can send to C through B
 *    * C can answer to A through B
 */
export type Route= NodeId[]

/**
 * Nodes listen to topics, so a message with topic="conference123"
 * is processed by all the nodes forwarding it along a route
 */
export type Topic= string;

/**
 * A message type is required to process it
 * BUT a node may ignore (but forward) an unknown type
 *
 */
export type MessageType= string; 

/**
 *declare some explicit message types, but allow any
 */
export const enum StdMessageTypes {
	Open= 'open',
	Peer= 'peer',
	Error= 'error',
	Unknown= '',
	Hello= 'hello',
	MediaItem= 'item',
	MediaItemPart= 'item-part',
	Draw='draw'
}

/**
 * We send text messages, audio files, etc.
 */
export interface MediaItemData 	{
	type: string 
	name: string
	author: string
	date: Date
	text: string
	data?: Blob
}

/**
 * We may send big files or mic audio in smaller chunks
 */
export interface MediaItemDataPart {
	/**
	 * the MediaItemDataPart has a unique mediaItemDataId
	 * so the receiver can assemble chunks from different MediaItems simultaneously
	 */
	mediaItemDataId: string
	data: Blob
	isLastPart?: boolean
}

/**
 * We send the MediaItemData in the first part
 */
export interface MediaItemDataFirstPart extends Omit<MediaItemData,'data'|'text'>, MediaItemDataPart {
}

/** 
 * A generic transport Message
 */
export class Message {
	/**
	 * A message can request specific routes to be forwarded through
	 *
	 * A Node may use seen routes to compute other routes eg using a Shortest Path algorithm
	 */
	routes: Route[] = []

	/**
	 * A message is related to 1-Many topics
	 */
	topics: Topic[] = []

	/**
	 * A message is originated by a single source
	 */
	source: NodeId = ''

	/**
	 * A message type is required to process it
	 * BUT a node may ignore (but forward) an unknown type
	 */
	type: MessageType = StdMessageTypes.Unknown

	/**
	 * The payload is the reason to send a message!
	 */
	payload: MediaItemData | MediaItemDataPart | MediaItemDataFirstPart | any

	/**
	 * set values from object EXCEPT source, typesafe
	 */
	assign(o: Partial<Message>) {
		Object.assign(this, o);
	}

	constructor(o: Partial<Message>= {}) {
		this.assign(o);
	}
}

