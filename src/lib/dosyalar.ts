// Derleme zamanında icerik/ klasöründen dosya okuyan yardımcılar (zip ve SVG uç noktaları kullanır).
import fs from 'node:fs';
import path from 'node:path';
import { zipSync } from 'fflate';

const ICERIK = path.resolve(process.cwd(), 'icerik');

export function altKlasorler(ders: string, alt: string): string[] {
  const yol = path.join(ICERIK, ders, alt);
  if (!fs.existsSync(yol)) return [];
  return fs
    .readdirSync(yol, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

export function dosyalar(ders: string, alt: string, uzanti: string): string[] {
  const yol = path.join(ICERIK, ders, alt);
  if (!fs.existsSync(yol)) return [];
  return fs
    .readdirSync(yol, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.toLowerCase().endsWith(uzanti))
    .map((d) => d.name.slice(0, -uzanti.length));
}

export function metinOku(ders: string, ...parca: string[]): string {
  return fs.readFileSync(path.join(ICERIK, ders, ...parca), 'utf8');
}

export function ikiliOku(ders: string, ...parca: string[]): Buffer {
  return fs.readFileSync(path.join(ICERIK, ders, ...parca));
}

/** icerik/<ders>/<alt> klasöründeki, verilen uzantılara sahip dosyaların adları (uzantısıyla). */
export function dosyaAdlari(ders: string, alt: string, uzantilar: string[]): string[] {
  const yol = path.join(ICERIK, ders, alt);
  if (!fs.existsSync(yol)) return [];
  return fs
    .readdirSync(yol, { withFileTypes: true })
    .filter((d) => d.isFile() && uzantilar.includes(path.extname(d.name).toLowerCase()))
    .map((d) => d.name);
}

/**
 * Arduino klasörünü .zip yapar. Arduino IDE klasör adı ile .ino adının aynı olmasını ister;
 * bu yüzden zip içinde klasör yapısı korunur: Foy1_ButonOku/Foy1_ButonOku.ino
 */
export function klasoruZipLe(ders: string, klasor: string): Uint8Array {
  const kok = path.join(ICERIK, ders, 'kodlar', klasor);
  const girdiler: Record<string, Uint8Array> = {};
  for (const ad of fs.readdirSync(kok)) {
    const tam = path.join(kok, ad);
    if (fs.statSync(tam).isFile()) girdiler[`${klasor}/${ad}`] = new Uint8Array(fs.readFileSync(tam));
  }
  // Sabit zaman damgası: aynı içerik her derlemede aynı zip'i üretsin.
  return zipSync(girdiler, { mtime: new Date('2024-01-01T00:00:00Z') });
}

