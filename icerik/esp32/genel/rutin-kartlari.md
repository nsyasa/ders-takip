---
tur: "genel"
baslik: "Rutin Kartları"
slug: "rutin-kartlari"
sira: 4
---

Aşağıdaki dört rutin bütün föylerde kullanılır. Föylerde bu rutinlere yalnız adıyla atıf yapılır (örneğin "R2 Güç Kontrolü'nü uygula"). Kartları çoğaltıp masanda tut.

:::rutin[R1 · Yükleme Rutini]
1. Kabloyu kontrol et: **veri kablosu** mu? (Yalnız şarj eden kablolarla kart bilgisayarda görünmez.)
2. **Araçlar → Kart → esp32 → ESP32 Dev Module** seçili mi?
3. **Araçlar → Bağlantı noktası:** kartını takınca listeye yeni eklenen COM numarasını seç.
4. **Yükle**'ye bas. Ekranda "Connecting…" görünür ve ilerlemezse kartın **BOOT** tuşunu basılı tut; yükleme yüzdesi başlayınca bırak.
5. Seri Monitör'ü aç, sağ alttaki hızı **115200** yap. Mesaj görmüyorsan kartın **EN** tuşuna bir kez bas.
:::

:::rutin[R2 · Güç Kontrol Rutini (USB'yi takmadan önce)]
1. Bağlantıyı yaparken USB **çıkık** muydu?
2. **3V3, VIN ve GND** hatları doğru yerde mi? Kablo rengi kuralı: **kırmızı = 5 V (VIN)**, **turuncu = 3,3 V**, **siyah = GND**.
3. Hiçbir GPIO pini **3,3 V'tan yüksek** bir gerilime bağlı değil mi?
4. Servo, WS2812 gibi yükler **pinden değil, beslemeden** mi besleniyor? Harici besleme varsa GND'ler **ortak** mı?
5. **İki kişi kuralı:** Grup arkadaşın bağlantıyı tablodan tek tek kontrol etti mi?
6. USB'yi tak ve 10 saniye izle. Isınan parça, koku ya da sönen/titreyen güç LED'i varsa **USB'yi hemen çıkar**.
:::

:::rutin[R3 · I2C Kontrol Rutini]
1. I2C tarayıcı kodunu çalıştır. Beklediğin adresleri önceden yaz (örneğin OLED 0x3C, BMP280 0x76).
2. Hiç cihaz yoksa: VCC/GND'yi, sonra SDA (GPIO21) ile SCL'nin (GPIO22) yer değiştirip değiştirmediğini kontrol et.
3. Birden fazla cihaz varsa hepsini sökmeden **birer birer** ekleyerek tara.
4. Adres görünüyor ama kütüphane "bulunamadı" diyorsa, modülün içindeki çip beklediğinden farklı olabilir (klon, SH1106, BME280). Kodu değiştirmeden önce öğretmenine sor.
:::

:::rutin[R4 · Hata Mesajı Kuralı (kod yazarken)]
Bir sensör başlatılamazsa program **asla sessizce durmaz**; önce ne olduğunu Seri Monitör'e yazar. Bu kitaptaki bütün kodlar bu kalıbı kullanır:
:::

```cpp title="Kalıp: başarısızlıkta mesaj yaz, sonra bekle" start=1 dosya=R4_HataMesajiKalibi
#include <Wire.h>
void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  Wire.beginTransmission(0x76);
  if (Wire.endTransmission() != 0) {
    Serial.println("HATA: BMP280 bulunamadi. I2C Kontrol Rutini'ni uygula.");
    while (true) delay(100);
  }
}
void loop() {}
```
