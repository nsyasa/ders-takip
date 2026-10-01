// FOY 10 - Bosluk doldurma: karanlikta donen isik
// ___1___ gibi numarali bosluklari doldur. Kodun geri kalani hazir.
#include <Wire.h>
#include <BH1750.h>
#include <Adafruit_NeoPixel.h>

const int PIXEL_PIN = 16;
const int PIXEL_SAYISI = 8;
const float KARANLIK_GIRIS = 80.0;  // bunun altina inince karanlik
const float KARANLIK_CIKIS = 120.0;  // bunun ustune cikinca aydinlik

BH1750 isikSensoru;
Adafruit_NeoPixel halka(PIXEL_SAYISI, PIXEL_PIN, NEO_GRB + NEO_KHZ800);
bool karanlik = false;
int sira = 0;  // yanan LED'in numarasi (0-7)
unsigned long sonAdim = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  halka.begin();
  halka.setBrightness(40);
  if (!isikSensoru.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x23, &Wire)) {
    Serial.println("HATA: BH1750 bulunamadi.");
    while (true) delay(100);
  }
}

void loop() {
  float lux = isikSensoru.readLightLevel();

  if (!karanlik && lux < ___1___) karanlik = true;  // karanliga gir
  if (karanlik && lux > ___2___) karanlik = ___3___;  // aydinliga don

  if (millis() - sonAdim >= 100) {  // her 100 ms'de bir adim
    sonAdim = millis();
    halka.clear();
    if (karanlik) {
      halka.setPixelColor(___4___, halka.Color(0, 0, 255));  // mavi ISIK
      sira = (sira + 1) % ___5___;  // sonraki LED
    } else {
      halka.fill(halka.Color(0, 255, 0));  // hepsi yesil
    }
    halka.show();
  }
}
