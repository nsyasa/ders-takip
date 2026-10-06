---
tur: "genel"
baslik: "Güvenli çalış, pin adını oku"
slug: "guvenlik"
sira: 2
ustbilgi: "Başlarken"
---

**Yalnız USB ile çalış:** Şebeke elektriği kullanma. Bağlantıyı değiştirirken USB kablosunu çıkar; kontrol ettikten sonra yeniden tak.

**Akımı ve yönü doğrula:** Her LED ve segment kendi seri direncini kullanır. Güç, GND ve sinyal uçlarını gerçek modele göre eşleştir; ısınırsa USB’yi çıkar.

**Buzzer ve güç pinini kontrol et:** UNO pini için akım en fazla 20 mA olmalı. Aktif buzzer uygunluğu öğretmenle doğrulanır; sensör VCC ucu GPIO’dan değil UNO 5 V hattından beslenir. Sınırı aşan yükü UNO pininden sürme; buzzer’ı kulağına yaklaştırma.

**Servoyu yüksüz kullan:** Ana çalışmalarda SG90 yüksüzdür; kola kapak veya karton takılmaz. Parmaklarını hareket yolundan uzak tut; ağır kapak Ek Kitap konusudur.

**Elektroniği kuru tut:** Yalnız probun izin verilen bölgesi toprağa veya suya değsin. UNO, breadboard, elektronik başlık ve USB kuru kalsın; sıvı değişiminde USB’yi çıkar.

**Eğitim modelini sınırla:** Trafik modeli gerçek trafik kontrolü değildir. Akıllı baston gerçek bir yardımcı cihaz değildir; gerçek kullanım veya insan güvenliği için denenmez.

## Kitabın renk anahtarı

| Renk | Anlam |
|---|---|
| Kırmızı | 5 V / güç |
| Siyah | GND / ortak referans |
| Sarı | Dijital sinyal |
| Turkuaz | Analog sinyal |

_Gerçek jumper’ın rengi görevini belirlemez; pin adı belirleyicidir. RGB kanal renkleri ilgili projede ayrıca açıklanır._

## Başlamadan kontrol et

- USB kablosu çıkarıldı; devrede şebeke elektriği yok.
- Her LED ve segmentin kendi seri direnci var.
- Buzzer en çok 20 mA çekiyor; sensör UNO 5 V hattından beslenir.
- Servo yüksüz; parmaklar hareket yolundan uzak.
- Su yalnız sensör ucunda; breadboard, jumper ve USB kuru.
- Modül ve LM35 uç sırası gövde yazısından okundu.
- Buzzer kulaktan uzak tutuluyor.
- [Proje 24](proje:24) bir eğitim modelidir; gerçek yardımcı cihaz değildir.
