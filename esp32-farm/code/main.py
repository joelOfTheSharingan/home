from flask import Flask, Response
import cv2
import numpy as np
import requests
import json
import threading
import os

app = Flask(__name__)
ESP32_URL = "http://192.168.1.102/capture"

# Global variables for streaming
latest_raw = None
latest_mask = None

def detection_engine():
    global latest_raw, latest_mask
    while True:
        try:
            response = requests.get(ESP32_URL, timeout=0.5)
            frame = cv2.imdecode(np.frombuffer(response.content, np.uint8), cv2.IMREAD_COLOR)
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            
            # Masks
            masks = [
                (cv2.inRange(hsv, (10, 120, 150), (35, 255, 255)), "yellow"),
                (cv2.inRange(hsv, (35, 50, 50), (50, 255, 255)), "lightgreen"),
                (cv2.inRange(hsv, (55, 50, 50), (80, 255, 255)), "darkgreen")
            ]
            
            visual = np.zeros_like(frame)
            detected = []
            
            for mask, name in masks:
                clean_mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
                visual[:,:,1] = cv2.bitwise_or(visual[:,:,1], clean_mask)
                contours, _ = cv2.findContours(clean_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                for cnt in contours:
                    if cv2.contourArea(cnt) > 200:
                        x, y, w, h = cv2.boundingRect(cnt)
                        cx, cy = x + w//2, y + h//2
                        detected.append({"cx": cx, "cy": cy, "health": name})
                        cv2.circle(visual, (cx, cy), 12, (255, 255, 255), -1)
                        cv2.putText(visual, name[0].upper(), (cx-5, cy+5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,0,0), 2)

            # JSON Logic
            height, width = frame.shape[:2]
            plants = [{"health": "missing"}] * 9
            mapping = [2, 1, 0, 5, 4, 3, 8, 7, 6]
            for p in detected:
                grid_index = min(8, (int(p["cy"] // (height/3)) * 3) + int(p["cx"] // (width/3)))
                plants[mapping[grid_index]] = {"health": p["health"]}
            
            with open("data.json", "w") as f: json.dump(plants, f)
            
            # Update global frames for streaming
            latest_raw, latest_mask = frame, visual
        except: continue

def gen(frame_type):
    while True:
        img = latest_raw if frame_type == 'raw' else latest_mask
        if img is not None:
            _, buffer = cv2.imencode('.jpg', img)
            yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

@app.route('/video_raw')
def video_raw(): return Response(gen('raw'), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video_mask')
def video_mask(): return Response(gen('mask'), mimetype='multipart/x-mixed-replace; boundary=frame')
from flask import jsonify

@app.route('/status')
def get_status():
    try:
        with open("data.json", "r") as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == "__main__":
    threading.Thread(target=detection_engine, daemon=True).start()
    app.run(host='0.0.0.0', port=5000)