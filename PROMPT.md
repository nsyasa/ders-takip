Görev: `CLAUDE.md` ve `CONTENT-SPEC.md` dosyalarını oku, sonra `icerik/` klasöründeki derslerle çalışan bir "ders takip" sitesi kur.

Özellikler:
1. Ana sayfa: ders kartları (ESP32, micro:bit, Arduino; `ders.json`'a göre), her kartta ilerleme çubuğu. `durum: "yakinda"` olan ders tıklanamaz, "Yakında" etiketi alır.
2. Ders sayfası: föy listesi; her satırda durum (başlamadı / devam ediyor / bitti), süre, seviye, kavram etiketleri. Tıklayınca föy sayfası.
3. Föy sayfası: her `##` bölüm katlanır (accordion); "Hedeflerim" ve "Malzemeler" ayrıca üstte özet olarak gösterilsin (frontmatter'dan).
   - Kutular (`:::bilgi`, `:::dikkat`, `:::fen`, `:::rutin`, `:::yz`), kod blokları (satır numaralı, kopyala ve indir düğmeli), görseller (SVG, dar ekranda taşmadan), tablolar (yatay kaydırılabilir).
   - `::yaz` alanları: öğrencinin yazacağı kutular (localStorage'a kaydedilir).
   - `- [ ]` onay kutuları ilerleme adımıdır; hepsi işaretlenince föy "bitti". Önceki/sonraki föy düğmeleri; önkoşul föyler belirtilsin.
4. İlerleme ve yazılanlar yalnız cihazda (localStorage). "Dışa aktar / içe aktar (JSON)" ve "kaldığın yerden devam et".
5. Arama (Pagefind), karanlık mod, föy sayfası için yazdırma CSS'i (A4).
6. `genel/` sayfaları (Rutin Kartları, Malzemelerimizi Tanıyalım, Kit ve Sürüm, Kitap Hakkında, Öğrenme Zinciri, YZ Kullanımı) ders sayfasında "Genel bilgiler" bölümünde listelensin.

Çalışma şekli: önce kısa bir plan ve klasör yapısı öner, onayımı bekle. Sonra iskelet ve iki föyle (Föy 1 ve Föy 6) çalışan bir örnek, sonra kalan föyler. Her aşamada `npm run build` hatasız olsun; çalıştırma ve yayınlama adımlarını README'ye yaz.
