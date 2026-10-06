const byte ledPinleri[5] = {8, 9, 10, 11, 12};
const byte butonPini = 2;
const byte durumSayisi = 5;
const byte yanipFazSayisi = 6;
const unsigned long hazirlikMs = 2000;
const unsigned long tumuKirmiziMs = 1000;
const unsigned long yayaMs = 3000;
const unsigned long yanipSonmeMs = 300;
const unsigned long titresimMs = 30;
const unsigned long yanipBitisMs = yanipFazSayisi * yanipSonmeMs;
const byte isiklar[5][5] = {
  {0,0,1,1,0}, {0,1,0,1,0}, {1,0,0,1,0},
  {1,0,0,0,1}, {1,0,0,0,0}
};
const unsigned long sureler[5] = {
  0, hazirlikMs, tumuKirmiziMs, yayaMs, yanipBitisMs + tumuKirmiziMs
};
byte durum = 0;
bool sonHam = HIGH;
bool kararli = HIGH;
bool yenidenHazir = false;
unsigned long sonDegisim = 0;
unsigned long durumBaslangici = 0;

void isikGoster(unsigned long simdi) {
  for (byte sira = 0; sira < 5; sira++)
    digitalWrite(ledPinleri[sira], isiklar[durum][sira]);
  if (durum == 4) {
    unsigned long gecen = simdi - durumBaslangici;
    bool yaniyor = gecen < yanipBitisMs && (gecen / yanipSonmeMs) % 2 == 1;
    digitalWrite(ledPinleri[4], yaniyor);
    digitalWrite(ledPinleri[3], gecen >= yanipBitisMs);
  }
}

void setup() {
  for (byte sira = 0; sira < 5; sira++)
    pinMode(ledPinleri[sira], OUTPUT);
  pinMode(butonPini, INPUT_PULLUP);
  sonHam = digitalRead(butonPini);
  kararli = sonHam;
  sonDegisim = millis();
  isikGoster(sonDegisim);
}

void loop() {
  unsigned long simdi = millis();
  bool ham = digitalRead(butonPini);
  if (ham != sonHam) {
    sonDegisim = simdi;
    sonHam = ham;
  }
  if (simdi - sonDegisim >= titresimMs) {
    kararli = ham;
    if (durum == 0 && kararli == HIGH) yenidenHazir = true;
    if (durum == 0 && kararli == LOW && yenidenHazir) {
      yenidenHazir = false;
      durum = 1;
      durumBaslangici = simdi;
    }
  }
  if (durum > 0 && simdi - durumBaslangici >= sureler[durum]) {
    durum++;
    if (durum == durumSayisi) durum = 0;
    durumBaslangici = simdi;
  }
  isikGoster(simdi);
}
