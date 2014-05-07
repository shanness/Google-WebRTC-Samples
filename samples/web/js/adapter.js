var RTCPeerConnection = null;
var getUserMedia = null;
var attachMediaStream = null;
var reattachMediaStream = null;
var webrtcDetectedBrowser = null;
var webrtcDetectedVersion = null;

function trace(text) {
  // This function is used for logging.
  if (text[text.length - 1] == '\n') {
    text = text.substring(0, text.length - 1);
  }
  console.log((performance.now() / 1000).toFixed(3) + ": " + text);
}
function maybeFixConfiguration(pcConfig) {
  if (pcConfig === null) {
    return;
  }
  for (var i = 0; i < pcConfig.iceServers.length; i++) {
    if (pcConfig.iceServers[i].hasOwnProperty('urls')){
      pcConfig.iceServers[i]['url'] = pcConfig.iceServers[i]['urls'];
      delete pcConfig.iceServers[i]['urls'];
    }
  }
}

var TemPageId = Math.random().toString(36).slice(2);
var TemPluginLoaded = null;

function plugin0()
{
  return document.getElementById('plugin0');
}
plugin = plugin0;


if (navigator.mozGetUserMedia) {
  console.log("This appears to be Firefox");

  webrtcDetectedBrowser = "firefox";

  webrtcDetectedVersion =
  parseInt(navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1], 10);

  // The RTCPeerConnection object.
  var RTCPeerConnection = function(pcConfig, pcConstraints) {
    // .urls is not supported in FF yet.
    maybeFixConfiguration(pcConfig);
    return new mozRTCPeerConnection(pcConfig, pcConstraints);
  }

  // The RTCSessionDescription object.
  RTCSessionDescription = mozRTCSessionDescription;

  // The RTCIceCandidate object.
  RTCIceCandidate = mozRTCIceCandidate;

  // Get UserMedia (only difference is the prefix).
  // Code from Adam Barth.
  getUserMedia = navigator.mozGetUserMedia.bind(navigator);
  navigator.getUserMedia = getUserMedia;

  // Creates iceServer from the url for FF.
  createIceServer = function(url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      // Create iceServer with stun url.
      iceServer = { 'url': url };
    } else if (url_parts[0].indexOf('turn') === 0) {
      if (webrtcDetectedVersion < 27) {
        // Create iceServer with turn url.
        // Ignore the transport parameter from TURN url for FF version <=27.
        var turn_url_parts = url.split("?");
        // Return null for createIceServer if transport=tcp.
        if (turn_url_parts.length === 1 ||
          turn_url_parts[1].indexOf('transport=udp') === 0) {
          iceServer = {'url': turn_url_parts[0],
        'credential': password,
        'username': username};
      }
    } else {
        // FF 27 and above supports transport parameters in TURN url,
        // So passing in the full url to create iceServer.
        iceServer = {'url': url,
        'credential': password,
        'username': username};
      }
    }
    return iceServer;
  };

  createIceServers = function(urls, username, password) {
    var iceServers = [];
    // Use .url for FireFox.
    for (i = 0; i < urls.length; i++) {
      var iceServer = createIceServer(urls[i],
        username,
        password);
      if (iceServer !== null) {
        iceServers.push(iceServer);
      }
    }
    return iceServers;
  }

  // Attach a media stream to an element.
  attachMediaStream = function(element, stream) {
    console.log("Attaching media stream");
    element.mozSrcObject = stream;
    element.play();

    return element;
  };

  reattachMediaStream = function(to, from) {
    console.log("Reattaching media stream");
    to.mozSrcObject = from.mozSrcObject;
    to.play();

    return to;
  };

  // Fake get{Video,Audio}Tracks
  if (!MediaStream.prototype.getVideoTracks) {
    MediaStream.prototype.getVideoTracks = function() {
      return [];
    };
  }

  if (!MediaStream.prototype.getAudioTracks) {
    MediaStream.prototype.getAudioTracks = function() {
      return [];
    };
  }
} else if (navigator.webkitGetUserMedia) {
  console.log("This appears to be Chrome");

  webrtcDetectedBrowser = "chrome";
  webrtcDetectedVersion =
  parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2], 10);

  // Creates iceServer from the url for Chrome M33 and earlier.
  createIceServer = function(url, username, password) {
    var iceServer = null;
    var url_parts = url.split(':');
    if (url_parts[0].indexOf('stun') === 0) {
      // Create iceServer with stun url.
      iceServer = { 'url': url };
    } else if (url_parts[0].indexOf('turn') === 0) {
      // Chrome M28 & above uses below TURN format.
      iceServer = {'url': url,
      'credential': password,
      'username': username};
    }
    return iceServer;
  };

  // Creates iceServers from the urls for Chrome M34 and above.
  createIceServers = function(urls, username, password) {
    var iceServers = [];
    if (webrtcDetectedVersion >= 34) {
      // .urls is supported since Chrome M34.
      iceServers = {'urls': urls,
      'credential': password,
      'username': username };
    } else {
      for (i = 0; i < urls.length; i++) {
        var iceServer = createIceServer(urls[i],
          username,
          password);
        if (iceServer !== null) {
          iceServers.push(iceServer);
        }
      }
    }
    return iceServers;
  };

  // The RTCPeerConnection object.
  var RTCPeerConnection = function(pcConfig, pcConstraints) {
    // .urls is supported since Chrome M34.
    if (webrtcDetectedVersion < 34) {
      maybeFixConfiguration(pcConfig);
    }
    return new webkitRTCPeerConnection(pcConfig, pcConstraints);
  }

  // Get UserMedia (only difference is the prefix).
  // Code from Adam Barth.
  getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
  navigator.getUserMedia = getUserMedia;

  // Attach a media stream to an element.
  attachMediaStream = function(element, stream) {
    if (typeof element.srcObject !== 'undefined') {
      element.srcObject = stream;
    } else if (typeof element.mozSrcObject !== 'undefined') {
      element.mozSrcObject = stream;
    } else if (typeof element.src !== 'undefined') {
      element.src = URL.createObjectURL(stream);
    } else {
      console.log('Error attaching stream to element.');
    }

    return element;
  };

  reattachMediaStream = function(to, from) {
    to.src = from.src;

    return to;
  };
} else if (navigator.userAgent.indexOf("Safari")) { ////////////////////////////////////////////////////////////////////////
  // Note: IE is detected as Safari...
  console.log("This appears to be either Safari or IE");
  webrtcDetectedBrowser = "Safari";

  // Browser identifying
  var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
  var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
  var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // At least Safari 3+: "[object HTMLElementConstructor]"
  var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
  var isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6


  function itemClicked() {
    console.log("everybody say Yeah Hey!!!");
  }

  function insistUserToDownloadPlugin() {
    // This function will be called if the plugin is needed (not on Chrome or Firefox)
    // but the plugin is not installed
    // Override it according to your application logic.
  }

  function isPluginInstalled(comName, plugName, callback) {
    if (isChrome || isSafari || isFirefox) {
      // Not IE (firefox, for example)
      var pluginArray = navigator.plugins;
      var installed = false;
      for (var i = 0; i < pluginArray.length; i++)
        if (pluginArray[i].name.indexOf(plugName) >= 0) {
          installed = true;
          break;
        }
        callback(installed);
      } else if (isIE) {
      // We're running IE
      try {
        new ActiveXObject(comName+"."+plugName);
      } catch(e) {
        callback(false);
        return;
      }
      callback(true);
    } else {
      // Unsupported
      return;
    }
  }


  function TemInitPlugin0() {
    console.log("plugin loaded");
    plugin().setPluginId(TemPageId, "plugin0");
    plugin().setLogFunction(console);
    if (TemPluginLoaded)
      TemPluginLoaded();
  }

  function DeInitPlugin() {
    var allElements = document.getElementsByTagName('*');
    for (var i = 0; i < allElements.length; i++) {
      if (allElements[i].isTemWebRTCPlugin 
        && allElements[i].isTemWebRTCPlugin()
        && allElements[i].id != "plugin0")
        allElements[i].parentNode.removeChild(allElements[i]);
    }
    plugin().deinitPlugin();
  }

  function isDefined(variable) {
    return variable != null && variable != undefined;
  }

  isPluginInstalled("Tem", "TemWebRTCPlugin", function(installed) { 
    if (installed) {
      createIceServer = function(url, username, password) {
        var iceServer = null;
        var url_parts = url.split(':');
        if (url_parts[0].indexOf('stun') === 0) {
            // Create iceServer with stun url.
            iceServer = { 'url': url, 'hasCredentials': false};
          } else if (url_parts[0].indexOf('turn') === 0) {
            iceServer = { 'url': url,
            'hasCredentials': true,
            'credential': password,
            'username': username };
          }
          return iceServer;
        };

      createIceServers = function(urls, username, password) {  
        var iceServers = new Array();
        for (var i = 0; i < urls.length; ++i) {
          iceServers.push(createIceServer(urls[i], username, password));
        }
        return iceServers;
      }

      // The RTCSessionDescription object.
      RTCSessionDescription = function(info) {
        return plugin().ConstructSessionDescription(info.type, info.sdp);
      }

      // PEER CONNECTION
      RTCPeerConnection = function(servers, constraints) {
        var iceServers = null;
        if (servers) {
          iceServers = servers.iceServers;
          for (var i = 0; i < iceServers.length; i++) {
            if (iceServers[i].urls && !iceServers[i].url)
              iceServers[i].url = iceServers[i].urls;
            iceServers[i].hasCredentials = isDefined(iceServers[i].username) && isDefined(iceServers[i].credential);
          }
        }
        var mandatory = (constraints && constraints.mandatory) ? constraints.mandatory : null;
        var optional = (constraints && constraints.optional) ? constraints.optional : null;
        return plugin().PeerConnection(TemPageId, iceServers, mandatory, optional);
      }

      MediaStreamTrack = {};
      MediaStreamTrack.getSources = function(callback) {
        plugin().GetSources(callback);
      };

      function getUserMedia_w(constraints, successCallback, failureCallback) {
        if (!constraints.audio)
          constraints.audio = false;

        plugin().getUserMedia(constraints, successCallback, failureCallback);
      };
      getUserMedia = getUserMedia_w;
      navigator.getUserMedia = getUserMedia;

      // Attach a media stream to an element.
      attachMediaStream = function(element, stream) {
        stream.enableSoundTracks(true);
        if (element.nodeName.toLowerCase() != "audio") {
          var elementId = element.id.length == 0 ? Math.random().toString(36).slice(2) : element.id;
          if (!element.isTemWebRTCPlugin || !element.isTemWebRTCPlugin()) {
            var frag = document.createDocumentFragment();
            var temp = document.createElement('div');
            var classHTML = element.className ? 'class="' + element.className + '" ' :  "";
            temp.innerHTML = '<object id="' + elementId + '" '
            + classHTML
            + 'type="application/x-temwebrtcplugin">'
            + '<param name="pluginId" value="' + elementId + '" /> '
            + '<param name="pageId" value="' + TemPageId + '" /> '
            + '<param name="streamId" value="' + stream.id + '" /> '
            + '</object>';
            while (temp.firstChild) {
              frag.appendChild(temp.firstChild);
            }

            var rectObject = element.getBoundingClientRect();
            element.parentNode.insertBefore(frag, element);
            frag = document.getElementById(elementId);
            frag.width = rectObject.width + "px"; 
            frag.height = rectObject.height + "px";
            element.parentNode.removeChild(element);

          } else {
            var children = element.children;
            for (var i = 0; i != children.length; ++i) {
              if (children[i].name == "streamId") {
                children[i].value = stream.id;
                break;
              }
            }
            element.setStreamId(stream.id);
          }

          var newElement = document.getElementById(elementId)
          newElement.onclick = element.onclick ? element.onclick : function(arg) {};
          newElement._TemOnClick = function(id) {
            var arg = {srcElement: document.getElementById(id)};
            newElement.onclick(arg);
          }
          return newElement;
        }
      };


      reattachMediaStream = function(to, from) {
        var stream = null;
        var children = from.children;
        for (var i = 0; i != children.length; ++i) {
          if (children[i].name == "streamId") {
            stream = plugin().getStreamWithId(TemPageId, children[i].value);
            break;
          }
        }

        if (stream != null) 
          return attachMediaStream(to, stream);
        else
          alert("Could not find the stream associated with this element");
      };

      RTCIceCandidate = function(candidate) {
        if (!candidate.sdpMid)
          candidate.sdpMid = "";
        return plugin().ConstructIceCandidate(candidate.sdpMid, candidate.sdpMLineIndex, candidate.candidate);
      };

    } else { // plugin not detected
      insistUserToDownloadPlugin();
    }
  });
} else {
  console.log("Browser does not appear to be WebRTC-capable");
}
