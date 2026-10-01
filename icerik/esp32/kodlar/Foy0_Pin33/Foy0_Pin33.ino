// FOY 0 - Etkinlik 3: HIGH kac volttur?
const int TEST_PIN = 33;   // Sinif pin planinda buzzer pini

void setup() {
  Serial.begin(115200);
  pinMode(TEST_PIN, OUTPUT);
}

void loop() {
  digitalWrite(TEST_PIN, HIGH);
  Serial.println("GPIO33 = HIGH  -> simdi olc");
  delay(5000);

  digitalWrite(TEST_PIN, LOW);
  Serial.println("GPIO33 = LOW   -> simdi olc");
  delay(5000);
}
