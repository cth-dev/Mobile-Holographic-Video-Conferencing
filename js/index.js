var outputStride = 16;
var segmentationThreshold = 0.5;
var localStream;
var localVideo = document.querySelector('#localVideo');
//var net;


// function segement() {
//     async function bodySegmentationFrame() {
//         console.log('1');
//         bodyPix.load().then(function (net) {
//             console.log('dllm');
//             return net.estimatePersonSegmentation(localVideo, outputStride, segmentationThreshold)
//         }).then(function (segmentation) {
//             console.log(segmentation);

//             // by setting maskBackground to false, the maskImage that is generated will be opaque where there is a person and transparent where there is a background.
//             const maskBackground = true;
//             //      var imageData = bodyPix.toMaskImageData(segmentation, maskBackground);
//             //      console.log(imageData);
//             //      canvas.width = imageData.width;
//             //      canvas.height = imageData.height;
//             //      ctx.putImageData((imageData), 0, 0);

//             const opacity = 1;
//             const flipHorizontal = true;
//             const maskBlurAmount = 0;
//             const mask = bodyPix.toMaskImageData(segmentation, maskBackground);
//             bodyPix.drawMask(
//                 canvas, localVideo, mask, opacity,
//                 maskBlurAmount, flipHorizontal);
//         });
//         requestAnimationFrame(bodySegmentationFrame);
//     }
//     bodySegmentationFrame();
// };
var net;
var canvas;
//S
function segment() {
    canvas = document.getElementById('segment');
    async function bodySegmentationFrame() {

        console.log('segmentationFrame');
        var segmentation = await net.estimatePersonSegmentation(localVideo, outputStride, segmentationThreshold);
        //console.log(segmentation);

        // by setting maskBackground to false, the maskImage that is generated will be opaque where there is a person and transparent where there is a background.
        const maskBackground = true;
        //      var imageData = bodyPix.toMaskImageData(segmentation, maskBackground);
        //      console.log(imageData);
        //      canvas.width = imageData.width;
        //      canvas.height = imageData.height;
        //      ctx.putImageData((imageData), 0, 0);

        const opacity = 1;
        const flipHorizontal = true;
        const maskBlurAmount = 0;
        const mask = bodyPix.toMaskImageData(segmentation, maskBackground);
        bodyPix.drawMask(canvas, localVideo, mask, opacity, maskBlurAmount, flipHorizontal);

        requestAnimationFrame(bodySegmentationFrame);
    }
    bodyPix.load()
        .then((net) => {
            this.net = net;
            console.log('model loaded');
            bodySegmentationFrame();
        })
        .catch((e)=>console.log("mode load error: "+e));
};
//Get camera
navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
    })
    .then(gotStream)
    .catch(function (e) {
        alert('getUserMedia() error: ' + e.name);
    });

function gotStream(stream) {
    //    console.log('Adding local stream.');
    //    localStream = stream;
    //    localVideo.srcObject = stream;
    //    console.log('got user media');
    setupCamera(stream)
        .then(segment)
        .catch((e)=>console.log("setupCam error: "+ e));
}

async function setupCamera(stream) {
    /*if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
    }*/

    const videoElement = document.getElementById('localVideo');

    //   stopExistingVideoCapture();

    //   const videoConstraints = await getConstraints(cameraLabel);

    //   const stream = await navigator.mediaDevices.getUserMedia({
    //     'audio': true,
    //     'video': videoConstraints
    //   });
    videoElement.srcObject = stream;

    return new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
            videoElement.width = videoElement.videoWidth;
            videoElement.height = videoElement.videoHeight;
            resolve(videoElement);
        };
    });
}