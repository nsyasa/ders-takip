---
tur: "genel"
baslik: "Kitabı nasıl kullanırsın?"
slug: "kitabi-kullan"
sira: 1
ustbilgi: "Başlarken"
---

| Adım | Senin işin |
|---|---|
| 1. Tanı | Günlük hayat fikrini ve kullanacağın parçayı incele. Öğreneceğin kavramı ve önceki projeleri bul. |
| 2. Tahmin et | Kodu çalıştırmadan önce kendi düşünceni yaz. Tahminin sonradan gözleminle karşılaştırılacak. |
| 3. Bağla | USB kablosunu çıkar. Pin haritasını ve breadboard çizimini birlikte izleyerek her ucu ayrı deliğe yerleştir. |
| 4. Kontrol et | Pinleri, güç yollarını, dirençleri ve gerçek modeli öğretmeninle doğrula. Kontrol bitince USB kablosunu tak. |
| 5. Kodla | Arşivdeki tam programı aç. Doğrula ile derle; kart ve port doğruysa Yükle ile karta gönder. |
| 6. Test et | Bir koşulu dene. Tahminini ve gördüğün tepkiyi ayrı hücrelere yaz; olmayan ölçümü sonuç gibi kaydetme. |
| 7. Değiştir | Her seferinde yalnız bir ayarı değiştir. Diğer koşulları koru; sonra başlangıç ayarına dön. |
| 8. Geliştir | Kendini kontrol et sorularını yanıtla. Birleştirme fikrini önce kâğıtta girdi, karar ve çıktı olarak planla. |

**Sen çiz:** Defterine kendi yerleşimini veya sistem yolunu çiz. Uç adlarını ve bağlantı noktalarını yaz; örnek resmi kopyalamakla yetinme.

**Evde devam et:** Çevrendeki bir ürünü gözle ve kâğıda not al. Görev için Arduino setini eve götürmen gerekmez.

**İki ayrı kayıt:** Tahminim deneme öncesindeki düşüncendir. Gözlemim gerçekten gördüğün veya ölçtüğün bilgidir.

## Proje sayfalarını tanı

| Proje bölümü | Bu bölümde ne yaparsın? |
|---|---|
| Tanı • Tahmin et | Fikri ve parçayı tanır, programdan önce tahminini yazarsın. |
| Bağla • Kontrol et | Adım adım kurar, parçanı doğrular, deliklerini tabloya yazarsın. |
| Bağla • Kontrol et (devam) | Çizimi kurulumunla karşılaştırır, kendi yerleşimini çizersin. |
| Kodla • Test et | Programı açar, Kodu izle ile kâğıtta çalıştırırsın. |
| Test et • Değiştir • Geliştir | Testi kaydeder, tek değişiklik yapar, kendini kontrol edersin. |

## Bölümlerde öğreneceklerin

| Bölüm | Beceriler | Projeler |
|---|---|---|
| Bölüm 1 · Işık ve ses | Dijital çıkış, seri direnç, bekleme süresi; aktif ve pasif buzzer ile ses | 1–3 |
| Bölüm 2 · Düğme ve ayar | Dijital giriş ve pull-down, analog okuma, map, PWM ile parlaklık, RGB kanalları | 4–6 |
| Bölüm 3 · Ölç ve karar ver | Gerilim bölücü, eşikle karar, LM35 sıcaklık hesabı, ultrasonik süre ve mesafe | 7–9 |
| Bölüm 4 · Hareket | Servo kütüphanesi, açı komutu, potla komut aralığı | 10–11 |
| Bölüm 5 · Say, zamanla, uyar | Kenar algılama, titreşim eleme, millis ile süre, INPUT\_PULLUP, alarm süresi | 12–15 |
| Bölüm 6 · Çevreyi izle | Ölçekleme, pencere farkı, histerezis, DHT kütüphanesi, iki sıcaklık sensörünü karşılaştırma | 16–20 |
| Bölüm 7 · Sistemler | Durum ve süre dizileri, mesafeyle karar, 7 segment deseni, sesli ritim | 21–24 |

## Ek Kitap ile çalışırken

:::bilgi[Ana kitapla birlikte kullan]{renk=mavi}
Bu kitap iki set dışı çalışmayı ayrı numaralarla anlatır. Önce ana kitaptaki belirtilen projeleri tamamla. Ek parçaları öğretmenin doğrulamadan devreye ekleme.
:::

1. Tanı ve tahmin et; sonra besleme ayrılmışken bağla.
2. Modeli ve güç yollarını kontrol ettir; programı derle ve yükle.
3. Gerçek gözlemini yaz; yalnız bir sabiti değiştir ve geri dön.

:::bilgi[İki ayrı ek parça]{renk=sari}
EK-K1: 5 V PCF8574 arayüzlü 16×2 LCD.

EK-K2: gerçek servoya uygun regüle 5 V kaynak ve yalıtılmış bağlantı uçları.

Bu parçalar ana kit içinde yoktur.
:::

:::dikkat[Güvenli çalışma]{renk=kirmizi}
Şebeke bağlantısını öğrenci yapmaz. Kablo değişiminde USB ve varsa harici güç birlikte ayrılır. Hareketli kapağın çevresini öğretmen düzenler; sıkışma veya ısınmada güç ayrılır.
:::

**Sen çiz (defterine):** ek parçanın girdi, karar ve çıktı yolunu planla.
