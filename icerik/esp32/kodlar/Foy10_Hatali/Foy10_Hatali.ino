// FOY 10 - Hata Avcisi: Bu kodda bilerek birakilmis bir hata var!
#include <Wire.h>
#include <BH1750.h>
#include <Adafruit_BMP280.h>
#include <Adafruit_NeoPixel.h>

const int PIR_PIN = 32;
const int PIXEL_PIN = 16;
const int PIXEL_SAYISI = 8;           // 8 LED'li halka
const float KARANLIK_GIRIS = 80.0;    // lux bunun altina inerse KARANLIK
const float KARANLIK_CIKIS = 120.0;   // lux bunun ustune cikarsa AYDINLIK
const float SICAK_ESIGI = 28.0;       // santigrat derece

BH1750 isikSensoru;
Adafruit_BMP280 bmp;
Adafruit_NeoPixel halka(PIXEL_SAYISI, PIXEL_PIN, NEO_GRB + NEO_KHZ800);
bool karanlik = false;                // histerezis icin hatirlanan durum

void renkYak(int k, int y, int m) {
  halka.fill(halka.Color(k, y, m));        // 8 LED'in hepsi
  halka.show();
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  pinMode(PIR_PIN, INPUT);
  halka.begin();
  halka.setBrightness(40);

  if (!isikSensoru.begin(BH1750::CONTINUOUS_HIGH_RES_MODE, 0x23, &Wire)) {
    Serial.println("HATA: BH1750 bulunamadi.");
    while (true) delay(100);
  }
  bool bulundu = bmp.begin(0x76);
  if (!bulundu) bulundu = bmp.begin(0x77);
  if (!bulundu) {
    Serial.println("HATA: BMP280 bulunamadi.");
    while (true) delay(100);
  }
}

void loop() {
  float lux = isikSensoru.readLightLevel();
  float sicaklik = bmp.readTemperature();
  int hareket = digitalRead(PIR_PIN);

  // Histerezis: durum yalniz sinirlar asilinca degisir
  if (!karanlik && lux < KARANLIK_GIRIS) karanlik = true;
  if (karanlik && lux > KARANLIK_CIKIS) karanlik = false;

  // Oncelik: ilk dogru kosul kazanir
  const char* durumAdi;
  if (sicaklik > SICAK_ESIGI) {
    renkYak(255, 80, 0);   durumAdi = "SICAK";      // turuncu
  } else if (hareket == HIGH) {
    renkYak(255, 0, 0);    durumAdi = "ALARM";      // kirmizi
  } else if (karanlik) {
    renkYak(0, 0, 255);    durumAdi = "KARANLIK";   // mavi
  } else {
    renkYak(0, 255, 0);    durumAdi = "NORMAL";     // yesil
  }

  Serial.print(lux, 0);        Serial.print(" lx   ");
  Serial.print(sicaklik, 1);   Serial.print(" C   PIR=");
  Serial.print(hareket);       Serial.print("   -> ");
  Serial.println(durumAdi);
  delay(500);
}
