// FOY 12 - Kod 12.1: Kartimin MAC adresi
#include <WiFi.h>
#include <esp_mac.h>

void setup() {
  Serial.begin(115200);
  delay(1000);
  uint8_t mac[6];
  esp_read_mac(mac, ESP_MAC_WIFI_STA);   // Wi-Fi arayuzunun adresi

  Serial.print("MAC adresim: ");
  for (int i = 0; i < 6; i++) {
    if (mac[i] < 16) Serial.print("0");
    Serial.print(mac[i], HEX);
    if (i < 5) Serial.print(":");
  }
  Serial.println();

  Serial.print("Gonderici koduna kopyala: {");   // yazim hatasi olmasin
  for (int i = 0; i < 6; i++) {
    Serial.print("0x");
    if (mac[i] < 16) Serial.print("0");
    Serial.print(mac[i], HEX);
    if (i < 5) Serial.print(", ");
  }
  Serial.println("}");
}

void loop() {
}
