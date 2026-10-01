// FOY 2 - Kod 2.3: Canli sayac
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const int OLED_ADRES = 0x3C;
Adafruit_SSD1306 ekran(128, 64, &Wire, -1);

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  if (!ekran.begin(SSD1306_SWITCHCAPVCC, OLED_ADRES)) {
    Serial.println("HATA: OLED baslatilamadi. R3 I2C Kontrol Rutini'ni uygula.");
    while (true) delay(100);
  }
  ekran.setTextColor(SSD1306_WHITE);
}

void loop() {
  unsigned long saniye = millis() / 1000;

  ekran.clearDisplay();              // Deney: bu satirin basina // koy
  ekran.setTextSize(1);
  ekran.setCursor(0, 0);
  ekran.println("Acik kalma suresi");
  ekran.setTextSize(3);
  ekran.setCursor(0, 24);
  ekran.print(saniye);
  ekran.print(" s");
  ekran.display();

  delay(200);
}
