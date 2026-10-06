const byte potPini = A0;
const byte ledPini = 9;
const int okumaEnAz = 0;
const int okumaEnCok = 1023;
const byte parlaklikEnAz = 0;
const byte parlaklikEnCok = 255;
const byte beklemeMs = 10;

void setup() {
  pinMode(ledPini, OUTPUT);
}

void loop() {
  int okuma = analogRead(potPini);
  int parlaklik = map(okuma, okumaEnAz, okumaEnCok,
    parlaklikEnAz, parlaklikEnCok);
  analogWrite(ledPini, parlaklik);
  delay(beklemeMs);
}
