const byte buzzerPini = 8;
const unsigned int frekansHz = 1000;
const unsigned int sesMs = 300;
const unsigned int sessizlikMs = 700;

void setup() {
  pinMode(buzzerPini, OUTPUT);
}

void loop() {
  tone(buzzerPini, frekansHz);
  delay(sesMs);
  noTone(buzzerPini);
  delay(sessizlikMs);
}
