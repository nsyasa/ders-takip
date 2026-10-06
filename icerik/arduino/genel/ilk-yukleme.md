---
tur: "genel"
baslik: "İlk programı derle ve yükle"
slug: "ilk-yukleme"
sira: 5
ustbilgi: "Başlarken"
---

1. Arduino IDE’yi resmî kaynaktan kur. Veri taşıyan USB kablosunu tak; dış devre bağlamadan kartı bilgisayara bağla.
2. Kart seçimini Arduino Uno yap. USB ile bağlanan karta ait portu seç; portun adı bilgisayarına göre değişir.
3. CH340 için port görünmüyorsa kabloyu ve bağlantıyı kontrol et. Gerekirse öğretmenin kart satıcısının veya üreticinin uygun sürücüsünü kursun.
4. Örneklerden Blink programını aç. Doğrula düğmesi kodu derler; bu işlem programı karta göndermez.
5. Derleme başarılıysa Yükle düğmesini kullan. Seçili kart ve port doğru olmalı; yükleme sonucunu IDE’nin mesajından oku.
6. Programı karta yükledikten sonra L göstergesini gözle. İlk dış LED çalışması için [Proje 1](proje:1)’deki D8 bağlantısını ayrıca kur.
7. Seri Monitör’ü aç; hızını programdaki Serial.begin değeriyle eşleştir. Kitap programlarında belirtilen hız çoğunlukla 9600 baud’dur.

:::bilgi[Doğrula ile Yükle ayrı işlerdir]{renk=mavi}
Doğrula derleme sonucunu verir. Yükle derlenen programı karta aktarır. Başarılı derleme, doğru portu veya devre davranışını tek başına kanıtlamaz.
:::

| Adım | Gözlemim |
|---|---|
| Kart ve port seçimi |   |
| Doğrula sonucu |   |
| Yükle sonucu |   |
| L göstergesinin davranışı |   |

## Seri Monitör’ü oku

| Ne görürsün? | Ne anlama gelir? |
|---|---|
| Anlamsız karakterler | Hız programdakiyle aynı değil; Serial.begin değerini (çoğunlukla 9600 baud) seç. |
| Hiç satır yok | Program Seri Monitör’e yazmıyor olabilir (örnek: [Proje 21](proje:21)) ya da port yanlış. |
| Satırlar düzenli geliyor | Program çalışıyor. Sayıları tahmininle karşılaştır ve gözlemini yaz. |
| Hep aynı sayı | Sensör bağlantısı ya da pin adı yanlış olabilir. USB’yi çıkarıp yolu izle. |
