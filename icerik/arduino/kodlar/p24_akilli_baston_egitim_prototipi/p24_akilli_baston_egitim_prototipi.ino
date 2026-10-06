const byte trigPini = 9;
const byte echoPini = 10;
const byte buzzerPini = 8;
const byte hazirlikUs = 2;
const byte tetiklemeUs = 10;
const float yakinEsigiCm = 20;
const float ortaEsigiCm = 50;
const float sesHiziCmUs = 0.0343;
const float enAzCm = 2;
const float enCokCm = 400;
const unsigned long zamanAsimiUs = 30000;
const unsigned long olcumAraligiMs = 100;
// Dizi sırası durumdur: 0 uzak, 1 orta, 2 yakın, 3 ölçüm yok
const unsigned long periyotlar[4] = {1000, 700, 200, 1000};
const unsigned long sesSureleri[4] = {0, 120, 100, 80};
const unsigned int frekanslar[4] = {0, 1000, 1400, 500};
byte durum = 3;
unsigned long sonOlcum = 0;
unsigned long ritimBaslangici = 0;

float mesafeOlc() {
  digitalWrite(trigPini, LOW);
  delayMicroseconds(hazirlikUs);
  digitalWrite(trigPini, HIGH);
  delayMicroseconds(tetiklemeUs);
  digitalWrite(trigPini, LOW);
  unsigned long sureUs = pulseIn(echoPini, HIGH, zamanAsimiUs);
  float cm = sureUs * sesHiziCmUs / 2; // 2: ses gider ve döner
  if (sureUs == 0 || cm < enAzCm || cm > enCokCm) return -1;
  return cm;
}

void setup() {
  pinMode(trigPini, OUTPUT);
  pinMode(echoPini, INPUT);
  pinMode(buzzerPini, OUTPUT);
  Serial.begin(9600);
  sonOlcum = millis();
  ritimBaslangici = sonOlcum;
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - sonOlcum >= olcumAraligiMs) {
    sonOlcum = simdi;
    float cm = mesafeOlc();
    simdi = millis();
    byte yeniDurum = 0;
    if (cm < 0) yeniDurum = 3;
    else if (cm < yakinEsigiCm) yeniDurum = 2;
    else if (cm < ortaEsigiCm) yeniDurum = 1;
    if (yeniDurum != durum) ritimBaslangici = simdi;
    durum = yeniDurum;
    Serial.print("Durum: ");
    Serial.println(durum);
  }
  if (simdi - ritimBaslangici >= periyotlar[durum]) ritimBaslangici = simdi;
  unsigned long faz = simdi - ritimBaslangici;
  bool sesVar = faz < sesSureleri[durum];
  if (durum == 3) sesVar = sesVar ||
    (faz >= 2 * sesSureleri[3] && faz < 3 * sesSureleri[3]);
  if (durum != 0 && sesVar) tone(buzzerPini, frekanslar[durum]);
  else noTone(buzzerPini);
}
