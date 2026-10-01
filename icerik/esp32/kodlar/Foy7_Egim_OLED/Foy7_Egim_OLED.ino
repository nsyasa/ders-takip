// FOY 7 - Kod 7.2: Elektronik su terazisi
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "mpu_yardimci.h"

Adafruit_SSD1306 ekran(128, 64, &Wire, -1);
const float DUZ_ESIGI = 10.0;     // derece: bu kadar egimi "duz" sayiyoruz

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  if (!mpuBaslat()) {
    Serial.println("HATA: MPU bulunamadi.");
    while (true) delay(100);
  }
  if (!ekran.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("HATA: OLED baslatilamadi.");
    while (true) delay(100);
  }
  ekran.setTextColor(SSD1306_WHITE);
}

void loop() {
  mpuVeriOku();
  float roll  = atan2(ay, az) * 180.0 / PI;                       // yana yatma
  float pitch = atan2(-ax, sqrt(ay * ay + az * az)) * 180.0 / PI; // one-arkaya

  ekran.clearDisplay();
  ekran.setTextSize(1);
  ekran.setCursor(0, 0);
  ekran.print("Roll : ");  ekran.println(roll, 1);
  ekran.print("Pitch: ");  ekran.println(pitch, 1);

  ekran.setTextSize(2);
  ekran.setCursor(0, 24);
  if (roll > DUZ_ESIGI) {
    ekran.println("SAGA");
  } else if (roll < -DUZ_ESIGI) {
    ekran.println("SOLA");
  } else {
    ekran.println("DUZ");
  }

  // su terazisi kabarcigi: roll -45..45 derece -> x = 4..123 piksel
  int x = map(constrain((int)roll, -45, 45), -45, 45, 4, 123);
  ekran.drawRect(0, 52, 128, 12, SSD1306_WHITE);
  ekran.fillCircle(x, 57, 4, SSD1306_WHITE);
  ekran.display();

  delay(100);
}
