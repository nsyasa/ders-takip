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

/** Dersin "birim" sözcükleri: ESP32'de föy, micro:bit'te proje. */
export interface Sozluk {
  tek: string; // "Föy"
  kucuk: string; // "föy"
  liste: string; // "Föyler"
  onceki: string;
  sonraki: string;
  ait: string; // "föyün" (Bu föyün sonunda)
  iceri: string; // "föydeki" (Bu föydeki ilerlemem)
}
const SOZLUKLER: Record<'foy' | 'proje', Sozluk> = {
  foy: { tek: 'Föy', kucuk: 'föy', liste: 'Föyler', onceki: 'Önceki föy', sonraki: 'Sonraki föy', ait: 'föyün', iceri: 'föydeki' },
  proje: { tek: 'Proje', kucuk: 'proje', liste: 'Projeler', onceki: 'Önceki proje', sonraki: 'Sonraki proje', ait: 'projenin', iceri: 'projedeki' },
};
export const FOY_SOZLUGU: Sozluk = SOZLUKLER.foy;
export const sozluk = (ders: Ders): Sozluk => SOZLUKLER[ders.data.birim];
export const sevimliMi = (ders: Ders): boolean => ders.data.tema === 'sevimli';

export const foyAdi = (f: Foy, s: Sozluk) => `${s.tek} ${f.data.numara}`;
export const foyKimligi = (f: Foy) => `${f.data.ders}/${f.data.slug}`;
export const foyYolu = (f: Foy) => yol(`/${f.data.ders}/${f.data.slug}/`);

export interface UniteGrubu {
  ad: string;
  renk: string;
  ilk: number;
  son: number;
  foyler: Foy[];
}
/** Ders sayfasındaki üniteler: numara aralığına göre; hiçbir üniteye girmeyen föyler "Diğer" altında toplanır. */
export function uniteGrupla(ders: Ders, foyler: Foy[]): UniteGrubu[] {
  const uniteler = ders.data.uniteler;
  if (uniteler.length === 0) return [];
  const icinde = (f: Foy, u: { ilk: number; son: number }) => f.data.numara >= u.ilk && f.data.numara <= u.son;
  const gruplar: UniteGrubu[] = uniteler.map((u) => ({ ...u, foyler: foyler.filter((f) => icinde(f, u)) }));
  const disarda = foyler.filter((f) => !uniteler.some((u) => icinde(f, u)));
  if (disarda.length) {
    gruplar.push({ ad: 'Diğer', renk: '', ilk: disarda[0].data.numara, son: disarda[disarda.length - 1].data.numara, foyler: disarda });
  }
  return gruplar.filter((g) => g.foyler.length > 0);
}

export function sureMetni(dk: number): string {
  if (dk < 60) return `${dk} dk`;
  const sa = Math.floor(dk / 60);
  const kalan = dk % 60;
  return kalan ? `${sa} sa ${kalan} dk` : `${sa} sa`;
}
