// FOY 8 - Hata Avcisi: Bu kodda bilerek birakilmis bir hata var!
#include <Wire.h>
#include <Adafruit_INA219.h>

Adafruit_INA219 ina219;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  if (!ina219.begin()) {
    Serial.println("HATA: INA219 bulunamadi.");
    while (true) delay(100);
  }
  ina219.setCalibration_16V_400mA();
}

void loop() {
  float gerilimV = ina219.getBusVoltage_V();
  float akimmA = ina219.getCurrent_mA();
  float akimA = akimmA * 1000;          // mA -> A donusumu
  float gucW = gerilimV * akimA;

  Serial.print("Guc: ");
  Serial.print(gucW, 3);
  Serial.println(" W");
  delay(1000);
}
