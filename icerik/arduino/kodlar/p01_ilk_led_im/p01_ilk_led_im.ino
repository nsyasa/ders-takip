const byte ledPini = 8;
const unsigned int yanmaMs = 1000;
const unsigned int sonmeMs = 1000;

void setup() {
  pinMode(ledPini, OUTPUT);
}

void loop() {
  digitalWrite(ledPini, HIGH);
  delay(yanmaMs);
  digitalWrite(ledPini, LOW);
  delay(sonmeMs);
}
