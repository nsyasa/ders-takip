---
tur: "genel"
baslik: "Kitap Hakkında"
slug: "kitap-hakkinda"
sira: 1
---

Bu kitap, Arduino ile temel devre ve kod deneyimi olan ortaokul ve lise öğrencilerinin ESP32 ile sensör, veri kaydı, web ve kablosuz haberleşme uygulamaları geliştirmesi için hazırlanmıştır. Her föy aynı sırayı izler: **hedef → kavram → bağlantı → tahmin → kod → kodun mantığı → deney → kodu tamamla (Föy 9–12) → hata avcısı → kendi görevin → YZ desteği → kendini kontrol**.

Kodu çalıştırmadan önce **tahmin etmek**, föylerin en önemli alışkanlığıdır. Tahminin yanlış çıkarsa sorun yok: asıl öğrenme, tahminle gözlem arasındaki farkı açıklarken olur.

| İşaret | Anlamı |
| --- | --- |
| ★ / ★★ | İleri / meydan okuma görevi |

## Sınıf Sabit Pin Planı

| İşlev | ESP32 pini | Föyler |
| --- | --- | --- |
| I2C SDA / SCL | GPIO21 / GPIO22 | 2, 3, 4, 7, 8, 9, 10, 11, 12 |
| SPI SCK / MISO / MOSI | GPIO18 / 19 / 23 | 9 |
| MicroSD CS | GPIO27 | 9 |
| WS2812 veri | GPIO16 | 10 |
| Servo sinyal | GPIO25 | 6 |
| Buton | GPIO26 | 1, 5 |
| PIR çıkış | GPIO32 | 5, 10 |
| Buzzer / LED | GPIO33 | 0, 1, 4, 5, 8 |
