# WebMeet

videocall / videoconference / screen sharing / voice chat

## Design Goals

* Usable even with breaking and very low bandwidth internet connections
* No server required as far as possible
* Best UX for each activity type:
   * Conference: +50 participants, slides and videos, questions, point at things, etc.
   * Virtual Room: like working together on the same table, each participant with their screen, drawings, files but able to share and edit with others.
   * Tabletop Game: turns, shared / private channels.

## Development

We use 

* https://github.com/peers/peerjs#data-connections
* https://vitejs.dev/guide/ with ```pnpm create vite --template react-ts```
* https://primereact.org/button/ and other components
* https://vitest.dev/guide/#writing-tests

For QA+CI use

* ```npm run lint```
* ```npm run test```
* ```npm run test-coverage```
* ```npm run doc```

### Diagnostics and debugging

* PeerJs: use the debug parameter
* Firefox: write `about:webrtc` in the navbar

## Architecture

Copied from IP

* We send and receive _packets_ e.g. for audio, we don't use WebRTC streams.
* Multiple _transport_ options e.g. WebRTC with peerjs, WebSockets, even https.
* _PeerId_ is independent from transport, so we can send to PeerXYZ in whichever transport works now.

Copied from lower level protocols

* Packets may include a _forwarding route_ so PeerA can send to PeerD sending to PeerB to PeerC to PeerD

THUS we have _PacketEmitters_ and _PacketListeners_
* audio

## Future

* https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
* https://typedoc.org/example/
