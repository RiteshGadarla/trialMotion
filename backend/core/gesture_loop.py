"""
GestureLoop
-----------
This module runs the main backend loop:
- Reads frames from Camera
- Gets landmarks via HandTracker
- Passes landmarks to GestureEngine
- Sends gesture events to extension
"""

import asyncio
import cv2

from core.camera import Camera
from core.hand_tracker import HandTracker
from core.gesture_engine import GestureEngine


class GestureLoop:
    def __init__(self, state_manager, event_sender):
        self.state = state_manager
        self.sender = event_sender

        self.camera = Camera()
        self.tracker = HandTracker()
        self.engine = GestureEngine()

        self.running = False

    async def start(self):
        """Start the real-time gesture loop."""
        print("[GestureLoop] Started")
        self.running = True

        while self.running:
            # Only process when ON
            if not self.state.is_active():
                await asyncio.sleep(0.05)
                continue

            frame = self.camera.read()
            if frame is None:
                continue

            landmarks = self.tracker.get_landmarks(frame)

            # if no hand found → skip
            if landmarks is None:
                await asyncio.sleep(0.01)
                continue

            # gesture processing
            result = self.engine.process(landmarks)

            if result:
                event_type = result.get("event")
                data = result.get("data", {})
                await self.sender.send(event_type, data)

            # Short sleep to reduce CPU load
            await asyncio.sleep(0.005)

    def stop(self):
        print("[GestureLoop] Stopping...")
        self.running = False
        self.camera.release()
