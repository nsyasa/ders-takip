// İlerleme çubuğu ve durum rozeti için küçük DOM yardımcıları (istemci tarafı).
import { DURUM_METNI, type Durum } from './depo';

export function cubukYaz(kap: ParentNode, yuzde: number): void {
  const cubuk = kap.querySelector<HTMLElement>('[data-ilerleme-cubuk]');
  if (!cubuk) return;
  const y = Math.max(0, Math.min(100, Math.round(yuzde)));
  cubuk.setAttribute('aria-valuenow', String(y));
  const dolgu = cubuk.querySelector<HTMLElement>('.ilerleme-dolgu');
  if (dolgu) dolgu.style.width = `${y}%`;
}

export function rozetYaz(el: HTMLElement, durum: Durum): void {
  el.className = `rozet rozet-${durum}`;
  el.textContent = DURUM_METNI[durum]; // simge CSS ile (.rozet::before); emoji/sembol glifi kullanılmaz
}
