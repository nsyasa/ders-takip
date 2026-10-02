---
ders: microbit
numara: 38
slug: proje-38
baslik: "Ziyaretçi sayan zil"
ozet: "Buton basılı tutulsa bile yalnız yeni basışı say ve kart hoparlöründe kısa ses çal."
sureDk: 20
seviye: "İleri"
onkosulFoyler: []
kavramlar:
  - "yeni basışı bir kez sayma"
hedefler: []
malzemeler:
  - ad: "P2 buton devresi"
  - ad: "micro:bit V2 hoparlörü"
gorseller:
  - "ziyaretci-say-makecode"
  - "ziyaretci-hazirlik-makecode"
adimSayisi: 6
yazSayisi: 4
---

## Önce tahmin et

:::tahmin
Üç saniye basılı tutmak bir mi, birçok mu ziyaret saymalı?
:::

::yaz[Tahminim]{satir=1}

## Yap

1. [37. projenin](proje:37) P2–GND butonunu kullan; harici buzzer bağlama.
2. Sayıyı 0 ve basılı bilgisini yanlış başlat. P2 ilk kez 0 olunca sayıyı artır, sesi çal, basılı bilgisini doğru yap.
3. P2 yeniden 1 olunca basılı bilgisini yanlış yap. B ile sayıyı sıfırla.

:::galeri
![Yeni basışı bir kez sayan döngü](./gorseller/ziyaretci-say-makecode.svg "1 · Her yeni basışı say")

![P2 yukarı çekme ayarı ve B ile sayacı sıfırlama](./gorseller/ziyaretci-hazirlik-makecode.svg "2 · Başlangıç ve sıfırlama")

:::

## Anlat

::yaz[**Gözlemim:** Üç ayrı basışta sayı \_\_\_ oldu.]{satir=2}

::yaz[**Neden?** Basılı bilgisini tutmasaydık ne olurdu?]{satir=2}

## Tek şeyi değiştir

“Tiz Do” sesini “Orta Do” yap. Ziyaret sesi nasıl değişti?

::yaz[Ne değişti?]{satir=2}
