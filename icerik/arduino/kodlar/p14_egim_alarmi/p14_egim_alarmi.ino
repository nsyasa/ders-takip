const byte egimPini = 2;
const byte ledPini = 9;
const byte buzzerPini = 8;
const int egikDegeri = LOW;
const unsigned long beklemeMs = 300;
const unsigned long haberlesmeHizi = 9600;
int sonHam;
int kararli = HIGH;
unsigned long degisimZamani = 0;

void setup() {
  pinMode(egimPini, INPUT_PULLUP);
  pinMode(ledPini, OUTPUT);
  pinMode(buzzerPini, OUTPUT);
  if (egikDegeri == HIGH) kararli = LOW;
  sonHam = digitalRead(egimPini);
  degisimZamani = millis();
  Serial.begin(haberlesmeHizi);
  Serial.print("Ilk ham: ");
  Serial.println(sonHam);
}

void loop() {
  int ham = digitalRead(egimPini);
  unsigned long simdi = millis();
  if (ham != sonHam) {
    degisimZamani = simdi;
    sonHam = ham;
  }
  if (simdi - degisimZamani >= beklemeMs && ham != kararli) {
    kararli = ham;
    Serial.print("Durum: ");
    Serial.println(kararli);
  }
  if (kararli == egikDegeri) {
    digitalWrite(ledPini, HIGH);
    digitalWrite(buzzerPini, HIGH);
  } else {
    digitalWrite(ledPini, LOW);
    digitalWrite(buzzerPini, LOW);
  }
}
