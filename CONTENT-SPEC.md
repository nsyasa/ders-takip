# İçerik Şartnamesi (CONTENT-SPEC)

Bu belge `icerik/` altındaki dosyaların biçimini tanımlar. Site bunları okuyacak; içerik dosyalarını değiştirmeyin.

## 1. Klasör yapısı
```
icerik/<ders>/
  ders.json            ders tanımı
  foy-00.md … foy-12.md  föyler (ders.numara sırasıyla)
  genel/*.md           genel sayfalar (tur: "genel")
  kodlar/<Klasör>/     Arduino klasörleri (<Klasör>.ino + varsa .h)
  gorseller/*.svg      devre şemaları (viewBox'lı, ölçeklenir)
```
Görsel yolları föy dosyasına göre göreli: `./gorseller/foy4.svg`. Astro'nun içerik klasöründeki göreli görsel desteğini kullanın ya da derleme adımında kopyalayın.

## 2. `ders.json`
`kod`, `ad`, `altbaslik`, `aciklama`, `renk`, `ikon`, `sira`, `durum` (`hazir` | `yakinda`), `foySayisi`, `toplamSureDk`, `genelSayfalar` (slug listesi).

## 3. Föy frontmatter alanları
| Alan | Anlamı |
|---|---|
| `ders`, `numara`, `slug` | ders kodu, föy numarası (YAML'da `no` yazılmadı: bazı ayrıştırıcılar `no`'yu false sayar), dosya adı |
| `baslik`, `altbaslik` | başlık ve alt başlık |
| `dersSaati`, `sureDk` | okunabilir süre ve dakika |
| `seviye` | Başlangıç, Başlangıç+, Orta, Orta+, İleri |
| `onkosul`, `onkosulFoyler` | metin ve föy numaraları |
| `kavramlar` | etiket listesi |
| `hedefler` | "…yapabilirim" cümleleri |
| `malzemeler` | `{ad, adet, not}` listesi |
| `kodlar`, `gorseller` | bu föyde geçen kod klasörleri ve görseller |
| `adimSayisi`, `yazSayisi` | onay kutusu ve yazma alanı sayısı |

Föy gövdesinde H1 yoktur; sayfa başlığı frontmatter'dan gelir. Her `##` başlığı bir bölümdür (katlanır). Sabit bölüm adları: Hedeflerim, Malzemeler, Kavram…, Bağlantı, Etkinlik N — …, Deney, Kodu Tamamla (Föy 9–12), Hata Avcısı, Şimdi Sıra Sende, YZ ile Destek Al, Kendimi Kontrol Ediyorum.

## 4. Gövde biçimleri
**Kutular** (`remark-directive` container):
```
:::dikkat[Güç kutusu]
içerik (paragraf, liste)
:::
```
Türler: `bilgi` (mavi), `dikkat` (kırmızı, güvenlik), `fen` (yeşil, fen bağlantısı), `rutin` (turuncu), `yz` (turkuaz). Başlık köşeli parantez içindedir; olmayabilir.

**Yazma alanı** (leaf directive): `::yaz[Etiket]{satir=3}` = öğrencinin tahmin/gözlem/cevap yazacağı kutu (`textarea`, `satir` kadar yükseklik). İçerik `localStorage`'a kaydedilir; kimlik: föy slug'ı + sıra numarası.

**Onay kutuları:** `- [ ] metin` = ilerleme adımı. "Şimdi Sıra Sende" görevleri ve "Öz değerlendirme" bu biçimdedir. İşaretli durum `localStorage`'da tutulur; tümü işaretlenince föy bitmiş sayılır.

**Kod blokları:**
````
```cpp title="Kod 1.1 — Foy1_ButonOku" start=1 dosya=Foy1_ButonOku
...
```
````
- `title`: başlık; `start`: ilk satırın numarası (bölünmüş kodlarda 1'den büyük olabilir); `dosya`: `kodlar/` altındaki klasör; `parca`: klasörde birden fazla dosya varsa dosya adı.
- Satır numarası `start`'tan başlayarak gösterilir (metindeki "Satır 12" atıfları bu numaralara göredir). Kopyala düğmesi gösterilen bloğu, indir düğmesi `dosya` klasörünü verir.
- Arduino IDE için klasör adı ile `.ino` adı aynı olmalıdır; klasör yapısını değiştirmeyin.
- "Kodu Tamamla" kodlarındaki ``` `___1___` ``` işaretleri boşluktur; bilerek derlenmez.

**Tablolar:** GFM. Başlığı boş olan ya da hücreleri boş bırakılmış tablolar öğrencinin dolduracağı tablolardır. İlk sürümde düz gösterin; sonraki sürümde hücreleri düzenlenebilir yapabilirsiniz. Dar ekranda yatay kaydırılabilir olmalı.

**Görseller:** `![alt](./gorseller/x.svg)`. Dar ekranda taşmamalı; dokunarak büyütme iyi olur.

**Metin direktifleri** (`:ad`) kullanılmaz; yanlışlıkla eşleşirse devre dışı bırakın.

## 5. Genel sayfalar (`genel/*.md`)
`baslik`, `slug`, `sira` alanları vardır: kitap-hakkinda, kit-ve-surum, malzemelerimizi-taniyalim, rutin-kartlari, ogrenme-zinciri, yz-kullanimi. Ders sayfasında "Genel bilgiler" altında listeleyin. Föylerdeki "R1 Yükleme Rutini", "R2 Güç Kontrol Rutini" gibi atıflar `rutin-kartlari` sayfasına bağlanabilir.

## 6. Pakette olmayanlar
Öğretmen notları, cevap anahtarları, süre planları, çözümlü kodlar ve öğretmen yönergeleri yoktur. Föylerdeki "Kendimi Kontrol" soruları cevapsız yazma alanıdır.
