// FOY 5 - Kod 5.4: Iki durumlu alarm sistemi
const int PIR_PIN = 32;
const int BUTON_PIN = 26;
const int BUZZER_PIN = 33;
const int BUZZER_ACIK = HIGH;
const int BUZZER_KAPALI = LOW;

const int NORMAL = 0;                   // sistemin olasi durumlari
const int ALARM = 1;
int durum = NORMAL;

unsigned long sonDegisim = 0;
bool buzzerAcik = false;

void buzzerYaz(bool acik) {
  if (acik) {
    digitalWrite(BUZZER_PIN, BUZZER_ACIK);
  } else {
    digitalWrite(BUZZER_PIN, BUZZER_KAPALI);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  pinMode(BUTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  buzzerYaz(false);
  Serial.println("Sistem NORMAL. PIR icin 60 s bekle.");
}

void loop() {
  unsigned long simdi = millis();

  if (durum == NORMAL) {
    if (digitalRead(PIR_PIN) == HIGH) {         // hareket -> ALARM
      durum = ALARM;
      Serial.println("ALARM! Hareket algilandi.");
    }
  } else if (durum == ALARM) {
    if (simdi - sonDegisim >= 300) {            // kesik alarm sesi
      sonDegisim = simdi;
      buzzerAcik = !buzzerAcik;
      buzzerYaz(buzzerAcik);
    }
    if (digitalRead(BUTON_PIN) == LOW) {        // buton -> NORMAL
      durum = NORMAL;
      buzzerAcik = false;
      buzzerYaz(false);
      Serial.println("Alarm sifirlandi. Sistem NORMAL.");
    }
  }
}
