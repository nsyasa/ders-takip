const byte butonPini = 2;
const int artis = 5;
const int hedef = 30;
const unsigned long beklemeMs = 30;
const unsigned long haberlesmeHizi = 9600;
int skor = 0;
int sonHam;
int kararli;
unsigned long degisimZamani = 0;

void setup() {
  pinMode(butonPini, INPUT);
  sonHam = digitalRead(butonPini);
  kararli = sonHam;
  Serial.begin(haberlesmeHizi);
  Serial.println("Skor: 0");
}

void loop() {
  int ham = digitalRead(butonPini);
  unsigned long simdi = millis();
  if (ham != sonHam) {
    degisimZamani = simdi;
    sonHam = ham;
  }
  if (simdi - degisimZamani >= beklemeMs && ham != kararli) {
    kararli = ham;
    if (kararli == HIGH) {
      skor += artis;
      Serial.print("Skor: ");
      Serial.println(skor);
      if (skor >= hedef) {
        Serial.println("HEDEF!");
        skor = 0;
        Serial.println("Skor: 0");
      }
    }
  }
}
