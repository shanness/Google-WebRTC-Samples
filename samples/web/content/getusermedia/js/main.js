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

function WebRTCReadyCb() {
	navigator.getUserMedia(constraints, successCallback, errorCallback);
}
