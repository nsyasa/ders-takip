// Kod blokları: ```cpp title="Kod 1.1 — Foy1_ButonOku" start=1 dosya=Foy1_ButonOku
// Derleme sırasında Shiki ile renklendirilir (çalışma zamanında JS gerekmez);
// satır numarası CSS sayacıyla `start`'tan başlar; kopyala/indir düğmeleri eklenir.
import fs from 'node:fs';
import path from 'node:path';
import { createHighlighter } from 'shiki';
import { visit, SKIP } from 'unist-util-visit';
import { yolYap } from '../lib/ayar.mjs';
import { dersKodu, dersKlasoru } from './remark-icerik.mjs';

const TEMALAR = { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' };
const DILLER = ['cpp', 'c', 'html', 'json', 'text'];

let vurgulayici;
const vurgulayiciAl = () => (vurgulayici ??= createHighlighter({ themes: Object.values(TEMALAR), langs: DILLER }));

const kac = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** title="…" start=3 dosya=X parca=Y */
function metaOku(meta = '') {
  const sonuc = {};
  for (const m of meta.matchAll(/(\w+)=(?:"([^"]*)"|(\S+))/g)) sonuc[m[1]] = m[2] ?? m[3];
  return sonuc;
}

export default function remarkKod() {
  return async (tree, file) => {
    const ders = dersKodu(file);
    const dugumler = [];
    visit(tree, 'code', (node, index, parent) => {
      dugumler.push({ node, index, parent });
      return SKIP;
    });
    if (dugumler.length === 0) return;

    const hl = await vurgulayiciAl();
    for (const { node } of dugumler) {
      const meta = metaOku(node.meta ?? '');
      const dil = DILLER.includes(node.lang) ? node.lang : 'text';
      const bas = Number.parseInt(meta.start, 10) || 1;
      // "Kodu Tamamla" boşlukları (___1___) öğrencinin dolduracağı yerlerdir: vurgulanır.
      const govde = hl
        .codeToHtml(node.value, { lang: dil, themes: TEMALAR, defaultColor: false })
        .replace(/___(\d+)___/g, '<mark class="bosluk" title="Boşluk $1: burayı sen dolduracaksın">___$1___</mark>');

      let indir = '';
      if (meta.dosya && ders) {
        const klasor = path.join(dersKlasoru(file), 'kodlar', meta.dosya);
        if (fs.existsSync(klasor)) {
          indir =
            `<a class="kod-dugme kod-indir" href="${kac(yolYap(`${ders}/kodlar/${meta.dosya}.zip`))}" download>` +
            `İndir<span class="gorunmez"> (${kac(meta.dosya)} klasörü, .zip)</span></a>`;
        } else {
          console.warn(`[remark-kod] ${path.basename(String(file.path))}: kod klasörü yok: kodlar/${meta.dosya}`);
        }
      }

      const baslik = meta.title || meta.dosya || 'Kod';
      const parca = meta.parca ? `<span class="kod-parca">dosya: ${kac(meta.parca)}</span>` : '';
      node.type = 'html';
      node.value =
        `<figure class="kod" style="--sayac:${bas - 1}">` +
        `<figcaption class="kod-ust"><span class="kod-ad">${kac(baslik)}</span>${parca}` +
        `<span class="kod-dugmeler" data-pagefind-ignore><button type="button" class="kod-dugme kod-kopyala" data-kopyala hidden>Kopyala</button>${indir}</span>` +
        `</figcaption>${govde}</figure>`;
      delete node.lang;
      delete node.meta;
    }
  };
}
