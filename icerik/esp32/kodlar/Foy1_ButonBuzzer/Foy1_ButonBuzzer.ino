// FOY 1 - Etkinlik 3: Butona bas, sesi duy
const int BUTON_PIN = 26;
const int BUZZER_PIN = 33;

// Etkinlik 2'deki sonucuna gore doldur:
// Aktif-HIGH modul: ACIK = HIGH, KAPALI = LOW
// Aktif-LOW modul : ACIK = LOW,  KAPALI = HIGH
const int BUZZER_ACIK = HIGH;
const int BUZZER_KAPALI = LOW;

void setup() {
  pinMode(BUTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, BUZZER_KAPALI);   // sessiz basla
}

void loop() {
  int butonDurumu = digitalRead(BUTON_PIN);

  if (butonDurumu == LOW) {                  // butona basildi
    digitalWrite(BUZZER_PIN, BUZZER_ACIK);
  } else {                                   // buton serbest
    digitalWrite(BUZZER_PIN, BUZZER_KAPALI);
  }
}
