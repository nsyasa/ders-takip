// Bir dersin kapak çizimini siteye ekler: görseli 3:2 yapar, WebP'ye çevirip küçültür, ders.json'ı günceller.
//
//   node scripts/kapak-ekle.mjs <ders> <resim.png> [--alt "Görselin alt metni"] [--kuru]
//   örnek: node scripts/kapak-ekle.mjs esp32 "C:\Users\Enes\Documents\vibe coding\kodlama ogreniyorum\kapak-gorselleri\esp32.png" --alt "Robot kulübünde üç öğrenci…"
//
// Çıktı (icerik/<ders>/gorseller/): kapak.webp (1000 px geniş) ve kapak-kucuk.webp (760 px; dar ekranlar için srcset).
// ders.json'da "kapak": "kapak" yazılır; --alt verilirse "kapakAlt" da yazılır.
// Kaynak resim değiştirilmez. 3:2'den belirgin sapan görsel ortadan kırpılır (uyarı verir).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = process.argv.slice(2);
const kuru = arg.includes('--kuru');
const altIdx = arg.indexOf('--alt');
const alt = altIdx >= 0 ? arg[altIdx + 1] : undefined;
const konumsal = arg.filter((a, i) => !a.startsWith('--') && (altIdx < 0 || i !== altIdx + 1));
const [ders, resim] = konumsal;

if (!ders || !resim) {
  console.error('Kullanım: node scripts/kapak-ekle.mjs <ders> <resim.png> [--alt "metin"] [--kuru]');
  process.exit(1);
}
const dersKlasoru = path.join(KOK, 'icerik', ders);
const dersJson = path.join(dersKlasoru, 'ders.json');
if (!fs.existsSync(dersJson)) {
  console.error(`icerik/${ders}/ders.json bulunamadı.`);
  process.exit(1);
}
if (!fs.existsSync(resim)) {
  console.error(`Resim bulunamadı: ${resim}`);
  process.exit(1);
}

const meta = await sharp(resim).metadata();
const oran = meta.width / meta.height;
console.log(`Kaynak: ${meta.width}×${meta.height} ${meta.format} (oran ${oran.toFixed(3)}; hedef 1.500)`);
if (meta.width < 1200) console.warn('UYARI: genişlik 1200 pikselden küçük; geniş ekranda bulanık görünebilir.');

// 3:2'ye ortadan kırp (zaten 3:2 ise dokunulmaz)
let kes = { left: 0, top: 0, width: meta.width, height: meta.height };
if (Math.abs(oran - 1.5) > 0.01) {
  console.warn(`UYARI: oran 3:2 değil; ortadan kırpılıyor (önemli şeyler ortada kalmalı).`);
  if (oran > 1.5) {
    const w = Math.round(meta.height * 1.5);
    kes = { left: Math.round((meta.width - w) / 2), top: 0, width: w, height: meta.height };
  } else {
    const h = Math.round(meta.width / 1.5);
    kes = { left: 0, top: Math.round((meta.height - h) / 2), width: meta.width, height: h };
  }
}

const hedefKlasor = path.join(dersKlasoru, 'gorseller');
const uret = async (genislik, kalite) => sharp(resim).extract(kes).resize({ width: genislik, withoutEnlargement: true }).webp({ quality: kalite, effort: 6 }).toBuffer();
const buyuk = await uret(1000, 80);
const kucuk = await uret(760, 76);
console.log(`kapak.webp ${(buyuk.length / 1024).toFixed(0)} KB, kapak-kucuk.webp ${(kucuk.length / 1024).toFixed(0)} KB`);

if (!kuru) {
  fs.mkdirSync(hedefKlasor, { recursive: true });
  fs.writeFileSync(path.join(hedefKlasor, 'kapak.webp'), buyuk);
  fs.writeFileSync(path.join(hedefKlasor, 'kapak-kucuk.webp'), kucuk);
  const json = JSON.parse(fs.readFileSync(dersJson, 'utf8'));
  json.kapak = 'kapak';
  if (alt !== undefined) json.kapakAlt = alt;
  else if (!json.kapakAlt) console.warn('UYARI: kapakAlt (alt metin) yok; --alt "…" ile verin (görme engelli okuyucular için).');
  fs.writeFileSync(dersJson, `${JSON.stringify(json, null, 2)}\n`);
  console.log(`icerik/${ders}/ders.json güncellendi (kapak${alt !== undefined ? ', kapakAlt' : ''}).`);
}
