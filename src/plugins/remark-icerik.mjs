// CONTENT-SPEC §4: kutular (:::bilgi …), yazma alanları (::yaz), onay kutuları (- [ ]),
// tablolar, görseller ve metin direktifi iptali. "Sevimli" ders temasının küçük direktifleri de burada:
// :::tahmin  :::olmadiysa  :::kontrol  :::galeri  ::jest  ::sira  ::kunye
// Düğümlere `data.hName` / `data.hProperties` vererek doğrudan HTML'e çevrilir.
import fs from 'node:fs';
import path from 'node:path';
import { visit, SKIP } from 'unist-util-visit';
import { yolYap } from '../lib/ayar.mjs';
import { semayiBoya } from '../lib/sema-boya.mjs';
import { makecodeMi, makecodeSatirIci } from '../lib/makecode.mjs';
import { bitSvg } from '../lib/led.mjs';
import { rasterBoyutu } from '../lib/gorsel-boyut.mjs';

const KUTULAR = {
  bilgi: 'Bilgi',
  dikkat: 'Dikkat',
  fen: 'Fen',
  rutin: 'Rutin',
  yz: 'YZ',
};
/** Kutu rengi özniteliği ({renk=…}): kitaptaki kutu renkleri; CSS'te .kutu-r-<renk> */
const KUTU_RENKLERI = new Set(['kirmizi', 'mavi', 'gri', 'sari', 'yesil']);

const metin = (value) => ({ type: 'text', value });
const sarmal = (hName, siniflar, children, ekstra = {}) => ({
  type: 'emphasis',
  data: { hName, hProperties: { className: siniflar, ...ekstra } },
  children,
});
// Blok düzeyinde HTML kapsayıcısı (blockquote türü, hName ile div/section/ul olur)
const kapsa = (hName, siniflar, children, ekstra = {}) => ({
  type: 'blockquote',
  data: { hName, hProperties: { className: siniflar, ...ekstra } },
  children,
});
const duzMetin = (dugumler) =>
  dugumler.map((d) => (typeof d.value === 'string' ? d.value : d.children ? duzMetin(d.children) : '')).join('');

export function dersKodu(file) {
  const m = String(file.path ?? '').replace(/\\/g, '/').match(/\/icerik\/([^/]+)\//);
  return m ? m[1] : null;
}

/** icerik/<ders> klasörünün tam yolu (föy de genel sayfa da bunun altındadır). */
export function dersKlasoru(file) {
  const yol = String(file.path ?? '');
  const m = yol.replace(/\\/g, '/').match(/^(.*\/icerik\/[^/]+)\//);
  return m ? path.normalize(m[1]) : null;
}

const ayarOnbellek = new Map();
/** Dersin ders.json içeriği (tema, birim …); eklentiler derse göre davranır. Dosya değişince yeniden okunur. */
export function dersAyari(file) {
  const klasor = dersKlasoru(file);
  if (!klasor) return {};
  const yol = path.join(klasor, 'ders.json');
  try {
    const zaman = fs.statSync(yol).mtimeMs;
    const var_ = ayarOnbellek.get(yol);
    if (var_?.zaman === zaman) return var_.ayar;
    const ayar = JSON.parse(fs.readFileSync(yol, 'utf8'));
    ayarOnbellek.set(yol, { zaman, ayar });
    return ayar;
  } catch {
    return {};
  }
}

/** SVG'nin viewBox'ından en/boy; yer ayırmak için (kayma olmasın). */
function svgBoyutu(metinHam) {
  const vb = metinHam.slice(0, 800).match(/viewBox\s*=\s*"([^"]+)"/);
  if (!vb) return null;
  const [, , w, h] = vb[1].trim().split(/[\s,]+/).map(Number);
  return w > 0 && h > 0 ? { w, h } : null;
}

export default function remarkIcerik() {
  return (tree, file) => {
    const kaynak = String(file.value ?? '');
    const ders = dersKodu(file);
    const hamMetin = (d) =>
      d.position ? kaynak.slice(d.position.start.offset, d.position.end.offset) : '';
    const uyar = (ileti) => console.warn(`[remark-icerik] ${path.basename(String(file.path))}: ${ileti}`);

    let adimNo = 0;
    let yazNo = 0;
    let semaNo = 0;
    let tabloNo = 0;

    /**
     * Boş tablo hücresi → yazma alanı (CONTENT-SPEC §4 Tablolar). Bir hücre, sütunu gövdede bütünüyle boşsa
     * (ör. "Tahminim", "Benim deliğim") ya da satırında ilk hücreden sonrası bütünüyle boşsa ("Kendi örneğin")
     * yazılabilir. Malzeme tablosundaki ara sıra boş "Not" hücreleri bu kurallara uymaz, düz kalır.
     * Kimlik t<tablo>-<satır>-<sütun>: ::yaz numaralarından (1, 2, …) ayrıdır; eski kayıtlar kaymaz.
     */
    function tabloAlanlari(tablo, no) {
      const duz = (d) => (d.value ?? '') + (d.children ?? []).map(duz).join('');
      const [baslik, ...govde] = tablo.children;
      if (!govde.length) return;
      const bos = (h) => h && duz(h).trim() === '';
      const sutunSayisi = Math.max(...tablo.children.map((r) => r.children.length));
      const bosSutun = Array.from({ length: sutunSayisi }, (_, c) => govde.every((r) => bos(r.children[c])));
      govde.forEach((satir, r) => {
        const bosSatir = satir.children.length > 1 && !bos(satir.children[0]) && satir.children.slice(1).every(bos);
        satir.children.forEach((hucre, c) => {
          if (!bos(hucre) || !(bosSutun[c] || (bosSatir && c > 0))) return;
          const sutunAdi = duz(baslik.children[c] ?? { value: '' }).trim();
          const satirAdi = duz(satir.children[0] ?? { value: '' }).trim();
          const etiket = [sutunAdi, satirAdi].filter(Boolean).join(' — ') || `Tablo ${no}, satır ${r + 1}`;
          const kimlik = `t${no}-${r + 1}-${c + 1}`;
          hucre.children = [
            {
              type: 'paragraph',
              data: {
                hName: 'textarea',
                hProperties: { className: ['tablo-yaz'], id: `yaz-${kimlik}`, name: `yaz-${kimlik}`, rows: 1, dataYaz: kimlik, maxLength: 500, ariaLabel: etiket },
              },
              children: [],
            },
          ];
        });
      });
    }

    /** "proje:31", "foy:6", "genel:sozluk" → sitenin gerçek adresi (taban yoluyla) */
    function baglantiCoz(url) {
      const m = /^(proje|foy|genel):([\w-]+)$/.exec(url ?? '');
      if (!m || !ders) return url;
      const [, tur, deger] = m;
      const slug = tur === 'genel' ? `genel/${deger}` : `${tur}-${String(deger).padStart(2, '0')}`;
      return yolYap(`${ders}/${slug}/`);
    }

    function gorselDuzenle(img) {
      const url = decodeURI(img.url ?? '');
      if (!url || url.startsWith('/') || URL.canParse(url) || !ders) return false;
      const dosya = path.resolve(path.dirname(String(file.path)), url);
      if (!fs.existsSync(dosya)) {
        uyar(`görsel bulunamadı: ${url}`);
        return false;
      }
      img.url = yolYap(`${ders}/gorseller/${path.basename(dosya)}`);
      img.satirIci = null;
      let boyut = null;
      if (/\.svg$/i.test(dosya)) {
        const svgMetni = fs.readFileSync(dosya, 'utf8');
        boyut = svgBoyutu(svgMetni);
        if (makecodeMi(svgMetni)) {
          // MakeCode blokları: renkleri anlam taşır, yeniden boyanmaz
          img.satirIci = makecodeSatirIci(svgMetni);
          img.blok = boyut?.w ?? 0; // doğal genişlik: dar ekranda çok küçülmesin, kutuda yatay kayar (CSS: .gorsel-blok)
        } else {
          // Şema derlemede yeniden boyanır (içerik dosyası değişmez) ve satır içi verilir:
          // sitenin açık/koyu temasına, yazı tipine ve baskı ayarına uyar. Başarısız olursa <img> kalır.
          try {
            semaNo += 1;
            img.satirIci = semayiBoya(svgMetni, { onek: `sb${semaNo}` });
          } catch (e) {
            uyar(`şema boyanamadı, düz görsel olarak gösterilecek: ${path.basename(dosya)} (${e.message})`);
          }
        }
      } else {
        boyut = rasterBoyutu(fs.readFileSync(dosya));
      }
      img.data = {
        ...img.data,
        hProperties: {
          ...(img.data?.hProperties ?? {}),
          loading: 'lazy',
          decoding: 'async',
          ...(boyut ? { width: boyut.w, height: boyut.h } : {}),
        },
      };
      return true;
    }

    visit(tree, (node, index, parent) => {
      // — Bağlantılar: proje:31 / foy:6 / genel:sozluk
      if (node.type === 'link') node.url = baglantiCoz(node.url);

      // — Metin direktifi (:ad) kullanılmaz; yanlışlıkla eşleşirse düz metne çevir.
      if (node.type === 'textDirective') {
        parent.children[index] = metin(hamMetin(node));
        return [SKIP, index + 1];
      }

      // — Yaprak direktifler: ::yaz[Etiket]{satir=3}, ::jest, ::sira, ::kunye
      if (node.type === 'leafDirective') {
        // Yaprak direktiflerin etiketleri sonradan ziyaret edilmez (SKIP): içlerindeki bağlantıları şimdi çöz
        const baglantilariCoz = (d) => {
          if (d.type === 'link') d.url = baglantiCoz(d.url);
          (d.children ?? []).forEach(baglantilariCoz);
        };
        node.children.forEach(baglantilariCoz);

        if (node.name === 'yaz') {
          yazNo += 1;
          const id = `yaz-${yazNo}`;
          const satir = Number.parseInt(node.attributes?.satir, 10) || 3;
          const etiketli = node.children.length > 0;
          node.data = { hName: 'div', hProperties: { className: ['yaz'] } };
          node.children = [
            {
              type: 'paragraph',
              data: {
                hName: 'label',
                hProperties: { htmlFor: id, className: etiketli ? ['yaz-etiket'] : ['yaz-etiket', 'gorunmez'] },
              },
              children: etiketli ? node.children : [metin(`Yazma alanı ${yazNo}`)],
            },
            {
              type: 'paragraph',
              data: {
                hName: 'textarea',
                hProperties: { id, name: id, rows: satir, dataYaz: String(yazNo), maxLength: 4000 },
              },
              children: [],
            },
          ];
          return [SKIP, index + 1];
        }

        if (node.name === 'jest') {
          // ::jest[Bas → oku]{tuslar="A,B"}: düğme/simge işaretli kısa yönerge
          const tuslar = String(node.attributes?.tuslar ?? '').split(',').map((s) => s.trim()).filter(Boolean);
          const harfMi = (t) => /^[A-Z]$/.test(t);
          const dugmeler = tuslar.filter(harfMi);
          node.data = { hName: 'p', hProperties: { className: ['jest'] } };
          node.children = [
            ...(dugmeler.length ? [sarmal('span', ['gorunmez'], [metin(`${dugmeler.join(' ve ')} ${dugmeler.length > 1 ? 'düğmeleri' : 'düğmesi'}: `)])] : []),
            ...tuslar.map((t) => sarmal('span', ['tus', harfMi(t) ? 'tus-harf' : 'tus-simge'], [metin(t)], { ariaHidden: 'true' })),
            sarmal('span', ['jest-metin'], node.children),
          ];
          return [SKIP, index + 1];
        }

        if (node.name === 'sira') {
          // ::sira[0 → 1 → (B) → 0]: adım adım değişen değerler; (B) ok üstündeki düğmedir
          const jetonlar = duzMetin(node.children).split(/\s+/).filter(Boolean);
          node.data = { hName: 'p', hProperties: { className: ['sira'] } };
          node.children = jetonlar.flatMap((j, i) => {
            const parca = /^[→←↑↓…]$/.test(j)
              ? sarmal('span', ['sira-ok'], [metin(j)])
              : /^\(.+\)$/.test(j)
                ? sarmal('span', ['sira-tus'], [metin(j.slice(1, -1))])
                : sarmal('span', ['sira-oge'], [metin(j)]);
            return i ? [metin(' '), parca] : [parca];
          });
          return [SKIP, index + 1];
        }

        if (node.name === 'kunye') {
          // ::kunye{sure="10" fikir="…" malzeme="…"}: çok kısımlı projelerde her kısmın künyesi
          const a = node.attributes ?? {};
          const oge = (ad, deger) => sarmal('li', ['kunye-oge'], [sarmal('span', ['kunye-ad'], [metin(ad)]), metin(` ${deger}`)]);
          node.data = { hName: 'ul', hProperties: { className: ['kunye-satir'] } };
          node.children = [
            ...(a.sure ? [oge('Süre', `${a.sure} dk`)] : []),
            ...(a.fikir ? [oge('Yeni fikir', a.fikir)] : []),
            ...(a.malzeme ? [oge('Gerekenler', a.malzeme)] : []),
          ];
          return [SKIP, index + 1];
        }

        uyar(`bilinmeyen yaprak direktif: ::${node.name}`);
        parent.children[index] = { type: 'paragraph', children: [metin(hamMetin(node))] };
        return [SKIP, index + 1];
      }

      // — Kutular: :::bilgi[Başlık] … :::   (+ sevimli tema kapsayıcıları)
      if (node.type === 'containerDirective') {
        const tur = node.name;
        const ozel = ['tahmin', 'olmadiysa', 'kontrol', 'galeri'].includes(tur);
        if (!KUTULAR[tur] && !ozel) {
          uyar(`bilinmeyen kutu: :::${tur}`);
          return; // olduğu gibi (div) bırak; içeriği yine de işlenir
        }
        let baslik = [];
        const ilk = node.children[0];
        if (ilk?.data?.directiveLabel) {
          baslik = ilk.children;
          node.children = node.children.slice(1);
        }

        if (tur === 'tahmin') {
          node.data = { hName: 'div', hProperties: { className: ['tahmin'], role: 'group', ariaLabel: 'Önce tahmin et' } };
          node.children = [
            { type: 'html', value: `<div class="tahmin-bit" aria-hidden="true">${bitSvg('dusun')}</div>` },
            // Bölüm başlığı zaten "Önce tahmin et"; kutuda yalnız soru ve Bit görünür
            kapsa('div', ['tahmin-govde'], node.children),
          ];
          return;
        }
        if (tur === 'olmadiysa') {
          node.data = { hName: 'div', hProperties: { className: ['olmadiysa'], role: 'note' } };
          node.children = [
            { type: 'paragraph', data: { hName: 'p', hProperties: { className: ['olmadiysa-baslik'] } }, children: [metin('Olmadıysa')] },
            kapsa('div', ['olmadiysa-icerik'], node.children),
          ];
          return;
        }
        if (tur === 'kontrol') {
          node.data = { hName: 'div', hProperties: { className: ['kontrol'], role: 'group' } };
          node.children = [
            { type: 'paragraph', data: { hName: 'p', hProperties: { className: ['kontrol-baslik'] } }, children: baslik.length ? baslik : [metin('Kontrol')] },
            ...node.children,
          ];
          return;
        }
        if (tur === 'galeri') {
          node.data = { hName: 'div', hProperties: { className: ['galeri'] } };
          return;
        }

        // {renk=sari}: kitaptan gelen kutunun kendi rengi (Arduino kitabı). Başlığı olan renkli kutuda tür etiketi
        // ("Bilgi") yazılmaz, kitaptaki gibi yalnız başlık görünür; güvenlik kutusunda "Dikkat" her zaman kalır.
        const renk = KUTU_RENKLERI.has(node.attributes?.renk) ? node.attributes.renk : '';
        if (node.attributes?.renk && !renk) uyar(`bilinmeyen kutu rengi: ${node.attributes.renk}`);
        const turYaz = !(renk && baslik.length && tur !== 'dikkat');
        node.data = { hName: 'div', hProperties: { className: ['kutu', `kutu-${tur}`, ...(renk ? [`kutu-r-${renk}`] : [])], role: 'note' } };
        node.children = [
          {
            type: 'paragraph',
            data: { hName: 'p', hProperties: { className: ['kutu-baslik'] } },
            children: [
              ...(turYaz ? [sarmal('span', ['kutu-tur'], [metin(KUTULAR[tur])])] : []),
              ...(baslik.length ? [...(turYaz ? [metin(' ')] : []), sarmal('span', ['kutu-ad'], baslik)] : []),
            ],
          },
          {
            type: 'blockquote',
            data: { hName: 'div', hProperties: { className: ['kutu-icerik'] } },
            children: node.children,
          },
        ];
        return; // iç içe öğeleri (onay kutusu, tablo) ziyaret etmeye devam et
      }

      // — Onay kutuları: "- [ ] metin"
      if (node.type === 'list' && node.children.some((li) => typeof li.checked === 'boolean')) {
        node.data = { ...node.data, hProperties: { className: ['adim-listesi'] } };
        return;
      }
      if (node.type === 'listItem' && typeof node.checked === 'boolean') {
        adimNo += 1;
        node.checked = null; // GFM'in kendi (devre dışı) onay kutusunu üretmesin
        node.data = { ...node.data, hProperties: { className: ['adim-ogesi'] } };
        const ilk = node.children[0];
        const icerik = ilk && ilk.type === 'paragraph' ? ilk.children : [];
        const etiket = sarmal('label', ['adim'], [
          {
            type: 'emphasis',
            data: {
              hName: 'input',
              hProperties: { type: 'checkbox', className: ['adim-kutu'], dataAdim: String(adimNo) },
            },
            children: [],
          },
          sarmal('span', ['adim-metin'], icerik),
        ]);
        if (ilk && ilk.type === 'paragraph') ilk.children = [etiket];
        else node.children.unshift({ type: 'paragraph', children: [etiket] });
        return;
      }

      // — Tablolar yatay kaydırılabilir bir kapsayıcıya girer; öğrencinin dolduracağı boş hücreler yazma alanı olur
      if (node.type === 'table' && parent) {
        tabloNo += 1;
        tabloAlanlari(node, tabloNo);
        // Tablonun içi aşağıda SKIP ile atlanır: hücrelerdeki proje:/genel: bağlantılarını şimdi çöz
        visit(node, 'link', (l) => {
          l.url = baglantiCoz(l.url);
        });
        parent.children[index] = {
          type: 'blockquote',
          data: {
            hName: 'div',
            hProperties: {
              className: ['tablo-kap'],
              tabIndex: 0,
              role: 'region',
              ariaLabel: 'Tablo (yatay kaydırılabilir)',
            },
          },
          children: [node],
        };
        return [SKIP, index + 1];
      }

      // — Tek başına görsel: <figure><a><img></a></figure>
      if (
        node.type === 'paragraph' &&
        node.children.length === 1 &&
        node.children[0].type === 'image'
      ) {
        const img = node.children[0];
        if (gorselDuzenle(img)) {
          // Başlık ("…" kısmı) varsa görünür alt yazıdır; yoksa alt metni gösterilir.
          const yazi = img.title || img.alt || 'Görsel';
          const ayri = Boolean(img.title) && img.title !== img.alt; // alt metninden farklıysa ekran okuyucuya da okunur
          node.data = { hName: 'figure', hProperties: { className: ['gorsel'] } };
          node.children = [
            {
              type: 'link',
              url: img.url,
              title: null,
              data: {
                hProperties: {
                  className: img.blok ? ['gorsel-link', 'gorsel-blok'] : ['gorsel-link'],
                  ...(img.blok ? { style: `--dogal:${img.blok}px` } : {}),
                  target: '_blank',
                  rel: 'noopener',
                  ariaLabel: `${img.alt || 'Görsel'} (büyük görünüm, yeni sekmede açılır)`,
                },
              },
              children: [img.satirIci ? { type: 'html', value: img.satirIci } : img],
            },
            {
              // Görünür alt yazı (alt metniyle aynıysa ekran okuyucuya ikinci kez okutulmaz)
              type: 'paragraph',
              data: { hName: 'figcaption', hProperties: { className: ['gorsel-yazi'], ...(ayri ? {} : { ariaHidden: 'true' }) } },
              children: [
                sarmal('span', ['gorsel-ad'], [metin(yazi)]),
                sarmal('span', ['gorsel-ipucu'], [metin('Büyütmek için dokun')], { ariaHidden: 'true' }),
              ],
            },
          ];
        }
        return SKIP;
      }

      // — Diğer görseller (satır içi)
      if (node.type === 'image') gorselDuzenle(node);
    });
  };
}
