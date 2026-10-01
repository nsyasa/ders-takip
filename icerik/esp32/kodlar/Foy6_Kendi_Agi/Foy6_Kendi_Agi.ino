// FOY 6 - Kod 6.2: ESP32 kendi Wi-Fi agini kuruyor
#include <WiFi.h>

const int GRUP_NO = 1;                 // KENDI GRUP NUMARANI YAZ
const int KANAL = 1;                   // ogretmenin verdigi kanal: 1, 6 ya da 11
const char* PAROLA = "robot123";       // en az 8 karakter

void setup() {
  Serial.begin(115200);
  String agAdi = "ESP32-G" + String(GRUP_NO);

  WiFi.softAP(agAdi.c_str(), PAROLA, KANAL);

  Serial.print("Ag adi: ");
  Serial.println(agAdi);
  Serial.print("IP adresi: ");
  Serial.println(WiFi.softAPIP());
}

void loop() {
}
