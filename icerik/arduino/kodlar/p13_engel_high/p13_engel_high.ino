const byte irPini = 2;
const byte ledPini = 9;
const int engelDegeri = HIGH;
const int sayacSiniri = 999;
const unsigned long beklemeMs = 40;
const unsigned long haberlesmeHizi = 9600;
int sayac = 0;
int sonHam;
int kararli;
unsigned long degisimZamani = 0;

void setup() {
  pinMode(irPini, INPUT);
  pinMode(ledPini, OUTPUT);
  sonHam = digitalRead(irPini);
  kararli = sonHam;
  Serial.begin(haberlesmeHizi);
  Serial.println("Sayac: 0");
  Serial.print("Ham: ");
  Serial.println(sonHam);
}

void loop() {
  int ham = digitalRead(irPini);
  unsigned long simdi = millis();
  if (ham != sonHam) {
    degisimZamani = simdi;
    sonHam = ham;
  }
  if (simdi - degisimZamani >= beklemeMs && ham != kararli) {
    kararli = ham;
    Serial.print("Durum: ");
    Serial.println(kararli);
    if (kararli == engelDegeri) {
      if (sayac < sayacSiniri) sayac++;
      Serial.print("Sayac: ");
      Serial.println(sayac);
    }
  }
  if (kararli == engelDegeri) {
    digitalWrite(ledPini, HIGH);
  } else {
    digitalWrite(ledPini, LOW);
  }
}
