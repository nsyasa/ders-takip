// FOY 10 - Kod 10.1: Isik renklerini karistir (8 LED'li halka)
#include <Adafruit_NeoPixel.h>

const int PIXEL_PIN = 16;
const int PIXEL_SAYISI = 8;          // halkadaki LED sayisi
Adafruit_NeoPixel halka(PIXEL_SAYISI, PIXEL_PIN, NEO_GRB + NEO_KHZ800);

void renkGoster(const char* ad, int k, int y, int m) {
  Serial.print(ad);
  Serial.print("  (K=");  Serial.print(k);
  Serial.print(" Y=");    Serial.print(y);
  Serial.print(" M=");    Serial.print(m);
  Serial.println(")");
  halka.fill(halka.Color(k, y, m));   // kirmizi, yesil, mavi: 8 LED'in hepsi
  halka.show();
  delay(3000);
}

void setup() {
  Serial.begin(115200);
  halka.begin();
  halka.setBrightness(40);          // 0-255: goz ve akim icin dusuk tut
}

void loop() {
  renkGoster("1: Kirmizi", 255, 0, 0);
  renkGoster("2: Yesil", 0, 255, 0);
  renkGoster("3: Mavi", 0, 0, 255);
  renkGoster("4: Kirmizi + Yesil", 255, 255, 0);
  renkGoster("5: Yesil + Mavi", 0, 255, 255);
  renkGoster("6: Kirmizi + Mavi", 255, 0, 255);
  renkGoster("7: Uc renk birden", 255, 255, 255);
  renkGoster("8: Hepsi kapali", 0, 0, 0);
}
