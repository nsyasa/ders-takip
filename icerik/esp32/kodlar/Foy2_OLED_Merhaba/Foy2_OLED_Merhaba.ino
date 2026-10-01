// FOY 2 - Kod 2.2: OLED'e ilk yazi
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const int OLED_ADRES = 0x3C;   // Kod 2.1'de buldugun adresi yaz

Adafruit_SSD1306 ekran(128, 64, &Wire, -1);   // genislik, yukseklik

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  if (!ekran.begin(SSD1306_SWITCHCAPVCC, OLED_ADRES)) {
    Serial.println("HATA: OLED baslatilamadi. R3 I2C Kontrol Rutini'ni uygula.");
    while (true) delay(100);
  }

  ekran.clearDisplay();                 // ekran bellegini temizle
  ekran.setTextColor(SSD1306_WHITE);

  ekran.setTextSize(1);
  ekran.setCursor(0, 0);
  ekran.println("ROBOT KULUBU");

  ekran.setTextSize(2);
  ekran.setCursor(0, 24);
  ekran.println("ESP32");

  ekran.display();                      // bellegi gercek ekrana gonder
  Serial.println("OLED hazir.");
}

void loop() {
}
