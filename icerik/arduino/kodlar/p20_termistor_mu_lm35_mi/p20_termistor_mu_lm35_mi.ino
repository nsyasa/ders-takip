#include <math.h>
const byte ntcPini = A0;
const byte lm35Pini = A1;
const float seriR = 10000;
const float referansR = 10000; // örnek; veri sayfasından doğrula
const float beta = 3950; // örnek; veri sayfasından doğrula
const float referansK = 298.15;
const float adcReferansi = 5.0;
const unsigned long aralikMs = 1000;
unsigned long sonOkuma = 0;

float ntcSicaklik(int ham) {
  if (ham <= 0 || ham >= 1023) return NAN;
  float r = seriR * (1023.0 / ham - 1.0);
  float tersK = 1.0 / referansK + log(r / referansR) / beta;
  if (tersK <= 0) return NAN;
  return 1.0 / tersK - 273.15;
}

void setup() {
  Serial.begin(9600);
  sonOkuma = millis();
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - sonOkuma < aralikMs) return;
  sonOkuma = simdi;
  int hamNtc = analogRead(ntcPini);
  int hamLm = analogRead(lm35Pini);
  float ntc = ntcSicaklik(hamNtc);
  float lm = hamLm * adcReferansi / 1023.0 * 100.0;
  Serial.print("Ham NTC: ");
  Serial.print(hamNtc);
  Serial.print(" Ham LM35: ");
  Serial.print(hamLm);
  if (isnan(ntc)) {
    Serial.print(" NTC okumasi gecersiz");
  } else {
    Serial.print(" NTC C: ");
    Serial.print(ntc, 1);
  }
  Serial.print(" LM35 C: ");
  Serial.println(lm, 1);
}
