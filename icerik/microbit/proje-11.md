---
ders: microbit
numara: 11
slug: proje-11
baslik: "Eğilince ok"
altbaslik: "Hareketi algıla"
ozet: "Kartı sola ya da sağa eğ. Ekrandaki ok, kartın hangi yana eğildiğini göstersin."
sureDk: 15
seviye: "Temel"
onkosulFoyler: []
kavramlar:
  - "eğilme olayı"
hedefler: []
malzemeler:
  - ad: "micro:bit V2"
  - ad: "veri USB kablosu"
gorseller:
  - "egilince-ok-makecode"
adimSayisi: 6
yazSayisi: 4
---

## Önce tahmin et

:::tahmin
Kartı önce sola, sonra sağa eğersen ekranda en son hangi ok kalır?
:::

::yaz[Tahminim]{satir=1}

## Yap

1. Yeni projede **Giriş** bölümünden iki hareket olayı al: **“sola eğin ise”** ve **“sağa eğin ise”**.
2. Sola eğilme bloğuna **“Batı oku göster”** ekle; bu ok sola bakar.
3. Sağa eğilme bloğuna **“Doğu oku göster”** ekle; bu ok sağa bakar.
4. Simülatörde kartı fareyle sola ve sağa yatır; okları gözle.

![Sola eğilince Batı, sağa eğilince Doğu okunu gösteren iki MakeCode hareket olayı](./gorseller/egilince-ok-makecode.svg "Ekran sana bakarken Batı = sol, Doğu = sağ.")

## Kartında dene

Kodu karta aktar. Kartı iki elinle tutup yavaşça sola, sonra sağa eğ.

::sira[sola ← → sağa]

:::olmadiysa
Kartı düz konumdan başlayarak belirgin biçimde yana eğ; iki olayın ok yönlerini kontrol et.
:::

## Anlat

::yaz[**Gözlemim:** Sağa eğince ok \_\_\_\_\_\_\_\_\_\_ yönüne baktı.]{satir=2}

::yaz[**Neden?** Düğmeye basmadan kodu hangi hareket başlattı?]{satir=2}

## Tek şeyi değiştir

Sağa eğilmedeki oku yukarı okla değiştir. Sol oka ne oldu?

::yaz[Ne değişti?]{satir=2}
