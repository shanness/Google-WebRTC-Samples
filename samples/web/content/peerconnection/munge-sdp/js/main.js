/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
var getMediaButton = document.getElementById('getMedia');
var createPeerConnectionButton = document.getElementById('createPeerConnection');
var createOfferButton = document.getElementById('createOffer');
var setOfferButton = document.getElementById('setOffer');
var createAnswerButton = document.getElementById('createAnswer');
var setAnswerButton = document.getElementById('setAnswer');
var hangupButton = document.getElementById('hangup');

getMediaButton.onclick = getMedia;
createPeerConnectionButton.onclick = createPeerConnection;
createOfferButton.onclick = createOffer;
setOfferButton.onclick = setOffer;
createAnswerButton.onclick = createAnswer;
setAnswerButton.onclick = setAnswer;
hangupButton.onclick = hangup;

var offerSdpTextarea = document.getElementById('localSDP');
var answerSdpTextarea = document.getElementById('remoteSDP');

var audioSelect = document.getElementById('audioSrc');
var videoSelect = document.getElementById('videoSrc');

// audioSelect.onchange = videoSelect.onchange = getMedia;

var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');

var selectSourceDiv = document.getElementById('selectSource');

var localPeerConnection, remotePeerConnection;
var localStream;
var remoteStream;
var sdpConstraints = {
  'mandatory': {
    'OfferToReceiveAudio': true,
    'OfferToReceiveVideo': true
  }
};

function getSources() {
  if (typeof MediaStreamTrack === 'undefined'){
    alert('This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
  } else {
    MediaStreamTrack.getSources(gotSources);
    // selectSourceDiv.classList.remove('hidden');
  }
}

AdapterJS.webRTCReady(function () {
  getSources();
});

function gotSources(sourceInfos) {
  var audioCount = 0;
  var videoCount = 0;
  for (var i = 0; i < sourceInfos.length; i++) {
    var option = document.createElement('option');
    option.value = sourceInfos[i].id;
    option.text = sourceInfos[i].label;
    if (sourceInfos[i].kind === 'audio') {
      audioCount++;
      if (option.text === '') {
        option.text = 'Audio ' + audioCount;
      }
      audioSelect.appendChild(option);
    } else {
      videoCount++;
      if (option.text === '') {
        option.text = 'Video ' + videoCount;
      }
      videoSelect.appendChild(option);
    }
  }

  if (AdapterJS.WebRTCPlugin.plugin
    && AdapterJS.WebRTCPlugin.plugin.HasScreensharingFeature
    && AdapterJS.WebRTCPlugin.plugin.isScreensharingAvailable) {
    var option = document.createElement('option');
    option.value = AdapterJS.WebRTCPlugin.plugin.screensharingKey;
    option.text = "Screensharing";
    videoSelect.appendChild(option);
  }

  var option = document.createElement('option');
  option.value = '';
  option.text = 'none'; 
  audioSelect.appendChild(option);

  option = document.createElement('option');
  option.value = '';
  option.text = 'none'; 
  videoSelect.appendChild(option);
}

function getMedia() {
  // getMediaButton.disabled = true;
  createPeerConnectionButton.disabled = false;

  if (!!localStream) {
    localVideo.src = null;
    if (typeof localStream.stop !== 'undefined') {
      localStream.stop();
    }
  }
  var audioSource = audioSelect.value;
  console.log('Selected audio source: ' + audioSource);
  var videoSource = videoSelect.value;
  console.log('Selected video source: ' + videoSource);

  var constraints = {};
  if (audioSource === '') {
    constraints.audio = false;
  } else {
    constraints.audio = {
      optional: [{sourceId: audioSource}]
    };
  }

  if (videoSource === '') {
    constraints.video = false;
  } else {
    constraints.video = {
      optional: [{sourceId: videoSource}]
    };
  }

  console.log('Re sted local stream');
  getUserMedia(constraints, gotStream, function(e){
    console.log("navigator.getUserMedia error: ", e);
  });
}

function gotStream(stream) {
  console.log('Received local stream');
  // Call the polyfill wrapper to attach the media stream to this element.
  localVideo = attachMediaStream(localVideo, stream);
  localStream = stream;
}

function createPeerConnection() {
  createPeerConnectionButton.disabled = true;
  createOfferButton.disabled = false;
  createAnswerButton.disabled = false;
  setOfferButton.disabled = false;
  setAnswerButton.disabled = false;
  hangupButton.disabled = false;
  console.log('Starting call');
  var videoTracks = localStream.getVideoTracks();
  var audioTracks = localStream.getAudioTracks();
  if (videoTracks.length > 0) {
    console.log('Using video device: ' + videoTracks[0].label);
  }
  if (audioTracks.length > 0) {
    console.log('Using audio device: ' + audioTracks[0].label);
  }
  var servers = null;
  localPeerConnection = new RTCPeerConnection(servers);
  console.log('Created local peer connection object localPeerConnection');
  localPeerConnection.onicecandidate = iceCallback1;
  remotePeerConnection = new RTCPeerConnection(servers);
  console.log('Created remote peer connection object remotePeerConnection');
  remotePeerConnection.onicecandidate = iceCallback2;
  remotePeerConnection.onaddstream = gotRemoteStream;

  localPeerConnection.addStream(localStream);
  console.log('Adding Local Stream to peer connection');
}

function onSetSessionDescriptionSuccess() {
  console.log('Set session description success.');
}

function onSetSessionDescriptionError(error) {
  console.log('Failed to set session description: ' + error.toString());
}

// Workaround for crbug/322756.
function maybeAddLineBreakToEnd(sdp) {
  var endWithLineBreak = new RegExp(/\n$/);
  if (!endWithLineBreak.test(sdp)) {
    return sdp + '\n';
  }
  return sdp;
}

function createOffer() {
  localPeerConnection.createOffer(gotDescription1, onCreateSessionDescriptionError);
}

function onCreateSessionDescriptionError(error) {
  console.log('Failed to create session description: ' + error.toString());
}

function setOffer() {
  var sdp = offerSdpTextarea.value;
  sdp = maybeAddLineBreakToEnd(sdp);
  var offer = new RTCSessionDescription({
    type: 'offer',
    sdp: sdp
  });
  localPeerConnection.setLocalDescription(offer,
    onSetSessionDescriptionSuccess,
    onSetSessionDescriptionError);
  console.log('Modified Offer from localPeerConnection \n' + sdp);
  remotePeerConnection.setRemoteDescription(offer,
    onSetSessionDescriptionSuccess,
    onSetSessionDescriptionError);
}

var dd;

function gotDescription1(description) {
dd=description;

  offerSdpTextarea.disabled = false;
  offerSdpTextarea.value = description.sdp;
}

function createAnswer() {
  // Since the 'remote' side has no media stream we need
  // to pass in the right constraints in order for it to
  // accept the incoming offer of audio and video.
  remotePeerConnection.createAnswer(gotDescription2, onCreateSessionDescriptionError,
    sdpConstraints);
}

function setAnswer() {
  var sdp = answerSdpTextarea.value;
  sdp = maybeAddLineBreakToEnd(sdp);
  var answer = new RTCSessionDescription({
    type: 'answer',
    sdp: sdp
  });
  remotePeerConnection.setLocalDescription(answer,
    onSetSessionDescriptionSuccess,
    onSetSessionDescriptionError);
  console.log('Modified Answer from remotePeerConnection \n' + sdp);
  localPeerConnection.setRemoteDescription(answer,
    onSetSessionDescriptionSuccess,
    onSetSessionDescriptionError);
}

function gotDescription2(description) {
  answerSdpTextarea.disabled = false;
  answerSdpTextarea.value = description.sdp;
}

function hangup() {
  remoteVideo.src = '';
  console.log('Ending call');
  if (typeof localStream.stop !== 'undefined') {
    localStream.stop();
  }
  localPeerConnection.close();
  remotePeerConnection.close();
  localPeerConnection = null;
  remotePeerConnection = null;
  offerSdpTextarea.disabled = true;
  answerSdpTextarea.disabled = true;
  getMediaButton.disabled = false;
  createPeerConnectionButton.disabled = true;
  createOfferButton.disabled = true;
  setOfferButton.disabled = true;
  createAnswerButton.disabled = true;
  setAnswerButton.disabled = true;
  hangupButton.disabled = true;
}

function gotRemoteStream(e) {
  // Call the polyfill wrapper to attach the media stream to this element.
  remoteStream = e.stream;
  remoteVideo = attachMediaStream(remoteVideo, remoteStream);
  console.log('Received remote stream');
}

function iceCallback1(event) {
  if (event.candidate) {
    remotePeerConnection.addIceCandidate(event.candidate,
      onAddIceCandidateSuccess, onAddIceCandidateError);
    console.log('Local ICE candidate: \n' + event.candidate.candidate);
  }
}

function iceCallback2(event) {
  if (event.candidate) {
    localPeerConnection.addIceCandidate(event.candidate,
      onAddIceCandidateSuccess, onAddIceCandidateError);
    console.log('Remote ICE candidate: \n ' + event.candidate.candidate);
  }
}

function onAddIceCandidateSuccess() {
  console.log('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
  console.log('Failed to add Ice Candidate: ' + error.toString());
}

function addEvent(evnt, elem, func) {
   if (elem.addEventListener)  // W3C DOM
      elem.addEventListener(evnt,func,false);
   else if (elem.attachEvent) { // IE DOM
      elem.attachEvent("on"+evnt, func);
   }
   else { // No much to do
      elem[evnt] = func;
   }
}

function Temasys_showUpdatePopup() {
  if (document.readyState !== 'complete')
    return;
  
  var w = window;
  var i = document.createElement('iframe');
  i.style.position = 'fixed';
  i.style.top = '-41px';
  i.style.left = 0;
  i.style.right = 0;
  i.style.width = '100%';
  i.style.height = '40px';
  i.style.backgroundColor = '#ffffe1';
  i.style.border = 'none';
  i.style.borderBottomWidth = '1px';
  i.style.borderBottomColor = '#888888';
  i.style.borderBottomStyle = 'solid';
  i.style.zIndex = '9999999';
  if(typeof i.style.webkitTransition === 'string') {
    i.style.webkitTransition = 'all .5s ease-out';
  } else if(typeof i.style.transition === 'string') {
    i.style.transition = 'all .5s ease-out';
  }
  document.body.insertBefore(i, document.body.childNodes[0]);
  c = (i.contentWindow) ? i.contentWindow :
  (i.contentDocument.document) ? i.contentDocument.document : i.contentDocument;
  c.document.open();
  c.document.write('<!DOCTYPE html><html lang=\"en\">' +
                  '<head> <meta charset=\"utf-8\">' +
                  '<title>Temasys Plugin Update Panel</title> ' +
                  '</head>' +
                  '<body style=\"background: #ffffe1  ;\">');
  c.document.write('<span style=\"font-family: Helvetica, Arial,' +
                  'sans-serif; font-size: .9rem; padding: 7px; vertical-align: ' +
                  'middle; cursor: default;\">A new version of the <a id=\"TemasysPlugin_pluginPortalLink\" href=\"\">Temasys WebRTC plugin</a> is available </span>');
  c.document.write('<button id=\"TemasysPlugin_okay\">button</button><button id=\"TemasysPlugin_cancel\">Cancel</button>');
  c.document.write('</body>' +
                  '</html>');
  c.document.close();
  addEvent('click', c.document.getElementById('TemasysPlugin_okay'), function(e) {
                   window.open('http://bit.ly/1kkS4FN', '_top');
                    e.preventDefault();
                    try {
                      event.cancelBubble = true;
                    } catch(error) { }
                  });
  addEvent('click', c.document.getElementById('TemasysPlugin_pluginPortalLink'), function(e) {
                    window.open('https://temasys.atlassian.net/wiki/display/TWPP/WebRTC+Plugins', '_blank');
                    e.preventDefault();
                    try {
                      event.cancelBubble = true;
                    } catch(error) { }
                  });
  addEvent('click', c.document.getElementById('TemasysPlugin_cancel'), function() {
                    w.document.body.removeChild(i);
                  });
  setTimeout(function() {
    if(typeof i.style.webkitTransform === 'string') {
      i.style.webkitTransform = 'translateY(40px)';
    } else if(typeof i.style.transform === 'string') {
      i.style.transform = 'translateY(40px)';
    } else {
      i.style.top = '0px';
    }
  }, 300); 
};

