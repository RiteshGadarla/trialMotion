const video = document.getElementById('cam');
let running = false;
let stream = null;
let loopTimer = null;


// messages from background or popup
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'START_CAMERA') startCamera();
    if (msg.type === 'STOP_CAMERA') stopCamera();
});


async function startCamera() {
    if (running) return;
    running = true;


    try {
        stream = await navigator.mediaDevices.getUserMedia({video: {facingMode: 'user'}});
        video.srcObject = stream;
        await video.play();
        loopFrame();
    } catch (err) {
        console.error('Camera error:', err);
// inform background/popup
        chrome.runtime.sendMessage({type: 'CAMERA_ERROR', error: String(err)});
        running = false;
    }
}


function stopCamera() {
    running = false;
    if (loopTimer) {
        clearTimeout(loopTimer);
        loopTimer = null;
    }
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }


// inform background that camera closed
    chrome.runtime.sendMessage({type: 'CAMERA_CLOSED'});
}


async function loopFrame() {
    if (!running) return;
    try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');


// send frame to backend
        fetch('http://127.0.0.1:5001/gesture', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({frame: dataUrl})
        })
            .then(r => r.json())
            .then(res => {
                if (res && res.gesture && res.gesture !== 'none') {
                    chrome.runtime.sendMessage({type: 'GESTURE', gesture: res.gesture});
                }
            })
            .catch(err => {
                console.error('Backend fetch error:', err);
            });


    } catch (e) {
        console.error('loopFrame error', e);
    }


    loopTimer = setTimeout(loopFrame, 140);
}


// auto-start if background already asked (some timing cases)
setTimeout(() => {
    chrome.runtime.sendMessage({type: 'CAMERA_READY'});
});