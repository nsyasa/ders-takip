# Proje kuralları: ders takip sitesi

Amaç: Öğrencilere yönelik, reklamsız, mobil öncelikli ders takip sitesi. İlk ders ESP32 Robot Kulübü; sonra micro:bit ve Arduino.

## Teknik
- Astro, tamamen statik çıktı. Sunucu, veritabanı, hesap yok.
- İçerik: `icerik/` altındaki Markdown dosyaları (.md; MDX kullanma). Biçim şartnamesi: `CONTENT-SPEC.md`. Oturuma başlarken onu oku.
- Kutular ve yazma alanları için `remark-directive` ile küçük bir eklenti yaz.
- Varsayılan sıfır JavaScript; yalnız ilerleme takibi, kod kopyalama, yazma alanları ve arama küçük adalar olsun.
- Dış font, CDN, analitik, çerez, reklam yok. Kişisel veri toplanmaz (kullanıcılar çocuk).

## Kalite
- Mobil öncelikli; Lighthouse performans ve erişilebilirlik ≥ 95 (mobil).
- Türkçe arayüz (`lang="tr"`), klavye erişimi, yüksek kontrast, karanlık mod.
- Yeni ders eklemek yalnız yeni klasör açmak olsun; site kodu değişmesin.

## Çalışma şekli
- `icerik/` dosyalarının metnini değiştirme; hata görürsen raporla.
- Önce plan sun, onay bekle. Her aşamada `npm run build` hatasız olsun.
- Nasıl çalıştırılacağını `README` içinde anlat.
