// "Sevimli" tema görselleri: micro:bit'in 5×5 LED'lerinden esinlenen rakamlar (proje numarası) ve Bit maskotu.
// Hem Astro bileşenleri hem remark eklentisi kullanır; çizimler sayfada bir kez tanımlanır (<symbol>), her yerde <use> ile çağrılır.
// Renkler CSS'ten gelir (src/styles/sevimli.css): --led-yanik, --led-sonuk, --bit-govde …; yoksa buradaki yedekler kullanılır.

// 3×5 el yapımı rakamlar (1 = yanık LED)
const RAKAMLAR = [
  ['111', '101', '101', '101', '111'], // 0
  ['010', '110', '010', '010', '111'], // 1
  ['111', '001', '111', '100', '111'], // 2
  ['111', '001', '111', '001', '111'], // 3
  ['101', '101', '111', '001', '001'], // 4
  ['111', '100', '111', '001', '111'], // 5
  ['111', '100', '111', '101', '111'], // 6
  ['111', '001', '001', '010', '010'], // 7
  ['111', '101', '111', '101', '111'], // 8
  ['111', '101', '111', '001', '111'], // 9
];

const nokta = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;
const kisalt = (n) => Number(n.toFixed(2));

function rakamSembolu(i) {
  const yanik = [];
  const sonuk = [];
  RAKAMLAR[i].forEach((satir, r) =>
    [...satir].forEach((h, c) => (h === '1' ? yanik : sonuk).push(nokta(c + 0.5, r + 0.5, 0.38))),
  );
  return `<symbol id="led-d${i}" viewBox="0 0 3 5"><path class="led-s" d="${sonuk.join('')}"/><path class="led-a" d="${yanik.join('')}"/></symbol>`;
}

// Bit'in yüzü: [satır, sütun] çiftleri (5×5 ızgara)
const YUZLER = {
  mutlu: [[1, 1], [1, 3], [3, 0], [3, 4], [4, 1], [4, 2], [4, 3]],
  dusun: [[1, 1], [1, 3], [3, 2]],
  kutla: [[1, 1], [1, 3], [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [4, 1], [4, 2], [4, 3]],
};

function bitSembolu(yuz) {
  const yanik = new Set(YUZLER[yuz].map(([r, c]) => `${r},${c}`));
  const sonuk = [];
  const acik = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const d = nokta(kisalt(60 + (c - 2) * 9.4), kisalt(46 + (r - 2) * 9.4), 3.4);
      (yanik.has(`${r},${c}`) ? acik : sonuk).push(d);
    }
  }
  const altin = [24, 42, 60, 78, 96]
    .map((x) => `<circle class="bit-altin" cx="${x}" cy="79" r="5.6"/><circle class="bit-delik" cx="${x}" cy="79" r="2.3"/>`)
    .join('');
  const parilti =
    yuz === 'kutla'
      ? '<path class="bit-parilti" d="M20 15l1.7 4 4 1.7-4 1.7L20 26.4l-1.7-4-4-1.7 4-1.7z"/><path class="bit-parilti" d="M100 15l1.7 4 4 1.7-4 1.7-1.7 4-1.7-4-4-1.7 4-1.7z"/>'
      : '';
  return (
    `<symbol id="bit-${yuz}" viewBox="0 0 120 100">` +
    '<rect class="bit-govde" x="5" y="7" width="110" height="82" rx="16"/>' +
    '<rect class="bit-ic" x="9" y="11" width="102" height="74" rx="12"/>' +
    '<circle class="bit-dugme" cx="21" cy="46" r="7.5"/><circle class="bit-dugme" cx="99" cy="46" r="7.5"/>' +
    `<path class="bit-led-s" d="${sonuk.join('')}"/><path class="bit-led-a" d="${acik.join('')}"/>` +
    altin +
    parilti +
    '</symbol>'
  );
}

/** Sayfaya bir kez konan tanımlar (rakamlar + Bit yüzleri). */
export function ledSembolleri() {
  return RAKAMLAR.map((_, i) => rakamSembolu(i)).join('') + Object.keys(YUZLER).map(bitSembolu).join('');
}

/** İki basamaklı LED numarası (07, 31 …). */
export function ledSayiSvg(numara, sinif = '') {
  const s = String(Math.max(0, Math.min(99, Math.trunc(numara)))).padStart(2, '0');
  return (
    `<svg class="led-sayi ${sinif}" viewBox="-0.9 -0.9 8.8 6.8" aria-hidden="true" focusable="false">` +
    '<rect class="led-tahta" x="-0.9" y="-0.9" width="8.8" height="6.8" rx="1"/>' +
    `<use href="#led-d${s[0]}" x="0" y="0" width="3" height="5"/><use href="#led-d${s[1]}" x="4" y="0" width="3" height="5"/>` +
    '</svg>'
  );
}

/** Bit maskotu. yuz: mutlu | dusun | kutla */
export function bitSvg(yuz = 'mutlu', sinif = '') {
  return `<svg class="bit ${sinif}" viewBox="0 0 120 100" aria-hidden="true" focusable="false"><use href="#bit-${yuz in YUZLER ? yuz : 'mutlu'}"/></svg>`;
}

/** 45 (ya da n) LED'lik panel: 9 sütun, satır satır; her LED bir projeye karşılık gelir. */
export function ledPanelSvg(kimlikler, sinif = '') {
  const sut = 9;
  const satir = Math.ceil(kimlikler.length / sut);
  const noktalar = kimlikler
    .map((k, i) => `<circle class="led-nokta" data-led="${k}" cx="${(i % sut) + 0.5}" cy="${Math.floor(i / sut) + 0.5}" r="0.34"/>`)
    .join('');
  return (
    `<svg class="led-panel ${sinif}" viewBox="-0.6 -0.6 ${sut + 1.2} ${satir + 1.2}" aria-hidden="true" focusable="false">` +
    `<rect class="led-tahta" x="-0.6" y="-0.6" width="${sut + 1.2}" height="${satir + 1.2}" rx="0.9"/>${noktalar}</svg>`
  );
}
