# mpu9250
A node.js library for communicating with the MPU9250.
Based initially on the mpu6050 library (https://github.com/jstapels/mpu6050) by Jason Stapels.
___
## Dependencies
|   Lib.  | Version |
| ------- | ------- |
|     i2c |   0.2.3 |
|  extend |   3.0.2 |
|   sleep |   3.0.0 |
___
## Install
```
npm install mpu9250
```

## How to use it
```javascript
var mpu9250 = require('mpu9250');
// Instantiate and initialize.
var mpu = new mpu9250();
if (mpu.initialize()) {
  console.log(mpu.getMotion9());
}
```

## Parameters
```javascript
// default value
var mpu = new mpu9250({
    // i2c path (default is '/dev/i2c-1')
    device: '/dev/i2c-1',

    // mpu9250 address (default is 0x68)
    address: 0x68,

    // Enable/Disable magnetometer data (default false)
    UpMagneto: true,

    // If true, all values returned will be scaled to actual units (default false).
    // If false, the raw values from the device will be returned.
    scaleValues: false,

    // Enable/Disable debug mode (default false)
    DEBUG: false,

    // ak8963 (magnetometer / compass) address (default is 0x0C)
    ak_address: 0x0C,

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
    ACCEL_FS: 2
});
```

## Calibration

All three sensors can be calibrated and the calibrated values provided as options.  See the `example.js` file for how
to apply the calibrated values.  Run the `calibrate_accel.js`, `calibrate_mag.js` and `calibrate_gyro.js` to calibrate
the relevant sensors.  The output will display some JSON text, copy and paste this into your code. See the relevant
JavaScript source file for the documentation on the calibration. 

## Integration of Calman Filter
###Example :
```javascript

#!/usr/local/bin/node
console.log('------------------(START SCRIPT)------------------');
var port = 3031;
var io = require('socket.io').listen(port);
var mpu9250 = require('mpu9250');

var mpu = new mpu9250({UpMagneto: true, DEBUG: false, GYRO_FS: 0, ACCEL_FS: 1});

var timer = 0;

var kalmanX = new mpu.Kalman_filter();
var kalmanY = new mpu.Kalman_filter();

if (mpu.initialize()) {
	console.log('MPU VALUE : ', mpu.getMotion9());
	console.log('listen to 0.0.0.0:' + port);
	console.log('Temperature : ' + mpu.getTemperatureCelsius());
	var values = mpu.getMotion9();
	var pitch = mpu.getPitch(values);
	var roll = mpu.getRoll(values);
	var yaw = mpu.getYaw(values);
	console.log('pitch value : ', pitch);
	console.log('roll value : ', roll);
	console.log('yaw value : ', yaw);
	kalmanX.setAngle(roll);
	kalmanY.setAngle(pitch);

	var micros = function() {
		return new Date().getTime();
	};
	var dt = 0;

	timer = micros();

	var interval;

	var kalAngleX = 0,
		kalAngleY = 0,
		kalAngleZ = 0,
		gyroXangle = roll,
		gyroYangle = pitch,
		gyroZangle = yaw,
		gyroXrate = 0,
		gyroYrate = 0,
		gyroZrate = 0,
		compAngleX = roll,
		compAngleY = pitch,
		compAngleZ = yaw;

	io.on('connection', function(socket) {
		var intervalTemp;

		socket.on('disconnect', function() {
			if (interval) {
				console.log('client is dead !');
				clearInterval(interval);
			}
			if (intervalTemp) {
				clearInterval(intervalTemp);
			}
		});

		socket.on('stop_data', function (data) {
			console.log('stop send data');
			if (interval) {
				clearInterval(interval);
			}
		});

		socket.on('send_data', function(data) {
			interval = setInterval(function() {
				var values = mpu.getMotion9();

				var dt = (micros() - timer) / 1000000;
				timer = micros();

				pitch = mpu.getPitch(values);
				roll = mpu.getRoll(values);
				yaw = mpu.getYaw(values);

				var gyroXrate = values[3] / 131.0;
				var gyroYrate = values[4] / 131.0;
				var gyroZrate = values[5] / 131.0;

				if ((roll < -90 && kalAngleX > 90) || (roll > 90 && kalAngleX < -90)) {
					kalmanX.setAngle(roll);
					compAngleX = roll;
					kalAngleX = roll;
					gyroXangle = roll;
				} else {
					kalAngleX = kalmanX.getAngle(roll, gyroXrate, dt);
				}

				if (Math.abs(kalAngleX) > 90) {
					gyroYrate = -gyroYrate;
				}
				kalAngleY = kalmanY.getAngle(pitch, gyroYrate, dt);

				gyroXangle += gyroXrate * dt;
				gyroYangle += gyroYrate * dt;
				compAngleX = 0.93 * (compAngleX + gyroXrate * dt) + 0.07 * roll;
				compAngleY = 0.93 * (compAngleY + gyroYrate * dt) + 0.07 * pitch;

				if (gyroXangle < -180 || gyroXangle > 180) gyroXangle = kalAngleX;
				if (gyroYangle < -180 || gyroYangle > 180) gyroYangle = kalAngleY;

				var accel = {
					pitch: compAngleY,
					roll: compAngleX
				};

				var magneto = mpu.getCompass(values[6], values[7], values[8]);
				console.log(values[6] + ' ' + values[7] + ' ' + values[8]);
				console.log(magneto);
				socket.emit('accel_data', {accel: accel, magneto: magneto});
			}, 1);
		});

		intervalTemp = setInterval(function() {
			socket.emit('temperature', {temperature: mpu.getTemperatureCelsiusDigital()});
		}, 300);
	});
}
```
