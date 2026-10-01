---
tur: "genel"
baslik: "Malzemelerimizi Tanıyalım"
slug: "malzemelerimizi-taniyalim"
sira: 3
---

Bu kitapta kullanacağın parçaların doğru adlarını, temel özelliklerini ve dikkat etmen gereken noktaları burada bulabilirsin. Aynı adla satılan parçalar farklı türlerde olabilir; bu yüzden her parçada "Dikkat" sütununa bak. Kitindeki parçanın türünü öğretmenin belirler.

## Ana parçalar

| Parça | Teknik adı ve temel özelliği | Ne işe yarar? | Dikkat | Föy |
| --- | --- | --- | --- | --- |
| **ESP32** | **ESP32-WROOM-32** geliştirme kartı, 30 pin, USB Type-C. 3,3 V lojik; 240 MHz hızına kadar çift çekirdek; Wi-Fi + Bluetooth; GPIO, I2C, SPI, UART. | Projelerin beyni: sensörleri okur, karar verir, diğer cihazlarla haberleşir. | GPIO pinleri 5 V'a dayanıklı değildir. USB-seri çipi (CP2102 / CH340 / CH9102) için sürücü gerekebilir. | Tümü |
| **Breadboard** | Lehimsiz deney tahtası. Aynı numaralı sütundaki 5 delik birbirine bağlıdır; orta boşluğun iki yanı birbirinden ayrıdır. | Devreyi lehimlemeden kurmanı sağlar. | Yan güç hatları bazı tahtalarda ortadan ikiye bölünmüştür. 30 pinli ESP32 takılınca yanlarda çok az boş delik kalır; gerekirse dişi-erkek jumper kullan. | Tümü |
| **Jumper kablo** | Dupont jumper: erkek-erkek, erkek-dişi, dişi-dişi. | ESP32, sensör ve breadboard arasında bağlantı kurar. | Renk kuralı: kırmızı 5 V, turuncu 3,3 V, siyah GND. Gevşek uç "bazen çalışan" devre yapar. | Tümü |
| **Buton** | 6×6 mm dokunmatik anahtar (tact switch), 4 bacaklı. Basılınca iki kontak birleşir. | ESP32'ye komut vermeni sağlayan dijital giriş. | Çapraz bacakları kullan; butonu breadboard boşluğuna ortala. | 1, 5 |
| **Aktif buzzer** | Aktif buzzer modülü (3 pin: S/IN, VCC, GND). Gerilim verilince kendi sesini üretir. | Sesli uyarı verir. | Modül aktif-HIGH ya da aktif-LOW olabilir (Föy 1). VCC: 3V3. 2 bacaklı çıplak buzzer doğrudan GPIO'ya bağlanmaz. | 1, 5, 8 |
| **OLED ekran** | 0,96" 128×64 piksel, I2C, genellikle SSD1306 sürücülü; adres 0x3C; 3,3 V. | Değerleri, yazıyı ve küçük çizimleri gösterir. | Pin sırası modüle göre değişir; modülün üzerindeki yazıyı oku. Türkçe harf göstermez. Sürücü SH1106 olabilir. | 2, 3, 4, 7, 12 |
| **BMP280** | Bosch BMP280: sıcaklık + atmosfer basıncı; I2C (0x76 / 0x77); 3,3 V. | Ortam sıcaklığını ve basıncı ölçer. | Nem, yağmur, rüzgâr ölçmez; yüksekliği yalnız tahmin eder. Modül BME280 olabilir. | 3, 9–12 |
| **BH1750** | ROHM BH1750FVI dijital ışık sensörü; aydınlanmayı lüks (lx) olarak ölçer; I2C (0x23 / 0x5C). | Ortamın ne kadar aydınlık olduğunu sayıya çevirir. | Çok parlak ışıkta (≈54 600 lx üstü) doyar. Sensör yüzeyi ışığa bakmalı. | 4, 10, 11 |
| **PIR sensörü** | **HC-SR501** ayarlanabilir PIR: pasif kızılötesi; 5 V (VIN) besleme; çıkış ≈3,3 V; menzil ve süre vidaları. | Görüş alanındaki kızılötesi ışınım değişimini algılayıp hareket bilgisi verir. | İnsanı tanımaz, yalnız değişimi algılar. Açılışta ≈1 dk ısınır. OUT ucunu bağlamadan önce ölç. | 5, 10 |
| **Servo motor** | **SG90** 9 g mikro servo: ≈5 V besleme, 50 Hz PWM kontrol sinyali, yaklaşık 180° dönüş. | İstediğin açıya dönen küçük bir motor. | MB102 güç kartından beslenir; GND'ler ortak. Kodlarda 10°–170° kullanılır. Kolu elle zorlama. | 6 |
| **MPU6050** | TDK InvenSense MPU-6050 (GY-521 modülü): 3 eksen ivmeölçer + 3 eksen jiroskop; I2C (0x68); 3,3 V. | Hareketi, ivmeyi ve dönme hızını ölçer. | Açıyı doğrudan ölçmez; ivmeden hesaplanır. Klon çip olabilir. | 7 |
| **INA219** | Texas Instruments INA219 akım/güç monitörü: bus gerilimi, akım, güç; 0,1 Ω şönt; I2C (0x40). | Bir devrenin harcadığı gerilim, akım ve gücü ölçer. | Ölçülen yola **seri** bağlanır. VIN+ / VIN− ters olursa akım negatif görünür. | 8 |
| **MicroSD modülü** | SPI microSD kart modülü: SCK, MISO, MOSI, CS hatları. | Sensör verisini dosya olarak karta kaydeder. | VCC, modülün türüne göre VIN ya da 3V3'tür (Föy 9 tablosu). Yanlış besleme modülü bozabilir. | 9 |
| **MicroSD kart** | microSD / SDHC, en çok 32 GB, FAT32 biçimli. | Topladığın verileri saklar. | Kartı USB takılıyken takıp çıkarma. 64 GB ve üzeri kartlar FAT32 gelmeyebilir. | 9 |
| **NeoPixel halka** | **WS2812 8'li halka**: 8 adreslenebilir RGB LED art arda bağlı; tek veri hattı (DIN); her renk 0–255. | Tek pinle 8 LED'in rengini ve parlaklığını ayrı ayrı (ya da hepsini birden) belirler. | Veri sinyali 3,3 V ile sınırda kalır; kitapta diyotla beslenir (Föy 10). Parlaklık en çok 40. Pinleri öğretmen lehimler. | 10 |

## Küçük parçalar ve araçlar

| Parça | Ne işe yarar? | Dikkat | Föy |
| --- | --- | --- | --- |
| **Kırmızı LED** (5 mm) | Akım geçince ışık verir (yaklaşık 2 V'ta yanar). | Uzun bacak (+) anottur. Mutlaka seri dirençle kullan. | 0, 4, 8 |
| **330 Ω direnç** (turuncu-turuncu-kahverengi) | LED akımını sınırlar; WS2812 veri hattında sinyali korur. | Dirençsiz LED bağlanmaz: LED ve pin zarar görür. | 0, 4, 8, 10 |
| **1N4007 diyot** | Akımı tek yönde geçirir; üzerinde ≈0,7 V düşer. | Çizgili uç (katot) halkaya bakar. | 10 |
| **Kondansatör** (470 µF, 16 V elektrolitik) | Besleme hattındaki ani değişimleri yumuşatır. | Servo (Föy 6) ve NeoPixel halka (Föy 10) besleme hattına takılır. Uzun bacak (+); ters takılırsa ısınır ya da patlayabilir. | 6, 10 |
| **MB102 güç kartı + 5 V USB adaptör** | Breadboard'a takılan güç kartı; jumper ile 5 V ya da 3,3 V hattı seçilir. Servoyu ESP32'den bağımsız besler. | Jumper 5 V konumunda olmalı. Kartın 3,3 V hattı ESP32 pinlerine bağlanmaz. 5 V hat ESP32'nin VIN pinine bağlanmaz; GND ortak. | 6 |
| **Lojik seviye dönüştürücü** (IIC/I2C tipi, 5 V ↔ 3,3 V) | 5 V ve 3,3 V sinyaller arasında çeviri yapar. | Kitabın ana bağlantılarında kullanılmaz. WS2812 veri hattı için otomatik olarak uygun sayılmaz. | — |
| **USB Type-C veri kablosu** | Bilgisayardan program yükler, karta 5 V verir. | Yalnız şarj eden kablolarda kart görünmez. | Tümü |
| **Dijital multimetre** | Gerilimi (DC V) ölçer. | Kırmızı prob V, siyah prob COM; kademe DC V olmalı. | 0, 5 |
| **Kâğıt iletki, cetvel / şerit metre** | Servo açısını ve uzaklığı ölçer. | Sıfır noktasını dikkatle belirle. | 4, 6 |
| **Akıllı telefon** | Web panelini açar; ışık deneyinde fener olur. | Fener kimsenin gözüne tutulmaz. | 4, 6, 11 |

:::dikkat[Üç altın kural]
- **3,3 V kuralı:** ESP32 pinleri 5 V'a dayanıklı değildir. Şüphen varsa bağlamadan önce ölç.
- **Bağlantıyı USB çıkıkken yap** ve R2 Güç Kontrol Rutini'ni uygula.
- **Modülün türünü önce belirle:** OLED, BMP280, buzzer ve SD modülü farklı türlerde gelebilir. Emin değilsen öğretmenine sor.
:::
