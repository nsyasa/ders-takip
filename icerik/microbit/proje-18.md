---
ders: microbit
numara: 18
slug: proje-18
baslik: "Mini melodi"
altbaslik: "Yalnız mıcro:bıt v2"
ozet: "A’ya basınca kartın hoparlöründen üç seslik bir melodi duy. Do–Mi–Sol sesleri giderek incelir: ses inceldikçe titreşim sayısı (frekans) artar."
sureDk: 15
seviye: "Temel"
onkosulFoyler: []
kavramlar:
  - "hoparlörden ses çıkarma"
hedefler: []
malzemeler:
  - ad: "micro:bit V2"
  - ad: "veri USB kablosu"
gorseller:
  - "mini-melodi-makecode"
adimSayisi: 6
yazSayisi: 4
---

## Önce tahmin et

:::tahmin
Üç sesin inceliği aynı mı olacak?
:::

::yaz[Tahminim]{satir=1}

## Yap

1. Yeni projeye **“A tuşuna basıldığında”** bloğunu ekle.
2. **Müzik** bölümünden üç **“ton çal süre”** bloğunu olayın içine sırayla yerleştir.
3. Tonları **Orta Do**, **Orta Mi**, **Orta Sol**; süreleri sırasıyla **200**, **200**, **400 ms** yap.
4. Simülatörde A’ya basıp sesleri dinle.

![A tuşuna basıldığında Orta Do, Orta Mi ve Orta Sol tonlarını sırayla çalan MakeCode blokları](./gorseller/mini-melodi-makecode.svg "Tonlar sırayla çalar; son ses daha uzun sürer.")

## Kartında dene

Kodu karta aktar. A’ya bir kez basıp V2 hoparlörünü dinle.

::jest[Üç kısa ses]{tuslar="♪"}

:::olmadiysa
Kartın V2 olduğunu ve ses düzeyini kontrol et. Bazı tarayıcılarda simülatör sesi açılmayabilir.
:::

## Anlat

::yaz[**Gözlemim:** Duyduğum sesler gittikçe \_\_\_\_\_\_\_\_\_\_.]{satir=2}

::yaz[**Neden?** Son ses neden ötekilerden uzun sürüyor?]{satir=2}

## Tek şeyi değiştir

Son sesin süresini **400** yerine **800 ms** yap. Ne değişti?

::yaz[Ne değişti?]{satir=2}
