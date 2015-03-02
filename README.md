# WebRTC code samples #

This repository hosts forks of the different [samples provided by Google](https://github.com/GoogleChrome/webrtc) with the  few changes needed so they would work on IE and Safari with the [plugin provided by Temasys](http://plugin.temasys.com.sg/)

All of the samples use [adapter.js](https://github.com/Temasys/AdapterJS), a shim to insulate apps from spec changes and prefix differences. In fact, the standards and protocols used for WebRTC implementations are highly stable, and there are only a few prefixed names. 

NB for chrome: all samples that use `getUserMedia()` must be run from a server. Calling `getUserMedia()` from a file:// URL will result in a PERMISSION_DENIED NavigatorUserMediaError.  See [What are some chromium command-line flags relevant to WebRTC development/testing?](http://www.webrtc.org/chrome#TOC-What-are-some-chromium-command-line-flags-relevant-to-WebRTC-development-testing-) for relevant flags.

Patches and issues welcome!

Tests updated today
=========

[getUserMedia()](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/getusermedia/gum) 

[getUserMedia with camera/mic selection](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/getusermedia/source)

[getUserMedia in iFrame](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/getusermedia/iframe)

[getUserMedia in iFrame](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/getusermedia/playPause)

[ICE candidate gathering](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/peerconnection/trickle-ice)

[Peer Connection](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/peerconnection/pc1)

[Peer Connection States](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/peerconnection/states)

[Audio-only peer connection](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/peerconnection/audio)

[Multiple peer connections](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/peerconnection/multiple)

[Multiple relays](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/peerconnection/multiple-relay)

[Munge SDP](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/peerconnection/munge-sdp)

[Data channels](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/datachannel)

[Data channels with arraybuffers](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/datachannel-arraybuffer)

[AppRTC](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/apprtc)

Tests to be updated in the future
=========

[getUserMedia + canvas](https://googlechrome.github.io/webrtc/samples/web/content/getusermedia/canvas)

[getUserMedia + canvas + CSS Filters](https://googlechrome.github.io/webrtc/samples/web/content/getusermedia/filter)

[getUserMedia with resolution constraints](https://googlechrome.github.io/webrtc/samples/web/content/getusermedia/resolution)

[Audio-only getUserMedia output to local audio element](https://googlechrome.github.io/webrtc/samples/web/content/getusermedia/audio)

[Audio-only getUserMedia displaying volume](https://googlechrome.github.io/webrtc/samples/web/content/getusermedia/volume)

[Face tracking](https://googlechrome.github.io/webrtc/samples/web/content/getusermedia/face)

[Accept incoming peer connection](http://googlechrome.github.io/webrtc/samples/web/content/pr-answer)

[Use pranswer when setting up a peer connection](https://googlechrome.github.io/webrtc/samples/web/content/peerconnection/pr-answer)

[Adjust constraints, view stats](https://googlechrome.github.io/webrtc/samples/web/content/peerconnection/constraints)

[Display createOffer output](https://googlechrome.github.io/webrtc/samples/web/content/peerconnection/create-offer)

[Use RTCDTMFSender](https://googlechrome.github.io/webrtc/samples/web/content/peerconnection/dtmf)

[Web Audio output as input to peer connection](https://googlechrome.github.io/webrtc/samples/web/content/peerconnection/webaudio-input)



