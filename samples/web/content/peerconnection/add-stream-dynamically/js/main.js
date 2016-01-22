/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
var iceconnectionstate1 = null;
var iceconnectionstate2 = null;

var videoDiv = document.getElementById('videos');
var video1 = document.getElementById('video1');
var video2 = document.getElementById('video2');
var extraVideoTags = [];

var startButton = document.getElementById('startButton');
var callButton = document.getElementById('callButton');
var addStreamButton = document.getElementById('addStreamButton');
var hangupButton = document.getElementById('hangupButton');
startButton.disabled = false;
callButton.disabled = true;
addStreamButton.disabled = true;
hangupButton.disabled = true;
startButton.onclick = start;
callButton.onclick = call;
addStreamButton.onclick = addStream;
hangupButton.onclick = hangup;
video1.onclick = function(e) { console.log('onclick'); };
video1.onplay = function(e) { console.log('onplay'); };

var pc1StateDiv = document.getElementById('pc1State');
var pc1IceStateDiv = document.getElementById('pc1IceState');
var pc2StateDiv = document.getElementById('pc2State');
var pc2IceStateDiv = document.getElementById('pc2IceState');

var localstream, remoteStream, pc1, pc2;
var newLocalStream, newRemoteStream;

var sdpConstraints =
  {
    mandatory: {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true
    }
  };

function gotStream(stream){
  console.log('Received local stream');
  // Call the polyfill wrapper to attach the media stream to this element.
  video1 = attachMediaStream(video1, stream);
  localstream = stream;
  callButton.disabled = false;
}

function start() {
  console.log('Requesting local stream');
  startButton.disabled = true;
  // Call into getUserMedia via the polyfill (adapter.js).
  getUserMedia({audio: true, video: true}, gotStream,
    function(e){
      alert('getUserMedia() error: ', e.name);
    });
}

function call() {
  callButton.disabled = true;
  addStreamButton.disabled = false;
  hangupButton.disabled = false;
  console.log('Starting call');
  var videoTracks = localstream.getVideoTracks();
  var audioTracks = localstream.getAudioTracks();
  if (videoTracks.length > 0)
    console.log('Using Video device: ' + videoTracks[0].label);
  if (audioTracks.length > 0)
    console.log('Using Audio device: ' + audioTracks[0].label);
  var servers = null;
  var pcConstraints = {'optional': []};

  pc1 = new RTCPeerConnection(servers, pcConstraints);
  console.log('Created local peer connection object pc1');
  pc1StateDiv.textContent = pc1.signalingState || pc1.readyState;
  pc1.onsignalingstatechange = stateCallback1;
  pc1IceStateDiv.textContent = pc1.iceConnectionState;
  pc1.oniceconnectionstatechange = iceStateCallback1;
  pc1.onicecandidate = iceCallback1;

  pc2 = new RTCPeerConnection(servers, pcConstraints);
  console.log('Created remote peer connection object pc2');
  pc2StateDiv.textContent = pc2.signalingState || pc2.readyState;
  pc2.onsignalingstatechange = stateCallback2;
  pc2IceStateDiv.textContent = pc2.iceConnectionState;
  pc2.oniceconnectionstatechange = iceStateCallback2;
  pc2.onicecandidate = iceCallback2;
  pc2.onaddstream = gotRemoteStream;
  pc1.addStream(localstream);
  console.log('Adding Local Stream to peer connection');
  pc1.createOffer(gotDescription1, onCreateSessionDescriptionError);
}

function addStream() {
  console.log('Adding stream');
  console.log('Requesting new stream');

  getUserMedia(
    {audio: true, video: true}, 
    gotNewStream,
    function(e){
      alert('getUserMedia() error: ', e.name);
    });
}

function gotNewStream(stream) {
  console.log('Got new stream');
  newLocalStream = stream;

  // update texts
  pc1StateDiv.textContent = pc1.signalingState || pc1.readyState;
  pc1IceStateDiv.textContent = pc1.iceConnectionState;
  pc2StateDiv.textContent = pc2.signalingState || pc2.readyState;
  pc2IceStateDiv.textContent = pc2.iceConnectionState;

  // send the new stream over to pc2
  console.log('Adding Local Stream to peer connection');
  pc2.onaddstream = gotNewRemoteStream;
  pc1.addStream(newLocalStream);
  pc1.createOffer(gotDescription1, onCreateSessionDescriptionError);
}

function gotNewRemoteStream(e) {
  // keep reference
  newRemoteStream = e.stream;

  // inject new element
  newVideo = document.createElement('video');
  videoDiv.appendChild(newVideo);

  // play new stream
  newVideo = attachMediaStream(newVideo, newRemoteStream);
  extraVideoTags.push(newVideo);
}

function onCreateSessionDescriptionError(error) {
  console.log('Failed to create session description: ' + error.toString());
}

function gotDescription1(description) {
  pc1.setLocalDescription(description);
  console.log('Offer from pc1: \n' + description.sdp);
  pc2.setRemoteDescription(description);
  pc2.createAnswer(gotDescription2, onCreateSessionDescriptionError,
    sdpConstraints);
}

function gotDescription2(description) {
  pc2.setLocalDescription(description);
  console.log('Answer from pc2 \n' + description.sdp);
  pc1.setRemoteDescription(description);
}

function hangup() {
  console.log('Ending call');
  pc1.close();
  pc2.close();
  pc1StateDiv.textContent += ' ⇒ ' + pc1.signalingState || pc1.readyState;
  pc2StateDiv.textContent += ' ⇒ ' + pc2.signalingState || pc2.readyState;
  pc1IceStateDiv.textContent += ' ⇒ ' + pc1.iceConnectionState;
  pc2IceStateDiv.textContent += ' ⇒ ' + pc2.iceConnectionState;
  pc1 = null;
  pc2 = null;

  for (i = 0; i < extraVideoTags.length; i++) {
    videoDiv.removeChild(extraVideoTags[i ]);
  }
  extraVideoTags.length = 0;

  hangupButton.disabled = true;
  addStreamButton.disabled = true;
  callButton.disabled = false;
}

function gotRemoteStream(e){
  remoteStream = e.stream;
  video2 = attachMediaStream(video2, e.stream);

  console.log('Got remote stream');
}

function stateCallback1() {
  var state;
  if (pc1) {
    state = pc1.signalingState || pc1.readyState;
    console.log('pc1 state change callback, state: ' + state);
    pc1StateDiv.textContent += ' ⇒ ' + state;
  }
}

function stateCallback2() {
  var state;
  if (pc2) {
    state = pc2.signalingState || pc2.readyState;
    console.log('pc2 state change callback, state: ' + state);
    pc2StateDiv.textContent += ' ⇒ ' + state;
  }
}

function iceStateCallback1(args) {
  var iceState;
  iceconnectionstate1 = args;
  if (pc1) {
    iceState = pc1.iceConnectionState;
    console.log('pc1 ICE connection state change callback, state: ' + iceState);
    pc1IceStateDiv.textContent += ' ⇒ ' + iceState;
  }
}

function iceStateCallback2(args) {
  var iceState;
  iceconnectionstate2 = args;
  if (pc2) {
    iceState = pc2.iceConnectionState;
    console.log('pc2 ICE connection state change callback, state: ' + iceState);
    pc2IceStateDiv.textContent += ' ⇒ ' + iceState;
  }
}

function iceCallback1(event){
  if (event.candidate) {
    pc2.addIceCandidate(event.candidate,
      onAddIceCandidateSuccess, onAddIceCandidateError);
    console.log('Local ICE candidate: \n' + event.candidate.candidate);
  } else {
    console.log('End of candidates added to PC2');
  }
}

function iceCallback2(event){
  if (event.candidate) {
    pc1.addIceCandidate(event.candidate,
      onAddIceCandidateSuccess, onAddIceCandidateError);
    console.log('Remote ICE candidate: \n ' + event.candidate.candidate);
  } else {
    console.log('End of candidates added to PC1');
  }
}

function onAddIceCandidateSuccess() {
  console.log('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
  console.log('Failed to add Ice Candidate: ' + error.toString());
}
