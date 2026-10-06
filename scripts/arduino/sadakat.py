# Sadakat denetimi: basılı PDF'teki her metin satırı üretilen proje sayfasında var mı?
#
#   python scripts/arduino/sadakat.py <kitap-klasoru> [icerik/arduino]
#
# Çizimin içindeki etiketler (breadboard delik adları, UNO pinleri) SVG'de kalır; onlar ayrıca sayılır.
# Kod satırları .ino dosyasından geldiği için denetlenmez. Hiçbir dosyaya yazmaz.
import json
import re
import sys
from pathlib import Path

import fitz

KITAP = Path(sys.argv[1])
ICERIK = Path(sys.argv[2] if len(sys.argv) > 2 else 'icerik/arduino')
ARA = json.loads(Path('.arduino-ara/kitap.json').read_text(encoding='utf-8'))


def kunye_metni(md):
    """Frontmatter'a taşınan künye satırlarını kitaptaki biçimiyle yeniden kurar (Malzemeler, Setten, Sınıf aracı, Önce)."""
    m = re.search(r'^malzemeler: (.+)$', md, re.M)
    malz = json.loads(m.group(1)) if m else []
    setten = ', '.join(x['ad'] for x in malz if not x['not'])
    arac = ', '.join(x['ad'] for x in malz if x['not'] == 'sınıf aracı')
    o = re.search(r'^onkosul: (.+)$', md, re.M)
    once = ', '.join(json.loads(o.group(1))) if o else ''
    return f'Malzemeler: {setten}. Setten: {setten}. Sınıf aracı: {arac}. Önce: {once}. Önce: Ana kitap {once}.'


def norm(s):
    s = re.sub(r'!\[[^\]]*\]\([^)\s]*(?: "([^"]*)")?\)', lambda m: m.group(1) or '', s)
    s = s.replace('Sen çiz (defterine):', 'Sen çiz:')
    s = re.sub(r'\]\((proje|genel):[^)]*\)', '', s)
    s = s.replace('\\', '').replace('ön sayfalardaki', '').replace('sonraki sayfada', 'aşağıda')
    return re.sub(r'[\W_]+', '', s).lower()


def sekil_metinleri(proje_id):
    p = next(x for x in ARA['projeler'] if x['id'] == proje_id)
    return {norm(m) for s in p['sayfalar'] for b in s['bloklar'] if b['t'] == 'sekil' for m in b['metinler']}


sys.stdout.reconfigure(encoding='utf-8')
# Künye tablosunun etiketleri ve zorluk adları frontmatter'a dönüşür (Kolay → Başlangıç)
KUNYE = {'öğreneceğin', 'süre', 'zorluk', 'kolay'}
toplam = eksik_toplam = 0
for pdf_ad, onek in (('Arduino_Baslangic_24_Proje_ekran.pdf', 'Proje'), ('Ek_Kitap.pdf', 'EK-K')):
    belge = fitz.open(KITAP / 'cikti' / pdf_ad)
    toc = belge.get_toc()
    for i, (_, baslik, sayfa) in enumerate(toc):
        m = re.match(r'(?:Proje|EK-K)(?: )?(\d+) · ', baslik)
        if not m:
            continue
        no = int(m.group(1)) + (24 if onek == 'EK-K' else 0)
        pid = f'p{no:02d}' if onek == 'Proje' else f'ekk{no - 24}'
        son = toc[i + 1][2] - 1 if i + 1 < len(toc) else belge.page_count
        md = (ICERIK / f'proje-{no:02d}.md').read_text(encoding='utf-8')
        mdn = norm(md + '\n' + kunye_metni(md))
        sekil = sekil_metinleri(pid)
        eksik = []
        for n in range(sayfa, son + 1):
            for b in belge[n - 1].get_text('dict')['blocks']:
                for l in b.get('lines', []):
                    sp = l['spans']
                    t = ''.join(s['text'] for s in sp).strip()
                    if not t or l['bbox'][1] > 790 or all('Courier' in s['font'] for s in sp if s['text'].strip()):
                        continue
                    if re.fullmatch(r'[\d\s]+', t) or re.match(r'(PROJE \d+|EK-K\d) /', t):
                        continue
                    toplam += 1
                    if norm(t) in mdn or norm(t) in sekil or norm(t) in KUNYE:
                        continue
                    eksik.append((n, t))
        eksik_toplam += len(eksik)
        if eksik:
            print(f'proje-{no:02d}: {len(eksik)} satır bulunamadı')
            for n, t in eksik[:6]:
                print(f'   s.{n}: {t[:110]}')
print(f'Toplam {toplam} satır; bulunamayan {eksik_toplam}.')

# ── Genel sayfalar: kitabın ön/arka sayfalarındaki satırlar genel/*.md içinde var mı? ──
# Alınmayanlar: içindekiler listeleri (s.3–4; yalnız "Bu yarıda öğreneceklerin" tablosu girer), arka kapak,
# Ek Kitap içindekiler tablosu ve "Yeni fikrim" çizim çerçevesi. Kitap paketine özgü kod arşivi tablosu siteye uyarlanır.
GENEL_SAYFALAR = {'Arduino_Baslangic_24_Proje_ekran.pdf': [2, 3, 4, *range(5, 14), *range(159, 166)], 'Ek_Kitap.pdf': [2, 15]}
genel_md = '\n'.join(p.read_text(encoding='utf-8') for p in sorted((ICERIK / 'genel').glob('*.md')))
genel_mdn = norm(genel_md)
genel_sekil = {norm(m) for g in ARA['genel'] for s in g['sayfalar'] for b in s['bloklar'] if b['t'] == 'sekil' for m in b['metinler']}
g_toplam = g_eksik = 0
for pdf_ad, sayfalar in GENEL_SAYFALAR.items():
    belge = fitz.open(KITAP / 'cikti' / pdf_ad)
    for n in sayfalar:
        eksik = []
        for b in belge[n - 1].get_text('dict')['blocks']:
            for l in b.get('lines', []):
                t = ''.join(s['text'] for s in l['spans']).strip()
                if not t or l['bbox'][1] > 790 or re.fullmatch(r'[\d\s·]+', t) or re.fullmatch(r'[A-ZÇĞİÖŞÜ /•]+', t):
                    continue  # sayfa numarası, şerit
                g_toplam += 1
                # Aralıklı yazılmış IDE mesajları boşluksuz karşılaştırılır
                if norm(t) in genel_mdn or norm(t) in genel_sekil or norm(t.replace(' ', '')) in genel_mdn:
                    continue
                eksik.append(t)
        g_eksik += len(eksik)
        if eksik:
            print(f'genel {pdf_ad[:12]} s.{n}: {len(eksik)} satır bulunamadı')
            for t in eksik[:40]:
                print(f'   {t[:110]}')
print(f'Genel sayfalar: toplam {g_toplam} satır; bulunamayan {g_eksik}.')
