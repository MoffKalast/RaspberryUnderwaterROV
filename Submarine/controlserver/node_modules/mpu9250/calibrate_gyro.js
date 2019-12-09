///////////////////////////////////////////////////////////////////////////////////////
//***********************************************************************************//
//**                                                                               **//
//**                                                                               **//
//** The MIT License (MIT)                                                         **//
//**                                                                               **//
//** Copyright (c) <2016> <Simon M. Werner>                                        **//
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

'use strict';

var NUM_READS = 500;

/**
 * Calibrate the gyro.  The device needs to remain still during calibration.  The calibration will
 * be applied to the gyro.  This is only simple calibration for Gyro bias for when the Gyro is still.
 * More sophisticated calibration tools can be applied.
 *
 * NOTE: The Gyro must not be moved during this process.
 *
 */

// Instantiate and initialize.
var mpu9250 = require('./mpu9250');
var sleep = require('sleep');

var mpu = new mpu9250({
    device: '/dev/i2c-2',
    scaleValues: true,
    UpMagneto: false
});

function gyroBiasCalibrationSync() {

	var avg = {
		x: 0,
		y: 0,
		z: 0
	};

	for (var i = 0; i < NUM_READS; i++) {
		var gyroValues = mpu.getGyro();
		avg.x += gyroValues[0];
		avg.y += gyroValues[1];
		avg.z += gyroValues[2];
		sleep.usleep(5000);
	}

	avg.x /= -NUM_READS;
	avg.y /= -NUM_READS;
	avg.z /= -NUM_READS;

	return avg;
}


if (mpu.initialize()) {
    console.log('Calibrating.');
    console.log('GYRO_OFFSET =', gyroBiasCalibrationSync());
}
