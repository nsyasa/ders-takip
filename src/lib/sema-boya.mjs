// Şema (SVG) yeniden boyama: derleme zamanında çalışır; icerik/ altındaki dosyalar DEĞİŞMEZ.
//
// Amaç: şemalar sitenin açık/koyu temasına uysun (zemin, yazı, ince çizgiler, not kutuları, yazı tipi),
// ama ANLAM TAŞIYAN renkler değişmesin: kablo renkleri (kırmızı 5 V, turuncu 3,3 V, siyah GND, sinyal renkleri)
// ile kart/modül renkleri aynen kalır. Koyu temada siyah kabloların altına açık renkli bir kenar çizilir;
// böylece kablo siyah kalır ("siyah = GND") ama koyu zeminde kaybolmaz.
//
// İki kullanım:
//  • satır içi (föy sayfasında): sayfanın renk belirteçlerini (--zemin, --yazi, --f-govde) ve <html data-tema> seçimini izler;
//  • bağımsız (/ders/gorseller/x.svg dosyası, yeni sekmede): kendi içinde light-dark() yedeği taşır, sistemin
//    açık/koyu tercihini izler.
// light-dark() desteklenmeyen eski tarayıcılarda boyama kuralları uygulanmaz; şema özgün (açık) renkleriyle görünür.
//
// Sınırlar: yalnız fill/stroke nitelikleri işlenir (style="…" ve <style> içindeki renklere dokunulmaz);
// transform'lu öğeler "nesne" sayılır; <script>, <foreignObject>, on*= ve javascript: bağlantıları atılır.

const YAZI_TIPI = "var(--f-govde, 'Atkinson Hyperlegible Next', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif)";
const MONO_TIPI = "var(--f-mono, 'JetBrains Mono', ui-monospace, Consolas, 'Courier New', monospace)";

// ── Renk yardımcıları ──────────────────────────────────────────────────────
function renkCoz(deger) {
  if (!deger) return null;
  const s = String(deger).trim().toLowerCase();
  if (s === 'white') return [255, 255, 255];
  if (s === 'black') return [0, 0, 0];
  let m = /^#([0-9a-f]{3})$/.exec(s);
  if (m) return [...m[1]].map((c) => parseInt(c + c, 16));
  m = /^#([0-9a-f]{6})$/.exec(s);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  return null; // none, currentColor, url(#…), rgb() vb.: dokunma
}
const onalti = (rgb) => '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
function parlaklik([r, g, b]) {
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
const kroma = ([r, g, b]) => Math.max(r, g, b) - Math.min(r, g, b);

// ── Ayrıştırma / yazma ─────────────────────────────────────────────────────
const PARCA = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!DOCTYPE[^>]*>|<\/?[A-Za-z][\w:.-]*(?:\s+[\w:.-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*\s*\/?>/g;
const NITELIK = /([\w:.-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

function ayristir(ham) {
  const sonuc = [];
  let son = 0;
  for (const m of ham.matchAll(PARCA)) {
    if (m.index > son) sonuc.push({ tip: 'metin', deger: ham.slice(son, m.index) });
    son = m.index + m[0].length;
    const s = m[0];
    if (s.startsWith('<!') || s.startsWith('<?')) continue; // yorum, DOCTYPE, XML bildirimi atılır
    const kapanis = s.startsWith('</');
    const ad = /^<\/?([A-Za-z][\w:.-]*)/.exec(s)[1];
    const kendi = s.endsWith('/>');
    const nitelikler = [];
    if (!kapanis) {
      const govde = s.slice(1 + ad.length, kendi ? -2 : -1);
      for (const a of govde.matchAll(NITELIK)) {
        const deger = a[2] ?? a[3] ?? a[4] ?? '';
        nitelikler.push([a[1], deger]);
      }
    }
    sonuc.push({ tip: 'etiket', ad, kapanis, kendi, nitelikler });
  }
  if (son < ham.length) sonuc.push({ tip: 'metin', deger: ham.slice(son) });
  return sonuc;
}

const kac = (s) => String(s).replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);)/gi, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
function yaz(p) {
  if (p.tip === 'metin') return p.deger;
  if (p.kapanis) return `</${p.ad}>`;
  const n = p.nitelikler.map(([a, d]) => ` ${a}="${kac(d)}"`).join('');
  return `<${p.ad}${n}${p.kendi ? '/' : ''}>`;
}

/** Yinelenen nitelik gibi XML'i bozan sorunları listeler (doğrulama betiği kullanır). */
export function svgSorunlari(ham) {
  const sorunlar = [];
  for (const p of ayristir(ham)) {
    if (p.tip !== 'etiket' || p.kapanis) continue;
    const gorulen = new Set();
    for (const [a] of p.nitelikler) {
      if (gorulen.has(a)) sorunlar.push(`<${p.ad}> öğesinde "${a}" niteliği iki kez tanımlı (geçerli XML değil)`);
      gorulen.add(a);
    }
  }
  return sorunlar;
}

// ── Asıl dönüştürücü ───────────────────────────────────────────────────────
const nitelikAl = (p, ad) => p.nitelikler.find(([a]) => a === ad)?.[1];
function nitelikYaz(p, ad, deger) {
  const i = p.nitelikler.findIndex(([a]) => a === ad);
  if (deger === null) {
    if (i >= 0) p.nitelikler.splice(i, 1);
  } else if (i >= 0) p.nitelikler[i][1] = deger;
  else p.nitelikler.push([ad, deger]);
}
function sinifEkle(p, sinif) {
  const var_ = nitelikAl(p, 'class');
  nitelikYaz(p, 'class', var_ ? `${var_} ${sinif}` : sinif);
}
const sayi = (d, varsayilan = 0) => {
  const n = Number.parseFloat(d);
  return Number.isFinite(n) ? n : varsayilan;
};

/**
 * @param {string} ham   SVG metni
 * @param {{ bagimsiz?: boolean, onek?: string }} secenek
 *   bagimsiz: true → ayrı dosya olarak sunulur (kendi renk yedeğini taşır)
 *   onek: id çakışmasını önlemek için (satır içi kullanımda her şekle farklı verin)
 */
export function semayiBoya(ham, { bagimsiz = false, onek = 'sb' } = {}) {
  const parcalar = ayristir(ham);
  const kokIdx = parcalar.findIndex((p) => p.tip === 'etiket' && p.ad === 'svg' && !p.kapanis);
  if (kokIdx < 0) return ham;
  const kok = parcalar[kokIdx];

  // Yinelenen nitelikleri at (ilk değer kalır): pinout.svg'deki gibi bozuk dosyalar da açılsın
  for (const p of parcalar) {
    if (p.tip !== 'etiket' || p.kapanis) continue;
    const gorulen = new Set();
    p.nitelikler = p.nitelikler.filter(([a]) => (gorulen.has(a) ? false : (gorulen.add(a), true)));
  }

  // Boyut / viewBox
  const w = sayi(nitelikAl(kok, 'width'));
  const h = sayi(nitelikAl(kok, 'height'));
  let vb = nitelikAl(kok, 'viewBox');
  if (!vb && w && h) {
    vb = `0 0 ${w} ${h}`;
    nitelikYaz(kok, 'viewBox', vb);
  }
  const [, , vbW, vbH] = (vb ?? '0 0 0 0').trim().split(/[\s,]+/).map(Number);

  // Güvenlik: script / foreignObject / olay nitelikleri / javascript: bağlantıları
  const temiz = [];
  let atlaDerinlik = 0;
  let atlaAd = '';
  for (const p of parcalar) {
    if (atlaDerinlik > 0) {
      if (p.tip === 'etiket' && p.ad === atlaAd) atlaDerinlik += p.kapanis ? -1 : p.kendi ? 0 : 1;
      continue;
    }
    if (p.tip === 'etiket' && !p.kapanis && (p.ad === 'script' || p.ad === 'foreignObject')) {
      if (!p.kendi) {
        atlaDerinlik = 1;
        atlaAd = p.ad;
      }
      continue;
    }
    if (p.tip === 'etiket' && !p.kapanis) {
      p.nitelikler = p.nitelikler.filter(([a, d]) => !/^on/i.test(a) && !/^\s*javascript:/i.test(d));
    }
    temiz.push(p);
  }
  parcalar.length = 0;
  parcalar.push(...temiz);

  // id çakışmalarına karşı önek (satır içi kullanımda aynı sayfada birden çok şema olabilir)
  const idler = new Map();
  for (const p of parcalar) {
    if (p.tip !== 'etiket' || p.kapanis) continue;
    const id = nitelikAl(p, 'id');
    if (id) idler.set(id, `${onek}-${id}`);
  }
  if (idler.size) {
    for (const p of parcalar) {
      if (p.tip !== 'etiket' || p.kapanis) continue;
      for (const n of p.nitelikler) {
        if (n[0] === 'id' && idler.has(n[1])) n[1] = idler.get(n[1]);
        else {
          n[1] = n[1].replace(/url\(#([^)]+)\)/g, (t, id) => (idler.has(id) ? `url(#${idler.get(id)})` : t));
          if ((n[0] === 'href' || n[0] === 'xlink:href') && n[1].startsWith('#') && idler.has(n[1].slice(1))) {
            n[1] = `#${idler.get(n[1].slice(1))}`;
          }
        }
      }
    }
  }

  // ── Boyama ──
  const kurallar = new Map(); // sınıf → bildirim (light-dark gerektirenler)
  const duzKurallar = new Map(); // sınıf → bildirim (değişken kullanan, light-dark'sız)
  const yuzeyler = []; // metnin üzerinde durduğu şekiller
  let arkaPlanBulundu = false;
  const cikis = [];

  const ld = (sinif, ozellik, acik, koyu) => kurallar.set(sinif, `${ozellik}:light-dark(${acik},${koyu})`);

  for (const p of parcalar) {
    if (p.tip !== 'etiket' || p.kapanis || p === kok) {
      cikis.push(p);
      continue;
    }
    const ad = p.ad;
    const doldur = nitelikAl(p, 'fill');
    const cizgi = nitelikAl(p, 'stroke');
    // fill verilmemiş metin tarayıcıda siyah çizilir; koyu temada kaybolmasın
    const fillRgb = renkCoz(doldur) ?? (ad === 'text' && doldur === undefined && nitelikAl(p, 'style') === undefined ? [0, 0, 0] : null);
    const strokeRgb = renkCoz(cizgi);
    const donusumlu = nitelikAl(p, 'transform') !== undefined;

    // Yazı tipi
    if (ad === 'text' || ad === 'tspan') {
      const ft = nitelikAl(p, 'font-family');
      if (ft !== undefined) {
        nitelikYaz(p, 'font-family', null);
        if (/mono/i.test(ft)) {
          sinifEkle(p, 'sb-mono');
          duzKurallar.set('sb-mono', `font-family:${MONO_TIPI}`);
        }
      }
    }

    // Arka plan: köşeden köşeye, beyaza yakın ilk dikdörtgen
    if (
      !arkaPlanBulundu &&
      ad === 'rect' &&
      fillRgb &&
      parlaklik(fillRgb) >= 0.97 &&
      vbW &&
      sayi(nitelikAl(p, 'width')) >= vbW * 0.98 &&
      sayi(nitelikAl(p, 'height')) >= vbH * 0.98
    ) {
      arkaPlanBulundu = true;
      nitelikYaz(p, 'fill', null);
      sinifEkle(p, 'sb-bg');
      duzKurallar.set('sb-bg', 'fill:var(--sb-zemin)');
      cikis.push(p);
      continue;
    }

    // Metin: üzerinde durduğu yüzeye göre boyanır (zemin / temalı not kutusu → tema; gerçek nesne → dokunma)
    if (ad === 'text' && fillRgb && !donusumlu) {
      const x = sayi(nitelikAl(p, 'x'));
      const fs = sayi(nitelikAl(p, 'font-size'), 16);
      const y = sayi(nitelikAl(p, 'y')) - fs * 0.3;
      let baglam = 'zemin';
      for (let i = yuzeyler.length - 1; i >= 0; i--) {
        const s = yuzeyler[i];
        if (x >= s.x0 && x <= s.x1 && y >= s.y0 && y <= s.y1) {
          baglam = s.temali ? 'zemin' : 'nesne';
          break;
        }
      }
      const L = parlaklik(fillRgb);
      if (baglam === 'zemin' && L <= 0.35) {
        if (kroma(fillRgb) < 30) {
          sinifEkle(p, 'sb-ink');
          duzKurallar.set('sb-ink', 'fill:var(--sb-yazi)');
        } else {
          // koyu temada tonu koruyarak açar; çok koyu renkler (lacivert başlık) daha çok açılır
          const koyuYuzde = L < 0.06 ? 35 : L < 0.1 ? 40 : 45;
          const k = `sb-t${onalti(fillRgb).slice(1)}`;
          sinifEkle(p, k);
          ld(k, 'fill', onalti(fillRgb), `color-mix(in srgb,${onalti(fillRgb)} ${koyuYuzde}%,#fff)`);
        }
      }
      cikis.push(p);
      continue;
    }

    // Dolgulu şekiller: yüzey olarak kaydet; açık tonlu not kutuları temalanır, çok koyu nesnelere koyu temada kontur çizilir
    if ((ad === 'rect' || ad === 'circle' || ad === 'ellipse') && fillRgb && !donusumlu) {
      let kutu = null;
      if (ad === 'rect') {
        const rx = sayi(nitelikAl(p, 'x'));
        const ry = sayi(nitelikAl(p, 'y'));
        kutu = { x0: rx, y0: ry, x1: rx + sayi(nitelikAl(p, 'width')), y1: ry + sayi(nitelikAl(p, 'height')) };
      } else {
        const cx = sayi(nitelikAl(p, 'cx'));
        const cy = sayi(nitelikAl(p, 'cy'));
        const rx = sayi(nitelikAl(p, ad === 'circle' ? 'r' : 'rx'));
        const ry = sayi(nitelikAl(p, ad === 'circle' ? 'r' : 'ry'));
        kutu = { x0: cx - rx, y0: cy - ry, x1: cx + rx, y1: cy + ry };
      }
      const L = parlaklik(fillRgb);
      const alan = (kutu.x1 - kutu.x0) * (kutu.y1 - kutu.y0);
      let temali = false;
      if (L >= 0.82) {
        temali = true;
        const k = `sb-f${onalti(fillRgb).slice(1)}`;
        sinifEkle(p, k);
        ld(k, 'fill', onalti(fillRgb), `color-mix(in srgb,${onalti(fillRgb)} 14%,var(--sb-zemin))`);
      } else if (L <= 0.1 && !cizgi) {
        sinifEkle(p, 'sb-kd');
        kurallar.set('sb-kd', 'stroke:var(--sb-kontur);stroke-width:1.5');
      }
      if (alan >= 600) yuzeyler.push({ ...kutu, temali });
      cikis.push(p);
      continue;
    }

    // Koyu dolgulu çokgen/yol (ok başı, sembol): koyu temada kontur
    if ((ad === 'polygon' || ad === 'path') && fillRgb && !cizgi && !donusumlu && parlaklik(fillRgb) <= 0.1) {
      sinifEkle(p, 'sb-kd');
      kurallar.set('sb-kd', 'stroke:var(--sb-kontur);stroke-width:1.5');
      cikis.push(p);
      continue;
    }

    // Çizgiler (kablolar, semboller)
    if ((ad === 'polyline' || ad === 'line' || ad === 'path' || ad === 'polygon') && strokeRgb && !donusumlu) {
      const L = parlaklik(strokeRgb);
      const kalinlik = sayi(nitelikAl(p, 'stroke-width'), 1);
      const notr = kroma(strokeRgb) < 30;
      // data-kablo: ince çizilmiş kablo (ör. kitaptan kesilen breadboard çizimleri, 2 birim) da kablo sayılır
      const kablo = nitelikAl(p, 'data-kablo') !== undefined;
      if (kablo) nitelikYaz(p, 'data-kablo', null);
      if (notr && L <= 0.1) {
        if ((kalinlik >= 4 || kablo) && ad !== 'polygon') {
          // koyu kablo (siyah = GND): koyu temada altına açık kenar
          const halo = { ...p, nitelikler: p.nitelikler.map((n) => [...n]) };
          nitelikYaz(halo, 'stroke', '#ffffff');
          nitelikYaz(halo, 'stroke-width', String(kalinlik >= 4 ? kalinlik + 4 : kalinlik + 2));
          nitelikYaz(halo, 'fill', 'none');
          nitelikYaz(halo, 'class', 'sb-halo');
          duzKurallar.set('sb-halo', 'stroke:var(--sb-halo)');
          cikis.push(halo);
        } else {
          sinifEkle(p, 'sb-ins');
          duzKurallar.set('sb-ins', 'stroke:var(--sb-yazi)');
        }
      } else if (!notr && L <= 0.18) {
        // renkli kablo: anlam taşır, rengi korunur; koyu temada çok hafif açılır
        const k = `sb-s${onalti(strokeRgb).slice(1)}`;
        sinifEkle(p, k);
        ld(k, 'stroke', onalti(strokeRgb), `color-mix(in srgb,${onalti(strokeRgb)} 80%,#fff)`);
      }
      cikis.push(p);
      continue;
    }

    cikis.push(p);
  }

  // Kök: sınıf, yazı tipi (CSS'ten), erişilebilirlik
  nitelikYaz(kok, 'font-family', null);
  sinifEkle(kok, 'sema');
  if (bagimsiz) {
    nitelikYaz(kok, 'style', 'color-scheme:light dark');
  } else {
    nitelikYaz(kok, 'aria-hidden', 'true');
    nitelikYaz(kok, 'focusable', 'false');
    nitelikYaz(kok, 'data-pagefind-ignore', '');
  }
  if (!nitelikAl(kok, 'xmlns')) nitelikYaz(kok, 'xmlns', 'http://www.w3.org/2000/svg');

  const taban =
    `.sema{font-family:${YAZI_TIPI};--sb-zemin:var(--zemin,#ffffff);--sb-yazi:var(--yazi,#14130f);--sb-kontur:transparent;--sb-halo:transparent}` +
    [...duzKurallar].map(([k, d]) => `.sema .${k}{${d}}`).join('') +
    `@supports (color:light-dark(#000,#fff)){` +
    `.sema{--sb-zemin:var(--zemin,light-dark(#ffffff,#111416));--sb-yazi:var(--yazi,light-dark(#14130f,#eef0ec));--sb-kontur:light-dark(transparent,#8d99a5);--sb-halo:light-dark(transparent,#c3cbd2)}` +
    [...kurallar].map(([k, d]) => `.sema .${k}{${d}}`).join('') +
    `}`;

  const koklesmis = cikis.map(yaz);
  const kokYazi = koklesmis[cikis.indexOf(kok)];
  koklesmis[cikis.indexOf(kok)] = `${kokYazi}<style>${taban}</style>`;
  return koklesmis.join('').trim();
}
