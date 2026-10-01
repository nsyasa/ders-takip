// FOY 9 - Hata Avcisi: Bu kodda bilerek birakilmis bir hata var!
#include <Wire.h>
#include <SPI.h>
#include <SD.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  if (!bmp.begin(0x76)) {
    Serial.println("HATA: BMP280 bulunamadi.");
    while (true) delay(100);
  }
  SPI.begin(18, 19, 23, 27);
  if (!SD.begin(27, SPI)) {
    Serial.println("HATA: MicroSD baslatilamadi.");
    while (true) delay(100);
  }
}

void loop() {
  File dosya = SD.open("/veri.csv", FILE_WRITE);
  if (dosya) {
    dosya.print(millis() / 1000);
    dosya.print(";");
    dosya.println(bmp.readTemperature(), 2);
    dosya.close();
  }
  delay(5000);
}
