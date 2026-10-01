// FOY 11 - Kod 11.1: Sensor verisini agdan sunan ESP32
#include <Wire.h>
#include <WiFi.h>
#include <WebServer.h>
#include <Adafruit_BMP280.h>
#include <BH1750.h>
#include "sayfa.h"                     // Kod 11.2: panel sayfasi

const int GRUP_NO = 1;                 // KENDI GRUP NUMARANI YAZ
const int KANAL = 1;                   // ogretmenin verdigi kanal
const char* PAROLA = "robot123";

Adafruit_BMP280 bmp;
BH1750 isikSensoru;
WebServer sunucu(80);
bool bmpHazir = false;                 // sensorler bulundu mu?
bool isikHazir = false;

String sayiVeyaNull(bool hazir, float deger, int basamak) {
  if (!hazir || isnan(deger)) return "null";   // okunamadi
  return String(deger, basamak);
}

void veriGonder() {                    // /veri adresi
  float lux = isikSensoru.readLightLevel();           // hata olursa negatif
  String json = "{";
  json += "\"sicaklik\":" + sayiVeyaNull(bmpHazir, bmp.readTemperature(), 2) + ",";
  json += "\"basinc\":" + sayiVeyaNull(bmpHazir, bmp.readPressure() / 100.0, 2) + ",";
  json += "\"lux\":" + sayiVeyaNull(isikHazir && lux >= 0, lux, 1);
  json += "}";
  sunucu.send(200, "application/json", json);
}

void anaSayfa() {                      // / adresi
  sunucu.send(200, "text/html; charset=utf-8", SAYFA);
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  bmpHazir = bmp.begin(0x76);
  if (!bmpHazir) bmpHazir = bmp.begin(0x77);
  if (!bmpHazir) Serial.println("UYARI: BMP280 bulunamadi; panelde 'hata' gorunecek.");
  isikHazir = isikSensoru.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x23, &Wire);
  if (!isikHazir) Serial.println("UYARI: BH1750 bulunamadi; panelde 'hata' gorunecek.");

  String agAdi = "ESP32-G" + String(GRUP_NO);
  WiFi.softAP(agAdi.c_str(), PAROLA, KANAL);
  Serial.print(agAdi);
  Serial.print("  IP: ");
  Serial.println(WiFi.softAPIP());

  sunucu.on("/", anaSayfa);
  sunucu.on("/veri", veriGonder);
  sunucu.begin();
}

void loop() {
  sunucu.handleClient();
}
