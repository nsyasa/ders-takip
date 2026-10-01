// FOY 5 - Hata Avcisi: Bu kodda bilerek birakilmis bir hata var!
const int BUZZER_PIN = 33;
const unsigned long ARALIK = 1000;
bool buzzerAcik = false;

void setup() {
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  unsigned long sonDegisim = millis();
  unsigned long simdi = millis();

  if (simdi - sonDegisim >= ARALIK) {
    sonDegisim = simdi;
    buzzerAcik = !buzzerAcik;
    digitalWrite(BUZZER_PIN, buzzerAcik);
  }
}
