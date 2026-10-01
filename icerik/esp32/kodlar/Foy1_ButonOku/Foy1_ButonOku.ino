// FOY 1 - Etkinlik 1: Buton pini ne okuyor?
const int BUTON_PIN = 26;

void setup() {
  Serial.begin(115200);
  pinMode(BUTON_PIN, INPUT_PULLUP);
}

void loop() {
  int butonDurumu = digitalRead(BUTON_PIN);

  if (butonDurumu == HIGH) {
    Serial.println("GPIO26 = HIGH (1)");
  } else {
    Serial.println("GPIO26 = LOW  (0)");
  }

  delay(300);
}
