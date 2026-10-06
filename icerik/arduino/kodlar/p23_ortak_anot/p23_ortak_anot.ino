#include <math.h>
const byte segmentPinleri[7] = {2, 3, 4, 5, 6, 7, 8};
const byte trigPini = 9;
const byte echoPini = 10;
const byte hazirlikUs = 2;
const byte tetiklemeUs = 10;
const byte rakamSayisi = 10;
const byte ondalikBasamak = 1;
const unsigned long haberlesmeHizi = 9600;
const bool ortakAnot = true;
const int aralikCm = 10;
const float altCm = 2;
const float ustCm = 400;
const float sesCmUs = 0.0343;
const unsigned long aralikMs = 250;
const unsigned long zamanAsimiUs = 30000;
const byte hataDeseni = 0x79;
const byte sinirDeseni = 0x40;
const byte rakamlar[rakamSayisi] = {
  0x3F, 0x06, 0x5B, 0x4F, 0x66,
  0x6D, 0x7D, 0x07, 0x7F, 0x6F
};
unsigned long sonOkuma = 0;

void goster(byte desen) {
  for (byte sira = 0; sira < 7; sira++) {
    bool yan = (desen >> sira) & 1;
    digitalWrite(segmentPinleri[sira], yan != ortakAnot);
  }
}

float mesafeOlc() {
  digitalWrite(trigPini, LOW);
  delayMicroseconds(hazirlikUs);
  digitalWrite(trigPini, HIGH);
  delayMicroseconds(tetiklemeUs);
  digitalWrite(trigPini, LOW);
  unsigned long sureUs = pulseIn(echoPini, HIGH, zamanAsimiUs);
  if (sureUs == 0) return NAN;
  return sureUs * sesCmUs / 2; // 2: ses gider ve döner
}

void setup() {
  pinMode(trigPini, OUTPUT);
  pinMode(echoPini, INPUT);
  for (byte sira = 0; sira < 7; sira++) {
    digitalWrite(segmentPinleri[sira], ortakAnot);
    pinMode(segmentPinleri[sira], OUTPUT);
  }
  goster(0);
  Serial.begin(haberlesmeHizi);
  sonOkuma = millis();
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - sonOkuma < aralikMs) return;
  sonOkuma = simdi;
  float cm = mesafeOlc();
  if (isnan(cm) || cm < altCm || cm > ustCm) {
    goster(hataDeseni);
    Serial.println("Olcum yok / aralik disi");
  } else {
    Serial.print("Mesafe cm: ");
    Serial.println(cm, ondalikBasamak);
    if (cm >= rakamSayisi * aralikCm) goster(sinirDeseni);
    else goster(rakamlar[int(cm / aralikCm)]);
  }
}
