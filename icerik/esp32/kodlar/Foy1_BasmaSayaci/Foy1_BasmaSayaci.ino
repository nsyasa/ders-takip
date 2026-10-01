// FOY 1 - Deney: Kac kez bastim?
const int BUTON_PIN = 26;

int oncekiDurum = HIGH;   // buton baslangicta serbest
int basmaSayisi = 0;

void setup() {
  Serial.begin(115200);
  pinMode(BUTON_PIN, INPUT_PULLUP);
}

void loop() {
  int simdikiDurum = digitalRead(BUTON_PIN);

  if (simdikiDurum != oncekiDurum) {   // durum degisti mi?
    if (simdikiDurum == LOW) {         // degisim bir "basma" mi?
      basmaSayisi++;
      Serial.print("Basma sayisi: ");
      Serial.println(basmaSayisi);
    }
    // delay(30);   // Deney 2: bu satirin basindaki // isaretini sil
  }

  oncekiDurum = simdikiDurum;
}
