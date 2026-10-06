// Claude Code kancası (PostToolUse, Edit|Write): düzenlenen dosyaya göre hızlı denetim.
// Model token'ı harcamaz; yalnız HATA varsa çıkış kodu 2 ile Claude'a kısa bir rapor yazar.
//   node kontrol.mjs dogrula  icerik/** (.md, .json) düzenlenince scripts/dogrula.mjs çalışır
//   node kontrol.mjs check    src/** (.astro, .ts) düzenlenince astro check çalışır (arka plan, ardışık düzenlemelerde tek sefer)
// Tam `npm run build` burada ÇALIŞMAZ; yalnız aşama sonunda elle çalıştırılır.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const mod = process.argv[2];
const SINIR = 3000; // Claude'a yazılacak en fazla karakter
const ansiTemizle = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');

function hataYaz(metin) {
  process.stderr.write(metin.trim().slice(0, SINIR) + '\n');
  process.exit(2);
}

let girdi = {};
try {
  girdi = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch {
  /* stdin yoksa ya da JSON değilse: sessizce çık */
}
const dosya = girdi.tool_response?.filePath ?? girdi.tool_input?.file_path;
if (!dosya) process.exit(0);
const goreli = path.relative(KOK, path.resolve(dosya)).replace(/\\/g, '/');
if (goreli.startsWith('..')) process.exit(0);

if (mod === 'dogrula') {
  if (!/^icerik\/.+\.(md|json)$/.test(goreli)) process.exit(0);
  const r = spawnSync(process.execPath, ['scripts/dogrula.mjs'], { cwd: KOK, encoding: 'utf8', timeout: 60_000 });
  if (r.status === 0) process.exit(0);
  const satirlar = `${r.stdout}\n${r.stderr}`.split(/\r?\n/).filter((s) => s.trim() && !s.startsWith('UYARI'));
  hataYaz(`npm run dogrula hata verdi (${goreli} düzenlendi):\n${satirlar.join('\n')}`);
}

if (mod === 'check') {
  if (!/^src\/.+\.(astro|ts)$/.test(goreli)) process.exit(0);

  // Bilinen eski hatalar (taban): her düzenlemede yeniden rapor edilmesin. Düzeltilince listeden silin.
  let taban = [];
  try {
    taban = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'hooks', 'check-taban.json'), 'utf8')).yoksay ?? [];
  } catch {
    /* taban dosyası yoksa her hata raporlanır */
  }

  const astroCheck = () => {
    const r = spawnSync(
      process.execPath,
      [path.join(KOK, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'check', '--minimumSeverity', 'error'],
      { cwd: KOK, encoding: 'utf8', timeout: 180_000 },
    );
    const metin = ansiTemizle(`${r.stdout}\n${r.stderr}`);
    const hatalar = [...metin.matchAll(/^(.+?):(\d+):(\d+) - error (ts\(\d+\)|\w+): (.*)$/gm)].map((m) => ({
      anahtar: `${m[1].replace(/\\/g, '/')}|${m[4]}|${m[5]}`,
      satir: `${m[1]}:${m[2]}:${m[3]} ${m[4]} ${m[5]}`,
    }));
    const calisti = /Result \(\d+ files?\)/.test(metin);
    return { hatalar, calisti, metin };
  };

  // Ardışık düzenlemelerde tek denetim: çalışırken gelen düzenleme, bitince yeniden denetim ister.
  const kilit = path.join(os.tmpdir(), 'ders-takip-check.kilit');
  const bekleyen = path.join(os.tmpdir(), 'ders-takip-check.bekleyen');
  fs.writeFileSync(bekleyen, String(Date.now()) + Math.random());
  try {
    if (fs.existsSync(kilit) && Date.now() - fs.statSync(kilit).mtimeMs > 5 * 60_000) fs.rmSync(kilit);
    fs.writeFileSync(kilit, String(process.pid), { flag: 'wx' });
  } catch {
    process.exit(0); // başka bir denetim sürüyor; o bitince bekleyen damgayı görüp yeniden çalışır
  }

  let sonuc;
  try {
    let damga;
    do {
      damga = fs.readFileSync(bekleyen, 'utf8');
      sonuc = astroCheck();
    } while (fs.readFileSync(bekleyen, 'utf8') !== damga);
  } finally {
    fs.rmSync(kilit, { force: true });
  }

  if (!sonuc.calisti) {
    hataYaz(`astro check çalışmadı (${goreli} düzenlendi):\n${sonuc.metin.split(/\r?\n/).filter(Boolean).slice(-8).join('\n')}`);
  }
  const yeni = sonuc.hatalar.filter((h) => !taban.includes(h.anahtar));
  if (yeni.length === 0) process.exit(0);
  hataYaz(`astro check ${yeni.length} yeni hata buldu (${goreli} düzenlendi):\n${yeni.slice(0, 15).map((h) => h.satir).join('\n')}`);
}
