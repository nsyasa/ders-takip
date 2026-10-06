const byte kirmiziPini = 9;
const byte yesilPini = 10;
const byte maviPini = 11;
const bool ortakAnot = false;
const byte parlaklikEnCok = 255;
const byte kirmiziDegeri = 128;
const byte yesilDegeri = 0;
const byte maviDegeri = 0;

void setup() {
  pinMode(kirmiziPini, OUTPUT);
  pinMode(yesilPini, OUTPUT);
  pinMode(maviPini, OUTPUT);
}

void loop() {
  byte kirmiziCikis = kirmiziDegeri;
  byte yesilCikis = yesilDegeri;
  byte maviCikis = maviDegeri;
  if (ortakAnot) {
    kirmiziCikis = parlaklikEnCok - kirmiziDegeri;
    yesilCikis = parlaklikEnCok - yesilDegeri;
    maviCikis = parlaklikEnCok - maviDegeri;
  }
  analogWrite(kirmiziPini, kirmiziCikis);
  analogWrite(yesilPini, yesilCikis);
  analogWrite(maviPini, maviCikis);
}
