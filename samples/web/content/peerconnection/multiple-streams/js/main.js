/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
var iceconnectionstate1 = null;
var iceconnectionstate2 = null;

var localVideo1 = document.getElementById('localVideo1');
var localVideo2 = document.getElementById('localVideo2');
var remoteVideo1 = document.getElementById('remoteVideo1');
var remoteVideo2 = document.getElementById('remoteVideo2');

var startButton = document.getElementById('startButton');
var callButton = document.getElementById('callButton');
var hangupButton = document.getElementById('hangupButton');
startButton.disabled = false;
callButton.disabled = true;
hangupButton.disabled = true;
startButton.onclick = start;
callButton.onclick = call;
hangupButton.onclick = hangup;

var pc1StateDiv = document.getElementById('pc1State');
var pc1IceStateDiv = document.getElementById('pc1IceState');
var pc2StateDiv = document.getElementById('pc2State');
var pc2IceStateDiv = document.getElementById('pc2IceState');

var localstream1, localstream2, pc1, pc2;
var remoteStreamCount = 0;

var sdpConstraints =
  {
    mandatory: {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true
    }
  };

function gotStream1(stream){
  console.log('Received local stream 1');
  // Call the polyfill wrapper to attach the media stream to this element.
  localVideo1 = attachMediaStream(localVideo1, stream);
  localstream1 = stream;

  // Call getUserMedia again to get a second stream
  getUserMedia({audio: true, video: true}, gotStream2,
    function(e){
      alert('getUserMedia() error: ', e.name);
    });
}

function gotStream2(stream){
  console.log('Received local stream 2');
  // Call the polyfill wrapper to attach the media stream to this element.
  localVideo2 = attachMediaStream(localVideo2, stream);
  localstream2 = stream;

  callButton.disabled = false;
}

// Will chain call 2 GUM with callbacks gotStream1 and gotStream2
function start() {
  console.log('Requesting local stream');
  startButton.disabled = true;
  // Call into getUserMedia via the polyfill (adapter.js).
  getUserMedia({audio: true, video: true}, gotStream1,
    function(e){
      alert('getUserMedia() error: ', e.name);
    });
}

function call() {
  callButton.disabled = true;
  hangupButton.disabled = false;
  remoteStreamCount = 0;

  console.log('Starting call');
  var videoTracks1 = localstream1.getVideoTracks();
  var audioTracks1 = localstream1.getAudioTracks();
  if (videoTracks1.length > 0)
    console.log('Using Video device: ' + videoTracks1[0].label);
  if (audioTracks1.length > 0)
    console.log('Using Audio device: ' + audioTracks1[0].label);

  var videoTracks2 = localstream2.getVideoTracks();
  var audioTracks2 = localstream2.getAudioTracks();
  if (videoTracks2.length > 0)
    console.log('Using Video device: ' + videoTracks2[0].label);
  if (audioTracks1.length > 0)
    console.log('Using Audio device: ' + audioTracks2[0].label);

  var servers = null;
  var pcConstraints = {'optional': []};

  pc1 = new RTCPeerConnection(servers, pcConstraints);
  console.log('Created local peer connection object pc1');
  pc1StateDiv.textContent = pc1.signalingState || pc1.readyState;
  if (typeof pc1.onsignalingstatechange !== 'undefined') {
    pc1.onsignalingstatechange = stateCallback1;
  } else {
    pc1.onstatechange = stateCallback1;
  }
  pc1IceStateDiv.textContent = pc1.iceConnectionState;
  if (pc1.oniceconnectionstatechange) {
    pc1.oniceconnectionstatechange = iceStateCallback1;
  } else {
    pc1.onicechange = iceStateCallback1;
  }
  pc1.onicecandidate = iceCallback1;

  pc2 = new RTCPeerConnection(servers, pcConstraints);
  console.log('Created remote peer connection object pc2');
  pc2StateDiv.textContent = pc2.signalingState || pc2.readyState;
  if (pc2.onsignalingstatechange) {
    pc2.onsignalingstatechange = stateCallback2;
  } else {
    pc2.onstatechange = stateCallback2;
  }
  pc2IceStateDiv.textContent = pc2.iceConnectionState;
  if (typeof pc2.oniceconnectionstatechange !== 'undefined') {
    pc2.oniceconnectionstatechange = iceStateCallback2;
  } else {
    pc2.onicechange = iceStateCallback2;
  }
  pc2.onicecandidate = iceCallback2;
  pc2.onaddstream = gotRemoteStream;
  pc1.addStream(localstream1);
  pc1.addStream(localstream2);
  console.log('Adding Local Stream to peer connection');
  pc1.createOffer(gotDescription1, onCreateSessionDescriptionError);
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
  hangupButton.disabled = true;
  callButton.disabled = false;
}

function gotRemoteStream(e){
  ++remoteStreamCount;

  if (remoteStreamCount == 1) {
    remoteVideo1 = attachMediaStream(remoteVideo1, e.stream);
    console.log('Got remote stream 1');
  } else { // second remote stream
    remoteVideo2 = attachMediaStream(remoteVideo2, e.stream);
    console.log('Got remote stream 2');
  }
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
