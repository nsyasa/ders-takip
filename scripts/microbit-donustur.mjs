// micro:bit kitabını (production-1-5: HTML sınıflı Markdown sayfaları + manifest + görseller) siteye dönüştürür.
//
//   node scripts/microbit-donustur.mjs [kaynak-klasoru] [--kuru]
//   (kaynak: argüman, MICROBIT_KAYNAK ortam değişkeni ya da aşağıdaki varsayılan)
//
// Çıktı: icerik/microbit/ (ders.json, proje-NN.md ×45, genel/*.md, gorseller/*). Bu klasör BU BETİKLE ÜRETİLİR:
// kitap değişince betiği yeniden çalıştırın; elle düzenlemeyin (yeniden çalıştırınca ezilir). Kaynak klasöre dokunulmaz.
// Metin düzeltmeleri (sayfa göndermeleri vb.) scripts/lib/html-md.mjs içindeki METIN_KURALLARI'nda tutulur.
//
// --kuru: dosya yazmaz; yalnız raporu basar.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFragment } from 'parse5';
import sharp from 'sharp';
import { makecodeKucult } from './lib/makecode-kucult.mjs';
import { nitelik, siniflar, cocuklar, elemanlar, duzMetin, satirIci, duzOzet, kac } from './lib/html-md.mjs';

const BU = path.dirname(fileURLToPath(import.meta.url));
const DEPO = path.resolve(BU, '..');
const HEDEF = path.join(DEPO, 'icerik', 'microbit');
const EK_VARLIK = path.join(BU, 'microbit-ek');
const argumanlar = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const KURU = process.argv.includes('--kuru');
const KAYNAK = path.resolve(argumanlar[0] ?? process.env.MICROBIT_KAYNAK ?? 'C:/Users/Enes/Documents/vibe coding/kitaplar/microbit_baslangic_gorevler/production-1-5');
const SAYFALAR = path.join(KAYNAK, 'content', 'pages');
const VARLIKLAR = path.join(KAYNAK, 'src', 'assets');

// ── Kitap bilgileri ──────────────────────────────────────────────────────────
const ILERI = new Set([21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 34, 38, 40]); // kitabın build.mjs'indeki "İleri" kümesi
const UNITELER = [
  { ad: 'Kartla tanış ve oyna', ilk: 1, son: 12, renk: '#1565C0' },
  { ad: 'Sensörleri keşfet', ilk: 13, son: 23, renk: '#A8149A' },
  { ad: 'Yeni fikirler ve devreye geçiş', ilk: 24, son: 34, renk: '#00796B' },
  { ad: 'Harici devre ve tasarım', ilk: 35, son: 45, renk: '#B85400' },
];
const ADIMLAR = [
  { ad: 'Bak', aciklama: 'Yeni parçayı veya kart özelliğini bul.' },
  { ad: 'Tahmin et', aciklama: '“Sence ne olacak?” sorusunu cevapla.' },
  { ad: 'Kodla', aciklama: 'MakeCode bloklarını doğru sıraya koy.' },
  { ad: 'Dene', aciklama: 'Simülatörde ve micro:bit’te çalıştır.' },
  { ad: 'Anlat', aciklama: 'Ne gördüğünü ve nedenini açıkla.' },
  { ad: 'Değiştir', aciklama: 'Tek bir şeyi değiştirip yeniden dene.' },
];
const GENEL = [
  {
    slug: 'hos-geldin',
    baslik: 'Hoş geldin',
    ustbilgi: 'Hoş geldin!',
    kaynak: ['02-kitaba-giris.md'],
    // 03/03a (yol haritası) sayfalarının yönlendirme cümleleri bu metinde toplandı; proje listesi zaten ders sayfasındadır
    ek: 'Radyo kullanan [29](proje:29) ve [30](proje:30). projeler için iki micro:bit gerekir; bir arkadaşınla çift çalışırsın.\n\nTakıldığın bir terim olursa [sözlüğe](genel:sozluk) bak. Devre kurmadan önce [devre kurma kuralları](genel:devre-kurma-kurallari) sayfasındaki güvenlik kurallarını aç.',
  },
  { slug: 'nasil-calisir', baslik: 'micro:bit nasıl çalışır?', ustbilgi: 'Bir bilgi gelir, bir cevap çıkar', kaynak: ['04-kart-nasil-dusunur.md'] },
  { slug: 'karti-tani', baslik: 'micro:bit V2’yi tanı', ustbilgi: 'Kartını bul, özelliklerini keşfet', kaynak: ['05-microbit-v2-tani.md'], krediKoru: true },
  { slug: 'kod-bloklari', baslik: 'Kod bloklarını tanı', ustbilgi: 'Başlamadan önce • MakeCode blokları', kaynak: ['06-kod-bloklarini-tani.md'] },
  { slug: 'blok-sozlugu', baslik: 'Blokların dilini çöz', ustbilgi: 'Başlamadan önce • Küçük blok sözlüğü', kaynak: ['06a-blok-sozlugu.md'] },
  { slug: 'devre-kurma-kurallari', baslik: 'Devre kurma kuralları', ustbilgi: 'Harici parçalardan önce', kaynak: ['29a-devre-kurma-kurallari.md'] },
  { slug: 'sozluk', baslik: 'Öğrendiğin sözcükler', ustbilgi: 'Küçük sözlük', kaynak: ['54-sozluk-a.md', '55-sozluk-b.md'] },
  { slug: 'kaynaklar', baslik: 'Kaynaklar ve görseller', ustbilgi: 'Kitabın sonunda', kaynak: ['56-kaynaklar-ve-gorseller.md', '56a-yeni-proje-kaynaklari.md'] },
];
// Kitap görselleri: ham → site adı. MakeCode SVG'leri küçültülür, devre şemaları aynen kopyalanır, kart görselleri WebP olur.
const RASTER = {
  'microbit-v2-front-numbered.png': { ad: 'karti-on-yuz.webp', genislik: 800 },
  'microbit-v2-back-numbered.png': { ad: 'karti-arka-yuz.webp', genislik: 800 },
};
// Kapak çizimleri (kitabın kapak/arka kapak resimlerinden kesilir; ders kartı ve ders sayfası başlığında kullanılır)
const KAPAKLAR = [
  { kaynak: 'cover-final-45-projects.png', ad: 'kapak.webp', kes: { left: 0, top: 590, width: 1055, height: 700 }, genislik: 1000, kalite: 80 },
  { kaynak: 'back-cover-editorial-corrected.png', ad: 'kapak-ogrenciler.webp', kes: { left: 0, top: 250, width: 1024, height: 780 }, genislik: 960, kalite: 78 },
];

const rapor = { uyari: [], bilgi: [] };
const uyar = (dosya, ileti) => rapor.uyari.push(`${dosya}: ${ileti}`);
const kuralSayisi = new Map();

// ── Sayfayı oku ve blok modeline çevir ───────────────────────────────────────
function sayfaAyristir(dosya) {
  let ham = fs.readFileSync(path.join(SAYFALAR, dosya), 'utf8').replace(/^\uFEFF/, '');
  ham = ham.replace(/^# (.+)$/m, '<h1>$1</h1>');
  return parseFragment(ham);
}

const sinifVar = (n, ...adlar) => adlar.some((a) => siniflar(n).includes(a));
const bosYaziCizgisi = (n) => elemanlar(n).some((c) => c.tagName === 'i' && duzMetin(c) === '');

/** Görselin kitap yolundan site dosya adını çıkarır ve görsel kaydını tutar. */
function gorselKaydet(src, ctx) {
  const ham = path.basename(src);
  const ad = RASTER[ham]?.ad ?? ham;
  ctx.gorseller.add(ham);
  return ad;
}

function gorselBlogu(fig, ctx) {
  const img = elemanlar(fig).find((c) => c.tagName === 'img');
  if (!img) return null;
  const cap = elemanlar(fig).find((c) => c.tagName === 'figcaption');
  const src = nitelik(img, 'src') ?? '';
  return {
    tur: 'gorsel',
    ad: gorselKaydet(src, ctx),
    alt: (nitelik(img, 'alt') ?? '').trim(),
    yazi: cap ? satirIci(cocuklar(cap), ctx.baglam, { tekSatir: true }) : '',
    makecode: sinifVar(fig, 'real-blocks'),
  };
}

function toplaTablo(tablo, ctx) {
  const satirlar = [];
  const basliklar = [];
  for (const tr of tablo.childNodes.flatMap((x) => (x.tagName === 'thead' || x.tagName === 'tbody' ? cocuklar(x) : [x])).filter((x) => x.tagName === 'tr')) {
    const hucreler = elemanlar(tr);
    if (hucreler.some((h) => h.tagName === 'th')) basliklar.push(...hucreler.map((h) => duzMetin(h)));
    else satirlar.push(hucreler.map((h) => ({ metin: duzMetin(h), md: satirIci(cocuklar(h), ctx.baglam, { tekSatir: true }) })));
  }
  return { basliklar, satirlar };
}

const bosHucre = (m) => /^[_\s]*$/.test(m);

/** Düğümleri sırayla gezip bloklara döker. out: blok listesi. */
function yurut(dugumler, ctx, out) {
  for (const n of dugumler) {
    if (n.nodeName === '#text') {
      if (n.value.trim()) uyar(ctx.dosya, `kapsayıcısız metin atlandı: ${n.value.trim().slice(0, 50)}`);
      continue;
    }
    if (!n.tagName) continue;
    blokla(n, ctx, out);
  }
}

function blokla(n, ctx, out) {
  const t = n.tagName;
  const s = (...a) => sinifVar(n, ...a);
  const cs = elemanlar(n);
  const girdi = (nodes, secenek) => satirIci(nodes, ctx.baglam, secenek);

  if (t === 'h1') {
    ctx.baslik = duzMetin(n);
    return;
  }
  if (t === 'h2' || t === 'h3') {
    out.push({ tur: t === 'h2' ? 'baslik' : 'altbaslik', metin: duzMetin(n) });
    return;
  }
  if (t === 'ol' || t === 'ul') {
    out.push({ tur: 'liste', sirali: t === 'ol', ogeler: cs.filter((c) => c.tagName === 'li').map((li) => girdi(cocuklar(li))) });
    return;
  }
  if (t === 'figure') {
    const g = gorselBlogu(n, ctx);
    if (g) out.push(g);
    else uyar(ctx.dosya, '<figure> içinde görsel yok');
    return;
  }
  if (t === 'table') {
    out.push({ tur: 'tablo', ...toplaTablo(n, ctx) });
    return;
  }

  if (t === 'p') {
    if (s('eyebrow')) ctx.eyebrow = duzMetin(n);
    else if (s('lead')) ctx.lead = n;
    else if (s('source-credit')) ctx.krediler.push(n);
    else if (s('print-url', 'project-map-end', 'glossary-bottom', 'back-kicker', 'back-cover-line')) return;
    else if (s('help-note')) {
      const ilk = elemanlar(n)[0];
      const olmadi = ilk?.tagName === 'b' && /^Olmadıysa:?$/i.test(duzMetin(ilk));
      const govde = olmadi ? cocuklar(n).slice(cocuklar(n).indexOf(ilk) + 1) : cocuklar(n);
      out.push({ tur: olmadi ? 'olmadiysa' : 'bilgi', md: girdi(govde) });
    } else if (s('measurement-note')) out.push({ tur: 'bilgi', md: girdi(cocuklar(n)) });
    else out.push({ tur: 'paragraf', md: girdi(cocuklar(n)) });
    return;
  }

  // ── div / section / aside ──
  if (s('project-meta')) {
    const meta = {};
    for (const sp of cs) {
      const m = duzMetin(sp);
      if (m.startsWith('⏱')) meta.sure = Number(/(\d+)(?:\s*[–-]\s*(\d+))?\s*dk/.exec(m)?.[2] ?? /(\d+)\s*dk/.exec(m)?.[1] ?? 0);
      else if (m.startsWith('🧩')) meta.fikir = m.replace(/^🧩\s*/, '').replace(/^Yeni fikir:\s*/i, '');
      else if (m.startsWith('📦')) meta.malzeme = m.replace(/^📦\s*/, '');
    }
    ctx.meta = meta;
    return;
  }
  if (s('predict-first')) {
    const sp = cs.find((c) => c.tagName === 'span');
    out.push({ tur: 'tahmin', md: girdi(cocuklar(sp), { tekSatir: true }), yaz: bosYaziCizgisi(n) });
    return;
  }
  if (s('next-challenge')) {
    const b = cs.find((c) => c.tagName === 'b');
    const sp = cs.find((c) => c.tagName === 'span');
    out.push({ tur: 'degistir', etiket: duzMetin(b), md: girdi(cocuklar(sp)), yaz: bosYaziCizgisi(n) });
    return;
  }
  if (s('observation-row')) {
    const kutular = cs.filter((c) => c.tagName === 'section').map((sec) => {
      const h = elemanlar(sec).find((c) => c.tagName === 'h2');
      const p = elemanlar(sec).find((c) => c.tagName === 'p');
      return { etiket: duzMetin(h), md: girdi(cocuklar(p), { tekSatir: true }) };
    });
    out.push({ tur: 'gozlem', kutular });
    return;
  }
  if (s('button-cue')) {
    const tuslar = cs.filter((c) => c.tagName === 'span').map((c) => duzMetin(c));
    const metin = duzMetin(cs.find((c) => c.tagName === 'b'));
    out.push({ tur: 'jest', tuslar, metin });
    return;
  }
  if (s('count-strip', 'tilt-cue')) {
    const jetonlar = cs.map((c) => {
      const m = duzMetin(c);
      const etiketli = /^→\s*(\S+)\s*→$/.exec(m);
      return etiketli ? `→ (${etiketli[1]}) →` : m;
    });
    out.push({ tur: 'sira', metin: jetonlar.join(' ') });
    return;
  }
  if (s('dice-notes')) {
    out.push({ tur: 'yazlar', alanlar: [{ etiket: 'Kartta gördüğüm sayılar', satir: 1 }] });
    return;
  }
  if (s('reading-notes')) {
    out.push({ tur: 'yazlar', alanlar: cs.filter((c) => c.tagName === 'b').map((b) => ({ etiket: duzMetin(b), satir: 1 })) });
    return;
  }
  if (s('five-hole-demo')) {
    if (!ctx.delikVar) {
      ctx.delikVar = true;
      ctx.ek.add('delik-gruplari.svg');
      out.push({
        tur: 'gorsel',
        ad: 'delik-gruplari.svg',
        alt: 'Deney tahtasında 8 numaralı beşli delik grubunun a–e delikleri birbirine bağlı; 10 numaralı grup ayrı bir gruptur.',
        yazi: 'a–e delikleri aynı grup; numara farklıysa grup da farklı.',
        makecode: false,
      });
    }
    return;
  }
  if (s('rps-map')) {
    const baslik = duzMetin(cs.find((c) => c.tagName === 'b'));
    out.push({ tur: 'kutuListe', baslik, ogeler: cs.filter((c) => c.tagName === 'span').map((c) => girdi(cocuklar(c), { tekSatir: true })) });
    return;
  }
  if (s('connection-check')) {
    const baslik = duzMetin(cs.find((c) => c.tagName === 'h2'));
    const metin = duzMetin(cs.find((c) => c.tagName === 'p'));
    const ogeler = metin.split('☐').map((x) => x.trim().replace(/^[\s.]+|[\s]+$/g, '')).filter(Boolean);
    out.push({ tur: 'kontrol', baslik, ogeler });
    return;
  }
  if (s('kit-code-grid', 'rgb-block-grid')) {
    const gorseller = cs.filter((c) => c.tagName === 'figure').map((f) => gorselBlogu(f, ctx)).filter(Boolean);
    out.push({ tur: 'galeri', gorseller });
    return;
  }
  if (s('audio-start-note')) {
    yurut(cs, ctx, out);
    return;
  }
  if (s('system-flow')) {
    ctx.ek.add('giris-kod-cikis.svg');
    out.push({
      tur: 'gorsel',
      ad: 'giris-kod-cikis.svg',
      alt: 'Üç adım: A düğmesine basmak giriştir, kart komutu izler, 5 × 5 LED ekranda A harfi çıkar.',
      yazi: '1 Giriş: A düğmesine basarsın. 2 Kod: micro:bit komutu izler. 3 Çıkış: ekranda A harfi görünür.',
      makecode: false,
    });
    return;
  }
  if (s('start-kit')) {
    out.push({ tur: 'baslik', metin: duzMetin(cs.find((c) => c.tagName === 'h2')) });
    out.push({ tur: 'liste', sirali: false, ogeler: cs.filter((c) => c.tagName === 'span').map((c) => duzMetin(c).replace(/^[□☐]\s*/, '')) });
    return;
  }
  if (s('first-twenty', 'last-ten')) {
    out.push({ tur: 'kutu', kutu: 'bilgi', baslik: duzMetin(cs.find((c) => c.tagName === 'strong')), md: girdi(cocuklar(cs.find((c) => c.tagName === 'span'))) });
    return;
  }
  if (s('welcome-side')) {
    const etiket = duzMetin(cs.find((c) => s('tag') || sinifVar(c, 'tag')) ?? { childNodes: [] });
    const h2 = cs.find((c) => c.tagName === 'h2');
    const p = cs.find((c) => c.tagName === 'p');
    out.push({ tur: 'kutu', kutu: /önemli/.test(etiket.toLocaleLowerCase('tr')) ? 'dikkat' : 'bilgi', baslik: h2 ? duzMetin(h2) : '', md: girdi(cocuklar(p)) });
    return;
  }
  if (s('idea-row')) {
    for (const sec of cs) {
      const h = elemanlar(sec).find((c) => c.tagName === 'h2');
      const p = elemanlar(sec).find((c) => c.tagName === 'p');
      out.push({ tur: 'paragraf', md: `**${kac(duzMetin(h))}** ${girdi(cocuklar(p))}` });
    }
    return;
  }
  if (s('think-box', 'explain-box', 'find-it', 'sketch-task')) {
    if (s('think-box')) {
      out.push({ tur: 'kutu', kutu: 'bilgi', baslik: 'Önce düşün', md: girdi(cocuklar(cs.find((c) => c.tagName === 'p'))) });
    } else if (s('explain-box')) {
      out.push({ tur: 'kutu', kutu: 'bilgi', baslik: duzMetin(cs.find((c) => c.tagName === 'b')), md: girdi(cocuklar(cs.find((c) => c.tagName === 'p'))) });
    } else if (s('sketch-task')) {
      const kutu = cs.find((c) => c.tagName === 'div');
      out.push({ tur: 'kutu', kutu: 'bilgi', baslik: 'Sıra sende', md: girdi(cocuklar(elemanlar(kutu).find((c) => c.tagName === 'p'))) });
    } else {
      for (const alt of cs) {
        const rozet = elemanlar(alt).find((c) => sinifVar(c, 'badge'));
        const p = elemanlar(alt).find((c) => c.tagName === 'p');
        if (rozet && p) out.push({ tur: 'kutu', kutu: 'bilgi', baslik: duzMetin(rozet).toLocaleLowerCase('tr').replace(/^./u, (c) => c.toLocaleUpperCase('tr')), md: girdi(cocuklar(p)) });
      }
    }
    return;
  }
  if (s('glossary-grid')) {
    for (const d of cs) {
      const h = elemanlar(d).find((c) => c.tagName === 'h2');
      const p = elemanlar(d).find((c) => c.tagName === 'p');
      const kucuk = elemanlar(h).find((c) => c.tagName === 'small');
      const terim = duzMetin({ childNodes: cocuklar(h).filter((c) => c.tagName !== 'small') });
      const projeNo = kucuk ? Number(/(\d+)\./.exec(duzMetin(kucuk))?.[1]) : 0;
      out.push({ tur: 'terim', terim, md: girdi(cocuklar(p)), proje: projeNo });
    }
    return;
  }
  if (s('source-note-grid', 'block-guide-grid', 'board-guide', 'board-images', 'source-note-about', 'welcome-grid', 'welcome-main', 'project-columns', 'project-steps', 'project-result', 'rps-top', 'animation-layout', 'tall-code-layout', 'mini-system-trials')) {
    const alt = [];
    if (s('source-note-grid', 'block-guide-grid', 'board-guide')) {
      for (const sec of cs) {
        const kapsa = [];
        yurut(cocuklar(sec), ctx, kapsa);
        // bölüm başlığı bu sayfa türünde bir alt başlıktır
        for (const b of kapsa) out.push(b.tur === 'baslik' ? { ...b, tur: 'altbaslik' } : b);
      }
      return;
    }
    yurut(cocuklar(n), ctx, alt);
    // Kod akışı görseli iki sütunlu yerleşimde bölümün yanındadır: "Yap" listesinden hemen sonra göster
    if (s('animation-layout', 'tall-code-layout')) {
      const fig = alt.findIndex((b) => b.tur === 'gorsel');
      const liste = alt.findIndex((b) => b.tur === 'liste');
      if (fig > liste && liste >= 0) alt.splice(liste + 1, 0, ...alt.splice(fig, 1));
    }
    out.push(...alt);
    return;
  }
  if (s('cover', 'back-cover', 'back-cover-art', 'back-cover-copy', 'back-cover-bottom')) return;
  if (s('footnote', 'bottom-note', 'later-note', 'source-note-author')) {
    out.push({ tur: 'paragraf', md: girdi(cocuklar(n)) });
    return;
  }

  // Tanınmayan kapsayıcı: içeriği yine de işle, haber ver
  uyar(ctx.dosya, `tanınmayan öğe: <${t} class="${siniflar(n).join(' ')}">`);
  yurut(cocuklar(n), ctx, out);
}

function sayfaModeli(dosya, projeNo) {
  const ctx = {
    dosya,
    gorseller: new Set(),
    ek: new Set(),
    krediler: [],
    delikVar: false,
    baglam: { proje: projeNo, kuralSayisi },
  };
  const bloklar = [];
  yurut(cocuklar(sayfaAyristir(dosya)), ctx, bloklar);
  // Kitap bloklarının görseli, sayfada "Kartında dene" bölümünden sonra gelmişse "Yap" bölümüne taşınır
  const kd = bloklar.findIndex((b) => b.tur === 'baslik' && /Kartında dene/.test(b.metin));
  if (kd >= 0) {
    const tasi = [];
    for (let i = bloklar.length - 1; i > kd; i--) if ((bloklar[i].tur === 'gorsel' && bloklar[i].makecode) || bloklar[i].tur === 'galeri') tasi.unshift(...bloklar.splice(i, 1));
    if (tasi.length) bloklar.splice(kd, 0, ...tasi);
  }
  return { dosya, ctx, bloklar, baslik: ctx.baslik, eyebrow: ctx.eyebrow ?? '', lead: ctx.lead, meta: ctx.meta ?? {}, krediler: ctx.krediler };
}

// ── Markdown yazıcıları ──────────────────────────────────────────────────────
const cumleHarfi = (s) => {
  const k = s.toLocaleLowerCase('tr').replace(/micro:bit v2/g, 'micro:bit V2').replace(/\bmakecode\b/g, 'MakeCode');
  return k.charAt(0).toLocaleUpperCase('tr') + k.slice(1);
};
const yaziAlani = (etiket, satir = 2) => `::yaz[${etiket}]{satir=${satir}}\n\n`;
const nitelikDegeri = (s) => String(s).replace(/"/g, '”').replace(/\s+/g, ' ').trim();
const resimYaz = (g) => `![${kac(g.alt)}](./gorseller/${g.ad}${g.yazi ? ` "${g.yazi.replace(/"/g, '\\"')}"` : ''})\n\n`;

function blokYaz(b, ust, say) {
  switch (b.tur) {
    case 'paragraf':
      return `${b.md}\n\n`;
    case 'liste':
      return `${b.ogeler.map((o, i) => `${b.sirali ? `${i + 1}.` : '-'} ${o}`).join('\n')}\n\n`;
    case 'gorsel':
      return resimYaz(b);
    case 'galeri':
      return `:::galeri\n${b.gorseller.map(resimYaz).join('')}:::\n\n`;
    case 'olmadiysa':
      return `:::olmadiysa\n${b.md}\n:::\n\n`;
    case 'bilgi':
      return `:::bilgi\n${b.md}\n:::\n\n`;
    case 'kutu':
      return `:::${b.kutu}${b.baslik ? `[${kac(b.baslik)}]` : ''}\n${b.md}\n:::\n\n`;
    case 'kutuListe':
      return `:::bilgi[${kac(b.baslik)}]\n${b.ogeler.map((o) => `- ${o}`).join('\n')}\n:::\n\n`;
    case 'kontrol':
      return `:::kontrol[${kac(b.baslik)}]\n${b.ogeler.map((o) => `- ${kac(o)}`).join('\n')}\n:::\n\n`;
    case 'jest':
      return `::jest[${kac(b.metin)}]{tuslar="${nitelikDegeri(b.tuslar.join(','))}"}\n\n`;
    case 'sira':
      return `::sira[${kac(b.metin)}]\n\n`;
    case 'yazlar':
      return b.alanlar.map((a) => (say.yaz++, yaziAlani(kac(a.etiket), a.satir))).join('');
    case 'tablo': {
      const bos = b.basliklar.map((_, c) => b.satirlar.some((r) => bosHucre(r[c]?.metin ?? 'x')));
      if (!bos.some(Boolean)) {
        const ust = `| ${b.basliklar.map(kac).join(' | ')} |\n| ${b.basliklar.map(() => '---').join(' | ')} |\n`;
        return `${ust}${b.satirlar.map((r) => `| ${r.map((h) => h.md).join(' | ')} |`).join('\n')}\n\n`;
      }
      // Doldurulacak tablo: her satır, yazma alanlarıyla bir etkinliğe dönüşür
      return b.satirlar
        .map((r) => {
          const doldur = b.basliklar.filter((_, c) => bos[c]);
          const baglam = b.basliklar.map((h, c) => (!bos[c] && c > 0 ? `${h}: ${r[c].metin}` : '')).filter(Boolean);
          const ilk = b.basliklar[0] && /^\d+$/.test(r[0].metin) ? `${b.basliklar[0]} ${r[0].metin}` : r[0].metin;
          say.yaz++;
          return yaziAlani(`**${kac(ilk)}**${baglam.length ? ` · ${kac(baglam.join(' · '))}` : ''} — ${kac(doldur.join(' / '))}`, doldur.length > 1 ? 2 : 1);
        })
        .join('');
    }
    case 'terim':
      return `### ${kac(b.terim)}\n\n${b.md}${b.proje ? ` ([${b.proje}. proje](proje:${b.proje}))` : ''}\n\n`;
    default:
      throw new Error(`bilinmeyen blok türü: ${b.tur}`);
  }
}

/** Bir kitap sayfasının bloklarını proje bölümlerine yazar: ust = '##' (tek kısım) ya da '###' (çok kısım). */
function projeBolumleri(model, ust, say) {
  let md = '';
  const baslat = (b) => (md += `${ust} ${b}\n\n`);
  for (const b of model.bloklar) {
    if (b.tur === 'baslik') baslat(b.metin);
    else if (b.tur === 'altbaslik') md += `#### ${kac(b.metin)}\n\n`;
    else if (b.tur === 'tahmin') {
      baslat('Önce tahmin et');
      md += `:::tahmin\n${b.md}\n:::\n\n`;
      if (b.yaz) (say.yaz++, (md += yaziAlani('Tahminim', 1)));
    } else if (b.tur === 'gozlem') {
      baslat(b.kutular[0]?.etiket === 'Planım' ? 'Planla' : 'Anlat');
      for (const k of b.kutular) (say.yaz++, (md += yaziAlani(`**${kac(k.etiket)}${k.etiket.endsWith('?') ? '' : ':'}** ${k.md}`, 2)));
    } else if (b.tur === 'degistir') {
      baslat(cumleHarfi(b.etiket));
      md += `${b.md}\n\n`;
      if (b.yaz) (say.yaz++, (md += yaziAlani(/DEĞİŞTİR/.test(b.etiket) ? 'Ne değişti?' : 'Notum', 2)));
    } else md += blokYaz(b, ust, say);
  }
  return md;
}

// ── Proje ────────────────────────────────────────────────────────────────────
function malzemeAyristir(metin, projeNo) {
  const sonuc = [];
  for (const parca of metin.split(/\s+\+\s+/)) {
    const p = parca.trim();
    if (!p) continue;
    let m = /^(\d+)\s*[×x]\s*(.+?)(?:\s*\(([^)]*)\))?$/.exec(p);
    if (m) sonuc.push({ ad: m[2].trim(), adet: m[1], not: m[3] ?? '' });
    else if ((m = /^(\d+)\s+(.+)$/.exec(p))) sonuc.push({ ad: m[2].trim(), adet: m[1], not: '' });
    else sonuc.push({ ad: p, adet: '', not: '' });
  }
  // Kendi numarasına gönderme ("31. projenin LED devresi", "(33. proje)") malzeme sayılmaz
  const kendi = new RegExp(`\\s*\\(${projeNo}\\. proje\\)`);
  return sonuc
    .filter((x) => Number(/^(\d{1,2})\. projenin/.exec(x.ad)?.[1]) !== projeNo)
    .map((x) => ({ ...x, ad: x.ad.replace(kendi, '') }));
}

const yamlDizgi = (s) => JSON.stringify(String(s));

function onYaz(fm) {
  const satir = [];
  const dizi = (ad, liste, yaz) => {
    if (!liste.length) satir.push(`${ad}: []`);
    else {
      satir.push(`${ad}:`);
      liste.forEach((x) => satir.push(...yaz(x)));
    }
  };
  satir.push(`ders: ${fm.ders}`, `numara: ${fm.numara}`, `slug: ${fm.slug}`, `baslik: ${yamlDizgi(fm.baslik)}`);
  if (fm.altbaslik) satir.push(`altbaslik: ${yamlDizgi(fm.altbaslik)}`);
  if (fm.ozet) satir.push(`ozet: ${yamlDizgi(fm.ozet)}`);
  satir.push(`sureDk: ${fm.sureDk}`, `seviye: ${yamlDizgi(fm.seviye)}`);
  satir.push(`onkosulFoyler: [${fm.onkosulFoyler.join(', ')}]`);
  dizi('kavramlar', fm.kavramlar, (x) => [`  - ${yamlDizgi(x)}`]);
  satir.push('hedefler: []');
  dizi('malzemeler', fm.malzemeler, (m) => [`  - ad: ${yamlDizgi(m.ad)}`, ...(m.adet ? [`    adet: ${yamlDizgi(m.adet)}`] : []), ...(m.not ? [`    not: ${yamlDizgi(m.not)}`] : [])]);
  dizi('gorseller', fm.gorseller, (g) => [`  - ${yamlDizgi(g)}`]);
  satir.push(`adimSayisi: ${fm.adimSayisi}`, `yazSayisi: ${fm.yazSayisi}`);
  return `---\n${satir.join('\n')}\n---\n`;
}

function projeUret(p) {
  const nn = String(p.number).padStart(2, '0');
  const modeller = p.pages.map((f) => sayfaModeli(f, p.number));
  const cok = modeller.length > 1;
  const say = { yaz: 0 };

  // Üst bilgi: süre, kavramlar, malzemeler, önkoşul (kitaptaki 📦/🧩/⏱ satırlarından)
  let sure = 0;
  const kavramlar = [];
  const malzemeler = [];
  const onkosul = new Set();
  for (const m of modeller) {
    sure += m.meta.sure ?? 0;
    if (m.meta.fikir && !kavramlar.includes(m.meta.fikir)) kavramlar.push(m.meta.fikir);
    if (m.meta.malzeme) {
      for (const x of malzemeAyristir(m.meta.malzeme, p.number)) {
        const var_ = malzemeler.find((y) => y.ad === x.ad);
        if (!var_) malzemeler.push(x);
        else if (Number(x.adet) > Number(var_.adet || 0)) var_.adet = x.adet;
      }
      if (!/veya/.test(m.meta.malzeme)) {
        for (const o of m.meta.malzeme.matchAll(/(\d{1,2})\. proje/g)) if (Number(o[1]) !== p.number) onkosul.add(Number(o[1]));
      }
    }
  }
  // Tek sayfalı projelerde kitabın üst etiketi ("İLK KODUM") alt başlık olur
  let altbaslik = '';
  if (!cok) {
    const k = /•\s*(.+)$/.exec(modeller[0].eyebrow)?.[1] ?? '';
    if (k && cumleHarfi(k).toLocaleLowerCase('tr') !== p.title.toLocaleLowerCase('tr') && !/^\s*PROJE\s*\d+\s*$/.test(k)) {
      const norm = (x) => x.toLocaleLowerCase('tr').replace(/[ıİ]/g, 'i').replace(/[^a-zçğöşü0-9 ]/gi, '');
      if (norm(k) !== norm(p.title)) altbaslik = cumleHarfi(k);
    }
  }

  let govde = '';
  modeller.forEach((m, i) => {
    if (cok) {
      govde += `## ${i + 1}. kısım — ${kac(m.baslik)}\n\n`;
      if (m.lead) govde += `${satirIci(cocuklar(m.lead), { proje: p.number, kuralSayisi })}\n\n`;
      const k = [];
      if (m.meta.sure) k.push(`sure="${m.meta.sure}"`);
      if (m.meta.fikir) k.push(`fikir="${nitelikDegeri(m.meta.fikir)}"`);
      if (m.meta.malzeme) k.push(`malzeme="${nitelikDegeri(m.meta.malzeme)}"`);
      if (k.length) govde += `::kunye{${k.join(' ')}}\n\n`;
    }
    govde += projeBolumleri(m, cok ? '###' : '##', say);
  });

  const gorseller = [...new Set(modeller.flatMap((m) => [...m.ctx.gorseller, ...m.ctx.ek]))];
  const fm = {
    ders: 'microbit',
    numara: p.number,
    slug: `proje-${nn}`,
    baslik: p.title,
    altbaslik,
    ozet: !cok && modeller[0].lead ? duzOzet(modeller[0].lead) : '',
    sureDk: sure,
    seviye: p.number <= 20 ? 'Temel' : ILERI.has(p.number) ? 'İleri' : p.number >= 41 ? 'Çevre' : 'Temel',
    onkosulFoyler: [...onkosul].sort((a, b) => a - b),
    kavramlar,
    malzemeler,
    gorseller: gorseller.filter((g) => g.endsWith('.svg')).map((g) => g.replace(/\.svg$/, '')),
    adimSayisi: ADIMLAR.length,
    yazSayisi: say.yaz,
  };
  return { nn, icerik: `${onYaz(fm)}\n${govde.trimEnd()}\n`, fm, gorseller };
}

// ── Genel sayfalar ───────────────────────────────────────────────────────────
function genelUret(g, sira) {
  let govde = '';
  const say = { yaz: 0 };
  const gorseller = new Set();
  let ikiVar = false; // sayfada ## başlık yazıldı mı? Yoksa ilk alt başlıklar ## olur (h1'den h3'e atlanmasın)
  const baslikYaz = (metin, ikinci) => {
    if (ikinci) ikiVar = true;
    govde += `${ikinci || !ikiVar ? '##' : '###'} ${kac(metin)}\n\n`;
  };
  const sozlukBolumu = (m) => `${m.eyebrow.replace(/^.*•\s*/, '')} arası`;
  g.kaynak.forEach((dosya, i) => {
    const m = sayfaModeli(dosya, 0);
    m.ctx.gorseller.forEach((x) => gorseller.add(x));
    m.ctx.ek.forEach((x) => gorseller.add(x));
    // Birleşik sayfalarda her kaynak kendi başlığıyla bölüm olur; sözlükte harf aralığı başlık olur
    if (g.slug === 'sozluk') baslikYaz(sozlukBolumu(m), true);
    else if (m.baslik && (i > 0 || m.baslik !== g.baslik)) baslikYaz(m.baslik, true);
    if (m.lead) govde += `${satirIci(cocuklar(m.lead), { proje: 0, kuralSayisi })}\n\n`;
    for (const b of m.bloklar) {
      if (b.tur === 'baslik') baslikYaz(b.metin, true);
      else if (b.tur === 'altbaslik') baslikYaz(b.metin, false);
      else if (b.tur === 'terim') govde += blokYaz(b, ikiVar ? '###' : '##', say);
      else if (b.tur === 'degistir') govde += `:::bilgi[${kac(cumleHarfi(b.etiket))}]\n${b.md}\n:::\n\n`;
      else if (b.tur === 'gozlem') {
        // Genel sayfalarda yazma alanı yok (ilerleme yalnız proje sayfalarında tutulur): yalnız "Neden?" sorusu kalır
        const neden = b.kutular.find((k) => /Neden/.test(k.etiket));
        if (neden) govde += `:::bilgi[Düşün]\n${neden.md}\n:::\n\n`;
      } else if (b.tur === 'tahmin') govde += `:::bilgi[Önce tahmin et]\n${b.md}\n:::\n\n`;
      else {
        if (g.slug === 'hos-geldin' && b.tur === 'paragraf' && b.md.startsWith('**Temel yol')) baslikYaz('Hangi projeyi açacaksın?', true);
        govde += blokYaz(b, '##', say);
      }
    }
    if (g.krediKoru) for (const k of m.krediler) govde += `${satirIci(cocuklar(k), { proje: 0, kuralSayisi })}\n\n`;
  });
  if (g.ek) govde += `${g.ek}\n\n`;
  const fm = `---\ntur: genel\nbaslik: ${yamlDizgi(g.baslik)}\nslug: ${g.slug}\nsira: ${sira}\nustbilgi: ${yamlDizgi(g.ustbilgi)}\n---\n`;
  return { icerik: `${fm}\n${govde.trimEnd()}\n`, gorseller };
}

// ── Ana akış ─────────────────────────────────────────────────────────────────
const manifest = JSON.parse(fs.readFileSync(path.join(KAYNAK, 'content', 'project-manifest.json'), 'utf8'));
if (manifest.projects.length !== 45) throw new Error(`Manifestte ${manifest.projects.length} proje var, 45 bekleniyordu`);

const ciktilar = new Map(); // göreli yol → içerik (metin)
const gerekenGorseller = new Set();
const projeler = manifest.projects.map((p) => {
  const u = projeUret(p);
  ciktilar.set(`proje-${u.nn}.md`, u.icerik);
  u.gorseller.forEach((g) => gerekenGorseller.add(g));
  return u;
});
GENEL.forEach((g, i) => {
  const u = genelUret(g, i + 1);
  ciktilar.set(`genel/${g.slug}.md`, u.icerik);
  u.gorseller.forEach((x) => gerekenGorseller.add(x));
});

const toplamDk = projeler.reduce((t, u) => t + u.fm.sureDk, 0);
const dersJson = {
  kod: 'microbit',
  ad: 'micro:bit Başlangıç',
  altbaslik: 'MakeCode bloklarıyla 45 kısa proje',
  aciklama:
    'Bu kitapta 45 kısa projeyle micro:bit V2’yi tanıyacak; önce kartın ekranı, düğmeleri ve sensörleriyle, sonra setindeki elektronik parçalarla yeni fikirler deneyeceksin.',
  renk: '#0E7C86',
  ikon: '🟣',
  sira: 2,
  durum: 'hazir',
  foySayisi: 45,
  toplamSureDk: toplamDk,
  birim: 'proje',
  tema: 'sevimli',
  kapak: 'kapak',
  kapakAlt: 'Çocuk, kedi, MakeCode blokları ve ekranında bir ışık yanan micro:bit olan renkli sınıf çizimi',
  etiketler: ['5. sınıf', '10–11 yaş'],
  adimEtiketleri: ADIMLAR,
  uniteler: UNITELER,
  genelSayfalar: GENEL.map((g) => g.slug),
};
ciktilar.set('ders.json', `${JSON.stringify(dersJson, null, 2)}\n`);

// Görseller: kitaptaki her görsel için küçültme/kopya/dönüşüm
async function gorselleriUret() {
  const gorselDir = path.join(HEDEF, 'gorseller');
  const yaz = (ad, veri) => {
    if (!KURU) {
      fs.mkdirSync(gorselDir, { recursive: true });
      fs.writeFileSync(path.join(gorselDir, ad), veri);
    }
  };
  let svgToplam = 0;
  for (const ham of [...gerekenGorseller].sort()) {
    if (ham.endsWith('.svg') && (fs.existsSync(path.join(EK_VARLIK, ham)))) {
      yaz(ham, fs.readFileSync(path.join(EK_VARLIK, ham)));
      continue;
    }
    const kaynakYol = path.join(VARLIKLAR, ham);
    if (!fs.existsSync(kaynakYol)) {
      uyar('gorseller', `kitapta görsel bulunamadı: ${ham}`);
      continue;
    }
    if (ham.endsWith('.svg')) {
      const metin = fs.readFileSync(kaynakYol, 'utf8');
      if (metin.includes('pxt-renderer')) {
        const k = makecodeKucult(metin);
        svgToplam += k.yeni;
        yaz(ham, k.svg);
      } else {
        svgToplam += metin.length;
        yaz(ham, metin);
      }
    } else if (RASTER[ham]) {
      const arabellek = await sharp(kaynakYol).resize({ width: RASTER[ham].genislik, withoutEnlargement: true }).webp({ quality: 88, alphaQuality: 100, effort: 5 }).toBuffer();
      yaz(RASTER[ham].ad, arabellek);
    } else uyar('gorseller', `işlenmeyen görsel türü: ${ham}`);
  }
  for (const k of KAPAKLAR) {
    const arabellek = await sharp(path.join(VARLIKLAR, k.kaynak)).extract(k.kes).resize({ width: k.genislik }).webp({ quality: k.kalite, effort: 5 }).toBuffer();
    yaz(k.ad, arabellek);
    rapor.bilgi.push(`${k.ad}: ${(arabellek.length / 1024).toFixed(0)} KB`);
  }
  rapor.bilgi.push(`SVG toplamı: ${(svgToplam / 1024).toFixed(0)} KB (${[...gerekenGorseller].filter((g) => g.endsWith('.svg')).length} dosya)`);
}

await gorselleriUret();

if (!KURU) {
  // Üretilmiş dosyaları yeniden yaz: eski proje/genel dosyaları temizlenir (yalnız betiğin yönettiği desenler)
  fs.mkdirSync(path.join(HEDEF, 'genel'), { recursive: true });
  for (const f of fs.readdirSync(HEDEF)) if (/^proje-\d+\.md$/.test(f)) fs.rmSync(path.join(HEDEF, f));
  for (const f of fs.readdirSync(path.join(HEDEF, 'genel'))) if (f.endsWith('.md')) fs.rmSync(path.join(HEDEF, 'genel', f));
  for (const [yol, icerik] of ciktilar) fs.writeFileSync(path.join(HEDEF, yol), icerik);
  fs.writeFileSync(
    path.join(HEDEF, 'OKUBENI.md'),
    `# Bu klasör betikle üretilir\n\nKaynak: micro:bit kitabı (production-1-5). Üreten: \`node scripts/microbit-donustur.mjs\`.\nKitap değişince betiği yeniden çalıştırın; bu klasördeki dosyaları elle düzenlemeyin.\n`,
  );
}

// ── Rapor ────────────────────────────────────────────────────────────────────
let kalanSayfa = 0;
for (const [yol, icerik] of ciktilar) {
  if (!yol.endsWith('.md')) continue;
  for (const m of icerik.matchAll(/[^.\n]*\bsayfa[^.\n]*/gi)) {
    kalanSayfa += 1;
    rapor.uyari.push(`${yol}: "sayfa" geçiyor → ${m[0].trim().slice(0, 110)}`);
  }
}
console.log(`Kaynak: ${KAYNAK}`);
console.log(`${projeler.length} proje, ${GENEL.length} genel sayfa, toplam ${toplamDk} dk${KURU ? ' (KURU ÇALIŞMA: dosya yazılmadı)' : ''}`);
console.log(`yazma alanı: ${projeler.reduce((t, u) => t + u.fm.yazSayisi, 0)} | uygulanan metin kuralları:`);
for (const [k, v] of kuralSayisi) console.log(`  ${String(v).padStart(3)}× ${k}`);
for (const b of rapor.bilgi) console.log(`bilgi: ${b}`);
for (const u of rapor.uyari) console.warn(`UYARI ${u}`);
console.log(`${rapor.uyari.length} uyarı (${kalanSayfa} "sayfa" geçişi).`);
