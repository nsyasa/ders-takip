import type { APIRoute } from 'astro';
import { tumDersler } from '../../../lib/veri';
import { dosyalar, metinOku } from '../../../lib/dosyalar';

// icerik/<ders>/gorseller/*.svg dosyaları olduğu gibi yayınlanır: /<ders>/gorseller/<ad>.svg
export async function getStaticPaths() {
  const dersler = (await tumDersler()).filter((d) => d.data.durum === 'hazir');
  return dersler.flatMap((ders) => dosyalar(ders.id, 'gorseller', '.svg').map((ad) => ({ params: { ders: ders.id, ad } })));
}

export const GET: APIRoute = ({ params }) =>
  new Response(metinOku(params.ders!, 'gorseller', `${params.ad}.svg`), {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' },
  });
