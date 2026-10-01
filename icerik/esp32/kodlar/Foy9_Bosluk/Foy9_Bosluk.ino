// FOY 9 - Bosluk doldurma: sicaklik kaydedici
// ___1___ gibi numarali bosluklari doldur. Kodun geri kalani hazir.
#include <Wire.h>
#include <SPI.h>
#include <SD.h>
#include <Adafruit_BMP280.h>

const int SD_CS = 27;
const unsigned long KAYIT_ARALIGI = 10000;  // ms (10 saniye)

Adafruit_BMP280 bmp;
String dosyaAdi = "/sicaklik.csv";
unsigned long sonKayit = 0;

String virgullu(float deger, int basamak) {  // 23.8 -> 23,8
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
  File dosya = SD.open(dosyaAdi, FILE_WRITE);  // dosyayi bastan olustur
  if (dosya) {
    dosya.println("zaman_s;sicaklik_C");
    dosya.close();
  }
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - sonKayit ___1___ KAYIT_ARALIGI) return;  // zamani gelmediyse cik
  sonKayit = ___2___;

  String satir = String(simdi / ___3___) + ";" + virgullu(bmp.readTemperature(), 2);

  File dosya = SD.open(dosyaAdi, ___4___);  // dosyanin SONUNA ekle
  if (dosya) {
    dosya.println(___5___);
    dosya.___6___();  // kaydi tamamla
    Serial.println(satir);
  } else {
    Serial.println("HATA: dosyaya yazilamadi!");
  }
}
