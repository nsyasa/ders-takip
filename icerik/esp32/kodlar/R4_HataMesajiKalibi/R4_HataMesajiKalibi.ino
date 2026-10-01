#include <Wire.h>
void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  Wire.beginTransmission(0x76);
  if (Wire.endTransmission() != 0) {
    Serial.println("HATA: BMP280 bulunamadi. I2C Kontrol Rutini'ni uygula.");
    while (true) delay(100);
  }
}
void loop() {}
