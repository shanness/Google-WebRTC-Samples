/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

var videoSelect = document.querySelector('select#videoSource');
var v = document.getElementById('videoSource');

function getScreens(){
  AdapterJS.WebRTCPlugin.callWhenPluginReady(function() {
   AdapterJS.WebRTCPlugin.plugin.getScreensharingSources(function(list){
    for (var i = 0; i !== list.length; i++) {
       var option = document.createElement('option');
      var  item = list[i];
      option.value = item.id || item.deviceId;
      option.text = item.label || 'camera ' + (videoSelect.length + 1);
      videoSelect.appendChild(option);
    }
   });
    });
}
var video = document.querySelector('video');
var constraints;

getScreens();
function start_(){

    var videoSource = v.options[v.selectedIndex].value? v.options[v.selectedIndex].value: "";
  constraints= window.constraints = {
    audio: false,
    video: {
      mediaSource: 'screen',
      mandatory: {
        maxWidth:1500,//,
      },
      optional: [
        {screenId:videoSource }
      ]
    }
  };

  if (typeof Promise === 'undefined') {
    navigator.getUserMedia(constraints, onSuccess, onFailure);
  } else {
    navigator.mediaDevices.getUserMedia(constraints)
    .then(onSuccess).catch(onFailure);
  }
}
// Put variables in global scope to make them available to the browser console.

var errorElement = document.querySelector('#errorMsg');

var onSuccess = function(stream) {
  var videoTracks = stream.getVideoTracks();
  console.log('Got stream with constraints:', constraints);
  console.log('Using video device: ' + videoTracks[0].label);
  stream.onended = function() {
    console.log('Stream ended');
  };
  window.stream = stream; // make variable available to browser console
  video = attachMediaStream(video, stream); 
};

var onFailure = function(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    errorMsg('The resolution iix ==  px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg('getUserMedia error: ' + error.name, error);
};



function errorMsg(msg, error) {
  errorElement.innerHTML += '<p>' + msg + '</p>';
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}
