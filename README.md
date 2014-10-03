
This repository hosts forks of the different [samples provided by Google](https://github.com/GoogleChrome/webrtc) with the  few changes needed so they would work on IE and Safari with the [plugin provided by Temasys](http://plugin.temasys.com.sg/0.8.512/)

All of the samples use [adapter.js](https://github.com/Temasys/AdapterJS), a shim to insulate apps from spec changes and prefix differences. In fact, the standards and protocols used for WebRTC implementations are highly stable, and there are only a few prefixed names. 

NB for chrome: all samples that use `getUserMedia()` must be run from a server. Calling `getUserMedia()` from a file:// URL will result in a PERMISSION_DENIED NavigatorUserMediaError.  See [What are some chromium command-line flags relevant to WebRTC development/testing?](http://www.webrtc.org/chrome#TOC-What-are-some-chromium-command-line-flags-relevant-to-WebRTC-development-testing-) for relevant flags.

Patches and issues welcome!

Tests updated today
=========

[getUserMedia()](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/getusermedia) 

[Audio-only peer connection](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/peerconnection-audio)

[Munge SDP](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/munge-sdp)

[ICE candidate gathering](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/trickle-ice)

[AppRTC](https://github.com/TemasysCommunications/Google-WebRTC-Samples/tree/master/samples/web/content/apprtc)

Tests to be updated in the future
=========

[getUserMedia() + Canvas](http://googlechrome.github.io/webrtc/samples/web/content/getusermedia-canvas)

[getUserMedia() + Canvas + CSS Filters](http://googlechrome.github.io/webrtc/samples/web/content/getusermedia-filter)

[getUserMedia() with resolution constraints](http://googlechrome.github.io/webrtc/samples/web/content/getusermedia-resolution)

[getUserMedia() with camera/mic selection](http://googlechrome.github.io/webrtc/samples/web/content/getusermedia-source)

[Audio-only getUserMedia() output to local audio element](http://googlechrome.github.io/webrtc/samples/web/content/getusermedia-audio)

[Audio-only getUserMedia() displaying volume](http://googlechrome.github.io/webrtc/samples/web/content/getusermedia-volume)

[Data channels](http://googlechrome.github.io/webrtc/samples/web/content/datachannel)

[Peer connection](http://googlechrome.github.io/webrtc/samples/web/content/peerconnection)

[Multiple peer connections](http://googlechrome.github.io/webrtc/samples/web/content/multiple)

[Multiple relay](http://googlechrome.github.io/webrtc/samples/web/content/multiple-relay)

[Accept incoming peer connection](http://googlechrome.github.io/webrtc/samples/web/content/pr-answer)

[Peer connection states](http://googlechrome.github.io/webrtc/samples/web/content/peerconnection-states)

[Web Audio output as input to peer connection](http://googlechrome.github.io/webrtc/samples/web/content/webaudio-input)

[Adjust constraints, view stats](http://googlechrome.github.io/webrtc/samples/web/content/constraints)

[Display createOffer output](http://googlechrome.github.io/webrtc/samples/web/content/create-offer)

[DTMF](http://googlechrome.github.io/webrtc/samples/web/content/dtmf)

[Face tracking](http://googlechrome.github.io/webrtc/samples/web/content/face)
