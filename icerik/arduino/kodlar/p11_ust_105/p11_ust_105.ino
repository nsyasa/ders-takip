#include <Servo.h>
Servo motor;
const byte potPini = A0;
const byte servoPini = 9;
const int adcAlt = 0;
const int adcUst = 1023;
const byte aciAlt = 45;
const byte aciUst = 105;
const byte ortaAci = 90;
const unsigned long haberlesmeHizi = 9600;
const byte beklemeMs = 50;

void setup() {
  motor.attach(servoPini);
  motor.write(ortaAci);
  Serial.begin(haberlesmeHizi);
}

void loop() {
  int okuma = analogRead(potPini);
  int aci = map(okuma, adcAlt, adcUst, aciAlt, aciUst);
  motor.write(aci);
  Serial.print(okuma);
  Serial.print(" -> ");
  Serial.print(aci);
  Serial.println(" derece komutu");
  delay(beklemeMs);
}
