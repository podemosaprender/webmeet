/**

<uml>
autonumber

actor "Alice" as u1

participant "Topics" <<UITab>>
participant "Items" <<UITab>>
participant "TextEditor" <<UIEditor>>
participant "Store"
participant "CallMgr"

actor "Bob" as u2

u1 -> Topics: callNew("What users want?")
group "same for any MediaItem type, item may be new, sent by someone else, etc."
	u1 -> Items: create("text")
	Items -> TextEditor : edit(new)
	u1 -> TextEditor : saveAndSend("What users want?")
	Items <<- TextEditor: onSave(delta, "What users want?")
	Items -> Store: save("msg1267.txt", delta, "What users want?")
	Items -> CallMgr: publishStored("msg1267.txt", "What users want?")
 	CallMgr <- CallMgr: sendToSubscribers("What users want?", "msg1267.txt", content)
  CallMgr -> u2: update("What users want?", "msg1267.txt", content)
end
</uml>

## MediaItem

We can imitate (and even use) Quill's editor design

 * Documents are expressed as [JSON Deltas](https://quilljs.com/guides/designing-the-delta-format/)
 * The Editor is very easy to extend with [new content types](https://quilljs.com/guides/cloning-medium-with-parchment/)

because Quill is also the [Editor component for PrimeReact](https://primereact.org/editor/)

### A Call (and any JSON structure) is a MediaItem too

So we can compose whatever we want with MediaItems (use wisely, keep complexity limited)

 * MediaItems must exist on their own, be storable and referrable e.g. by a hash
 * a Node may receive a JSON with references to other MediaItems, check which ones the Node already have and request to other nodes the missing ones
 
XXX:Move to [Content](./1ReadMe_content.html)
 

@module
*/
