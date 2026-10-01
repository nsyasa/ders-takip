// FOY 2 - Kod 2.1: I2C tarayici
#include <Wire.h>

const int SDA_PIN = 21;
const int SCL_PIN = 22;

void setup() {
  Serial.begin(115200);
  Wire.begin(SDA_PIN, SCL_PIN);
  Serial.println("I2C taramasi basliyor...");
}

void loop() {
  int bulunan = 0;

  for (int adres = 1; adres < 127; adres++) {
    Wire.beginTransmission(adres);          // bu adresin "kapisini cal"
    int cevap = Wire.endTransmission();     // 0 = cihaz cevap verdi

    if (cevap == 0) {
      Serial.print("Cihaz bulundu: 0x");
      if (adres < 16) Serial.print("0");
      Serial.println(adres, HEX);
      bulunan++;
    }
  }

  Serial.print("Toplam cihaz: ");
  Serial.println(bulunan);
  Serial.println("--------------------");
  delay(3000);
}
