---
name: yeni-ders-ekle
description: Siteye yeni ders klasörü (icerik/<ders>/) ekler ya da "yakında" bir dersi hazırlar. Yalnız /yeni-ders-ekle ile çalışır.
disable-model-invocation: true
argument-hint: <ders-kodu> "<Ders adı>" [foy|proje] [okunur|sevimli]
---

# Yeni ders ekle

Argümanlar: `$ARGUMENTS` — ders kodu (küçük harf, ASCII, boşluksuz; klasör adı olur), ders adı, isteğe bağlı birim (`foy` varsayılan | `proje`) ve tema (`okunur` varsayılan | `sevimli`). Eksik olanı tek soruda sor, tahmin etme.

**Kural (CLAUDE.md):** yeni ders yalnız yeni klasör açmaktır. `src/`, `astro.config.mjs` ve diğer derslere dokunma. Site koduna dokunmadan olmuyorsa dur, nedenini raporla.

## Adımlar

1. **Var mı bak.** `icerik/<kod>/ders.json`:
   - yoksa yeni ders;
   - `durum: "yakinda"` ise o dersi hazırlıyorsun: mevcut `kapak`, `kapakAlt`, `sira`, `renk`, `ikon` alanlarını koru;
   - `durum: "hazir"` ise dur ve kullanıcıya sor.
2. **Biçim gerekirse** `CONTENT-SPEC.md`'nin yalnız satır 16–45'ini (§2 `ders.json`, §3 föy frontmatter) oku. Tamamını okuma.
3. **`ders.json`** yaz ya da güncelle:
   - Zorunlu: `kod` (klasör adıyla aynı), `ad`, `durum`, `sira`. `sira` = `icerik/*/ders.json` içindeki en büyük `sira` + 1.
   - Önerilen: `altbaslik`, `aciklama`, `renk` (#RRGGBB), `ikon` (emoji), `foySayisi`, `toplamSureDk`, `birim`, `tema`, `etiketler`.
   - İçerik yokken: `durum: "yakinda"`, `foySayisi: 0`, `toplamSureDk: 0`.
4. **İlk içerik iskeleti** yalnız kullanıcı isterse. `foy-00.md` (birim `proje` ise `proje-01.md`; `numara` dosya adındaki sayıdır). Aşağıdaki şablon `npm run dogrula`'dan 0 hata, 0 uyarıyla geçer:

   ````markdown
   ---
   ders: "<kod>"
   numara: 0
   slug: "foy-00"
   baslik: "…"
   altbaslik: ""
   dersSaati: "1 ders saati"
   sureDk: 40
   seviye: "Başlangıç"
   onkosul: []
   onkosulFoyler: []
   kavramlar: []
   hedefler: ["… yapabilirim."]
   malzemeler: []
   kodlar: []
   gorseller: []
   adimSayisi: 1
   yazSayisi: 1
   ---

   ## Hedeflerim

   - … yapabilirim.

   ## Şimdi Sıra Sende

   - [ ] …

   ::yaz[Ne gözlemledin?]{satir=3}
   ````

   Kurallar: gövdede H1 yok; en az bir `##` bölümü var; `adimSayisi` = metindeki `- [ ]` sayısı (+ `adimEtiketleri` uzunluğu); `yazSayisi` = `::yaz` sayısı; foy biriminde `hedefler` boş olamaz.
5. **Föy eklendiyse** `ders.json`'da `durum: "hazir"`, `foySayisi` = dosya sayısı, `toplamSureDk` = `sureDk` toplamı yap. **`dogrula` föyleri yalnız `durum: "hazir"` derslerde denetler**; `yakinda` derste hatalı föy fark edilmez. Dersin sitede "hazır" görüneceğini kullanıcıya söyle.
6. **Doğrula:** `npm run dogrula` (0,7 sn). Hata varsa yalnız yeni dosyalarda düzelt; başka derslerdeki hataları yalnız raporla. **`npm run build` çalıştırma**; aşama sonunda kullanıcı ister.
7. **Kapak** (isteğe bağlı, yalnız kullanıcı resim verirse): `node scripts/kapak-ekle.mjs <kod> <resim.png> --alt "…"`.
8. **Rapor** (en çok 5 satır): oluşan dosyalar, `durum` değeri ve kalan işler (içerik yaz, kapak ekle, build).

`icerik/` altına yazarken onay penceresi çıkması normaldir (`.claude/settings.json` > `permissions.ask`); yeni ders için onay ver.
