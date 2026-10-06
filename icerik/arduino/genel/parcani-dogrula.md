---
tur: "genel"
baslik: "Parçanı doğrula"
slug: "parcani-dogrula"
sira: 4
ustbilgi: "Başlarken"
---

Bir parçayı devreye koymadan önce kendin sına. Her testte gözlemini yaz; kitaptaki örnek sonucu kendi sonucun yerine geçirme. Testten önce ve bağlantı değiştirirken USB’yi çıkar.

:::bilgi[1 · Buton ve eğim anahtarı: uç bulucu]{renk=gri}
**Yöntem A (Proje [4](proje:4)–[13](proje:13)):** 5 V → buton bacağı; diğer bacak → D2; D2 → 10 kΩ → GND. LED D8’den 220 Ω ile GND’ye gider. *uc\_bulucu\_a* programı D2’yi okur, LED’i yakar. LED yalnız basınca yanıyorsa iki bacak anahtarlanan çifttir; hep yanıyorsa bacaklar zaten bağlıdır, butonu 90° çevir.

**Yöntem B ([Proje 14](proje:14) ve sonrası):** Bacaklardan biri D2’ye, diğeri GND’ye gider; direnç gerekmez. *uc\_bulucu\_b* programı INPUT\_PULLUP kullanır ve Seri Monitör’e 1 ya da 0 yazar. Basınca ya da eğince 0 oluyorsa uçlar doğrudur; hep 0 yazıyorsa bacaklar zaten bağlıdır.

::yaz[anahtarlanan çift … / … · gözlem: …]{satir=1}
:::

:::bilgi[2 · RGB LED: bacak tarama]{renk=gri}
Ortak bacak adayını GND’ye bağla. Diğer bacaklardan birine 220 Ω üzerinden 3,3 V ver; bir renk yanıyorsa LED ortak katottur. Hiçbiri yanmıyorsa adayı 3,3 V’a, diğer bacağı 220 Ω ile GND’ye bağla; yanıyorsa ortak anottur. Her denemede tek bacak dene, direnci asla atlama. Aynı yöntem 7 segmentte de kullanılır.

::yaz[ortak tür … · R … G … B …]{satir=1}
:::

:::bilgi[3 · Modül etiketi: VCC, OUT, GND]{renk=gri}
Modülün üstündeki pin yazısını oku: VCC (ya da +), OUT (ya da S, DO, AO, DATA), GND (ya da −). HC-SR04’te sıra VCC, Trig, Echo, GND’dir. Sırayı soldan sağa yaz ve projedeki çizimle karşılaştır. Sıra farklıysa çizimi kendi modeline göre değiştir; yazı okunmuyorsa modülü bağlama. Ters besleme modülü ısıtır ve bozar.

::yaz[soldan sağa … / … / … / … (üç uçluda sonuncusu boş)]{satir=1}
:::

:::bilgi[4 · Direnç: renk bandı]{renk=gri}
Altın ya da gümüş bant sağda kalacak biçimde tut. Bu kitaptaki 4 bantlı dirençlerde ilk iki bant rakam, üçüncü bant çarpan, sonuncusu toleranstır. [Setini tanı](genel:setini-tani) sayfasındaki renk bandı tablosunu kullan. Örnek: kırmızı-kırmızı-kahverengi 220 Ω; kahverengi-siyah-turuncu 10 kΩ.

::yaz[bantlar … → değer … Ω]{satir=1}
:::

## Bu testler hangi projede?

| Test | Projeler |
|---|---|
| 1 · Buton ve eğim anahtarı: uç bulucu | [4](proje:4), [12](proje:12), [14](proje:14), [21](proje:21) |
| 2 · RGB LED: bacak tarama | [6](proje:6), [23](proje:23) |
| 3 · Modül etiketi: VCC, OUT, GND | [8](proje:8), [9](proje:9), [13](proje:13), [14](proje:14), [15](proje:15), [16](proje:16), [17](proje:17), [18](proje:18), [19](proje:19), [22](proje:22), [23](proje:23), [24](proje:24) |
| 4 · Direnç: renk bandı | [1](proje:1), [7](proje:7), [20](proje:20) |

## Araç programları

*uc\_bulucu\_a* ve *uc\_bulucu\_b* proje programı değildir; yalnız parçayı sınar.

```cpp title="Yöntem A · uc_bulucu_a" start=1 dosya=uc_bulucu_a
const byte butonPini = 2;
const byte ledPini = 8;

void setup() {
  pinMode(butonPini, INPUT);
  pinMode(ledPini, OUTPUT);
}

void loop() {
  int okuma = digitalRead(butonPini);
  digitalWrite(ledPini, okuma);
}
```

```cpp title="Yöntem B · uc_bulucu_b" start=1 dosya=uc_bulucu_b
const byte girisPini = 2;
const unsigned long haberlesmeHizi = 9600;
const unsigned int beklemeMs = 200;

void setup() {
  pinMode(girisPini, INPUT_PULLUP);
  Serial.begin(haberlesmeHizi);
}

void loop() {
  int okuma = digitalRead(girisPini);
  Serial.println(okuma);
  delay(beklemeMs);
}
```
