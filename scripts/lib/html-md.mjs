// Kitap sayfalarındaki (HTML sınıflı Markdown) satır içi içeriği Markdown'a çevirir.
// parse5 düğümleri üzerinde çalışır; microbit-donustur.mjs kullanır.
//
// Kalın/italik için `**`/`*` yazılır; ama CommonMark'ın "yanlarına bitişik noktalama" kuralı yüzünden
// (örn. `**“Merhaba!”**yazısı`) kapanmayacak yerlerde güvenli olması için <strong>/<em> kullanılır.

export const nitelik = (n, ad) => n.attrs?.find((a) => a.name === ad)?.value;
export const siniflar = (n) => (nitelik(n, 'class') ?? '').split(/\s+/).filter(Boolean);
export const cocuklar = (n) => n.childNodes ?? [];
export const elemanlar = (n) => cocuklar(n).filter((c) => c.tagName);

/** Düz metin (br → boşluk, boşluklar tek). */
export function duzMetin(n) {
  const topla = (d) => {
    if (d.nodeName === '#text') return d.value;
    if (d.tagName === 'br') return ' ';
    return cocuklar(d).map(topla).join('');
  };
  return topla(n).replace(/[\s ]+/g, ' ').trim();
}

const NOKTALAMA = /[\p{P}\p{S}]/u;
const BOSLUK = /\s/;

/** Markdown'da özel anlamı olan karakterleri kaçırır (kısa çizgi/sayı gibi satır başı durumları paragraf düzeyinde ele alınır). */
export function kac(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/[*_`[\]<>|~]/g, '\\$&')
    .replace(/&(?=#?\w+;)/g, '&amp;');
}

// ── Metin kuralları ──────────────────────────────────────────────────────────
// Basılı kitaba özgü ifadeler ("sonraki sayfa", sayfa numaraları, "P24'te") sitede anlamsız; burada yeniden yazılır.
// `⟦etiket|adres⟧` biçimi bağlantı üretir (kaçışlardan sonra Markdown bağlantısına çevrilir).
export const METIN_KURALLARI = [
  // kitaptaki sayfa gönderimleri
  [/Bir sonraki sayfada A tuşuyla/g, '⟦1. projede|proje:1⟧ A tuşuyla'],
  [/önceki sayfadaki denemede/g, '⟦önceki projedeki|proje:7⟧ denemede'],
  [/Sonraki sayfanın kodunu/g, 'Sonraki kısmın kodunu'],
  [/[Ss]onraki sayfada/g, (m) => `${m[0][0]}onraki kısımda`],
  [/sonraki sayfadadır/g, 'sonraki kısımdadır'],
  [/Önceki sayfadaki/g, 'Önceki kısımdaki'],
  [/6\. sayfadaki kart görselleri/g, '⟦Kartı tanı|genel:karti-tani⟧ sayfasındaki kart görselleri'],
  [/43\. sayfadaki güvenlik ve devre kurma kurallarını aç\./g, '⟦devre kurma kuralları|genel:devre-kurma-kurallari⟧ sayfasındaki güvenlik kurallarını aç.'],
  [/son sözlüğe bak/g, '⟦sözlüğe|genel:sozluk⟧ bak'],
  // 06a: "P24'te", "(P25)", "P41–45'te" proje göndermeleri (P0/P1/P2 pin adlarına dokunulmaz)
  [/\bP(\d{2})–(\d{2})'te\b/g, (m) => `⟦${m[1]}|proje:${Number(m[1])}⟧–⟦${m[2]}|proje:${Number(m[2])}⟧. projelerde`],
  [/\bP(\d{2})'(te|de)\b/g, (m) => `⟦${Number(m[1])}. projede|proje:${Number(m[1])}⟧`],
  [/\(P(\d{2})\)/g, (m) => `(⟦${Number(m[1])}. proje|proje:${Number(m[1])}⟧)`],
  // üretim/durum notları (kitabın kendi derleme betiği de bunları öğrenci sayfalarından atar)
  [/\s*Fiziksel ve sınıf provası tamamlanana kadar bu çalışma baskı taslağıdır\./g, ''],
  [/\s*Gerçek set ve sınıf provası henüz tamamlanmamıştır\./g, ''],
  [/;\s*gerçek sınıf süresini pilotta kaydet/g, ''],
];

const PROJE_ANDI = /(\d{1,2})\. (proje\p{L}*)/gu;

/** Kural uygulanmış metni, kaçışlı Markdown parçalarına ve bağlantı belirteçlerine böler. */
function parcalaMetin(ham, baglam) {
  let s = ham.replace(/[\s ]+/g, ' ');
  for (const [re, yerine] of METIN_KURALLARI) {
    s = s.replace(re, (...a) => {
      baglam.kuralSayisi.set(String(re), (baglam.kuralSayisi.get(String(re)) ?? 0) + 1);
      return typeof yerine === 'function' ? yerine(a) : yerine;
    });
  }
  // "31. projenin" → bağlantı (aralık/listede ve kendi numarasında bağlama)
  s = s.replace(PROJE_ANDI, (eslesme, no, sozcuk, konum, tum) => {
    const n = Number(no);
    const once = tum.slice(0, konum);
    if (n < 1 || n > 45 || n === baglam.proje) return eslesme;
    if (/\d\s*[–,-]\s*$/.test(once) || /\d\s+ve\s+$/.test(once) || /[–-]$/.test(once)) return eslesme;
    if (/⟦[^⟧]*$/.test(once)) return eslesme; // başka bir bağlantının içinde
    return `⟦${eslesme}|proje:${n}⟧`;
  });
  const parcalar = [];
  let son = 0;
  for (const m of s.matchAll(/⟦([^|⟧]*)\|([^⟧]*)⟧/g)) {
    if (m.index > son) parcalar.push(kac(s.slice(son, m.index)).replace(/\\_/g, '\\_'));
    parcalar.push(`[${kac(m[1])}](${m[2]})`);
    son = m.index + m[0].length;
  }
  if (son < s.length) parcalar.push(kac(s.slice(son)));
  return parcalar;
}

// ── Satır içi ağaç ───────────────────────────────────────────────────────────
/** @returns {Array<string | {k: 'b'|'i', parts: any[]}>} */
function agac(nodes, baglam) {
  const parcalar = [];
  for (const n of nodes) {
    if (n.nodeName === '#text') parcalar.push(...parcalaMetin(n.value, baglam));
    else if (n.nodeName === '#comment') continue;
    else {
      const t = n.tagName;
      if (t === 'b' || t === 'strong') parcalar.push({ k: 'b', parts: agac(cocuklar(n), baglam) });
      else if (t === 'i' || t === 'em') {
        const alt = agac(cocuklar(n), baglam);
        if (alt.length) parcalar.push({ k: 'i', parts: alt });
      } else if (t === 'a') {
        const href = nitelik(n, 'href');
        const etiket = render(agac(cocuklar(n), baglam)).trim();
        parcalar.push(href ? `[${etiket}](${href.replace(/\)/g, '%29')})` : etiket);
      } else if (t === 'br') parcalar.push('\n');
      else parcalar.push(...agac(cocuklar(n), baglam)); // span, small …
    }
  }
  return parcalar;
}

const duz = (p) => (typeof p === 'string' ? p : p.parts.map(duz).join(''));

/** Parça dizisini Markdown'a çevirir; komşu karakterlere bakıp güvenli vurgu biçimini seçer. */
function render(parcalar, onceki = '', sonraki = '') {
  let cikti = '';
  parcalar.forEach((p, i) => {
    if (typeof p === 'string') {
      cikti += p;
      return;
    }
    const ic = render(p.parts);
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(ic);
    if (!m[2]) {
      cikti += ic;
      return;
    }
    const oncekiMetin = cikti || onceki;
    const sonrakiMetin = parcalar.slice(i + 1).map(duz).join('') || sonraki;
    const prev = oncekiMetin.slice(-1);
    const next = sonrakiMetin.slice(0, 1);
    const ilk = m[2][0];
    const son = m[2].slice(-1);
    const solSerbest = !m[1] ? !prev || BOSLUK.test(prev) || NOKTALAMA.test(prev) || !NOKTALAMA.test(ilk) : true;
    const sagSerbest = !m[3] ? !next || BOSLUK.test(next) || NOKTALAMA.test(next) || !NOKTALAMA.test(son) : true;
    const isaret = p.k === 'b' ? '**' : '*';
    const guvenli = solSerbest && sagSerbest && !m[2].includes(isaret);
    if (guvenli) cikti += `${m[1]}${isaret}${m[2]}${isaret}${m[3]}`;
    else {
      const etiket = p.k === 'b' ? 'strong' : 'em';
      cikti += `${m[1]}<${etiket}>${m[2]}</${etiket}>${m[3]}`;
    }
  });
  return cikti;
}

/**
 * Düğümlerin satır içi içeriğini Markdown yapar.
 * @param {object} baglam { proje?: number, kuralSayisi: Map }  — proje: kendi numarasına bağlantı verilmez
 * @param {{tekSatir?: boolean}} secenek  tekSatir: <br> boşluğa çevrilir (direktif etiketi, tablo hücresi)
 */
export function satirIci(nodes, baglam, { tekSatir = false } = {}) {
  let s = render(agac(nodes, baglam));
  s = tekSatir ? s.replace(/\s*\n\s*/g, ' ') : s.replace(/ *\n */g, '\\\n');
  s = s.replace(/[ \t]+/g, ' ').trim();
  // Satır başında blok işareti gibi okunacak karakterler
  s = s.replace(/^([-+*>#]|\d+[.)])(\s)/, '\\$1$2');
  return s;
}

/** Bağlantı belirteçleri çıkarılmış düz metin (frontmatter için). */
export function duzOzet(n, baglam) {
  let s = duzMetin(n);
  for (const [re, yerine] of METIN_KURALLARI) s = s.replace(re, (...a) => (typeof yerine === 'function' ? yerine(a) : yerine));
  return s.replace(/⟦([^|⟧]*)\|[^⟧]*⟧/g, '$1');
}
