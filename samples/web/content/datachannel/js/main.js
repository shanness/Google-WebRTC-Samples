/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

var localConnection, remotePeerConnection, sendChannel, receiveChannel,
  pcConstraint, dataConstraint;
var dataChannelSend = document.getElementById('dataChannelSend');
var dataChannelReceive = document.getElementById('dataChannelReceive');
var sctpSelect = document.getElementById('useSctp');
var rtpSelect = document.getElementById('useRtp');
var startButton = document.getElementById('startButton');
var sendButton = document.getElementById('sendButton');
var closeButton = document.getElementById('closeButton');

startButton.onclick = createConnection;
sendButton.onclick = sendData;
closeButton.onclick = closeDataChannels;
rtpSelect.onclick = enableStartButton;
sctpSelect.onclick = enableStartButton;

function enableStartButton() {
  startButton.disabled = false;
}

function disableSendButton() {
  sendButton.disabled = true;
}

rtpSelect.onclick = sctpSelect.onclick = function() {
  dataChannelReceive.value = '';
  dataChannelSend.value = '';
  disableSendButton();
  enableStartButton();
};

function createConnection() {
  dataChannelSend.placeholder = '';
  var servers = null;
  pcConstraint = null;
  dataConstraint = {
    'id': 34
  };
  if (sctpSelect.checked &&
     (webrtcDetectedBrowser === 'chrome' && webrtcDetectedVersion >= 31) ||
      webrtcDetectedBrowser === 'firefox' || webrtcDetectedBrowser === 'safari'
      || webrtcDetectedBrowser ==='IE'){
    // SCTP is supported from Chrome M31 and is supported in FF.
    // No need to pass DTLS constraint as it is on by default in Chrome M31.
    // For SCTP, reliable and ordered is true by default.
    console.log('Using SCTP based Data Channels');
  } else {
    pcConstraint = {
      optional: [{
        RtpDataChannels: true
      }]
    };
    if (!rtpSelect.checked) {
      // Use rtp data channels for chrome versions older than M31.
      console.log('Using RTP based Data Channels,' +
            'as you are on an older version than M31.');
      alert('Reverting to RTP based data channels,' +
            'as you are on an older version than M31.');
      rtpSelect.checked = true;
    }
  }
  localConnection = new RTCPeerConnection(servers, pcConstraint);
  console.log('Created local peer connection object localConnection');

  try {
    // Data Channel API supported from Chrome M25.
    // You might need to start Chrome with --enable-data-channels flag.
    sendChannel = localConnection.createDataChannel('sendDataChannel', dataConstraint);
    console.log('Created send data channel');
  } catch (e) {
    alert('Failed to create data channel. ' +
          'You need Chrome M25 or later with --enable-data-channels flag');
    console.log('Create Data channel failed with exception: ' + e.message);
  }
  localConnection.onicecandidate = iceCallback1;
  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;

  remotePeerConnection = new RTCPeerConnection(servers, pcConstraint);
  console.log('Created remote peer connection object remotePeerConnection');

  remotePeerConnection.onicecandidate = iceCallback2;
  remotePeerConnection.ondatachannel = receiveChannelCallback;

  localConnection.createOffer(gotDescription1, onCreateSessionDescriptionError);
  startButton.disabled = true;
  closeButton.disabled = false;
}

function onCreateSessionDescriptionError(error) {
  console.log('Failed to create session description: ' + error.toString());
}

function sendData() {
  var data = dataChannelSend.value;
  sendChannel.send(data);
  console.log('Sent Data: ' + data);
}

function closeDataChannels() {
  console.log('Closing data Channels');
  sendChannel.close();
  console.log('Closed data channel with label: ' + sendChannel.label);
  receiveChannel.close();
  console.log('Closed data channel with label: ' + receiveChannel.label);
  localConnection.close();
  remotePeerConnection.close();
  localConnection = null;
  remotePeerConnection = null;
  console.log('Closed peer connections');
  startButton.disabled = false;
  sendButton.disabled = true;
  closeButton.disabled = true;
  dataChannelSend.value = '';
  dataChannelReceive.value = '';
  dataChannelSend.disabled = true;
}

function gotDescription1(desc) {
  localConnection.setLocalDescription(desc);
  console.log('Offer from localConnection \n' + desc.sdp);
  remotePeerConnection.setRemoteDescription(desc);
  remotePeerConnection.createAnswer(gotDescription2, onCreateSessionDescriptionError);
}

function gotDescription2(desc) {
  remotePeerConnection.setLocalDescription(desc);
  console.log('Answer from remotePeerConnection \n' + desc.sdp);
  localConnection.setRemoteDescription(desc);
}

function iceCallback1(event) {
  console.log('local ice callback');
  if (event.candidate) {
    remotePeerConnection.addIceCandidate(event.candidate,
                        onAddIceCandidateSuccess, onAddIceCandidateError);
    console.log('Local ICE candidate: \n' + event.candidate.candidate);
  }
}

function iceCallback2(event) {
  console.log('remote ice callback');
  if (event.candidate) {
    localConnection.addIceCandidate(event.candidate,
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

function receiveChannelCallback(event) {
  console.log('Receive Channel Callback');
  receiveChannel = event.channel;
  receiveChannel.onmessage = onReceiveMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
  receiveChannel.onclose = onReceiveChannelStateChange;
}

function onReceiveMessageCallback(event) {
  console.log('Received Message');
  dataChannelReceive.value = event.data;
}

function onSendChannelStateChange() {
  var readyState = sendChannel.readyState;
  console.log('Send channel state is: ' + readyState);
  if (readyState == 'open') {
    dataChannelSend.disabled = false;
    dataChannelSend.focus();
    sendButton.disabled = false;
    closeButton.disabled = false;
  } else {
    dataChannelSend.disabled = true;
    sendButton.disabled = true;
    closeButton.disabled = true;
  }
}

function onReceiveChannelStateChange() {
  var readyState = receiveChannel.readyState;
  console.log('Receive channel state is: ' + readyState);
}
