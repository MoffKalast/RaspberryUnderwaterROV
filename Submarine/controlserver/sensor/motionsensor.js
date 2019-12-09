'use strict';
const mpu9250 = require('mpu9250');

const MAG_CALIBRATION = {
	min: { x: -102.265625, y: -42.65625, z: -114.84375 },
    max: { x: 62.5625, y: 123.09375, z: 51.5625 },
    offset: { x: -19.8515625, y: 40.21875, z: -31.640625 },
    scale: {
		x: 1.5075836572186938,
		y: 1.4991987179487178,
		z: 1.4932863849765259
    }
};

const GYRO_OFFSET = {
	x: -0.6576793893129768,
	y: -0.2815419847328243,
	z: -0.09383206106870222
};

const ACCEL_CALIBRATION =  {
    offset: {
		x: -0.011075846354166667,
		y: 0.0245098876953125,
		z: 0.052537027994791666
	},
	scale: {
		x: [ -0.9994921875, 0.99931884765625 ],
		y: [ -0.9847355143229166, 1.0162939453125 ],
		z: [ -0.9702555338541666, 1.04728515625 ]
	}
};

class MotionSensor{

	constructor(){

		this.mpu = new mpu9250({
		    device: '/dev/i2c-1',
		    DEBUG: false,

		    // Set the Gyroscope sensitivity (default 0), where:
		    //      0 => 250 degrees / second
		    //      1 => 500 degrees / second
		    //      2 => 1000 degrees / second
		    //      3 => 2000 degrees / second
		    GYRO_FS: 0,

		    // Set the Accelerometer sensitivity (default 2), where:
		    //      0 => +/- 2 g
		    //      1 => +/- 4 g
		    //      2 => +/- 8 g
		    //      3 => +/- 16 g
		    ACCEL_FS: 0,

		    scaleValues: true,
		    UpMagneto: true,
		    magCalibration: MAG_CALIBRATION,
		    gyroBiasOffset: GYRO_OFFSET,
		    accelCalibration: ACCEL_CALIBRATION
		});

		if (!this.mpu.initialize())
			console.log("AHRS sensor not initialized.")
	}

	readData(callback){
		let m = this.mpu.getMotion9();// Accel.x  Accel.y  Accel.z  Gyro.x   Gyro.y   Gyro.z   Mag.x   Mag.y   Mag.z

		let pack = {
			accel: {
				x: m[0],
				y: m[1],
				z: m[2]
			},
			gyro: {
				x: m[3] * Math.PI / 180.0,
				y: m[4] * Math.PI / 180.0,
				z: m[5] * Math.PI / 180.0
			},
			mag: {
				x: m[7],
				y: m[6],
				z: -m[8]
			},
			//temp: this.mpu.getTemperatureCelsiusDigital()
		}

		callback(pack);
	}
}

module.exports = MotionSensor;
