# Proje kuralları: ders takip sitesi

Amaç: Öğrencilere yönelik, reklamsız, mobil öncelikli ders takip sitesi. İlk ders ESP32 Robot Kulübü; sonra micro:bit ve Arduino.

## Teknik
- Astro, tamamen statik çıktı. Sunucu, veritabanı, hesap yok.
- İçerik: `icerik/` altındaki Markdown dosyaları (.md; MDX kullanma). Biçim şartnamesi: `CONTENT-SPEC.md`; yalnız `icerik/` dosyasına dokunacaksan ya da içerik biçimini etkileyen bir iş yapacaksan oku, yalnız site koduyla çalışırken okuma.
- Kutular ve yazma alanları için `remark-directive` ile küçük bir eklenti yaz.
- Varsayılan sıfır JavaScript; yalnız ilerleme takibi, kod kopyalama, yazma alanları ve arama küçük adalar olsun.
- Dış font, CDN, analitik, çerez, reklam yok. Kişisel veri toplanmaz (kullanıcılar çocuk).
- Yazı tipleri kendi sunucumuzdan verilebilir (`src/assets/fonts/`, açık lisanslı, lisans metni yanında); üçüncü tarafa istek atılmaz.

## Kalite
- Mobil öncelikli; Lighthouse performans ve erişilebilirlik ≥ 95 (mobil).
- Türkçe arayüz (`lang="tr"`), klavye erişimi, yüksek kontrast, karanlık mod.
- Yeni ders eklemek yalnız yeni klasör açmak olsun; site kodu değişmesin.

## Çalışma şekli
- `icerik/` dosyalarının metnini değiştirme; hata görürsen raporla. (`.claude/settings.json` bu klasöre yazmadan önce onay ister.)
- Önce plan sun, onay bekle.
- Aşama içinde yalnız `npm run dogrula` (içerik, <1 sn) ve `npm run check` (kod, ~15 sn) çalıştır; `npm run build` yalnız aşama sonunda çalışır ve hatasız olmalı.
- `.claude/hooks/` kancaları `icerik/` düzenlenince dogrula'yı, `src/` düzenlenince check'i kendiliğinden çalıştırır ve yalnız hata varsa bildirir; aynı komutu elle tekrar çalıştırma. `check-taban.json` bilinen eski hataları yok sayar.
- `README.md` büyüktür (~17 KB): tamamını okuma; `## ` başlıklarını listele, yalnız ilgili bölümü oku.
- Yeni ders için `/yeni-ders-ekle` kullan.
- Nasıl çalıştırılacağını `README` içinde anlat.
