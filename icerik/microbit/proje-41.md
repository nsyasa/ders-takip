---
ders: microbit
numara: 41
slug: proje-41
baslik: "Su seviyesini ölç"
sureDk: 40
seviye: "Çevre"
onkosulFoyler: []
kavramlar:
  - "analog çıkışlı su sensörü"
  - "gerilim bölücü"
  - "kuru ve ıslak ölçüm"
hedefler: []
malzemeler:
  - ad: "su sensörü (EWATERSENS)"
  - ad: "pil kutusu"
  - ad: "su sensörü"
  - ad: "kΩ"
    adet: "15"
  - ad: "jumper"
gorseller:
  - "sensor-bolucu-p0-semasi"
  - "su-seviyesi-makecode"
adimSayisi: 6
yazSayisi: 12
---

## 1. kısım — Su sensörünü tanı

Su seviye sensörünün iletken çizgileri ıslandıkça analog değer değişebilir.

::kunye{sure="10" fikir="analog çıkışlı su sensörü" malzeme="su sensörü (EWATERSENS) + pil kutusu"}

### Önce tahmin et

:::tahmin
Sensörün kuru ve ıslak okuması aynı mı?
:::

::yaz[Tahminim]{satir=1}

### Yap

1. Ürünün VCC, GND ve S/A0 yazılarını öğretmeninle bul; baskı üzerindeki etiket gerçek üründe farklıysa bağlantıyı durdur.
2. Yalnız algılama çizgileri suya dokunacak şekilde yerleşimi planla. Kart, deney tahtası ve micro:bit kuru kalmalı.
3. Sensör pil kutusu yalnız sensöre ayrılır; Bu sensör deneyinde micro:bit yalnız veri USB kablosuyla beslenir; 2×AAA kutusunu çıkar.

![Su sensörünü tanı için bağlantı yolu](./gorseller/sensor-bolucu-p0-semasi.svg "Şema işlev yolunu gösterir; gerçek pin yazılarını öğretmen doğrular.")

:::bilgi
Bu sensör, pil kutusundan (3 pil, yaklaşık 4,5 V) beslenir. Bu kutu micro:bit'e bağlanmaz.
:::

### Anlat

::yaz[**Gözlemim:** Sensörde gördüğüm çıkış etiketi \_\_\_.]{satir=2}

::yaz[**Neden?** Sensörün elektronik kısmı neden kuru kalmalı?]{satir=2}

### Tahmin et

Kabloları değiştirmeden düşün: 10 kΩ ve 15 kΩ yer değiştirse düğüm gerilimi artar mı?

::yaz[Notum]{satir=2}

## 2. kısım — Su sensörünü güvenle bağla

Sensörün analog çıkışı gerilim bölücüden sonra P0'a gider.

::kunye{sure="15" fikir="gerilim bölücü" malzeme="su sensörü + pil kutusu + 10 kΩ + 15 kΩ + jumper"}

### Önce tahmin et

:::tahmin
Sensör çıkışını P0'a doğrudan bağlamak uygun mu?
:::

::yaz[Tahminim]{satir=1}

### Yap

1. USB ve pil çıkarılmışken kur. Öğretmenin ürünün besleme + (VCC/+), GND (−) ve analog çıkış (S/A0) yazılarını ve sensör pil kutusunun kutuplarını doğrulasın.
2. Pil kutusunun artı ucu → sensör VCC/+; eksi ucu → sensör GND/−.
3. Sensörün analog çıkışı (S/A0) → 10 kΩ → ölçüm düğümü → 15 kΩ → ortak GND bağla; yalnız ölçüm düğümünü micro:bit P0 girişine götür. Sensör pil kutusu micro:bit'in 3V veya pil girişine gitmez.
4. Sensör GND, pil kutusunun eksi ucu ve micro:bit GND ortak olsun. Öğretmen micro:bit P0 kablosu ayrıyken sensör pil kutusunu açıp ölçüm düğümünü ölçsün: en çok 3,0 V olmalı. Sonra gücü kapatıp P0'u bağlasın; micro:bit'i USB ile çalıştır.

![Su sensörünü güvenle bağla için bağlantı yolu](./gorseller/sensor-bolucu-p0-semasi.svg "Şema işlev yolunu gösterir; gerçek pin yazılarını öğretmen doğrular.")

:::bilgi
Bölücü gerilimi 0,6 katına düşürür: 4,5 V girişte P0'a yaklaşık 2,7 V gider. Pil kutusunun gerilimi ölçülmeden P0 bağlanmaz.
:::

### Anlat

::yaz[**Gözlemim:** Ölçüm düğümünde \_\_\_ V ölçüldü.]{satir=2}

::yaz[**Neden?** 10 kΩ ve 15 kΩ birlikte gerilimi nasıl düşürür?]{satir=2}

### Hesapla ve karşılaştır

4,5 × 15 ÷ 25 = \_\_\_ V. Öğretmenin ölçtüğü değerle karşılaştır; kabloları değiştirme.

::yaz[Notum]{satir=2}

## 3. kısım — Su seviyesini oku

P0'daki analog değeri kuru ve ıslak koşulda karşılaştır.

::kunye{sure="15" fikir="kuru ve ıslak ölçüm" malzeme="41. projenin su sensörü devresi"}

### Önce tahmin et

:::tahmin
Islanınca sayı artacak mı azalacak mı?
:::

::yaz[Tahminim]{satir=1}

### Yap

1. Öğretmen elektrik yolunu denetledikten sonra kodu yükle.
2. A'ya basınca P0 analog değerini göster. Kuru sensörde üç kez oku ve kaydet.
3. Öğretmen yalnız algılama çizgilerini az suyla ıslatsın; üç kez daha oku. Deney bitince sensör pil kutusunu kapat; sensörü güç kapalıyken kurula.

![Su seviyesini oku için MakeCode blokları](./gorseller/su-seviyesi-makecode.svg "Blok akışını soldan sağa izle; yüklemeden önce bağlantıyı kontrol et.")

:::bilgi
Bölücü gerilimi düşürür; üst okumayı 1023 varsayma. Okuma yönünü kendi devrende ölç. Yüzeyi uzun süre sürekli besleme; korozyon oluşabilir.
:::

### Anlat

::yaz[**Gözlemim:** Kuru: \_\_\_ / Islak: \_\_\_.]{satir=2}

::yaz[**Neden?** Tek ölçüm yerine neden üç ölçüm aldık?]{satir=2}

### Eşik öner

Kuru ve ıslak ortalamalarının arasına bir eşik seç.

::yaz[Notum]{satir=2}
