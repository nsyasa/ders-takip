# Ana ekran kapak görselleri: şartlar ve promptlar

Üç ders kartı için üç kapak çizimi: **ESP32 Robot Kulübü**, **micro:bit Başlangıç**, **Arduino**.
Görselleri bu klasöre koyun (`esp32.png`, `microbit.png`, `arduino.png`); gerisini ben yaparım (3:2 kırpma, WebP'ye çevirme, küçültme, ders kartlarına ekleme).

## 1. Teknik şartlar (üçü için de aynı)

| Konu | İstenen |
|---|---|
| **Oran** | **3:2 yatay** (kartlar 3:2 kutuda gösterilir; kırpma gerekmesin) |
| **Boyut / çözünürlük** | **1536 × 1024 px** (GPT'nin "yatay" çıktısı). Daha büyükse sorun değil; **1200 px genişliğin altı olmasın** |
| **Dosya türü** | **PNG** (kayıpsız), sRGB, **şeffaflık yok**. JPG verirseniz kalite %90+ olsun |
| **Dosya boyutu** | 1–5 MB normaldir. Ben WebP'ye çevirip yaklaşık 70 KB'a (1000 px) ve 45 KB'a (760 px, dar ekranlar için) indiririm |
| **Dosya adı** | `esp32.png`, `microbit.png`, `arduino.png` |
| **Konum** | Bu klasör: `ders-sitesi-icerik\kapak-gorselleri\` (PNG/JPG dosyaları git'e girmez) |
| **Yazı** | **Hiç yazı, harf, rakam, logo, filigran, imza olmasın.** Başlığı sitede ben yazarım. Ekranlardaki, çiplerdeki, posterlerdeki, defterlerdeki yazılar da yok (soyut şekil olsun) |
| **Güvenli alan** | Asıl konu ortada ve büyük; kenarlardan yaklaşık %7 boşluk kalsın. Telefonda kart 350 px genişliğinde görünür: küçük ayrıntılar kaybolur, **güçlü silüet** gerekir |
| **Arka plan** | **Krem kâğıt zemini (#FFF8EA)**; kenarlarda sulu boya gibi yumuşakça dağılsın. Siyah/koyu zemin, çerçeve, kalın vinyet yok (site krem; koyu temada kart çerçeveyle ayrılır) |
| **Üçü birbirine benzesin** | Aynı çizim dili, aynı kâğıt dokusu, aynı çizgi kalınlığı, aynı ışık. Yalnız **baskın renk** ve konu değişsin |

## 2. Renkler

Üç kartı bir bakışta ayırt etmek için her dersin **baskın rengi** farklı; hepsinde ortak: lacivert ince çizgi `#14213D` ve krem zemin `#FFF8EA`.

| Ders | Baskın renk | Yardımcı renkler | Küçük vurgu |
|---|---|---|---|
| **ESP32 Robot Kulübü** | Kraliyet mavisi `#1F6FB2` | Gökyüzü camgöbeği `#6BC7EA` | Sıcak turuncu `#F28C28` (robotun tekerleği, çıkartma) |
| **micro:bit Başlangıç** | Turkuaz `#0E7C86` | Güneş sarısı `#F7C948` | Mercan kırmızısı `#FF4D4D` (LED kalbi) |
| **Arduino** | Sıcak turuncu `#E8590C` | Güneş sarısı `#F7C948` | Soğuk denge için turkuaz kart `#00838F` |

## 3. Ortak stil cümlesi (üç promptun **başına aynen** yapıştırın)

```text
Warm hand-painted children's book illustration: gouache and watercolor with soft thin ink outlines, visible paper grain, gentle color bleeding toward the edges, friendly rounded shapes, cozy daylight. Medium-wide scene, eye-level camera, uncluttered composition with ONE clear focal point and a strong silhouette that stays readable when the image is shrunk to a small card. Cream paper background (#FFF8EA) fading softly into all four edges of the image; no frame, no border, no dark vignette. Saturated but gentle pastel colors, navy (#14213D) thin outlines, no harsh black, no neon, no photorealism, no 3D render, no glossy plastic look. Characters are friendly students with natural proportions, correct hands and faces, diverse skin tones and hair. Absolutely NO text, letters, numbers, logos, brand marks, watermarks or signatures anywhere: screens, boards, posters, notebooks and chips show abstract shapes only. Landscape 3:2 image, 1536x1024 pixels.
```

## 4. Promptlar

### 4.1 ESP32 Robot Kulübü → `esp32.png`

Sahne: okul sonrası robot kulübü, üç ortaokul/lise öğrencisi; breadboard üstünde ESP32'li küçük tekerlekli robot; telefondan kontrol, dizüstünde grafik, havada kablosuz sinyal yayları.

```text
[ORTAK STİL CÜMLESİ]

Scene: an after-school robotics club room. Three middle- and high-school students (two girls and a boy, about 13 to 16 years old) lean over a worktable. On the table is a small friendly wheeled robot built on a breadboard: a black ESP32 development board (rectangular, with a silver metal antenna module at one end and two rows of pins), a tiny round OLED screen, a white dome-shaped motion sensor and a small blue servo motor, all connected with colorful jumper wires. One student holds a smartphone showing an abstract control panel (only sliders and round buttons, no text) and the robot is reacting; another student points at a laptop that shows an abstract line chart; soft dotted wireless-signal arcs float between the phone, the robot and the laptop. Background: shelves with small parts boxes, a sunny window, a toy robot hanging on the wall. Dominant colors: royal blue #1F6FB2 and sky cyan #6BC7EA, with small warm orange #F28C28 accents (the robot's wheels, a sticker), navy #14213D outlines, cream paper.
```

### 4.2 micro:bit Başlangıç → `microbit.png`  *(isteğe bağlı)*

Mevcut kitap kapağındaki sahne (kedili çocuk, yüzer bloklar, ışıklı kalp) **zaten bu stilde**; aynen kullanabilirim. Yeni bir sahne isterseniz aşağıdaki prompt; tutarlılık için **mevcut sahneyi referans görsel olarak yükleyin** (`ders-sitesi-icerik\icerik\microbit\gorseller\kapak.webp`) ve "aynı stilde" deyin.

```text
[ORTAK STİL CÜMLESİ]

Scene: a bright classroom corner. Two children (about 10 to 11 years old, a boy and a girl) sit at a table, delighted, looking at a small black micro:bit V2 board that stands upright on the table with a red LED heart on its 5x5 display. Draw the board simply: a black rounded rectangle, two small round buttons left and right of the display, a small gold touch pad at the top, and five big round gold pads along the bottom edge; no logos, no text. Colorful soft rounded puzzle-block shapes (red, yellow, teal, blue) float above it like code blocks, with small sparkle lines. A sleepy orange cat curled on the table, a cup of pencils, plants on a shelf, a window with daylight. Dominant colors: teal #0E7C86 and sunshine yellow #F7C948, a coral-red #FF4D4D LED glow, navy #14213D outlines, cream paper.
```

### 4.3 Arduino → `arduino.png`

Sahne: ilk devresini kuran öğrenci; Arduino UNO tarzı kart (logosuz), breadboard üstünde yanan üç LED, direnç, potansiyometre, buzzer; dizüstü; defterde elle çizilmiş devre.

```text
[ORTAK STİL CÜMLESİ]

Scene: a cheerful desk where one student (about 12 to 14 years old, curly hair, round glasses) builds a first electronic circuit and grins as it works. An Arduino UNO-style microcontroller board (teal-blue, drawn simply: a USB connector, one black chip, rows of black pin headers, no logo, no text) sits beside a white breadboard with three lit LEDs (red, yellow, green), a few small resistors, a round potentiometer knob and a small buzzer, joined with bright jumper wires. A USB cable runs to a laptop that shows an abstract blinking-wave pattern. On the desk: a notebook with a hand-drawn circuit sketch (just lines and symbols, no letters), a pencil, a magnifying glass, a small desk lamp and a tiny potted cactus. Dominant colors: warm orange #E8590C and sunny yellow #F7C948, with the teal board #00838F as the cool counterpoint, navy #14213D outlines, cream paper.
```

> `[ORTAK STİL CÜMLESİ]` yerine 3. bölümdeki kutunun içeriğini yapıştırın (üç promptta aynı kalsın).

## 5. İş akışı ve ipuçları

1. **Aynı sohbette sırayla üretin**; ilk beğendiğiniz görseli sonrakilerde referans verin: *"Bu görselle aynı stil, aynı kâğıt dokusu ve çizgi kalınlığı; yalnız sahneyi şuna değiştir: …"*.
2. Her görsel için **2–3 varyasyon** isteyin, en iyisini seçin. Fazla ayrıntı çıkarsa *"daha sade, daha az nesne, ana konu daha büyük"* deyin.
3. Çıktı oranı farklı gelirse: *"Aynı görseli 3:2 yatay, 1536x1024 olarak yeniden üret"* (kırpmak yerine yeniden ürettirin).
4. İndirirken **PNG** seçin; ekran görüntüsü almayın.

**Kabul kontrol listesi** (hepsi "evet" olmalı):
- [ ] Hiçbir yerde yazı, harf, rakam ya da logo yok (ekranlar ve defter dahil).
- [ ] Eller ve yüzler düzgün (fazla parmak, kayık göz yok).
- [ ] Donanım tanınır: ESP32 kartı (metal anten modülü), micro:bit (5×5 LED), Arduino (USB girişi + çip + pin sıraları).
- [ ] Baskın renk tabloya uyuyor; krem zemin kenarlara dağılıyor, koyu çerçeve yok.
- [ ] Küçültünce (350 px) ana konu hâlâ anlaşılıyor.
- [ ] Üç görsel birbirinin kardeşi gibi duruyor.

## 6. Görselleri verdikten sonra

Ben şunları yaparım (sizden bir şey gerekmez):

```bash
node scripts/kapak-ekle.mjs esp32   kapak-gorselleri/esp32.png   --alt "…"
node scripts/kapak-ekle.mjs microbit kapak-gorselleri/microbit.png --alt "…"
node scripts/kapak-ekle.mjs arduino kapak-gorselleri/arduino.png  --alt "…"
```

Her biri 3:2'ye getirir, `icerik/<ders>/gorseller/kapak.webp` (1000 px) ve `kapak-kucuk.webp` (760 px) üretir, `ders.json`'a `kapak` ve alt metni yazar. Alt metinleri görsellere bakarak ben yazarım. Ana sayfa üç kapak kartlı galeriye dönüşür; Arduino kartı "Yakında" rozetiyle görünür.
