// MakeCode blok görselini (resmî oluşturucudan çıkan SVG) siteye uygun boyuta indirir.
//
// Neden: oluşturucu her SVG'ye MakeCode editörünün bütün stil dosyasını (+ gömülü simge yazı tipleri) koyuyor:
// dosya başına ~1,4 MB, gerçek çizim ise ~10–20 KB. 45 projede bu yüzden yüzlerce MB olurdu.
//
// Ne yapar (çizim değişmez):
//  • büyük <style>'ı, görselde gerçekten kullanılan sınıfların kurallarına süzer (yinelenenler atılır);
//  • blok yazı tipini siteyle gelen JetBrains Mono'ya bağlar (blok genişlikleri tek aralıklı bir yazı tipine göre hesaplanmış; boyut buna uydurulur);
//  • görünmeyen yardımcı öğeleri (defs/filtre, bağlantı işaretleri, odak halkaları, display:none, ekran okuyucu span'ları) atar;
//  • id, data-*, role, aria-*, style gibi çizime etkisiz nitelikleri atar.
// Çıktı kendi kendine yeten bir SVG'dir; kök sınıfı `mc-blok`. Site bu işareti görünce yeniden boyamaz (src/lib/makecode.mjs).

const PARCA = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!DOCTYPE[^>]*>|<\/?[A-Za-z][\w:.-]*(?:\s+[\w:.-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*\s*\/?>/g;
const NITELIK = /([\w:.-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

const KORU = new Set([
  'class', 'transform', 'x', 'y', 'width', 'height', 'd', 'fill', 'stroke', 'rx', 'ry', 'cx', 'cy', 'r',
  'points', 'text-anchor', 'dominant-baseline', 'font-size', 'xlink:href', 'href', 'fill-opacity', 'stroke-opacity',
  'stroke-width', 'x1', 'y1', 'x2', 'y2', 'xmlns', 'xmlns:xlink', 'viewBox', 'version',
]);
// Çizimde görünmeyen yardımcı öğeler (sınıfına göre)
const ATILAN_SINIFLAR = new Set([
  'blocklyWorkspaceSelectionRing',
  'blocklyWorkspaceFocusRing',
  'blocklyHighlightedConnectionPath',
  'blocklyConnectionIndicatorParent',
  'blocklyBubbleCanvas',
  'sr-only',
]);
const ATILAN_ETIKETLER = new Set(['defs', 'span', 'title', 'desc', 'metadata', 'script', 'foreignObject']);
// Blok genişlikleri Consolas'ın ilerleme genişliğine (1126/2048 em = 0,5498 em) göre hesaplanmış: 16 px'te 8,797 px/karakter.
// JetBrains Mono'nun ilerlemesi 0,6 em olduğundan aynı genişliği 16 × 0,5498 / 0,6 = 14,66 px'te verir (x-yüksekliği Consolas'a yakın kalır).
const YAZI_BOYUTU = '14.66px';
const YAZI_TIPI = "'JetBrains Mono',monospace";

const kac = (s) => String(s).replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);)/gi, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function ayristir(ham) {
  const sonuc = [];
  let son = 0;
  for (const m of ham.matchAll(PARCA)) {
    if (m.index > son) sonuc.push({ tip: 'metin', deger: ham.slice(son, m.index) });
    son = m.index + m[0].length;
    const s = m[0];
    if (s.startsWith('<!') || s.startsWith('<?')) continue;
    const kapanis = s.startsWith('</');
    const ad = /^<\/?([A-Za-z][\w:.-]*)/.exec(s)[1];
    const kendi = s.endsWith('/>');
    const nitelikler = [];
    if (!kapanis) {
      const govde = s.slice(1 + ad.length, kendi ? -2 : -1);
      const gorulen = new Set();
      for (const a of govde.matchAll(NITELIK)) {
        if (gorulen.has(a[1])) continue;
        gorulen.add(a[1]);
        nitelikler.push([a[1], a[2] ?? a[3] ?? a[4] ?? '']);
      }
    }
    sonuc.push({ tip: 'etiket', ad, kapanis, kendi, nitelikler });
  }
  if (son < ham.length) sonuc.push({ tip: 'metin', deger: ham.slice(son) });
  return sonuc;
}

const nitelikAl = (p, ad) => p.nitelikler.find(([a]) => a === ad)?.[1];
const siniflari = (p) => (nitelikAl(p, 'class') ?? '').split(/\s+/).filter(Boolean);

// ── CSS süzme ────────────────────────────────────────────────────────────────
/** Üst düzey kuralları ayırır: [{ secici, govde }]; @-kuralları (font-face, media, keyframes…) atılır. */
function kurallaraAyir(css) {
  const temiz = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const kurallar = [];
  let i = 0;
  while (i < temiz.length) {
    const ac = temiz.indexOf('{', i);
    if (ac < 0) break;
    const secici = temiz.slice(i, ac).trim();
    let derinlik = 1;
    let j = ac + 1;
    while (j < temiz.length && derinlik > 0) {
      const c = temiz[j];
      if (c === '{') derinlik += 1;
      else if (c === '}') derinlik -= 1;
      j += 1;
    }
    const govde = temiz.slice(ac + 1, j - 1).trim();
    if (secici && !secici.startsWith('@')) kurallar.push({ secici: secici.replace(/^[\s,]+/, ''), govde });
    i = j;
  }
  return kurallar;
}

/** Virgülle ayrılmış seçicileri parantez derinliğine bakarak böler. */
function seciciBol(secici) {
  const parcalar = [];
  let derinlik = 0;
  let baslangic = 0;
  for (let i = 0; i < secici.length; i++) {
    const c = secici[i];
    if (c === '(' || c === '[') derinlik += 1;
    else if (c === ')' || c === ']') derinlik -= 1;
    else if (c === ',' && derinlik === 0) {
      parcalar.push(secici.slice(baslangic, i).trim());
      baslangic = i + 1;
    }
  }
  parcalar.push(secici.slice(baslangic).trim());
  return parcalar.filter(Boolean);
}

const KOK_SINIFLARI = ['pxt-renderer', 'classic-theme', 'injectionDiv', 'blocklySvg'];
const DURUM_SECICILERI = /:hover|:focus|:active|:disabled|:checked|:first|:last|:nth|::selection|::placeholder|::-webkit|::-moz|:-moz|:-ms/;

function cssSuz(css, kullanilan) {
  const goruldu = new Set();
  const cikti = [];
  for (const { secici, govde } of kurallaraAyir(css)) {
    if (/url\s*\(/i.test(govde)) continue; // dış kaynaklı imleçler vb.
    const secilen = [];
    for (let s of seciciBol(secici)) {
      if (DURUM_SECICILERI.test(s) || /[#[]/.test(s)) continue;
      const sade = s.replace(/:(?:not|is|where|has)\([^)]*\)/g, '');
      const siniflar = [...sade.matchAll(/\.([\w-]+)/g)].map((m) => m[1]);
      if (siniflar.length === 0) continue;
      if (!siniflar.every((c) => kullanilan.has(c) || KOK_SINIFLARI.includes(c))) continue;
      if (!siniflar.some((c) => kullanilan.has(c))) continue;
      // Kök sınıfları tek `.mc-blok`a indirgenir
      s = s.replace(/\.pxt-renderer\.classic-theme/g, '.mc-blok').replace(/\.pxt-renderer/g, '.mc-blok').replace(/\.classic-theme/g, '.mc-blok');
      if (!s.startsWith('.mc-blok')) s = `.mc-blok ${s}`; // satır içi kullanımda sayfaya sızmasın
      secilen.push(s);
    }
    if (secilen.length === 0) continue;
    const kural = `${secilen.join(',')}{${govde.replace(/\s+/g, ' ').replace(/\s*([:;])\s*/g, '$1').replace(/;$/, '')}}`;
    if (goruldu.has(kural)) continue; // oluşturucu aynı stili iki kez gömüyor
    goruldu.add(kural);
    cikti.push(kural);
  }
  return cikti.join('\n').replace(/font:600 12pt[^;}]*/g, `font:600 ${YAZI_BOYUTU} ${YAZI_TIPI}`);
}

/** @returns {{ svg: string, ham: number, yeni: number }} */
export function makecodeKucult(ham) {
  // <style> öğesini ayır (içinde `<` geçebilir; belirteç ayrıştırıcıya sokma)
  const stilEsle = /<style[^>]*>([\s\S]*?)<\/style>/;
  const stilM = stilEsle.exec(ham);
  const css = stilM ? stilM[1].replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '') : '';
  const govdeHam = stilM ? ham.replace(stilEsle, '') : ham;

  const parcalar = ayristir(govdeHam);
  const kokIdx = parcalar.findIndex((p) => p.tip === 'etiket' && p.ad === 'svg' && !p.kapanis);
  if (kokIdx < 0) throw new Error('SVG kök öğesi bulunamadı');
  const kok = parcalar[kokIdx];

  // Atılacak öğeleri (alt ağaçlarıyla) çıkar, kalanlardan niteliksiz kopya üret
  const temiz = [];
  let atlaAd = '';
  let atlaDerinlik = 0;
  for (let i = kokIdx + 1; i < parcalar.length; i++) {
    const p = parcalar[i];
    if (atlaDerinlik > 0) {
      if (p.tip === 'etiket' && p.ad === atlaAd) atlaDerinlik += p.kapanis ? -1 : p.kendi ? 0 : 1;
      continue;
    }
    if (p.tip === 'metin') {
      if (p.deger.trim() === '') continue; // öğeler arası boşluk
      temiz.push(p);
      continue;
    }
    if (p.kapanis) {
      temiz.push(p);
      continue;
    }
    const stil = nitelikAl(p, 'style') ?? '';
    const atilacak =
      ATILAN_ETIKETLER.has(p.ad) ||
      siniflari(p).some((c) => ATILAN_SINIFLAR.has(c)) ||
      /display\s*:\s*none/.test(stil) ||
      /fill-opacity\s*:\s*0\s*;?\s*$|stroke-opacity\s*:\s*0\s*;\s*fill-opacity\s*:\s*0/.test(stil) ||
      (p.ad === 'image' && !nitelikAl(p, 'xlink:href') && !nitelikAl(p, 'href'));
    if (atilacak) {
      if (!p.kendi) {
        atlaAd = p.ad;
        atlaDerinlik = 1;
      }
      continue;
    }
    p.nitelikler = p.nitelikler.filter(([a]) => KORU.has(a));
    // path verisindeki gereksiz boşluk ve &#10; temizliği
    const d = p.nitelikler.find(([a]) => a === 'd');
    if (d) d[1] = d[1].replace(/&#10;|&#xA;/gi, ' ').replace(/\s+/g, ' ').trim();
    temiz.push(p);
  }

  // Son </svg> kapanışı çıkarılır; kendimiz ekleyeceğiz
  while (temiz.length && temiz[temiz.length - 1].tip === 'etiket' && temiz[temiz.length - 1].kapanis && temiz[temiz.length - 1].ad === 'svg') temiz.pop();

  const kullanilan = new Set(temiz.filter((p) => p.tip === 'etiket' && !p.kapanis).flatMap(siniflari));
  const stil = cssSuz(css, kullanilan);

  const w = nitelikAl(kok, 'width');
  const h = nitelikAl(kok, 'height');
  const vb = nitelikAl(kok, 'viewBox') ?? (w && h ? `0 0 ${w} ${h}` : '');
  const kokYazi =
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"` +
    `${w ? ` width="${kac(w)}"` : ''}${h ? ` height="${kac(h)}"` : ''}${vb ? ` viewBox="${kac(vb)}"` : ''} class="mc-blok pxt-renderer classic-theme">`;

  const yaz = (p) => {
    if (p.tip === 'metin') return p.deger;
    if (p.kapanis) return `</${p.ad}>`;
    const n = p.nitelikler.map(([a, d]) => ` ${a}="${kac(d)}"`).join('');
    return `<${p.ad}${n}${p.kendi ? '/' : ''}>`;
  };
  const svg = `${kokYazi}<style>${stil}</style>${temiz.map(yaz).join('')}</svg>\n`;
  return { svg, ham: ham.length, yeni: svg.length };
}
