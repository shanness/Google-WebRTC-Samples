/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
// variables in global scope so available to console
video = document.getElementById("video");
errorDiv = document.getElementById('errorDiv');
errorPrompt = document.getElementById('errorPrompt');
audioOnlyBtn = document.getElementById('audioOnly');
audioVideoBtn = document.getElementById('audioVideo');

audioOnlyStream = null;
audioVideoStream = null;


audioOnlyBtn.onclick = function() {
  var constraints = {audio: true, video: false};
  navigator.getUserMedia(constraints, audioOnlyCallback, errorCallback);
}

audioVideoBtn.onclick = function() {
  var constraints = {audio: true, video: true};
  navigator.getUserMedia(constraints, audioVideoCallback, errorCallback);
}

function audioVideoCallback(stream){
  if (audioOnlyStream) {
    audioOnlyStream.stop();
    audioOnlyStream = null;
  }

  audioVideoStream = stream; 
  video = attachMediaStream(video, audioVideoStream);
}

// constraints = {audio: false, video: true};

function audioOnlyCallback(stream){
  if (audioVideoStream) {
    audioVideoStream.stop();
    audioVideoStream = null;
  }

  audioOnlyStream = stream; 
  video = attachMediaStream(video, audioOnlyStream);
}

function errorCallback(error){
	errorPrompt.innerHTML = "navigator.getUserMedia error: " + error;
	errorDiv.hidden = false;
  console.log("navigator.getUserMedia error: ", error);
}

