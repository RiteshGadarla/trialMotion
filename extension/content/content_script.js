// extension/content/content_script.js

console.log("[trailMotion] content script loaded");

// Dispatcher: receives messages from background and routes them to gesture handlers
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || !msg.event) return;

    switch (msg.event) {
        case "scroll":
            // gestures/scroll.js provides global function handleScroll
            try {
                if (typeof handleScroll === "function") {
                    handleScroll(msg.data);
                } else {
                    console.warn("[trailMotion] handleScroll not found");
                }
            } catch (e) {
                console.error("[trailMotion] error in handleScroll:", e);
            }
            break;

        // Add other events here as needed (click, move, etc.)
        default:
            console.warn("[trailMotion] Unknown event:", msg.event);
    }
});
