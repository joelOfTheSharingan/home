// JARVIS Arduino Hardware Controller
// Commands received through Serial:
// SERVO_ON / SERVO_OFF
// MOTOR_ON / MOTOR_OFF
// LED1_ON / LED1_OFF
// LED2_ON / LED2_OFF

const int SERVO_PIN = 9;
const int MOTOR_PIN = 10;
const int LED1_PIN  = 8;
const int LED2_PIN  = 7;

void setup() {
  Serial.begin(9600);

  pinMode(SERVO_PIN, OUTPUT);
  pinMode(MOTOR_PIN, OUTPUT);
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);

  // Start everything OFF
  digitalWrite(SERVO_PIN, LOW);
  digitalWrite(MOTOR_PIN, LOW);
  digitalWrite(LED1_PIN, LOW);
  digitalWrite(LED2_PIN, LOW);

  Serial.println("JARVIS Arduino Ready");
}

void loop() {

  if (Serial.available() > 0) {

    String command = Serial.readStringUntil('\n');

    command.trim();

    if (command == "SERVO_ON") {
      digitalWrite(SERVO_PIN, HIGH);
      Serial.println("SERVO_ON");
    }

    else if (command == "SERVO_OFF") {
      digitalWrite(SERVO_PIN, LOW);
      Serial.println("SERVO_OFF");
    }

    else if (command == "MOTOR_ON") {
      digitalWrite(MOTOR_PIN, HIGH);
      Serial.println("MOTOR_ON");
    }

    else if (command == "MOTOR_OFF") {
      digitalWrite(MOTOR_PIN, LOW);
      Serial.println("MOTOR_OFF");
    }

    else if (command == "LED1_ON") {
      digitalWrite(LED1_PIN, HIGH);
      Serial.println("LED1_ON");
    }

    else if (command == "LED1_OFF") {
      digitalWrite(LED1_PIN, LOW);
      Serial.println("LED1_OFF");
    }

    else if (command == "LED2_ON") {
      digitalWrite(LED2_PIN, HIGH);
      Serial.println("LED2_ON");
    }

    else if (command == "LED2_OFF") {
      digitalWrite(LED2_PIN, LOW);
      Serial.println("LED2_OFF");
    }

    else {
      Serial.print("UNKNOWN_COMMAND: ");
      Serial.println(command);
    }
  }
}