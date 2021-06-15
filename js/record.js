var outputStride = 16;
var segmentationThreshold = 0.5;
var net;
var vid = document.getElementById("recordVideo"); 
var canvas;
var maskBackground = true;
var opacity = 1;
var flipHorizontal = true;
var maskBlurAmount = 0;
var videoId;
var videoList;
var urlParams = new URLSearchParams(window.location.search);
var mobileNetArchitecture = (isMobile() ? 0.50 : 0.75);
videoId = urlParams.get('id');

videoAdded();
//change(videoId);
change();
function playVid() { 
  vid.play(); 
} 

function pauseVid() { 
  vid.pause(); 
} 


function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

function isiOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobile() {
    return isAndroid() || isiOS();
}

async function setupVideo() {
    const remoteVideo = document.getElementById('recordVideo');
  //remoteStream = event.stream;
 // remoteVideo.srcObject = remoteVideo;
  

  return new Promise((resolve) => {
    remoteVideo.onloadedmetadata = () => {
      remoteVideo.width = remoteVideo.videoWidth;
      remoteVideo.height = remoteVideo.videoHeight;
      resolve(remoteVideo);
    };
  });
}


function videoAdded() {
  console.log('video added.');
    setupVideo().then(segment)
    .catch((e) => console.log("setup error: " + e));
}

function change() {
   //$("source").attr("src", "uploads/"+ src);
    $("video")[0].load();
    vid.pause(); 
}




//Segment function
function segment() {
  //load canvas
    canvas2 = document.getElementById('segment2');
    canvas3 = document.getElementById('segment3');
    canvas4 = document.getElementById('segment4');
    canvas5 = document.getElementById('segment');
  //Load body pix model
  //then segment video
  bodyPix.load(mobileNetArchitecture)
    .then((net) => {
      this.net = net;
      console.log('model loaded');
      bodySegmentationFrame();
      
    })
    .catch((e) => {
      console.log("mode load error: " + e)
      return;
    });
  //Real time segmentation
  async function bodySegmentationFrame() {
    console.log('segmentationFrame');
    var segmentation = await net.estimatePersonSegmentation(recordVideo, outputStride, segmentationThreshold);
    const mask = bodyPix.toMaskImageData(segmentation, maskBackground);
    //socket.emit('sendToServer', mask);
        bodyPix.drawMask(canvas2, recordVideo, mask, opacity, maskBlurAmount, flipHorizontal);
        bodyPix.drawMask(canvas3, recordVideo, mask, opacity, maskBlurAmount, flipHorizontal);
        bodyPix.drawMask(canvas4, recordVideo, mask, opacity, maskBlurAmount, flipHorizontal);
        bodyPix.drawMask(canvas5, recordVideo, mask, opacity, maskBlurAmount, flipHorizontal);
    requestAnimationFrame(bodySegmentationFrame);
  }
};