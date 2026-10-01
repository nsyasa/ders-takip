// FOY 3 - Kod 3.2: Mini hava istasyonu (OLED)
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_BMP280.h>

Adafruit_SSD1306 ekran(128, 64, &Wire, -1);
Adafruit_BMP280 bmp;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  if (!ekran.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("HATA: OLED baslatilamadi.");
    while (true) delay(100);
  }
  bool bulundu = bmp.begin(0x76);
  if (!bulundu) bulundu = bmp.begin(0x77);
  if (!bulundu) {
    Serial.println("HATA: BMP280 bulunamadi.");
    while (true) delay(100);
  }
  ekran.setTextColor(SSD1306_WHITE);
}

void loop() {
  float sicaklik = bmp.readTemperature();
  float basinc = bmp.readPressure() / 100.0;

  ekran.clearDisplay();
  ekran.setTextSize(1);
  ekran.setCursor(0, 0);
  ekran.println("MINI HAVA ISTASYONU");

  ekran.setTextSize(2);
  ekran.setCursor(0, 18);
  ekran.print(sicaklik, 1);
  ekran.println(" C");
  ekran.setCursor(0, 42);
  ekran.print(basinc, 0);
  ekran.println(" hPa");
  ekran.display();

  delay(2000);
}
