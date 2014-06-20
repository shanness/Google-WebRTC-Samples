var chunkLength = 1000;
var arrayToStoreChunks = [];
var sendCounter = 0;
var typeList = [Int8Array,
                Uint8Array,
                Int16Array,
                Uint16Array,
                Int32Array,
                Uint32Array,
                Float32Array, 
                Float64Array];
var bufSize = 10;
var sendBuf = null;
var receiveBuf = null;

var localConnection, remotePeerConnection, sendChannel, receiveChannel, pcConstraint, dataConstraint;
// var dataChannelSend = document.querySelector('textarea#dataChannelSend');
// var dataChannelReceive = document.querySelector('textarea#dataChannelReceive');
var sctpSelect = document.querySelector('input#useSctp');
var rtpSelect = document.querySelector('input#useRtp');
var startButton = document.querySelector('button#startButton');
var sendButton = document.querySelector('button#sendButton');
var closeButton = document.querySelector('button#closeButton');
var resultsTable = document.querySelector('table#resultsTable');

startButton.onclick = createConnection;
sendButton.onclick = startSending;
closeButton.onclick = closeDataChannels;
rtpSelect.onclick = enableStartButton;
sctpSelect.onclick = enableStartButton;

ab2str = function(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf.buffer));
}

str2ab = function(str) {
  var buf = new ArrayBuffer(str.length); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }

  return buf;
}

function enableStartButton() {
  startButton.disabled = false;
}

function disableSendButton() {
  sendButton.disabled = true;
}

rtpSelect.onclick = sctpSelect.onclick = function() {
  // dataChannelReceive.value = '';
  // dataChannelSend.value = '';
  disableSendButton();
  enableStartButton();
};

function createConnection() {
  // dataChannelSend.placeholder = '';
  var servers = null;
  pcConstraint = null;
  dataConstraint = null;
  if (sctpSelect.checked &&
     (webrtcDetectedBrowser === 'chrome' && webrtcDetectedVersion >= 31) ||
      webrtcDetectedBrowser === 'firefox' || webrtcDetectedBrowser === 'Safari'){
    // SCTP is supported from Chrome M31 and is supported in FF.
    // No need to pass DTLS constraint as it is on by default in Chrome M31.
    // For SCTP, reliable and ordered is true by default.
    trace('Using SCTP based Data Channels');
  } else {
    pcConstraint = {optional: [{RtpDataChannels: true}]};
    if (!rtpSelect.checked) {
      // Use rtp data channels for chrome versions older than M31.
      trace('Using RTP based Data Channels,' +
            'as you are on an older version than M31.');
      alert('Reverting to RTP based data channels,' +
            'as you are on an older version than M31.');
      rtpSelect.checked = true;
    }
  }
  localConnection = new RTCPeerConnection(servers, pcConstraint);
  trace('Created local peer connection object localConnection');

  try {
    // Data Channel api supported from Chrome M25.
    // You might need to start chrome with  --enable-data-channels flag.
    sendChannel = localConnection.createDataChannel('sendDataChannel', dataConstraint);
    sendChannel.SetStrToAB(str2ab);
    sendChannel.SetABToStr(ab2str);
    trace('Created send data channel');
  } catch (e) {
    alert('Failed to create data channel. ' +
          'You need Chrome M25 or later with --enable-data-channels flag');
    trace('Create Data channel failed with exception: ' + e.message);
  }
  localConnection.onicecandidate = iceCallback1;
  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;

  remotePeerConnection = new RTCPeerConnection(servers, pcConstraint);
  trace('Created remote peer connection object remotePeerConnection');

  remotePeerConnection.onicecandidate = iceCallback2;
  remotePeerConnection.ondatachannel = receiveChannelCallback;

  localConnection.createOffer(gotDescription1, onCreateSessionDescriptionError);
  startButton.disabled = true;
  closeButton.disabled = false;
}

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function startSending() {
  // init values
  sendCounter = 0;

  // reset table
  while (resultsTable.children.length != 1)
    resultsTable.deleteRow(resultsTable.children.length - 1);

  // start testing process
  sendData();
}

function sendData() {
  // create a new buffer
  sendBuf = new typeList[sendCounter](bufSize);
  for (var i = 0; i < bufSize; i++) 
    sendBuf[i] = (Math.random() * 100);

  // log the value
  console.log('send: ');
  console.log(sendBuf);

  // send the buffer
  sendChannel.send(sendBuf);
}

function closeDataChannels() {
  trace('Closing data Channels');
  sendChannel.close();
  trace('Closed data channel with label: ' + sendChannel.label);
  receiveChannel.close();
  trace('Closed data channel with label: ' + receiveChannel.label);
  localConnection.close();
  remotePeerConnection.close();
  localConnection = null;
  remotePeerConnection = null;
  trace('Closed peer connections');
  startButton.disabled = false;
  sendButton.disabled = true;
  closeButton.disabled = true;
}

function gotDescription1(desc) {
  localConnection.setLocalDescription(desc);
  trace('Offer from localConnection \n' + desc.sdp);
  remotePeerConnection.setRemoteDescription(desc);
  remotePeerConnection.createAnswer(gotDescription2, onCreateSessionDescriptionError);
}

function gotDescription2(desc) {
  remotePeerConnection.setLocalDescription(desc);
  trace('Answer from remotePeerConnection \n' + desc.sdp);
  localConnection.setRemoteDescription(desc);
}

function iceCallback1(event) {
  trace('local ice callback');
  if (event.candidate) {
    remotePeerConnection.addIceCandidate(new RTCIceCandidate(event.candidate),
                        onAddIceCandidateSuccess, onAddIceCandidateError);
    trace('Local ICE candidate: \n' + event.candidate.candidate);
  }
}

function iceCallback2(event) {
  trace('remote ice callback');
  if (event.candidate) {
    localConnection.addIceCandidate(new RTCIceCandidate(event.candidate),
                        onAddIceCandidateSuccess, onAddIceCandidateError);
    trace('Remote ICE candidate: \n ' + event.candidate.candidate);
  }
}

function onAddIceCandidateSuccess() {
  trace('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
  trace('Failed to add Ice Candidate: ' + error.toString());
}

function receiveChannelCallback(event) {
  trace('Receive Channel Callback');
  receiveChannel = event.channel;
  receiveChannel.onmessage = onReceiveMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
  receiveChannel.onclose = onReceiveChannelStateChange;
  receiveChannel.SetStrToAB(str2ab);
  receiveChannel.SetABToStr(ab2str);
}

function onReceiveMessageCallback(event) {
  // parse received data
  receiveBuf = new typeList[sendCounter](event.data);
  console.log('received: ');
  console.log(receiveBuf);

  // populate result table
  var row = document.createElement("tr");

  typeCell = document.createElement("td");
  sentCell = document.createElement("td");
  receivedCell = document.createElement("td");
  validCell = document.createElement("td");

  text = document.createTextNode(typeList[sendCounter].name);
  typeCell.appendChild(text);

  text = document.createTextNode(makeStringWithBuffer(sendBuf));
  sentCell.appendChild(text);

  text = document.createTextNode(makeStringWithBuffer(receiveBuf));
  receivedCell.appendChild(text);

  var valid = compareBuffers(sendBuf, receiveBuf);
  text = document.createTextNode(valid);
  validCell.appendChild(text);  
  validCell.style.background = valid ? 'green' : 'red'

  row.appendChild(typeCell);
  row.appendChild(sentCell);
  row.appendChild(receivedCell);
  row.appendChild(validCell);

  resultsTable.appendChild(row);

  // start next sending
  sendCounter++;
  if (sendCounter < typeList.length)
    sendData();
}

// strigigies a bufferview
function makeStringWithBuffer(buffer) {
  var str = '[';
  for (var i = 0; i < buffer.length; i++) {
    str += buffer[i];
    str += ', ';
  }
  str = str.substring(0, str.length - 2); // remove last comma
  str += ']';

  return str;
}

// compares 2 bufferviews 
function compareBuffers(b1, b2) {
  if (b1.length != b2.length)
    return false;

  for (var i = 0; i < b1.length; i++)
    if (b1[i] != b2[i])
      return false;

  return true;
}

function onSendChannelStateChange() {
  var readyState = sendChannel.readyState;
  trace('Send channel state is: ' + readyState);
  if (readyState == 'open') {
    sendButton.disabled = false;
    closeButton.disabled = false;
  } else {
    sendButton.disabled = true;
    closeButton.disabled = true;
  }
}

function onReceiveChannelStateChange() {
  var readyState = receiveChannel.readyState;
  trace('Receive channel state is: ' + readyState);
}

function onReadAsDataURL(event, text) {
    var data = {}; // data object to transmit over data channel

    if (event) text = event.target.result; // on first invocation

    if (text.length > chunkLength) {
        data.message = text.slice(0, chunkLength); // getting chunk using predefined chunk length
    } else {
        data.message = text;
        data.last = true;
    }

    sendChannel.send(JSON.stringify(data)); // use JSON.stringify for chrome!

    var remainingDataURL = text.slice(data.message.length);
    if (remainingDataURL.length) setTimeout(function () {
        onReadAsDataURL(null, remainingDataURL); // continue transmitting
    }, 500)
}

function saveToDisk(fileUrl, fileName) {
    var save = document.createElement('a');
    save.href = fileUrl;
    save.target = '_blank';
    save.download = fileName || fileUrl;

    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

    save.dispatchEvent(evt);

    (window.URL || window.webkitURL).revokeObjectURL(save.href);
}



