#include <Servo.h>
const byte trigPini = 9, echoPini = 10, servoPini = 3;
const byte hazirlikUs = 2, tetiklemeUs = 10, gidisDonusSayisi = 2;
const byte kapaliAci = 60, acikAci = 120;
const unsigned int darbeAltUs = 1000, darbeUstUs = 2000;
const float acmaEsigiCm = 15, kapatmaMarjiCm = 5;
const float sesHiziCmUs = 0.0343, enAzCm = 2, enCokCm = 400;
const unsigned long zamanAsimiUs = 30000;
const unsigned long olcumAraligiMs = 100, acikTutmaMs = 2000;
Servo motor;
bool kapakAcik = false;
unsigned long sonOlcum = 0, sonYakin = 0;

float mesafeOlc() {
  digitalWrite(trigPini, LOW);
  delayMicroseconds(hazirlikUs);
  digitalWrite(trigPini, HIGH);
  delayMicroseconds(tetiklemeUs);
  digitalWrite(trigPini, LOW);
  unsigned long sureUs = pulseIn(echoPini, HIGH, zamanAsimiUs);
  float cm = sureUs * sesHiziCmUs / gidisDonusSayisi;
  if (sureUs == 0 || cm < enAzCm || cm > enCokCm) return -1;
  return cm;
}

void setup() {
  pinMode(trigPini, OUTPUT);
  pinMode(echoPini, INPUT);
  motor.attach(servoPini, darbeAltUs, darbeUstUs);
  motor.write(kapaliAci);
  Serial.begin(9600);
  sonOlcum = millis();
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - sonOlcum < olcumAraligiMs) return;
  sonOlcum = simdi;
  float cm = mesafeOlc();
  simdi = millis();
  if (cm < 0) {
    kapakAcik = false;
    Serial.println("Olcum yok; kapali komut");
  } else {
    if (cm < acmaEsigiCm) kapakAcik = true;
    if (kapakAcik && cm <= acmaEsigiCm + kapatmaMarjiCm) {
      sonYakin = simdi;
    } else if (kapakAcik && simdi - sonYakin >= acikTutmaMs) {
      kapakAcik = false;
    }
    Serial.print("cm: "); Serial.print(cm, 1);
    Serial.print(" Acik komut: "); Serial.println(kapakAcik);
  }
  if (kapakAcik) motor.write(acikAci);
  else motor.write(kapaliAci);
}
