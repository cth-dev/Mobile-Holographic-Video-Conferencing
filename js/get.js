var outputStride = 16;
var segmentationThreshold = 0.5;
var localStream;
var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');
var remoteVideo2 = document.querySelector('#remoteVideo2');
var remoteVideo3 = document.querySelector('#remoteVideo3');
var net;
var canvas;
var maskBackground = true;
var opacity = 1;
var flipHorizontal = true;
var maskBlurAmount = 0;
var mobileNetArchitecture = (isMobile() ? 0.50 :0.75);
var pc;
var remoteStream;
var turnReady;
var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var urlParams = new URLSearchParams(window.location.search);
var roomOj;


var pcConfig = {
  'iceServers': [
    {urls: "stun:stun.l.google.com:19302"},
      {
    'urls': 'turn:numb.viagenie.ca',
    'credential':'',
    'username':''}]
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};

var type = "";


if (room == null|| room == undefined){
// Could  for room name:
  room = prompt('Enter room name:');
}

room = room + "Display";
  //type = prompt('Enter type:');
//Import socket.io
var socket = io.connect();

if (room !== '') {
  socket.emit('create or join', room);
  console.log('Attempted to create or  join room', room);
      $(document).ready(function () {
        $("#roomName").text("Room Name :" + room);
    });

}

 navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            })
            .catch(function (e) {
                alert('getUserMedia() error: ' + e.name);
            });


socket.on('receiveOffer', function (newroom) {
   
    role = "receiver";
    socket.emit('changeRoom', newroom.ownRoom);
    socket.emit('create or join', newroom.ownRoom);
    console.log('change room', newroom.ownRoom);
    isInitiator = false;
    roomOj = newroom;
    console.log(roomOj);
    socket.emit('readyToStrat', newroom);
       $(document).ready(function () {
        $("#name").text("get");
    });
    
//      sendMessage('got user media');
//        if (isInitiator) {
//            maybeStart();
//        }

});

socket.on('created', function(room) {
  console.log('Created room ' + room);
  isInitiator = true;
});

socket.on('full', function(room) {
  console.log('Room ' + room + ' is full');
});

socket.on('join', function (room){
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  isChannelReady = true;
});

socket.on('joined', function(room) {
  console.log('joined: ' + room);
  isChannelReady = true;
});

socket.on('log', function(array) {
  console.log.apply(console, array);
});

function sendMessage(message,roomOj) {
  console.log('Client sending message: ', message,roomOj);
  socket.emit('message', message,roomOj);
}



// This client receives a message
socket.on('message', function(message,roomOj) {
     console.log('roomOj:', roomOj);
  console.log('Client received message:', message);
  if (message === 'got user media') {
    maybeStart();
  } else if (message.type === 'offer') { //by the secord peer 
    if (!isInitiator && !isStarted) {
      maybeStart();
    }
    pc.setRemoteDescription(new RTCSessionDescription(message));
    doAnswer();
  } else if (message.type === 'answer' && isStarted) {
    
    pc.setRemoteDescription(new RTCSessionDescription(message));
      
  } else if (message.type === 'candidate' && isStarted) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.label,
      candidate: message.candidate
    });
    pc.addIceCandidate(candidate);
  } else if (message === 'bye' && isStarted) {
    handleRemoteHangup();
  }
});

socket.on('reload', function(){
  location.reload();
});
////////////////////////////////////////////////////
////////////////////////////////////////////////////
////////////////////////////////////////////////////
////////////////////////////////////////////////////



//Get camera

//navigator.getUserMedia = navigator.getUserMedia ||navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
//navigator.mediaDevices.getUserMedia({
//    audio: false,
//    video: false
//  }
//)
//  .then(gotStream)
//  .catch(function (e) {
//    alert('getUserMedia() error: ' + e.name);
//  });
   //console.log('Adding local stream.');
  //localStream = stream;
  //localVideo.srcObject = stream;
function w(){
  sendMessage('got user media');
  if (isInitiator) {
    maybeStart();
  }   
}

function gotStream(stream) {
//  console.log('Adding local stream.');
//  setupCamera(stream)
//    .then(segment)
//    .catch((e) => console.log("setupCam error: " + e));
    console.log('Adding local stream.');
  //localStream = stream;
  //localVideo.srcObject = stream;
  sendMessage('got user media',roomOj);
  if (isInitiator) {
    maybeStart();
  }
}
//Setup the video config
async function setupCamera(stream) {
  const videoElement = document.getElementById('localVideo');
    localStream = stream;
  //videoElement.srcObject = stream;
  sendMessage('got user media',roomOj);
  return new Promise((resolve) => {
    videoElement.onloadedmetadata = () => {
      videoElement.width = videoElement.videoWidth;
      videoElement.height = videoElement.videoHeight;
      resolve(videoElement);
    };
  });
}

async function setupCamera2(stream) {
    console.log('Remote stream added.');
    const videoElement2 = document.getElementById('remoteVideo');
  remoteStream = event.stream;
  videoElement2.srcObject = remoteStream;
  

  return new Promise((resolve) => {
    videoElement2.onloadedmetadata = () => {
      videoElement2.width = videoElement2.videoWidth;
      videoElement2.height = videoElement2.videoHeight;
      resolve(videoElement2);
    };
  });
}

var constraints = {
  video: true
};
//typeof localStream !== 'undefined' && 
function maybeStart() {
  console.log('>>>>>>> maybeStart() ', isStarted, localStream, isChannelReady);
  if (!isStarted && isChannelReady) {
    console.log('>>>>>> creating peer connection');
    createPeerConnection();
//    if(type != "1"){
//    pc.addStream(localStream);
//    }
    isStarted = true;
    console.log('isInitiator', isInitiator);
    if (isInitiator) {
      doCall();
    }
  }
}

window.onbeforeunload = function() {
  socket.leave(room);
};

function createPeerConnection() {
  try {
    pc = new RTCPeerConnection(pcConfig);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = handleRemoteStreamAdded;
    pc.onremovestream = handleRemoteStreamRemoved;
    
    console.log('Created RTCPeerConnnection');
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

function handleIceCandidate(event) {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    },roomOj);
  } else {
    console.log('End of candidates.');
  }
}

function handleCreateOfferError(event) {
  console.log('createOffer() error: ', event);
}

var optionsforoffer = {
    offerToReceiveAudio: false,
    offerToReceiveVideo: false
};

function doCall() {
  console.log('Sending offer to peer');
  pc.createOffer(setLocalAndSendMessage, handleCreateOfferError,optionsforoffer);
 
}

function doAnswer() {
  console.log('Sending answer to peer.');
  pc.createAnswer().then(
    setLocalAndSendMessage,
    onCreateSessionDescriptionError
  );
}

function setLocalAndSendMessage(sessionDescription) {
  pc.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription,roomOj);
}

function onCreateSessionDescriptionError(error) {
  trace('Failed to create session description: ' + error.toString());
}

function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
    setupCamera2(event.stream).then(segment2)
    .catch((e) => console.log("setupCam2 error: " + e));
//  remoteStream = event.stream;
//  remoteVideo.srcObject = remoteStream;
}

function handleRemoteStreamRemoved(event) {
  console.log('Remote stream removed. Event: ', event);
}

function hangup() {
  console.log('Hanging up.');
  stop();
  sendMessage('bye');
}

function handleRemoteHangup() {
  console.log('Session terminated.');
  stop();
  isInitiator = false;
}

function stop() {
  isStarted = false;
  pc.close();
  pc = null;
}

console.log('Getting user media with constraints', constraints);

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isiOS();
}

function start(){
if (room !== '') {
  socket.emit('create or join', room);
  console.log('Attempted to create or  join room', room);
   openc();
    socket.emit('resquest', room);
}
   else{
         room = prompt('Enter room name:');
       start();
   }     
}

//Segment function
function segment() {
  //load canvas
  canvas = document.getElementById('segment');
  //Load body pix model
  //then segment video
  bodyPix.load(mobileNetArchitecture)
    .then((net) => {
      this.net = net;
      console.log('model loaded');
      bodySegmentationFrame();
       if (isInitiator) {
           maybeStart();
        }
    })
    .catch((e) => {
      console.log("mode load error: " + e)
      return;
    });
  //Real time segmentation
  async function bodySegmentationFrame() {
    console.log('segmentationFrame');
    var segmentation = await net.estimatePersonSegmentation(localVideo, outputStride, segmentationThreshold);
    const mask = bodyPix.toMaskImageData(segmentation, maskBackground);
    //socket.emit('sendToServer', mask);
    bodyPix.drawMask(canvas, localVideo, mask, opacity, maskBlurAmount, flipHorizontal);
    requestAnimationFrame(bodySegmentationFrame);
  }
};

function segment2() {
  //load canvas
    canvas2 = document.getElementById('segment2');
    canvas3 = document.getElementById('segment3');
    canvas4 = document.getElementById('segment4');
    canvas5 = document.getElementById('segment5');
  //Load body pix model
  //then segment video
  bodyPix.load(mobileNetArchitecture)
    .then((net) => {
      this.net = net;
      console.log('model loaded');
      bodySegmentationFrame();
       if (isInitiator) {
           maybeStart();
        }
    })
    .catch((e) => {
      console.log("mode load error: " + e)
      return;
    });
  //Real time segmentation
  async function bodySegmentationFrame() {
    console.log('segmentationFrame');
    var segmentation = await net.estimatePersonSegmentation(remoteVideo, outputStride, segmentationThreshold);
    const mask = bodyPix.toMaskImageData(segmentation, maskBackground);
    //socket.emit('sendToServer', mask);
        bodyPix.drawMask(canvas2, remoteVideo, mask, opacity, maskBlurAmount, flipHorizontal);
        bodyPix.drawMask(canvas3, remoteVideo, mask, opacity, maskBlurAmount, flipHorizontal);
        bodyPix.drawMask(canvas4, remoteVideo, mask, opacity, maskBlurAmount, flipHorizontal);
        bodyPix.drawMask(canvas5, remoteVideo, mask, opacity, maskBlurAmount, flipHorizontal);
    requestAnimationFrame(bodySegmentationFrame);
  }
};
