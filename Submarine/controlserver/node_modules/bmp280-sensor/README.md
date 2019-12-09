BMP 280 sensor library
=========

A Node.js I2C module for the Bosch BMP280 Barometric Pressure and Temperature Sensor - [datasheet](https://cdn-shop.adafruit.com/datasheets/BST-BMP280-DS001-11.pdf).

This module uses [i2c-bus](https://github.com/fivdi/i2c-bus) which should provide access with Node.js on Linux boards like the Raspberry Pi Zero, 1, 2, or 3, BeagleBone, BeagleBone Black, or Intel Edison.

Note: While the BMP280 device does report temperature, it is measured by the internal temperature sensor. This temperature value depends on the PCB temperature and sensor element self-heating.
Therefore ambient temperature is typically reported above actual ambient temperature.

This module is largely inspired by skylarstein's [bme280-sensor library](https://github.com/skylarstein/bme280-sensor).

However, the main difference is - this library provides a way to setup the sensor - mode, oversampling, etc.

## Installation
```shell
  npm install bmp280-sensor --save
```

## Example Code

```
const BMP280 = require('bmp280-sensor');
const options = {
  i2cBusNumber  : 1,    // defaults to 1
  i2cAddress    : 0x76, // defaults to 0x76
  verbose       : true
};
const bmp280 = new BMP280(options);

bmp280.config({
  powerMode: 1,                // 0 - sleep, 1|2 - one measurement, 3 - continuous
  pressureOversampling: 3,     // 0 - Skipped, 1 - ×1, 2 - ×2, 3 - ×4, 4 - ×8, 5 - ×16
  temperatureOversampling: 1,  // 0 - Skipped, 1 - ×1, 2 - ×2, 3 - ×4, 4 - ×8, 5 - ×16
  iirFilter: 2,                // Coefficient: 0 - off, 1 - 2, 2 - 4, 3 - 8, 4 - 16
  standby: 4                   // 0 - 0.5ms, 1 - 62.5ms, 2 - 125ms, 3 - 250ms, 4 - 500ms, 5 - 1000ms, 6 - 2000ms, 7 - 4000ms
});

console.log(`Reading sensors`);
bmp280.readSensors()
  .then((data) => {
    console.log(`Temperture:\t${data.Temperature}`);
    console.log(`Pressure:\t${data.Pressure}`);
  })
  .then(() => {
    bmp280.close();
  })
  .catch((err) => {
    console.log(err);
    bmp280.close();
  });

process.on('SIGINT', () => {
  bmp280.close();
  process.exit();
});
```

## Example Output

```
> node example.js
Found BMx280 chip ID 0x58 on bus i2c-1, address 0x76
BMP280 cal = {
  "dig_T1": 28057,
  "dig_T2": 26787,
  "dig_T3": -1000,
  "dig_P1": 36945,
  "dig_P2": -10608,
  "dig_P3": 3024,
  "dig_P4": 2509,
  "dig_P5": 153,
  "dig_P6": -7,
  "dig_P7": 15500,
  "dig_P8": -14600,
  "dig_P9": 6000
}
Reading sensors
Temperture:	34.16
Pressure:	1016.8900275234026
```
