const byte pirPini = 2;
const byte ledPini = 9;
const byte buzzerPini = 8;
const unsigned long hazirlikMs = 60000UL;
const unsigned long alarmMs = 2000UL;
const unsigned long haberlesmeHizi = 9600;
bool hazir = false;
bool alarmVar = false;
int sonHam = LOW;
unsigned long baslangic = 0;
unsigned long sonYuksek = 0;

void setup() {
  pinMode(pirPini, INPUT);
  pinMode(ledPini, OUTPUT);
  pinMode(buzzerPini, OUTPUT);
  digitalWrite(ledPini, LOW);
  digitalWrite(buzzerPini, LOW);
  Serial.begin(haberlesmeHizi);
  Serial.println("Sensor hazirlaniyor...");
  baslangic = millis();
}

void loop() {
  unsigned long simdi = millis();
  if (!hazir && simdi - baslangic >= hazirlikMs) {
    hazir = true;
    Serial.println("Hazir");
  }
  int ham = digitalRead(pirPini);
  if (hazir && ham != sonHam) {
    sonHam = ham;
    Serial.print(simdi);
    Serial.print(" ms OUT: ");
    Serial.println(ham);
  }
  if (hazir && ham == HIGH) {
    if (!alarmVar) Serial.println("Algilama var");
    alarmVar = true;
    sonYuksek = simdi;
  }
  if (alarmVar && simdi - sonYuksek >= alarmMs) {
    alarmVar = false;
    Serial.println("Alarm bitti");
  }
  if (alarmVar) {
    digitalWrite(ledPini, HIGH);
    digitalWrite(buzzerPini, HIGH);
  } else {
    digitalWrite(ledPini, LOW);
    digitalWrite(buzzerPini, LOW);
  }
}
