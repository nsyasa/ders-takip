#include <Wire.h>
#include <hd44780.h>
#include <hd44780ioClass/hd44780_I2Cexp.h>
const byte trigPini = 9, echoPini = 10;
const byte hazirlikUs = 2, tetiklemeUs = 10;
const float sesHiziCmUs = 0.0343, enAzCm = 2, enCokCm = 400;
const unsigned long zamanAsimiUs = 30000, aralikMs = 500;
const byte sutun = 16, satir = 2;
hd44780_I2Cexp ekran;
bool ekranHazir = false;
unsigned long sonOlcum = 0;

float mesafeOlc() {
  digitalWrite(trigPini, LOW);
  delayMicroseconds(hazirlikUs);
  digitalWrite(trigPini, HIGH);
  delayMicroseconds(tetiklemeUs);
  digitalWrite(trigPini, LOW);
  unsigned long sureUs = pulseIn(echoPini, HIGH, zamanAsimiUs);
  float cm = sureUs * sesHiziCmUs / 2.0;
  if (sureUs == 0 || cm < enAzCm || cm > enCokCm) return -1;
  return cm;
}

void setup() {
  pinMode(trigPini, OUTPUT); pinMode(echoPini, INPUT);
  Serial.begin(9600);
  Wire.begin(); Wire.setWireTimeout(zamanAsimiUs, true);
  ekranHazir = ekran.begin(sutun, satir) == 0;
  if (!ekranHazir) Serial.println("LCD baslatma hatasi");
  sonOlcum = millis();
}

void loop() {
  if (!ekranHazir) return;
  unsigned long simdi = millis();
  if (simdi - sonOlcum < aralikMs) return;
  sonOlcum = simdi;
  float cm = mesafeOlc();
  if (ekran.clear() != 0) {
    ekranHazir = false;
    Serial.println("LCD iletisim hatasi");
    return;
  }
  ekran.setCursor(0, 0);
  if (cm < 0) {
    ekran.print("Olcum yok");
    Serial.println("Olcum yok");
  } else {
    ekran.print("Mesafe: "); ekran.print(cm, 1); ekran.print(" cm");
    Serial.print("cm: "); Serial.println(cm, 1);
  }
  ekran.setCursor(0, 1); ekran.print("Sinif deneyi");
}
