// FOY 3 - Hata Avcisi: Bu kodda bilerek birakilmis bir hata var!
#include <Wire.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  if (!bmp.begin(0x76)) {
    Serial.println("HATA: BMP280 bulunamadi.");
    while (true) delay(100);
  }
}

void loop() {
  float basincHpa = bmp.readPressure();
  Serial.print("Basinc: ");
  Serial.print(basincHpa, 1);
  Serial.println(" hPa");
  delay(2000);
}
