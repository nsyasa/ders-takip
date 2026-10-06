#include <Servo.h>
Servo motor;
const byte servoPini = 9;
const byte ilkAci = 45;
const byte ortaAci = 90;
const byte sonAci = 110;
const unsigned int beklemeMs = 1000;

void setup() {
  motor.attach(servoPini);
  motor.write(ortaAci);
  delay(beklemeMs);
}

void loop() {
  motor.write(ilkAci);
  delay(beklemeMs);
  motor.write(ortaAci);
  delay(beklemeMs);
  motor.write(sonAci);
  delay(beklemeMs);
}
