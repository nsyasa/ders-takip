const byte trigPini = 9;
const byte echoPini = 10;
const byte darbeHazirlikUs = 2;
const byte tetiklemeUs = 10;
const unsigned long zamanAsimiUs = 30000UL;
const unsigned long haberlesmeHizi = 9600;
const byte beklemeMs = 100;
const float sesHiziCmUs = 0.0343;
const float yakinEsigiCm = 20.0;
const byte ondalikBasamak = 1;

unsigned long yankiyiOlc() {
  digitalWrite(trigPini, LOW);
  delayMicroseconds(darbeHazirlikUs);
  digitalWrite(trigPini, HIGH);
  delayMicroseconds(tetiklemeUs);
  digitalWrite(trigPini, LOW);
  return pulseIn(echoPini, HIGH, zamanAsimiUs);
}

void setup() {
  pinMode(trigPini, OUTPUT);
  pinMode(echoPini, INPUT);
  Serial.begin(haberlesmeHizi);
}

void loop() {
  unsigned long sureUs = yankiyiOlc();
  if (sureUs == 0) {
    Serial.println("Olcum yok");
  } else {
    float mesafeCm = sureUs * sesHiziCmUs / 2; // 2: ses gider ve döner
    Serial.print(sureUs);
    Serial.print(" us: ");
    Serial.print(mesafeCm, ondalikBasamak);
    Serial.println(" cm");
    if (mesafeCm < yakinEsigiCm) Serial.println("Cok yakin!");
  }
  delay(beklemeMs);
}
