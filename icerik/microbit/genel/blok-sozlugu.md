---
tur: genel
baslik: "Blokların dilini çöz"
slug: blok-sozlugu
sira: 5
ustbilgi: "Başlamadan önce • Küçük blok sözlüğü"
---

Kitapta Türkçe konuşuyoruz. MakeCode’daki bazı bloklar İngilizce görünebilir; bu eşleştirmeyi kullan.

### on start

**program başladığında:** Kart açılınca, sıfırlanınca veya yeni kod başlayınca bir kez çalışır.

### forever

**her zaman:** İçindeki komutları tekrarlar.

### on button A pressed

**A tuşuna basıldığında:** A düğmesine bastığın anda çalışır. Tuş ve düğme burada aynı parçadır.

### sound level / threshold

**ses düzeyi / eşik:** Mikrofon 0–255 arası değer verir; yüksek ses olayı seçilen eşiğe göre başlar.

### on logo pressed / touched / released

**Logo olayları:** Touched dokunma başlangıcını, Released bırakmayı bildirir ([25. proje](proje:25)). Pressed ayrı bir basış olayıdır ([19. proje](proje:19)); seçilen olay adıyla çalış.

### analog read pin

**analog oku pin:** P0 veya P2 üzerindeki değişen gerilimi 0–1023 arasında bir sayıya dönüştürür.

### digital read pin

**dijital oku pin:** Butonun bağlı olduğu P2’de 0 veya 1 okur.

### play tone

**ses çal:** Kısa ton çıkarır. **set audio pin enabled false:** dış ses pinini kapat. **set built-in speaker AÇIK:** kart hoparlörünü aç.

### true / false

**doğru / yanlış:** Bir koşulun iki olası sonucu. [24. projede](proje:24) açık durumunu saklar.

### calibrate compass

**pusulayı kalibre et:** İlk kullanımda kartı ekrandaki noktaları dolduracak biçimde eğerek yön ölçümünü hazırla.

### radio set group

**radyo grubunu ayarla:** Aynı sayıdaki kartlar mesaj alışverişi yapabilir; grup gizli bir kanal değildir.

### datalogger

**veri günlüğü:** Ölçüm ve yer numarasını kartın belleğine satır olarak kaydeder.

### plot bar graph … up to

**çubuk grafik:** Ölçülen sayıyı seçilen en büyük değere göre LED sütunuyla gösterir.

### set columns / log data

**sütunları ayarla / veriyi kaydet:** [28. projede](proje:28) yer ve isik sütunlarına yeni satır yazar.

### if / else

**eğer / değilse:** Ölçüm eşikle karşılaştırılır ve iki sonuçtan biri seçilir.

### set pull up

**iç yukarı çekmeyi aç:** Buton serbestken P2'nin 1 okunmasını sağlar.

:::bilgi
[41](proje:41)–[45](proje:45). projelerde sensörün analog çıkışı yalnız gerilim bölücünün ölçüm düğümünden P0'a gider. Kuru ve ıslak örnekleri gerçek devrede kaydet.
:::

:::bilgi[Hatırla]
Blokta gördüğün yazıyı aynen ara. Bir sözcüğü anlamazsan bu sayfaya geri dön.
:::
