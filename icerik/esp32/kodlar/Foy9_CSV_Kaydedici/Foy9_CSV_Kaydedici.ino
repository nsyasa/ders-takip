// FOY 9 - Kod 9.2: BMP280 veri kaydedici (CSV)
#include <Wire.h>
#include <SPI.h>
#include <SD.h>
#include <Adafruit_BMP280.h>

const int SD_CS = 27;
const unsigned long KAYIT_ARALIGI = 5000;   // ms (ornekleme araligi)

Adafruit_BMP280 bmp;
String dosyaAdi;
unsigned long sonKayit = 0;

void yeniDosyaAdiBul() {                    // veri_1.csv, veri_2.csv ...
  for (int i = 1; i < 1000; i++) {
    String ad = "/veri_" + String(i) + ".csv";
    if (!SD.exists(ad)) {
      dosyaAdi = ad;
      return;
    }
  }
}

String virgullu(float deger, int basamak) { // 23.8 -> 23,8 (Turkce Excel)
  String yazi = String(deger, basamak);
  yazi.replace(".", ",");
  return yazi;
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  bool bulundu = bmp.begin(0x76);
  if (!bulundu) bulundu = bmp.begin(0x77);
  if (!bulundu) {
    Serial.println("HATA: BMP280 bulunamadi.");
    while (true) delay(100);
  }
  SPI.begin(18, 19, 23, SD_CS);
  if (!SD.begin(SD_CS, SPI)) {
    Serial.println("HATA: MicroSD baslatilamadi.");
    while (true) delay(100);
  }

  yeniDosyaAdiBul();                        // her acilista yeni dosya
  File dosya = SD.open(dosyaAdi, FILE_WRITE);
  if (!dosya) {
    Serial.println("HATA: dosya olusturulamadi.");
    while (true) delay(100);
  }
  dosya.println("zaman_s;sicaklik_C;basinc_hPa");   // baslik satiri
  dosya.close();
  Serial.print("Kayit dosyasi: ");
  Serial.println(dosyaAdi);
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - sonKayit < KAYIT_ARALIGI) return;   // zamani gelmedi
  sonKayit = simdi;

  String satir = String(simdi / 1000) + ";" +
                 virgullu(bmp.readTemperature(), 2) + ";" +
                 virgullu(bmp.readPressure() / 100.0, 2);

  File dosya = SD.open(dosyaAdi, FILE_APPEND);    // sonuna ekle
  if (dosya) {
    dosya.println(satir);
    dosya.close();
    Serial.println(satir);
  } else {
    Serial.println("HATA: dosyaya yazilamadi!");
  }
}
