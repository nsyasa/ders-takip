// FOY 7 - Kod 7.1: MPU6050 ham olcumler
#include "mpu_yardimci.h"

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  if (!mpuBaslat()) {
    Serial.println("HATA: MPU bulunamadi. R3 I2C Kontrol Rutini'ni uygula.");
    while (true) delay(100);
  }
  Serial.print("Cip kimligi: 0x");
  Serial.println(mpuKimlikOku(), HEX);   // MPU6050 icin 0x68
}

void loop() {
  mpuVeriOku();

  Serial.print("ivme X: ");  Serial.print(ax, 2);
  Serial.print("  Y: ");     Serial.print(ay, 2);
  Serial.print("  Z: ");     Serial.print(az, 2);
  Serial.print(" m/s2   |   donus X: ");  Serial.print(gx, 1);
  Serial.print("  Y: ");     Serial.print(gy, 1);
  Serial.print("  Z: ");     Serial.print(gz, 1);
  Serial.println(" derece/s");

  delay(500);
}
