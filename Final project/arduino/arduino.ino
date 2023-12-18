#include <Servo.h>

Servo servoMotor;
const int photocellPin = A0;
int photocellValue = 0;

void setup() {
  servoMotor.attach(13);
  Serial.begin(9600);
  //pinMode(photocellPin, INPUT);
}

void loop() {
photocellValue = analogRead(photocellPin);

  // code reference: https://www.youtube.com/watch?v=yThUrgBkZ2o
  if (Serial.available() > 0) { 
    String  sensorValueString = Serial.readStringUntil('\n'); // reference: https://community.particle.io/t/serial-readstringuntil-n-v-r/62099

    // Make angles to integers
    int angle = sensorValueString.toInt();
    if (angle >= 30 && angle <= 100) {
      servoMotor.write(angle);

    Serial.println(angle);
      delay(500);  
    }
  }
}