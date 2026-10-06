# Robot Kulübü Ders Takip

Öğrenciler için reklamsız, mobil öncelikli, tamamen statik ders takip sitesi. Dersler: **ESP32 Robot Kulübü** (13 föy) ve **micro:bit Başlangıç** (45 proje, çocuklara yönelik "sevimli" görünüm); Arduino "Yakında" kartı olarak bekliyor.

- Sunucu, veritabanı, hesap, çerez, reklam, analiz **yok**. Dış font ya da CDN yok.
- İlerleme (onay kutuları) ve öğrencinin yazdıkları **yalnız o cihazın tarayıcısında** (`localStorage`) durur. Başka cihaza taşımak için *Verilerim* sayfasından JSON yedeği alınır.
- İçerik `icerik/` altındaki Markdown dosyalarıdır. Site kodu içeriği değiştirmez; yalnız okur.

## Gereksinimler

- Node.js **22.12 ya da üstü** ve npm. ([nodejs.org](https://nodejs.org))

## Çalıştırma

```bash
npm install        # bir kez
npm run dev        # geliştirme sunucusu → http://localhost:4321
npm run build      # içerik denetimi + site + arama dizini → dist/
npm run preview    # derlenmiş siteyi dene → http://localhost:4321
npm run dogrula    # yalnız içerik denetimi (dosyalara dokunmaz, rapor verir)
npm run check      # TypeScript / Astro tür denetimi
```

- **Arama** (Pagefind) yalnız `npm run build` sonrasında çalışır; `npm run dev` sırasında arama sayfası "dizin bulunamadı" der. Denemek için `npm run build && npm run preview`.
- `npm run build` önce `scripts/dogrula.mjs` ile `icerik/` klasörünü `CONTENT-SPEC.md`'ye göre denetler (frontmatter, onay kutusu / `::yaz` sayıları, görseller, kod klasörleri, kutu eşleşmeleri). **Hata** varsa derleme durur; **uyarı** yalnız bilgidir. Bu betik içeriği düzeltmez, yalnız raporlar.

## İçerik nasıl siteye dönüşür

| İçerikte | Sitede |
|---|---|
| `icerik/<ders>/ders.json` | Ana sayfadaki ders kartı. `durum: "yakinda"` ise tıklanamaz, "Yakında" etiketi alır. |
| `icerik/<ders>/proje-NN.md` | `ders.json > birim: "proje"` olan derste proje sayfası (`/<ders>/proje-NN/`); sayfalarda "Föy" yerine "Proje" denir. Üniteler (`uniteler`) ders sayfasında projeleri gruplar. |
| `icerik/<ders>/foy-NN.md` | `/<ders>/foy-NN/` föy sayfası. Her `##` bölümü katlanır. "Hedeflerim" ve "Malzemeler" frontmatter'dan sayfa üstünde özet olarak gösterilir (gövdedeki kopyaları akordeondan çıkarılır). |
| `:::bilgi`, `:::dikkat`, `:::fen`, `:::rutin`, `:::yz` | Renkli ve **etiketli** kutular (renge bağımlı değil, siyah-beyaz baskıda da ayırt edilir). |
| `::yaz[Etiket]{satir=3}` | Yazma alanı (`textarea`); yazdıkça cihaza kaydedilir. |
| `- [ ] …` | İlerleme adımı. Hepsi işaretlenince föy "bitti" olur. |
| ` ```cpp title=… start=… dosya=… ` | Renkli, satır numaralı kod; **Kopyala** ve **İndir** (`kodlar/<dosya>/` klasörünün `.zip`'i; Arduino IDE için klasör adı = `.ino` adı korunur). |
| `icerik/<ders>/genel/*.md` | `/<ders>/genel/<slug>/` sayfaları; ders sayfasında "Genel bilgiler" altında `ders.json > genelSayfalar` sırasıyla listelenir. |
| `:::tahmin`, `:::olmadiysa`, `:::kontrol`, `:::galeri`, `::jest`, `::sira`, `::kunye` | "Sevimli" ders temasının küçük bileşenleri (Bit'li tahmin kutusu, yardım notu, kontrol listesi, yan yana görseller, düğme ipucu, değer dizisi, kısım künyesi). Ayrıntı: `CONTENT-SPEC.md`. |
| `[metin](proje:31)`, `foy:6`, `genel:sozluk` | Aynı dersteki sayfalara bağlantı (adres taban yoluyla üretilir; `npm run dogrula` hedefin var olduğunu denetler). |
| `icerik/<ders>/gorseller/*.svg` | Föyde **satır içi**, temaya göre yeniden boyanmış (aşağıda *Şemalar*); dokununca büyür, alt yazı alt metinden gelir. Ayrı dosya olarak da yayınlanır. |

Kod yapısı:

```
src/
  content.config.ts        koleksiyonlar (kimlik = ders/slug)
  plugins/                 remark-icerik (kutular, ::yaz, onay kutusu, tablo, görsel, bağlantılar),
                           remark-kod (kod bloğu), remark-bolumler (## → akordeon; sevimli temada sabit bölüm)
  lib/                     depo.ts (localStorage), veri.ts (sözcük dağarcığı, üniteler), dosyalar.ts (zip, görseller),
                           ayar.mjs (BASE_PATH), sema-boya.mjs (SVG şemaları temaya göre yeniden boyar),
                           makecode.mjs (MakeCode blok görselleri), led.mjs (LED rakamlar + Bit), gorsel-boyut.mjs
  scripts/                 küçük istemci betikleri (ilerleme, föy, kod kopyalama)
  pages/                   index, [ders]/index, [ders]/[foy], [ders]/genel/[slug], verilerim, ara, 404
  styles/                  tema.css, bilesenler.css, sevimli.css (micro:bit teması), yazdir.css (A4)
scripts/dogrula.mjs        içerik denetimi
scripts/microbit-donustur.mjs   micro:bit kitabını siteye çevirir (aşağıda)
scripts/lib/               html-md.mjs (kitap HTML'i → Markdown), makecode-kucult.mjs (MakeCode SVG küçültücü)
scripts/microbit-ek/       betiğin kullandığı, elle çizilmiş küçük şemalar
```

## Yeni ders ya da föy eklemek

Site kodunu değiştirmeden:

1. `icerik/<ders>/ders.json` oluşturun (örnek: `icerik/esp32/ders.json`); hazırsa `"durum": "hazir"`.
2. Föyleri `foy-00.md …` olarak, genel sayfaları `genel/*.md` olarak ekleyin; kodları `kodlar/<Klasör>/<Klasör>.ino`, görselleri `gorseller/*.svg` altına koyun. Biçim: `CONTENT-SPEC.md`.
3. `npm run dogrula` ile denetleyin, sonra `npm run build`.

## micro:bit dersi: kitaptan dönüştürme

`icerik/microbit/` **elle yazılmaz**, kitaptan (`production-1-5`: `content/pages/*.md`, `project-manifest.json`, `src/assets/`) betikle üretilir. Kitap değişince:

```bash
node scripts/microbit-donustur.mjs [kitap-klasoru]   # yoksa MICROBIT_KAYNAK ortam değişkeni, o da yoksa betikteki varsayılan
node scripts/microbit-donustur.mjs --kuru            # dosya yazmaz; yalnız raporu basar
npm run build
```

- Kitap klasörüne **dokunulmaz**; yalnız okunur. `icerik/microbit/` içindeki proje, genel sayfa ve görseller her çalıştırmada yeniden yazılır (elle yaptığınız değişiklik kaybolur).
- Betik her sayfanın HTML'ini (`parse5`) Markdown'a çevirir, 45 projeyi manifestten kurar (çok sayfalı projeler "N. kısım" olur), **MakeCode blok görsellerini küçültür** (kitaptaki her SVG ~1,4 MB'tır; içinde MakeCode editörünün bütün stil dosyası vardır. Çizim aynı kalarak 3–90 KB'a iner: `scripts/lib/makecode-kucult.mjs`), kart ve kapak resimlerini WebP yapar.
- **Basılı kitaba özgü ifadeler** ("sonraki sayfa", "43. sayfa", "P24'te") sitede anlamsız olduğu için `scripts/lib/html-md.mjs` içindeki `METIN_KURALLARI` ile yeniden yazılır; rapor hangi kuralın kaç kez uygulandığını ve kalan "sayfa" geçişlerini gösterir. Kitabın kendi derleme betiği gibi `source-credit` (üretim notu) paragrafları ve "baskı taslağı" cümleleri sitede yer almaz; CC BY-SA kart görseli notu "Kartı tanı" sayfasında kalır.
- Kitaptaki **üniteler** (içindekiler grupları), **6 adımlı yol** (Bak, Tahmin et, Kodla, Dene, Anlat, Değiştir) ve seviye kümeleri (İleri: 21–30, 34, 38, 40) betiğin başındaki tablolarda tutulur.
- Gerekenler: `parse5` ve `sharp` (geliştirme bağımlılığı).

## Arduino dersi: kitaptan dönüştürme

`icerik/arduino/` **elle yazılmaz**, kitabın (`arduino-24-proje-v2`) basılı ekran PDF'lerinden betikle üretilir. Kitap değişince:

```bash
node scripts/arduino-donustur.mjs [kitap-klasoru]   # yoksa ARDUINO_KAYNAK, o da yoksa betikteki varsayılan
node scripts/arduino-donustur.mjs --kuru            # dosya yazmaz; yalnız raporu basar
python scripts/arduino/sadakat.py <kitap-klasoru>   # PDF'teki her satır sitede var mı?
npm run build
```

- **Kaynak basılı PDF'tir** (`cikti/Arduino_Baslangic_24_Proje_ekran.pdf`, `cikti/Ek_Kitap.pdf`). Kitabın `kitap/projeler/*.yaml` dosyaları basılı metnin bir kısmını tutmaz; sayfa başlıkları, kutular ve tablo başlıkları kitabın dizgi betiklerindedir.
- `scripts/arduino/pdf-oku.py` (Python + PyMuPDF; yol `ARDUINO_PYTHON` ile verilebilir) sayfaları yapılı bloklara çevirir: başlık, paragraf, liste, renkli kutu, tablo, pin rehberi, kod kutusu, çizim. Çıktı `.arduino-ara/` (git dışı). Breadboard ve devre çizimleri PDF'ten **vektör SVG** olarak kesilir; kod kutuları `.ino` dosyalarıyla satır satır eşleştirilir ve sitedeki kod dosyadan gelir.
- `scripts/arduino-donustur.mjs` blokları Markdown'a çevirir: 24 proje + Ek Kitap'ın 2 projesi (25–26), 8 adımlı yol (kitabın döngüsü), 7 bölüm + Ek Kitap ünitesi, giriş resimleri (WebP), proje ve deney kodları (`kodlar/`). Basılı kitaba özgü ifadeler ("ön sayfalardaki", "sonraki sayfada") uyarlanır, "Proje N" bağlantı olur; boşluklu form satırları ve soru kutuları yazma alanına dönüşür. Kitabın sürümü (git etiketi) `icerik/arduino/OKUBENI.md`'ye yazılır.
- Kitap klasörüne **dokunulmaz**. `ogretmen/` (beklenen sonuçlar) ve kitabın rapor klasörleri siteye alınmaz.

## GitHub Pages ile yayınlama

Siteyi GitHub'a yükleyip Actions ile otomatik yayınlarsınız (`.github/workflows/yayinla.yml` hazır).

1. GitHub'da yeni bir **depo** açın (ör. `ders-takip`). Bu klasör henüz bir git deposu değilse:
   ```bash
   git init -b main
   git add .
   git commit -m "Ders takip sitesi"
   git remote add origin https://github.com/<kullanici>/<depo>.git
   git push -u origin main
   ```
2. Depoda **Settings → Pages → Build and deployment → Source: GitHub Actions** seçin.
3. `main`'e her gönderimde **Actions → Yayınla** çalışır; bitince site `https://<kullanici>.github.io/<depo>/` adresinde olur.

**Adres yolu (`BASE_PATH`):** Site `https://<kullanici>.github.io/<depo>/` altında yayınlandığı için bağlantıların başına `/<depo>` eklenmelidir. Akış bunu depo adından otomatik verir. Özel alan adı kullanıyorsanız ya da depo adı `<kullanici>.github.io` ise kök kullanılır; elle ayarlamak için **Settings → Secrets and variables → Actions → Variables** altına `BASE_PATH` adıyla değer girin (kök için `/`).

Yayından önce yerelde aynı yolla denemek için:

```powershell
# Windows PowerShell
$env:BASE_PATH = "/ders-takip"; npm run build; npm run preview     # → http://localhost:4321/ders-takip/
$env:BASE_PATH = $null                                              # işiniz bitince temizleyin
```

```bash
# macOS / Linux
BASE_PATH=/ders-takip npm run build && npm run preview
```

> Windows'ta **Git Bash** `/ders-takip` değerini `C:/Program Files/Git/ders-takip` gibi bir yola çevirir ve derleme bozulur. Git Bash kullanıyorsanız komutun başına `MSYS_NO_PATHCONV=1` ekleyin ya da PowerShell kullanın.

Cloudflare Pages ya da başka bir statik barındırıcıda: derleme komutu `npm run build`, çıktı klasörü `dist`; `BASE_PATH` boş bırakılır.

## Öğrenciler için: evde de devam etmek

İlerleme hesapla değil cihazla tutulur. Bir föy bağlantısı tek başına açılır (ör. "bugün Föy 2'yi aç"); öğrenci evde de aynı adresten girebilir. Okulda bitirdiklerini evde görmek için:

1. Okulda: **Verilerim → Yedeği indir**. (Dosya yalnız öğrencinin işaretlerini ve yazdıklarını içerir.)
2. Evde: siteyi açıp **Verilerim → Yedeği yükle**. (O cihazdaki kayıtların yerine geçer.)

Ortak bilgisayarda profil/hesap yoktur: işi bitince **Yedeği indir**, sonra **Bu cihazdaki kayıtları sil**.

## Tasarım

**Kimlik:** föy = basılı çalışma kâğıdı. Kutu ve gölge yok, ince çizgiler; yazı tipi okunurluk için tasarlanmış Atkinson Hyperlegible Next, kod ve küçük etiketler JetBrains Mono. Renk yalnız iki yerde taşınır: föy numarasını gösteren **direnç bantları** ve kutu etiketleri (bilgi / dikkat / fen / rutin / YZ).

- **Direnç bandı** (`src/components/Direnc.astro`): iki basamak + çarpan (×1, siyah) + tolerans (altın). 0 siyah, 1 kahverengi, 2 kırmızı, 3 turuncu, 4 sarı, 5 yeşil, 6 mavi, 7 mor, 8 gri, 9 beyaz. Föy 6 → siyah-mavi-siyah-altın = 6 Ω; Föy 0 = 0 Ω'luk direnç (gerçekte atlama teli). Numara her yerde yazıyla da verilir; renk tek başına bilgi taşımaz.
- **Renkler ve ölçüler** `src/styles/tema.css` içindeki belirteçlerdir; açık/koyu tema `light-dark()` ile tek yerde tanımlıdır (desteklemeyen eski tarayıcıda açık değerler kullanılır).
- **Yazı tipleri** kendi sunucumuzdan verilir (`src/assets/fonts/`, SIL Open Font License; lisans metinleri aynı klasörde). Üçüncü tarafa istek atılmaz. Yazı tipi değişince sayfa kaymasın diye ana yazı tipleri `<link rel="preload">` ile önceden yüklenir ve yedek yazı tipleri ölçülerine göre ayarlanır (`yazi-tipleri.css` sonu; değerler `@capsizecss/unpack` ile yazı tipi dosyalarından hesaplandı). Yazı tipini değiştirirseniz bu değerleri yeniden hesaplayın. Fontsource paketlerinden alınan dosyalar yalnız Latin ve Latin-ext alt kümeleridir; italik yoktur (içerikte italik kullanılmıyor).
- **Baskı (A4):** `src/styles/yazdir.css`. Bölümler açık basılır, tema ne olursa olsun kâğıda açık renkler basılır.

### "Sevimli" tema (micro:bit)

`ders.json` içinde `"tema": "sevimli"` olan dersler çocuklara yönelik görünür; `src/styles/sevimli.css` yalnız `body.sevimli` altında etkindir, ESP32 gibi "okunur" temalı dersler etkilenmez.

- **Kimlik:** krem zemin, lacivert kalın çizgiler ve kaydırmalı gölgeler, turkuaz/sarı vurgular; başlıklar **Fredoka**, gövde Atkinson Hyperlegible Next. Fredoka yalnız bu derslerde yüklenir; yedek yazı tipi ölçüleri `@capsizecss` ile hesaplandı.
- **LED rakamlar** (`src/lib/led.mjs`): proje numarası micro:bit'in 5×5 LED'leri gibi 3×5 rakamlarla çizilir; proje bitince LED'ler parlar. Ders sayfasındaki ve ders kartındaki **45 LED'lik panel** her projeyi bir LED'e bağlar. Rakamlar `<symbol>`/`<use>` ile çizildiği için durum rengi `--led-a` özel özelliğiyle verilir (`use` içindeki öğelere kullanım yerinin üst öğeleri seçiciyle ulaşamaz, yalnız kalıtım geçer).
- **Bit:** micro:bit'in yüzlü maskotu (mutlu, düşünen, kutlayan); `:::tahmin` kutusunda ve ödül kartında görünür.
- **6 adımlı yol** (`Yol.astro`): `ders.json > adimEtiketleri`; her adım gerçek bir onay kutusudur (`input.adim-kutu`, `data-adim` 1–6) ve ilerleme depoya diğer onay kutuları gibi kaydedilir. `adimSayisi` bu sayıdır (`dogrula.mjs` adım yolunu da sayar). 6/6 olunca ödül kartı açılır.
- **Ana sayfa kapak kartları:** `ders.json > kapak` olan en az bir ders varsa ana sayfa kart galerisi olur (geniş ekranda yan yana). Kapak çizimi **3:2 yatay** çizilir; eklemek için `node scripts/kapak-ekle.mjs <ders> <resim> --alt "…"` (3:2'ye kırpar, 1000 px ve 700 px WebP üretir, `ders.json`'ı günceller). Şartlar ve GPT promptları: `kapak-gorselleri/PROMPTLAR.md`. micro:bit'in kapağı elle değiştirildiyse dönüştürücü ezmez (`--kapak-kitaptan` ile yeniden üretilir).
- **Bölümler sabittir** (akordeon yok): sayfalar kısadır, hepsi açıktır; yazdırmada da aynı. Çok kısımlı projelerde `##` = kısım, `###` = adım bölümleri.
- **MakeCode blokları:** küçültülmüş SVG'ler boyanmaz (blok renkleri anlam taşır), satır içi verilir; yazı JetBrains Mono ile blok genişliklerine oturur. Dar ekranda doğal boyutun %78'inin altına küçülmez, kutu yatay kayar; dokununca büyür.

### Şemalar (SVG)

`icerik/<ders>/gorseller/*.svg` dosyaları **değiştirilmez**; derlemede `src/lib/sema-boya.mjs` ile yeniden boyanır ve föy sayfasına **satır içi** konur (böylece sitenin açık/koyu seçimini, yazı tipini ve baskı ayarını izler). Aynı dönüştürülmüş sürüm ayrı dosya olarak da yayınlanır (`/<ders>/gorseller/<ad>.svg`, yeni sekmede açılır; sistemin açık/koyu tercihini izler).

Boyama kuralları:

- **Değişenler:** zemin, ince çizgiler ve semboller, nötr yazı renkleri, açık tonlu not kutuları, yazı tipi. Koyu temada çok koyu kartlara ince bir kontur çizilir.
- **Değişmeyenler (anlam taşıyan renkler):** kablo renkleri (kırmızı 5 V, turuncu 3,3 V, siyah GND, sinyal renkleri) ve kart/modül renkleri. Koyu temada siyah kabloların altına ince, açık renkli bir kenar çizilir; kablo siyah kalır ama koyu zeminde kaybolmaz.
- Bir şemanın içindeki yazı, **üzerinde durduğu şekle göre** boyanır: zeminde ya da not kutusundaysa temaya uyar; bir kartın/modülün üzerindeyse (ör. beyaz yazı, gri çip üzerindeki koyu yazı) olduğu gibi kalır.
- Yeni şema eklemek yeterli: `icerik/<ders>/gorseller/` altına koyup föyde `![açıklama](./gorseller/ad.svg)` yazın. Sınırlar: yalnız `fill`/`stroke` nitelikleri işlenir (`style="…"` ve `<style>` içindeki renklere dokunulmaz), `transform`'lu öğeler "nesne" sayılır; `<script>`, `<foreignObject>`, `on…=` nitelikleri ve `javascript:` bağlantıları atılır.
- Geçersiz XML (ör. aynı niteliğin iki kez yazılması) tarayıcıda görseli bozar. Dönüştürücü bunu derlemede düzeltir, `npm run dogrula` ise kaynak dosya için **UYARI** verir (şu an `esp32/gorseller/pinout.svg`'de `viewBox` iki kez tanımlı; içerik dosyası değiştirilmediği için düzeltme yalnız derlemede yapılır).

## Gizlilik

- Hiçbir kişisel veri toplanmaz, hiçbir yere gönderilmez; çerez ve izleme yoktur.
- Yedek dosyası öğrencinin `::yaz` alanlarına yazdığı her şeyi içerir; öğrenciler bu dosyayı kendileri saklar/paylaşır.

## Sorun giderme

- **`npm run build` "EPERM … dist" ile durur:** Bir terminal ya da program `dist/` klasörünün içindeyse Windows klasörü silmeye izin vermez; o klasörden çıkın.
- **Astro sürümü `~6.4` olarak sabitlenmiştir.** Astro 7'nin Rust derleyicisi yerel bir `.node` dosyası kullanır; bazı Windows makinelerinde (Uygulama Denetimi / Smart App Control) bu dosya engellenir ve `Cannot find native binding` hatası çıkar. Astro 6.4 WASM derleyicisini kullandığı için bu kısıtlamadan etkilenmez. Güvenlik ayarlarını değiştirmeyin; sürümü yükseltmek isterseniz önce başka bir makinede/CI'da deneyin.
- **`src/plugins/` değişikliği sitede görünmüyor:** Astro işlenmiş Markdown'ı önbellekte tutar. `.astro/` ve `node_modules/.astro/` klasörlerini silip yeniden derleyin.
- **Arama sonuç vermiyor:** `npm run dev` yerine `npm run build && npm run preview` kullanın (dizin derleme sonunda üretilir).

## İçerik paketi hakkında

- **Öğretmen içeriği yoktur:** cevap anahtarları, süre planları, çözümlü kodlar ve öğretmen yönergeleri pakete girmedi. Statik sitede gizli içerik olmaz; bunları siteye koymayın.
- Kodlar yalnız **derleme** testinden geçti; gerçek kartta denenmedi.
- İçerik düzeltmesi yapacaksanız yalnız `icerik/` altındaki dosyaları değiştirin; site buradan beslenir.
- `CLAUDE.md` projenin kalıcı kurallarını, `CONTENT-SPEC.md` içerik biçimini, `PROMPT.md` ilk görev metnini içerir.
