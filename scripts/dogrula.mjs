// İçerik doğrulama: icerik/ altındaki dosyaları CONTENT-SPEC.md'ye göre denetler.
// Dosyalara DOKUNMAZ; yalnız rapor verir. HATA varsa çıkış kodu 1 olur (build durur),
// UYARI yalnız bilgi içindir.
//   npm run dogrula
import fs from 'node:fs';
import path from 'node:path';
import { load as yamlYukle } from 'js-yaml';
import { svgSorunlari } from '../src/lib/sema-boya.mjs';

const KOK = path.resolve(process.cwd(), 'icerik');
const SEVIYELER = ['Başlangıç', 'Başlangıç+', 'Orta', 'Orta+', 'İleri', 'Çok ileri', 'Temel', 'Çevre'];
const KUTU_TURLERI = new Set(['bilgi', 'dikkat', 'fen', 'rutin', 'yz', 'tahmin', 'olmadiysa', 'kontrol', 'galeri']);
const YAPRAK_DIREKTIFLER = new Set(['yaz', 'jest', 'sira', 'kunye']);
const RESIM_UZANTILARI = new Set(['.svg', '.webp', '.png', '.jpg', '.jpeg', '.gif']);
const BUYUK_GORSEL = 300 * 1024; // bu boyutun üstündeki görsel uyarı verir (küçültülmemiş MakeCode SVG'leri gibi)

const hatalar = [];
const uyarilar = [];
const hata = (dosya, ileti) => hatalar.push(`${dosya}: ${ileti}`);
const uyari = (dosya, ileti) => uyarilar.push(`${dosya}: ${ileti}`);
const goreli = (p) => path.relative(KOK, p).replace(/\\/g, '/');

function frontmatterOku(dosya) {
  const metin = fs.readFileSync(dosya, 'utf8').replace(/^﻿/, '');
  const m = metin.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) {
    hata(goreli(dosya), 'frontmatter (--- ... ---) bulunamadı');
    return null;
  }
  try {
    return { fm: yamlYukle(m[1]) ?? {}, govde: m[2] };
  } catch (e) {
    hata(goreli(dosya), `frontmatter okunamadı: ${e.message.split('\n')[0]}`);
    return null;
  }
}

/** Kod bloklarının dışındaki satırlar + kod bloğu açılış satırları */
function satirlar(govde) {
  const dis = [];
  const kodAcilis = [];
  let kodta = false;
  for (const satir of govde.split(/\r?\n/)) {
    if (/^```/.test(satir)) {
      if (!kodta) kodAcilis.push(satir);
      kodta = !kodta;
      continue;
    }
    if (!kodta) dis.push(satir);
  }
  return { dis, kodAcilis, kapanmamis: kodta };
}

const bos = (v) => v === undefined || v === null || v === '';
function gerekli(dosya, fm, alanlar) {
  for (const a of alanlar) if (bos(fm[a])) hata(dosya, `frontmatter alanı eksik: ${a}`);
}

/** Direktifler ve kutular: açılış/kapanış dengesi, bilinen türler */
function direktifDenetle(ad, dis) {
  let acik = 0;
  for (const s of dis) {
    const kutu = s.match(/^(:{3,})([A-Za-zÇĞİÖŞÜçğıöşü]+)?/);
    if (kutu) {
      if (kutu[2]) {
        acik += 1;
        if (!KUTU_TURLERI.has(kutu[2])) hata(ad, `bilinmeyen kutu türü: :::${kutu[2]}`);
      } else {
        acik -= 1;
      }
    }
    const yaprak = s.match(/^::([A-Za-z]+)/);
    if (yaprak && !YAPRAK_DIREKTIFLER.has(yaprak[1])) hata(ad, `bilinmeyen yazma/yaprak direktifi: ::${yaprak[1]}`);
  }
  if (acik !== 0) hata(ad, `kutu açılış/kapanış sayısı tutmuyor (fark: ${acik})`);
}

function gorselDenetle(ad, dosya, dis) {
  for (const s of dis) {
    for (const m of s.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)) {
      if (!fs.existsSync(path.resolve(path.dirname(dosya), m[1]))) hata(ad, `görsel bulunamadı: ${m[1]}`);
    }
  }
}

/** proje:31, foy:6, genel:sozluk bağlantılarının hedefi var mı? */
function baglantiDenetle(ad, dis, hedefler) {
  for (const s of dis) {
    for (const m of s.matchAll(/\]\((proje|foy|genel):([\w-]+)\)/g)) {
      const [, tur, deger] = m;
      const var_ = tur === 'genel' ? hedefler.genel.has(deger) : hedefler.foy.has(`${tur}-${String(deger).padStart(2, '0')}`);
      if (!var_) hata(ad, `bağlantı hedefi yok: ${tur}:${deger}`);
    }
  }
}

function foyDenetle(dosya, klasor, ders, hedefler) {
  const ad = goreli(dosya);
  const okunan = frontmatterOku(dosya);
  if (!okunan) return null;
  const { fm, govde } = okunan;
  const projeMi = ders.birim === 'proje';
  const onek = projeMi ? 'proje' : 'foy';
  gerekli(ad, fm, ['ders', 'numara', 'slug', 'baslik', 'sureDk', 'seviye', 'malzemeler', 'adimSayisi', 'yazSayisi']);

  const dosyaAdi = path.basename(dosya, '.md');
  const no = Number(dosyaAdi.replace(new RegExp(`^${onek}-`), ''));
  if (fm.ders !== ders.kod) hata(ad, `ders alanı "${fm.ders}", klasör "${ders.kod}"`);
  if (fm.slug !== dosyaAdi) hata(ad, `slug "${fm.slug}", dosya adı "${dosyaAdi}"`);
  if (fm.numara !== no) hata(ad, `numara ${fm.numara}, dosya adından beklenen ${no}`);
  if (fm.seviye && !SEVIYELER.includes(fm.seviye)) uyari(ad, `bilinmeyen seviye: ${fm.seviye}`);
  // Hedefler "…yapabilirim" cümleleridir; kitapta hedef cümlesi olmayan derslerde (birim: proje) boş olabilir
  if (!projeMi && (!Array.isArray(fm.hedefler) || fm.hedefler.length === 0)) hata(ad, 'hedefler boş');
  if (!Array.isArray(fm.malzemeler) || fm.malzemeler.some((m) => !m || typeof m.ad !== 'string')) {
    hata(ad, 'malzemeler {ad, adet, not} listesi olmalı');
  }

  const { dis, kodAcilis, kapanmamis } = satirlar(govde);
  if (kapanmamis) hata(ad, 'kapatılmamış ``` kod bloğu');

  // Onay kutuları ve yazma alanları. Adım yolu (ders.json: adimEtiketleri) olan derslerde yolun adımları da onay kutusudur.
  const adim = dis.filter((s) => /^\s*[-*]\s+\[[ xX]\]/.test(s)).length + (ders.adimEtiketleri?.length ?? 0);
  const yaz = dis.filter((s) => /^::yaz(\[|\{|$)/.test(s)).length;
  if (adim !== fm.adimSayisi) hata(ad, `adimSayisi ${fm.adimSayisi}, metindeki onay kutusu + adım yolu ${adim} (ilerleme hesabı bozulur)`);
  if (yaz !== fm.yazSayisi) hata(ad, `yazSayisi ${fm.yazSayisi}, metindeki ::yaz ${yaz}`);

  direktifDenetle(ad, dis);

  // Bölümler
  if (!dis.some((s) => /^## /.test(s))) hata(ad, '`##` bölüm başlığı yok');
  if (dis.some((s) => /^# /.test(s))) uyari(ad, 'gövdede H1 var (spec: H1 olmamalı)');

  gorselDenetle(ad, dosya, dis);
  baglantiDenetle(ad, dis, hedefler);
  for (const g of fm.gorseller ?? []) {
    if (!fs.existsSync(path.join(klasor, 'gorseller', `${g}.svg`))) hata(ad, `frontmatter görseli yok: gorseller/${g}.svg`);
  }
  if (fm.simge && !fs.existsSync(path.join(klasor, 'gorseller', `${fm.simge}.webp`))) hata(ad, `proje simgesi yok: gorseller/${fm.simge}.webp`);

  // Kod klasörleri
  for (const k of fm.kodlar ?? []) {
    if (!fs.existsSync(path.join(klasor, 'kodlar', k))) hata(ad, `frontmatter kod klasörü yok: kodlar/${k}`);
  }
  for (const a of kodAcilis) {
    const dosyaK = a.match(/\bdosya=(\S+)/)?.[1];
    const parca = a.match(/\bparca=(\S+)/)?.[1];
    if (dosyaK) {
      const kk = path.join(klasor, 'kodlar', dosyaK);
      if (!fs.existsSync(kk)) hata(ad, `kod bloğunun klasörü yok: kodlar/${dosyaK}`);
      else if (parca && !fs.existsSync(path.join(kk, parca))) hata(ad, `parca dosyası yok: kodlar/${dosyaK}/${parca}`);
      else if (!fs.existsSync(path.join(kk, `${dosyaK}.ino`))) uyari(ad, `Arduino klasöründe ${dosyaK}.ino yok`);
    }
    if (!/\btitle="/.test(a)) uyari(ad, `kod bloğunda title yok: ${a.slice(0, 50)}`);
  }
  return fm;
}

function dersDenetle(ad) {
  const klasor = path.join(KOK, ad);
  const jsonYolu = path.join(klasor, 'ders.json');
  if (!fs.existsSync(jsonYolu)) return;
  let ders;
  try {
    ders = JSON.parse(fs.readFileSync(jsonYolu, 'utf8'));
  } catch (e) {
    hata(`${ad}/ders.json`, `JSON okunamadı: ${e.message}`);
    return;
  }
  const dj = `${ad}/ders.json`;
  gerekli(dj, ders, ['kod', 'ad', 'durum', 'sira']);
  if (ders.kod !== ad) hata(dj, `kod "${ders.kod}", klasör adı "${ad}"`);
  if (!['hazir', 'yakinda'].includes(ders.durum)) hata(dj, `durum "hazir" ya da "yakinda" olmalı: ${ders.durum}`);
  if (ders.birim !== undefined && !['foy', 'proje'].includes(ders.birim)) hata(dj, `birim "foy" ya da "proje" olmalı: ${ders.birim}`);
  if (ders.tema !== undefined && !['okunur', 'sevimli'].includes(ders.tema)) hata(dj, `tema "okunur" ya da "sevimli" olmalı: ${ders.tema}`);
  // Kapak çizimi ana sayfa kartında kullanılır (Yakında dersler dahil)
  if (ders.kapak && !fs.existsSync(path.join(klasor, 'gorseller', `${ders.kapak}.webp`))) {
    hata(dj, `kapak görseli yok: gorseller/${ders.kapak}.webp`);
  }
  if (ders.kapak && !ders.kapakAlt) uyari(dj, 'kapakAlt (kapak görselinin alt metni) yok');
  if (ders.durum !== 'hazir') return;

  const onek = ders.birim === 'proje' ? 'proje' : 'foy';

  // Föyler / projeler
  const foyDosyalari = fs.readdirSync(klasor).filter((f) => new RegExp(`^${onek}-\\d+\\.md$`).test(f)).sort();
  if (foyDosyalari.length !== ders.foySayisi) uyari(dj, `foySayisi ${ders.foySayisi}, klasörde ${foyDosyalari.length} ${onek} dosyası`);

  // Bağlantı hedefleri (proje:31 …): önce hangi föyler/genel sayfalar var, topla
  const hedefler = { foy: new Set(foyDosyalari.map((f) => f.replace(/\.md$/, ''))), genel: new Set() };
  const genelKlasor = path.join(klasor, 'genel');
  const genelDosyalar = fs.existsSync(genelKlasor) ? fs.readdirSync(genelKlasor).filter((x) => x.endsWith('.md')) : [];
  for (const f of genelDosyalar) hedefler.genel.add(path.basename(f, '.md'));

  const foyler = foyDosyalari.map((f) => foyDenetle(path.join(klasor, f), klasor, ders, hedefler)).filter(Boolean);
  const toplam = foyler.reduce((t, f) => t + (Number(f.sureDk) || 0), 0);
  if (toplam !== ders.toplamSureDk) uyari(dj, `toplamSureDk ${ders.toplamSureDk}, ${onek}lerin toplamı ${toplam}`);
  const numaralar = new Set(foyler.map((f) => f.numara));
  for (const f of foyler) {
    for (const n of f.onkosulFoyler ?? []) {
      if (!numaralar.has(n)) hata(`${ad}/${onek}-${String(f.numara).padStart(2, '0')}.md`, `onkosulFoyler: ${onek} ${n} bulunamadı`);
    }
  }

  // Ünitelere ayırma: aralıklar çakışmamalı, her föy/proje bir üniteye girmeli
  if (Array.isArray(ders.uniteler) && ders.uniteler.length > 0) {
    ders.uniteler.forEach((u, i) => {
      if (!u.ad || !Number.isInteger(u.ilk) || !Number.isInteger(u.son) || u.ilk > u.son) hata(dj, `uniteler[${i}] {ad, ilk, son} geçersiz`);
      if (i > 0 && u.ilk <= ders.uniteler[i - 1].son) hata(dj, `uniteler[${i}] aralığı öncekiyle çakışıyor`);
    });
    for (const n of numaralar) {
      if (!ders.uniteler.some((u) => n >= u.ilk && n <= u.son)) uyari(dj, `${onek} ${n} hiçbir ünitede değil ("Diğer" altında listelenir)`);
    }
  }
  // Adım yolu: sayfa şablonundaki onay kutuları
  if (Array.isArray(ders.adimEtiketleri) && ders.adimEtiketleri.some((a) => !a || typeof a.ad !== 'string' || !a.ad)) {
    hata(dj, 'adimEtiketleri {ad, aciklama} listesi olmalı');
  }

  // Genel sayfalar
  const genelSluglar = new Set();
  for (const f of genelDosyalar) {
    const yol = path.join(genelKlasor, f);
    const okunan = frontmatterOku(yol);
    if (!okunan) continue;
    gerekli(goreli(yol), okunan.fm, ['baslik', 'slug', 'sira']);
    if (okunan.fm.slug !== path.basename(f, '.md')) hata(goreli(yol), `slug "${okunan.fm.slug}", dosya adı "${f}"`);
    genelSluglar.add(okunan.fm.slug);
    // Genel sayfalardaki kod blokları, görseller ve bağlantılar da var olmalı
    const { dis, kodAcilis } = satirlar(okunan.govde);
    for (const a of kodAcilis) {
      const dk = a.match(/\bdosya=(\S+)/)?.[1];
      if (dk && !fs.existsSync(path.join(klasor, 'kodlar', dk))) hata(goreli(yol), `kod bloğunun klasörü yok: kodlar/${dk}`);
    }
    direktifDenetle(goreli(yol), dis);
    gorselDenetle(goreli(yol), yol, dis);
    baglantiDenetle(goreli(yol), dis, hedefler);
  }

  // Görseller: geçersiz XML tarayıcıda bozuk çıkar (şemalar derlemede otomatik düzeltilir; kaynak da düzeltilmeli);
  // çok büyük dosyalar (ör. küçültülmemiş MakeCode SVG'si, 1,4 MB) sayfayı ağırlaştırır.
  const gorselKlasor = path.join(klasor, 'gorseller');
  if (fs.existsSync(gorselKlasor)) {
    for (const f of fs.readdirSync(gorselKlasor)) {
      const yol = path.join(gorselKlasor, f);
      const uzanti = path.extname(f).toLowerCase();
      if (!RESIM_UZANTILARI.has(uzanti)) {
        uyari(goreli(yol), 'tanınmayan görsel türü; yayınlanmaz');
        continue;
      }
      const boyut = fs.statSync(yol).size;
      if (boyut > BUYUK_GORSEL) uyari(goreli(yol), `görsel ${(boyut / 1024).toFixed(0)} KB; sayfayı ağırlaştırır (SVG ise küçültün, resim ise WebP'ye çevirin)`);
      if (uzanti === '.svg') {
        for (const sorun of svgSorunlari(fs.readFileSync(yol, 'utf8'))) {
          uyari(goreli(yol), `${sorun}; derlemede otomatik düzeltiliyor, kaynak dosyayı da düzeltin`);
        }
      }
    }
  }
  for (const s of ders.genelSayfalar ?? []) {
    if (!genelSluglar.has(s)) hata(dj, `genelSayfalar'daki "${s}" için genel/${s}.md yok`);
  }
}

if (!fs.existsSync(KOK)) {
  console.error('icerik/ klasörü bulunamadı.');
  process.exit(1);
}
for (const d of fs.readdirSync(KOK, { withFileTypes: true })) if (d.isDirectory()) dersDenetle(d.name);

for (const u of uyarilar) console.warn(`UYARI  ${u}`);
for (const h of hatalar) console.error(`HATA   ${h}`);
console.log(`İçerik denetimi: ${hatalar.length} hata, ${uyarilar.length} uyarı.`);
if (hatalar.length > 0) process.exit(1);
