// FOY 6 - Hata Avcisi: Bu kodda bilerek birakilmis bir hata var!
#include <WiFi.h>
#include <WebServer.h>
#include <ESP32Servo.h>

const int GRUP_NO = 1;
const int KANAL = 1;
const char* PAROLA = "robot123";
const int SERVO_PIN = 25;

Servo servo;
WebServer sunucu(80);
int simdikiAci = 90;

void servoyuGotur(int aci) {
  aci = constrain(aci, 10, 170);          // guvenli aralikta tut
  servo.write(aci);
  simdikiAci = aci;
  Serial.print("Servo: ");
  Serial.println(aci);
}

void anaSayfa() {
  String html = "<!DOCTYPE html><html><head><meta charset='UTF-8'>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1'>";
  html += "<style>body{font-family:Arial;text-align:center;margin-top:30px}";
  html += "a{display:inline-block;width:80px;padding:16px 0;margin:6px;font-size:20px;";
  html += "background:#1f6fb2;color:white;text-decoration:none;border-radius:10px}</style>";
  html += "</head><body><h2>Grup " + String(GRUP_NO) + " Servo</h2>";
  html += "<p>Şimdiki açı: <b>" + String(simdikiAci) + "°</b></p>";
  html += "<a href='/aci?deger=10'>10°</a>";
  html += "<a href='/aci?deger=90'>90°</a>";
  html += "<a href='/aci?deger=170'>170°</a>";
  html += "</body></html>";
  sunucu.send(200, "text/html; charset=utf-8", html);
}

void aciAyarla() {                        // ornek istek: /aci?deger=90
  if (sunucu.hasArg("deger")) {
    servoyuGotur(sunucu.arg("deger").toInt());
  }
  sunucu.sendHeader("Location", "/");     // ana sayfaya geri don
  sunucu.send(303);
}

void setup() {
  Serial.begin(115200);
  servo.setPeriodHertz(50);
  servo.attach(SERVO_PIN, 500, 2400);
  servoyuGotur(90);

  String agAdi = "ESP32-G" + String(GRUP_NO);
  WiFi.softAP(agAdi.c_str(), PAROLA, KANAL);
  Serial.print(agAdi);
  Serial.print("  IP: ");
  Serial.println(WiFi.softAPIP());

  sunucu.on("/", anaSayfa);
  sunucu.on("/aci", aciAyarla);
  sunucu.begin();
}

void loop() {

}
