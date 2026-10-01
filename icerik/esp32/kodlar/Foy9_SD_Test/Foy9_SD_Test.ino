// FOY 9 - Kod 9.1: MicroSD testi
#include <SPI.h>
#include <SD.h>

const int SD_CS = 27;

void setup() {
  Serial.begin(115200);
  delay(500);
  SPI.begin(18, 19, 23, SD_CS);          // SCK, MISO, MOSI, CS

  if (!SD.begin(SD_CS, SPI)) {
    Serial.println("HATA: MicroSD baslatilamadi. Kart takili mi? FAT32 mi? Baglanti ve VCC?");
    while (true) delay(100);
  }

  Serial.print("Kart boyutu: ");
  Serial.print(SD.cardSize() / (1024 * 1024));
  Serial.println(" MB");

  File dosya = SD.open("/deneme.txt", FILE_WRITE);   // yaz (varsa ustune)
  if (dosya) {
    dosya.println("Merhaba ESP32!");
    dosya.close();                                    // kaydi bitir
  }

  dosya = SD.open("/deneme.txt");                     // okumak icin ac
  if (dosya) {
    Serial.print("Dosyada yazan: ");
    while (dosya.available()) Serial.write(dosya.read());
    dosya.close();
  } else {
    Serial.println("HATA: deneme.txt acilamadi.");
  }
}

void loop() {
}
