/*
 *  Copyright (c) 2014 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */
// variables in global scope so available to console
video = document.querySelector("video");
constraints = {audio: false, video: true};

function successCallback(stream){
  window.stream = stream; // stream available to console
  video = attachMediaStream(video, stream);
}

function errorCallback(error){
  console.log("navigator.getUserMedia error: ", error);
}

// window.onwebrtcready = function() {
	navigator.getUserMedia(constraints, successCallback, errorCallback);
// }
