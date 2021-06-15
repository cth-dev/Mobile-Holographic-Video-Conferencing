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
var mobileNetArchitecture = (isMobile() ? 0.50 : 0.75);
var pc;
var currentdate;
var datetime;
var remoteStream;
var turnReady;
var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var isCuter = false;
var type = "";
//var room = '';
var optionsforoffer;
var role = "";
var ownDisplayRoom = "";
var peerDisplayRoom = "";
var roomOj;
var recorder;
var timer = new easytimer.Timer();
var pcConfig = {
    'iceServers': [
        {
            urls: "stun:stun.l.google.com:19302"
        }, {
            'urls': 'turns:numb.viagenie.ca',
            'credential': 'pct466655',
            'username': 'corsair123123@gmail.com'
        }]
};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
};




// Could  for room name:
//room = prompt('Enter room name:');
//type = prompt('Enter type:');
//Import socket.io
var socket = io.connect();

$(document).ready(function () {
    $("#roomName").text("Room Name :" + room);
});

ownDisplayRoom = room + "Display";
//socket.on('receiveOffer', function (newroom) {
//    //socket.leave(room);
//    //room = newroom;
//    role = "receiver";
//    socket.emit('create or join', newroom.ownRoom);
//    console.log('change room', newroom.ownRoom);
//    //socket.emit('readyToStrat', newroom.ownRoom);
//    //openc();
//   // socket.emit('resquest', newroom.ownRoom);
//    isInitiator = false;
//      sendMessage('got user media');
//        if (isInitiator) {
//            maybeStart();
//        }
//
//});


// $.ajax({
//     url: '/check',
//     method: 'POST',
//     datatype: 'json',
//       contentType: 'application/json; charset=UTF-8',
//     success: function (response) {

//         //  alert(response);

//         if (response.result == "yes") {
//             $("#lofm").html(`<h3>You had logined + user number : ${response.usernumber}</h3>` );
//             friendList();

//         } else {
//             $("#lofm").html(`<h1>Login Form</h1>
// 			<form action="login" method="POST">
// 				<input type="text" name="usernumber" placeholder="usernumber" value="1" required>
// 				<input type="password" name="password" placeholder="Password" value="1" required>
// 				<input type="submit">
// 			</form>`);
//         }
//     }

// });

function toggleFriendAndRecord (){
    console.log('gg');
    $("#offcanvas-close-1").click();
}
$("#btn-fl").click(function(){
    toggleFriendAndRecord();
    $("#div-record").hide();
    $("#div-friend").show();
});
$("#btn-cr").click(function(){
    toggleFriendAndRecord();
    $("#div-record").show();
    $("#div-friend").hide();
});


function friendList(){
    
$.ajax({
    url: '/friendList',
    method: 'POST',
    datatype: 'json',
      contentType: 'application/json; charset=UTF-8',
    success: function (response) {
        for(i = 0 ; i<response.length ; i++ ){
            var ableBtn = "";
            if(response[i].status!="online"){
                ableBtn = "disabled";
            }
    $("#friend-list").append(` <tr>
        <td>${response[i].user2}</td>
        <td>${response[i].status}</td>
        <td><button ${ableBtn} class="uk-button uk-button-primary" type='button' value='${response[i].user2}' onclick='connectSomeOne(this);' >connect</button></td>
    </tr>`);
        }
    }
});
}
function callRecord(){
    
    $.ajax({
        url: '/callRecord',
        method: 'POST',
        datatype: 'json',
          contentType: 'application/json; charset=UTF-8',
        success: function (response) {
            for(i = 0 ; i<response.length ; i++ ){
                var friend_name = "";
                if(response[i].video_owner == room){
                    friend_name = response[i].video_peer;
                }else if(response[i].video_peer == room){
                    friend_name = response[i].video_owner;
                }else{
                    continue;
                }
                $("#record-list").append(` 
                <tr>
                    <td>${friend_name}</td>
                    <td>${response[i].video_length}</td>
                    <td>${response[i].video_record_timestamp_start}</td>
                    <td>
                        <form action="/viewVideo" method="post">
                            <button name="videoId" type="submit" class="uk-button uk-button-primary" type='button' value='${response[i].video_record_id}' >View</button>
                        </form>
                    </td>
                </tr>`);
            }
        }
    });
}

function connectSomeOne(peerRoom) {
    $(".callingPage").show();
    $("#calling-name").text(peerRoom.value);
    peerDisplayRoom = peerRoom.value + "Display";
    // openc();
    roomOj = {
        "ownRoom": room,
        "peerDisplayRoom": peerDisplayRoom,
        "peerRoom": peerRoom.value,
        "ownDisplayRoom": ownDisplayRoom
    };
    // socket.emit('connectSomeOne', { "ownRoom" : room,"peerDisplayRoom" : peerDisplayRoom,"peerRoom" : peerRoom.value,"ownDisplayRoom" : ownDisplayRoom});
    socket.emit('confirm', roomOj); //not finally 
    $(document).ready(function () {
        $("#status").text("status:waiting for response");
    });

}

if (room != '') {
    socket.emit('create or join', room);
    socket.emit('newUser', room);
    socket.emit('changeStatus', room);
    console.log('Attempted to create or  join room', room);
}

function start() {
    if (room !== '') {
        // socket.emit('create or join', room);
        //console.log('Attempted to create or  join room', room);
        openc();
        socket.emit('resquest', room);
    } else {
        room = prompt('Enter room name:');
        start();
    }
}


socket.on('created', function (room) {
    console.log('Created room ' + room);
    isInitiator = true;
});

socket.on('changeStatus', function (room) {
    
    var location = 2 ;
    
    $("#fdList").children("tr").children("td:nth-child(1)").each(function(){
    
        if($(this).text() == room){

            $("#fdList").children("tr").children("td:nth-child(1)").each(function(){

            if($(this).text() == room){
                return false;
            }

            else
                location +=3;

            });
              
        var td = "td:eq(" + location + ")";

        $("#fdList").children("tr").children(td).text("online");
        
        }
    
        else{
            
        return;
            
        }

    });
    
});


socket.on('resquestConnect', function (room) {


    call(room);

});

function call(room) {
    UIkit.modal.confirm(room.peerRoom + ' want to call you!!!').then(function () {
        socket.emit('accepted', room);
        $("#callingPage").show();
    }, function () {
        socket.emit('unAccepted', room);
    });
}

socket.on('unAcceptedConnect', function (room) {
    $(document).ready(function () {
        $("#callingPage").hide();
        $("#status").text("status:Peer rejected!");
    });
});


socket.on('acceptedConnect', function (room) {
    $(document).ready(function () {
        $("#status").text("status:Peer accepted!");
    });
});

socket.on('strats', function (room) {
    console.log('strats');
    currentdate = new Date();
    datetime =   currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    openc();
    socket.emit('peerStrat', room);
    $(document).ready(function () {
        $("#status").text("status:connected");
    });
    timer.start();
     

});

timer.addEventListener('secondsUpdated', function (e) {
    $('#basicUsage').html("time:" + timer.getTimeValues().toString());
});

socket.on('peerDisplay', function (room) {
    console.log('peer connect');
    var ownRoom = room.peerRoom;
    var ownDisplayRoom = room.peerDisplayRoom;
    var peerRoom = room.ownRoom;
    var peerDisplayRoom = room.ownDisplayRoom;
    var newroom = {
        "ownRoom": ownRoom,
        "peerDisplayRoom": peerDisplayRoom,
        "peerRoom": peerRoom,
        "ownDisplayRoom": ownDisplayRoom
    };
    console.log(newroom);
    roomOj = newroom;
    socket.emit('connectSomeOne', {
        "ownRoom": ownRoom,
        "peerDisplayRoom": peerDisplayRoom,
        "peerRoom": peerRoom,
        "ownDisplayRoom": ownDisplayRoom,
        "role": "peer"
    });
    $(document).ready(function () {
        $("#status").text("status:connecting");
    });
});


socket.on('full', function (room) {
    console.log('Room ' + room + ' is full');
});

socket.on('disconnect', function (room) {
    socket.emit('disconnect',room);
});

socket.on('cutline', function (room) {
    $("#callingPage").hide();
    stopRecording();
});


socket.on('join', function (room) {
    console.log('Another peer made a request to join room ' + room);
    console.log('This peer is the initiator of room ' + room + '!');
    isChannelReady = true;
});

socket.on('joined', function (room) {
    console.log('joined: ' + room);
    isChannelReady = true;
});

socket.on('log', function (array) {
    console.log.apply(console, array);
});



function sendMessage(message) {
    console.log('Client sending message: ', message);
    console.log('roomOj: ', roomOj);
    socket.emit('message', message, roomOj);
}



//socket.on('resquest', function(room) {
//    socket.emit('get', message);
//});

socket.on('receivce', function (peerroom) {
    $(document).ready(function () {
        $("#response").show();
    });

});

socket.on('newUser', function (room) {
    $(document).ready(function () {
        $("#pairList").append(` <tr>
        <td>${room.room}</td>
        <td><button type='button' value='${room.room}' onclick='connectSomeOne(this);' >connect</button></td>
    </tr>`);
    });

});



socket.on('role', function (roles) {
    $(document).ready(function () {
        $("#name").text(roles);
    });

    role = roles;


    if (role == 'receiver') {
        optionsforoffer = {
            offerToReceiveAudio: false,
            offerToReceiveVideo: false
        };
        isInitiator = false;
    } else {
        optionsforoffer = {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        };
    }


});

// This client receives a message
socket.on('message', function (message, roomOj) {
    console.log('roomOj:', roomOj);

    console.log('Client received message:', message);
    if (message === 'got user media') {
        maybeStart();
    } else if (message.type === 'offer') { //by the secord peer 
        if (!isInitiator && !isStarted) {
            console.log('!isInitiator && !isStarted');
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
function resquest() {

    socket.emit('resquest', room);

}


function openc() {
    console.log(role);
    if (role == "offer") {

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            })
            .then(function (stream) {
                recorder = RecordRTC(stream, {
                    type: 'video',
                    mimeType: 'video/webm;codecs=h264',
                    recorderType: MediaStreamRecorder
                });
                recorder.startRecording();


                //await sleep(3000);


                if (role != "receiver") {
                    localStream = stream;
                    localVideo.srcObject = stream;
                }
                sendMessage('got user media', roomOj);
                if (isInitiator) {
                    maybeStart();
                }
            })
            .catch(function (e) {
                alert('getUserMedia() error: ' + e.name);
            });
    } else {
        sendMessage('got user media');
        if (isInitiator) {
            maybeStart();
        }
    }



}

function gotStream(stream) {
    //  console.log('Adding local stream.');
    //  setupCamera(stream)
    //    .then(segment)
    //    .catch((e) => console.log("setupCam error: " + e));
    console.log('Adding local stream.');


    if (role != "receiver") {
        localStream = stream;
        localVideo.srcObject = stream;
    }
    sendMessage('got user media', roomOj);
    if (isInitiator) {
        maybeStart();
    }
}
//Setup the video config
async function setupCamera(stream) {
    const videoElement = document.getElementById('localVideo');
    localStream = stream;
    //videoElement.srcObject = stream;
    sendMessage('got user media');
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
    const videoElement3 = document.getElementById('remoteVideo3');
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
        if (role == "offer") {
            pc.addStream(localStream);
        }
        isStarted = true;
        console.log('isInitiator', isInitiator);
        if (isInitiator) {
            doCall();
        }
    }
}

window.onbeforeunload = function () {
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
        }, roomOj);
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
    pc.createOffer(setLocalAndSendMessage, handleCreateOfferError, optionsforoffer);

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
    sendMessage(sessionDescription, roomOj);
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
    //    canvas3 = document.getElementById('segment3');
    //    canvas4 = document.getElementById('segment4');
    //    canvas5 = document.getElementById('segment5');
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
        //        bodyPix.drawMask(canvas3, remoteVideo, mask, opacity, maskBlurAmount, flipHorizontal);
        //        bodyPix.drawMask(canvas4, remoteVideo, mask, opacity, maskBlurAmount, flipHorizontal);
        //        bodyPix.drawMask(canvas5, remoteVideo, mask, opacity, maskBlurAmount, flipHorizontal);
        requestAnimationFrame(bodySegmentationFrame);



       

    }
     $(document).ready(function () {
            $("#status").text("status:readyed");
        });
    
    


};

function genDisplayRoom() {
    window.open('get.html?room=' + room);
}

function recordRoom(){
     window.open('record.html');
}



function cutline() {
    $("#callingPage").hide();
    isCuter = true;
    stopRecording();
}

function stopRecording() {
    var fileName = getFileName();
    
    let recordDetail = {
        
        owner: roomOj.ownRoom,
        peer: roomOj.peerRoom,
        length: timer.getTimeValues().toString(),
        startTime: datetime,
        videoId: fileName
        
    }
    
    pc.close();
    timer.stop();
    
    if (isCuter)
        socket.emit('cutline', roomOj);
    
    
    

    recorder.stopRecording(function () {
        var blob = recorder.getBlob();
        
  
        // we need to upload "File" --- not "Blob"
        var fileObject = new File([blob], fileName+ ".webm" , {
            type: 'video/webm'
        });

        var formData = new FormData();

        // recorded data
        formData.append('video-blob', fileObject);

        // file name
        formData.append('video-filename', fileObject.name );


        var binaryData = bytesToSize(recorder.getBlob().size);
        
   
        
//        if(confirm("Do you want to upload video to server?")){
            
            $.ajax({
            url: '/upload',
            method: 'POST',
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            success: function (response) {

                if (response === 'success') {
                    alert('successfully upload video in /uploads');
                    socket.emit('uploadRecord', recordDetail);
                } else {
                    alert("error"); // error/failure
                }
            }
        });
            
//        }
//        else{
//            alert("ok!");
//            
//            
//        }

  

        //  invokeSaveAsDialog(blob);
    });
    
  localStream.getTracks().forEach(function(track) {
  track.stop();
});

}



function getFileName() {
    var d = new Date();
    var year = d.getUTCFullYear();
    var month = d.getUTCMonth();
    var date = d.getUTCDate();
    return 'RecordRTC-' + year + month + date + '-' + getRandomString() ;
}

function getRandomString() {
    if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
        var a = window.crypto.getRandomValues(new Uint32Array(3)),
            token = '';
        for (var i = 0, l = a.length; i < l; i++) {
            token += a[i].toString(36);
        }
        return token;
    } else {
        return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
    }
}
//run
friendList();
callRecord();