// FOY 8 - Kod 8.2: Buzzer acikken ve kapaliyken tuketim
#include <Wire.h>
#include <Adafruit_INA219.h>

const int BUZZER_PIN = 33;
const int BUZZER_ACIK = HIGH;        // Foy 1'deki sonucuna gore
const int BUZZER_KAPALI = LOW;

Adafruit_INA219 ina219;

float ortalamaAkim() {               // 20 olcumun ortalamasi
  float toplam = 0;
  for (int i = 0; i < 20; i++) {
    toplam += ina219.getCurrent_mA();
    delay(10);
  }
  return toplam / 20;
}

void olcVeYaz(const char* durumAdi) {
  float v = ina219.getBusVoltage_V();
  float i = ortalamaAkim();
  Serial.print(durumAdi);
  Serial.print("  V = ");  Serial.print(v, 3);
  Serial.print(" V   I = "); Serial.print(i, 2);
  Serial.print(" mA   P = V x I = "); Serial.print(v * i, 1);
  Serial.println(" mW");
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, BUZZER_KAPALI);
  if (!ina219.begin()) {
    Serial.println("HATA: INA219 bulunamadi.");
    while (true) delay(100);
  }
  ina219.setCalibration_16V_400mA();
}

void loop() {
  digitalWrite(BUZZER_PIN, BUZZER_KAPALI);
  delay(1000);                       // degerler otursun
  olcVeYaz("KAPALI");
  delay(2000);

  digitalWrite(BUZZER_PIN, BUZZER_ACIK);
  delay(1000);
  olcVeYaz("ACIK  ");
  delay(2000);
}
