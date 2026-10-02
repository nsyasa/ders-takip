import type { APIRoute } from 'astro';
import path from 'node:path';
import { tumDersler } from '../../../lib/veri';
import { dosyaAdlari, ikiliOku, metinOku } from '../../../lib/dosyalar';
import { semayiBoya } from '../../../lib/sema-boya.mjs';
import { makecodeMi, makecodeBagimsiz } from '../../../lib/makecode.mjs';
import jetbrainsLatin from '../../../assets/fonts/jetbrains-mono-latin-wght-normal.woff2?url';
import jetbrainsLatinExt from '../../../assets/fonts/jetbrains-mono-latin-ext-wght-normal.woff2?url';

// icerik/<ders>/gorseller/ altındaki görseller yayınlanır: /<ders>/gorseller/<ad>
//  • .svg şemalar derlemede yeniden boyanır (kaynak dosya değişmez; geçersiz XML'ler de — ör. yinelenen niteliği olan — burada düzeltilir);
//  • MakeCode blok görselleri (kök sınıfı mc-blok) boyanmaz, yalnız blok yazı tipi eklenir;
//  • .webp/.png/.jpg/.gif aynen verilir.
const TURLER: Record<string, string> = {
  '.svg': 'image/svg+xml; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
};

export async function getStaticPaths() {
  const dersler = (await tumDersler()).filter((d) => d.data.durum === 'hazir');
  return dersler.flatMap((ders) => dosyaAdlari(ders.id, 'gorseller', Object.keys(TURLER)).map((dosya) => ({ params: { ders: ders.id, dosya } })));
}

export const GET: APIRoute = ({ params }) => {
  const ders = params.ders!;
  const dosya = params.dosya!;
  const tur = TURLER[path.extname(dosya).toLowerCase()];
  if (path.extname(dosya).toLowerCase() === '.svg') {
    const ham = metinOku(ders, 'gorseller', dosya);
    const govde = makecodeMi(ham)
      ? makecodeBagimsiz(ham, { latin: jetbrainsLatin, latinExt: jetbrainsLatinExt })
      : semayiBoya(ham, { bagimsiz: true });
    return new Response(govde, { headers: { 'Content-Type': tur } });
  }
  return new Response(ikiliOku(ders, 'gorseller', dosya), { headers: { 'Content-Type': tur } });
};
