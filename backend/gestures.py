def detect_gesture(results):
    if not results.multi_hand_landmarks:
        return "none"

    hand = results.multi_hand_landmarks[0]

    y_tip = hand.landmark[8].y   # Index finger tip
    y_base = hand.landmark[5].y  # Base of the index finger

    diff = y_base - y_tip

    if diff > 0.15:
        return "scroll_up"
    elif diff < -0.15:
        return "scroll_down"

    return "none"
