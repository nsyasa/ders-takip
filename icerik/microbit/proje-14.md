---
ders: microbit
numara: 14
slug: proje-14
baslik: "Işığı ölç"
altbaslik: "Sensörden sayıya"
ozet: "A’ya basınca kart çevresindeki ışığı bir sayı ile göstersin. LED ekranı ışığı da algılar; değer 0 (karanlık) ile 255 (parlak) arasındadır."
sureDk: 15
seviye: "Temel"
onkosulFoyler: []
kavramlar:
  - "sensör değeri"
hedefler: []
malzemeler:
  - ad: "micro:bit V2"
  - ad: "veri USB kablosu"
gorseller:
  - "isigi-olc-makecode"
adimSayisi: 6
yazSayisi: 6
---

## Önce tahmin et

:::tahmin
LED ekranı elinle gölgelersen sayı artar mı, azalır mı?
:::

::yaz[Tahminim]{satir=1}

## Yap

1. Yeni projede **“A tuşuna basıldığında”** bloğunu ekle.
2. İçine **“sayıyı göster”** koy. Sayı alanına **Giriş** bölümündeki **“ışık seviyesi”** bloğunu tak.
3. Simülatörde ışık kaydırıcısını değiştirip A’ya bas. İki sonucu karşılaştır.
4. Kartta ilk okumada **0** görürsen ışık algısı açıldıktan sonra A’ya yeniden bas.

![A tuşuna basıldığında ışık seviyesini sayı olarak gösteren MakeCode blokları](./gorseller/isigi-olc-makecode.svg "Işık değeri LED ekranından algılanır.")

## Kartında dene

Kodu karta aktar. Aydınlıkta A’ya bas; sayıyı yaz. Ekranı elinle gölgele ve yeniden bas.

::yaz[Aydınlık]{satir=1}

::yaz[Gölgede]{satir=1}

:::olmadiysa
**“ışık seviyesi”** bloğu **“sayıyı göster”** alanının içinde mi? İlk 0’dan sonra tekrar ölç.
:::

## Anlat

::yaz[**Gözlemim:** Gölgede sayı \_\_\_\_\_\_\_\_\_\_.]{satir=2}

::yaz[**Neden?** Sayı hangi değişikliği anlatıyor?]{satir=2}

## Tek şeyi değiştir

Kodu değiştirmeden el fenerini ekrana yaklaştır. En yüksek okuduğun değer kaç?

::yaz[Ne değişti?]{satir=2}
