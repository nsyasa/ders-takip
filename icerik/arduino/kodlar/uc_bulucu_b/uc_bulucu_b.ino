const byte girisPini = 2;
const unsigned long haberlesmeHizi = 9600;
const unsigned int beklemeMs = 200;

void setup() {
  pinMode(girisPini, INPUT_PULLUP);
  Serial.begin(haberlesmeHizi);
}

void loop() {
  int okuma = digitalRead(girisPini);
  Serial.println(okuma);
  delay(beklemeMs);
}
