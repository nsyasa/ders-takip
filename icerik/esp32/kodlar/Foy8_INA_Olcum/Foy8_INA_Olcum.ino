// FOY 8 - Kod 8.1: Gerilim, akim ve guc olcumu
#include <Wire.h>
#include <Adafruit_INA219.h>

Adafruit_INA219 ina219;          // varsayilan adres 0x40

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  if (!ina219.begin()) {
    Serial.println("HATA: INA219 bulunamadi. R3 I2C Kontrol Rutini'ni uygula.");
    while (true) delay(100);
  }
  ina219.setCalibration_16V_400mA();   // kucuk akimlar icin daha hassas olcek
  Serial.println("INA219 hazir.");
}

void loop() {
  float gerilimV = ina219.getBusVoltage_V();   // VIN- ile GND arasi
  float akimmA   = ina219.getCurrent_mA();
  float gucmW    = ina219.getPower_mW();

  Serial.print("V = ");  Serial.print(gerilimV, 3);  Serial.print(" V   ");
  Serial.print("I = ");  Serial.print(akimmA, 2);    Serial.print(" mA   ");
  Serial.print("P = ");  Serial.print(gucmW, 1);     Serial.println(" mW");

  delay(1000);
}
