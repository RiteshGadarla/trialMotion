let cameraWindowId = null;
let lastRealTabId = null;

// Track which tab the user is using
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (!tab) return;

        // IGNORE EXTENSION PAGES
        if (tab.url.startsWith("chrome-extension://")) return;

        // IGNORE CAMERA WINDOW
        if (tab.url.includes("camera.html")) return;

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
    focused: false,
    width: 200,
    height: 160
  }, (win) => {
    cameraWindowId = win.id;

    // Prevent focusing camera window
    chrome.windows.update(win.id, { focused: false });

    setTimeout(() => {
      chrome.runtime.sendMessage({ type: "START_CAMERA" });
    }, 500);
  });
}

function closeCameraWindow() {
    if (cameraWindowId !== null) {
        chrome.windows.remove(cameraWindowId);
        cameraWindowId = null;
    }
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
            console.log("Injected gesture:", gesture);
            if (gesture === "scroll_up") window.scrollBy(0, -200);
            if (gesture === "scroll_down") window.scrollBy(0, 200);
        }
    });
}
