// FOY 4 - Hata Avcisi: Bu kodda bilerek birakilmis bir hata var!
#include <Wire.h>
#include <BH1750.h>

const int LED_PIN = 33;
const float KARANLIK_ESIGI = 100.0;
BH1750 isikSensoru;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  pinMode(LED_PIN, OUTPUT);
  if (!isikSensoru.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x23, &Wire)) {
    Serial.println("HATA: BH1750 bulunamadi.");
    while (true) delay(100);
  }
}

void loop() {
  float lux = isikSensoru.readLightLevel();
  if (lux > KARANLIK_ESIGI) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  Serial.println(lux);
  delay(500);
}
