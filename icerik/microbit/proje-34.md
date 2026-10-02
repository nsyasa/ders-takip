---
ders: microbit
numara: 34
slug: proje-34
baslik: "Basılı tutma süresi"
altbaslik: "Dış devre"
ozet: "Önceki projenin harici düğmesiyle basılı kalma süresini ölç."
sureDk: 30
seviye: "İleri"
onkosulFoyler: [33]
kavramlar:
  - "harici butonla süre ölçme"
hedefler: []
malzemeler:
  - ad: "P1 LED"
  - ad: "P2 buton devresi (33. proje)"
gorseller:
  - "basili-tutma-suresi-makecode"
adimSayisi: 6
yazSayisi: 4
---

## Önce tahmin et

:::tahmin
Uzun basışta sayı büyür mü?
:::

::yaz[Tahminim]{satir=1}

## Yap

1. USB/pili çıkar; [33. projenin](proje:33) P2 buton ve dirençli P1 LED yollarını kur.
2. P2 iç yukarı çekmesini aç; basınca zamanı kaydet ve LED'i yak.
3. Bırakınca LED'i söndür ve geçen saniyeyi göster.

![Basılı tutma süresi için gerçek MakeCode blokları](./gorseller/basili-tutma-suresi-makecode.svg "Basışta başlangıcı sakla; bırakınca geçen süreyi göster.")

## Kartında dene

Bir ve üç saniyelik basışları karşılaştır.

:::olmadiysa
USB/pili çıkar; düğmenin P2–GND yolunu öğretmeninle kontrol et. Başlangıç ve bırakma geçişlerini karşılaştır.
:::

## Anlat

::yaz[**Gözlemim:** Kısa \_\_\_\_ sn; uzun \_\_\_\_ sn.]{satir=2}

::yaz[**Neden?** Serbest=1, basılı=0 ne demek?]{satir=2}

## Tek şeyi değiştir

Saniyeye çevirirken kullanılan böleni 1000 yerine 100 yap. Gösterilen sayı nasıl değişti?

::yaz[Ne değişti?]{satir=2}
