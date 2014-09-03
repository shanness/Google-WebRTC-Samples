var getMediaButton = document.querySelector('button#getMedia');
var createPeerConnectionButton = document.querySelector('button#createPeerConnection');
var createOfferButton = document.querySelector('button#createOffer');
var setOfferButton = document.querySelector('button#setOffer');
var createAnswerButton = document.querySelector('button#createAnswer');
var setAnswerButton = document.querySelector('button#setAnswer');
var getStatsButton = document.querySelector('button#getStats');
var hangupButton = document.querySelector('button#hangup');

getMediaButton.onclick = getMedia;
createPeerConnectionButton.onclick = createPeerConnection;
createOfferButton.onclick = createOffer;
setOfferButton.onclick = setOffer;
createAnswerButton.onclick = createAnswer;
setAnswerButton.onclick = setAnswer;
getStatsButton.onclick = getStats;
hangupButton.onclick = hangup;

var offerSdpTextarea = document.querySelector('div#local textarea');
var answerSdpTextarea = document.querySelector('div#remote textarea');

var audioSelect = document.querySelector('select#audioSrc');
var videoSelect = document.querySelector('select#videoSrc');

// audioSelect.onchange = videoSelect.onchange = getMedia;

var localVideo = document.querySelector('div#local video');
var remoteVideo = document.querySelector('div#remote video');

var selectSourceDiv = document.querySelector('div#selectSource');

var localPeerConnection, remotePeerConnection;
var localStream;
var sdpConstraints = {
  'mandatory': {
    'OfferToReceiveAudio': true,
    'OfferToReceiveVideo': true
  }
};

var bitrate = {
  value : null,
  bsnow : null,
  bsbefore : null,
  tsnow : null,
  tsbefore : null,
  timer : null
};


window.onwebrtcready = function() {
  getSources();
}

function getSources() {
  if (typeof MediaStreamTrack === 'undefined'){
    alert('This browser does not support MediaStreamTrack.\n\nTry Chrome Canary.');
  } else {
    MediaStreamTrack.getSources(gotSources);
    selectSourceDiv.classList.remove('hidden');
  }
}

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
  getMediaButton.disabled = true;
  createPeerConnectionButton.disabled = false;

  if (!!localStream) {
    localVideo.src = null;
    localStream.stop();
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

  console.log('Requested local stream');
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
  getStatsButton.disabled = false;
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

function gotDescription1(description) {
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
//  localStream.stop();
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
  remoteVideo = attachMediaStream(remoteVideo, e.stream);
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


function getStats() {
  remotePeerConnection.getStats(function(stats) {
    var results = stats.result();
    for(var i=0; i<results.length; i++) {
      var res = results[i];
      if(res.type == 'ssrc' && res.stat('googFrameHeightReceived')) {
        bitrate.bsnow = res.stat('bytesReceived');
        bitrate.tsnow = res.timestamp;
        if(bitrate.bsbefore === null || bitrate.tsbefore === null) { 
          // Skip this round 
          bitrate.bsbefore = bitrate.bsnow; 
          bitrate.tsbefore = bitrate.tsnow; 
        }
        else { 
          // Calculate bitrate 
          var bitRate = Math.round((bitrate.bsnow - bitrate.bsbefore) * 8 / (bitrate.tsnow - bitrate.tsbefore)); 
          bitrate.value = bitRate + ' kbits/sec'; //~ Janus.log("Estimated bitrate is " + config.bitrate.value); config.bitrate.bsbefore = config.bitrate.bsnow; config.bitrate.tsbefore = config.bitrate.tsnow; 
        }
      }
    }
  });
}
