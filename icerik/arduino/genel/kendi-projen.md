---
tur: "genel"
baslik: "Birleştirme fikirleri"
slug: "kendi-projen"
sira: 7
ustbilgi: "Geliştir"
---

## Sekiz fikirden birini seç

| Fikir | Kâğıtta planla |
|---|---|
| Işık ve ses kartı | [Proje 1](proje:1) ile [Proje 3](proje:3)’ün çıktılarını kâğıtta birleştir. Aynı olayın ışık ve sesini ayrı pinlerle planla. |
| Ayarlanabilir ışık eşiği | [Proje 5](proje:5) ile [Proje 7](proje:7)’yi karşılaştır. Potansiyometre ayarını ve LDR okumasını iki analog girişe ayıran bir plan çiz. |
| Mesafe durum ışığı | [Proje 9](proje:9) ile [Proje 6](proje:6)’dan bir fikir seç. Ölçüm yok durumunu renk kararından önce kontrol eden bir akış çiz. |
| İstekli karton gösterge | [Proje 12](proje:12) ile [Proje 10](proje:10)’un olay ve servo komutunu birleştiren kâğıt planı yap. Servoya mekanik yük ekleme. |
| Ortam kayıt kartı | [Proje 16](proje:16) ve [Proje 19](proje:19) okumalarını ayrı adlarla göster. Toprak göstergesi ile bağıl nemi aynı yüzde gibi yorumlama. |
| Ses ve durum sayacı | [Proje 17](proje:17)’nin yeni olayını [Proje 12](proje:12)’nin sayacıyla karşılaştır. Sürekli sesin yeni olay sayılmadığı bir durum planla. |
| Tek ölçüm, iki gösterim | [Proje 22](proje:22) ile [Proje 23](proje:23)’teki mesafeyi karşılaştır. Servo komutu ve gösterge aralığı için ayrı çıkış kutuları çiz. |
| İstek ve öncelik tablosu | [Proje 21](proje:21) ve [Proje 24](proje:24)’teki karar sıralarını karşılaştır. Meşgul istek ile ölçüm hatasını ayrı durumlar olarak yaz. |

:::bilgi[Yeni bağlantıdan önce]{renk=mavi}
Bu fikirler hazır birleştirme programları değildir. Pin, akım ve zaman çakışmalarını kâğıtta incele; öğretmenin kontrol etmeden yeni devreye enerji verme.
:::

### Çözülmüş örnek plan

| Plan adımı | Ayarlanabilir ışık eşiği |
|---|---|
| Fikir | Ayarlanabilir ışık eşiği: oda kararınca LED yansın; eşiği potla ayarla. |
| Girdi | LDR bölücüsü A0’dan ışığı okur; pot A1’den eşiği okur ([Proje 7](proje:7) ve [Proje 5](proje:5)). |
| Karar | A0 okuması eşikten küçükse karanlık say. LED kapalıyken okuma \< esik − 20 ise aç, açıkken okuma \> esik + 20 ise kapat; arada durumu koru. |
| Çıktı | D9’daki LED karanlıkta yanar; Seri Monitör ışık okumasını ve eşiği yazar. |
| Bağlantı | LDR ile 10 kΩ bölücü, potun üç ucu, LED ile 220 Ω; tek GND rayı. |
| Deney | Tek değişiklik: marjı 20’den 50’ye çıkar; eşik yakınında LED’in titreyip titremediğini kaydet. |

## Fikrini küçük bir deneye dönüştür

**Fikrim:** Hangi küçük sorunu veya bilgiyi göstermek istiyorum?

::yaz[Fikrim]{satir=3}

**Girdi:** Hangi set parçasından hangi bilgiyi okuyacağım?

::yaz[Girdi]{satir=3}

**Karar:** Ölçüm yokken ve eşik yakınındayken ne yapacağım?

::yaz[Karar]{satir=3}

**Çıktı:** Işık, ses, gösterge veya servo hangi bilgiyi bildirecek?

::yaz[Çıktı]{satir=3}

**Bağlantı:** Pinleri, ayrı delikleri, GND rayını ve seri dirençleri nerede kullanacağım?

::yaz[Bağlantı]{satir=3}

**Deney:** Tek değişiklik nedir; tahminimi ve gözlemimi nerede yazacağım?

::yaz[Deney]{satir=3}

:::bilgi[Başlamadan kontrol et]{renk=yesil}
- Yalnız set parçaları var.
- Pinler ve güç yolları ayrı.
- Gerçek model doğrulandı.
- Hata durumu tanımlandı.
- Tek değişiklik seçildi.
- Tahmin ve gözlem alanı boş.
:::
