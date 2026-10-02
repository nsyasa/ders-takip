import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Kimlikler `ders/slug` olur: bütün derslerde "foy-01" slug'ı bulunduğundan
// Astro'nun varsayılan (yalnız slug'a bakan) kimliği çakışırdı.

const dersler = defineCollection({
  loader: glob({
    pattern: '*/ders.json',
    base: './icerik',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: z.object({
    kod: z.string(),
    ad: z.string(),
    altbaslik: z.string().default(''),
    aciklama: z.string().default(''),
    renk: z.string().default('#1F6FB2'),
    ikon: z.string().default('📘'),
    sira: z.number().default(99),
    durum: z.enum(['hazir', 'yakinda']),
    foySayisi: z.number().default(0),
    toplamSureDk: z.number().default(0),
    genelSayfalar: z.array(z.string()).default([]),
    // — Görünüm ve sözcük dağarcığı (isteğe bağlı; ESP32 gibi eski dersler hiçbirini yazmaz) —
    /** Sayfalarda "Föy 3" mü, "Proje 3" mü denir */
    birim: z.enum(['foy', 'proje']).default('foy'),
    /** "sevimli": renkli, çocuk dostu görünüm (LED rakamlar, Bit maskotu, 6 adımlı yol); "okunur": sade çalışma föyü */
    tema: z.enum(['okunur', 'sevimli']).default('okunur'),
    /** gorseller/<kapak>.webp: ders kartı ve ders sayfası başlığındaki çizim */
    kapak: z.string().default(''),
    kapakAlt: z.string().default(''),
    etiketler: z.array(z.string()).default([]),
    /** Föy/proje sayfasının üstündeki adım yolu (ör. Bak, Tahmin et, Kodla…): her adım bir onay kutusudur */
    adimEtiketleri: z.array(z.object({ ad: z.string(), aciklama: z.string().default('') })).default([]),
    /** Ders sayfasında föyler/projeler bu gruplara ayrılır (numara aralığı) */
    uniteler: z.array(z.object({ ad: z.string(), ilk: z.number(), son: z.number(), renk: z.string().default('') })).default([]),
  }),
});

const foyler = defineCollection({
  loader: glob({
    pattern: '*/{foy,proje}-*.md',
    base: './icerik',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    ders: z.string(),
    numara: z.number(),
    slug: z.string(),
    baslik: z.string(),
    altbaslik: z.string().default(''),
    /** Başlığın altındaki kısa açıklama (tek sayfalık proje girişi) */
    ozet: z.string().default(''),
    dersSaati: z.string().default(''),
    sureDk: z.number().default(0),
    seviye: z.string().default(''),
    onkosul: z.array(z.string()).default([]),
    onkosulFoyler: z.array(z.number()).default([]),
    kavramlar: z.array(z.string()).default([]),
    hedefler: z.array(z.string()).default([]),
    malzemeler: z
      .array(z.object({ ad: z.string(), adet: z.string().default(''), not: z.string().default('') }))
      .default([]),
    kodlar: z.array(z.string()).default([]),
    gorseller: z.array(z.string()).default([]),
    adimSayisi: z.number().default(0),
    yazSayisi: z.number().default(0),
  }),
});

const genel = defineCollection({
  loader: glob({
    pattern: '*/genel/*.md',
    base: './icerik',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    tur: z.literal('genel').default('genel'),
    baslik: z.string(),
    slug: z.string(),
    sira: z.number().default(99),
    /** Başlığın üstündeki küçük etiket */
    ustbilgi: z.string().default(''),
  }),
});

export const collections = { dersler, foyler, genel };
