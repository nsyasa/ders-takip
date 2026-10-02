---
ders: microbit
numara: 3
slug: proje-03
baslik: "Duygu rozeti"
altbaslik: "İki düğme"
ozet: "Bir düğme mutlu, öteki üzgün yüz göstersin. Kart, seçtiğin duyguya göre değişsin."
sureDk: 10
seviye: "Temel"
onkosulFoyler: []
kavramlar:
  - "iki ayrı düğme olayı"
hedefler: []
malzemeler:
  - ad: "micro:bit V2"
  - ad: "veri USB kablosu"
gorseller:
  - "duygu-rozeti-makecode"
adimSayisi: 6
yazSayisi: 4
---

## Önce tahmin et

:::tahmin
Önce A’ya, sonra B’ye basarsan ekranda en son hangi yüz kalır?
:::

::yaz[Tahminim]{satir=1}

## Yap

1. MakeCode’da **Yeni Proje** aç. **Giriş** bölümünden iki **“tuşuna basıldığında”** bloğu al.
2. İlk blokta **A**, ikinci blokta **B** seç.
3. Her bloğun içine birer **“simgeyi göster”** bloğu koy. A için mutlu, B için üzgün yüz seç.
4. Simülatörde A’ya, sonra B’ye bas.

![A tuşuna basıldığında mutlu simge, B tuşuna basıldığında üzgün simge gösteren iki MakeCode blok dizisi](./gorseller/duygu-rozeti-makecode.svg "Her düğmenin kendi kodu var.")

## Kartında dene

**1.** Kodu kartına aktar.

**2.** A’ya bas; çıkan yüzü incele. Sonra B’ye bas.

::jest[Mutlu → üzgün]{tuslar="A,B"}

:::olmadiysa
İki olay bloğunun da çalışma alanında ve her birinin içinde bir simge bloğu olduğuna bak.
:::

## Anlat

::yaz[**Gözlemim:** B’den sonra ekranda \_\_\_\_\_\_\_\_\_\_ yüz kaldı.]{satir=2}

::yaz[**Neden?** Hangi düğme hangi kodu çalıştırdı?]{satir=2}

## Tek şeyi değiştir

B’nin yüzünü başka bir simgeyle değiştir. A’ya basınca ne oldu?

::yaz[Ne değişti?]{satir=2}
