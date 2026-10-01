// FOY 11 - Bosluk doldurma: kendi /veri adresimiz
// ___1___ gibi numarali bosluklari doldur. Kodun geri kalani hazir.
#include <Wire.h>
#include <WiFi.h>
#include <WebServer.h>
#include <BH1750.h>

const int GRUP_NO = 1;
const int KANAL = 1;
const char* PAROLA = "robot123";

BH1750 isikSensoru;
WebServer sunucu(80);

void veriGonder() {
  float lux = isikSensoru.readLightLevel();
  String json = "{";
  json += "\"lux\":" + String(lux, 1) + ___1___;  // iki alan arasina ne konur?
  json += "\"saniye\":" + String(millis() / ___2___);  // milisaniyeyi saniyeye cevir
  json += ___3___;  // JSON'u kapatan karakter
  sunucu.send(200, "___4___", json);  // icerik turu
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  isikSensoru.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x23, &Wire);

  String agAdi = "ESP32-G" + String(GRUP_NO);
  WiFi.softAP(agAdi.c_str(), PAROLA, KANAL);
  Serial.print(agAdi);
  Serial.print("  IP: ");
  Serial.println(WiFi.softAPIP());

  sunucu.on("/veri", ___5___);  // bu adrese hangi fonksiyon cevap versin?
  sunucu.begin();
}

void loop() {
  sunucu.___6___();  // gelen istekleri dinle
}
