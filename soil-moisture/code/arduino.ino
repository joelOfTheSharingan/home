#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

// Pins
const int moisturePin = A0;
const int motorPin = 8;

const int bluePin  = 9;
const int greenPin = 10;
const int redPin   = 11;

void setup()
{
  Serial.begin(9600);

  // LCD
  lcd.init();
  lcd.backlight();

  // Motor / MOSFET
  pinMode(motorPin, OUTPUT);
  digitalWrite(motorPin, LOW);   // Motor OFF

  // RGB
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);

  digitalWrite(redPin, LOW);
  digitalWrite(greenPin, LOW);
  digitalWrite(bluePin, LOW);

  lcd.setCursor(0, 0);
  lcd.print("Soil Moisture");

  delay(1500);
  lcd.clear();
}

void rgbOff()
{
  digitalWrite(redPin, LOW);
  digitalWrite(greenPin, LOW);
  digitalWrite(bluePin, LOW);
}

void loop()
{
  int sensorValue = analogRead(moisturePin);

  // Calibration:
  // 1023 = 0% moisture (dry)
  // 300  = 100% moisture (wet)
  int moisture = map(sensorValue, 1023, 300, 0, 100);

  moisture = constrain(moisture, 0, 100);

  // LCD
  lcd.setCursor(0, 0);
  lcd.print("Moisture: ");
  lcd.print(moisture);
  lcd.print("%   ");

  rgbOff();

  // BELOW 40% = DRY
  if (moisture < 80)
  {
    digitalWrite(motorPin, HIGH);   // Motor ON
    digitalWrite(bluePin, HIGH);

    lcd.setCursor(0, 1);
    lcd.print("DRY - WATERING  ");

  }

  // 40% TO 60% = GOOD
  else if (moisture <= 95)
  {
    digitalWrite(motorPin, LOW);    // Motor OFF
    digitalWrite(greenPin, HIGH);

    lcd.setCursor(0, 1);
    lcd.print("GOOD - MOTOR OFF");

  }

  // ABOVE 60% = TOO WET
  else
  {
    digitalWrite(motorPin, LOW);    // Motor OFF
    digitalWrite(redPin, HIGH);

    lcd.setCursor(0, 1);
    lcd.print("TOO WET - OFF   ");
  }

  // Serial Monitor
  Serial.println(moisture);

  delay(500);
}