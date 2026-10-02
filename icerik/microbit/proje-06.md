---
ders: microbit
numara: 6
slug: proje-06
baslik: "Dijital zar"
altbaslik: "Salla ve gör"
ozet: "Kartı sallayınca ekranda 1 ile 6 arasında bir sayı görünsün. Her atışta hangi sayı geleceğini önceden bilemezsin."
sureDk: 15
seviye: "Temel"
onkosulFoyler: []
kavramlar:
  - "rastgele sayı"
hedefler: []
malzemeler:
  - ad: "micro:bit V2"
  - ad: "veri USB kablosu"
gorseller:
  - "dijital-zar-makecode"
adimSayisi: 6
yazSayisi: 5
---

## Önce tahmin et

:::tahmin
İki sallamada aynı sayı gelebilir mi?
:::

::yaz[Tahminim]{satir=1}

## Yap

1. Yeni projede **Giriş** bölümünden **“salla ise”** bloğunu al.
2. İçine **Temel** bölümündeki **“sayıyı göster”** bloğunu yerleştir.
3. **Matematik** bölümünden **“rastgele değer seçimi 1 ila 6”** bloğunu sayı yerine tak.
4. Simülatörde sallama düğmesini birkaç kez kullan; sayıları kaydet.

![Salla ise olayında 1 ila 6 arasında rastgele değer seçip sayıyı gösteren MakeCode blokları](./gorseller/dijital-zar-makecode.svg "1 ve 6 da seçilebilen sayılar arasındadır.")

## Kartında dene

**1.** Kodu kartına aktar.

**2.** Kartı USB kablosunu germeden kısa ve hızlı biçimde salla. Üç sonucu sırayla not et.

::yaz[Kartta gördüğüm sayılar]{satir=1}

:::olmadiysa
Kartı salladığında olayın başladığını ve rastgele bloğun **“sayıyı göster”** içinde olduğunu kontrol et.
:::

## Anlat

::yaz[**Gözlemim:** Gördüğüm sayılardan biri: \_\_\_\_\_\_\_\_.]{satir=2}

::yaz[**Neden?** Aynı sayı yeniden gelirse kod bozulmuş olur mu?]{satir=2}

## Tek şeyi değiştir

Üst sınırı **6** yerine **3** yap. Şimdi hangi sayılar gelebilir?

::yaz[Ne değişti?]{satir=2}
