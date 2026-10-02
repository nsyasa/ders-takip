---
ders: microbit
numara: 19
slug: proje-19
baslik: "Logoya dokun"
altbaslik: "Yalnız mıcro:bıt v2"
ozet: "Kartın önündeki altın renkli logoya dokununca ekranda mutlu yüz gör. Logo, parmağının elektriksel özelliğini algılar; buna kapasitif dokunma denir."
sureDk: 10
seviye: "Temel"
onkosulFoyler: []
kavramlar:
  - "dokunmatik giriş"
hedefler: []
malzemeler:
  - ad: "micro:bit V2"
  - ad: "veri USB kablosu"
gorseller:
  - "logoya-dokun-makecode"
adimSayisi: 6
yazSayisi: 4
---

## Önce tahmin et

:::tahmin
Yalnız A düğmesine basarsan mutlu yüz çıkar mı?
:::

::yaz[Tahminim]{satir=1}

## Yap

1. Yeni projede **Giriş** bölümünden **“on logo pressed”** (logoya dokunulduğunda) olay bloğunu bul.
2. Olayın içine **“simgeyi göster”** bloğunu koy; **mutlu yüz** simgesini seç.
3. Simülatörde logoya dokun. Ardından A düğmesini de dene.

![MakeCode içinde on logo pressed olayına bağlanan mutlu yüzü göster bloğu](./gorseller/logoya-dokun-makecode.svg "Logo olayı blokta İngilizce görünebilir: “on logo pressed”.")

## Kartında dene

Kodu karta aktar. Kartın önündeki altın renkli logoya parmağınla hafifçe dokun.

::jest[Dokun → yüz]{tuslar="☺"}

:::olmadiysa
A düğmesine değil, üstteki logoya dokunduğundan emin ol. Bu özellik V2 karttadır.
:::

## Anlat

::yaz[**Gözlemim:** Mutlu yüz \_\_\_\_\_\_\_\_\_\_ dokununca göründü.]{satir=2}

::yaz[**Neden?** A düğmesine basmak neden bu kodu başlatmadı?]{satir=2}

## Tek şeyi değiştir

Mutlu yüz yerine **kalp** simgesini seç. Kartı yine nasıl başlattın?

::yaz[Ne değişti?]{satir=2}
