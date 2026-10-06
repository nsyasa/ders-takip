# Arduino kitabının ekran PDF'lerini okur; her projenin sayfalarını yapılı bloklara çevirir (ara katman).
#
#   python scripts/arduino/pdf-oku.py <kitap-klasoru> <cikis-klasoru>
#
# Kitap klasörüne YAZMAZ. Çıktı: <cikis>/kitap.json (projeler + genel sayfalar), <cikis>/sekiller/*.svg
# (PDF'ten vektör olarak kesilen çizimler), <cikis>/resimler/* (PDF'e gömülü resimler).
# Neden PDF? kitap/projeler/*.yaml basılı metnin bir kısmını tutmuyor ve yer yer eskide kaldı; sayfa
# başlıkları, kutular ve tablo başlıkları kitabın build_*.py betiklerine gömülü. Basılı PDF tek doğru kaynaktır.
# Gerekli: PyMuPDF (fitz).
import hashlib
import json
import re
import sys
from pathlib import Path

import fitz

KITAP = Path(sys.argv[1])
CIKIS = Path(sys.argv[2])
PDFLER = {
    'ana': KITAP / 'cikti' / 'Arduino_Baslangic_24_Proje_ekran.pdf',
    'ek': KITAP / 'cikti' / 'Ek_Kitap.pdf',
}
ALT_SINIR = 790  # bu y'nin altı sayfa altlığı (yazar • kitap adı, sayfa numarası)

# Dizgi işaretleri (kitabın build_*.py stilleri)
SERIT_RENK = 0x0A6E79
BASLIK_RENK = 0x0F2A49
GRI = 0x5B6B79
SATIR_NO_RENK = 0x3D4B59
KUTU_RENKLERI = {'#e8f3fa', '#f4f7fa', '#fff3dc', '#e6f5ec', '#fde8e8'}


def renk_hex(fill):
    return '#%02x%02x%02x' % tuple(round(c * 255) for c in fill)


def kalin(span):
    return 'Bold' in span['font']


def egik(span):
    return 'Italic' in span['font'] or 'Oblique' in span['font']


def kod_yazisi(span):
    return 'Courier' in span['font']


def ic_mi(r, kap, pay=2):
    """r dikdörtgeninin merkezi kap içinde mi?"""
    x = (r[0] + r[2]) / 2
    y = (r[1] + r[3]) / 2
    return kap[0] - pay <= x <= kap[2] + pay and kap[1] - pay <= y <= kap[3] + pay


def kesisir(a, b, pay=0):
    return not (a[2] + pay < b[0] or b[2] + pay < a[0] or a[3] + pay < b[1] or b[3] + pay < a[1])


def birlesim(a, b):
    return (min(a[0], b[0]), min(a[1], b[1]), max(a[2], b[2]), max(a[3], b[3]))


def aralikli_coz(metin):
    """Kod kutusunda harfler tek tek dizilir: 'c o n s t  b y t e' → 'const byte'."""
    if re.fullmatch(r'(\S( |$))+.*', metin) and '  ' in metin or re.fullmatch(r'(\S )+\S?', metin):
        return metin.replace('  ', '\x00').replace(' ', '').replace('\x00', ' ')
    return metin


def md_kacis(t):
    """Düz metindeki Markdown işaretlerini kaçışlar (kitap metni Markdown sanılmasın)."""
    return re.sub(r'([\\*_`\[\]<>])', r'\\\1', t)


def span_md(spanlar):
    """Satırdaki span'ları Markdown satır içi metnine çevirir (kalın, eğik, satır içi kod)."""
    parcalar = []
    for s in spanlar:
        t = s['text']
        if not t:
            continue
        if kod_yazisi(s):
            t = aralikli_coz(t)
        else:
            t = md_kacis(t)
        tur = 'kod' if kod_yazisi(s) else ('kalin' if kalin(s) else ('egik' if egik(s) else ''))
        if parcalar and parcalar[-1][0] == tur:
            parcalar[-1][1] += t
        else:
            parcalar.append([tur, t])
    md = ''
    for tur, t in parcalar:
        bas = len(t) - len(t.lstrip())
        son = len(t) - len(t.rstrip())
        ic = t.strip()
        if not ic:
            md += t
            continue
        isaret = {'kod': '`', 'kalin': '**', 'egik': '*'}.get(tur, '')
        md += t[:bas] + isaret + ic + isaret + (t[len(t) - son:] if son else '')
    return md


def satirlari_al(sayfa):
    satirlar = []
    for b in sayfa.get_text('dict')['blocks']:
        if b['type'] != 0:
            continue
        for l in b['lines']:
            sp = [s for s in l['spans'] if s['text'].strip()]
            if not sp:
                continue
            bbox = tuple(l['bbox'])
            if bbox[1] > ALT_SINIR:
                continue
            ilk = sp[0]
            duz = ''.join(s['text'] for s in sp).strip()
            satirlar.append({
                'bbox': bbox,
                'spanlar': sp,
                'duz': duz,
                'boy': round(ilk['size'], 1),
                'renk': ilk['color'],
                'kalin': all(kalin(s) for s in sp),
                'kod': all(kod_yazisi(s) for s in sp),
            })
    satirlar.sort(key=lambda s: (round(s['bbox'][1]), s['bbox'][0]))
    return satirlar


def satir_turu(s):
    if s['boy'] == 8.2 and s['renk'] == SERIT_RENK:
        return 'serit'
    if s['boy'] >= 20:
        return 'proje-baslik'
    if s['kalin'] and s['boy'] >= 12 and s['renk'] == BASLIK_RENK:
        return 'baslik'
    if s['boy'] == 11.0 and s['renk'] == GRI:
        return 'alt-baslik'
    if s['kod']:
        return 'kod'
    if s['boy'] == 8.8 and s['renk'] == SATIR_NO_RENK and re.fullmatch(r'\d+', s['duz']):
        return 'satir-no'
    if s['kalin'] and s['renk'] == SERIT_RENK and s['boy'] < 10:
        return 'kod-etiket'
    if s['boy'] <= 8.8 and s['renk'] == GRI:
        return 'not'
    return 'metin'


# ── Bölgeler: tablolar, kutular, kesikli çerçeveler, çizimler ───────────────
def bolgeleri_bul(sayfa, satirlar):
    tablolar = []
    for t in sayfa.find_tables().tables:
        ilk = (t.extract() or [[]])[0]
        # Gerçek tablonun ilk satırı (başlık) doludur; breadboard delik ızgarası gibi sahte tablolarda boştur
        if ilk and all(c and c.strip() for c in ilk):
            tablolar.append({'bbox': tuple(t.bbox), 'tablo': t})

    kutular, kesikli, cizimler = [], [], []
    for d in sayfa.get_drawings():
        r = tuple(d['rect'])
        if r[1] > ALT_SINIR - 8:
            continue
        w, h = r[2] - r[0], r[3] - r[1]
        dash = d.get('dashes')
        if dash and not re.fullmatch(r'\[\s*\]\s*0(\.0+)?', str(dash)) and w > 50 and h > 30:
            kesikli.append(r)
            continue
        if d.get('fill') and w > 100 and h > 15 and renk_hex(d['fill']) in KUTU_RENKLERI:
            kutular.append({'bbox': r, 'renk': renk_hex(d['fill'])})
            continue
        cizimler.append(r)

    # Tablo başlık bantları ve tablo çizgileri tablonun parçasıdır
    kutular = [k for k in kutular if not any(ic_mi(k['bbox'], t['bbox']) for t in tablolar)]
    cizimler = [c for c in cizimler if not any(ic_mi(c, t['bbox']) for t in tablolar)]
    # Sayfa genişliğinde tek çizgiler (ayırıcı) çizim sayılmaz
    cizimler = [c for c in cizimler if not ((c[2] - c[0]) > 300 and (c[3] - c[1]) < 2)]

    # Çizim kümeleri (yakın öğeler birleşir)
    kumeler = []
    for c in cizimler:
        kumeler.append({'bbox': c, 'n': 1})
    degisti = True
    while degisti:
        degisti = False
        for i in range(len(kumeler)):
            for j in range(i + 1, len(kumeler)):
                if kesisir(kumeler[i]['bbox'], kumeler[j]['bbox'], 10):
                    kumeler[i] = {'bbox': birlesim(kumeler[i]['bbox'], kumeler[j]['bbox']), 'n': kumeler[i]['n'] + kumeler[j]['n']}
                    del kumeler[j]
                    degisti = True
                    break
            if degisti:
                break
    sekiller = [k for k in kumeler if k['n'] >= 6 or ((k['bbox'][2] - k['bbox'][0]) * (k['bbox'][3] - k['bbox'][1]) > 4000 and k['n'] >= 3)]

    # İçinde çizim olan kutu bir şekildir (ör. RGB uç denemesi panelleri); kod kutusu ayrıdır
    yeni_kutular = []
    for k in kutular:
        ic_satir = [s for s in satirlar if ic_mi(s['bbox'], k['bbox'])]
        # Satır numarası rengi PDF'ten PDF'e değişir (Ek Kitap gri); kutudaki yalın sayı satırı numaradır
        if ic_satir and all(s['kod'] or re.fullmatch(r'\d+', s['duz']) or satir_turu(s) == 'kod-etiket' for s in ic_satir) and any(s['kod'] for s in ic_satir):
            k['kod'] = True
            yeni_kutular.append(k)
            continue
        icteki = [s for s in sekiller if kesisir(s['bbox'], k['bbox']) and ic_mi(s['bbox'], k['bbox'], 4)]
        ham = [c for c in cizimler if ic_mi(c, k['bbox'], 0)]
        if icteki or len(ham) >= 3:
            for s in icteki:
                sekiller.remove(s)
            sekiller.append({'bbox': k['bbox'], 'n': sum(s['n'] for s in icteki), 'kutu': k['renk']})
        else:
            yeni_kutular.append(k)
    kutular = yeni_kutular
    # Şekli büyüt: ona değen kablolar ve raylar (ör. breadboard'un solundaki UNO pinleri, GND rayı) aynı çizimdir
    for sk in sekiller:
        degisti = True
        while degisti:
            degisti = False
            for c in cizimler:
                if kesisir(c, sk['bbox'], 12) and birlesim(c, sk['bbox']) != sk['bbox']:
                    sk['bbox'] = birlesim(c, sk['bbox'])
                    degisti = True
    # Büyüyen şekiller çakışırsa birleşir
    degisti = True
    while degisti:
        degisti = False
        birlesik = []
        for sk in sekiller:
            es = next((b for b in birlesik if kesisir(b['bbox'], sk['bbox'])), None)
            if es:
                es['bbox'] = birlesim(es['bbox'], sk['bbox'])
                es['n'] += sk['n']
                es['kutu'] = es.get('kutu') or sk.get('kutu')
                degisti = True
            else:
                birlesik.append(sk)
        sekiller = birlesik
    # Şekle değen tablolar (ör. breadboard'un delik ızgarası) tablo değildir
    tablolar = [t for t in tablolar if not any(kesisir(t['bbox'], s['bbox']) for s in sekiller)]
    # Şeklin kapsadığı kutular (ör. çizimin zemin kutusu) da şekle aittir
    kutular = [k for k in kutular if not any(ic_mi(k['bbox'], s['bbox']) and (s['bbox'][2] - s['bbox'][0]) >= (k['bbox'][2] - k['bbox'][0]) - 1 for s in sekiller) or k.get('kod')]
    return tablolar, kutular, kesikli, sekiller


def pin_rehberi(sekil, satirlar):
    """Pin rehberi: solda kalın pin adı, sağda bağlantı yolu (ör. D8 | 220 Ω → LED anot)."""
    ic = [s for s in satirlar if ic_mi(s['bbox'], sekil['bbox'])]
    sol = [s for s in ic if s['bbox'][0] < 250 and s['kalin'] and len(s['duz']) <= 10]
    # Sağdaki yol yazısı çizimin içinde ya da hemen sağında olabilir (kablo yazıdan önce biter)
    sag = [s for s in satirlar if s['bbox'][0] >= min(250, sekil['bbox'][2] - 10) and not s['kalin'] and s['bbox'][0] >= sekil['bbox'][0] + 100
           and sekil['bbox'][1] - 4 <= (s['bbox'][1] + s['bbox'][3]) / 2 <= sekil['bbox'][3] + 4]
    if not sol or not sag or any(s not in sol and s not in sag for s in ic):
        return None
    ciftler = []
    for a in sol:
        ya = (a['bbox'][1] + a['bbox'][3]) / 2
        b = min(sag, key=lambda s: abs((s['bbox'][1] + s['bbox'][3]) / 2 - ya))
        if abs((b['bbox'][1] + b['bbox'][3]) / 2 - ya) > 8:
            return None
        ciftler.append([a['duz'], span_md(b['spanlar']).strip(), b])
    if len(ciftler) != len(sag):
        return None
    return ciftler


# ── Paragraflar ─────────────────────────────────────────────────────────────
MADDE = re.compile(r'^[•▪◦]\s*')
SIRALI = re.compile(r'^(\d{1,2})\.\s+')


def paragraflar(satirlar, kenar=None):
    """Satırları paragraf / madde / başlık bloklarına toplar."""
    bloklar = []
    acik = None
    sag_kenar = max([s['bbox'][2] for s in satirlar] + [kenar or 0])

    def sigardi(onceki_x1, s):
        # Satırın ilk sözcüğü önceki satıra sığardıysa önceki satır bilerek bitmiştir (kitapta ayrı cümle)
        # Kitapta sayı ile birimi bölünmez boşlukla bağlıdır ("1 saniye", "220 Ω"); PDF metninde bu düz boşluğa döner
        m = re.match(r'\d[\d.,]*\s+\S+|\S+', s['duz'])
        sozcuk = m.group(0) if m else ''
        return onceki_x1 + len(sozcuk) * s['boy'] * 0.55 + s['boy'] * 0.3 < sag_kenar - 2

    def kapat():
        nonlocal acik
        if acik:
            bloklar.append(acik)
            acik = None

    for s in satirlar:
        tur = satir_turu(s)
        md = span_md(s['spanlar']).strip()
        x0, y0, x1, y1 = s['bbox']
        if tur in ('baslik', 'serit', 'proje-baslik', 'alt-baslik', 'kod-etiket'):
            kapat()
            bloklar.append({'t': tur, 'md': md, 'y': y0, 'kx': (x0, x1, y1)})
            continue
        madde = MADDE.match(s['duz'])
        sirali = SIRALI.match(s['duz'])
        stil = 'not' if tur == 'not' else 'govde'
        if acik:
            ayni_stil = acik['stil'] == stil and abs(acik['boy'] - s['boy']) < 0.3
            bosluk = y0 - acik['son_y']
            girinti_tamam = abs(x0 - acik['x0']) <= 3 or (acik['t'] == 'madde' and 0 < x0 - acik['x0'] <= 16)
            etiket_satiri = s['kalin'] and not acik['kalin']
            yeni_baslar = re.match(r'(Yaz|Not|İpucu|Sen çiz):', s['duz']) or sigardi(acik['son_x1'], s)
            if ayni_stil and girinti_tamam and bosluk < s['boy'] * 0.8 and not madde and not sirali and not etiket_satiri and not acik.get('kalin_etiket') and not yeni_baslar:
                onceki = acik['md']
                ayrac = '' if re.search(r'[A-Za-zÇĞİÖŞÜçğıöşü]-$', onceki) else ' '
                acik['md'] = onceki + ayrac + md
                acik['son_y'] = y1
                acik['x1'] = max(acik['x1'], x1)
                acik['son_x1'] = x1
                acik['kalin'] = acik['kalin'] and s['kalin']
                continue
        kapat()
        if madde:
            md = MADDE.sub('', md, count=1)
            md = re.sub(r'^\*\*•\s*\*\*\s*', '', md)
            acik = {'t': 'madde', 'md': md, 'stil': stil}
        elif sirali:
            acik = {'t': 'sirali', 'no': int(sirali.group(1)), 'md': SIRALI.sub('', md, count=1), 'stil': stil}
        else:
            acik = {'t': 'p', 'md': md, 'stil': stil}
        # Tek satırlık kalın kısa satır (ör. "Sinyal") etiket gibidir; ardından gelen satır ayrı paragraf olur
        acik.update({'x0': x0, 'x1': x1, 'son_x1': x1, 'y': y0, 'son_y': y1, 'boy': s['boy'], 'kalin': s['kalin'], 'kalin_etiket': s['kalin'] and len(s['duz']) <= 40})
    kapat()
    # Ardışık madde/sıralı öğeleri listelere topla
    sonuc = []
    for b in bloklar:
        kx = b.pop('kx', None) or (b['x0'], b['x1'], b['son_y'])
        if b['t'] in ('madde', 'sirali'):
            sirali = b['t'] == 'sirali'
            if sonuc and sonuc[-1]['t'] == 'liste' and sonuc[-1]['sirali'] == sirali and sonuc[-1]['stil'] == b['stil']:
                sonuc[-1]['ogeler'].append(b['md'])
                k = sonuc[-1]['_k']
                sonuc[-1]['_k'] = (k[0], k[1], max(k[2], kx[1]), kx[2])
                continue
            sonuc.append({'t': 'liste', 'sirali': sirali, 'ilk': b.get('no', 1), 'ogeler': [b['md']], 'stil': b['stil'], 'y': b['y'],
                          '_k': (kx[0], b['y'], kx[1], kx[2])})
        else:
            for k in ('x0', 'x1', 'son_x1', 'son_y', 'boy', 'kalin_etiket'):
                b.pop(k, None)
            b['_k'] = (kx[0], b['y'], kx[1], kx[2])
            sonuc.append(b)
    return sonuc


# ── Kod ─────────────────────────────────────────────────────────────────────
def kod_dosyalari():
    dosyalar = {}
    for ino in (KITAP / 'kod').rglob('*.ino'):
        if 'hd44780-' in str(ino):
            continue
        klasor = ino.parent.relative_to(KITAP / 'kod').as_posix()
        satirlar = ino.read_text(encoding='utf-8').splitlines()
        dosyalar[klasor] = [re.sub(r'\s+', '', x) for x in satirlar]
    return dosyalar


KOD_DOSYALARI = None


def kod_blogu(kutu, satirlar, tercih):
    ic = [s for s in satirlar if ic_mi(s['bbox'], kutu['bbox'])]
    kod_satirlari = [s for s in ic if s['kod']]
    numaralar = [s for s in ic if not s['kod'] and re.fullmatch(r'\d+', s['duz'])]
    etiket = next((span_md(s['spanlar']).strip() for s in ic if satir_turu(s) == 'kod-etiket'), '')
    gosterilen = []
    for s in sorted(kod_satirlari, key=lambda s: s['bbox'][1]):
        yc = (s['bbox'][1] + s['bbox'][3]) / 2
        no = next((int(n['duz']) for n in numaralar if abs((n['bbox'][1] + n['bbox'][3]) / 2 - yc) < 4), None)
        gosterilen.append((no, re.sub(r'\s+', '', s['duz'])))
    nolar = [n['duz'] for n in numaralar]
    ilk = int(nolar[0]) if nolar else None
    son = int(nolar[-1]) if nolar else None
    # Hangi .ino? Gösterilen satırların çoğu aynı numarada eşleşen dosya
    en_iyi, puan = None, -1
    for klasor, dosya in KOD_DOSYALARI.items():
        p = sum(1 for no, t in gosterilen if no and no - 1 < len(dosya) and dosya[no - 1] == t)
        if klasor == tercih:
            p += 0.5
        if p > puan:
            en_iyi, puan = klasor, p
    dolu = [t for _, t in gosterilen if t]
    oran = (puan // 1) / max(1, len(dolu))
    return {
        't': 'kod', 'etiket': etiket, 'dosya': en_iyi if oran >= 0.6 else None, 'ilk': ilk, 'son': son,
        'eslesme': round(oran, 2), 'satir_sayisi': len(KOD_DOSYALARI.get(en_iyi, [])) if en_iyi else None,
        'y': kutu['bbox'][1],
    }


# ── Şekil kesme (vektör SVG) ve resimler ────────────────────────────────────
def _s(v):
    """Koordinat: 0,1 pt duyarlık, gereksiz sıfırlar yok."""
    t = f'{v:.1f}'.rstrip('0').rstrip('.')
    return '0' if t in ('-0', '') else t


def _renk(c):
    return renk_hex(c) if c else 'none'


def _xml(t):
    return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


def svg_kes(sayfa, bbox, ad):
    """Çizimi PDF'in çizim komutlarından ve metin konumlarından yeniden kurar (küçük, temaya boyanabilir SVG).

    PyMuPDF'in hazır SVG'si her harfi yol olarak gömer ve kırpılan alanın dışındakileri de taşır (~360 KB);
    bu çıktı daire/dikdörtgen/yol + gerçek <text> öğeleridir (~15–40 KB). Yazı genişliği textLength ile
    PDF'teki ölçüye sabitlenir: site yazı tipi farklı olsa da etiketler taşmaz. Boyama sitenin sema-boya.mjs'ine kalır.
    """
    r = (fitz.Rect(bbox) + (-4, -4, 4, 4)) & sayfa.rect
    ox, oy = r.x0, r.y0
    X = lambda x: _s(x - ox)
    Y = lambda y: _s(y - oy)
    parcalar = []
    for d in sayfa.get_drawings():
        dr = d['rect']
        # Yatay/dikey çizginin kutusu sıfır alanlıdır; fitz bunu "boş" sayıp kesişmez der → koordinatla denetle
        if not kesisir(tuple(dr), tuple(r)) or dr.y0 > ALT_SINIR - 8:
            continue
        ogeler = d['items']
        fill, stroke = d.get('fill'), d.get('color')
        if fill is None and stroke is None:
            continue
        nit = [f'fill="{_renk(fill)}"']
        if d.get('fill_opacity') not in (None, 1, 1.0) and fill is not None:
            nit.append(f'fill-opacity="{_s(d["fill_opacity"])}"')
        if stroke is not None and d.get('width'):
            nit.append(f'stroke="{_renk(stroke)}" stroke-width="{_s(d["width"])}"')
            kap = (d.get('lineCap') or (0,))[0]
            if kap:
                nit.append(f'stroke-linecap="{["butt", "round", "square"][int(kap)]}"')
            if d.get('lineJoin'):
                nit.append(f'stroke-linejoin="{["miter", "round", "bevel"][int(d["lineJoin"])]}"')
            dash = re.match(r'\[\s*([\d.\s]+)\]', str(d.get('dashes') or ''))
            if dash and dash.group(1).strip():
                nit.append(f'stroke-dasharray="{" ".join(_s(float(x)) for x in dash.group(1).split())}"')
        nit = ' '.join(nit)
        # Kesişen kabloları ayıran beyaz "boşluk" çizgisi zemin rengini alır (koyu temada beyaz çizgi görünmesin)
        if fill is None and stroke is not None and renk_hex(stroke) == '#ffffff':
            nit = nit.replace('stroke="#ffffff"', 'stroke="var(--zemin, #ffffff)"')
        # Siyah kablo ve GND rayı (kitapta #222222, 2–2,2 pt): sema-boya koyu temada da siyah bırakıp açık kenar çizer
        if fill is None and stroke is not None and renk_hex(stroke) == '#222222' and (d.get('width') or 0) >= 1.9:
            nit += ' data-kablo=""'
        turler = ''.join(i[0] for i in ogeler)
        # Yuvarlak köşeli dikdörtgen (breadboard zemini, kutular, pin hapı): <rect rx>; sema-boya zemin/kutu olarak boyar
        if re.fullmatch(r'(lc){4}|(cl){4}', turler) and all(
                abs(i[1].x - i[2].x) < 0.05 or abs(i[1].y - i[2].y) < 0.05 for i in ogeler if i[0] == 'l'):
            c = next(i for i in ogeler if i[0] == 'c')
            rx = min(abs(c[4].x - c[1].x), abs(c[4].y - c[1].y))
            parcalar.append(f'<rect x="{X(dr.x0)}" y="{Y(dr.y0)}" width="{_s(dr.width)}" height="{_s(dr.height)}" rx="{_s(rx)}" {nit}/>')
            continue
        # Daire (breadboard deliği, LED): dört eğri, kare kutu
        if turler == 'cccc' and abs(dr.width - dr.height) < 0.3:
            parcalar.append(f'<circle cx="{X((dr.x0 + dr.x1) / 2)}" cy="{Y((dr.y0 + dr.y1) / 2)}" r="{_s(dr.width / 2)}" {nit}/>')
            continue
        if turler == 're':
            q = ogeler[0][1]
            parcalar.append(f'<rect x="{X(q.x0)}" y="{Y(q.y0)}" width="{_s(q.width)}" height="{_s(q.height)}" {nit}/>')
            continue
        yol, son = [], None
        for it in ogeler:
            if it[0] == 'l':
                a, b = it[1], it[2]
                if son is None or abs(son.x - a.x) > 0.05 or abs(son.y - a.y) > 0.05:
                    yol.append(f'M{X(a.x)} {Y(a.y)}')
                yol.append(f'L{X(b.x)} {Y(b.y)}')
                son = b
            elif it[0] == 'c':
                a, c1, c2, b = it[1:5]
                if son is None or abs(son.x - a.x) > 0.05 or abs(son.y - a.y) > 0.05:
                    yol.append(f'M{X(a.x)} {Y(a.y)}')
                yol.append(f'C{X(c1.x)} {Y(c1.y)} {X(c2.x)} {Y(c2.y)} {X(b.x)} {Y(b.y)}')
                son = b
            elif it[0] == 're':
                q = it[1]
                yol.append(f'M{X(q.x0)} {Y(q.y0)}H{X(q.x1)}V{Y(q.y1)}H{X(q.x0)}Z')
                son = None
            elif it[0] == 'qu':
                q = it[1]
                yol.append(f'M{X(q.ul.x)} {Y(q.ul.y)}L{X(q.ur.x)} {Y(q.ur.y)}L{X(q.lr.x)} {Y(q.lr.y)}L{X(q.ll.x)} {Y(q.ll.y)}Z')
                son = None
        if d.get('closePath'):
            yol.append('Z')
        kural = ' fill-rule="evenodd"' if d.get('even_odd') and fill is not None else ''
        parcalar.append(f'<path d="{"".join(yol)}" {nit}{kural}/>')
    for b in sayfa.get_text('dict', clip=r)['blocks']:
        for l in b.get('lines', []):
            for sp in l['spans']:
                t = sp['text']
                if not t.strip() or not ic_mi(sp['bbox'], tuple(r), 0):
                    continue
                x, y = sp['origin']
                genislik = sp['bbox'][2] - sp['bbox'][0]
                agirlik = ' font-weight="bold"' if kalin(sp) else ''
                parcalar.append(
                    f'<text x="{X(x)}" y="{Y(y)}" font-size="{_s(sp["size"])}" fill="{renk_hex([((sp["color"] >> s_) & 255) / 255 for s_ in (16, 8, 0)])}"'
                    f'{agirlik} textLength="{_s(genislik)}" lengthAdjust="spacingAndGlyphs">{_xml(t.strip())}</text>')
    # Gösterim boyutu PDF ölçüsünün 1,6 katı (breadboard ~450 px; delik ve yazı okunur). Dar ekranda sütuna sığar.
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {_s(r.width)} {_s(r.height)}" '
           f'width="{round(r.width * 1.6)}" height="{round(r.height * 1.6)}" font-family="Arial, Helvetica, sans-serif">\n'
           + '\n'.join(parcalar) + '\n</svg>\n')
    (CIKIS / 'sekiller' / ad).write_text(svg, encoding='utf-8')
    return {'genislik': round(r.width), 'yukseklik': round(r.height), 'kirpma': [round(v, 2) for v in r]}


def resimleri_al(belge, sayfa):
    sonuc = []
    for bilgi in sayfa.get_image_info(xrefs=True):
        xref = bilgi.get('xref')
        bbox = tuple(bilgi['bbox'])
        if not xref or bbox[1] > ALT_SINIR:
            continue
        veri = belge.extract_image(xref)
        ham = veri['image']
        ad = hashlib.sha256(ham).hexdigest()[:12] + '.' + veri['ext']
        hedef = CIKIS / 'resimler' / ad
        if not hedef.exists():
            hedef.write_bytes(ham)
        sonuc.append({'t': 'resim', 'dosya': ad, 'piksel': [veri['width'], veri['height']], 'bbox': [round(v) for v in bbox], 'y': bbox[1]})
    return sonuc


def tablo_blogu(t):
    satirlar = []
    for r in t['tablo'].extract():
        satirlar.append([md_kacis(re.sub(r'[ \t]*\n[ \t]*', '\n', c or '').strip()) for c in r])
    return {'t': 'tablo', 'satirlar': satirlar, 'y': t['bbox'][1]}


# ── Sayfa ───────────────────────────────────────────────────────────────────
def sayfa_oku(belge, kaynak_pdf, sayfa_no, onek, tercih_kod):
    sayfa = belge[sayfa_no - 1]
    satirlar = satirlari_al(sayfa)
    tablolar, kutular, kesikli, sekiller = bolgeleri_bul(sayfa, satirlar)
    bloklar = []
    kullanilan = set()

    def al(kap, pay=2):
        sec = [s for s in satirlar if id(s) not in kullanilan and ic_mi(s['bbox'], kap, pay)]
        for s in sec:
            kullanilan.add(id(s))
        return sec

    for i, sk in enumerate(sekiller):
        if sk['n'] >= 40:
            # Büyük çizim (breadboard): çevresindeki etiketler (UNO, D8, GND rayı, a–e) ve alt notu çizime dahildir.
            # Sağ sütundaki açıklamalar çizimin sağ kenarından sonra başlar; onlar metin olarak kalır.
            genis = (sk['bbox'][0] - 25, sk['bbox'][1] - 25, sk['bbox'][2] + 25, sk['bbox'][3] + 25)
            for s in satirlar:
                etiket = s['kalin'] or s['boy'] <= 8.8 or len(s['duz']) <= 12
                if id(s) not in kullanilan and kesisir(s['bbox'], genis) and s['bbox'][0] < sk['bbox'][2] - 2 and len(s['duz']) <= 60                         and etiket and satir_turu(s) not in ('baslik', 'serit'):
                    sk['bbox'] = birlesim(sk['bbox'], s['bbox'])
        else:
            # Küçük çizim (ör. servo şeması): hemen üstündeki kısa kalın sütun başlıkları ("UNO", "Yüksüz SG90")
            for s in satirlar:
                if id(s) not in kullanilan and s['kalin'] and len(s['duz']) <= 30 and satir_turu(s) == 'metin' \
                        and sk['bbox'][1] - 25 <= s['bbox'][3] <= sk['bbox'][1] + 2 \
                        and s['bbox'][0] >= sk['bbox'][0] - 5 and s['bbox'][2] <= sk['bbox'][2] + 5:
                    sk['bbox'] = birlesim(sk['bbox'], s['bbox'])
        pin = pin_rehberi(sk, satirlar)
        ic = al(sk['bbox'], 1)
        if pin:
            for _, _, s in pin:
                kullanilan.add(id(s))
            bloklar.append({'t': 'pin', 'satirlar': [p[:2] for p in pin], 'y': sk['bbox'][1], '_k': sk['bbox']})
            continue
        ad = f'{onek}-s{sayfa_no:03d}-{i + 1}.svg'
        olcu = svg_kes(sayfa, sk['bbox'], ad)
        bloklar.append({'t': 'sekil', 'dosya': ad, **olcu, 'metinler': [s['duz'] for s in ic], 'kutu': sk.get('kutu'), 'y': sk['bbox'][1], '_k': sk['bbox']})
    for t in tablolar:
        al(t['bbox'])
        bloklar.append({**tablo_blogu(t), '_k': t['bbox']})
    for k in kesikli:
        ic = al(k)
        bloklar.append({'t': 'senciz', 'md': ' '.join(span_md(s['spanlar']).strip() for s in ic), 'y': k[1], '_k': k})
    for k in kutular:
        if k.get('kod'):
            bloklar.append({**kod_blogu(k, satirlar, tercih_kod), '_k': k['bbox']})
            al(k['bbox'])
            continue
        ic = al(k['bbox'])
        ic_bloklar = paragraflar(ic, k['bbox'][2] - 9)
        baslik = None
        if ic_bloklar and ic_bloklar[0]['t'] == 'p' and ic_bloklar[0].get('kalin') and len(ic_bloklar[0]['md']) <= 80:
            baslik = ic_bloklar.pop(0)['md'].strip('*').strip()
        for b in ic_bloklar:
            for a in ('kalin', 'y', '_k'):
                b.pop(a, None)
        bloklar.append({'t': 'kutu', 'renk': k['renk'], 'baslik': baslik, 'bloklar': ic_bloklar, 'y': k['bbox'][1], '_k': k['bbox']})
    kalan = [s for s in satirlar if id(s) not in kullanilan]
    # Çizim sayılmayan pin rehberi: aynı yükseklikte solda kalın pin adı, sağda bağlantı yolu
    ciftler = []
    for a in kalan:
        if not (a['kalin'] and len(a['duz']) <= 10):
            continue
        ya = (a['bbox'][1] + a['bbox'][3]) / 2
        es = [b for b in kalan if b is not a and b['bbox'][0] >= a['bbox'][2] + 40 and abs((b['bbox'][1] + b['bbox'][3]) / 2 - ya) < 5]
        ayni = [b for b in kalan if b is not a and b['bbox'][0] > a['bbox'][0] - 5 and abs((b['bbox'][1] + b['bbox'][3]) / 2 - ya) < 5]
        if len(es) == 1 and len(ayni) == 1 and not es[0]['kalin']:
            ciftler.append((a, es[0]))
    gruplar = []
    for a, b in ciftler:
        if gruplar and a['bbox'][1] - gruplar[-1][-1][0]['bbox'][3] < 40:
            gruplar[-1].append((a, b))
        else:
            gruplar.append([(a, b)])
    for g in gruplar:
        bloklar.append({'t': 'pin', 'satirlar': [[a['duz'], span_md(b['spanlar']).strip()] for a, b in g], 'y': g[0][0]['bbox'][1],
                        '_k': (g[0][0]['bbox'][0], g[0][0]['bbox'][1], max(b['bbox'][2] for _, b in g), g[-1][1]['bbox'][3])})
        for a, b in g:
            kullanilan.update((id(a), id(b)))
    kalan = [s for s in kalan if id(s) not in kullanilan]
    resimler = resimleri_al(belge, sayfa)
    for rsm in resimler:
        rsm['_k'] = tuple(rsm['bbox'])

    # İki sütunlu bölgeler: sağ sütunda (x >= SAG) yazı ya da öğe olan yükseklik aralıkları.
    # Bu bölgelerde önce sol sütun, sonra sağ sütun okunur; satırlar sütun sütun paragraf olur.
    SAG = 285
    araliklar = sorted([(s['bbox'][1], s['bbox'][3]) for s in kalan if s['bbox'][0] >= SAG] +
                       [(b['_k'][1], b['_k'][3]) for b in bloklar + resimler if b['_k'][0] >= SAG])
    bolgeler = []
    for a, b in araliklar:
        if bolgeler and a - bolgeler[-1][1] <= 25:
            bolgeler[-1][1] = max(bolgeler[-1][1], b)
        else:
            bolgeler.append([a, b])

    for bolge in bolgeler:
        uzadi = True
        while uzadi:
            uzadi = False
            for s in kalan:
                if s['bbox'][2] < SAG + 5 and bolge[1] < s['bbox'][1] <= bolge[1] + 20 and satir_turu(s) in ('metin', 'not'):
                    bolge[1] = s['bbox'][3]
                    uzadi = True

    def yer(k):
        orta = (k[1] + k[3]) / 2
        tam_genislik = k[0] < SAG - 40 and k[2] > SAG + 40 and k[2] - k[0] > 400
        for i, (a, b) in enumerate(bolgeler):
            if a - 2 <= orta <= b + 2 and not tam_genislik:
                return i, (1 if k[0] >= SAG - 5 else 0)
        return None, 0

    gruplar = {}
    for s in kalan:
        gruplar.setdefault(yer(s['bbox']), []).append(s)
    for (bolge, taraf), grup in gruplar.items():
        kenar = (SAG - 8) if bolge is not None and taraf == 0 else 541
        for b in paragraflar(grup, kenar):
            b.pop('kalin', None)
            bloklar.append(b)
    bloklar.extend(resimler)

    def sira(b):
        i, taraf = yer(b['_k'])
        return (bolgeler[i][0], taraf, b['_k'][1]) if i is not None else (b['_k'][1], 0, b['_k'][1])
    bloklar.sort(key=sira)
    for b in bloklar:
        b.pop('y', None)
        b.pop('_k', None)
    serit = next((b['md'].strip('*') for b in bloklar if b['t'] == 'serit'), '')
    return {'sayfa': sayfa_no, 'serit': serit, 'bloklar': [b for b in bloklar if b['t'] != 'serit']}


def main():
    global KOD_DOSYALARI
    (CIKIS / 'sekiller').mkdir(parents=True, exist_ok=True)
    (CIKIS / 'resimler').mkdir(parents=True, exist_ok=True)
    for f in (CIKIS / 'sekiller').glob('*.svg'):
        f.unlink()
    KOD_DOSYALARI = kod_dosyalari()
    projeler, genel = [], []
    for anahtar, pdf in PDFLER.items():
        belge = fitz.open(pdf)
        toc = belge.get_toc()
        for i, (duzey, baslik, sayfa) in enumerate(toc):
            son = (toc[i + 1][2] - 1) if i + 1 < len(toc) else belge.page_count
            m = re.match(r'Proje (\d+) · (.+)', baslik) or re.match(r'EK-K(\d) · (.+)', baslik)
            if m:
                no = int(m.group(1))
                pid = f'p{no:02d}' if anahtar == 'ana' else f'ekk{no}'
                tercih = next((k for k in KOD_DOSYALARI if k.split('/')[-1].startswith(pid + '_') and '/deneyler' not in k and not k.startswith('deneyler')), None)
                sayfalar = [sayfa_oku(belge, pdf, n, pid, tercih) for n in range(sayfa, son + 1)]
                projeler.append({'id': pid, 'kaynak': anahtar, 'baslik_toc': m.group(2), 'sayfalar': sayfalar})
            elif not baslik.startswith('Bölüm') and sayfa > 1 and duzey == 1:
                genel.append({'kaynak': anahtar, 'baslik': baslik, 'sayfa': sayfa,
                              'sayfalar': [sayfa_oku(belge, pdf, n, f'{anahtar}-genel', None) for n in range(sayfa, min(son, sayfa + 3) + 1)]})
        belge.close()
    cikti = {'projeler': projeler, 'genel': genel}
    (CIKIS / 'kitap.json').write_text(json.dumps(cikti, ensure_ascii=False, indent=1), encoding='utf-8')
    sekil = sum(1 for p in projeler for s in p['sayfalar'] for b in s['bloklar'] if b['t'] == 'sekil')
    kod = [b for p in projeler for s in p['sayfalar'] for b in s['bloklar'] if b['t'] == 'kod']
    print(f'{len(projeler)} proje, {len(genel)} genel sayfa, {sekil} şekil, {len(kod)} kod kutusu '
          f'({sum(1 for k in kod if not k["dosya"])} eşleşmeyen)')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
