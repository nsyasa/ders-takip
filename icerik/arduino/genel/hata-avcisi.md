---
tur: "genel"
baslik: "Mesajı oku, sonra nedeni ara"
slug: "hata-avcisi"
sira: 6
ustbilgi: "Başlarken"
---

| Belirti | Ne anlatır? | Ne yap? |
|---|---|---|
| Derleme hatası | Kod karta gönderilmeden bulunur. | İlk hata satırını oku; parantezleri, yazımı ve gereken kütüphaneyi kontrol et. |
| Yükleme hatası | Derlenmiş program karta aktarılamaz. | Kartı, portu ve veri kablosunu kontrol et; portu kullanan başka pencereyi kapat. |
| Port görünmüyor | Kablo, USB bağlantısı veya sürücü etkileyebilir. | Bilinen veri kablosuyla dene; sürücü kontrolünü öğretmeninle yap. |
| Çıktı beklediğin gibi değil | Derleme ve yükleme doğru olsa da devre farklı olabilir. | USB’yi çıkar; pinleri, GND yolunu, dirençleri ve modelini yeniden kontrol et. |
| Okuma yok / hata mesajı | Geçerli sensör verisi alınmamış olabilir. | Hata mesajını kaydet; eski veya uydurma sayıyı yeni ölçüm gibi kullanma. |

:::bilgi[Tek değişiklik yap]{renk=mavi}
Hata mesajını ve son yaptığın değişikliği yaz. USB çıkarılmışken bir bağlantıyı kontrol et; sonra aynı denemeyi yeniden yap.
:::

## Sık görülen mesajlar

| IDE’de gördüğün | Ne anlatır? |
|---|---|
| `expected ';' before …` | Bir önceki satırın sonunda noktalı virgül eksik. |
| `'ledPini' was not declared in this scope` | Ad yanlış yazılmış ya da tanımlanmamış; büyük ve küçük harfe bak. |
| `Servo.h: No such file or directory` | Kütüphane kurulu değil ya da adı yanlış; Kütüphane Yöneticisi’ne bak. |
| `avrdude: … not in sync / not responding` | Yükleme sırasında kartla konuşulamadı; kartı, portu ve kabloyu kontrol et. |
| `Port busy / Access is denied` | Port başka bir pencerede açık; diğer Seri Monitör’ü ya da programı kapat. |

::yaz[İlk hata mesajım]{satir=2}

::yaz[Kontrol ettiğim tek şey]{satir=2}

::yaz[Yeniden deneme gözlemim]{satir=2}
