// İlerleme ve yazılanlar YALNIZ bu cihazın localStorage'ında durur. Sunucuya hiçbir şey gitmez.
// Bütün okuma/yazmalar try/catch içindedir: depolama kapalıysa (gizli sekme vb.) site yine çalışır,
// yalnız kayıt o sayfa açıkken bellekte kalır.

const ANAHTAR = 'ders-takip:v1';
export const DEGISTI = 'depo-degisti';

export interface SonKayit {
  foy: string; // "esp32/foy-06"
  baslik: string; // "Föy 6 — Telefondan Servo"
  bolum?: string; // son çalışılan bölümün başlık kimliği
  zaman: string;
}

export interface Depo {
  surum: 1;
  /** föy kimliği → işaretli onay kutularının sıra numaraları */
  adimlar: Record<string, number[]>;
  /** föy kimliği → { yazma alanı sırası → metin } */
  yazilar: Record<string, Record<string, string>>;
  son?: SonKayit;
}

export type Durum = 'baslamadi' | 'devam' | 'bitti';

// Bağlantı depoda tutulmaz: "ders/foy" kimliğinden üretilir. İçe aktarılan dosyadan gelen
// değerler href'e girmeden önce bu kalıplara uymak zorunda.
export const FOY_KIMLIGI = /^[\w-]+\/[\w-]+$/;
export const BOLUM_KIMLIGI = /^[\p{L}\p{N}_-]+$/u;

const bos = (): Depo => ({ surum: 1, adimlar: {}, yazilar: {} });
let bellek: Depo | null = null;

function gecerliMi(v: unknown): v is Depo {
  if (!v || typeof v !== 'object') return false;
  const d = v as Partial<Depo>;
  return d.surum === 1 && !!d.adimlar && typeof d.adimlar === 'object' && !!d.yazilar && typeof d.yazilar === 'object';
}

/** Depolama gerçekten kullanılabiliyor mu? */
export function depoKullanilabilir(): boolean {
  try {
    const t = '__ders-takip-deneme__';
    localStorage.setItem(t, '1');
    localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

export function oku(): Depo {
  try {
    const ham = localStorage.getItem(ANAHTAR);
    if (ham) {
      const v = JSON.parse(ham);
      if (gecerliMi(v)) {
        bellek = v;
        return v;
      }
    }
  } catch {
    /* depolama yok ya da bozuk */
  }
  return (bellek ??= bos());
}

function kaydet(d: Depo): boolean {
  bellek = d;
  let ok = true;
  try {
    localStorage.setItem(ANAHTAR, JSON.stringify(d));
  } catch {
    ok = false;
  }
  window.dispatchEvent(new CustomEvent(DEGISTI));
  return ok;
}

export function adimlariKaydet(foy: string, isaretliler: number[]): boolean {
  const d = oku();
  if (isaretliler.length) d.adimlar[foy] = [...isaretliler].sort((a, b) => a - b);
  else delete d.adimlar[foy];
  return kaydet(d);
}

export function yaziKaydet(foy: string, no: string, deger: string): boolean {
  const d = oku();
  const f = (d.yazilar[foy] ??= {});
  if (deger) f[no] = deger;
  else delete f[no];
  if (Object.keys(f).length === 0) delete d.yazilar[foy];
  return kaydet(d);
}

export function sonKaydet(son: SonKayit): boolean {
  const d = oku();
  d.son = son;
  return kaydet(d);
}

export interface FoyDurumu {
  durum: Durum;
  yapilan: number;
  toplam: number;
}

/** Bitti: bütün onay kutuları işaretli. Devam: en az bir işaret ya da yazılmış metin var. */
export function foyDurumu(d: Depo, foy: string, toplam: number): FoyDurumu {
  const yapilan = Math.min(d.adimlar[foy]?.length ?? 0, toplam || Infinity);
  const yazdi = Object.values(d.yazilar[foy] ?? {}).some((m) => m.trim() !== '');
  let durum: Durum = 'baslamadi';
  if (toplam > 0 && yapilan >= toplam) durum = 'bitti';
  else if (yapilan > 0 || yazdi) durum = 'devam';
  return { durum, yapilan, toplam };
}

export const DURUM_METNI: Record<Durum, string> = {
  baslamadi: 'Başlamadı',
  devam: 'Devam ediyor',
  bitti: 'Bitti',
};

// — Dışa / içe aktarma ———————————————————————————————————————————————

export function disaAktar(): string {
  return JSON.stringify(
    { uygulama: 'ders-takip', surum: 1, tarih: new Date().toISOString(), veri: oku() },
    null,
    2,
  );
}

export function iceAktar(metin: string): { ok: true } | { ok: false; hata: string } {
  let ham: unknown;
  try {
    ham = JSON.parse(metin);
  } catch {
    return { ok: false, hata: 'Dosya okunamadı: geçerli bir JSON değil.' };
  }
  const veri = (ham as { uygulama?: string; veri?: unknown })?.veri ?? ham;
  if (!gecerliMi(veri)) return { ok: false, hata: 'Bu dosya bir Ders Takip yedeği gibi görünmüyor.' };

  // Yalnız beklenen biçimdeki alanları al (bozuk/yabancı veri sızmasın).
  const temiz = bos();
  for (const [foy, liste] of Object.entries(veri.adimlar)) {
    if (Array.isArray(liste)) temiz.adimlar[foy] = liste.filter((n) => Number.isInteger(n) && n > 0);
  }
  for (const [foy, alanlar] of Object.entries(veri.yazilar)) {
    if (!alanlar || typeof alanlar !== 'object') continue;
    for (const [no, m] of Object.entries(alanlar)) {
      if (typeof m === 'string' && m) (temiz.yazilar[foy] ??= {})[no] = m.slice(0, 4000);
    }
  }
  const s = veri.son;
  if (s && FOY_KIMLIGI.test(String(s.foy)) && typeof s.baslik === 'string') {
    temiz.son = {
      foy: s.foy,
      baslik: s.baslik.slice(0, 200),
      bolum: typeof s.bolum === 'string' && BOLUM_KIMLIGI.test(s.bolum) ? s.bolum : undefined,
      zaman: typeof s.zaman === 'string' ? s.zaman.slice(0, 40) : '',
    };
  }
  return kaydet(temiz) ? { ok: true } : { ok: false, hata: 'Bu tarayıcı kayıt yapmaya izin vermiyor.' };
}

export function hepsiniSil(): void {
  bellek = bos();
  try {
    localStorage.removeItem(ANAHTAR);
  } catch {
    /* yok say */
  }
  window.dispatchEvent(new CustomEvent(DEGISTI));
}
