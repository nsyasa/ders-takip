// FOY 5 - Kod 5.3: millis() ile kesik alarm
const int BUTON_PIN = 26;
const int BUZZER_PIN = 33;
const int BUZZER_ACIK = HIGH;
const int BUZZER_KAPALI = LOW;
const unsigned long ARALIK = 1000;      // ms

unsigned long sonDegisim = 0;           // buzzer en son ne zaman degisti?
bool buzzerAcik = false;

void setup() {
  Serial.begin(115200);
  pinMode(BUTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, BUZZER_KAPALI);
}

void loop() {
  unsigned long simdi = millis();

  if (simdi - sonDegisim >= ARALIK) {   // 1 saniye doldu mu? (saate bak)
    sonDegisim = simdi;
    buzzerAcik = !buzzerAcik;           // acik ise kapat, kapali ise ac
    if (buzzerAcik) {
      digitalWrite(BUZZER_PIN, BUZZER_ACIK);
    } else {
      digitalWrite(BUZZER_PIN, BUZZER_KAPALI);
    }
  }

  if (digitalRead(BUTON_PIN) == LOW) {  // buton her turda okunur
    Serial.println("Butona basildi!");
  }
}
