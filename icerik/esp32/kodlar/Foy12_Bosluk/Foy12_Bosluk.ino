// FOY 12 - Bosluk doldurma: paket kaybini sayan alici
// ___1___ gibi numarali bosluklari doldur. Kodun geri kalani hazir.
#include <WiFi.h>
#include <esp_now.h>
#include <esp_wifi.h>

const int WIFI_KANAL = 1;

typedef struct {  // gondericiyle AYNI olmali
  uint8_t dugumNo;
  uint32_t paketNo;
  float sicaklik;
  float basinc;
} SensorVerisi;

SensorVerisi gelen;
volatile bool yeniVeri = false;
uint32_t sonPaketNo = 0;
uint32_t kayip = 0;

void veriGeldi(const esp_now_recv_info_t *bilgi, const uint8_t *paket, int uzunluk) {
  if (uzunluk != ___1___) return;  // boyut uymuyorsa paketi alma
  memcpy(&gelen, paket, sizeof(gelen));
  yeniVeri = true;
}

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  esp_wifi_set_channel(WIFI_KANAL, WIFI_SECOND_CHAN_NONE);
  if (esp_now_init() != ___2___) {  // basarili baslatma sonucu
    Serial.println("HATA: ESP-NOW baslatilamadi.");
    while (true) delay(100);
  }
  esp_now_register_recv_cb(___3___);  // paket gelince cagrilacak fonksiyon
  Serial.println("Alici hazir.");
}

void loop() {
  if (yeniVeri) {
    yeniVeri = false;
    if (sonPaketNo != 0 && gelen.paketNo > sonPaketNo + ___4___) {
      kayip += gelen.paketNo - sonPaketNo - ___5___;  // atlanan paket sayisi
    }
    sonPaketNo = gelen.___6___;
    Serial.print("paket ");
    Serial.print(gelen.paketNo);
    Serial.print("  kayip ");
    Serial.println(kayip);
  }
}
