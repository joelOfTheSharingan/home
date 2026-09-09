"""
=========================================================
JARVIS - Complete Home Assistant
=========================================================

VOICE
    Google Speech Recognition

AI
    Google Gemini

VOICE OUTPUT
    ElevenLabs

HARDWARE
    Arduino over USB Serial

ARDUINO COMMANDS
    SERVO_ON
    SERVO_OFF

    MOTOR_ON
    MOTOR_OFF

    LED1_ON
    LED1_OFF

    LED2_ON
    LED2_OFF

ARDUINO PORT
    /dev/cu.usbmodem33031

=========================================================
"""

import os
import re
import sys
import time
import tempfile

import speech_recognition as sr
import serial

from dotenv import load_dotenv

from google import genai

from elevenlabs.client import ElevenLabs
from elevenlabs.play import play


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# API KEYS
# =========================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")


if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY is missing.")
    print("Add it to your .env file.")
    sys.exit(1)


if not ELEVENLABS_API_KEY:
    print("ERROR: ELEVENLABS_API_KEY is missing.")
    print("Add it to your .env file.")
    sys.exit(1)


# =========================================================
# ARDUINO
# =========================================================

ARDUINO_PORT = "/dev/cu.usbmodem33031"

ARDUINO_BAUD = 9600


# =========================================================
# GEMINI
# =========================================================

gemini = genai.Client(
    api_key=GEMINI_API_KEY
)


# =========================================================
# ELEVENLABS
# =========================================================

elevenlabs = ElevenLabs(
    api_key=ELEVENLABS_API_KEY
)


# =========================================================
# ELEVENLABS VOICE
# =========================================================
#
# Change this to your preferred ElevenLabs voice ID.
#
# This is an example voice ID from the official SDK docs.
# =========================================================

VOICE_ID = os.getenv(
    "ELEVENLABS_VOICE_ID",
    "JBFqnCBsd6RMkjVDRZzb"
)


ELEVEN_MODEL = os.getenv(
    "ELEVENLABS_MODEL",
    "eleven_multilingual_v2"
)


# =========================================================
# SPEECH RECOGNIZER
# =========================================================

recognizer = sr.Recognizer()

recognizer.dynamic_energy_threshold = True

recognizer.pause_threshold = 0.8

recognizer.non_speaking_duration = 0.5


# =========================================================
# JARVIS PERSONALITY
# =========================================================

SYSTEM_PROMPT = """
You are JARVIS, a personal home AI assistant.

You are intelligent, calm, helpful and concise.

Speak naturally like a sophisticated home assistant.

You can control physical Arduino hardware.

AVAILABLE HARDWARE COMMANDS:

SERVO_ON
SERVO_OFF

MOTOR_ON
MOTOR_OFF

LED1_ON
LED1_OFF

LED2_ON
LED2_OFF

IMPORTANT:

The Python program detects the hardware command separately.

Do NOT invent hardware commands.

When the user asks to control hardware, respond naturally
with a short confirmation.

Examples:

User:
Turn on the first light.

Assistant:
Certainly. Turning on the first light.

User:
Turn off the fan.

Assistant:
Certainly. Turning off the fan.

User:
Open the servo.

Assistant:
Certainly. Activating the servo.

For normal questions, answer normally.

Keep responses relatively short because your response
will be converted into speech.
"""


# =========================================================
# HARDWARE COMMANDS
# =========================================================

COMMANDS = [

    "SERVO_ON",
    "SERVO_OFF",

    "MOTOR_ON",
    "MOTOR_OFF",

    "LED1_ON",
    "LED1_OFF",

    "LED2_ON",
    "LED2_OFF",

]


# =========================================================
# CONNECT TO ARDUINO
# =========================================================

def connect_arduino():

    print()
    print("Connecting to Arduino...")
    print("Port:", ARDUINO_PORT)

    try:

        arduino = serial.Serial(
            port=ARDUINO_PORT,
            baudrate=ARDUINO_BAUD,
            timeout=1
        )

        # Give Arduino time to reset after serial connection
        time.sleep(2)

        print("Arduino connected.")

        return arduino

    except serial.SerialException as error:

        print()
        print("Could not connect to Arduino.")
        print("Error:", error)
        print()
        print("Check:")
        print("1. Arduino is connected.")
        print("2. Correct USB port is being used.")
        print("3. Arduino Serial Monitor is closed.")
        print()

        return None


# =========================================================
# SEND COMMAND TO ARDUINO
# =========================================================

def send_to_arduino(arduino, command):

    if arduino is None:
        print("Arduino is not connected.")
        return False

    if command not in COMMANDS:
        print("Blocked unknown command:", command)
        return False

    try:

        message = command + "\n"

        arduino.write(
            message.encode("utf-8")
        )

        arduino.flush()

        print()
        print("ARDUINO <<<", command)

        return True

    except serial.SerialException as error:

        print("Arduino communication error:")
        print(error)

        return False


# =========================================================
# FIND HARDWARE COMMAND
# =========================================================

def find_command(text):

    """
    Looks for one of the eight hardware commands.

    It also understands natural language.

    Examples:

        "turn on the servo"
        -> SERVO_ON

        "turn off the fan"
        -> MOTOR_OFF

        "switch on light one"
        -> LED1_ON
    """

    text = text.lower().strip()

    # -----------------------------------------------------
    # Direct command names
    # -----------------------------------------------------

    upper_text = text.upper()

    for command in COMMANDS:

        if command in upper_text:

            return command


    # -----------------------------------------------------
    # SERVO
    # -----------------------------------------------------

    if "servo" in text:

        if any(word in text for word in [
            "off",
            "disable",
            "stop",
            "close",
            "deactivate"
        ]):

            return "SERVO_OFF"

        if any(word in text for word in [
            "on",
            "enable",
            "start",
            "open",
            "activate"
        ]):

            return "SERVO_ON"


    # -----------------------------------------------------
    # MOTOR / FAN
    # -----------------------------------------------------

    if any(word in text for word in [
        "motor",
        "fan"
    ]):

        if any(word in text for word in [
            "off",
            "disable",
            "stop",
            "close",
            "deactivate"
        ]):

            return "MOTOR_OFF"

        if any(word in text for word in [
            "on",
            "enable",
            "start",
            "open",
            "activate"
        ]):

            return "MOTOR_ON"


    # -----------------------------------------------------
    # LED 1
    # -----------------------------------------------------

    led1_words = [
        "led 1",
        "led1",
        "first led",
        "light 1",
        "light one",
        "first light"
    ]

    if any(word in text for word in led1_words):

        if any(word in text for word in [
            "off",
            "disable",
            "stop",
            "turn off",
            "switch off"
        ]):

            return "LED1_OFF"

        if any(word in text for word in [
            "on",
            "enable",
            "start",
            "turn on",
            "switch on"
        ]):

            return "LED1_ON"


    # -----------------------------------------------------
    # LED 2
    # -----------------------------------------------------

    led2_words = [
        "led 2",
        "led2",
        "second led",
        "light 2",
        "light two",
        "second light"
    ]

    if any(word in text for word in led2_words):

        if any(word in text for word in [
            "off",
            "disable",
            "stop",
            "turn off",
            "switch off"
        ]):

            return "LED2_OFF"

        if any(word in text for word in [
            "on",
            "enable",
            "start",
            "turn on",
            "switch on"
        ]):

            return "LED2_ON"


    return None


# =========================================================
# HUMAN FRIENDLY COMMAND RESPONSE
# =========================================================

def command_response(command):

    responses = {

        "SERVO_ON":
            "Certainly. Activating the servo.",

        "SERVO_OFF":
            "Certainly. Turning the servo off.",

        "MOTOR_ON":
            "Certainly. Turning the motor on.",

        "MOTOR_OFF":
            "Certainly. Turning the motor off.",

        "LED1_ON":
            "Certainly. Turning the first light on.",

        "LED1_OFF":
            "Certainly. Turning the first light off.",

        "LED2_ON":
            "Certainly. Turning the second light on.",

        "LED2_OFF":
            "Certainly. Turning the second light off."

    }

    return responses.get(
        command,
        "Command completed."
    )


# =========================================================
# GEMINI
# =========================================================

def ask_gemini(user_text):

    try:

        prompt = f"""
{SYSTEM_PROMPT}

USER:
{user_text}

JARVIS:
"""

        response = gemini.models.generate_content(
            model="gemini-3.7-flash",
            contents=prompt
        )

        answer = response.text.strip()

        if not answer:
            return "I am sorry, I did not receive a response."

        return answer

    except Exception as error:

        print()
        print("Gemini error:")
        print(error)

        return (
            "I am sorry, I am having trouble "
            "connecting to my AI system."
        )


# =========================================================
# ELEVENLABS TEXT TO SPEECH
# =========================================================

def speak(text):

    print()
    print("JARVIS:", text)

    try:

        audio = elevenlabs.text_to_speech.convert(

            text=text,

            voice_id=VOICE_ID,

            model_id=ELEVEN_MODEL,

            output_format="mp3_44100_128"

        )

        play(audio)

    except Exception as error:

        print()
        print("ElevenLabs error:")
        print(error)


# =========================================================
# LISTEN
# =========================================================

def listen():

    with sr.Microphone() as source:

        print()
        print("Listening...")

        try:

            # Quickly adapt to room noise
            recognizer.adjust_for_ambient_noise(
                source,
                duration=0.5
            )

            audio = recognizer.listen(
                source,
                timeout=8,
                phrase_time_limit=12
            )

        except sr.WaitTimeoutError:

            print("No speech detected.")

            return None

        except Exception as error:

            print("Microphone error:", error)

            return None


    # =====================================================
    # GOOGLE SPEECH RECOGNITION
    # =====================================================

    try:

        text = recognizer.recognize_google(
            audio
        )

        text = text.strip()

        if text:

            print()
            print("YOU:", text)

            return text

    except sr.UnknownValueError:

        print("Could not understand speech.")

    except sr.RequestError as error:

        print("Google Speech Recognition error:")
        print(error)

    except Exception as error:

        print("Speech recognition error:")
        print(error)


    return None


# =========================================================
# PROCESS USER REQUEST
# =========================================================

def process_request(
    user_text,
    arduino
):

    # -----------------------------------------------------
    # Check hardware command first
    # -----------------------------------------------------

    command = find_command(
        user_text
    )


    if command:

        success = send_to_arduino(
            arduino,
            command
        )

        if success:

            response = command_response(
                command
            )

        else:

            response = (
                "I understood the command, "
                "but I cannot communicate with "
                "the Arduino right now."
            )

        speak(response)

        return


    # -----------------------------------------------------
    # Normal AI conversation
    # -----------------------------------------------------

    response = ask_gemini(
        user_text
    )

    speak(response)


# =========================================================
# MAIN
# =========================================================

def main():

    print()
    print("=" * 55)
    print("              JARVIS")
    print("       COMPLETE HOME ASSISTANT")
    print("=" * 55)
    print()

    print("Speech     : Google Speech Recognition")
    print("AI         : Gemini")
    print("Voice      : ElevenLabs")
    print("Arduino    :", ARDUINO_PORT)
    print()

    arduino = connect_arduino()


    # -----------------------------------------------------
    # Start message
    # -----------------------------------------------------

    if arduino:

        speak(
            "Good evening. JARVIS is online. "
            "How may I assist you?"
        )

    else:

        speak(
            "JARVIS is online, but the Arduino "
            "hardware is currently unavailable."
        )


    # -----------------------------------------------------
    # Main loop
    # -----------------------------------------------------

    while True:

        try:

            user_text = listen()


            if not user_text:

                continue


            # -------------------------------------------------
            # Exit commands
            # -------------------------------------------------

            exit_words = [
                "shutdown jarvis",
                "shut down jarvis",
                "goodbye jarvis",
                "exit jarvis",
                "stop jarvis",
                "go to sleep"
            ]

            if any(
                phrase in user_text.lower()
                for phrase in exit_words
            ):

                speak(
                    "Understood. "
                    "JARVIS going offline."
                )

                break


            # -------------------------------------------------
            # Process request
            # -------------------------------------------------

            process_request(
                user_text,
                arduino
            )


        except KeyboardInterrupt:

            print()
            print("JARVIS stopped.")

            break


        except Exception as error:

            print()
            print("Unexpected error:")
            print(error)

            time.sleep(1)


    # =====================================================
    # CLEANUP
    # =====================================================

    if arduino:

        try:

            arduino.close()

            print(
                "Arduino connection closed."
            )

        except Exception:
            pass


# =========================================================
# START
# =========================================================

if __name__ == "__main__":

    main()