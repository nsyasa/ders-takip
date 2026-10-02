// Ders kapak çizimleri (icerik/<ders>/gorseller/<ad>.webp): en-boy oranı dosyadan okunur (sayfa kaymasın),
// yanında <ad>-kucuk.webp varsa dar ekranlar için srcset verilir.
import fs from 'node:fs';
import path from 'node:path';
import { rasterBoyutu } from './gorsel-boyut.mjs';
import { yol } from './veri';

export interface Kapak {
  src: string;
  srcset?: string;
  width?: number;
  height?: number;
}

export function kapakBilgisi(dersId: string, ad: string): Kapak | null {
  if (!ad) return null;
  const klasor = path.join(process.cwd(), 'icerik', dersId, 'gorseller');
  const buyuk = path.join(klasor, `${ad}.webp`);
  if (!fs.existsSync(buyuk)) return null;
  const boyut = rasterBoyutu(fs.readFileSync(buyuk));
  const adres = (dosya: string) => yol(`/${dersId}/gorseller/${dosya}`);
  let srcset: string | undefined;
  const kucukDosya = `${ad}-kucuk.webp`;
  const kucukYol = path.join(klasor, kucukDosya);
  if (boyut && fs.existsSync(kucukYol)) {
    const kucuk = rasterBoyutu(fs.readFileSync(kucukYol));
    if (kucuk) srcset = `${adres(kucukDosya)} ${kucuk.w}w, ${adres(`${ad}.webp`)} ${boyut.w}w`;
  }
  return { src: adres(`${ad}.webp`), srcset, width: boyut?.w, height: boyut?.h };
}
