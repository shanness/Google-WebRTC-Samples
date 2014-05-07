// variables in global scope so available to console
video = document.querySelector("video");
constraints = {audio: false, video: true};
// navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function successCallback(stream){
  window.stream = stream; // stream available to console
  // if (window.URL) {
  //   video.src = window.URL.createObjectURL(stream);
  // } else {
  //   video.src = stream;
  // }

  video = attachMediaStream(video, stream);
}

function errorCallback(error){
  console.log("navigator.getUserMedia error: ", error);
}

  function TemPluginLoaded() {
	navigator.getUserMedia(constraints, successCallback, errorCallback);
  }
