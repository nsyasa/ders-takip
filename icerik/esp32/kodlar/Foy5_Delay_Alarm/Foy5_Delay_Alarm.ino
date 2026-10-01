// FOY 5 - Kod 5.2: delay() ile kesik alarm
const int BUTON_PIN = 26;
const int BUZZER_PIN = 33;
const int BUZZER_ACIK = HIGH;     // Foy 1 Etkinlik 2'deki sonucuna gore
const int BUZZER_KAPALI = LOW;

void setup() {
  Serial.begin(115200);
  pinMode(BUTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, BUZZER_KAPALI);
}

void loop() {
  digitalWrite(BUZZER_PIN, BUZZER_ACIK);
  delay(1000);                          // 1 saniye hicbir sey yapmadan bekle
  digitalWrite(BUZZER_PIN, BUZZER_KAPALI);
  delay(1000);                          // bir saniye daha bekle

  if (digitalRead(BUTON_PIN) == LOW) {
    Serial.println("Butona basildi!");
  }
}
