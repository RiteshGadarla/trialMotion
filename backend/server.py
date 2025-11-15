from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import cv2
import numpy as np
import mediapipe as mp
from gestures import detect_gesture

app = Flask(__name__)
CORS(app)

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    max_num_hands=1,
    model_complexity=1,
    min_detection_confidence=0.6,
    min_tracking_confidence=0.6
)

DEBUG = True  # toggle this anytime

@app.route("/gesture", methods=["POST"])
def gesture():
    data_url = request.json["frame"]

    # Decode base64 image
    img_bytes = base64.b64decode(data_url.split(",")[1])
    img_np = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

    # Process with MediaPipe
    results = hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    gesture = detect_gesture(results)

    # DRAW LANDMARKS (visual debug)
    if DEBUG:
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp.solutions.drawing_utils.draw_landmarks(
                    frame, hand_landmarks, mp_hands.HAND_CONNECTIONS
                )

        # Print debugging info
        print("------------------------")
        print("Frame received ✔")
        print("Hand detected:", bool(results.multi_hand_landmarks))
        print("Gesture:", gesture)



    return jsonify({"gesture": gesture})


if __name__ == "__main__":
    print("Debug mode ON — showing camera feed")
    app.run(host="127.0.0.1", port=5001)
