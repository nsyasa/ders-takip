// Çizim denetimi: yeniden kurulan SVG ile PDF'teki aslını aynı ölçekte görüntüye çevirip karşılaştırır.
//
//   node scripts/arduino/sekil-karsilastir.mjs [--yan-yana <cikis-klasoru>]
//
// .arduino-ara/kitap.json'daki her çizim için: PDF bölgesi (PyMuPDF, 3×) ve SVG (sharp/librsvg, 3×) piksel piksel
// karşılaştırılır; belirgin farklı piksel oranı raporlanır. Yazılar yazı tipi farkı yüzünden biraz kayabilir,
// bu yüzden eşik yazıyı değil şekli (delik, kablo, parça) yakalayacak kadar gevşektir.
// --yan-yana: her çizim için PDF | SVG görüntüsünü yan yana kaydeder (gözle bakmak için).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const DEPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ARA = path.join(DEPO, '.arduino-ara');
const KAYNAK = process.env.ARDUINO_KAYNAK ?? 'C:/Users/Enes/Documents/vibe coding/kitaplar/outputs/arduino-24-proje-v2';
const PYTHON = process.env.ARDUINO_PYTHON ?? 'python';
const yanIdx = process.argv.indexOf('--yan-yana');
const YAN = yanIdx > 0 ? path.resolve(process.argv[yanIdx + 1]) : null;
const OLCEK = 3;

const kitap = JSON.parse(fs.readFileSync(path.join(ARA, 'kitap.json'), 'utf8'));
const isler = [];
for (const p of kitap.projeler) {
  const pdf = p.kaynak === 'ana' ? 'Arduino_Baslangic_24_Proje_ekran.pdf' : 'Ek_Kitap.pdf';
  for (const s of p.sayfalar) for (const b of s.bloklar) if (b.t === 'sekil') isler.push({ dosya: b.dosya, pdf, sayfa: s.sayfa });
}

// PDF bölgelerini Python ile görüntüye çevir (bölge = pdf-oku.py'nin kitap.json'a yazdığı kırpma kutusu)
const gecici = fs.mkdtempSync(path.join(ARA, 'karsilastir-'));
const r = spawnSync(PYTHON, ['-c', `
import fitz, json, sys
isler = json.loads(sys.stdin.read())
kitap = sys.argv[1]; cikis = sys.argv[2]; olcek = float(sys.argv[3])
belgeler = {}
for i in isler:
    b = belgeler.setdefault(i['pdf'], fitz.open(kitap + '/cikti/' + i['pdf']))
    s = b[i['sayfa'] - 1]
    pm = s.get_pixmap(matrix=fitz.Matrix(olcek, olcek), clip=fitz.Rect(i['kirpma']), alpha=False)
    pm.save(cikis + '/' + i['dosya'].replace('.svg', '.pdf.png'))
`, KAYNAK, gecici, String(OLCEK)], {
  input: JSON.stringify(isler.map((i) => ({ ...i, kirpma: kirpmaBul(i) }))),
  encoding: 'utf8',
});
if (r.status !== 0) {
  console.error(r.stderr);
  process.exit(1);
}

function kirpmaBul(i) {
  for (const p of kitap.projeler) for (const s of p.sayfalar) for (const b of s.bloklar) if (b.dosya === i.dosya) return b.kirpma;
  return null;
}

let kotu = 0;
if (YAN) fs.mkdirSync(YAN, { recursive: true });
for (const i of isler) {
  const pdfPng = path.join(gecici, i.dosya.replace('.svg', '.pdf.png'));
  const meta = await sharp(pdfPng).metadata();
  const svg = fs.readFileSync(path.join(ARA, 'sekiller', i.dosya));
  const a = await sharp(pdfPng).greyscale().raw().toBuffer();
  const b = await sharp(svg, { density: 72 * OLCEK }).resize(meta.width, meta.height, { fit: 'fill' }).flatten({ background: '#ffffff' }).greyscale().raw().toBuffer();
  let fark = 0;
  for (let k = 0; k < a.length; k++) if (Math.abs(a[k] - b[k]) > 96) fark += 1;
  const oran = fark / a.length;
  if (oran > 0.02) kotu += 1;
  console.log(`${oran > 0.02 ? 'FARKLI' : 'tamam '} ${(oran * 100).toFixed(2).padStart(6)} %  ${i.dosya}`);
  if (YAN) {
    const svgPng = await sharp(svg, { density: 72 * OLCEK }).resize(meta.width, meta.height, { fit: 'fill' }).flatten({ background: '#ffffff' }).png().toBuffer();
    await sharp({ create: { width: meta.width * 2 + 20, height: meta.height, channels: 3, background: '#ff00ff' } })
      .composite([{ input: pdfPng, left: 0, top: 0 }, { input: svgPng, left: meta.width + 20, top: 0 }])
      .png()
      .toFile(path.join(YAN, i.dosya.replace('.svg', '.png')));
  }
}
fs.rmSync(gecici, { recursive: true, force: true });
console.log(`${isler.length} çizim; belirgin farklı: ${kotu}`);
if (kotu) process.exit(1);
