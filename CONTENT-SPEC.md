# İçerik Şartnamesi (CONTENT-SPEC)

Bu belge `icerik/` altındaki dosyaların biçimini tanımlar. Site bunları okuyacak; içerik dosyalarını değiştirmeyin.

## 1. Klasör yapısı
```
icerik/<ders>/
  ders.json            ders tanımı
  foy-00.md … foy-12.md  föyler (ders.numara sırasıyla); ders.json > birim: "proje" ise proje-01.md … proje-45.md
  genel/*.md           genel sayfalar (tur: "genel")
  kodlar/<Klasör>/     Arduino klasörleri (<Klasör>.ino + varsa .h)
  gorseller/*.svg      devre şemaları (viewBox'lı, ölçeklenir); *.webp/*.png/*.jpg resimler de yayınlanır
```
Görsel yolları föy dosyasına göre göreli: `./gorseller/foy4.svg`. Astro'nun içerik klasöründeki göreli görsel desteğini kullanın ya da derleme adımında kopyalayın.

## 2. `ders.json`
`kod`, `ad`, `altbaslik`, `aciklama`, `renk`, `ikon`, `sira`, `durum` (`hazir` | `yakinda`), `foySayisi`, `toplamSureDk`, `genelSayfalar` (slug listesi).

İsteğe bağlı görünüm alanları (yazılmazsa ESP32 gibi sade "okunur" ders olur):

| Alan | Anlamı |
|---|---|
| `birim` | `"foy"` (varsayılan) ya da `"proje"`: sayfalarda "Föy 3" mü "Proje 3" mü denir; dosyalar `foy-NN.md` / `proje-NN.md` olur. |
| `tema` | `"okunur"` (varsayılan) ya da `"sevimli"`: renkli, çocuk dostu görünüm (LED rakamlar, Bit maskotu, adım yolu; bölümler akordeon değil, hepsi açık). |
| `kapak`, `kapakAlt` | `gorseller/<kapak>.webp`: ders kartı ve ders sayfası başlığındaki çizim ve alt metni. |
| `etiketler` | Ders kartındaki kısa etiketler (ör. `["5. sınıf", "10–11 yaş"]`). |
| `adimEtiketleri` | `[{ad, aciklama}]`: proje sayfasının üstündeki adım yolu (ör. Bak, Tahmin et, Kodla, Dene, Anlat, Değiştir). Her adım bir onay kutusudur; `adimSayisi` bu sayıdır. |
| `uniteler` | `[{ad, ilk, son, renk}]`: ders sayfasında projeler bu numara aralıklarına göre gruplanır. Aralıklar çakışmamalı. |

## 3. Föy frontmatter alanları
| Alan | Anlamı |
|---|---|
| `ders`, `numara`, `slug` | ders kodu, föy numarası (YAML'da `no` yazılmadı: bazı ayrıştırıcılar `no`'yu false sayar), dosya adı |
| `baslik`, `altbaslik` | başlık ve alt başlık (proje için kısa etiket: "İlk kodum") |
| `ozet` | başlığın altında görünen tek-iki cümle (proje girişi; çok kısımlı projede boş olabilir) |
| `dersSaati`, `sureDk` | okunabilir süre ve dakika |
| `seviye` | Başlangıç, Başlangıç+, Orta, Orta+, İleri; proje derslerinde Temel, İleri, Çevre |
| `onkosul`, `onkosulFoyler` | metin ve föy numaraları |
| `kavramlar` | etiket listesi |
| `hedefler` | "…yapabilirim" cümleleri |
| `malzemeler` | `{ad, adet, not}` listesi |
| `kodlar`, `gorseller` | bu föyde geçen kod klasörleri ve görseller |
| `adimSayisi`, `yazSayisi` | onay kutusu ve yazma alanı sayısı. Adım yolu olan derslerde `adimSayisi` = metindeki `- [ ]` sayısı + `adimEtiketleri` uzunluğu |

Proje derslerinde `hedefler` boş olabilir (kitapta hedef cümlesi yoktur); `onkosulFoyler` bu dersin hangi projelerinin önce yapılması gerektiğini söyler (sayfada durum rozetiyle gösterilir). Föy gövdesinde H1 yoktur; sayfa başlığı frontmatter'dan gelir. Her `##` başlığı bir bölümdür (katlanır). Sabit bölüm adları: Hedeflerim, Malzemeler, Kavram…, Bağlantı, Etkinlik N — …, Deney, Kodu Tamamla (Föy 9–12), Hata Avcısı, Şimdi Sıra Sende, YZ ile Destek Al, Kendimi Kontrol Ediyorum.

## 4. Gövde biçimleri
**Kutular** (`remark-directive` container):
```
:::dikkat[Güç kutusu]
içerik (paragraf, liste)
:::
```
Türler: `bilgi` (mavi), `dikkat` (kırmızı, güvenlik), `fen` (yeşil, fen bağlantısı), `rutin` (turuncu), `yz` (turkuaz). Başlık köşeli parantez içindedir; olmayabilir.

**Yazma alanı** (leaf directive): `::yaz[Etiket]{satir=3}` = öğrencinin tahmin/gözlem/cevap yazacağı kutu (`textarea`, `satir` kadar yükseklik). İçerik `localStorage`'a kaydedilir; kimlik: föy slug'ı + sıra numarası.

**"Sevimli" tema direktifleri** (`ders.json > tema: "sevimli"` derslerinde):
- `:::tahmin` … `:::` — "Önce tahmin et" kutusu: Bit maskotu yanındadır (içerik yalnız soru metnidir; yazma alanı ayrıca `::yaz` ile konur).
- `:::olmadiysa` … `:::` — takılınca bakılacak yardım notu (başlığı otomatik "Olmadıysa").
- `:::kontrol[Başlık]` … `:::` — içinde madde listesi olan, kâğıtta işaretlenecek boş kutulu kontrol listesi.
- `:::galeri` … `:::` — içindeki görseller yan yana (geniş ekranda iki sütun) durur.
- `::jest[Bas → oku]{tuslar="A,B"}` — düğme/simge işaretli kısa yönerge (`tuslar`: virgülle ayrılmış harf ya da simge).
- `::sira[0 → 1 → (B) → 0]` — adım adım değişen değerler; `(B)` ok üstündeki düğmedir.
- `::kunye{sure="10" fikir="…" malzeme="…"}` — çok kısımlı projelerde her kısmın süre/yeni fikir/gereken künyesi.
- Çok kısımlı projede `##` = kısım ("1. kısım — Başlık"), `###` = adım bölümleri (Önce tahmin et, Yap, Kartında dene, Anlat, Tek şeyi değiştir). Tek kısımlı projede `##` doğrudan adım bölümüdür.

**Bağlantılar:** aynı dersteki sayfalara `[31. proje](proje:31)`, `[Föy 6](foy:6)`, `[Sözlük](genel:sozluk)` yazılır; adres taban yoluyla üretilir. Hedef yoksa `npm run dogrula` hata verir.

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
`baslik`, `slug`, `sira` alanları (isteğe bağlı `ustbilgi`: başlığın üstündeki küçük etiket) vardır: kitap-hakkinda, kit-ve-surum, malzemelerimizi-taniyalim, rutin-kartlari, ogrenme-zinciri, yz-kullanimi. Ders sayfasında "Genel bilgiler" altında listeleyin. Föylerdeki "R1 Yükleme Rutini", "R2 Güç Kontrol Rutini" gibi atıflar `rutin-kartlari` sayfasına bağlanabilir.

## 6. Pakette olmayanlar
Öğretmen notları, cevap anahtarları, süre planları, çözümlü kodlar ve öğretmen yönergeleri yoktur. Föylerdeki "Kendimi Kontrol" soruları cevapsız yazma alanıdır.

## 7. Betikle üretilen içerik (micro:bit)

`icerik/microbit/` kitaptan `scripts/microbit-donustur.mjs` ile üretilir; elle düzenlenmez (README: *micro:bit dersi: kitaptan dönüştürme*). Üretilen dosyalar bu şartnameye uyar; MakeCode blok görselleri (`gorseller/*-makecode.svg`) küçültülmüş SVG'lerdir (kök sınıfı `mc-blok`) ve temaya göre yeniden boyanmaz.
