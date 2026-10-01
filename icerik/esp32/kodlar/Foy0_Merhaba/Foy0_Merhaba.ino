// FOY 0 - Etkinlik 2: ESP32 ile ilk konusma
void setup() {
  Serial.begin(115200);   // Seri Monitor de 115200 olmali
  delay(1000);            // Seri Monitor'un acilmasi icin kisa bekleme

  Serial.println("Merhaba ESP32!");
  Serial.print("Cip modeli: ");
  Serial.println(ESP.getChipModel());
  Serial.print("Cekirdek sayisi: ");
  Serial.println(ESP.getChipCores());
  Serial.print("Islemci hizi (MHz): ");
  Serial.println(ESP.getCpuFreqMHz());
  Serial.print("Flash bellek (MB): ");
  Serial.println(ESP.getFlashChipSize() / (1024 * 1024));
}

void loop() {
  Serial.print("Acik kalma suresi (s): ");
  Serial.println(millis() / 1000);
  delay(1000);
}
