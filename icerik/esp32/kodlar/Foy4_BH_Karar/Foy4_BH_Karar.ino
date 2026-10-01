// FOY 4 - Kod 4.2: Akilli gece lambasi
#include <Wire.h>
#include <BH1750.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const int LED_PIN = 33;               // Foy 0'daki LED + 330 ohm devresi
const float KARANLIK_ESIGI = 100.0;   // Etkinlik 2'de SEN belirle

BH1750 isikSensoru;
Adafruit_SSD1306 ekran(128, 64, &Wire, -1);

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  pinMode(LED_PIN, OUTPUT);

  if (!isikSensoru.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x23, &Wire)) {
    Serial.println("HATA: BH1750 bulunamadi.");
    while (true) delay(100);
  }
  if (!ekran.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("HATA: OLED baslatilamadi.");
    while (true) delay(100);
  }
  ekran.setTextColor(SSD1306_WHITE);
}

void loop() {
  float lux = isikSensoru.readLightLevel();

  ekran.clearDisplay();
  ekran.setTextSize(2);
  ekran.setCursor(0, 0);
  ekran.print(lux, 0);
  ekran.println(" lx");

  ekran.setCursor(0, 36);
  if (lux < KARANLIK_ESIGI) {
    ekran.println("KARANLIK");
    digitalWrite(LED_PIN, HIGH);      // gece lambasi yanar
  } else {
    ekran.println("AYDINLIK");
    digitalWrite(LED_PIN, LOW);
  }
  ekran.display();

  Serial.print(lux, 1);
  Serial.println(" lx");
  delay(500);
}
