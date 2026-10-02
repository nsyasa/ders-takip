---
ders: microbit
numara: 16
slug: proje-16
baslik: "Yaklaşık sıcaklık"
altbaslik: "Ölçümü yorumla"
ozet: "A’ya basınca kartın çipinden elde edilen sıcaklık değeri °C olarak görünsün."
sureDk: 15
seviye: "Temel"
onkosulFoyler: []
kavramlar:
  - "sıcaklık okuması"
hedefler: []
malzemeler:
  - ad: "micro:bit V2"
  - ad: "veri USB kablosu"
gorseller:
  - "yaklasik-sicaklik-makecode"
adimSayisi: 6
yazSayisi: 6
---

## Önce tahmin et

:::tahmin
Art arda iki kez ölçersen aynı sayıyı görmek zorunda mısın?
:::

::yaz[Tahminim]{satir=1}

## Yap

1. Yeni projeye **“A tuşuna basıldığında”** bloğunu ekle.
2. İçine **“sayıyı göster”** koy. Sayı alanına **Giriş** bölümündeki **“sıcaklık (°C)”** bloğunu tak.
3. Simülatörde A’ya bas. Sonucu not et; bir süre sonra yeniden ölç.

![A tuşuna basıldığında sıcaklık santigrat derece değerini gösteren MakeCode blokları](./gorseller/yaklasik-sicaklik-makecode.svg "Bu okuma çipin sıcaklığından türetilir.")

## Kartında dene

Kodu karta aktar. A’ya basıp değeri yaz; kısa bir süre sonra yeniden oku.

::yaz[İlk okuma]{satir=1}

::yaz[İkinci]{satir=1}

:::bilgi
**Önemli:** Bu, oda havasının kesin sıcaklığı değildir. Kartın içindeki çipten yaklaşık değer elde edilir.
:::

## Anlat

::yaz[**Gözlemim:** İki okumam: \_\_\_\_\_\_ °C ve \_\_\_\_\_\_ °C.]{satir=2}

::yaz[**Neden?** Bu değer neden oda termometresiyle eşit olmak zorunda değil?]{satir=2}

## Tek şeyi değiştir

Kartı elinde bir dakika tut; aynı kodla yeniden ölç. Çip sıcaklığı değişti mi?

::yaz[Ne değişti?]{satir=2}
