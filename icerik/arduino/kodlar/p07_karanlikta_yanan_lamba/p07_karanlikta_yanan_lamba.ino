const byte ldrPini = A0;
const byte ledPini = 9;
const int esikDegeri = 500;
const unsigned long haberlesmeHizi = 9600;
const byte beklemeMs = 100;

void setup() {
  pinMode(ledPini, OUTPUT);
  Serial.begin(haberlesmeHizi);
}

void loop() {
  int okuma = analogRead(ldrPini);
  Serial.println(okuma);
  if (okuma < esikDegeri) {
    digitalWrite(ledPini, HIGH);
  } else {
    digitalWrite(ledPini, LOW);
  }
  delay(beklemeMs);
}
