// sayfa.h - Kod 11.2: telefonda gorunen panel (HTML + CSS + JavaScript)
#pragma once

const char SAYFA[] = R"rawliteral(
<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ESP32 Çevre Paneli</title>
<style>
body{font-family:Arial,sans-serif;text-align:center;background:#f4f6f8;margin:0;padding:16px}
.kart{background:#fff;margin:12px auto;padding:14px;max-width:320px;border-radius:12px}
.deger{font-size:32px;font-weight:bold}
#durum{font-size:14px;color:#555}
</style></head><body>
<h2>ESP32 Çevre Paneli</h2>
<div class="kart">Sıcaklık<br><span id="sicaklik" class="deger">--</span> °C</div>
<div class="kart">Basınç<br><span id="basinc" class="deger">--</span> hPa</div>
<div class="kart">Aydınlanma<br><span id="lux" class="deger">--</span> lx</div>
<p id="durum">Bağlanıyor...</p>
<script>
function yaz(id, deger, basamak) {
  document.getElementById(id).textContent =
    (deger === null) ? "hata" : deger.toFixed(basamak);
}
async function guncelle() {
  try {
    const cevap = await fetch('/veri');
    const veri = await cevap.json();
    yaz('sicaklik', veri.sicaklik, 1);
    yaz('basinc', veri.basinc, 1);
    yaz('lux', veri.lux, 0);
    document.getElementById('durum').textContent =
      'Son güncelleme: ' + new Date().toLocaleTimeString('tr-TR');
  } catch (hata) {
    document.getElementById('durum').textContent =
      'BAĞLANTI YOK: ESP32 ağına bağlı mısın?';
  }
}
guncelle();
setInterval(guncelle, 2000);
</script></body></html>
)rawliteral";
