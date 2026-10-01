// FOY 12 - Kod 12.3: Merkez dugum (alici + OLED)
#include <WiFi.h>
#include <esp_now.h>
#include <esp_wifi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const int WIFI_KANAL = 1;
const unsigned long ZAMAN_ASIMI = 5000;  // ms: bu kadar paket gelmezse uyar

typedef struct {                         // gondericiyle AYNI olmali
  uint8_t dugumNo;
  uint32_t paketNo;
  float sicaklik;
  float basinc;
} SensorVerisi;

Adafruit_SSD1306 ekran(128, 64, &Wire, -1);
SensorVerisi gelen;                      // geri cagirma burayi doldurur
volatile bool yeniVeri = false;
portMUX_TYPE kilit = portMUX_INITIALIZER_UNLOCKED;

unsigned long sonPaketZamani = 0;
uint32_t sonPaketNo = 0;
uint32_t alinan = 0;
uint32_t kayip = 0;

// Paket gelince Wi-Fi tarafindan cagrilir: kisa tut, yalniz kopyala
void veriGeldi(const esp_now_recv_info_t *bilgi, const uint8_t *paket, int uzunluk) {
  if (uzunluk != sizeof(SensorVerisi)) return;   // boyut uymuyorsa alma
  portENTER_CRITICAL(&kilit);
  memcpy(&gelen, paket, sizeof(gelen));
  yeniVeri = true;
  portEXIT_CRITICAL(&kilit);
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  if (!ekran.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("HATA: OLED baslatilamadi.");
    while (true) delay(100);
  }
  ekran.setTextColor(SSD1306_WHITE);

  WiFi.mode(WIFI_STA);
  esp_wifi_set_channel(WIFI_KANAL, WIFI_SECOND_CHAN_NONE);
  if (esp_now_init() != ESP_OK) {
    Serial.println("HATA: ESP-NOW baslatilamadi.");
    while (true) delay(100);
  }
  esp_now_register_recv_cb(veriGeldi);
  Serial.println("Merkez hazir, paket bekleniyor.");
}

void loop() {
  if (yeniVeri) {
    SensorVerisi v;
    portENTER_CRITICAL(&kilit);          // kopyalarken araya paket girmesin
    v = gelen;
    yeniVeri = false;
    portEXIT_CRITICAL(&kilit);

    if (sonPaketNo != 0 && v.paketNo > sonPaketNo + 1) {
      kayip += v.paketNo - sonPaketNo - 1;          // atlanan numaralar
    }
    sonPaketNo = v.paketNo;
    alinan++;
    sonPaketZamani = millis();

    Serial.print("Dugum "); Serial.print(v.dugumNo);
    Serial.print("  paket "); Serial.print(v.paketNo);
    Serial.print("  T="); Serial.print(v.sicaklik, 1);
    Serial.print(" C  P="); Serial.print(v.basinc, 1);
    Serial.print(" hPa  kayip="); Serial.println(kayip);

    ekran.clearDisplay();
    ekran.setTextSize(1);
    ekran.setCursor(0, 0);
    ekran.print("Dugum ");  ekran.print(v.dugumNo);
    ekran.print("  #");     ekran.println(v.paketNo);
    ekran.setTextSize(2);
    ekran.setCursor(0, 14);
    ekran.print(v.sicaklik, 1);  ekran.println(" C");
    ekran.setTextSize(1);
    ekran.setCursor(0, 38);
    ekran.print(v.basinc, 1);    ekran.println(" hPa");
    ekran.print("Alinan "); ekran.print(alinan);
    ekran.print(" Kayip "); ekran.println(kayip);
    ekran.display();
  }

  if (alinan > 0 && millis() - sonPaketZamani > ZAMAN_ASIMI) {
    ekran.clearDisplay();
    ekran.setTextSize(2);
    ekran.setCursor(0, 20);
    ekran.println("BAGLANTI");
    ekran.println("YOK");
    ekran.display();
    delay(200);
  }
}
