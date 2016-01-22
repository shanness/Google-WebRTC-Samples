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

constraints = {audio: false, video: true};

function successCallback(stream){
  window.stream = stream; // stream available to console
  video = attachMediaStream(video, stream);
}

function errorCallback(error){
	errorPrompt.innerHTML = "navigator.getUserMedia error: " + error;
	errorDiv.hidden = false;
  console.log("navigator.getUserMedia error: ", error);
}

AdapterJS.webRTCReady(function() {
  navigator.getUserMedia(constraints, successCallback, errorCallback);
});
