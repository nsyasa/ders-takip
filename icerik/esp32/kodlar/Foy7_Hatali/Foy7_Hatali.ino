// FOY 7 - Hata Avcisi: Bu kodda bilerek birakilmis bir hata var!
#include "mpu_yardimci.h"

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  Serial.print("Cip kimligi: 0x");
  Serial.println(mpuKimlikOku(), HEX);
}

void loop() {
  mpuVeriOku();
  Serial.print("X: "); Serial.print(ax, 2);
  Serial.print("  Y: "); Serial.print(ay, 2);
  Serial.print("  Z: "); Serial.println(az, 2);
  delay(500);
}
