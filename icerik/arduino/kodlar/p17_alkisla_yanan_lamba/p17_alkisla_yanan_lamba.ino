const byte sesPini = A0;
const byte ledPini = 9;
const int esik = 100;
const unsigned long pencereMs = 50;
const unsigned long beklemeMs = 400;
int enKucuk = 1023;
int enBuyuk = 0;
bool ledAcik = false;
bool yenidenHazir = true;
unsigned long pencereBaslangici = 0;
unsigned long sonOlay = 0;

void setup() {
  pinMode(ledPini, OUTPUT);
  digitalWrite(ledPini, LOW);
  Serial.begin(9600);
  pencereBaslangici = millis();
  sonOlay = pencereBaslangici;
}

void loop() {
  unsigned long simdi = millis();
  int ham = analogRead(sesPini);
  if (ham < enKucuk) enKucuk = ham;
  if (ham > enBuyuk) enBuyuk = ham;
  if (simdi - pencereBaslangici < pencereMs) return;
  int pencereFarki = enBuyuk - enKucuk;
  enKucuk = 1023;
  enBuyuk = 0;
  pencereBaslangici = simdi;
  if (pencereFarki <= esik) yenidenHazir = true;
  if (pencereFarki > esik && yenidenHazir &&
      simdi - sonOlay >= beklemeMs) {
    ledAcik = !ledAcik;
    yenidenHazir = false;
    sonOlay = simdi;
  }
  digitalWrite(ledPini, ledAcik);
  Serial.print("PencereFarki: ");
  Serial.print(pencereFarki);
  Serial.print(" LED: ");
  Serial.println(ledAcik);
}
