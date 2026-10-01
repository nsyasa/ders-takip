// FOY 12 - Kod 12.2: Sensor dugumu (gonderici)
#include <WiFi.h>
#include <esp_now.h>
#include <esp_wifi.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>

const int WIFI_KANAL = 1;
const int DUGUM_NO = 1;                  // bu dugumun numarasi
uint8_t merkezAdres[] = {0x24, 0x6F, 0x28, 0xAB, 0x4C, 0x90};  // Kod 12.1 ciktisini yapistir

typedef struct {                         // alicidakiyle AYNI olmali
  uint8_t dugumNo;
  uint32_t paketNo;
  float sicaklik;
  float basinc;
} SensorVerisi;

SensorVerisi veri;
Adafruit_BMP280 bmp;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  bool bulundu = bmp.begin(0x76);
  if (!bulundu) bulundu = bmp.begin(0x77);
  if (!bulundu) {
    Serial.println("HATA: BMP280 bulunamadi.");
    while (true) delay(100);
  }

  WiFi.mode(WIFI_STA);
  esp_wifi_set_channel(WIFI_KANAL, WIFI_SECOND_CHAN_NONE);
  if (esp_now_init() != ESP_OK) {
    Serial.println("HATA: ESP-NOW baslatilamadi.");
    while (true) delay(100);
  }

  esp_now_peer_info_t merkez = {};
  memcpy(merkez.peer_addr, merkezAdres, 6);
  merkez.channel = WIFI_KANAL;
  merkez.ifidx = WIFI_IF_STA;
  merkez.encrypt = false;
  if (esp_now_add_peer(&merkez) != ESP_OK) {
    Serial.println("HATA: Merkez eklenemedi. MAC adresini kontrol et.");
    while (true) delay(100);
  }
  veri.dugumNo = DUGUM_NO;
  veri.paketNo = 0;
}

void loop() {
  veri.paketNo++;
  veri.sicaklik = bmp.readTemperature();
  veri.basinc = bmp.readPressure() / 100.0;

  esp_err_t sonuc = esp_now_send(merkezAdres, (uint8_t*)&veri, sizeof(veri));
  Serial.print("Paket ");
  Serial.print(veri.paketNo);
  if (sonuc == ESP_OK) {
    Serial.println(" gonderim sirasina alindi.");
  } else {
    Serial.println(" GONDERILEMEDI.");
  }
  delay(2000);
}
