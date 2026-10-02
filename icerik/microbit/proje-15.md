---
ders: microbit
numara: 15
slug: proje-15
baslik: "Karanlıkta yıldız"
altbaslik: "Eşikle karar ver"
ozet: "Kart ışık düzeyini izlesin. Seçtiğin sınırın altına inince LED ekranda yıldız belirsin."
sureDk: 20
seviye: "Temel"
onkosulFoyler: []
kavramlar:
  - "eşik ve koşul"
hedefler: []
malzemeler:
  - ad: "micro:bit V2"
  - ad: "veri USB kablosu"
gorseller:
  - "karanlikta-yildiz-makecode"
adimSayisi: 6
yazSayisi: 4
---

## Önce tahmin et

:::tahmin
Ortam yeniden aydınlanınca yıldız ekranda kalır mı?
:::

::yaz[Tahminim]{satir=1}

## Yap

1. Yeni projede hazır gelen **“her zaman”** bloğuna **“eğer / değilse”** yapısını ekle.
2. Koşulu **“ışık seviyesi \< 80”** yap. **80**, bu projenin deneme sınırıdır.
3. **Eğer** bölümüne yıldızlı **“simgeyi göster”**; **değilse** bölümüne **“ekranı temizle”** koy.
4. Yapının altına **“duraklat (ms) 200”** ekle. Simülatörde ışığı azaltıp artır.

![Işık seviyesi 80 altındaysa yıldız gösteren, değilse ekranı temizleyen ve 200 milisaniye bekleyen MakeCode blokları](./gorseller/karanlikta-yildiz-makecode.svg "80 kesin karanlık ölçüsü değil, değiştirilebilir eşiktir.")

## Kartında dene

Kodu karta aktar. LED ekranını elinle gölgele, sonra yeniden aydınlat.

::jest[Gölge → yıldız]{tuslar="★"}

:::olmadiysa
Işığı ölç projesindeki değeri hatırla. Ortamına göre eşik **80** çok düşük olabilir. İlk okuma 0 ise açılışta yıldız kısa süre görünebilir.
:::

## Anlat

::yaz[**Gözlemim:** Yıldız \_\_\_\_\_\_\_\_\_\_ durumda göründü.]{satir=2}

::yaz[**Neden?** Işık 80’in üstüne çıkınca hangi bölüm çalışır?]{satir=2}

## Tek şeyi değiştir

Eşiği **80** yerine **140** yap. Yıldız ne zaman görünüyor?

::yaz[Ne değişti?]{satir=2}
