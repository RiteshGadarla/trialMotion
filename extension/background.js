// [File: riteshgadarla/trialmotion/trialMotion-cde07a7aa645b5fe277c098ac2f402aa7dca47b5/extension/background.js]
let cameraWindowId = null;
let lastRealTabId = null;

// Track which tab the user is using
chrome.tabs.onActivated.addListener((activeInfo) => {

    // If this tab is in the camera window, DO NOT proceed.
    if (activeInfo.windowId === cameraWindowId && cameraWindowId !== null) {
        console.log("Ignoring activation for tab in camera window.");
        return;
    }

    // Get tab info
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (!tab) return;

        // Re-check window ID inside the callback
        if (tab.windowId === cameraWindowId && cameraWindowId !== null) {
            console.log("Ignoring activation for tab in camera window (checked in callback).");
            return;
        }

        // ===================================================================
        // == THIS IS THE KEY FIX ==
        // ===================================================================
        // Only track tabs we can actually scroll (http/https).
        // This ignores 'chrome-extension://', 'about:blank', 'chrome://', etc.
        if (!tab.url || (!tab.url.startsWith('http://') && !tab.url.startsWith('https://'))) {
            console.log("Ignoring tab with non-scrollable URL:", tab.url);
            return;
        }

        // If all checks pass, this is a real, scrollable tab.
        lastRealTabId = tab.id;
        console.log("Updated lastRealTabId =", lastRealTabId, "URL:", tab.url);
    });
});

// Camera window
function openCameraWindow() {
  if (cameraWindowId !== null) return;

  chrome.windows.create({
    url: chrome.runtime.getURL("camera.html"),
    type: "popup",
    focused: false, // Keep it from stealing focus
    width: 200,
    height: 160
  }, (win) => {
    cameraWindowId = win.id;

    // This sends a runtime message that camera.js is listening for
    setTimeout(() => {
      chrome.runtime.sendMessage({ type: "START_CAMERA" });
    }, 500); // Give the window time to create and load
  });
}

function closeCameraWindow() {
    if (cameraWindowId !== null) {
        try {
            chrome.windows.remove(cameraWindowId);
        } catch (e) {
            console.log("Window already closed.");
        }
        cameraWindowId = null;
    }
    // Send a message to all parts of the extension to stop
    chrome.runtime.sendMessage({type: "STOP_CAMERA"});
}


function applyGesture(gesture) {
    console.log("applyGesture called with:", gesture);
    console.log("Scrolling tab ID:", lastRealTabId);

    if (!lastRealTabId) {
        console.warn("NO REAL TAB TO SCROLL!");
        return;
    }

    chrome.scripting.executeScript({
        target: {tabId: lastRealTabId},
        args: [gesture],
        func: (gesture) => {
            // This function is injected into the *target tab*
            console.log("Injected gesture:", gesture);
            if (gesture === "scroll_up") window.scrollBy(0, -200);
            if (gesture === "scroll_down") window.scrollBy(0, 200);
        }
    }, (results) => {
        if (chrome.runtime.lastError) {
            console.error("Error executing script: " + chrome.runtime.lastError.message);
            // This might happen if the tab was closed. Let's try to find a new one.
            // Or it could be a permissions issue.
        }
    });
}

// ===================================================================
// == MAIN MESSAGE LISTENER ==
// ===================================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background received message:", message.type);

    if (message.type === 'TOGGLE_GESTURE') {
        // Message from popup.js
        if (message.state === true) {
            openCameraWindow();
        } else {
            closeCameraWindow();
        }
    } else if (message.type === 'GESTURE') {
        // Message from camera.js
        if (message.gesture !== 'none') {
            applyGesture(message.gesture);
        }
    } else if (message.type === 'CAMERA_READY') {
        // Message from camera.js
        console.log("Camera.js is ready.");
        // We already sent START_CAMERA in openCameraWindow
    } else if (message.type === 'CAMERA_CLOSED') {
        // Message from camera.js when its window is closed
        cameraWindowId = null;
        chrome.storage.local.set({gesture_on: false});
    } else if (message.type === 'CAMERA_ERROR') {
        // Log camera errors
        console.error("Camera Error:", message.error);
        closeCameraWindow();
        chrome.storage.local.set({gesture_on: false});
    }

    // Keep the message channel open for async responses if needed
    return true;
});

// Also, add a listener for when the camera window is closed by the user
chrome.windows.onRemoved.addListener((winId) => {
    if (winId === cameraWindowId) {
        console.log("Camera window closed by user.");
        cameraWindowId = null;
        // Tell popup to update its UI if it's open
        chrome.storage.local.set({gesture_on: false});
        chrome.runtime.sendMessage({type: "STOP_CAMERA"}); // Tell camera.js to stop
    }
});