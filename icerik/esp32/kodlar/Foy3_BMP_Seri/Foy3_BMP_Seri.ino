// FOY 3 - Kod 3.1: Sicaklik ve basinc olcumu
#include <Wire.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  bool bulundu = bmp.begin(0x76);            // cogu modul 0x76 kullanir
  if (!bulundu) bulundu = bmp.begin(0x77);   // bazilari 0x77

  if (!bulundu) {
    Serial.println("HATA: BMP280 bulunamadi. R3'u uygula; cip farkli olabilir.");
    while (true) delay(100);
  }
  Serial.println("BMP280 hazir.");
}

void loop() {
  float sicaklik = bmp.readTemperature();    // santigrat derece
  float basincPa = bmp.readPressure();       // pascal (Pa)
  float basincHpa = basincPa / 100.0;        // 1 hPa = 100 Pa

  Serial.print("Sicaklik: ");
  Serial.print(sicaklik, 2);
  Serial.print(" C   Basinc: ");
  Serial.print(basincHpa, 2);
  Serial.println(" hPa");

  delay(2000);
}
