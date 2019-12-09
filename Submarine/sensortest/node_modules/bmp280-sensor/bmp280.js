'use strict';

class BMP280 {

  constructor(options) {
    const i2c = require('i2c-bus');
    this.i2cBusNumber = (options && options.i2cBusNumber) ? options.i2cBusNumber : 1;
    this.i2cBus = i2c.openSync(this.i2cBusNumber);
    this.i2cAddress = (options && options.i2cAddress) ? options.i2cAddress : this.I2C_ADDRESS_A;
    this.verbose = (options && options.verbose) ? options.verbose : false;

    this.I2C_ADDRESS_A    = 0x76;  // default
    this.I2C_ADDRESS_B    = 0x77;  // BMP180
    this.CHIP_ID          = 0x58;

    this.REGISTER_CHIPID  = 0xD0;
    this.REGISTER_RESET   = 0xE0;
    this.REGISTER_STATUS  = 0xF3;
    this.REGISTER_CONTROL = 0xF4;   // The “ctrl_meas” register sets the data acquisition options of the device (page 25)
    this.REGISTER_CONFIG  = 0xF5;   // The “config” register sets the rate, filter and interface options of the device (page 26)

    // data registers
    this.REGISTER_RAWBAR_MSB    = 0xF7;
    this.REGISTER_RAWBAR_LSB    = 0xF8;
    this.REGISTER_RAWBAR_XLSB   = 0xF9;
    this.REGISTER_RAWTEMP_MSB   = 0xFA;
    this.REGISTER_RAWTEMP_LSB   = 0xFB;
    this.REGISTER_RAWTEMP_XLSB  = 0xFC;

    // calibration registers
    this.REGISTER_DIG_T1 = 0x88;  // dig_T1   0x88   0x89     unsigned short
    this.REGISTER_DIG_T2 = 0x8A;  // dig_T2   0x8A   0x8B     signed short
    this.REGISTER_DIG_T3 = 0x8C;  // dig_T3   0x8C   0x8D     signed short
    this.REGISTER_DIG_P1 = 0x8E;  // dig_P1   0x8E   0x8F     unsigned short
    this.REGISTER_DIG_P2 = 0x90;  // dig_P2   0x90   0x91     signed short
    this.REGISTER_DIG_P3 = 0x92;  // dig_P3   0x92   0x93     signed short
    this.REGISTER_DIG_P4 = 0x94;  // dig_P4   0x94   0x95     signed short
    this.REGISTER_DIG_P5 = 0x96;  // dig_P5   0x96   0x97     signed short
    this.REGISTER_DIG_P6 = 0x98;  // dig_P6   0x98   0x99     signed short
    this.REGISTER_DIG_P7 = 0x9A;  // dig_P7   0x9A   0x9B     signed short
    this.REGISTER_DIG_P8 = 0x9C;  // dig_P8   0x9C   0x9D     signed short
    this.REGISTER_DIG_P9 = 0x9E;  // dig_P9   0x9E   0x9F     signed short
    // reserved 0xA0   0xA1

    this.init();
    this.loadCalibration();
  }

  init() {
    const chipId = this.i2cBus.readByteSync(this.i2cAddress, this.REGISTER_CHIPID);
    if (chipId !== this.CHIP_ID) {
      throw new Error(`Unexpected BMx280 chip ID: 0x${chipId.toString(16)}`);
    } else {
      if (this.verbose) {
        console.log(`Found BMx280 chip ID 0x${chipId.toString(16)} on bus i2c-${this.i2cBusNumber}, address 0x${this.i2cAddress.toString(16)}`);
      }
      return chipId;
    }
  }

  loadCalibration() {
    let buf = new Buffer(24);
    this.i2cBus.readI2cBlockSync(this.i2cAddress, this.REGISTER_DIG_T1, 24, buf);
    this.cal = {
      dig_T1: BMP280.uint16(buf[1], buf[0]),
      dig_T2: BMP280.int16(buf[3], buf[2]),
      dig_T3: BMP280.int16(buf[5], buf[4]),

      dig_P1: BMP280.uint16(buf[7], buf[6]),
      dig_P2: BMP280.int16(buf[9], buf[8]),
      dig_P3: BMP280.int16(buf[11], buf[10]),
      dig_P4: BMP280.int16(buf[13], buf[12]),
      dig_P5: BMP280.int16(buf[15], buf[14]),
      dig_P6: BMP280.int16(buf[17], buf[16]),
      dig_P7: BMP280.int16(buf[19], buf[18]),
      dig_P8: BMP280.int16(buf[21], buf[20]),
      dig_P9: BMP280.int16(buf[23], buf[22]),
    };
    if (this.verbose) {
      console.log('BMP280 cal = ' + JSON.stringify(this.cal, null, 2));
    }
  }

  getRawValues() {
    return new Promise((resolve, reject) => {
      this.i2cBus.readI2cBlock(this.i2cAddress, this.REGISTER_RAWBAR_MSB, 6, new Buffer(6), (err, bytesRead, buffer) => {
        return (err) ? reject(err) : resolve(buffer);
      });
    });
  }

  readSensors() {
    if (!this.cal) {
      return Promise.reject('You must first call bmp280.loadCalibration()');
    }
    return this.getRawValues()
      .then((raw) => {
        // temperature
        let adc_T = BMP280.uint20(raw[3], raw[4], raw[5]);
        let tvar1 = (((adc_T >> 3) - (this.cal.dig_T1 << 1)) * this.cal.dig_T2) >> 11;
        let tvar2 = (((((adc_T >> 4) - this.cal.dig_T1) * ((adc_T >> 4) - this.cal.dig_T1)) >> 12) * this.cal.dig_T3) >> 14;
        let t_fine = tvar1 + tvar2;
        let temperature_C = ((t_fine * 5 + 128) >> 8) / 100;
        // pressure
        let adc_P = BMP280.uint20(raw[0], raw[1], raw[2]);
        let pvar1 = t_fine / 2.0 - 64000.0;
        let pvar2 = pvar1 * pvar1 * this.cal.dig_P6 / 32768.0;
        pvar2 = pvar2 + pvar1 * this.cal.dig_P5 * 2.0;
        pvar2 = pvar2 / 4.0 + this.cal.dig_P4 * 65536.0;
        pvar1 = (this.cal.dig_P3 * pvar1 * pvar1 / 524288.0 + this.cal.dig_P2 * pvar1) / 524288.0;
        pvar1 = (1.0 + pvar1 / 32768.0) * this.cal.dig_P1;
        let pressure_hPa = 0;
        if (Math.abs(pvar1) > 1.e-32) {
          let p = 1048576.0 - adc_P;
          p = ((p - pvar2 / 4096.0) * 6250.0) / pvar1;
          pvar1 = this.cal.dig_P9 * p * p / 2147483648.0;
          pvar2 = p * this.cal.dig_P8 / 32768.0;
          p = p + (pvar1 + pvar2 + this.cal.dig_P7) / 16.0;
          pressure_hPa = p / 100.0;
        }
        return {
          Temperature: temperature_C,
          Pressure: pressure_hPa
        };
      });
  }

  config(opts) {
    let omConfig = this.getOversamplingAndMode();
    const m = (opts && opts.powerMode) ? opts.powerMode : omConfig.pm;
    const p = (opts && opts.pressureOversampling) ? opts.pressureOversampling : omConfig.pos;
    const t = (opts && opts.temperatureOversampling) ? opts.temperatureOversampling : omConfig.tos;
    this.setOversamplingAndMode(t, p, m);
    let fsConfig = this.getFilterAndStandby();
    const f = (opts && opts.iirFilter) ? opts.iirFilter : fsConfig.filter;
    const s = (opts && opts.standby) ? opts.standby : fsConfig.standby;
    this.setFilterAndStandby(f, s, fsConfig.reserved);
  }

  // Read oversampling and mode values
  getOversamplingAndMode() {
    const v = this.i2cBus.readByteSync(this.i2cAddress, this.REGISTER_CONTROL);
    return {
      pm:  (v) & 0b11,
      pos: (v >> 2) & 0b111,
      tos: (v >> 5) & 0b111
    };
  }

  // Read IIR filter and standby time values
  getFilterAndStandby() {
    const v = this.i2cBus.readByteSync(this.i2cAddress, this.REGISTER_CONFIG);
    return {
      reserved: (v) & 0b11,
      filter:   (v >> 2) & 0b111,
      standby:  (v >> 5) & 0b111
    };
  }

  /*
    Set power mode. Page 15.
    0 0b00 - Sleep mode
    1 0b01 or 2 0b10 - Forced mode
    3 0b11 - Normal mode
    ----------
    Set oversampling for pressure. Page 25.
    0 0b000 - Skipped (output set to 0x80000)
    1 0b001 - oversampling ×1
    2 0b010 - oversampling ×2
    3 0b011 - oversampling ×4
    4 0b100 - oversampling ×8
    5 0b101, Others - oversampling ×16
    ----------
    Set oversampling for temperature. Page 26.
    0 0b000 - Skipped (output set to 0x80000)
    1 0b001 - oversampling ×1
    2 0b010 - oversampling ×2
    3 0b011 - oversampling ×4
    4 0b100 - oversampling ×8
    5 0b101, 0b110, 0b111 - oversampling ×16
  */
  setOversamplingAndMode(t = 0b001, p = 0b101, m = 0b00) {
    if (!Number.isInteger(t) || t < 0 || t > 5) {
      throw new Error('Temperature oversampling must be an int between 0 and 5');
    }
    if (!Number.isInteger(p) || p < 0 || p > 5) {
      throw new Error('Pressure oversampling must be an int between 0 and 5');
    }
    if (!Number.isInteger(m) || m < 0 || m > 3) {
      throw new Error('Power mode must be an int between 0 and 3');
    }
    const newValue = (t << 5) + (p << 2) + m;
    this.i2cBus.writeByteSync(this.i2cAddress, this.REGISTER_CONTROL, newValue);
  }

  /*
    Set IIR filter coefficient. Page 14
             Filter coefficient    Samples to reach ≥75% of step response
    0 0b000  Filter off            1
    1 0b001  2                     2
    2 0b010  4                     5
    3 0b011  8                     11
    4 0b100  16                    22
    ----------
    Set standby time used in Normal mode. Page 17
    0 0b000 - 0.5ms
    1 0b001 - 62.5ms
    2 0b010 - 125ms
    3 0b011 - 250ms
    4 0b100 - 500ms
    5 0b101 - 1000ms
    6 0b110 - 2000ms
    7 0b111 - 4000ms
  */
  setFilterAndStandby(f = 0b000, s = 0b000, r = 0b00) {
    if (!Number.isInteger(f) || f < 0 || f > 4) {
      throw new Error('Filter coefficient must be an int between 0 and 4');
    }
    if (!Number.isInteger(s) || s < 0 || s > 7) {
      throw new Error('Standby time must be an int between 0 and 7');
    }
    const newValue = (s << 5) + (f << 2) + r;
    this.i2cBus.writeByteSync(this.i2cAddress, this.REGISTER_CONFIG, newValue);
  }

  close() {
    this.i2cBus.closeSync();
  }

  reset() {
    const POWER_ON_RESET_CMD = 0xB6;
    this.i2cBus.writeByteSync(this.i2cAddress, this.REGISTER_RESET, POWER_ON_RESET_CMD);
  }

  static uint20(msb, lsb, xlsb) {
    return ((msb << 8 | lsb) << 8 | xlsb) >> 4;
  }

  static uint16(msb, lsb) {
    return msb << 8 | lsb;
  }

  static int16(msb, lsb) {
    let val = BMP280.uint16(msb, lsb);
    return val > 32767 ? (val - 65536) : val;
  }

}

module.exports = BMP280;
