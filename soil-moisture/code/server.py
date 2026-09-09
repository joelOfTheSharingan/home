from flask import Flask, jsonify, send_from_directory
import serial
import threading
import time

app = Flask(__name__)

# ==============================
# SETTINGS
# ==============================

SERIAL_PORT = "/dev/cu.usbmodem11301"
BAUD_RATE = 9600
OFFLINE_TIMEOUT = 3

moisture = None
last_reading_time = 0

arduino = None


# ==============================
# STATUS LOGIC
# ==============================

def determine_status(value):
    if value < 80:
        return "TOO LOW"
    elif value <= 95:
        return "PERFECT WATER"
    else:
        return "TOO WET"


def determine_motor(value):
    if value < 80:
        return "ON"
    else:
        return "OFF"
# ==============================
# CONNECT TO ARDUINO
# ==============================

try:
    arduino = serial.Serial(
        SERIAL_PORT,
        BAUD_RATE,
        timeout=1
    )

    time.sleep(2)

    print("======================================")
    print("   AUTOMATED IRRIGATION SERVER")
    print("======================================")
    print()
    print("Arduino connected.")
    print("Port:", SERIAL_PORT)
    print()
    print("Python is monitoring Arduino.")
    print("Python does NOT control the hardware.")
    print()

except Exception as e:
    print("Arduino connection failed:")
    print(e)


# ==============================
# READ ARDUINO
# ==============================

def read_arduino():

    global moisture
    global last_reading_time

    while True:

        if arduino is None:
            time.sleep(1)
            continue

        try:

            line = arduino.readline().decode(
                "utf-8",
                errors="ignore"
            ).strip()

            if not line:
                continue

            try:
                value = int(line)
            except ValueError:
                continue

            value = max(0, min(100, value))

            moisture = value
            last_reading_time = time.time()

            status = determine_status(moisture)
            motor = determine_motor(moisture)

            print(
                f"Moisture: {moisture}% | "
                f"Status: {status} | "
                f"Motor: {motor}"
            )

        except Exception as e:

            print("Serial error:", e)
            time.sleep(1)


# Start Arduino reader
threading.Thread(
    target=read_arduino,
    daemon=True
).start()


# ==============================
# API
# ==============================

@app.route("/api/moisture")
def get_moisture():

    online = (
        moisture is not None
        and time.time() - last_reading_time <= OFFLINE_TIMEOUT
    )

    if not online:

        return jsonify({
            "arduino": False,
            "moisture": None,
            "status": "OFFLINE",
            "motor": "OFFLINE"
        })

    return jsonify({
        "arduino": True,
        "moisture": moisture,
        "status": determine_status(moisture),
        "motor": determine_motor(moisture)
    })


# ==============================
# WEBSITE
# ==============================

@app.route("/")
def index():
    return send_from_directory(".", "index.html")


# ==============================
# SERVER
# ==============================

if __name__ == "__main__":

    print("Open http://localhost:5001")

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=False
    )