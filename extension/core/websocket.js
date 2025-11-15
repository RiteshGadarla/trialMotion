// extension/core/websocket.js

let socket = null;
let eventCallback = null;

export function connectWebSocket() {
    if (socket) return;

    socket = new WebSocket("ws://127.0.0.1:8765");

    socket.onopen = () => {
        console.log("[trailMotion] WebSocket connected");
    };

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (eventCallback) eventCallback(msg);
    };

    socket.onclose = () => {
        console.log("[trailMotion] WebSocket closed. Reconnecting...");
        setTimeout(connectWebSocket, 1000);
    };
}

export function onBackendEvent(callback) {
    eventCallback = callback;
}

export function sendToggle(state) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({
        type: "toggle",
        state: state
    }));
}
