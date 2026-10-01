// mpu_yardimci.h - Foy 7 icin kucuk MPU6050 yardimcisi
// Kutuphane kullanmadan, sensorun kayitlarini (register) dogrudan okur.
#pragma once
#include <Wire.h>

const int MPU_ADRES = 0x68;
const float G = 9.81;            // yercekimi ivmesi, m/s^2

float ax, ay, az;                // ivme, m/s^2
float gx, gy, gz;                // acisal hiz, derece/saniye

void mpuYaz(int kayit, int deger) {
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(kayit);
  Wire.write(deger);
  Wire.endTransmission();
}

int mpuKimlikOku() {             // WHO_AM_I kaydi (0x75)
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x75);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADRES, 1);
  return Wire.read();
}

bool mpuBaslat() {
  Wire.beginTransmission(MPU_ADRES);
  if (Wire.endTransmission() != 0) return false;   // cihaz cevap vermedi
  mpuYaz(0x6B, 0);               // uyku modundan uyandir
  return true;
}

int16_t ikiBaytOku() {           // once yuksek, sonra dusuk bayt
  int yuksek = Wire.read();
  int dusuk = Wire.read();
  return (int16_t)((yuksek << 8) | dusuk);
}

void mpuVeriOku() {
  Wire.beginTransmission(MPU_ADRES);
  Wire.write(0x3B);              // ilk olcum kaydi
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADRES, 14);   // ivme 6 + sicaklik 2 + jiroskop 6 bayt
  ax = ikiBaytOku() / 16384.0 * G;   // +-2 g araliginda 1 g = 16384
  ay = ikiBaytOku() / 16384.0 * G;
  az = ikiBaytOku() / 16384.0 * G;
  ikiBaytOku();                      // sicaklik (kullanmiyoruz)
  gx = ikiBaytOku() / 131.0;         // +-250 derece/s araliginda 131 = 1 derece/s
  gy = ikiBaytOku() / 131.0;
  gz = ikiBaytOku() / 131.0;
}
