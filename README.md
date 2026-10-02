# Ders Takip

Öğrenciler için reklamsız, mobil öncelikli, tamamen statik ders takip sitesi. İlk ders **ESP32 Robot Kulübü**; micro:bit ve Arduino "Yakında" kartı olarak bekliyor.

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
| `icerik/<ders>/foy-NN.md` | `/<ders>/foy-NN/` föy sayfası. Her `##` bölümü katlanır. "Hedeflerim" ve "Malzemeler" frontmatter'dan sayfa üstünde özet olarak gösterilir (gövdedeki kopyaları akordeondan çıkarılır). |
| `:::bilgi`, `:::dikkat`, `:::fen`, `:::rutin`, `:::yz` | Renkli ve **etiketli** kutular (renge bağımlı değil, siyah-beyaz baskıda da ayırt edilir). |
| `::yaz[Etiket]{satir=3}` | Yazma alanı (`textarea`); yazdıkça cihaza kaydedilir. |
| `- [ ] …` | İlerleme adımı. Hepsi işaretlenince föy "bitti" olur. |
| ` ```cpp title=… start=… dosya=… ` | Renkli, satır numaralı kod; **Kopyala** ve **İndir** (`kodlar/<dosya>/` klasörünün `.zip`'i; Arduino IDE için klasör adı = `.ino` adı korunur). |
| `icerik/<ders>/genel/*.md` | `/<ders>/genel/<slug>/` sayfaları; ders sayfasında "Genel bilgiler" altında `ders.json > genelSayfalar` sırasıyla listelenir. |
| `icerik/<ders>/gorseller/*.svg` | Föyde **satır içi**, temaya göre yeniden boyanmış (aşağıda *Şemalar*); dokununca büyür, alt yazı alt metinden gelir. Ayrı dosya olarak da yayınlanır. |

Kod yapısı:

```
src/
  content.config.ts        koleksiyonlar (kimlik = ders/slug)
  plugins/                 remark-icerik (kutular, ::yaz, onay kutusu, tablo, görsel),
                           remark-kod (kod bloğu), remark-bolumler (## → akordeon)
  lib/                     depo.ts (localStorage), veri.ts, dosyalar.ts (zip), ayar.mjs (BASE_PATH),
                           sema-boya.mjs (SVG şemaları temaya göre yeniden boyar)
  scripts/                 küçük istemci betikleri (ilerleme, föy, kod kopyalama)
  pages/                   index, [ders]/index, [ders]/[foy], [ders]/genel/[slug], verilerim, ara, 404
  styles/                  tema.css, bilesenler.css, yazdir.css (A4)
scripts/dogrula.mjs        içerik denetimi
```

## Yeni ders ya da föy eklemek

Site kodunu değiştirmeden:

1. `icerik/<ders>/ders.json` oluşturun (örnek: `icerik/esp32/ders.json`); hazırsa `"durum": "hazir"`.
2. Föyleri `foy-00.md …` olarak, genel sayfaları `genel/*.md` olarak ekleyin; kodları `kodlar/<Klasör>/<Klasör>.ino`, görselleri `gorseller/*.svg` altına koyun. Biçim: `CONTENT-SPEC.md`.
3. `npm run dogrula` ile denetleyin, sonra `npm run build`.

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
