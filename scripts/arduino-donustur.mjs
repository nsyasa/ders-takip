// Arduino kitabını (arduino-24-proje-v2) siteye dönüştürür.
//
//   node scripts/arduino-donustur.mjs [kitap-klasoru] [--kuru] [--okuma-yok]
//   (kaynak: argüman, ARDUINO_KAYNAK ortam değişkeni ya da aşağıdaki varsayılan)
//
// 1) scripts/arduino/pdf-oku.py kitabın ekran PDF'lerini okur (.arduino-ara/kitap.json + çizimler + resimler).
//    Neden PDF? Kitabın proje JSON'ları basılı metnin bir kısmını tutmuyor; basılı PDF tek doğru kaynaktır.
// 2) Bu betik ara katmanı CONTENT-SPEC biçimine çevirir: icerik/arduino/ (ders.json, proje-NN.md, kodlar/, gorseller/).
//
// icerik/arduino/ BU BETİKLE ÜRETİLİR: kitap değişince yeniden çalıştırın; elle düzenlemeyin. Kitap klasörüne dokunulmaz.
// --kuru: dosya yazmaz, yalnız raporu basar. --okuma-yok: PDF'i yeniden okumaz (.arduino-ara/ hazırsa hızlı deneme).
// Gerekenler: Python + PyMuPDF (ARDUINO_PYTHON ortam değişkeni ya da PATH'teki python), sharp.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const BU = path.dirname(fileURLToPath(import.meta.url));
const DEPO = path.resolve(BU, '..');
const HEDEF = path.join(DEPO, 'icerik', 'arduino');
const ARA = path.join(DEPO, '.arduino-ara');
const argumanlar = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const KURU = process.argv.includes('--kuru');
const OKUMA_YOK = process.argv.includes('--okuma-yok');
const KAYNAK = path.resolve(argumanlar[0] ?? process.env.ARDUINO_KAYNAK ?? 'C:/Users/Enes/Documents/vibe coding/kitaplar/outputs/arduino-24-proje-v2');
const PYTHON = process.env.ARDUINO_PYTHON ?? 'python';

// ── Kitap bilgileri ──────────────────────────────────────────────────────────
const UNITE_RENKLERI = ['#C2410C', '#B45309', '#0F766E', '#1D4ED8', '#7C3AED', '#15803D', '#BE123C', '#475569'];
const SEVIYE = { Kolay: 'Başlangıç', Orta: 'Orta', İleri: 'İleri', 'Çok ileri': 'Çok ileri' };
// Kutu rengi → site kutusu. Kitapta kırmızı = güvenlik; diğer renkler bilgi kutusudur (renk özniteliği korunur).
const KUTU = {
  '#fde8e8': ['dikkat', 'kirmizi'],
  '#e8f3fa': ['bilgi', 'mavi'],
  '#f4f7fa': ['bilgi', 'gri'],
  '#fff3dc': ['bilgi', 'sari'],
  '#e6f5ec': ['bilgi', 'yesil'],
};

// Giriş resimlerinin alt metinleri (resimlere bakılarak yazıldı; anahtar: kitaptaki dosya adı). Ek Kitap P09/P22'ninkileri kullanır.
const GIRIS_ALT = {
  p01_hero: 'Rafta üç küçük yeşil durum ışığı yanan beyaz bir modem; duvar prizinde ışığı yanan bir şarj aleti.',
  p02_hero: 'Ahşap masada iki siyah yuvarlak buzzer; yanlarında sarı ve mavi yapışkan etiketler.',
  p03_hero: 'Mutfak tezgâhında bir mini fırın ve yanında bir masa saati.',
  p04_hero: 'Duvarda beyaz yuvarlak bir kapı zili düğmesi ve metal bir kapı düğmesi.',
  p05_hero: 'Yuvarlak ayar düğmeli bir masa lambası ve bir araba kapısındaki döner düğme.',
  p06_hero: 'Akşam ışığında bir yatak odası; komodinde turkuaz yanan küçük bir gece lambası, rafta turuncu şerit ışık.',
  p07_hero: 'Hava karardıktan sonra yanan bir sokak lambası; arkada mahalle ve deniz.',
  p08_hero: 'Mutfak tezgâhında dijital bir yemek termometresi ve fırının ayar düğmesi.',
  p09_hero: 'Arka tamponunda park sensörleri olan gri bir otomobil, bir duvara yaklaşmış.',
  p10_hero: 'Masada küçük bir robot kol; arkada bir site girişinde kırmızı-beyaz bariyer kolu.',
  p11_hero: 'Masada döner ses düğmeli ahşap bir radyo ve oyuncak bir uçak.',
  p12_hero: 'Bir oyun makinesinde büyük kırmızı bir basma düğmesi ve ekran.',
  p13_hero: 'Fabrikada konveyör bandında ilerleyen karton kutular ve bandın yanındaki sensörler.',
  p14_hero: 'Boş bir odada ahşap zeminde duran dik bir elektrikli ısıtıcı.',
  p15_hero: 'Tavanında lamba ve küçük bir hareket sensörü olan aydınlık bir koridor.',
  p16_hero: 'Pencere önünde saksıda bir bitki; toprağına bir nem ölçer takılmış.',
  p17_hero: 'Masanın başında alkışlayan iki el; yanında turuncu bir masa lambası yanıyor.',
  p18_hero: 'Masada su dolu bir cam bardak ve kırmızı, sarı, yeşil ışıklı küçük bir gösterge.',
  p19_hero: 'Masada saksı bitkisinin yanında ekranlı bir sıcaklık ve nem göstergesi.',
  p20_hero: 'Masada iki dijital termometre ve sıcak içecek dolu bir kupa.',
  p21_hero: 'Deniz kıyısında bir yaya geçidi; direkte kırmızı yanan bir trafik ışığı.',
  p22_hero: 'Oda köşesinde kapağı açık beyaz bir çöp kutusu.',
  p23_hero: 'Mutfak tezgâhında dijital bir mutfak tartısı ve yuvarlak ekranlı küçük bir saat.',
  p24_hero: 'Masada ucunda iki gözlü mesafe sensörü olan ahşap bir çubuk; yanında kâğıt ve kalem.',
};
// Breadboard dışındaki çizimlerin alt metinleri (anahtar: site dosya adı)
const CIZIM_ALT = {
  'proje-06-cizim-1': 'Uç denemesi çizimi: aday ortak uç A GND’ye bağlı; B ucu 220 Ω direnç üzerinden 3,3 V’a bağlı; C ve D boşta.',
  'proje-06-cizim-2': 'Uç denemesi çizimi: aday ortak uç A 3,3 V’a bağlı; B ucu 220 Ω direnç üzerinden GND’ye bağlı; C ve D boşta.',
  'proje-10-cizim-1': 'Servo bağlantı şeması: UNO 5V → SG90 VCC (besleme), D9 → SIG (konum sinyali), GND → GND (ortak referans).',
  'genel-setini-tani-cizim-1':
    'UNO R3 uyumlu kartın pin rehberi: üst kenarda AREF, GND ve 13’ten 0’a dijital pinler (~ işaretliler PWM); solda USB girişi, ON ve L göstergeleri; alt kenarda IOREF, RESET, 3V3, 5 V, iki GND, VIN ve A0–A5 analog girişleri.',
  'genel-setini-tani-cizim-2':
    'Breadboard’un 8 satırlık ayrıntısı: D8 jumper’ı 2. satıra, 220 Ω direnç c2–c6 arasına, LED anotla e6’ya, katotla e7’ye takılı; 7. satırdan GND rayına jumper; solda 5 V ve GND rayları, ortada a–e ile f–j gruplarını ayıran kanal.',
};

const rapor = { uyari: [], bilgi: [] };
const uyar = (yer, ileti) => rapor.uyari.push(`${yer}: ${ileti}`);
const kuralSayisi = new Map();
const say = (ad, n = 1) => kuralSayisi.set(ad, (kuralSayisi.get(ad) ?? 0) + n);

// ── 1) PDF'i oku ─────────────────────────────────────────────────────────────
if (!OKUMA_YOK || !fs.existsSync(path.join(ARA, 'kitap.json'))) {
  const r = spawnSync(PYTHON, [path.join(BU, 'arduino', 'pdf-oku.py'), KAYNAK, ARA], { stdio: 'inherit', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
  if (r.status !== 0) {
    console.error(`PDF okunamadı (${PYTHON}). PyMuPDF kurulu mu? ARDUINO_PYTHON ile Python yolunu verebilirsiniz.`);
    process.exit(1);
  }
}
const kitap = JSON.parse(fs.readFileSync(path.join(ARA, 'kitap.json'), 'utf8'));
const onArka = JSON.parse(fs.readFileSync(path.join(KAYNAK, 'kitap', 'on_arka_sayfalar', 'icerik.json'), 'utf8'));
const projeJson = new Map();
for (const klasor of ['kitap/projeler', 'kitap/ek_kitap']) {
  for (const f of fs.readdirSync(path.join(KAYNAK, klasor))) {
    if (!/\.(ya?ml|json)$/.test(f)) continue;
    const j = JSON.parse(fs.readFileSync(path.join(KAYNAK, klasor, f), 'utf8'));
    projeJson.set(j.id, j);
  }
}
const git = (...a) => spawnSync('git', ['-C', KAYNAK, ...a], { encoding: 'utf8' }).stdout?.trim() ?? '';
const surum = { etiket: git('describe', '--tags', '--always', '--dirty'), sha: git('rev-parse', 'HEAD') };

// ── Yardımcılar ──────────────────────────────────────────────────────────────
const kalinsiz = (md) => md.replace(/\*\*/g, '').trim();
const satirBirlestir = (t) => t.replace(/([A-Za-zÇĞİÖŞÜçğıöşü])-\n/g, '$1-').replace(/\s*\n\s*/g, ' ');
const tamKalin = (md) => /^\*\*[^*]+\*\*:?$/.test(md.trim());
const bosluklar = (t) => t.replace(/_{3,}/g, '…').replace(/\\_/g, '_');
const tirnak = (t) => t.replace(/"/g, '”');
// Yazma alanı etiketi: köşeli parantez ve Markdown işaretleri olmadan
const yazEtiketi = (t) => kalinsiz(bosluklar(t)).replace(/\\([\\*_`[\]<>])/g, '$1').replace(/[[\]]/g, '').replace(/\s+/g, ' ').trim();

/** Basılı kitaba özgü ifadeleri siteye uyarlar ve proje göndermelerini bağlantı yapar. */
function metin(md, ctx) {
  // Kitaptaki yazma boşlukları (______) okuyucuda kaçışlanır; burada düz alt çizgiye döner
  let t = md.replace(/(?:\\_){3,}/g, (m) => '_'.repeat(m.length / 2));
  const kural = (ad, re, yerine) => {
    const once = t;
    t = t.replace(re, yerine);
    if (t !== once) say(ad, (once.match(re) ?? []).length || 1);
  };
  kural('"ön sayfalardaki" → (site sayfası)', /ön sayfalardaki /g, '');
  kural('"sonraki sayfada" → "aşağıda"', /sonraki sayfada/g, 'aşağıda');
  kural('"Proje N–M" → iki bağlantı', /(?<![[\w])Proje (\d{1,2})–(\d{1,2})(?![\d\]])/g, (m, a, b) =>
    [a, b].some((n) => Number(n) === ctx.no || Number(n) > 24) ? m : `Proje [${a}](proje:${Number(a)})–[${b}](proje:${Number(b)})`);
  kural('"Proje N" → bağlantı', /(?<![[\w])Proje (\d{1,2})(?![\d\]])/g, (m, n) => (Number(n) === ctx.no || Number(n) > 24 ? m : `[Proje ${n}](proje:${Number(n)})`));
  // Kitabın ön sayfalarına atıflar → genel sayfa bağlantısı
  kural('"*Parçanı doğrula* sayfası" → bağlantı', /\*Parçanı doğrula\* sayfası/g, '[Parçanı doğrula](genel:parcani-dogrula) sayfası');
  if (ctx.slug !== 'genel-setini-tani') {
    kural('"Set rehberindeki renk bandı tablosu" → bağlantı', /Set rehberindeki renk bandı tablosunu/g, '[Setini tanı](genel:setini-tani) sayfasındaki renk bandı tablosunu');
    kural('"renk bandı tablosuyla" → bağlantı', /(?<!\[)renk bandı tablosuyla/g, '[renk bandı tablosuyla](genel:setini-tani)');
  }
  return t;
}

/** Paragraf: satır başı Markdown sözdizimi sanılmasın (ör. "4. basıştan sonra" listeye dönmesin). */
function paragraf(md) {
  return md.replace(/^(\d+)\. /, '$1\\. ').replace(/^([-+>#]) /, '\\$1 ');
}

function tabloMd(satirlar, ctx) {
  const [bas, ...govde] = satirlar;
  // Genel sayfalarda "Projeler" sütunundaki numara listeleri ("4, 12, 21") proje bağlantısı olur
  const projeSutunu = bas.map((h) => Boolean(ctx.genel) && /projeler/i.test(h));
  const hucre = (c, j) => {
    let t = metin(satirBirlestir(c), ctx).replace(/\|/g, '\\|').trim();
    if (projeSutunu[j] && /^\d{1,2}(, \d{1,2})*$/.test(t)) {
      t = t.split(', ').map((n) => `[${n}](proje:${Number(n)})`).join(', ');
      say('genel: "Projeler" sütunu → proje bağlantıları');
    }
    return t || ' ';
  };
  return [`| ${bas.map(hucre).join(' | ')} |`, `|${bas.map(() => '---').join('|')}|`, ...govde.map((r) => `| ${r.map(hucre).join(' | ')} |`)].join('\n');
}

// ── Kod ve görsel kayıtları ──────────────────────────────────────────────────
const kodKlasorleri = new Map(); // site klasör adı → kitaptaki .ino yolu
const sekilDosyalari = new Map(); // site adı → ara katmandaki svg
const resimDosyalari = new Map(); // site adı → { kaynak, genislik }

function kodBlogu(b, ctx) {
  if (!b.dosya) {
    uyar(ctx.dosya, `eşleşmeyen kod kutusu (${kalinsiz(b.etiket)})`);
    return '';
  }
  const ad = path.posix.basename(b.dosya);
  const ino = path.join(KAYNAK, 'kod', b.dosya, `${ad}.ino`);
  const satirlar = fs.readFileSync(ino, 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n');
  const ilk = b.ilk ?? 1;
  const son = b.son ?? satirlar.length;
  kodKlasorleri.set(ad, ino);
  ctx.kodlar.add(ad);
  const baslik = tirnak(kalinsiz(b.etiket).replace(/\\([\\*_`[\]<>])/g, '$1') || `${ad}.ino`);
  return ['```cpp title="' + baslik + `" start=${ilk} dosya=${ad}`, ...satirlar.slice(ilk - 1, son), '```'].join('\n');
}

function sekilBlogu(b, ctx) {
  // Breadboard: UNO etiketi + sütun harfleri (grup etiketi "a–e" ya da tek tek a … j)
  const breadboard = b.metinler.includes('UNO') && (b.metinler.some((m) => /^a[–-]e$/.test(m)) || (b.metinler.includes('a') && b.metinler.includes('j')));
  ctx.sekilSayisi += 1;
  const ad = `${ctx.slug}-${breadboard ? 'breadboard' : 'cizim'}-${ctx.sekilSayisi}`;
  sekilDosyalari.set(`${ad}.svg`, path.join(ARA, 'sekiller', b.dosya));
  ctx.gorseller.push(ad);
  const alt = breadboard ? `Breadboard yerleşim çizimi: ${ctx.bolum}` : CIZIM_ALT[ad] ?? `Çizim: ${ctx.bolum}`;
  if (!breadboard && !CIZIM_ALT[ad]) uyar(ctx.dosya, `${ad}.svg için alt metin yazılmadı (CIZIM_ALT)`);
  const yazi = b.yazi ? ` "${tirnak(b.yazi)}"` : '';
  // Genel sayfa icerik/<ders>/genel/ altındadır; görseller bir üst klasörde
  return `![${alt.replace(/[[\]]/g, '')}](${ctx.genel ? '..' : '.'}/gorseller/${ad}.svg${yazi})`;
}

// ── Sayfa blokları → Markdown ────────────────────────────────────────────────
function kutuMd(b, ctx, cikti) {
  const [tur, renk] = KUTU[b.renk] ?? ['bilgi', 'gri'];
  let baslik = b.baslik ? kalinsiz(b.baslik) : '';
  const bloklar = [...b.bloklar];
  // Başlık satır içinde olabilir: "**Dikkat** 5 V ve …"
  if (!baslik && bloklar[0]?.t === 'p') {
    const m = bloklar[0].md.match(/^\*\*([^*]{1,40})\*\*\s+(.+)$/);
    if (m) {
      baslik = m[1].replace(/:$/, '');
      bloklar[0] = { ...bloklar[0], md: m[2] };
    }
  }
  // "Kendini kontrol et": her soru ayrı yazma alanı
  if (/^Kendini kontrol et/i.test(baslik)) {
    cikti.push(`### ${baslik}`);
    for (const k of bloklar) {
      const sorular = k.t === 'liste' ? k.ogeler : [k.md];
      sorular.forEach((s, i) => {
        cikti.push(paragraf(`**${(k.ilk ?? 1) + i}.** ${metin(s, ctx)}`));
        cikti.push('::yaz[Cevabım]{satir=2}');
        ctx.yaz += 1;
      });
    }
    return;
  }
  const ic = [];
  for (const k of bloklar) blokMd(k, ctx, ic, true);
  const etiket = baslik && baslik.toLocaleLowerCase('tr') !== tur ? `[${baslik.replace(/[[\]]/g, '')}]` : '';
  cikti.push(`:::${tur}${etiket}{renk=${renk}}\n${ic.join('\n\n')}\n:::`);
  if (/^Önce düşün/i.test(baslik)) {
    cikti.push('::yaz[Tahminim]{satir=2}');
    ctx.yaz += 1;
  } else if (/^Bir değişiklik yap/i.test(baslik)) {
    cikti.push('::yaz[Tahminim ve gözlemim]{satir=3}');
    ctx.yaz += 1;
    deneyKodlari(ctx, cikti);
  }
}

/** Projenin "Bir değişiklik yap" sürümleri (kitapta kod/deneyler/<proje>_*): ana programla yan yana açıp farkı bulmak için. */
function deneyKodlari(ctx, cikti) {
  if (ctx.deneyEklendi) return;
  ctx.deneyEklendi = true;
  const klasorler = [path.join('deneyler'), path.join('ek_kitap', 'deneyler')]
    .flatMap((k) => (fs.existsSync(path.join(KAYNAK, 'kod', k)) ? fs.readdirSync(path.join(KAYNAK, 'kod', k)).map((d) => path.join(k, d)) : []))
    .filter((k) => path.basename(k).startsWith(`${ctx.id}_`))
    .sort();
  if (!klasorler.length) return;
  const aciklama = onArka.kod_arsivi.find(([ad]) => ad.startsWith('kod/deneyler'))?.[1] ?? '';
  cikti.push(`### Değişiklik sürümleri`, aciklama);
  for (const k of klasorler) {
    const ad = path.basename(k);
    const ino = path.join(KAYNAK, 'kod', k, `${ad}.ino`);
    const satirlar = fs.readFileSync(ino, 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n');
    kodKlasorleri.set(ad, ino);
    ctx.kodlar.add(ad);
    say('deney kodu eklendi (kod/deneyler)');
    cikti.push(['```cpp title="Değişiklik sürümü · ' + ad + `" start=1 dosya=${ad}`, ...satirlar, '```'].join('\n'));
  }
}

function blokMd(b, ctx, cikti, kutuIcinde = false) {
  switch (b.t) {
    case 'p': {
      const md = metin(b.md, ctx);
      // Form satırı: "Yaz: bantlar ____ · anot ____" ya da "Ortak türüm: ____ Test gözlemim: ____"
      if (/_{3,}/.test(md) && (md.startsWith('Yaz:') || md.length <= 140)) {
        cikti.push(`::yaz[${yazEtiketi(md.replace(/^Yaz:\s*/, ''))}]{satir=1}`);
        ctx.yaz += 1;
        say('boşluklu form satırı → yazma alanı');
        return;
      }
      if (/_{3,}/.test(md)) {
        cikti.push(paragraf(bosluklar(md)));
        cikti.push('::yaz[Cevaplarım]{satir=2}');
        ctx.yaz += 1;
        return;
      }
      cikti.push(b.stil === 'not' ? paragraf(`_${md}_`) : paragraf(md));
      if (/^\*\*Şimdi sıra sende:\*\*/.test(md)) {
        cikti.push('::yaz[Fikrim]{satir=3}');
        ctx.yaz += 1;
      }
      return;
    }
    case 'liste': {
      const ogeler = b.ogeler.map((o, i) => (b.sirali ? `${b.ilk + i}. ` : '- ') + metin(o, ctx));
      cikti.push(ogeler.join('\n'));
      return;
    }
    case 'baslik':
      cikti.push(`### ${kalinsiz(b.md)}`);
      return;
    case 'kutu':
      kutuMd(b, ctx, cikti);
      return;
    case 'tablo': {
      const s = b.satirlar;
      const duz = s.flat().map((c) => c.trim());
      if (s[0][0] === 'Öğreneceğin') return; // ilk sayfanın künye tablosu frontmatter'a gider
      if (s.length === 1 && duz.includes('→')) {
        // Sistemin yolu: Girdi → İşlem → Çıktı
        const adimlar = s[0].filter((c) => c !== '→').map((c) => {
          const [ad, ...geri] = c.split('\n');
          return geri.length ? `**${ad}:** ${satirBirlestir(geri.join('\n'))}` : satirBirlestir(c);
        });
        cikti.push(paragraf(adimlar.join(' → ')));
        return;
      }
      if (duz.every((c) => !c || c.startsWith('□'))) {
        const maddeler = duz.filter(Boolean).map((c) => satirBirlestir(c.replace(/^□\s*/, '')));
        if (maddeler.includes('Yardımla yaptım')) {
          cikti.push(`**Kendimi değerlendiriyorum:** ${maddeler.join(' · ')}`);
          cikti.push('::yaz[Bu projeyi nasıl yaptım? Neden?]{satir=1}');
          ctx.yaz += 1;
        } else {
          cikti.push(`**Kontrol listesi**\n\n${maddeler.map((m) => `- ${metin(m, ctx)}`).join('\n')}`);
        }
        return;
      }
      cikti.push(tabloMd(s, ctx));
      return;
    }
    case 'kod':
      cikti.push(kodBlogu(b, ctx));
      return;
    case 'sekil':
      cikti.push(sekilBlogu(b, ctx));
      return;
    case 'pin':
      cikti.push(['| UNO pini | Bağlantı yolu |', '|---|---|', ...b.satirlar.map(([p, y]) => `| **${p}** | ${metin(y, ctx).replace(/\|/g, '\\|')} |`)].join('\n'));
      return;
    case 'senciz': {
      const md = metin(b.md, ctx).replace(/^Sen çiz:\s*/, '');
      cikti.push(paragraf(`**Sen çiz (defterine):** ${md}`));
      return;
    }
    case 'resim':
      if (ctx.ilkSayfa && b.piksel[0] >= 1000 && b.bbox[2] - b.bbox[0] > 150) {
        const j = projeJson.get(ctx.id);
        const ad = `${ctx.slug}-giris.webp`;
        resimDosyalari.set(ad, { kaynak: path.join(KAYNAK, j.hero), genislik: 960, kalite: 72 });
        const alt = GIRIS_ALT[path.basename(j.hero).replace(/\.\w+$/, '')];
        if (!alt) uyar(ctx.dosya, `giriş resmi için alt metin yok (GIRIS_ALT: ${path.basename(j.hero)})`);
        // İki sütunlu sayfada resmin gri alt yazısı resimden önce okunmuş olabilir
        const onceki = cikti.at(-1) ?? '';
        if (/^_.*_$/s.test(onceki) && /kanıt|Günlük hayat|Fotoğraf/.test(onceki)) {
          cikti.pop();
          cikti.push(`![${alt ?? ''}](./gorseller/${ad} "${tirnak(onceki.slice(1, -1).replace(/\*\*/g, '').replace(/\\([\\*_`[\]<>])/g, '$1'))}")`);
          return;
        }
        ctx.resimYeri = cikti.length;
        cikti.push(`![${alt ?? ''}](./gorseller/${ad})`);
      } else {
        // "Biliyor muydun?" yanındaki proje simgesi: dosyası üretilir, yerleşimi site şablonundadır (simge.webp)
        const j = projeJson.get(ctx.id);
        resimDosyalari.set(`${ctx.slug}-simge.webp`, { kaynak: path.join(KAYNAK, j.spot), genislik: 192, kalite: 82 });
        say('proje simgesi (spot) → proje-NN-simge.webp');
      }
      return;
    case 'kod-etiket':
      cikti.push(paragraf(metin(b.md, ctx)));
      return;
    case 'ham': // genel sayfa üreticisinin hazırladığı Markdown (yazma alanı, onay kutusu …)
      cikti.push(b.md);
      return;
    default:
      uyar(ctx.dosya, `tanınmayan blok: ${b.t}`);
  }
}

/** Bir sayfanın bloklarını işler; kalın kısa etiket + açıklama çiftlerini listeye, etiket + içerik çiftlerini alt başlığa çevirir. */
function sayfaMd(bloklar, ctx, cikti) {
  for (let i = 0; i < bloklar.length; i++) {
    const b = bloklar[i];
    if (b.t === 'p' && tamKalin(b.md) && kalinsiz(b.md).length <= 40) {
      const sonraki = bloklar[i + 1];
      const sonrakiEtiket = (x) => x?.t === 'p' && tamKalin(x.md);
      if (sonraki?.t === 'p' && !sonrakiEtiket(sonraki) && !(bloklar[i + 2]?.t === 'p' && !sonrakiEtiket(bloklar[i + 2]))) {
        // Etiket–açıklama çiftleri (breadboard notları gibi) tek listede toplanır
        const maddeler = [];
        let j = i;
        while (bloklar[j]?.t === 'p' && tamKalin(bloklar[j].md) && bloklar[j + 1]?.t === 'p' && !sonrakiEtiket(bloklar[j + 1])) {
          const ad = kalinsiz(bloklar[j].md).replace(/:$/, '');
          maddeler.push(`- **${ad}:** ${metin(bloklar[j + 1].md, ctx)}`);
          j += 2;
        }
        cikti.push(maddeler.join('\n'));
        i = j - 1;
        continue;
      }
      cikti.push(`### ${kalinsiz(b.md).replace(/:$/, '')}`);
      continue;
    }
    // Resmin hemen ardındaki gri not resmin alt yazısıdır
    if (b.t === 'p' && b.stil === 'not' && ctx.resimYeri === cikti.length - 1) {
      cikti[ctx.resimYeri] = cikti[ctx.resimYeri].replace(/\)$/, ` "${tirnak(kalinsiz(b.md).replace(/\\([\\*_`[\]<>])/g, '$1'))}")`);
      ctx.resimYeri = -1;
      continue;
    }
    blokMd(b, ctx, cikti);
  }
}

// ── Proje ────────────────────────────────────────────────────────────────────
const basHarf = (t) => t.toLocaleLowerCase('tr').replace(/^\p{L}/u, (c) => c.toLocaleUpperCase('tr'));
const projeler = [];

for (const p of kitap.projeler) {
  const no = p.id.startsWith('ekk') ? 24 + Number(p.id.slice(3)) : Number(p.id.slice(1));
  const slug = `proje-${String(no).padStart(2, '0')}`;
  const j = projeJson.get(p.id);
  const ctx = { id: p.id, no, slug, dosya: `${slug}.md`, kodlar: new Set(), gorseller: [], yaz: 0, sekilSayisi: 0, bolum: '', ilkSayfa: false, resimYeri: -1 };
  const fm = { ders: 'arduino', numara: no, slug, baslik: '', altbaslik: '', ozet: '', dersSaati: '', sureDk: 0, seviye: '', onkosul: [], onkosulFoyler: [], kavramlar: [], hedefler: [], malzemeler: [] };
  const govde = [];

  p.sayfalar.forEach((s, si) => {
    ctx.ilkSayfa = si === 0;
    let bloklar = [...s.bloklar];
    if (si === 0) {
      // Künye: başlık, alt başlık, öğreneceğin/süre/zorluk, önce, malzemeler, sınıf aracı
      const al = (t) => {
        const i = bloklar.findIndex(t);
        return i < 0 ? null : bloklar.splice(i, 1)[0];
      };
      fm.baslik = kalinsiz(al((b) => b.t === 'proje-baslik')?.md ?? p.baslik_toc);
      fm.altbaslik = al((b) => b.t === 'alt-baslik')?.md ?? '';
      fm.ozet = fm.altbaslik;
      const kunye = bloklar.find((b) => b.t === 'tablo' && b.satirlar[0][0] === 'Öğreneceğin');
      if (kunye) {
        const [ogren, sure, zorluk] = kunye.satirlar[1].map(satirBirlestir);
        fm.kavramlar = ogren.split(/,\s*/).map((k) => k.trim()).filter(Boolean);
        fm.dersSaati = sure;
        const sayilar = (sure.match(/\d+/g) ?? []).map(Number);
        fm.sureDk = sayilar.length ? Math.round(sayilar.reduce((a, b) => a + b, 0) / sayilar.length / 5) * 5 : 0;
        fm.seviye = SEVIYE[zorluk] ?? zorluk;
      } else uyar(ctx.dosya, 'künye tablosu (Öğreneceğin/Süre/Zorluk) bulunamadı');
      const once = al((b) => b.t === 'p' && /^\*\*Önce:\*\*/.test(b.md));
      if (once) {
        fm.onkosulFoyler = [...once.md.matchAll(/Proje (\d+)/g)].map((m) => Number(m[1]));
        fm.onkosul = fm.onkosulFoyler.map((n) => `Proje ${n}`);
      }
      // Ana kitapta "Malzemeler:", Ek Kitap'ta "Setten:" (+ "Ek malzeme" kutusu)
      const malz = al((b) => b.t === 'p' && /^\*\*(Malzemeler|Setten):\*\*/.test(b.md));
      if (malz) {
        const pdfMetni = kalinsiz(malz.md).replace(/^(Malzemeler|Setten):\s*/, '').replace(/\.$/, '').replace(/\\(.)/g, '$1');
        const jsonListe = (j?.malzemeler ?? []).map((m) => (typeof m === 'string' ? m : m.ad));
        const ayni = jsonListe.join(', ').replace(/\s+/g, ' ') === pdfMetni.replace(/\s+/g, ' ');
        const liste = ayni ? jsonListe : pdfMetni.split(/,\s*/);
        if (!ayni) rapor.bilgi.push(`${ctx.dosya}: malzemeler basılı metinden virgülle bölündü (kitap JSON'u farklı)`);
        fm.malzemeler = liste.map((ad) => ({ ad, adet: '', not: '' }));
      } else uyar(ctx.dosya, 'malzeme satırı bulunamadı');
      const ek = bloklar.find((b) => b.t === 'kutu' && /^Ek malzeme/.test(b.baslik ?? ''));
      for (const k of ek?.bloklar ?? []) {
        const ad = kalinsiz(k.md ?? '').replace(/^Bu parça kit içinde yoktur:\s*/, '').replace(/\.$/, '').replace(/\\(.)/g, '$1');
        if (ad) fm.malzemeler.push({ ad, adet: '', not: 'set dışı' });
      }
      const arac = al((b) => b.t === 'p' && /^\*\*Sınıf aracı:\*\*/.test(b.md));
      if (arac) fm.malzemeler.push({ ad: kalinsiz(arac.md).replace(/^Sınıf aracı:\s*/, '').replace(/\.$/, '').replace(/\\(.)/g, '$1'), adet: '', not: 'sınıf aracı' });
    }
    // Sayfa başlığı = bölüm (##). İlk sayfada başlık yoksa şeritteki adımlar kullanılır.
    if (bloklar[0]?.t === 'baslik') {
      ctx.bolum = kalinsiz(bloklar.shift().md).replace(/\\(.)/g, '$1');
      govde.push(`## ${ctx.bolum}`);
    } else if (si === 0) {
      ctx.bolum = s.serit.split('/').pop().split('•').map((x) => basHarf(x.trim())).join(' • ');
      govde.push(`## ${ctx.bolum}`);
    }
    sayfaMd(bloklar, ctx, govde);
  });
  // "Bir değişiklik yap" kutusu olmayan projede deney kodları sona eklenir
  if (!ctx.deneyEklendi) {
    const once = govde.length;
    deneyKodlari(ctx, govde);
    if (govde.length > once) rapor.bilgi.push(`${ctx.dosya}: "Bir değişiklik yap" kutusu yok; deney kodları sayfa sonunda`);
  }

  fm.kodlar = [...ctx.kodlar];
  fm.gorseller = ctx.gorseller;
  if (resimDosyalari.has(`${slug}-simge.webp`)) fm.simge = `${slug}-simge`;
  fm.adimSayisi = 0; // ders.json adimEtiketleri eklenir (aşağıda)
  fm.yazSayisi = ctx.yaz;
  projeler.push({ no, slug, id: p.id, fm, govde });
}

// ── Genel sayfalar (kitabın ön ve arka sayfaları) ────────────────────────────
// İçindekiler (ders sayfası bu işi görür), bölüm ara sayfaları ve arka kapak alınmaz.
const genelSayfalar = [];

/** Ara katmandaki genel sayfanın blokları (kopya). */
function genelBloklar(kaynak, sayfa) {
  const g = kitap.genel.find((x) => x.kaynak === kaynak && x.sayfa === sayfa);
  if (!g) {
    uyar('genel', `${kaynak} s.${sayfa} ara katmanda yok`);
    return [];
  }
  return structuredClone(g.sayfalar[0].bloklar);
}
const govdeBloklari = (kaynak, sayfa) => genelBloklar(kaynak, sayfa).filter((b) => b.t !== 'proje-baslik');

/** "□ madde" paragrafları (bir paragrafta birkaç tane olabilir) madde listesi olur; kutuların içinde de. */
function kutucuklar(bloklar) {
  const sonuc = [];
  for (const b of bloklar) {
    if (b.t === 'kutu') {
      sonuc.push({ ...b, bloklar: kutucuklar(b.bloklar) });
      continue;
    }
    if (b.t === 'p' && b.md.trim().startsWith('□')) {
      const ogeler = b.md.split('□').map((x) => x.trim()).filter(Boolean);
      const onceki = sonuc.at(-1);
      if (onceki?.kutucuk) onceki.ogeler.push(...ogeler);
      else sonuc.push({ t: 'liste', sirali: false, ilk: 1, ogeler, kutucuk: true });
      continue;
    }
    sonuc.push(b);
  }
  return sonuc;
}

/** Çizimin gri açıklama satırı çizimin alt yazısı olur. */
function sekilYazisi(bloklar, desen) {
  const i = bloklar.findIndex((b) => b.t === 'p' && desen.test(b.md));
  const s = bloklar.findIndex((b) => b.t === 'sekil');
  if (i < 0 || s < 0) return uyar('genel', `çizim alt yazısı bulunamadı: ${desen}`);
  bloklar[s].yazi = kalinsiz(bloklar[i].md);
  bloklar.splice(i, 1);
}

const ham = (md) => ({ t: 'ham', md });
function yazAlani(ctx, etiket, satir) {
  ctx.yaz += 1;
  return ham(`::yaz[${etiket}]{satir=${satir}}`);
}

/**
 * Genel sayfa yazar. `bolumler`: [{ baslik?, bloklar }]. Birden çok başlıklı bölüm varsa bölüm "##",
 * kitabın ara başlıkları "###" olur; tek bölümlü sayfada ara başlıklar "##" olur (başlık sırası atlanmasın).
 */
function genelSayfa(slug, baslik, ustbilgi, ctx, bolumler) {
  const govde = [];
  const bolumlu = bolumler.filter((b) => b.baslik).length > 1;
  for (const b of bolumler) {
    if (b.baslik) govde.push(`## ${b.baslik}`);
    const parca = [];
    sayfaMd(b.bloklar, ctx, parca);
    govde.push(...(bolumlu ? parca : parca.map((x) => x.replace(/^### /, '## '))));
  }
  genelSayfalar.push({ slug, fm: { tur: 'genel', baslik, slug, sira: genelSayfalar.length + 1, ustbilgi }, govde, ctx });
}
const genelCtx = (slug) => ({ id: 'genel', no: 0, slug: `genel-${slug}`, dosya: `genel/${slug}.md`, genel: true, kodlar: new Set(), gorseller: [], yaz: 0, sekilSayisi: 0, bolum: '', ilkSayfa: false, resimYeri: -1 });

// 1) Kitabı nasıl kullanırsın? (+ bölümlerde öğreneceklerin, Ek Kitap ile çalışma)
{
  const ctx = genelCtx('kitabi-kullan');
  const b = govdeBloklari('ana', 5);
  for (const x of b) {
    if (x.t === 'p') x.md = x.md.replace('**Sen çiz:** Boş çerçeveye', '**Sen çiz:** Defterine');
    // Sitede sayfa şeridi yok; projede aynı sıra bölüm başlıklarıyla ilerler
    if (x.t === 'tablo' && x.satirlar[0][0] === 'Sayfa şeridi') {
      x.satirlar[0] = ['Proje bölümü', 'Bu bölümde ne yaparsın?'];
      for (const r of x.satirlar.slice(1)) r[0] = r[0].split('•').map((y) => basHarf(y.trim())).join(' • ');
      say('genel: sayfa şeridi tablosu → proje bölümleri');
    }
  }
  // İçindekiler sayfalarının "Bu yarıda öğreneceklerin" tabloları tek tabloda
  const ogren = [3, 4].map((s) => genelBloklar('ana', s).find((x) => x.t === 'tablo'));
  b.push({ t: 'baslik', md: '**Bölümlerde öğreneceklerin**' }, { t: 'tablo', satirlar: [ogren[0].satirlar[0], ...ogren.flatMap((t) => t.satirlar.slice(1))] });
  // Ek Kitap'ın kullanım notları (içindekiler tablosu ve "Nasıl çalışırsın?" ara başlığı alınmaz)
  const ek = genelBloklar('ek', 2);
  const ekKullanim = ek.slice(ek.findIndex((x) => x.t === 'kutu')).filter((x) => x.t !== 'tablo' && !(x.t === 'baslik' && /İçindekiler|Nasıl çalışırsın/.test(x.md)));
  b.push({ t: 'baslik', md: '**Ek Kitap ile çalışırken**' }, ...ekKullanim);
  genelSayfa('kitabi-kullan', 'Kitabı nasıl kullanırsın?', 'Başlarken', ctx, [{ bloklar: kutucuklar(b) }]);
}

// 2) Güvenlik
genelSayfa('guvenlik', 'Güvenli çalış, pin adını oku', 'Başlarken', genelCtx('guvenlik'), [{ bloklar: kutucuklar(govdeBloklari('ana', 6)) }]);

// 3) Setini tanı: malzeme eşleştirme (2 sayfa) + UNO kartı + breadboard
{
  const ctx = genelCtx('setini-tani');
  const [m1, m2] = [govdeBloklari('ana', 7), govdeBloklari('ana', 8)];
  const t1 = m1.find((x) => x.t === 'tablo');
  const t2 = m2.find((x) => x.t === 'tablo');
  t1.satirlar.push(...t2.satirlar.slice(1));
  m2.splice(m2.indexOf(t2), 1);
  const liste = m2.find((x) => x.t === 'liste');
  m2.splice(m2.indexOf(liste), 1);
  m1.splice(m1.indexOf(t1) + 1, 0, liste);
  const uno = govdeBloklari('ana', 10);
  sekilYazisi(uno, /^Vektör rehber/);
  // 6 sütunlu pin tablosu (Pin | Projeler × 3) dar ekranda 2 sütun olur; sütun sütun okunur
  const pin = uno.find((x) => x.t === 'tablo' && x.satirlar[0].length === 6);
  if (pin) {
    const satirlar = [];
    for (const k of [0, 2, 4]) for (const r of pin.satirlar.slice(1)) if (r[k]) satirlar.push([r[k], r[k + 1]]);
    pin.satirlar = [['Pin', 'Projeler'], ...satirlar];
  }
  const bb = govdeBloklari('ana', 11);
  sekilYazisi(bb, /^8 satır ayrıntısı/);
  genelSayfa('setini-tani', 'Setini tanı', 'Başlarken', ctx, [
    { baslik: 'Malzemeyi projeyle eşleştir', bloklar: [...m1, ...m2] },
    { baslik: 'UNO kartını tanı', bloklar: uno },
    { baslik: 'Breadboard gruplarını tanı', bloklar: bb },
  ]);
}

// 4) Parçanı doğrula + uç bulucu programları
{
  const ctx = genelCtx('parcani-dogrula');
  const b = govdeBloklari('ana', 9);
  const not = b.findIndex((x) => x.t === 'p' && /^Araç programları:/.test(x.md));
  if (not < 0) uyar(ctx.dosya, '"Araç programları" notu bulunamadı');
  else b.splice(not, 1);
  b.push(
    { t: 'baslik', md: '**Araç programları**' },
    { t: 'p', md: '*uc\\_bulucu\\_a* ve *uc\\_bulucu\\_b* proje programı değildir; yalnız parçayı sınar.' },
    { t: 'kod', dosya: 'parca_dogrula/uc_bulucu_a', etiket: 'Yöntem A · uc_bulucu_a' },
    { t: 'kod', dosya: 'parca_dogrula/uc_bulucu_b', etiket: 'Yöntem B · uc_bulucu_b' },
  );
  say('genel: uç bulucu programları (kod/parca_dogrula)', 2);
  genelSayfa('parcani-dogrula', 'Parçanı doğrula', 'Başlarken', ctx, [{ bloklar: b }]);
}

// 5) İlk yükleme
genelSayfa('ilk-yukleme', 'İlk programı derle ve yükle', 'Başlarken', genelCtx('ilk-yukleme'), [{ bloklar: govdeBloklari('ana', 12) }]);

// 6) Hata avcısı
{
  const ctx = genelCtx('hata-avcisi');
  const b = govdeBloklari('ana', 13);
  // IDE mesajları PDF'te harf harf aralıklı dizilir; kitabın kendi metniyle (icerik.json) eşleştirilir
  const sik = (t) => t.replace(/[\s\\]/g, '');
  for (const t of b.filter((x) => x.t === 'tablo')) {
    for (const r of t.satirlar.slice(1)) {
      if (!/^(\S ){3,}/.test(r[0])) continue;
      const es = onArka.derleme_mesajlari.find(([m]) => sik(m) === sik(r[0]));
      if (es) {
        r[0] = `\`${es[0]}\``;
        say('genel: aralıklı IDE mesajı → kitabın metni');
      } else uyar(ctx.dosya, `aralıklı IDE mesajı eşleşmedi: ${r[0].slice(0, 40)}`);
    }
  }
  // Son üç kalın satır kâğıtta yazma çizgisidir
  for (let i = 0; i < b.length; i++) {
    if (b[i].t === 'p' && /^\*\*(İlk hata mesajım|Kontrol ettiğim tek şey|Yeniden deneme gözlemim)\*\*$/.test(b[i].md)) b[i] = yazAlani(ctx, kalinsiz(b[i].md), 2);
  }
  genelSayfa('hata-avcisi', 'Mesajı oku, sonra nedeni ara', 'Başlarken', ctx, [{ bloklar: b }]);
}

// 7) Birleştirme fikirleri + kendi proje planın
{
  const ctx = genelCtx('kendi-projen');
  const plan = [];
  for (const x of kutucuklar(govdeBloklari('ana', 160))) {
    // İki sütunlu plan tablosu (çizgisiz): kalın etiket + soru satırları; sağ sütun yazma alanı
    if (x.t === 'p' && tamKalin(x.md)) plan.push({ ad: kalinsiz(x.md), soru: [] });
    else if (x.t === 'p' && plan.length && !plan.at(-1).bitti) plan.at(-1).soru.push(x.md);
    else {
      if (plan.length) plan.at(-1).bitti = true;
      plan.push(x);
    }
  }
  const planBloklari = plan.flatMap((x) =>
    x.ad ? [{ t: 'p', md: `**${x.ad}:** ${x.soru.join(' ')}` }, yazAlani(ctx, x.ad, 3)] : [x],
  );
  const kitapPlan = onArka.plan.map(([a, s]) => `${a}: ${s}`).join('|');
  const pdfPlan = plan.filter((x) => x.ad).map((x) => `${x.ad}: ${x.soru.join(' ')}`).join('|');
  if (kitapPlan !== pdfPlan) uyar(ctx.dosya, 'plan satırları kitabın icerik.json metniyle aynı değil');
  genelSayfa('kendi-projen', 'Birleştirme fikirleri', 'Geliştir', ctx, [
    { baslik: 'Sekiz fikirden birini seç', bloklar: govdeBloklari('ana', 159) },
    { baslik: 'Fikrini küçük bir deneye dönüştür', bloklar: planBloklari },
  ]);
}

// 8) Yapabildiğin işleri işaretle: gerçek onay kutuları (tarayıcıda saklanır)
{
  const ctx = genelCtx('kendini-degerlendir');
  const b = [];
  for (const x of govdeBloklari('ana', 165)) {
    if (x.t === 'tablo' && x.satirlar[0][0] === 'İşaretle') {
      b.push(ham(x.satirlar.slice(1).map(([p, y]) => `- [ ] **Proje ${Number(p.replace(/\D/g, ''))}:** ${satirBirlestir(y)}`).join('\n')));
      say('genel: yetkinlik tablosu → onay kutuları', x.satirlar.length - 1);
    } else if (x.t === 'p' && /^Yeni proje fikrim:/.test(x.md)) {
      b.push(x, yazAlani(ctx, 'Yeni proje fikrim', 3));
    } else b.push(x);
  }
  // Ek Kitap'ın "Kendini kontrol et" maddeleri (kitapta kapanış sayfasında)
  const ekKontrol = genelBloklar('ek', 15).find((x) => x.t === 'kutu' && /^Kendini kontrol et/.test(x.baslik ?? ''));
  if (ekKontrol) {
    const ogeler = kutucuklar(ekKontrol.bloklar).flatMap((x) => x.ogeler ?? []);
    const not = b.findIndex((x) => x.t === 'p' && x.stil === 'not');
    b.splice(not < 0 ? b.length : not, 0, { t: 'baslik', md: '**Ek Kitap projeleri**' }, ham(ogeler.map((o) => `- [ ] ${o}`).join('\n')));
  } else uyar('genel/kendini-degerlendir.md', 'Ek Kitap "Kendini kontrol et" kutusu bulunamadı');
  genelSayfa('kendini-degerlendir', 'Yapabildiğin işleri işaretle', 'Kapanış', ctx, [{ bloklar: b }]);
}

// 9) Sözlük (iki sayfa, iki sütunlu tablo: "Terim. Açıklama")
{
  const ctx = genelCtx('sozluk');
  const terimler = [];
  for (const s of [161, 162]) {
    for (const t of genelBloklar('ana', s).filter((x) => x.t === 'tablo')) {
      for (const c of t.satirlar.flat().map((h) => satirBirlestir(h)).filter(Boolean)) {
        const m = c.match(/^(.+?)\.\s+(.+)$/);
        if (m) terimler.push([m[1], m[2]]);
        else uyar(ctx.dosya, `sözlük hücresi ayrılamadı: ${c.slice(0, 40)}`);
      }
    }
  }
  terimler.sort((a, b) => a[0].localeCompare(b[0], 'tr'));
  const duz = (t) => t.replace(/\\(.)/g, '$1');
  const kitapTerim = new Set(onArka.sozluk.map(([t]) => t));
  const eksik = [...kitapTerim].filter((t) => !terimler.some(([x]) => duz(x) === t));
  if (eksik.length || terimler.length !== kitapTerim.size) uyar(ctx.dosya, `sözlük kitapla aynı değil (${terimler.length}/${kitapTerim.size}; eksik: ${eksik.join(', ')})`);
  const b = [ham(terimler.map(([t, a]) => `- **${t}:** ${metin(a, ctx)}`).join('\n'))];
  genelSayfa('sozluk', 'Sözlük', 'Başvuru', ctx, [{ bloklar: b }]);
}

// 10) Kitap hakkında: künye (ana kitap + Ek Kitap), kaynaklar, görseller, kod ve lisanslar
{
  const ctx = genelCtx('kitap-hakkinda');
  const kunye = (kaynak, s) => {
    const b = genelBloklar(kaynak, s);
    const ad = b.filter((x) => x.t === 'proje-baslik').map((x) => kalinsiz(x.md)).join(' ');
    const alt = [b.find((x) => x.t === 'alt-baslik')?.md, b.find((x) => x.t === 'p' && x.stil === 'not' && /^Sürüm/.test(x.md))?.md].filter(Boolean).join(' • ');
    const geri = b.filter((x) => !['proje-baslik', 'alt-baslik'].includes(x.t) && !(x.t === 'p' && x.stil === 'not' && /^Sürüm/.test(x.md)));
    return [ham(`**${ad}**`), { t: 'p', md: alt }, ...geri];
  };
  const ana = kunye('ana', 2);
  // Ek Kitap künyesinin yalnız künye kısmı; kullanım notları "Kitabı nasıl kullanırsın?" sayfasında
  const ek = kunye('ek', 2);
  const ekKunye = ek.slice(0, ek.findIndex((x) => x.t === 'kutu'));
  const kaynaklar = govdeBloklari('ana', 163);
  const lisans = govdeBloklari('ana', 164);
  // Bağlantı satırları (her biri tek bağlantı) tek listede
  const baglantiMi = (x) => x.t === 'p' && /^\[[^\]]+\]\([^)]+\)\.?$/.test(x.md.trim());
  const ilkBag = lisans.findIndex(baglantiMi);
  const baglar = lisans.filter(baglantiMi);
  lisans.splice(ilkBag, baglar.length, { t: 'liste', sirali: false, ilk: 1, ogeler: baglar.map((x) => x.md) });
  // Kod arşivi tablosu kitap paketindeki klasörleri anlatır; sitede kodlar proje sayfalarındadır
  const arsiv = lisans.find((x) => x.t === 'tablo' && x.satirlar[0][0] === 'Nerede?');
  if (arsiv) {
    arsiv.satirlar = [
      ['Nerede?', 'Ne yaparsın?'],
      ['Proje sayfası', 'Her projenin tam programı kendi sayfasındadır; kopyala ya da klasörüyle (.zip) indir.'],
      ['.ino dosyası', 'İndirdiğin klasördeki .ino dosyasını Arduino IDE ile aç. Klasör adı ile dosya adı aynı kalmalı.'],
      ['Değişiklik sürümleri', '“Bir değişiklik yap” sürümleri projenin “Değişiklik sürümleri” kısmındadır; ana programla yan yana açıp farkı bul.'],
      ['[Parçanı doğrula](genel:parcani-dogrula)', 'uc\\_bulucu\\_a ve uc\\_bulucu\\_b araçları; yalnız parçayı sınar.'],
      ...arsiv.satirlar.filter((r) => r[0] === 'Kütüphaneler'),
    ];
    say('genel: kod arşivi tablosu → sitedeki yerler');
  } else uyar(ctx.dosya, 'kod arşivi tablosu bulunamadı');
  const baslikBul = lisans.find((x) => x.t === 'baslik' && /Kod arşivini aç/.test(x.md));
  if (baslikBul) baslikBul.md = '**Kodları bul**';
  // Ek Kitap kaynakları: kalın kaynak satırı + altındaki adres tek paragraf; "Kendini kontrol et" ve "Yeni fikrim" alınmaz
  const ekKaynak = [];
  for (const x of govdeBloklari('ek', 15)) {
    if (x.t === 'kutu' && /^Kendini kontrol et/.test(x.baslik ?? '')) continue;
    if (x.t === 'senciz') continue;
    if (baglantiMi(x) && ekKaynak.at(-1)?.t === 'p') ekKaynak.at(-1).md += ` ${x.md.trim()}`;
    else ekKaynak.push(x);
  }
  genelSayfa('kitap-hakkinda', 'Kitap hakkında', 'Başvuru', ctx, [
    { baslik: 'Künye', bloklar: ana },
    { baslik: 'Ek Kitap künyesi', bloklar: ekKunye },
    { baslik: 'Kaynaklar · Projeler 1–24', bloklar: kaynaklar },
    { baslik: 'Görseller, kod ve kütüphaneler', bloklar: lisans },
    { baslik: 'Ek Kitap kaynakları', bloklar: ekKaynak },
  ]);
}

// ── ders.json ────────────────────────────────────────────────────────────────
const adimEtiketleri = onArka.dongu.map(([ad, aciklama]) => ({ ad, aciklama }));
const uniteler = onArka.ogrenme_yolu.map(([ad, , aralik], i) => {
  const [ilk, son] = aralik.split(/[–-]/).map(Number);
  return { ad: ad.replace(/^Bölüm \d+ · /, ''), ilk, son: son ?? ilk, renk: UNITE_RENKLERI[i] };
});
uniteler.push({ ad: 'Ek Kitap: set dışı iki proje', ilk: 25, son: 26, renk: UNITE_RENKLERI[7] });
for (const p of projeler) p.fm.adimSayisi = adimEtiketleri.length;
const toplamDk = projeler.reduce((t, p) => t + p.fm.sureDk, 0);

const dersYolu = path.join(HEDEF, 'ders.json');
const eskiDers = fs.existsSync(dersYolu) ? JSON.parse(fs.readFileSync(dersYolu, 'utf8')) : {};
const ders = {
  kod: 'arduino',
  ad: 'Arduino Başlangıç',
  altbaslik: '24 proje ile adım adım çalışma kitabı',
  aciklama: onArka.kunye[0],
  renk: '#C2410C',
  ikon: eskiDers.ikon ?? '♾️',
  sira: eskiDers.sira ?? 3,
  durum: 'hazir',
  foySayisi: projeler.length,
  toplamSureDk: toplamDk,
  birim: 'proje',
  ...(eskiDers.kapak ? { kapak: eskiDers.kapak, kapakAlt: eskiDers.kapakAlt } : {}),
  etiketler: ['UNO R3', 'Arduino IDE'],
  genelSayfalar: genelSayfalar.map((g) => g.slug),
  adimEtiketleri,
  uniteler,
};

// ── Yaz ──────────────────────────────────────────────────────────────────────
const yamlDeger = (v) => JSON.stringify(v);
function projeDosyasi(p) {
  const fm = Object.entries(p.fm).map(([k, v]) => `${k}: ${yamlDeger(v)}`).join('\n');
  const govde = p.govde.filter((x) => x !== '').join('\n\n').replace(/\n{3,}/g, '\n\n');
  return `---\n${fm}\n---\n\n${govde}\n`;
}

const ciktilar = new Map([
  ...projeler.map((p) => [`${p.slug}.md`, projeDosyasi(p)]),
  ...genelSayfalar.map((g) => [`genel/${g.slug}.md`, projeDosyasi(g)]),
]);

if (!KURU) {
  // Astro içerik önbelleği: yalnız görsel (SVG) değişip Markdown aynı kalınca eski çıktı kullanılır → temizle
  for (const k of ['.astro', path.join('node_modules', '.astro')]) fs.rmSync(path.join(DEPO, k), { recursive: true, force: true });
  fs.mkdirSync(path.join(HEDEF, 'gorseller'), { recursive: true });
  for (const f of fs.readdirSync(HEDEF)) if (/^proje-\d+\.md$/.test(f)) fs.rmSync(path.join(HEDEF, f));
  fs.rmSync(path.join(HEDEF, 'genel'), { recursive: true, force: true });
  fs.mkdirSync(path.join(HEDEF, 'genel'));
  // Betiğin yönettiği görseller (proje-NN-*, genel-*) ve kodlar yeniden yazılır; kapak görselleri korunur
  for (const f of fs.readdirSync(path.join(HEDEF, 'gorseller'))) if (/^(proje-\d+|genel)-/.test(f)) fs.rmSync(path.join(HEDEF, 'gorseller', f));
  fs.rmSync(path.join(HEDEF, 'kodlar'), { recursive: true, force: true });
  for (const [ad, icerik] of ciktilar) fs.writeFileSync(path.join(HEDEF, ad), icerik);
  fs.writeFileSync(dersYolu, `${JSON.stringify(ders, null, 2)}\n`);
  for (const [ad, ino] of kodKlasorleri) {
    fs.mkdirSync(path.join(HEDEF, 'kodlar', ad), { recursive: true });
    fs.copyFileSync(ino, path.join(HEDEF, 'kodlar', ad, `${ad}.ino`));
  }
  let svgToplam = 0;
  for (const [ad, kaynak] of sekilDosyalari) {
    fs.copyFileSync(kaynak, path.join(HEDEF, 'gorseller', ad));
    svgToplam += fs.statSync(kaynak).size;
  }
  let resimToplam = 0;
  for (const [ad, { kaynak, genislik, kalite }] of resimDosyalari) {
    const arabellek = await sharp(kaynak).resize({ width: genislik, withoutEnlargement: true }).webp({ quality: kalite, effort: 5 }).toBuffer();
    fs.writeFileSync(path.join(HEDEF, 'gorseller', ad), arabellek);
    resimToplam += arabellek.length;
  }
  rapor.bilgi.push(`çizim (SVG): ${sekilDosyalari.size} dosya, ${(svgToplam / 1024).toFixed(0)} KB`);
  rapor.bilgi.push(`resim (WebP; giriş + simge): ${resimDosyalari.size} dosya, ${(resimToplam / 1024).toFixed(0)} KB`);
  fs.writeFileSync(
    path.join(HEDEF, 'OKUBENI.md'),
    `# Bu klasör betikle üretilir\n\nKaynak: Arduino Başlangıç — 24 Proje (arduino-24-proje-v2), sürüm \`${surum.etiket}\` (${surum.sha.slice(0, 12)}).\n` +
      `Üreten: \`node scripts/arduino-donustur.mjs\` (README: *Arduino dersi: kitaptan dönüştürme*).\n` +
      `Kitap değişince betiği yeniden çalıştırın; bu klasördeki dosyaları elle düzenlemeyin.\n`,
  );
}

// ── Rapor ────────────────────────────────────────────────────────────────────
// Kalan "sayfa" geçişleri: "veri sayfası" (datasheet) ve genel sayfa adları ("Parçanı doğrula sayfası") doğaldır
let kalanSayfa = 0;
let genelSayfaAtfi = 0;
for (const [yol, icerik] of ciktilar) {
  const govde = icerik.replace(/^---[\s\S]*?\n---\n/, '').replace(/```[\s\S]*?```/g, '');
  for (const m of govde.matchAll(/[^.\n]*\bsayfa[^.\n]*/gi)) {
    // Doğal kullanımlar: veri/üretici sayfası, sitedeki proje sayfası, kaynak sitesindeki sayfa
    const t = m[0].replace(/(veri|üretici|üretici sürücü) sayfa\S*/gi, '').replace(/Proje sayfa\S*|kendi sayfasında\S*|sayfadaki akım/g, '');
    if (!/\bsayfa/i.test(t)) continue;
    if (/\]\(genel:[\w-]+\) sayfa/.test(t)) {
      genelSayfaAtfi += 1;
      continue;
    }
    kalanSayfa += 1;
    uyar(yol, `"sayfa" geçiyor → ${m[0].trim().slice(0, 110)}`);
  }
}
if (genelSayfaAtfi) rapor.bilgi.push(`${genelSayfaAtfi} satırda genel sayfa bağlantısı ("[Parçanı doğrula](genel:…) sayfası" gibi)`);
console.log(`Kaynak: ${KAYNAK} (${surum.etiket})`);
console.log(`${projeler.length} proje + ${genelSayfalar.length} genel sayfa, toplam ${toplamDk} dk, ${kodKlasorleri.size} kod klasörü${KURU ? ' (KURU ÇALIŞMA: dosya yazılmadı)' : ''}`);
console.log(`yazma alanı: ${projeler.reduce((t, p) => t + p.fm.yazSayisi, 0)} | uygulanan kurallar:`);
for (const [k, v] of kuralSayisi) console.log(`  ${String(v).padStart(3)}× ${k}`);
for (const b of rapor.bilgi) console.log(`bilgi: ${b}`);
for (const u of rapor.uyari) console.warn(`UYARI ${u}`);
console.log(`${rapor.uyari.length} uyarı (${kalanSayfa} "sayfa" geçişi).`);
