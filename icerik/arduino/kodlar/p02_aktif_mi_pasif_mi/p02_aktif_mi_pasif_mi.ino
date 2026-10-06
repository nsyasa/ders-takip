const byte buzzerPini = 8;
const unsigned int beklemeMs = 1000;

void setup() {
  pinMode(buzzerPini, OUTPUT);
}

void loop() {
  digitalWrite(buzzerPini, HIGH);
  delay(beklemeMs);
  digitalWrite(buzzerPini, LOW);
  delay(beklemeMs);
}
