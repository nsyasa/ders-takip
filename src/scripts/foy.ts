// Föy sayfası: onay kutuları, yazma alanları, ilerleme, "kaldığın yer", akordeon ve yazdırma.
import './icerik';
import {
  oku,
  adimlariKaydet,
  yaziKaydet,
  sonKaydet,
  depoKullanilabilir,
  foyDurumu,
  BOLUM_KIMLIGI,
  DEGISTI,
} from '../lib/depo';
import { cubukYaz, rozetYaz } from '../lib/arayuz';

const kok = document.querySelector<HTMLElement>('[data-foy-kok]');

if (kok) {
  const foy = kok.dataset.foy!;
  const toplam = Number(kok.dataset.adimToplam) || 0;
  const baslik = kok.dataset.baslik ?? foy;
  const kutular = [...kok.querySelectorAll<HTMLInputElement>('input.adim-kutu')];
  const alanlar = [...kok.querySelectorAll<HTMLTextAreaElement>('textarea[data-yaz]')];
  const bolumler = [...kok.querySelectorAll<HTMLDetailsElement>('details.bolum')];

  const uyari = kok.querySelector<HTMLElement>('[data-depo-uyari]');
  if (uyari && !depoKullanilabilir()) uyari.hidden = false;

  // — Kayıtlı durumu sayfaya yükle ———————————————————————————————————————
  function yukle(): void {
    const d = oku();
    const isaretli = new Set(d.adimlar[foy] ?? []);
    kutular.forEach((k) => (k.checked = isaretli.has(Number(k.dataset.adim))));
    alanlar.forEach((a) => {
      if (document.activeElement !== a) a.value = d.yazilar[foy]?.[a.dataset.yaz ?? ''] ?? '';
    });
    gostergeleriGuncelle();
  }

  function gostergeleriGuncelle(): void {
    const s = foyDurumu(oku(), foy, toplam);
    const metin = kok!.querySelector<HTMLElement>('[data-foy-adim-metin]');
    if (metin) metin.textContent = `${s.yapilan} / ${toplam} adım`;
    const rozet = kok!.querySelector<HTMLElement>('[data-foy-durum]');
    if (rozet) rozetYaz(rozet, s.durum);
    const durumKutusu = kok!.querySelector<HTMLElement>('.foy-durum');
    if (durumKutusu) cubukYaz(durumKutusu, toplam ? (s.yapilan / toplam) * 100 : 0);
  }

  // — "Kaldığın yer": son çalışılan bölüm —————————————————————————————————
  function bolumKimligi(oge: Element | null): string | undefined {
    const id = oge?.closest('details.bolum')?.querySelector('summary h2')?.id;
    return id && BOLUM_KIMLIGI.test(id) ? id : undefined;
  }
  function sonuIsle(oge: Element | null): void {
    sonKaydet({ foy, baslik, bolum: bolumKimligi(oge), zaman: new Date().toISOString() });
  }
  // Föyü açmak da "kaldığın yer" sayılır; aynı föydeyse bölüm bilgisi korunur.
  const onceki = oku().son;
  sonKaydet({
    foy,
    baslik,
    bolum: onceki?.foy === foy ? onceki.bolum : undefined,
    zaman: new Date().toISOString(),
  });

  // — Onay kutuları ——————————————————————————————————————————————————————
  kutular.forEach((k) => {
    k.addEventListener('change', () => {
      const isaretli = kutular.filter((x) => x.checked).map((x) => Number(x.dataset.adim));
      adimlariKaydet(foy, isaretli);
      sonuIsle(k);
      gostergeleriGuncelle();
    });
  });

  // — Yazma alanları: yazdıkça (gecikmeli) kaydedilir ————————————————————————
  const bekleyen = new Map<HTMLTextAreaElement, number>();
  function bosalt(a: HTMLTextAreaElement): void {
    const z = bekleyen.get(a);
    if (z === undefined) return;
    clearTimeout(z);
    bekleyen.delete(a);
    yaziKaydet(foy, a.dataset.yaz ?? '', a.value);
    gostergeleriGuncelle();
  }
  alanlar.forEach((a) => {
    a.addEventListener('input', () => {
      clearTimeout(bekleyen.get(a));
      bekleyen.set(a, window.setTimeout(() => bosalt(a), 500));
    });
    a.addEventListener('blur', () => {
      bosalt(a);
      sonuIsle(a);
    });
  });
  const hepsiniBosalt = () => [...bekleyen.keys()].forEach(bosalt);
  window.addEventListener('pagehide', hepsiniBosalt);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') hepsiniBosalt();
  });

  // — Akordeon ———————————————————————————————————————————————————————————
  const hepsiniAc = kok.querySelector<HTMLButtonElement>('[data-hepsini-ac]');
  function acKapatDugmesi(): void {
    if (!hepsiniAc) return;
    hepsiniAc.textContent = bolumler.every((b) => b.open) ? 'Tümünü kapat' : 'Tümünü aç';
  }
  if (hepsiniAc) {
    hepsiniAc.hidden = false;
    acKapatDugmesi();
    hepsiniAc.addEventListener('click', () => {
      const ac = !bolumler.every((b) => b.open);
      bolumler.forEach((b) => (b.open = ac));
      acKapatDugmesi();
    });
    bolumler.forEach((b) => b.addEventListener('toggle', acKapatDugmesi));
  }

  // Adres "#bölüm" ile geldiyse (arama sonucu, "kaldığın yerden devam et") o bölümü aç ve oraya git.
  function hashBolumunuAc(): void {
    let id = '';
    try {
      id = decodeURIComponent(location.hash.slice(1));
    } catch {
      return;
    }
    const hedef = id ? document.getElementById(id) : null;
    if (!hedef) return;
    for (let d = hedef.closest('details'); d; d = d.parentElement?.closest('details') ?? null) d.open = true;
    hedef.scrollIntoView();
  }
  hashBolumunuAc();
  window.addEventListener('hashchange', hashBolumunuAc);

  // — Yazdır: bütün bölümler açık, yazma alanları içeriğine göre uzar ————————————
  const yazdirDugmesi = kok.querySelector<HTMLButtonElement>('[data-yazdir]');
  if (yazdirDugmesi) {
    yazdirDugmesi.hidden = false;
    yazdirDugmesi.addEventListener('click', () => window.print());
  }
  let acikDurum: boolean[] = [];
  window.addEventListener('beforeprint', () => {
    acikDurum = bolumler.map((b) => b.open);
    bolumler.forEach((b) => (b.open = true));
    alanlar.forEach((a) => {
      a.style.height = 'auto';
      a.style.height = `${Math.max(a.scrollHeight, a.offsetHeight)}px`;
    });
  });
  window.addEventListener('afterprint', () => {
    bolumler.forEach((b, i) => (b.open = acikDurum[i] ?? b.open));
    alanlar.forEach((a) => (a.style.height = ''));
    acKapatDugmesi();
  });

  // — Başka sekmede / bfcache dönüşünde tazele ———————————————————————————————
  yukle();
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) yukle();
  });
  window.addEventListener('storage', yukle);
  window.addEventListener(DEGISTI, gostergeleriGuncelle);
}
