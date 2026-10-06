const byte sensorPini = A0;
const byte kirmizi = 9;
const byte yesil = 10;
const int kuru = 400;
const int islak = 400;
const int uyariEsigi = 30;
const unsigned long aralikMs = 1000;
unsigned long zaman = 0;

void setup() {
  pinMode(kirmizi, OUTPUT);
  pinMode(yesil, OUTPUT);
  Serial.begin(9600);
  zaman = millis();
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - zaman < aralikMs) return;
  zaman = simdi;
  int ham = analogRead(sensorPini);
  Serial.print("Ham: ");
  Serial.println(ham);
  if (kuru == islak) {
    digitalWrite(kirmizi, LOW);
    digitalWrite(yesil, LOW);
    Serial.println("Olcekleme hatasi");
    return;
  }
  int gosterge = constrain(map(ham, kuru, islak, 0, 100), 0, 100);
  Serial.print("Gosterge: ");
  Serial.println(gosterge);
  bool uyari = gosterge < uyariEsigi;
  digitalWrite(kirmizi, uyari);
  digitalWrite(yesil, !uyari);
}
