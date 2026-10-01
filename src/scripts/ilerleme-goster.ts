// Ana sayfa, ders sayfası ve föy sayfasındaki ilerleme göstergelerini localStorage'dan doldurur.
// Sayfalar statik üretildiği için ilk HTML "hiç başlamadı" durumundadır; bu betik üstüne yazar.
import { oku, foyDurumu, DEGISTI, FOY_KIMLIGI, BOLUM_KIMLIGI } from '../lib/depo';
import { cubukYaz, rozetYaz } from '../lib/arayuz';

function dersleriGuncelle(): void {
  const d = oku();
  document.querySelectorAll<HTMLElement>('[data-ders-ilerleme]').forEach((kap) => {
    let adimlar: Record<string, number> = {};
    try {
      adimlar = JSON.parse(kap.dataset.adimlar ?? '{}');
    } catch {
      /* bozuk veri: boş say */
    }
    const foyler = Object.entries(adimlar);
    let bitti = 0;
    let yapilan = 0;
    let toplam = 0;
    for (const [foy, n] of foyler) {
      const s = foyDurumu(d, foy, n);
      toplam += n;
      yapilan += s.yapilan;
      if (s.durum === 'bitti') bitti += 1;
    }
    const yuzde = toplam ? (yapilan / toplam) * 100 : 0;
    cubukYaz(kap, yuzde);
    const metin = kap.querySelector<HTMLElement>('[data-ilerleme-metin]');
    if (metin) {
      metin.textContent =
        `${bitti} / ${foyler.length} föy bitti` + (yapilan > 0 ? ` · adımların %${Math.round(yuzde)}'i tamam` : '');
    }
  });
}

function foySatirlariniGuncelle(): void {
  const d = oku();
  document.querySelectorAll<HTMLElement>('[data-foy-satiri]').forEach((satir) => {
    const rozet = satir.querySelector<HTMLElement>('[data-durum-rozet]');
    if (!rozet) return;
    rozetYaz(rozet, foyDurumu(d, satir.dataset.foySatiri!, Number(satir.dataset.adim) || 0).durum);
  });
}

function onkosullariGuncelle(): void {
  const d = oku();
  document.querySelectorAll<HTMLElement>('[data-onkosul-foy]').forEach((rozet) => {
    rozetYaz(rozet, foyDurumu(d, rozet.dataset.onkosulFoy!, Number(rozet.dataset.adim) || 0).durum);
  });
  const uyari = document.querySelector<HTMLElement>('[data-onkosul-uyari]');
  if (uyari) {
    let liste: { id: string; adim: number }[] = [];
    try {
      liste = JSON.parse(uyari.dataset.onkosulUyari ?? '[]');
    } catch {
      /* boş say */
    }
    uyari.hidden = !liste.some((o) => foyDurumu(d, o.id, o.adim).durum !== 'bitti');
  }
}

function devamKartiniGuncelle(): void {
  const kart = document.querySelector<HTMLElement>('[data-devam]');
  if (!kart) return;
  const son = oku().son;
  let gecerli: string[] = [];
  try {
    gecerli = JSON.parse(kart.dataset.gecerli ?? '[]');
  } catch {
    /* boş say */
  }
  // Adres depodan değil, doğrulanmış kimlikten üretilir.
  if (!son || !FOY_KIMLIGI.test(son.foy) || !gecerli.includes(son.foy)) {
    kart.hidden = true;
    return;
  }
  const baglanti = kart.querySelector<HTMLAnchorElement>('[data-devam-link]');
  const baslik = kart.querySelector<HTMLElement>('[data-devam-baslik]');
  if (!baglanti || !baslik) return;
  const bolum = son.bolum && BOLUM_KIMLIGI.test(son.bolum) ? `#${encodeURIComponent(son.bolum)}` : '';
  baglanti.href = `${kart.dataset.taban ?? '/'}${son.foy}/${bolum}`;
  baslik.textContent = son.baslik;
  kart.hidden = false;
}

function hepsiniGuncelle(): void {
  dersleriGuncelle();
  foySatirlariniGuncelle();
  onkosullariGuncelle();
  devamKartiniGuncelle();
}

hepsiniGuncelle();
window.addEventListener(DEGISTI, hepsiniGuncelle);
// Geri düğmesiyle (bfcache) dönülünce ya da başka sekmede değişince tazele.
window.addEventListener('pageshow', (e) => {
  if (e.persisted) hepsiniGuncelle();
});
window.addEventListener('storage', hepsiniGuncelle);
