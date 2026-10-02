---
ders: microbit
numara: 5
slug: proje-05
baslik: "Mini animasyon"
altbaslik: "Hareket yanılsaması"
ozet: "Bir ışık noktası soldan sağa gidiyormuş gibi görünsün. Beş resmi art arda göstererek hareket oluştur."
sureDk: 15
seviye: "Temel"
onkosulFoyler: []
kavramlar:
  - "resim dizisi"
hedefler: []
malzemeler:
  - ad: "micro:bit V2"
  - ad: "veri USB kablosu"
gorseller:
  - "mini-animasyon-adimlari"
adimSayisi: 6
yazSayisi: 4
---

## Önce tahmin et

:::tahmin
Yan yana beş LED sırayla yanarsa nokta kayıyor gibi görünür mü?
:::

::yaz[Tahminim]{satir=1}

## Yap

1. Yeni projede hazır gelen **“her zaman”** bloğunu kullan.
2. İçine beş **“led’leri göster”** bloğu ekle. Orta sırada soldan sağa ilerleyen beş komşu LED’i sırayla, her resimde yalnız birini yak.
3. Her resmin altına **“duraklat (ms) 120”** ekle.
4. Simülatörde ışık noktasını izle.

![Her zaman içinde soldan sağa ilerleyen beş ayrı LED resmi ve her resimden sonra 120 milisaniye duraklatma](./gorseller/mini-animasyon-adimlari.svg "Kod akışı: beş resim, her birinin altında bir bekleme. MakeCode’da her resim için bir “led’leri göster” bloğu kullan.")

## Kartında dene

Kodu kartına aktar. Nokta soldan sağa gidip başa dönüyor gibi görünüyor mu?

:::olmadiysa
Her resimde yalnız bir LED yak; beş beklemeyi **“her zaman”** içinde tut. Nokta zıplıyor gibiyse 80–150 ms dene.
:::

## Anlat

::yaz[**Gözlemim:** Nokta bana \_\_\_\_\_\_\_\_\_\_ gibi göründü.]{satir=2}

::yaz[**Neden?** Ekranda gerçekten kayan bir LED mi var, yoksa beş resim mi değişiyor?]{satir=2}

## Tek şeyi değiştir

Beş beklemeyi **600 ms** yap. Hareket görünümü nasıl değişti? Sonra 120 ms’ye dön.

::yaz[Ne değişti?]{satir=2}
