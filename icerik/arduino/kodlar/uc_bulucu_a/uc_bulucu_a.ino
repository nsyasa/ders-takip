const byte butonPini = 2;
const byte ledPini = 8;

void setup() {
  pinMode(butonPini, INPUT);
  pinMode(ledPini, OUTPUT);
}

void loop() {
  int okuma = digitalRead(butonPini);
  digitalWrite(ledPini, okuma);
}
