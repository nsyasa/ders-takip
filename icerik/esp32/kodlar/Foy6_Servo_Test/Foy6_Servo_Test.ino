// FOY 6 - Kod 6.1: Servo testi
#include <ESP32Servo.h>

const int SERVO_PIN = 25;
const int EN_KUCUK_ACI = 10;     // mekanik sinira dayanmamak icin
const int EN_BUYUK_ACI = 170;

Servo servo;

void setup() {
  Serial.begin(115200);
  servo.setPeriodHertz(50);              // her 20 ms'de bir darbe
  servo.attach(SERVO_PIN, 500, 2400);    // darbe genisligi: 500-2400 us
  servo.write(90);
  delay(1000);
}

void loop() {
  int acilar[] = {EN_KUCUK_ACI, 90, EN_BUYUK_ACI, 90};

  for (int i = 0; i < 4; i++) {
    Serial.print("Komut verilen aci: ");
    Serial.println(acilar[i]);
    servo.write(acilar[i]);
    delay(3000);                         // olcmek icin zaman
  }
}
