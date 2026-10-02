---
ders: microbit
numara: 43
slug: proje-43
baslik: "Yağmuru algıla"
sureDk: 40
seviye: "Çevre"
onkosulFoyler: []
kavramlar:
  - "yağmur plakası ve karşılaştırıcı"
  - "A0 ve D0 çıkış farkı"
  - "ölçümden eşik seçme"
hedefler: []
malzemeler:
  - ad: "yağmur sensörü (EYAGMURSENS)"
  - ad: "pil kutusu"
  - ad: "yağmur sensörü"
  - ad: "kΩ"
    adet: "15"
  - ad: "jumper"
gorseller:
  - "sensor-bolucu-p0-semasi"
  - "yagmur-olcumu-makecode"
adimSayisi: 6
yazSayisi: 12
---

## 1. kısım — Yağmur sensörünü tanı

Yağmur plakasındaki damlalar analog okumayı değiştirebilir.

::kunye{sure="10" fikir="yağmur plakası ve karşılaştırıcı" malzeme="yağmur sensörü (EYAGMURSENS) + pil kutusu"}

### Önce tahmin et

:::tahmin
Tek damla ile çok damla aynı değeri verir mi?
:::

::yaz[Tahminim]{satir=1}

### Yap

1. Plaka ve küçük karşılaştırıcı kartı ayırt et. Kartın VCC, GND, A0 ve D0 etiketlerini öğretmeninle bul.
2. Bu kitap A0 analog çıkışını kullanır; D0 boş kalır. Küçük ayar vidasını çevirme.
3. Yalnız yağmur plakasını hafifçe ıslat; elektronik kart, deney tahtası ve micro:bit kuru kalsın.

![Yağmur sensörünü tanı için bağlantı yolu](./gorseller/sensor-bolucu-p0-semasi.svg "Şema işlev yolunu gösterir; gerçek pin yazılarını öğretmen doğrular.")

### Anlat

::yaz[**Gözlemim:** Analog çıkışın etiketi \_\_\_.]{satir=2}

::yaz[**Neden?** D0 yerine A0 seçince hangi bilgi artar?]{satir=2}

### Tahmin et

Aynı miktar damla farklı bir bölgeye düşerse okuma nasıl değişir? Sonraki kısımda dene.

::yaz[Notum]{satir=2}

## 2. kısım — Yağmur devresini bağla

Yağmur kartının A0 çıkışını güvenli bir P0 düzeyine indir.

::kunye{sure="15" fikir="A0 ve D0 çıkış farkı" malzeme="yağmur sensörü + pil kutusu + 10 kΩ + 15 kΩ + jumper"}

### Önce tahmin et

:::tahmin
Sensör kartının çıkışını doğrudan P0’a bağlayabilir miyiz?
:::

::yaz[Tahminim]{satir=1}

### Yap

1. USB ve pil çıkarılmışken kur. Öğretmenin ürünün VCC, GND, A0 yazılarını ve sensör pil kutusunun kutuplarını doğrulasın.
2. Pil kutusunun artı ucu → yağmur kartı VCC; eksi ucu → kart GND. Plaka, ürünün kendi iki uçlu bağlantısına takılır.
3. Sensörün analog çıkışı (S/A0) → 10 kΩ → ölçüm düğümü → 15 kΩ → ortak GND bağla; yalnız ölçüm düğümünü micro:bit P0 girişine götür. Sensör pil kutusu micro:bit'in 3V veya pil girişine gitmez.
4. Sensör GND, pil kutusunun eksi ucu ve micro:bit GND ortak olsun. Öğretmen micro:bit P0 kablosu ayrıyken sensör pil kutusunu açıp ölçüm düğümünü ölçsün: en çok 3,0 V olmalı. Sonra gücü kapatıp P0'u bağlasın; micro:bit'i USB ile çalıştır.

![Yağmur devresini bağla için bağlantı yolu](./gorseller/sensor-bolucu-p0-semasi.svg "Şema işlev yolunu gösterir; gerçek pin yazılarını öğretmen doğrular.")

:::bilgi
A0 çıkışı yalnız bölücüden P0’a gider. D0 boş kalır; dijital 0/1, 0/1 volt demek değildir.
:::

### Anlat

::yaz[**Gözlemim:** P0 ölçüm düğümü \_\_\_ V.]{satir=2}

::yaz[**Neden?** Ortak GND olmazsa analog ölçüm neden güvenilmez?]{satir=2}

### Karşılaştır

A0 değişen bir sayı, D0 ise hangi iki durumu bildirir? D0’ı bağlamadan açıkla.

::yaz[Notum]{satir=2}

## 3. kısım — Yağmuru ölç

Kuru ve ıslak plakadaki P0 değerlerini karşılaştır.

::kunye{sure="15" fikir="ölçümden eşik seçme" malzeme="43. projenin yağmur sensörü devresi"}

### Önce tahmin et

:::tahmin
Damlalar gelince değer hangi yöne kayacak?
:::

::yaz[Tahminim]{satir=1}

### Yap

1. A'ya basınca P0 analog değerini gösteren kodu yükle.
2. Kuru plakada üç okuma kaydet; sonra öğretmenin plakaya birkaç damla uygulasın ve üç kez daha oku.
3. Değerlerin ortasını düşün; ıslak/kuru ayrımı için kendi eşik değerini yaz.

![Yağmuru ölç için MakeCode blokları](./gorseller/yagmur-olcumu-makecode.svg "Blok akışını soldan sağa izle; yüklemeden önce bağlantıyı kontrol et.")

### Anlat

::yaz[**Gözlemim:** Kuru \_\_\_, damlalı \_\_\_.]{satir=2}

::yaz[**Neden?** Sensörü silip yeniden okumak neden önemli?]{satir=2}

### Tek şeyi değiştir

Damlaların sayısını değiştirip üç yeni okuma kaydet.

::yaz[Ne değişti?]{satir=2}
