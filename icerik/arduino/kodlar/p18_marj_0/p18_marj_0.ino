const byte suPini = A0;
const byte kirmizi = 9;
const byte sari = 10;
const byte yesil = 11;
const byte buzzer = 8;
const int ortaEsik = 200;
const int doluEsik = 400;
const int marj = 0;
const bool tersOkuma = false;
const unsigned long aralikMs = 500;
byte seviye = 0;
unsigned long zaman = 0;

byte yeniSeviye(int deger) {
  if (seviye == 0) {
    if (deger > ortaEsik + marj) return 1;
  } else if (seviye == 1) {
    if (deger > doluEsik + marj) return 2;
    if (deger < ortaEsik - marj) return 0;
  } else {
    if (deger < doluEsik - marj) return 1;
  }
  return seviye;
}

void setup() {
  pinMode(kirmizi, OUTPUT);
  pinMode(sari, OUTPUT);
  pinMode(yesil, OUTPUT);
  pinMode(buzzer, OUTPUT);
  Serial.begin(9600);
  zaman = millis();
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - zaman < aralikMs) return;
  zaman = simdi;
  int ham = analogRead(suPini);
  int deger = ham;
  if (tersOkuma) deger = 1023 - ham;
  seviye = yeniSeviye(deger);
  digitalWrite(kirmizi, seviye == 0);
  digitalWrite(sari, seviye == 1);
  digitalWrite(yesil, seviye == 2);
  digitalWrite(buzzer, seviye == 2);
  Serial.print("Ham: ");
  Serial.print(ham);
  Serial.print(" Deger: ");
  Serial.print(deger);
  Serial.print(" Seviye: ");
  Serial.println(seviye);
}
