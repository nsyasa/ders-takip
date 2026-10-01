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
  }),
});

const foyler = defineCollection({
  loader: glob({
    pattern: '*/foy-*.md',
    base: './icerik',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    ders: z.string(),
    numara: z.number(),
    slug: z.string(),
    baslik: z.string(),
    altbaslik: z.string().default(''),
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
  }),
});

export const collections = { dersler, foyler, genel };
