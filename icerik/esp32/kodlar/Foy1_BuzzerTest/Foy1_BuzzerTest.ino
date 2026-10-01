// FOY 1 - Etkinlik 2: Buzzer modulumu taniyorum
const int BUZZER_PIN = 33;

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  digitalWrite(BUZZER_PIN, HIGH);
  Serial.println("GPIO33 = HIGH  -> Buzzer otuyor mu?");
  delay(2000);

  digitalWrite(BUZZER_PIN, LOW);
  Serial.println("GPIO33 = LOW   -> Buzzer otuyor mu?");
  delay(2000);
}
