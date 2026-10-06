const byte sicaklikPini = A0;
const float referansGerilimi = 5.0;
const float adcEnBuyuk = 1023.0;
const float dereceCarpani = 100.0;
const float sicaklikEsigi = 30.0;
const unsigned long haberlesmeHizi = 9600;
const unsigned int beklemeMs = 500;
const byte ondalikBasamak = 1;

void setup() {
  Serial.begin(haberlesmeHizi);
}

void loop() {
  int okuma = analogRead(sicaklikPini);
  float gerilim = okuma * referansGerilimi / adcEnBuyuk;
  float sicaklik = gerilim * dereceCarpani;
  Serial.println(sicaklik, ondalikBasamak);
  if (sicaklik > sicaklikEsigi) {
    Serial.println("SICAK");
  } else {
    Serial.println("NORMAL");
  }
  delay(beklemeMs);
}
