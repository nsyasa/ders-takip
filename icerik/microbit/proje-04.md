---
ders: microbit
numara: 4
slug: proje-04
baslik: "Gizli selam"
altbaslik: "Birlikte bas"
ozet: "A ve B’ye birlikte basınca ekranda bir yıldız belirsin. Bu, kartının gizli selamı olsun."
sureDk: 10
seviye: "Temel"
onkosulFoyler: []
kavramlar:
  - "A+B olayı"
hedefler: []
malzemeler:
  - ad: "micro:bit V2"
  - ad: "veri USB kablosu"
gorseller:
  - "gizli-selam-makecode"
adimSayisi: 6
yazSayisi: 4
---

## Önce tahmin et

:::tahmin
Yalnız A’ya basarsan yıldız görünür mü?
:::

::yaz[Tahminim]{satir=1}

## Yap

1. MakeCode’da **Yeni Proje** aç.
2. **Giriş** bölümünden **“tuşuna basıldığında”** bloğunu al; açılır menüde **A+B** seç.
3. İçine **“simgeyi göster”** bloğu koy ve yıldızı seç.
4. Simülatörde önce A’ya tek başına, sonra **A+B** düğmelerine birlikte bas.

![A+B tuşuna basıldığında yıldız simgesini gösteren MakeCode blokları](./gorseller/gizli-selam-makecode.svg "İki düğme birlikte bir olay başlatır.")

## Kartında dene

**1.** Kodu kartına aktar.

**2.** Önce A’ya tek bas; sonra iki düğmeye aynı anda bas.

::jest[Birlikte → ★]{tuslar="A,B"}

:::olmadiysa
Olay bloğunun menüsünde **A+B** seçildiğini kontrol et.
:::

## Anlat

::yaz[**Gözlemim:** Yalnız A’ya basınca \_\_\_\_\_\_\_\_\_\_.]{satir=2}

::yaz[**Neden?** Yıldızın görünmesi için hangi düğmeler gerekli?]{satir=2}

## Tek şeyi değiştir

Yıldız yerine kalp seç. A+B’ye basınca ne değişti?

::yaz[Ne değişti?]{satir=2}
