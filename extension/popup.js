const toggleBtn = document.getElementById('toggleBtn');
const statusSpan = document.getElementById('status');


// Initialize UI from saved state
chrome.storage.local.get('gesture_on', ({gesture_on}) => {
    updateUI(!!gesture_on);
});


toggleBtn.onclick = async () => {
    const {gesture_on} = await chrome.storage.local.get('gesture_on');
    const newState = !gesture_on;


// save
    await chrome.storage.local.set({gesture_on: newState});


// inform background
    chrome.runtime.sendMessage({type: 'TOGGLE_GESTURE', state: newState});


    updateUI(newState);
};


function updateUI(isOn) {
    if (isOn) {
        toggleBtn.textContent = 'TURN OFF';
        toggleBtn.className = 'btn on';
        statusSpan.textContent = 'ON';
    } else {
        toggleBtn.textContent = 'TURN ON';
        toggleBtn.className = 'btn off';
        statusSpan.textContent = 'OFF';
    }
}