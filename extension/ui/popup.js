import { sendToggle, connectWebSocket } from "../core/websocket.js";

document.addEventListener("DOMContentLoaded", () => {
    connectWebSocket();

    const toggle = document.getElementById("toggleGesture");

    toggle.addEventListener("change", (e) => {
        const enabled = e.target.checked;
        console.log("[trailMotion] Gesture toggle:", enabled);
        sendToggle(enabled);
    });
});
