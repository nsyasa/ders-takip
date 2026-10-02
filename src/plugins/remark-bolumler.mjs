// Föy gövdesindeki her `##` bölümü katlanır (<details>) olur.
// "Hedeflerim" ve "Malzemeler" frontmatter'dan sayfa üstünde özet olarak gösterildiği için
// (içerik aynıdır) akordeondan çıkarılır; .md dosyaları değiştirilmez.
//
// "Sevimli" temalı derslerde (ders.json: "tema": "sevimli") sayfalar kısa olduğu için bölümler katlanmaz:
// her `##` sabit bir <section> olur (hepsi açık, yazdırmada da aynı).
import { dersAyari } from './remark-icerik.mjs';

function duzMetin(d) {
  if (typeof d.value === 'string') return d.value;
  return (d.children ?? []).map(duzMetin).join('');
}

export default function remarkBolumler() {
  return (tree, file) => {
    const fm = file.data.astro?.frontmatter ?? {};
    if (fm.tur === 'genel' || fm.numara === undefined) return; // yalnız föyler
    const sabit = dersAyari(file).tema === 'sevimli';

    const atla = new Set();
    if (Array.isArray(fm.hedefler) && fm.hedefler.length > 0) atla.add('Hedeflerim');
    if (Array.isArray(fm.malzemeler) && fm.malzemeler.length > 0) atla.add('Malzemeler');

    const yeni = [];
    let bolumler = [];
    let mevcut = null;

    const kapat = () => {
      if (!mevcut) return;
      if (!mevcut.atla) bolumler.push(mevcut);
      mevcut = null;
    };

    for (const dugum of tree.children) {
      if (dugum.type === 'heading' && dugum.depth === 2) {
        kapat();
        mevcut = { baslik: dugum, atla: atla.has(duzMetin(dugum).trim()), cocuklar: [] };
      } else if (mevcut) {
        mevcut.cocuklar.push(dugum);
      } else {
        yeni.push(dugum); // ilk `##`'tan önceki içerik
      }
    }
    kapat();

    bolumler.forEach((b, i) => {
      if (sabit) {
        // `##` altında `###` adımlar varsa bu bir "kısım"dır (çok kısımlı proje)
        const kisim = b.cocuklar.some((c) => c.type === 'heading' && c.depth === 3);
        yeni.push({
          type: 'blockquote',
          data: { hName: 'section', hProperties: { className: ['bolum', 'bolum-sabit', ...(kisim ? ['bolum-kisim'] : [])] } },
          children: [
            b.baslik,
            { type: 'blockquote', data: { hName: 'div', hProperties: { className: ['bolum-icerik'] } }, children: b.cocuklar },
          ],
        });
        return;
      }
      yeni.push({
        type: 'blockquote',
        data: {
          hName: 'details',
          hProperties: { className: ['bolum'], ...(i === 0 ? { open: true } : {}) },
        },
        children: [
          { type: 'paragraph', data: { hName: 'summary' }, children: [b.baslik] },
          {
            type: 'blockquote',
            data: { hName: 'div', hProperties: { className: ['bolum-icerik'] } },
            children: b.cocuklar,
          },
        ],
      });
    });
    tree.children = yeni;
  };
}
