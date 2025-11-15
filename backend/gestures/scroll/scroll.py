"""
Scroll Gesture
--------------
Uses the vertical movement of index-finger tip (landmark 8)
to generate scroll events.

Medium smoothness (balanced sensitivity).
"""

from collections import deque

class Gesture:
    def __init__(self):
        # store last N finger positions for smoothing
        self.history = deque(maxlen=5)

        # medium smoothness
        self.sensitivity = 45        # base scroll amount
        self.min_delta = 0.005       # minimum movement required
        self.smoothing_factor = 0.6  # exponential smoothing

        self.last_y = None
        self.smoothed_delta = 0

    def process(self, landmarks):
        """Return scroll event or None."""

        # No landmarks
        if landmarks is None or len(landmarks) < 9:
            self.last_y = None
            return None

        # Index finger tip = landmark 8
        _, y, _ = landmarks[8]

        if self.last_y is None:
            self.last_y = y
            return None

        # Raw movement
        delta = y - self.last_y

        # Medium smoothness smoothing
        self.smoothed_delta = (
            self.smoothing_factor * self.smoothed_delta +
            (1 - self.smoothing_factor) * delta
        )

        self.last_y = y

        # Ignore very tiny movements
        if abs(self.smoothed_delta) < self.min_delta:
            return None

        # Convert movement to scroll pixels
        amount = int(self.smoothed_delta * self.sensitivity * 100)

        if amount == 0:
            return None

        return {
            "event": "scroll",
            "data": {
                "amount": amount
            }
        }
