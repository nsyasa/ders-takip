// Sayfaların ortak kullandığı veri yardımcıları (derleme zamanında çalışır).
import { getCollection, type CollectionEntry } from 'astro:content';

export type Ders = CollectionEntry<'dersler'>;
export type Foy = CollectionEntry<'foyler'>;
export type Genel = CollectionEntry<'genel'>;

/** Taban yoluyla mutlak yol: yol('/esp32/') → "/depo/esp32/" */
export function yol(p: string): string {
  const taban = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : import.meta.env.BASE_URL + '/';
  return taban + p.replace(/^\/+/, '');
}

export async function tumDersler(): Promise<Ders[]> {
  const liste = await getCollection('dersler');
  return liste.sort((a, b) => a.data.sira - b.data.sira);
}

export async function dersFoyleri(ders: string): Promise<Foy[]> {
  const liste = await getCollection('foyler', (f) => f.data.ders === ders);
  return liste.sort((a, b) => a.data.numara - b.data.numara);
}

/** Ders sayfasında "Genel bilgiler": önce ders.json'daki sıra, sonra kalanlar `sira`ya göre. */
export async function dersGenel(ders: Ders): Promise<Genel[]> {
  const liste = await getCollection('genel', (g) => g.id.startsWith(`${ders.id}/`));
  const sira = ders.data.genelSayfalar;
  return liste.sort((a, b) => {
    const ia = sira.indexOf(a.data.slug);
    const ib = sira.indexOf(b.data.slug);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.data.sira - b.data.sira;
  });
}

export const foyAdi = (f: Foy) => `Föy ${f.data.numara}`;
export const foyKimligi = (f: Foy) => `${f.data.ders}/${f.data.slug}`;
export const foyYolu = (f: Foy) => yol(`/${f.data.ders}/${f.data.slug}/`);

export function sureMetni(dk: number): string {
  if (dk < 60) return `${dk} dk`;
  const sa = Math.floor(dk / 60);
  const kalan = dk % 60;
  return kalan ? `${sa} sa ${kalan} dk` : `${sa} sa`;
}
