#include <DHT.h>
const byte dhtPini = 2;
const byte ledPini = 9;
const float sicaklikEsigi = 30;
const float nemAlt = 30;
const float nemUst = 60;
const unsigned long aralikMs = 2000;
DHT dht(dhtPini, DHT11);
unsigned long sonOkuma = 0;

void setup() {
  pinMode(ledPini, OUTPUT);
  digitalWrite(ledPini, LOW);
  Serial.begin(9600);
  dht.begin();
  sonOkuma = millis();
}

void loop() {
  unsigned long simdi = millis();
  if (simdi - sonOkuma < aralikMs) return;
  sonOkuma = simdi;
  float nem = dht.readHumidity();
  float sicaklik = dht.readTemperature();
  if (isnan(nem) || isnan(sicaklik)) {
    digitalWrite(ledPini, HIGH);
    Serial.println("Okuma hatasi; gecerli olcum yok");
    return;
  }
  bool uyari = sicaklik > sicaklikEsigi ||
    nem < nemAlt || nem > nemUst;
  digitalWrite(ledPini, uyari);
  Serial.print("Sicaklik C: ");
  Serial.print(sicaklik, 0);
  Serial.print(" Bagil nem %: ");
  Serial.println(nem, 0);
}
