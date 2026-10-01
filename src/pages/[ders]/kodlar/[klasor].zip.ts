import type { APIRoute } from 'astro';
import { tumDersler } from '../../../lib/veri';
import { altKlasorler, klasoruZipLe } from '../../../lib/dosyalar';

export async function getStaticPaths() {
  const dersler = (await tumDersler()).filter((d) => d.data.durum === 'hazir');
  return dersler.flatMap((ders) => altKlasorler(ders.id, 'kodlar').map((klasor) => ({ params: { ders: ders.id, klasor } })));
}

export const GET: APIRoute = ({ params }) => {
  const govde = klasoruZipLe(params.ders!, params.klasor!);
  return new Response(govde as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${params.klasor}.zip"`,
    },
  });
};
