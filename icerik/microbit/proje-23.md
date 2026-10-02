---
ders: microbit
numara: 23
slug: proje-23
baslik: "Işığın grafiği"
altbaslik: "Kart içi"
ozet: "Bulunduğun yerin ışığını kartın LED ekranında yükselen bir grafik olarak göster."
sureDk: 20
seviye: "İleri"
onkosulFoyler: []
kavramlar:
  - "çubuk grafik"
hedefler: []
malzemeler:
  - ad: "micro:bit V2"
  - ad: "veri USB kablosu"
gorseller:
  - "isigin-grafigi-makecode"
adimSayisi: 6
yazSayisi: 4
---

## Önce tahmin et

:::tahmin
LED yüzünü elinle gölgeleyince grafik küçülür mü?
:::

::yaz[Tahminim]{satir=1}

## Yap

1. Her zaman döngüsüne ışık düzeyi değerini koy.
2. LED bölümündeki çubuk grafik bloğunda en yüksek değeri 255 yap.
3. Kartı iki farklı ışık konumunda dene.

![Işığın grafiği için gerçek MakeCode blokları](./gorseller/isigin-grafigi-makecode.svg "Işık değerini 0–255 ölçeğinde çubuk grafikle göster.")

## Kartında dene

Aydınlıkta daha yüksek grafik beklenir.

:::olmadiysa
Kartın LED yüzünü aydınlatıp karart; grafiğin 0–255 ışık değerini kullandığını kontrol et.
:::

## Anlat

::yaz[**Gözlemim:** İki yerde grafiği çiz.]{satir=2}

::yaz[**Neden?** 255 neyi belirler?]{satir=2}

## Tek şeyi değiştir

Grafik bloğundaki en yüksek değeri 255 yerine 128 yap. Aynı ışıkta sütun değişiyor mu?

::yaz[Ne değişti?]{satir=2}
