/*
*  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

'use strict';

/* globals MediaRecorder */

// This code is adapted from
// https://rawgit.com/Miguelao/demos/master/mediarecorder.html

'use strict';

/* globals MediaRecorder */

var mediaRecorder;
var recordedBlobs;

var gumVideo = document.querySelector('video#gum');
var recordedVideo = document.querySelector('video#recorded');

var recordButton = document.querySelector('button#record');
var playButton = document.querySelector('button#play');
var downloadButton = document.querySelector('button#download');
recordButton.onclick = toggleRecording;
playButton.onclick = play;
downloadButton.onclick = download;

var mediaSource2 = new MediaSource();
mediaSource2.addEventListener('sourceopen', handleSourceOpen2, false);
recordedVideo.src = window.URL.createObjectURL(mediaSource2);
  

// Use old-style gUM to avoid requirement to enable the
// Enable experimental Web Platform features flag in Chrome 49

var constraints = {
  audio: true,
  video: true
};

function handleSuccess(stream) {
  //GONconsole.log('getUserMedia() got stream: ', stream);
  window.stream = stream;
  if (window.URL) {
    gumVideo.src = window.URL.createObjectURL(stream);
  } else {
    gumVideo.src = stream;
  }
}

function handleError(error) {
  //GONconsole.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);

function handleSourceOpen2(event) {
  console.log('MediaSource opened');
  mediaSource2.addSourceBuffer('video/webm;codecs=vp8');
  //GONconsole.log('Source buffer: ', sourceBuffer);
}

recordedVideo.addEventListener('error', function(ev) {
  console.error('MediaRecording.recordedMedia.error()'+ recordedVideo.src+ " "+JSON.stringify(ev));
  
}, true);

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
    if ( mediaRecorder.state != 'inactive'){
      console.log("a punto de llamar");
      stopRecording();  
    }
    
  }
}

function handleStop(event) {
  //GONconsole.log('Recorder stopped: ', event);
  console.log("stop2");
  play(recordedBlobs); 
  //startRecording();
}

function toggleRecording() {
  if (recordButton.textContent === 'Start Recording') {
    startRecording();
  } else {
    //stopRecording();
    recordButton.textContent = 'Start Recording';
    playButton.disabled = false;
    downloadButton.disabled = false;
  }
}

// The nested try blocks will be simplified when Chrome 47 moves to Stable
function startRecording() {
  recordedBlobs = [];
  var options = {mimeType: 'video/webm;codecs=vorbis'};
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    //GONconsole.log(options.mimeType + ' is not Supported');
    options = {mimeType: 'video/webm;codecs=vp8'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      //GONconsole.log(options.mimeType + ' is not Supported');
      options = {mimeType: 'video/webm'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        //GONconsole.log(options.mimeType + ' is not Supported');
        options = {mimeType: ''};
      }
    }
  }
  console.log(options);
  try {
    mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder: ' + e);
    alert('Exception while creating MediaRecorder: '
      + e + '. mimeType: ' + options.mimeType);
    return;
  }
  //GONconsole.log('Created MediaRecorder', mediaRecorder, 'with options', options);
  recordButton.textContent = 'Stop Recording';
  playButton.disabled = true;
  downloadButton.disabled = true;
  mediaRecorder.onstop = handleStop;
  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start(1000); // collect 10ms of data
  //GONconsole.log('MediaRecorder started', mediaRecorder);
  console.log("start");
}

function stopRecording() {
  console.log("a punto de llamar stop");
  mediaRecorder.stop();
  //GONconsole.log('Recorded Blobs: ', recordedBlobs);
  console.log("stop");
}
var reader = new FileReader();
function play(aux) {
  
  //console.log(aux);
  //mediaSource.sourceBuffers[0].appendBuffer(new Uint8Array(aux));
  /*console.log(aux);
  var file = new Blob(aux, {type: 'video/webm;codecs=vp8'});
  console.log(file);
  
  reader.onload = function(e) {
    console.log(e.target.result);
    //mediaSource2.sourceBuffers[0].timestampOffset = 5000;
    //mediaSource2.sourceBuffers[0].appendBuffer(new Uint8Array(e.target.result));  
    recordedVideo.src = window.URL.createObjectURL(e.target);

  };
  reader.readAsArrayBuffer(file);
  */

  var superBuffer = new Blob(aux, {type: 'video/webm'});
  recordedVideo.src = window.URL.createObjectURL(superBuffer);
  console.log("play");
}

function download() {
  var blob = new Blob(recordedBlobs, {type: 'video/webm'});
  var url = window.URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'test.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}

