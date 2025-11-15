"""
Main entry point for trailMotion backend.
Automatically fixes Python path so imports always work.
"""

import sys
import os
import asyncio

# Automatically add project root to PYTHONPATH
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from server.ws_server import start_ws_server
from core.state_manager import StateManager
from core.event_sender import EventSender
from core.gesture_loop import GestureLoop


async def main():
    print("[trailMotion] Backend starting...")

    state = StateManager()
    sender = EventSender()

    loop = GestureLoop(state, sender)
    gesture_task = asyncio.create_task(loop.start())

    start_ws_server(state, sender)

    await gesture_task


if __name__ == "__main__":
    asyncio.run(main())
