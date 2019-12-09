/**
 *
 * NodeJs Module : MPU9250
 * @author BENKHADRA Hocine
 * @description Simple reading data for node js and mpu9250
 * @version 0.2.0
 * @dependent i2c, extend, sleep
 * @license MIT
 *
 */

///////////////////////////////////////////////////////////////////////////////////////
//***********************************************************************************//
//**                                                                               **//
//**                                                                               **//
//** The MIT License (MIT)                                                         **//
//**                                                                               **//
//** Copyright (c) <2015> <BENKHADRA Hocine>                                       **//
//**                                                                               **//
//** Permission is hereby granted, free of charge, to any person obtaining a copy  **//
//** of this software and associated documentation files (the "Software"), to deal **//
//** in the Software without restriction, including without limitation the rights  **//
//** to use, copy, modify, merge, publish, distribute, sublicense, and/or sell     **//
//** copies of the Software, and to permit persons to whom the Software is         **//
//** furnished to do so, subject to the following conditions:                      **//
//**                                                                               **//
//** The above copyright notice and this permission notice shall be included in    **//
//** all copies or substantial portions of the Software.                           **//
//**                                                                               **//
//** THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR    **//
//** IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,      **//
//** FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE   **//
//** AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER        **//
//** LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, **//
//** OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN     **//
//** THE SOFTWARE.                                                                 **//
//**                                                                               **//
//***********************************************************************************//
///////////////////////////////////////////////////////////////////////////////////////

/*********************/
/** Module required **/
/*********************/
var MOD_I2C = require('i2c');
var extend = require('extend');
var sleep = require('sleep');

/*****************/
/** MPU9250 MAP **/
/*****************/
// documentation:
//   https://www.invensense.com/products/motion-tracking/9-axis/mpu-9250/
//   https://www.invensense.com/wp-content/uploads/2015/02/MPU-9250-Datasheet.pdf
//   https://www.invensense.com/wp-content/uploads/2015/02/MPU-9250-Register-Map.pdf

var MPU9250 = {
	I2C_ADDRESS_AD0_LOW: 0x68,
	I2C_ADDRESS_AD0_HIGH: 0x69,
	WHO_AM_I: 0x75,

	RA_CONFIG: 0x1A,
	RA_GYRO_CONFIG: 0x1B,
	RA_ACCEL_CONFIG_1: 0x1C,
	RA_ACCEL_CONFIG_2: 0x1D,

	RA_INT_PIN_CFG: 0x37,

	INTCFG_ACTL_BIT: 7,
	INTCFG_OPEN_BIT: 6,
	INTCFG_LATCH_INT_EN_BIT: 5,
	INTCFG_INT_ANYRD_2CLEAR_BIT: 4,
	INTCFG_ACTL_FSYNC_BIT: 3,
	INTCFG_FSYNC_INT_MODE_EN_BIT: 2,
	INTCFG_BYPASS_EN_BIT: 1,
	INTCFG_NONE_BIT: 0,

	// BY_PASS_MODE: 0x02,

	ACCEL_XOUT_H: 0x3B,
	ACCEL_XOUT_L: 0x3C,
	ACCEL_YOUT_H: 0x3D,
	ACCEL_YOUT_L: 0x3E,
	ACCEL_ZOUT_H: 0x3F,
	ACCEL_ZOUT_L: 0x40,
	TEMP_OUT_H: 0x41,
	TEMP_OUT_L: 0x42,
	GYRO_XOUT_H: 0x43,
	GYRO_XOUT_L: 0x44,
	GYRO_YOUT_H: 0x45,
	GYRO_YOUT_L: 0x46,
	GYRO_ZOUT_H: 0x47,
	GYRO_ZOUT_L: 0x48,

	RA_USER_CTRL: 0x6A,
	RA_PWR_MGMT_1: 0x6B,
	RA_PWR_MGMT_2: 0x6C,
	PWR1_DEVICE_RESET_BIT: 7,
	PWR1_SLEEP_BIT: 6,
	PWR1_CYCLE_BIT: 5,
	PWR1_TEMP_DIS_BIT: 3, // (PD_PTAT)
	PWR1_CLKSEL_BIT: 0,
	PWR1_CLKSEL_LENGTH: 3,

	GCONFIG_FS_SEL_BIT: 3,
	GCONFIG_FS_SEL_LENGTH: 2,
	GYRO_FS_250: 0x00,
	GYRO_FS_500: 0x01,
	GYRO_FS_1000: 0x02,
	GYRO_FS_2000: 0x03,
	GYRO_SCALE_FACTOR: [131, 65.5, 32.8, 16.4],

	ACONFIG_FS_SEL_BIT: 3,
	ACONFIG_FS_SEL_LENGTH: 2,
	ACCEL_FS_2: 0x00,
	ACCEL_FS_4: 0x01,
	ACCEL_FS_8: 0x02,
	ACCEL_FS_16: 0x03,
	ACCEL_SCALE_FACTOR: [16384, 8192, 4096, 2048],

	CLOCK_INTERNAL: 0x00,
	CLOCK_PLL_XGYRO: 0x01,
	CLOCK_PLL_YGYRO: 0x02,
	CLOCK_PLL_ZGYRO: 0x03,
	CLOCK_KEEP_RESET: 0x07,
	CLOCK_PLL_EXT32K: 0x04,
	CLOCK_PLL_EXT19M: 0x05,

	I2C_SLV0_DO: 0x63,
	I2C_SLV1_DO: 0x64,
	I2C_SLV2_DO: 0x65,

	USERCTRL_DMP_EN_BIT: 7,
	USERCTRL_FIFO_EN_BIT: 6,
	USERCTRL_I2C_MST_EN_BIT: 5,
	USERCTRL_I2C_IF_DIS_BIT: 4,
	USERCTRL_DMP_RESET_BIT: 3,
	USERCTRL_FIFO_RESET_BIT: 2,
	USERCTRL_I2C_MST_RESET_BIT: 1,
	USERCTRL_SIG_COND_RESET_BIT: 0,

	DEFAULT_GYRO_OFFSET: { x: 0, y: 0, z: 0 },
	DEFAULT_ACCEL_CALIBRATION: {
		offset: {x: 0, y: 0, z: 0},
		scale: {
			x: [-1, 1],
			y: [-1, 1],
			z: [-1, 1]
		}
	}
};

/****************/
/** AK8963 MAP **/
/****************/
// Technical documentation available here: https://www.akm.com/akm/en/file/datasheet/AK8963C.pdf
var AK8963 = {
	ADDRESS: 0x0C,
	WHO_AM_I: 0x00, // should return 0x48,
	WHO_AM_I_RESPONSE: 0x48,
	INFO: 0x01,
	ST1: 0x02,  // data ready status bit 0
	XOUT_L: 0x03,  // data
	XOUT_H: 0x04,
	YOUT_L: 0x05,
	YOUT_H: 0x06,
	ZOUT_L: 0x07,
	ZOUT_H: 0x08,
	ST2: 0x09,  // Data overflow bit 3 and data read error status bit 2
	CNTL: 0x0A,  // Power down (0000), single-measurement (0001), self-test (1000) and Fuse ROM (1111) modes on bits 3:0
	ASTC: 0x0C,  // Self test control
	I2CDIS: 0x0F,  // I2C disable
	ASAX: 0x10,  // Fuse ROM x-axis sensitivity adjustment value
	ASAY: 0x11,  // Fuse ROM y-axis sensitivity adjustment value
	ASAZ: 0x12,

	ST1_DRDY_BIT: 0,
	ST1_DOR_BIT: 1,

	CNTL_MODE_OFF: 0x00, // Power-down mode
	CNTL_MODE_SINGLE_MEASURE: 0x01, // Single measurement mode
	CNTL_MODE_CONTINUE_MEASURE_1: 0x02, // Continuous measurement mode 1 - Sensor is measured periodically at 8Hz
	CNTL_MODE_CONTINUE_MEASURE_2: 0x06, // Continuous measurement mode 2 - Sensor is measured periodically at 100Hz
	CNTL_MODE_EXT_TRIG_MEASURE: 0x04, // External trigger measurement mode
	CNTL_MODE_SELF_TEST_MODE: 0x08, // Self-test mode
	CNTL_MODE_FUSE_ROM_ACCESS: 0x0F,  // Fuse ROM access mode

    DEFAULT_CALIBRATION: {
        offset: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
	}
};

////////////////////////////////////////////////////////////////////////////////////
// /** ---------------------------------------------------------------------- **/ //
//  *		 						MPU Configuration						   *  //
// /** ---------------------------------------------------------------------- **/ //
////////////////////////////////////////////////////////////////////////////////////

/**
 * @name mpu9250
 * @params Object {device: '', address: '', UpMagneto: false, DEBUG: false, ak_address: ''}
 */
var mpu9250 = function(cfg) {
	cfg = cfg || {};
	if (typeof cfg !== 'object') {
		cfg = {};
	}

	var _default = {
		device: '/dev/i2c-1',
		address: MPU9250.I2C_ADDRESS_AD0_LOW,
		UpMagneto: false,
		DEBUG: false,
		scaleValues: false,
		ak_address: AK8963.ADDRESS,
		GYRO_FS: 0,
		ACCEL_FS: 2,
		gyroBiasOffset: MPU9250.DEFAULT_GYRO_OFFSET,
		accelCalibration: MPU9250.DEFAULT_ACCEL_CALIBRATION
	};

	var config = extend({}, _default, cfg);
	this._config = config;
};

/**
 * @name initialize
 * @return boolean
 */
mpu9250.prototype.initialize = function() {
	this.i2c = new LOCAL_I2C(this._config.address, {device: this._config.device});
	this.debug = new debugConsole(this._config.DEBUG);
	this.debug.Log('INFO', 'Initialization MPU9250 ....');

	// clear configuration
	this.i2c.writeBit(MPU9250.RA_PWR_MGMT_1, MPU9250.PWR1_DEVICE_RESET_BIT, 1);
	this.debug.Log('INFO', 'Reset configuration MPU9250.');
	sleep.usleep(10000);

	// define clock source
	this.setClockSource(MPU9250.CLOCK_PLL_XGYRO);
	sleep.usleep(10000);

	// define gyro range
	var gyro_fs = [MPU9250.GYRO_FS_250, MPU9250.GYRO_FS_500, MPU9250.GYRO_FS_1000, MPU9250.GYRO_FS_2000];
	var gyro_value = MPU9250.GYRO_FS_250;
	if (this._config.GYRO_FS > -1 && this._config.GYRO_FS < 4) gyro_value = gyro_fs[this._config.GYRO_FS];
	this.setFullScaleGyroRange(gyro_value);
	sleep.usleep(10000);

	// define accel range
	var accel_fs = [MPU9250.ACCEL_FS_2, MPU9250.ACCEL_FS_4, MPU9250.ACCEL_FS_8, MPU9250.ACCEL_FS_16];
	var accel_value = MPU9250.ACCEL_FS_4;
	if (this._config.ACCEL_FS > -1 && this._config.ACCEL_FS < 4) accel_value = accel_fs[this._config.ACCEL_FS];
	this.setFullScaleAccelRange(accel_value);
	sleep.usleep(10000);

	// disable sleepEnabled
	this.setSleepEnabled(false);
	sleep.usleep(10000);

	if (this._config.UpMagneto) {
		this.debug.Log('INFO', 'Enabled magnetometer. Starting initialization ....');
		this.enableMagnetometer();
		this.debug.Log('INFO', 'END of magnetometer initialization.');
	}

	this.debug.Log('INFO', 'END of MPU9150 initialization.');

	// Print out the configuration
	if (this._config.DEBUG) {
		this.printSettings();
		this.printAccelSettings();
		this.printGyroSettings();
		if (this.ak8963) {
			this.ak8963.printSettings();
		}
	}

	return this.testDevice();
};

/**------------------|[ FUNCTION ]|------------------**/
/**
 * @name testDevice
 * @return boolean
 */
mpu9250.prototype.testDevice = function() {
	return (this.getIDDevice() === 0x71);
};

/**
 * @name enableMagnetometer
 * @return boolean
 */
mpu9250.prototype.enableMagnetometer = function() {
	if (this.i2c) {
		this.setI2CMasterModeEnabled(false);
		sleep.usleep(100000);

		this.setByPASSEnabled(true);
		sleep.usleep(100000);

		if (this.getByPASSEnabled()) {
			this.ak8963 = new ak8963(this._config);
			return true;
		} else {
			this.debug.Log('ERROR', 'Can\'t turn on RA_INT_PIN_CFG.');
		}

	}
	return false;
};


/**---------------------|[ GET ]|--------------------**/
/**
 * @name getIDDevice
 * @return number | false
 */
mpu9250.prototype.getIDDevice = function() {
	if (this.i2c) {
		return this.i2c.readByte(MPU9250.WHO_AM_I);
	}
	return false;
};

/**
 * @name getTemperature
 * @return int | false
 */
mpu9250.prototype.getTemperature = function() {
	if (this.i2c) {
		var buffer = this.i2c.readBytes(MPU9250.TEMP_OUT_H, 2, function() {});
		return buffer.readInt16BE(0);
	}
	return false;
};

/**
 * @name getTemperatureCelsius
 * @return string
 */
mpu9250.prototype.getTemperatureCelsius = function() {
/*
((TEMP_OUT – RoomTemp_Offset)/Temp_Sensitivity) + 21degC
*/
    var TEMP_OUT = this.getTemperatureCelsiusDigital();
	if (TEMP_OUT) {
		return TEMP_OUT + '°C';
	}
	return 'no data';
};

mpu9250.prototype.getTemperatureCelsiusDigital = function() {
    var TEMP_OUT = this.getTemperature();
	if (TEMP_OUT) {
		return (TEMP_OUT / 333.87) + 21.0;
	}
	return 0;
};

/**
 * @name getMotion6
 * @return array | false
 */
mpu9250.prototype.getMotion6 = function() {
	if (this.i2c) {
		var buffer = this.i2c.readBytes(MPU9250.ACCEL_XOUT_H, 14, function() {});
		var gCal = this._config.gyroBiasOffset;
		var aCal = this._config.accelCalibration;

		var xAccel = buffer.readInt16BE(0) * this.accelScalarInv;
		var yAccel = buffer.readInt16BE(2) * this.accelScalarInv;
		var zAccel = buffer.readInt16BE(4) * this.accelScalarInv;

		return [
			scaleAccel(xAccel, aCal.offset.x, aCal.scale.x),
			scaleAccel(yAccel, aCal.offset.y, aCal.scale.y),
			scaleAccel(zAccel, aCal.offset.z, aCal.scale.z),
			// Skip Temperature - bytes 6:7
			buffer.readInt16BE(8) * this.gyroScalarInv + gCal.x,
			buffer.readInt16BE(10) * this.gyroScalarInv + gCal.y,
			buffer.readInt16BE(12) * this.gyroScalarInv + gCal.z
		];
	}
	return false;
};

/**
 * This wee function just simplifies the code.  It scales the Accelerometer values appropriately.
 * The values are scaled to 1g and the offset it taken into account.
 */
function scaleAccel(val, offset, scalerArr) {
	if (val < 0) {
		return -(val - offset) / (scalerArr[0] - offset);
	} else {
		return (val - offset) / (scalerArr[1] - offset);
	}
}

/**
 * @name getMotion9
 * @return array | false
 */
mpu9250.prototype.getMotion9 = function() {
	if (this.i2c) {
		var mpudata = this.getMotion6();
        var magdata;
		if (this.ak8963) {
			magdata = this.ak8963.getMagAttitude();
		} else {
			magdata = [0, 0, 0];
		}
		return mpudata.concat(magdata);
	}
	return false;
};


/**
 * @name getAccel
 * @return array | false
 */
mpu9250.prototype.getAccel = function() {
	if (this.i2c) {
		var buffer = this.i2c.readBytes(MPU9250.ACCEL_XOUT_H, 6, function() {});
		var aCal = this._config.accelCalibration;

		var xAccel = buffer.readInt16BE(0) * this.accelScalarInv;
		var yAccel = buffer.readInt16BE(2) * this.accelScalarInv;
		var zAccel = buffer.readInt16BE(4) * this.accelScalarInv;

		return [
			scaleAccel(xAccel, aCal.offset.x, aCal.scale.x),
			scaleAccel(yAccel, aCal.offset.y, aCal.scale.y),
			scaleAccel(zAccel, aCal.offset.z, aCal.scale.z)
		];
	}
	return false;
};

/**
 * @name getAccel
 * @return array | false
 */
mpu9250.prototype.getGyro = function() {
	if (this.i2c) {
		var buffer = this.i2c.readBytes(MPU9250.GYRO_XOUT_H, 6, function() {});
		var gCal = this._config.gyroBiasOffset;
		return [
			buffer.readInt16BE(0) * this.gyroScalarInv + gCal.x,
			buffer.readInt16BE(2) * this.gyroScalarInv + gCal.y,
			buffer.readInt16BE(4) * this.gyroScalarInv + gCal.z
		];
	}
	return false;
};

/**
 * @name getSleepEnabled
 * @return number | false
 */
mpu9250.prototype.getSleepEnabled = function() {
	if (this.i2c) {
		return this.i2c.readBit(MPU9250.RA_PWR_MGMT_1, MPU9250.PWR1_SLEEP_BIT);
	}
	return false;
};

/**
 * @name getClockSource
 * @return number | false
 */
mpu9250.prototype.getClockSource = function() {
	if (this.i2c) {
		return this.i2c.readByte(MPU9250.RA_PWR_MGMT_1) & 0x07;
	}
	return false;
};

/**
 * @name getFullScaleGyroRange
 * @return number | false
 */
mpu9250.prototype.getFullScaleGyroRange = function() {
	if (this.i2c) {
		var byte = this.i2c.readByte(MPU9250.RA_GYRO_CONFIG);
		byte = byte & 0x18;
		byte = byte >> 3;
		return byte;
	}
	return false;
};

/**
 * @name getGyroPowerSettings
 * @return array
 */
mpu9250.prototype.getGyroPowerSettings = function() {
	if (this.i2c) {
		var byte = this.i2c.readByte(MPU9250.RA_PWR_MGMT_2);
		byte = byte & 0x07;
		return [
			(byte >> 2) & 1,    // X
			(byte >> 1) & 1,    // Y
			(byte >> 0) & 1	    // Z
		];
	}
	return false;
};

/**
 * @name getAccelPowerSettings
 * @return array
 */
mpu9250.prototype.getAccelPowerSettings = function() {
	if (this.i2c) {
		var byte = this.i2c.readByte(MPU9250.RA_PWR_MGMT_2);
		byte = byte & 0x38;
		return [
			(byte >> 5) & 1,    // X
			(byte >> 4) & 1,    // Y
			(byte >> 3) & 1	    // Z
		];
	}
	return false;
};

/**
 * @name getFullScaleAccelRange
 * @return number | false
 */
mpu9250.prototype.getFullScaleAccelRange = function() {
	if (this.i2c) {
		var byte = this.i2c.readByte(MPU9250.RA_ACCEL_CONFIG_1);
		byte = byte & 0x18;
		byte = byte >> 3;
		return byte;
	}
	return false;
};

/**
 * @name getByPASSEnabled
 * @return number | false
 */
mpu9250.prototype.getByPASSEnabled = function() {
	if (this.i2c) {
		return this.i2c.readBit(MPU9250.RA_INT_PIN_CFG, MPU9250.INTCFG_BYPASS_EN_BIT);
	}
	return false;
};

/**
 * @name getI2CMasterMode
 * @return undefined | false
 */
mpu9250.prototype.getI2CMasterMode = function() {
	if (this.i2c) {
		return this.i2c.readBit(MPU9250.RA_USER_CTRL, MPU9250.USERCTRL_I2C_MST_EN_BIT);
	}
	return false;
};

mpu9250.prototype.getPitch = function(value) {
	return ((Math.atan2(value[0], value[2]) + Math.PI) * (180 / Math.PI)) - 180;
};

mpu9250.prototype.getRoll = function(value) {
	return ((Math.atan2(value[1], value[2]) + Math.PI) * (180 / Math.PI)) - 180;
};

mpu9250.prototype.getYaw = function(value) {
	return 0;
};

/**---------------------|[ SET ]|--------------------**/

/**
 * @name setClockSource
 * @return undefined | false
 */
mpu9250.prototype.setClockSource = function(adrs) {
	if (this.i2c) {
		return this.i2c.writeBits(MPU9250.RA_PWR_MGMT_1, MPU9250.PWR1_CLKSEL_BIT, MPU9250.PWR1_CLKSEL_LENGTH, adrs);
	}
	return false;
};

/**
 * @name setFullScaleGyroRange
 * @return undefined | false
 */
mpu9250.prototype.setFullScaleGyroRange = function(adrs) {
	if (this.i2c) {
		if (this._config.scaleValues) {
			this.gyroScalarInv = 1 / MPU9250.GYRO_SCALE_FACTOR[adrs];
		} else {
			this.gyroScalarInv = 1;
		}
		return this.i2c.writeBits(MPU9250.RA_GYRO_CONFIG, MPU9250.GCONFIG_FS_SEL_BIT, MPU9250.GCONFIG_FS_SEL_LENGTH, adrs);
	}
	return false;
};

/**
 * @name setFullScaleAccelRange
 * @return undefined | false
 */
mpu9250.prototype.setFullScaleAccelRange = function(adrs) {
	if (this.i2c) {
		if (this._config.scaleValues) {
			this.accelScalarInv = 1 / MPU9250.ACCEL_SCALE_FACTOR[adrs];
		} else {
			this.accelScalarInv = 1;
		}
		return this.i2c.writeBits(MPU9250.RA_ACCEL_CONFIG_1, MPU9250.ACONFIG_FS_SEL_BIT, MPU9250.ACONFIG_FS_SEL_LENGTH, adrs);
	}
	return false;
};

/**
 * @name setSleepEnabled
 * @return undefined | false
 */
mpu9250.prototype.setSleepEnabled = function(bool) {
	var val = bool ? 1 : 0;
	if (this.i2c) {
		return this.i2c.writeBit(MPU9250.RA_PWR_MGMT_1, MPU9250.PWR1_SLEEP_BIT, val);
	}
	return false;
};

/**
 * @name setI2CMasterModeEnabled
 * @return undefined | false
 */
mpu9250.prototype.setI2CMasterModeEnabled = function(bool) {
	var val = bool ? 1 : 0;
	if (this.i2c) {
		return this.i2c.writeBit(MPU9250.RA_USER_CTRL, MPU9250.USERCTRL_I2C_MST_EN_BIT, val);
	}
	return false;
};

/**
 * @name setByPASSEnabled
 * @return undefined | false
 */
mpu9250.prototype.setByPASSEnabled = function(bool) {
	var adrs = bool ? 1 : 0;
	if (this.i2c) {
		return this.i2c.writeBit(MPU9250.RA_INT_PIN_CFG, MPU9250.INTCFG_BYPASS_EN_BIT, adrs);
	}
	return false;
};


/**---------------------|[ Print ]|--------------------**/

/**
 * @name printAccelSettings
 */
mpu9250.prototype.printSettings = function() {
    var CLK_RNG = [
        '0 (Internal 20MHz oscillator)',
        '1 (Auto selects the best available clock source)',
        '2 (Auto selects the best available clock source)',
        '3 (Auto selects the best available clock source)',
        '4 (Auto selects the best available clock source)',
        '5 (Auto selects the best available clock source)',
        '6 (Internal 20MHz oscillator)',
        '7 (Stops the clock and keeps timing generator in reset)'
    ];
    this.debug.Log('INFO', 'MPU9250:');
	this.debug.Log('INFO', '--> Device address: 0x' + this._config.address.toString(16));
	this.debug.Log('INFO', '--> i2c bus: ' + this._config.device);
    this.debug.Log('INFO', '--> Device ID: 0x' + this.getIDDevice().toString(16));
    this.debug.Log('INFO', '--> BYPASS enabled: ' + (this.getByPASSEnabled() ? 'Yes' : 'No'));
	this.debug.Log('INFO', '--> SleepEnabled Mode: ' + (this.getSleepEnabled() === 1 ? 'On' : 'Off'));
	this.debug.Log('INFO', '--> i2c Master Mode: ' + (this.getI2CMasterMode() === 1 ? 'Enabled' : 'Disabled'));
    this.debug.Log('INFO', '--> Power Management (0x6B, 0x6C):');
    this.debug.Log('INFO', '  --> Clock Source: ' + CLK_RNG[this.getClockSource()]);
    this.debug.Log('INFO', '  --> Accel enabled (x, y, z): ' + vectorToYesNo(this.getAccelPowerSettings()));
    this.debug.Log('INFO', '  --> Gyro enabled (x, y, z): ' + vectorToYesNo(this.getGyroPowerSettings()));
};

function vectorToYesNo(v) {
    var str = '(';
    str += v[0] ? 'No, ' : 'Yes, ';
    str += v[1] ? 'No, ' : 'Yes, ';
    str += v[2] ? 'No' : 'Yes';
    str += ')';
    return str;
}

mpu9250.prototype.printAccelSettings = function() {
    var FS_RANGE = [ '±2g (0)', '±4g (1)', '±8g (2)', '±16g (3)' ];
	this.debug.Log('INFO', 'Accelerometer:');
	this.debug.Log('INFO', '--> Full Scale Range (0x1C): ' + FS_RANGE[this.getFullScaleAccelRange()]);
	this.debug.Log('INFO', '--> Scalar: 1/' + (1 / this.accelScalarInv));
	this.debug.Log('INFO', '--> Calibration:');
	this.debug.Log('INFO', '  --> Offset: ');
	this.debug.Log('INFO', '    --> x: ' + this._config.accelCalibration.offset.x);
	this.debug.Log('INFO', '    --> y: ' + this._config.accelCalibration.offset.y);
	this.debug.Log('INFO', '    --> z: ' + this._config.accelCalibration.offset.z);
	this.debug.Log('INFO', '  --> Scale: ');
	this.debug.Log('INFO', '    --> x: ' + this._config.accelCalibration.scale.x);
	this.debug.Log('INFO', '    --> y: ' + this._config.accelCalibration.scale.y);
	this.debug.Log('INFO', '    --> z: ' + this._config.accelCalibration.scale.z);
};

mpu9250.prototype.printGyroSettings = function() {
    var FS_RANGE = ['+250dps (0)', '+500 dps (1)', '+1000 dps (2)', '+2000 dps (3)'];
	this.debug.Log('INFO', 'Gyroscope:');
    this.debug.Log('INFO', '--> Full Scale Range (0x1B): ' + FS_RANGE[this.getFullScaleGyroRange()]);
	this.debug.Log('INFO', '--> Scalar: 1/' + (1 / this.gyroScalarInv));
	this.debug.Log('INFO', '--> Bias Offset:');
	this.debug.Log('INFO', '  --> x: ' + this._config.gyroBiasOffset.x);
	this.debug.Log('INFO', '  --> y: ' + this._config.gyroBiasOffset.y);
	this.debug.Log('INFO', '  --> z: ' + this._config.gyroBiasOffset.z);
};


////////////////////////////////////////////////////////////////////////////////////
// /** ---------------------------------------------------------------------- **/ //
//  *		 					Magnetometer Configuration					   *  //
// /** ---------------------------------------------------------------------- **/ //
////////////////////////////////////////////////////////////////////////////////////

var ak8963 = function(config, callback) {
	callback = callback || function() {};
	this._config = config;
	this.debug = new debugConsole(config.DEBUG);
	this._config.ak_address = this._config.ak_address || AK8963.ADDRESS;
	this._config.magCalibration = this._config.magCalibration || AK8963.DEFAULT_CALIBRATION;

	// connection with magnetometer
	this.i2c = new LOCAL_I2C(this._config.ak_address, {device: this._config.device});
	sleep.usleep(10000);
	var buffer = this.getIDDevice();

	if (buffer & AK8963.WHO_AM_I_RESPONSE) {
		this.getSensitivityAdjustmentValues();
		sleep.usleep(10000);
		this.setCNTL(AK8963.CNTL_MODE_CONTINUE_MEASURE_2);
	} else {
		this.debug.Log('ERROR', 'AK8963: Device ID is not equal to 0x' + AK8963.WHO_AM_I_RESPONSE.toString(16) + ', device value is 0x' + buffer.toString(16));
	}
	callback(true);
};

ak8963.prototype.printSettings = function() {
	var MODE_LST = {
		0: '0x00 (Power-down mode)',
		1: '0x01 (Single measurement mode)',
		2: '0x02 (Continuous measurement mode 1: 8Hz)',
		6: '0x06 (Continuous measurement mode 2: 100Hz)',
		4: '0x04 (External trigger measurement mode)',
		8: '0x08 (Self-test mode)',
		15: '0x0F (Fuse ROM access mode)'
	};

	this.debug.Log('INFO', 'Magnetometer (Compass):');
	this.debug.Log('INFO', '--> i2c address: 0x' + this._config.ak_address.toString(16));
	this.debug.Log('INFO', '--> Device ID: 0x' + this.getIDDevice().toString(16));
	this.debug.Log('INFO', '--> Mode: ' + MODE_LST[this.getCNTL() & 0x0F]);
	this.debug.Log('INFO', '--> Scalars:');
	this.debug.Log('INFO', '  --> x: ' + this.asax);
	this.debug.Log('INFO', '  --> y: ' + this.asay);
	this.debug.Log('INFO', '  --> z: ' + this.asaz);
};

/**------------------|[ FUNCTION ]|------------------**/


/**---------------------|[ GET ]|--------------------**/

/**
 * @name getDataReady
 * @return number | false
 */
ak8963.prototype.getDataReady = function() {
	if (this.i2c) {
		return this.i2c.readBit(AK8963.ST1, AK8963.ST1_DRDY_BIT);
	}
	return false;
};


/**
 * @name getIDDevice
 * @return number | false
 */
ak8963.prototype.getIDDevice = function() {
	if (this.i2c) {
		return this.i2c.readByte(AK8963.WHO_AM_I);
	}
	return false;
};

/**
 * Get the Sensitivity Adjustment values.  These were set during manufacture and allow us to get the actual H values
 * from the magnetometer.
 * @name getSensitivityAdjustmentValues
 */
ak8963.prototype.getSensitivityAdjustmentValues = function () {

	if (!this._config.scaleValues) {
		this.asax = 1;
		this.asay = 1;
		this.asaz = 1;
		return;
	}

	// Need to set to Fuse mode to get valid values from this.
	var currentMode = this.getCNTL();
	this.setCNTL(AK8963.CNTL_MODE_FUSE_ROM_ACCESS);
	sleep.usleep(10000);

	// Get the ASA* values
	this.asax = ((this.i2c.readByte(AK8963.ASAX) - 128) * 0.5 / 128 + 1);
	this.asay = ((this.i2c.readByte(AK8963.ASAY) - 128) * 0.5 / 128 + 1);
	this.asaz = ((this.i2c.readByte(AK8963.ASAZ) - 128) * 0.5 / 128 + 1);

	// Return the mode we were in before
	this.setCNTL(currentMode);

};

/**
 * Get the raw magnetometer values
 * @name getMagAttitude
 * @return array
 */
ak8963.prototype.getMagAttitude = function() {

	// Get the actual data
	var buffer = this.i2c.readBytes(AK8963.XOUT_L, 6, function(e, r) {});
	var cal = this._config.magCalibration;

	// For some reason when we read ST2 (Status 2) just after reading byte, this ensures the
	// next reading is fresh.  If we do it before without a pause, only 1 in 15 readings will
	// be fresh.  The setTimeout ensures this read goes to the back of the queue, once all other
	// computation is done.
	var self = this;
	setTimeout(function () {
		self.i2c.readByte(AK8963.ST2);
	}, 0);

	return [
		((buffer.readInt16LE(0) * this.asax) - cal.offset.x) * cal.scale.x,
		((buffer.readInt16LE(2) * this.asay) - cal.offset.y) * cal.scale.y,
		((buffer.readInt16LE(4) * this.asaz) - cal.offset.z) * cal.scale.z
	];
};

/**
 * @name getCNTL
 * @return byte | false
 */
ak8963.prototype.getCNTL = function() {
	if (this.i2c) {
		return this.i2c.readByte(AK8963.CNTL);
	}
	return false;
};

/**---------------------|[ SET ]|--------------------**/

/**
 * @name setCNTL
 * CNTL_MODE_OFF: 0x00, // Power-down mode
 * CNTL_MODE_SINGLE_MEASURE: 0x01, // Single measurement mode
 * CNTL_MODE_CONTINUE_MEASURE_1: 0x02, // Continuous measurement mode 1
 * CNTL_MODE_CONTINUE_MEASURE_2: 0x06, // Continuous measurement mode 2
 * CNTL_MODE_EXT_TRIG_MEASURE: 0x04, // External trigger measurement mode
 * CNTL_MODE_SELF_TEST_MODE: 0x08, // Self-test mode
 * CNTL_MODE_FUSE_ROM_ACCESS: 0x0F  // Fuse ROM access mode
 * @return undefined | false
 */
ak8963.prototype.setCNTL = function(mode) {
	if (this.i2c) {
		return this.i2c.writeBytes(AK8963.CNTL, [mode], function(){});
	}
	return false;
};

ak8963.prototype.constructor = ak8963;

////////////////////////////////////////////////////////////////////////////////////
// /** ---------------------------------------------------------------------- **/ //
//  *		 				Kalman filter									   *  //
// /** ---------------------------------------------------------------------- **/ //
////////////////////////////////////////////////////////////////////////////////////

mpu9250.prototype.Kalman_filter = function() {
	this.Q_angle = 0.001;
	this.Q_bias = 0.003;
	this.R_measure = 0.03;

	this.angle = 0;
	this.bias = 0;
	this.rate = 0;

	this.P = [[0, 0], [0, 0]];

	this.S = 0;
	this.K = [];
	this.Y = 0;

	this.getAngle = function(newAngle, newRate, dt) {

		this.rate = newRate - this.bias;
		this.angle += dt * this.rate;

		this.P[0][0] += dt * (dt * this.P[1][1] - this.P[0][1] - this.P[1][0] + this.Q_angle);
		this.P[0][1] -= dt * this.P[1][1];
		this.P[1][0] -= dt * this.P[1][1];
		this.P[1][1] += this.Q_bias * dt;

		this.S = this.P[0][0] + this.R_measure;

		this.K[0] = this.P[0][0] / this.S;
		this.K[1] = this.P[1][0] / this.S;

		this.Y = newAngle - this.angle;

		this.angle += this.K[0] * this.Y;
		this.bias += this.K[1] * this.Y;

		this.P[0][0] -= this.K[0] * this.P[0][0];
		this.P[0][1] -= this.K[0] * this.P[0][1];
		this.P[1][0] -= this.K[1] * this.P[0][0];
		this.P[1][1] -= this.K[1] * this.P[0][1];

		return this.angle;
	};

	this.getRate     = function() { return this.rate; };
	this.getQangle   = function() { return this.Q_angle; };
	this.getQbias    = function() { return this.Q_bias; };
	this.getRmeasure = function() { return this.R_measure; };

	this.setAngle    = function(value) { this.angle = value; };
	this.setQangle   = function(value) { this.Q_angle = value; };
	this.setQbias    = function(value) { this.Q_bias = value; };
	this.setRmeasure = function(value) { this.R_measure = value; };
};


////////////////////////////////////////////////////////////////////////////////////
// /** ---------------------------------------------------------------------- **/ //
//  *		 					Debug Console Configuration					   *  //
// /** ---------------------------------------------------------------------- **/ //
////////////////////////////////////////////////////////////////////////////////////

var debugConsole = function(debug) {
	this.enabled = debug || false;
};
debugConsole.prototype.Log = function(type, str) {
	if (this.enabled) {
		var date = new Date();
		var strdate = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
		var strhour = date.getHours() + ':' + date.getMinutes();
		console.log('[' + type.toUpperCase() + '][' + strhour + ' ' + strdate + ']:' + str);
	}
};
debugConsole.prototype.constructor = debugConsole;

////////////////////////////////////////////////////////////////////////////////////
// /** ---------------------------------------------------------------------- **/ //
//  *		 					I2C SURCHARGE Configuration					   *  //
// /** ---------------------------------------------------------------------- **/ //
////////////////////////////////////////////////////////////////////////////////////

var LOCAL_I2C = function(adrs, params) {
	MOD_I2C.call(this, adrs, params);
};

LOCAL_I2C.prototype = Object.create(MOD_I2C.prototype);
LOCAL_I2C.prototype.constructor = LOCAL_I2C;

LOCAL_I2C.prototype.bitMask = function(bit, length) {
  return ((1 << length) - 1) << bit;
};

LOCAL_I2C.prototype.readByte = function(adrs, callback) {
	callback = callback || function() {};
	var buf = this.readBytes(adrs, 1, callback);
	return buf[0];
};

/**
 * Return the bit value, 1 or 0.
 * @param  {number}   adrs     The address of the byte to read.
 * @param  {number}   bit      The nth bit.
 * @param  {Function} callback (Optional) callback
 * @return {number}            1 or 0.
 */
LOCAL_I2C.prototype.readBit = function(adrs, bit, callback) {
	var buf = this.readByte(adrs, callback);
	return (buf >> bit) & 1;
};

/**
 * Write a sequence of bits.  Note, this will do a read to get the existing value, then a write.
 * @param  {number}   adrs     The address of the byte to write.
 * @param  {number}   bit      The nth bit to start at.
 * @param  {number}   length   The number of bits to change.
 * @param  {number}   value    The values to change.
 * @param  {Function} callback (Optional) callback
 */
LOCAL_I2C.prototype.writeBits = function(adrs, bit, length, value, callback) {
	callback = callback || function() {};
	var oldValue = this.readByte(adrs);
	var mask = this.bitMask(bit, length);
	var newValue = oldValue ^ ((oldValue ^ (value << bit)) & mask);
	return this.writeBytes(adrs, [newValue], callback);
};

/**
 * Write one bit.  Note, this will do a read to get the existing value, then a write.
 * @param  {number}   adrs     The address of the byte to write.
 * @param  {number}   bit      The nth bit.
 * @param  {number}   value    The new value, 1 or 0.
 * @param  {Function} callback (Optional) callback
 */
LOCAL_I2C.prototype.writeBit = function(adrs, bit, value, callback) {
	return this.writeBits(adrs, bit, 1, value, callback);
};

/*******************************/
/** export the module to node **/
/*******************************/

module.exports = mpu9250;
