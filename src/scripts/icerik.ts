// Föy ve genel sayfalarda ortak: kod kopyalama ve görseli büyütme.
// Düğmeler yalnız bu betik çalışırsa görünür (JS yoksa işe yaramaz düğme gösterilmez).

function panoyaKopyala(metin: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(metin).then(
      () => true,
      () => eskiKopyala(metin),
    );
  }
  return Promise.resolve(eskiKopyala(metin));
}

function eskiKopyala(metin: string): boolean {
  const t = document.createElement('textarea');
  t.value = metin;
  t.setAttribute('readonly', '');
  t.style.position = 'fixed';
  t.style.opacity = '0';
  document.body.append(t);
  t.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  t.remove();
  return ok;
}

document.querySelectorAll<HTMLButtonElement>('[data-kopyala]').forEach((dugme) => {
  dugme.hidden = false;
  const durum = document.createElement('span');
  durum.className = 'gorunmez';
  durum.setAttribute('role', 'status');
  dugme.after(durum);
  let zaman = 0;
  dugme.addEventListener('click', async () => {
    const kod = dugme.closest('.kod')?.querySelector('code');
    const ok = await panoyaKopyala(kod?.textContent ?? '');
    if (!ok && kod) {
      // Pano kullanılamıyorsa kodu seç; kullanıcı Ctrl+C ile kendisi kopyalasın.
      const secim = getSelection();
      const aralik = document.createRange();
      aralik.selectNodeContents(kod);
      secim?.removeAllRanges();
      secim?.addRange(aralik);
    }
    dugme.textContent = ok ? 'Kopyalandı' : 'Kod seçildi: Ctrl+C';
    durum.textContent = ok ? 'Kod panoya kopyalandı.' : 'Kod otomatik kopyalanamadı; seçildi, Ctrl+C ile kopyalayabilirsin.';
    clearTimeout(zaman);
    zaman = window.setTimeout(() => {
      dugme.textContent = 'Kopyala';
      durum.textContent = '';
    }, 2000);
  });
});

// Görsel: dokununca büyük görünüm (JS yoksa bağlantı SVG'yi yeni sekmede açar).
const baglantilar = document.querySelectorAll<HTMLAnchorElement>('a.gorsel-link');
if (baglantilar.length > 0 && typeof HTMLDialogElement !== 'undefined') {
  const dialog = document.createElement('dialog');
  dialog.className = 'gorsel-dialog';
  dialog.setAttribute('aria-label', 'Görselin büyük görünümü');
  const kapat = document.createElement('button');
  kapat.type = 'button';
  kapat.className = 'gorsel-dialog-kapat';
  kapat.textContent = 'Kapat';
  const kaydir = document.createElement('div');
  kaydir.className = 'gorsel-dialog-kaydir';
  kaydir.tabIndex = 0;
  dialog.append(kapat, kaydir);
  document.body.append(dialog);

  kapat.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  baglantilar.forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const ad = a.closest('figure')?.querySelector('.gorsel-ad')?.textContent ?? '';
      const sema = a.querySelector('svg'); // şemalar satır içi SVG: aynısı büyük gösterilir
      let kopya: Element;
      if (sema) {
        kopya = sema.cloneNode(true) as SVGElement;
        kopya.removeAttribute('aria-hidden');
        kopya.removeAttribute('width');
        kopya.removeAttribute('height');
        kopya.setAttribute('role', 'img');
        kopya.setAttribute('aria-label', ad || 'Şema');
      } else {
        const resim = document.createElement('img');
        resim.src = a.href;
        resim.alt = a.querySelector('img')?.alt ?? '';
        kopya = resim;
      }
      kaydir.replaceChildren(kopya);
      dialog.showModal();
      kapat.focus();
    });
  });
}
