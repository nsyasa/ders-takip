// FOY 0 - Hata Avcisi: Bu kodda bilerek birakilmis bir hata var!
const int TEST_PIN = 34;

void setup() {
  Serial.begin(115200);
  pinMode(TEST_PIN, OUTPUT);
}

void loop() {
  digitalWrite(TEST_PIN, HIGH);
  Serial.println("LED yanmali...");
  delay(1000);
  digitalWrite(TEST_PIN, LOW);
  Serial.println("LED sonmeli...");
  delay(1000);
}
