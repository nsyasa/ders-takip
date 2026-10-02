import type { APIRoute } from 'astro';
import { tumDersler } from '../../../lib/veri';
import { dosyalar, metinOku } from '../../../lib/dosyalar';
import { semayiBoya } from '../../../lib/sema-boya.mjs';

// icerik/<ders>/gorseller/*.svg dosyaları derlemede yeniden boyanıp yayınlanır: /<ders>/gorseller/<ad>.svg
// (kaynak dosya değişmez; geçersiz XML'ler de — ör. yinelenen niteliği olan — burada düzeltilir)
export async function getStaticPaths() {
  const dersler = (await tumDersler()).filter((d) => d.data.durum === 'hazir');
  return dersler.flatMap((ders) => dosyalar(ders.id, 'gorseller', '.svg').map((ad) => ({ params: { ders: ders.id, ad } })));
}

export const GET: APIRoute = ({ params }) =>
  new Response(semayiBoya(metinOku(params.ders!, 'gorseller', `${params.ad}.svg`), { bagimsiz: true }), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
