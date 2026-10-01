// Hem astro.config.mjs hem remark eklentileri (Node tarafı) kullanır.
// GitHub Pages'te site "/depo-adi/" altında yayınlanır; BASE_PATH ortam değişkeni bunu belirler.

/** "depo", "/depo/", "" → "/depo/" ya da "/" */
export function tabanYolu(ham = process.env.BASE_PATH) {
  const temiz = String(ham ?? '').trim().replace(/^\/+|\/+$/g, '');
  return temiz ? `/${temiz}/` : '/';
}

export const BASE = tabanYolu();

/** Taban yoluna göre mutlak yol üretir: yol('esp32/') → "/depo/esp32/" */
export function yolYap(p) {
  return BASE + String(p).replace(/^\/+/, '');
}
