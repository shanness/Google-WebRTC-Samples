// variables in global scope so available to console
video = document.querySelector("video");
playBtn = document.getElementById("play");
pauseBtn = document.getElementById("pause");
constraints = {audio: false, video: true};
onplayingCalls = 0;

playBtn.onclick = function() {
	video.play();
}

pauseBtn.onclick = function() {
	video.pause();
}

function successCallback(stream){
  window.stream = stream; // stream available to console
  video.onplaying = function() {
  	onplayingCalls++;
  }
  video = attachMediaStream(video, stream);
}

function errorCallback(error){
  console.log("navigator.getUserMedia error: ", error);
}

navigator.getUserMedia(constraints, successCallback, errorCallback);
