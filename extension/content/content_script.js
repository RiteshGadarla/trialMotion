// extension/content/content_script.js

import { connectWebSocket, onBackendEvent } from "../core/websocket.js";
import { dispatchEvent } from "../core/dispatcher.js";

console.log("[trailMotion] content script initialized");

connectWebSocket();

onBackendEvent((msg) => {
    dispatchEvent(msg);
});
