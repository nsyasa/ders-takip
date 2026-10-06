---
ders: "arduino"
numara: 3
slug: "proje-03"
baslik: "Buzzer ile ses ve ritim"
altbaslik: "Pasif piezo buzzer’la bir uyarı üret; sesin inceliğini ve ritmini ayrı ayrı dene."
ozet: "Pasif piezo buzzer’la bir uyarı üret; sesin inceliğini ve ritmini ayrı ayrı dene."
dersSaati: "35–45 dakika"
sureDk: 40
seviye: "Başlangıç"
onkosul: ["Proje 1","Proje 2"]
onkosulFoyler: [1,2]
kavramlar: ["tone","noTone ve frekans"]
hedefler: []
malzemeler: [{"ad":"UNO kartı","adet":"","not":""},{"ad":"USB veri kablosu","adet":"","not":""},{"ad":"orta boy breadboard","adet":"","not":""},{"ad":"erkek-erkek jumper","adet":"","not":""},{"ad":"UNO pininden çalıştırılmaya uygun pasif piezo buzzer","adet":"","not":""}]
kodlar: ["p03_buzzer_ile_ses_ve_ritim","p03_pin_d9"]
gorseller: ["proje-03-breadboard-1"]
simge: "proje-03-simge"
adimSayisi: 8
yazSayisi: 8
---

## Tanı • Tahmin et

### Günlük teknolojide

Mutfak zamanlayıcısı ve alarm saati sesle haber verir. Her uyarının bir ses düzeni vardır. Kısa ve uzun sesler farklı bilgiler taşıyabilir. Sen bir uyarı tasarlayacak, iki ayarın etkisini ayrı ayrı ölçeceksin.

![Mutfak tezgâhında bir mini fırın ve yanında bir masa saati.](./gorseller/proje-03-giris.webp "Günlük hayat sahnesi; parçanın tipini kanıtlamaz.")

### Sistemin yolu

**Girdi:** Seçtiğin program ayarları → **İşlem:** Arduino sinyal üretir → **Çıktı:** Pasif piezo titreşir

:::bilgi[Önce düşün]{renk=sari}
Yalnız sessizlik süresini değiştirirsen sesin inceliği de değişir mi? Tahminini ve gerekçeni yaz.
:::

::yaz[Tahminim]{satir=2}

### Parçayı tanı

- [Proje 2](proje:2) içinde iki ses parçasını karşılaştırdın. Bu projede pasif adayını tone() ile sınayacaksın.
- Piezo, elektrik sinyaliyle titreşen bir malzemedir. Hareketi sesi oluşturur.
- Frekans, bir saniyedeki titreşim sayısıdır. Birimi hertz, kısa yazımı Hz’dir.
- Ritim, sesin açık ve kapalı kaldığı zaman düzenidir. İki süreyi ayrı ayarlar yönetir.
- Dış görünüşe güvenme. Parçanın modelini ve UNO pininden çalıştırılmaya uygunluğunu kontrol et.

## Pasif piezo buzzer’ı yerleştir

| UNO pini | Bağlantı yolu |
|---|---|
| **D8** | Buzzer + · e2 |

### GND

Buzzer − · e5

_Kırmızı: 5 V · Siyah: GND_

_Sarı: dijital · Turkuaz: analog · Pin adı belirleyicidir._

**Kontrol listesi**

- D8 → a2
- + e2 / − e5
- GND → a5
- Model uygun

Bacak aralığı 7,62 mm ise bu yerleşimi kullan. Tahtan veya modelin farklıysa yerleşimi kendi modeline göre eşleştir.

### Adım adım kur

1. USB kablosunu çıkar.
2. Buzzer + → e2; − → e5.
3. D8 → a2.
4. UNO GND → a5.
5. Yönleri ve ayrı satırları kontrol et.
6. Kontrolden sonra USB’yi tak.

:::dikkat{renk=kirmizi}
Yalnız UNO pininden çalıştırılmaya uygun pasif piezo kullan. Gerilim ve akımı öğretmeninle doğrula. Buzzer’ı kulağına yaklaştırma.
:::

:::bilgi[Parçanı doğrula · pasif adayı]{renk=gri}
[Proje 2](proje:2) içinde pasif adayı çıkan parçayı tak ve ilk programı yükle. Ses geldiyse parça pasif piezodur; ses gelmezse USB’yi çıkar, parçayı değiştir ve [Proje 2](proje:2) deneyini tekrarla.

::yaz[parça A / B … · ses geldi mi? … · sonuç …]{satir=1}
:::

**Sen çiz (defterine):** artı ve eksi uçtan UNO’ya giden iki yolu kendi yerleşiminle çiz.

:::bilgi[Pin değişikliği deneyi]{renk=mavi}
İlk programa dön. USB’yi çıkar; yalnız sinyal jumper’ını D8’den D9’a taşı. USB’yi takıp tahminini sına. Ardından yalnız buzzerPini değerini 9 yap ve programı yükle. Deney bitince USB’yi çıkar; kabloyu D8’e geri bağla. USB’yi tak; ilk programı yükle.
:::

### Hata avcısı

| Belirti | Olası neden | Ne yap? |
|---|---|---|
| Hiç ses yok | Parça türü veya pin yanlış | USB’yi çıkar; pasif piezo modelini, D8’i ve GND’yi kontrol et. |
| Ses kesilmiyor | noTone satırı eksik olabilir | Tam programı dosyayla karşılaştır; noTone çağrısını kontrol et. |
| D9’a taşıyınca ses yok | Kablo ve kod farklı pinlerde | USB’yi çıkar; kabloyu kontrol et. Sonra buzzerPini değerini 9 yap. |

## Uçları ayrı satırlara yerleştir

| UNO pini | Bağlantı yolu |
|---|---|
| **D8** | Buzzer + · e2 |
| **GND** | Buzzer − · e5 |

- **Sinyal jumper’ı:** D8 → a2
- **Dönüş jumper’ı:** a5 → UNO GND

![Breadboard yerleşim çizimi: Uçları ayrı satırlara yerleştir](./gorseller/proje-03-breadboard-1.svg)

- **Ayrı delikler:** a2 ile e2 aynı gruptadır.
- **Ayrı satırlar:** a5 ile e5 aynı gruptadır.
- **Orta kanal:** a–e ile f–j bağlanmaz.

Aynı satırdaki a–e delikleri bağlıdır. Buzzer uçları iki ayrı satırda kalır.

### Kendi deliklerin

Kurduktan sonra her ucun gerçekte hangi deliğe girdiğini yaz ve çizimle karşılaştır. Buzzer’ın iki ucu ayrı satırlarda kalmalı.

| Uç | Çizimdeki delik | Benim deliğim |
|---|---|---|
| Pasif piezo + ucu | e2 |   |
| Pasif piezo − ucu | e5 |   |
| D8 jumper’ı | a2 |   |
| GND jumper’ı | a5 |   |

## Sesin ayarlarını programla

```cpp title="TAM PROGRAM · D8 PASİF PİEZO" start=1 dosya=p03_buzzer_ile_ses_ve_ritim
const byte buzzerPini = 8;
const unsigned int frekansHz = 1000;
const unsigned int sesMs = 300;
const unsigned int sessizlikMs = 700;

void setup() {
  pinMode(buzzerPini, OUTPUT);
}

void loop() {
  tone(buzzerPini, frekansHz);
  delay(sesMs);
  noTone(buzzerPini);
  delay(sessizlikMs);
}
```

Arduino Uno ve portu seç. Doğrula düğmesi kodu derler; Yükle düğmesi programı karta gönderir. 300 ms, 0,3 saniyedir.

### Kodun mantığı

1. buzzerPini, D8’i seçer. frekansHz, sesin frekans ayarıdır.
2. sesMs ve sessizlikMs, iki süreyi milisaniye ile tutar.
3. setup(), buzzerPini çıkışını hazırlar.
4. tone(buzzerPini, frekansHz), seçilen frekansta sinyal başlatır.
5. delay(sesMs), ses sürerken bekler. noTone(buzzerPini), sinyali durdurur.
6. delay(sessizlikMs), sessiz aralığı bekletir. loop(), aynı sırayı tekrarlar.

### Programı izle

Program başladıktan sonraki ilk iki saniyede sesin ne zaman duyulduğunu tahmin et. Sonra dinleyip gözlemini yaz.

| Zaman | Tahminim | Gözlemim |
|---|---|---|
| 0–300 ms |   |   |
| 300–1000 ms |   |   |
| 1000–1300 ms |   |   |
| 1300–2000 ms |   |   |

## İnceliği ve tekrar aralığını karşılaştır

Her denemeden önce tahminini yaz. Gözlemini boş hücreye kaydet.

| Deneme | Tahminim | Gözlemim |
|---|---|---|
| Pasif adayını tak; ilk programı yükle. Ses geldi → pasif; ses yok → parçayı değiştir. |   |   |
| İlk program: 5 saniye uyarıyı dinle. |   |   |
| Yalnız frekansHz = 1500; inceliği karşılaştır. |   |   |
| 1000 Hz’e dön; yalnız sessizlikMs = 300. |   |   |
| İlk ayarlara dön; 5 saniye yeniden dinle. |   |   |

:::bilgi[Bir değişiklik yap]{renk=mavi}
Önce yalnız frekansHz değerini değiştir. İlk değere dön; sonra yalnız sessizlikMs değerini değiştir. Her denemede tahminini ve gözlemini yaz.
:::

::yaz[Tahminim ve gözlemim]{satir=3}

### Değişiklik sürümleri

“Bir değişiklik yap” sürümleri; ana programla yan yana açıp farkı bul.

```cpp title="Değişiklik sürümü · p03_pin_d9" start=1 dosya=p03_pin_d9
const byte buzzerPini = 9;
const unsigned int frekansHz = 1000;
const unsigned int sesMs = 300;
const unsigned int sessizlikMs = 700;

void setup() {
  pinMode(buzzerPini, OUTPUT);
}

void loop() {
  tone(buzzerPini, frekansHz);
  delay(sesMs);
  noTone(buzzerPini);
  delay(sessizlikMs);
}
```

### Kendini kontrol et

**1.** noTone komutunun görevi nedir?

::yaz[Cevabım]{satir=2}

**2.** Sesin inceliği ile tekrar aralığı neden ayrı ayarlardır?

::yaz[Cevabım]{satir=2}

**3.** Ses daha seyrek gelsin diye hangi süreyi artırırsın?

::yaz[Cevabım]{satir=2}

**Sen çiz (defterine):** tasarladığın uyarının zaman düzenini çiz.

**Evde devam et:** Bir cihazın uyarısını dinle. Aralıklarını gözle; cihazı sökmeden hangi olayı bildirdiğini yaz.

**Şimdi sıra sende:** Bir oyun ve bir zamanlayıcı için iki farklı uyarı öner. Her seferinde tek ayarı değiştirerek fikrini sına.

::yaz[Fikrim]{satir=3}

**Kendimi değerlendiriyorum:** Yardımla yaptım · Biraz yardımla · Tek başıma · Başkasına anlatabilirim

::yaz[Bu projeyi nasıl yaptım? Neden?]{satir=1}

:::bilgi[Biliyor muydun?]{renk=sari}
tone komutu bir kare dalga üretir. Bu sinyal düzenli olarak iki seviye arasında geçer. Pasif piezo bu değişimle titreşir.
:::
