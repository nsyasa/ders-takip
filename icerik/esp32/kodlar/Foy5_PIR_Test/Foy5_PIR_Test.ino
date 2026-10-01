// FOY 5 - Kod 5.1: PIR ne zaman degisiyor?
const int PIR_PIN = 32;
int oncekiDurum = LOW;

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  Serial.println("PIR isiniyor: 60 saniye hareket etmeden bekle.");
}

void loop() {
  int durum = digitalRead(PIR_PIN);

  if (durum != oncekiDurum) {          // yalniz degisince yaz (Foy 1)
    Serial.print(millis() / 1000.0, 1);
    Serial.print(" s  PIR: ");
    if (durum == HIGH) {
      Serial.println("HAREKET (HIGH)");
    } else {
      Serial.println("sakin (LOW)");
    }
    oncekiDurum = durum;
  }
}
