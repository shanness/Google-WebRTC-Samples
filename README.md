# WebRTC code samples #

This is a repository for the WebRTC Javascript code samples.

It is originally a fork of [https://github.com/webrtc/samples](https://github.com/webrtc/samples), but updated to integrate the [Temasys Plugin](plugin.temasys.com.sg), and work on Internet Explorer and Safari.

Some of the samples use new browser features. They may only work in Chrome Canary, Firefox Beta, Microsoft Edge (available with Windows 10), and latest versions of the [Temasys Plugin](plugin.temasys.com.sg), and may require flags to be set.

All of the samples use [AdapterJS](https://github.com/Temasys/AdapterJS), a shim to insulate apps from spec changes and prefix differences. In fact, the standards and protocols used for WebRTC implementations are highly stable, and there are only a few prefixed names. For full interop information, see [webrtc.org/web-apis/interop](http://www.webrtc.org/web-apis/interop).

In Chrome and Opera, all samples that use `getUserMedia()` must be run from a server. Calling `getUserMedia()` from a file:// URL will work in Firefox and the Temasys Plugin, but fail silently in Chrome and Opera.

[webrtc.org/testing](http://www.webrtc.org/testing) lists command line flags useful for development and testing with Chrome.

For more information about WebRTC, we maintain a list of [WebRTC Resources](https://docs.google.com/document/d/1idl_NYQhllFEFqkGQOLv8KBK8M3EVzyvxnKkHl4SuM8/edit). If you've never worked with WebRTC, we recommend you start with the 2013 Google I/O [WebRTC presentation](http://www.youtube.com/watch?v=p2HzZkd2A40).

Patches and issues welcome! See [CONTRIBUTING](https://github.com/Temasys/Google-WebRTC-Samples/blob/dev/CONTRIBUTING.md) for instructions. All contributors must sign a contributor license agreement before code can be accepted. Please complete the agreement for an [individual](https://developers.google.com/open-source/cla/individual) or a [corporation](https://developers.google.com/open-source/cla/corporate) as appropriate.
The [Developer's Guide](https://bit.ly/webrtcdevguide) for this repo has more information about code style, structure and validation.
Head over to [test/README.md](https://github.com/Temasys/Google-WebRTC-Samples/blob/dev/test/README.md) and get started developing.

## The demos ##

### getUserMedia ###

[Basic getUserMedia demo](https://github.com/Temasys/Google-WebRTC-Samples/src/content/getusermedia/gum/)

<!-- [getUserMedia + canvas](https://github.com/Temasys/Google-WebRTC-Samples/src/content/getusermedia/canvas/) -->

<!-- [getUserMedia + canvas + CSS Filters](https://github.com/Temasys/Google-WebRTC-Samples/src/content/getusermedia/filter/) -->

[getUserMedia with resolution constraints](https://github.com/Temasys/Google-WebRTC-Samples/src/content/getusermedia/resolution/)

[getUserMedia with camera, mic and speaker selection](https://github.com/Temasys/Google-WebRTC-Samples/src/content/getusermedia/source/)

[Audio-only getUserMedia output to local audio element](https://github.com/Temasys/Google-WebRTC-Samples/src/content/getusermedia/audio/)

<!-- [Audio-only getUserMedia displaying volume](https://github.com/Temasys/Google-WebRTC-Samples/src/content/getusermedia/volume/) -->

<!-- [Face tracking](https://github.com/Temasys/Google-WebRTC-Samples/src/content/getusermedia/face/) -->

<!-- [Record stream](https://github.com/Temasys/Google-WebRTC-Samples/src/content/getusermedia/record/) -->

[getUserMedia in an iFrame](https://github.com/Temasys/Google-WebRTC-Samples/src/content/getusermedia/iframe)

### Devices ###

[Select camera, microphone and speaker](https://github.com/Temasys/Google-WebRTC-Samples/src/content/devices/input-output/)

[Select media source and audio output](https://github.com/Temasys/Google-WebRTC-Samples/src/content/devices/multi/)

### RTCPeerConnection ###

[Basic peer connection](https://github.com/Temasys/Google-WebRTC-Samples/src/content/peerconnection/pc1/)

[Audio-only peer connection](https://github.com/Temasys/Google-WebRTC-Samples/src/content/peerconnection/audio/)

[Multiple peer connections at once](https://github.com/Temasys/Google-WebRTC-Samples/src/content/peerconnection/multiple/)

[Forward output of one peer connection into another](https://github.com/Temasys/Google-WebRTC-Samples/src/content/peerconnection/multiple-relay/)

[Munge SDP parameters](https://github.com/Temasys/Google-WebRTC-Samples/src/content/peerconnection/munge-sdp/)

<!-- [Use pranswer when setting up a peer connection](https://github.com/Temasys/Google-WebRTC-Samples/src/content/peerconnection/pr-answer/) -->

[Adjust constraints, view stats](https://github.com/Temasys/Google-WebRTC-Samples/src/content/peerconnection/constraints/)

<!-- [Display createOffer output](https://github.com/Temasys/Google-WebRTC-Samples/src/content/peerconnection/create-offer/) -->

[Use RTCDTMFSender](https://github.com/Temasys/Google-WebRTC-Samples/src/content/peerconnection/dtmf/)

[Display peer connection states](https://github.com/Temasys/Google-WebRTC-Samples/src/content/peerconnection/states/)

[ICE candidate gathering from STUN/TURN servers](https://github.com/Temasys/Google-WebRTC-Samples/src/content/peerconnection/trickle-ice/)

[Do an ICE restart](https://github.com/Temasys/Google-WebRTC-Samples/src/content/peerconnection/restart-ice/)

<!-- [Web Audio output as input to peer connection](https://github.com/Temasys/Google-WebRTC-Samples/src/content/peerconnection/webaudio-input/) -->

<!-- [Peer connection as input to Web Audio](https://github.com/Temasys/Google-WebRTC-Samples/src/content/peerconnection/webaudio-output/) -->

### RTCDataChannel ###

[Transmit text](https://github.com/Temasys/Google-WebRTC-Samples/src/content/datachannel/basic/)

<!-- [Transfer a file](https://github.com/Temasys/Google-WebRTC-Samples/src/content/datachannel/filetransfer/) -->

<!-- [Transfer data](https://github.com/Temasys/Google-WebRTC-Samples/src/content/datachannel/datatransfer/) -->

[ArrayBuffer sending](https://github.com/Temasys/Google-WebRTC-Samples/src/content/datachannel/arraybuffer/)

<!-- ### Video chat ###

[AppRTC video chat client](https://apprtc.appspot.com/) powered by Google App Engine

[AppRTC URL parameters](https://apprtc.appspot.com/params.html)
 -->