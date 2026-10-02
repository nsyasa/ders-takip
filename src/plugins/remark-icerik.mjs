// CONTENT-SPEC §4: kutular (:::bilgi …), yazma alanları (::yaz), onay kutuları (- [ ]),
// tablolar, görseller ve metin direktifi iptali.
// Düğümlere `data.hName` / `data.hProperties` vererek doğrudan HTML'e çevrilir.
import fs from 'node:fs';
import path from 'node:path';
import { visit, SKIP } from 'unist-util-visit';
import { yolYap } from '../lib/ayar.mjs';
import { semayiBoya } from '../lib/sema-boya.mjs';

const KUTULAR = {
  bilgi: 'Bilgi',
  dikkat: 'Dikkat',
  fen: 'Fen',
  rutin: 'Rutin',
  yz: 'YZ',
};

const metin = (value) => ({ type: 'text', value });
const sarmal = (hName, siniflar, children, ekstra = {}) => ({
  type: 'emphasis',
  data: { hName, hProperties: { className: siniflar, ...ekstra } },
  children,
});

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

/** SVG'nin viewBox'ından en/boy; yer ayırmak için (kayma olmasın). */
function svgBoyutu(dosyaYolu) {
  try {
    const ilk = fs.readFileSync(dosyaYolu, 'utf8').slice(0, 600);
    const vb = ilk.match(/viewBox\s*=\s*"([^"]+)"/);
    if (!vb) return null;
    const [, , w, h] = vb[1].trim().split(/[\s,]+/).map(Number);
    return w > 0 && h > 0 ? { w, h } : null;
  } catch {
    return null;
  }
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
      if (/\.svg$/i.test(dosya)) {
        // Şema derlemede yeniden boyanır (içerik dosyası değişmez) ve satır içi verilir:
        // sitenin açık/koyu temasına, yazı tipine ve baskı ayarına uyar. Başarısız olursa <img> kalır.
        try {
          semaNo += 1;
          img.satirIci = semayiBoya(fs.readFileSync(dosya, 'utf8'), { onek: `sb${semaNo}` });
        } catch (e) {
          uyar(`şema boyanamadı, düz görsel olarak gösterilecek: ${path.basename(dosya)} (${e.message})`);
        }
      }
      const boyut = svgBoyutu(dosya);
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
      // — Metin direktifi (:ad) kullanılmaz; yanlışlıkla eşleşirse düz metne çevir.
      if (node.type === 'textDirective') {
        parent.children[index] = metin(hamMetin(node));
        return [SKIP, index + 1];
      }

      // — Yazma alanı: ::yaz[Etiket]{satir=3}
      if (node.type === 'leafDirective') {
        if (node.name !== 'yaz') {
          uyar(`bilinmeyen yaprak direktif: ::${node.name}`);
          parent.children[index] = { type: 'paragraph', children: [metin(hamMetin(node))] };
          return [SKIP, index + 1];
        }
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

      // — Kutular: :::bilgi[Başlık] … :::
      if (node.type === 'containerDirective') {
        const tur = node.name;
        if (!KUTULAR[tur]) {
          uyar(`bilinmeyen kutu: :::${tur}`);
          return; // olduğu gibi (div) bırak; içeriği yine de işlenir
        }
        let baslik = [];
        const ilk = node.children[0];
        if (ilk?.data?.directiveLabel) {
          baslik = ilk.children;
          node.children = node.children.slice(1);
        }
        node.data = { hName: 'div', hProperties: { className: ['kutu', `kutu-${tur}`], role: 'note' } };
        node.children = [
          {
            type: 'paragraph',
            data: { hName: 'p', hProperties: { className: ['kutu-baslik'] } },
            children: [
              sarmal('span', ['kutu-tur'], [metin(KUTULAR[tur])]),
              ...(baslik.length ? [metin(' '), sarmal('span', ['kutu-ad'], baslik)] : []),
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

      // — Tablolar yatay kaydırılabilir bir kapsayıcıya girer
      if (node.type === 'table' && parent) {
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
          node.data = { hName: 'figure', hProperties: { className: ['gorsel'] } };
          node.children = [
            {
              type: 'link',
              url: img.url,
              title: null,
              data: {
                hProperties: {
                  className: ['gorsel-link'],
                  target: '_blank',
                  rel: 'noopener',
                  ariaLabel: `${img.alt || 'Görsel'} (büyük görünüm, yeni sekmede açılır)`,
                },
              },
              children: [img.satirIci ? { type: 'html', value: img.satirIci } : img],
            },
            {
              // Görünür alt yazı (alt metniyle aynı; ekran okuyucuya ikinci kez okutulmaz)
              type: 'paragraph',
              data: { hName: 'figcaption', hProperties: { className: ['gorsel-yazi'], ariaHidden: 'true' } },
              children: [
                sarmal('span', ['gorsel-ad'], [metin(img.alt || 'Görsel')]),
                sarmal('span', ['gorsel-ipucu'], [metin('Büyütmek için dokun')]),
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
