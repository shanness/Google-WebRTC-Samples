/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
var callButton = document.getElementById('callButton');
var hangupButton = document.getElementById('hangupButton');
hangupButton.disabled = true;
callButton.onclick = call;
hangupButton.onclick = hangup;

var pc1, pc2;
var localstream, remoteStream;

var sdpConstraints = {
  'mandatory': {
    'OfferToReceiveAudio': true,
    'OfferToReceiveVideo': false
  }
};

function gotStream(stream) {
  console.log('Received local stream');
  // Call the polyfill wrapper to attach the media stream to this element.
  localstream = stream;
  audioTracks = localstream.getAudioTracks();
  if (audioTracks.length > 0)
    console.log('Using Audio device: ' + audioTracks[0].label);
  pc1.addStream(localstream);
  console.log('Adding Local Stream to peer connection');

  pc1.createOffer(gotDescription1, onCreateSessionDescriptionError);
}

function onCreateSessionDescriptionError(error) {
  console.log('Failed to create session description: ' + error.toString());
}

function call() {
  callButton.disabled = true;
  hangupButton.disabled = false;
  console.log('Starting call');
  var servers = null;
  var pcConstraints = {
    'optional': []
  };
  pc1 = new RTCPeerConnection(servers, pcConstraints);
  console.log('Created local peer connection object pc1');
  pc1.onicecandidate = iceCallback1;
  pc2 = new RTCPeerConnection(servers, pcConstraints);
  console.log('Created remote peer connection object pc2');
  pc2.onicecandidate = iceCallback2;
  pc2.onaddstream = gotRemoteStream;
  console.log('Requesting local stream');
  // Call into getUserMedia via the polyfill (adapter.js).
  getUserMedia({
      audio: true,
      video: false
    },
    gotStream, function(e){
      alert('getUserMedia() error: ' + e.name);
    });
}

function gotDescription1(desc) {
  pc1.setLocalDescription(desc);
  console.log('Offer from pc1 \n' + desc.sdp);
  pc2.setRemoteDescription(desc);
  // Since the 'remote' side has no media stream we need
  // to pass in the right constraints in order for it to
  // accept the incoming offer of audio.
  pc2.createAnswer(gotDescription2, onCreateSessionDescriptionError,
    sdpConstraints);
}

function gotDescription2(desc) {
  pc2.setLocalDescription(desc);
  console.log('Answer from pc2 \n' + desc.sdp);
  pc1.setRemoteDescription(desc);
}

function hangup() {
  console.log('Ending call');
  pc1.close();
  pc2.close();
  pc1 = null;
  pc2 = null;
  hangupButton.disabled = true;
  callButton.disabled = false;
}

function gotRemoteStream(e) {
  // Call the polyfill wrapper to attach the media stream to this element.
  remoteStream = e.stream;
  audio2 = attachMediaStream(audio2, e.stream);
  console.log('Received remote stream');
}

function iceCallback1(event) {
  if (event.candidate) {
    pc2.addIceCandidate(event.candidate,
      onAddIceCandidateSuccess, onAddIceCandidateError);
    console.log('Local ICE candidate: \n' + event.candidate.candidate);
  }
}

function iceCallback2(event) {
  if (event.candidate) {
    pc1.addIceCandidate(event.candidate,
      onAddIceCandidateSuccess, onAddIceCandidateError);
    console.log('Remote ICE candidate: \n ' + event.candidate.candidate);
  }
}

function onAddIceCandidateSuccess() {
  console.log('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
  console.log('Failed to add ICE Candidate: ' + error.toString());
}
