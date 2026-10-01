// FOY 1 - Hata Avcisi: Bu kodda bilerek birakilmis bir hata var!
const int BUTON_PIN = 26;
const int BUZZER_PIN = 33;

void setup() {
  pinMode(BUTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
}

void loop() {
  int butonDurumu = digitalRead(BUTON_PIN);

  if (butonDurumu = LOW) {
    digitalWrite(BUZZER_PIN, HIGH);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }
}
