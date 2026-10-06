const byte ledPini = 8;
const byte butonPini = 3;

void setup() {
  pinMode(ledPini, OUTPUT);
  pinMode(butonPini, INPUT);
}

void loop() {
  int butonDurumu = digitalRead(butonPini);
  if (butonDurumu == HIGH) {
    digitalWrite(ledPini, HIGH);
  } else {
    digitalWrite(ledPini, LOW);
  }
}
