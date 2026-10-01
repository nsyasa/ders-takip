import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkDirective from 'remark-directive';
import remarkIcerik from './src/plugins/remark-icerik.mjs';
import remarkKod from './src/plugins/remark-kod.mjs';
import remarkBolumler from './src/plugins/remark-bolumler.mjs';
import { BASE } from './src/lib/ayar.mjs';

export default defineConfig({
  output: 'static',
  // GitHub Pages: BASE_PATH=/depo-adi  |  Cloudflare Pages / özel alan adı: boş bırak
  site: process.env.SITE_URL || undefined,
  base: BASE === '/' ? '/' : BASE.slice(0, -1),
  // 'ignore': geliştirme sunucusunda .zip ve .svg uç noktaları da sonunda / olmadan açılır.
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  markdown: {
    processor: unified({
      // Sıra önemli: önce direktifler, sonra kutular/yazma alanları/onay kutuları,
      // sonra kod blokları, en son bölümleri <details> içine alan eklenti.
      remarkPlugins: [remarkDirective, remarkIcerik, remarkKod, remarkBolumler],
      // Metni olduğu gibi göster (düz tırnak, üç nokta vb. değiştirilmesin).
      smartypants: false,
      gfm: true,
    }),
  },
});
