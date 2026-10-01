// FOY 4 - Kod 4.1: Aydinlanma olcumu
#include <Wire.h>
#include <BH1750.h>

BH1750 isikSensoru;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  // Surekli, yuksek cozunurluklu olcum; adres 0x23
  if (!isikSensoru.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x23, &Wire)) {
    Serial.println("HATA: BH1750 bulunamadi. R3'u uygula (adres 0x5C olabilir).");
    while (true) delay(100);
  }
  Serial.println("BH1750 hazir.");
}

void loop() {
  float lux = isikSensoru.readLightLevel();

  Serial.print("Aydinlanma: ");
  Serial.print(lux, 1);
  Serial.println(" lx");

  delay(1000);
}
