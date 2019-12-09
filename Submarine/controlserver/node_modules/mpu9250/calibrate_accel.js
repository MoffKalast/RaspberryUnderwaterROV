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

var NUM_READS = 300;

/**
 * Calibrate the Accelerometer.  This device will need to be rotated with the X, Y and Z axes up and down.  The axis
 * you point up/down will be calibrated against gravity (so you must have it vertical).  You may want to hold it against
 * a wall or similar.  While the one axis is being calibrated against gravity, the other two axes will be perpendicular
 * to gravity, so will read near zero, this value will be used as the offset.
 *
 * The scaling is simple linear scaling, based on the common formular for a line, y = m * x + c, where y is our scaled
 * and offset result, while x is the raw value.  This formular is actually applied in the main mpu9250.js file.  But
 * this calibration process outputs those values.
 */

// Instantiate and initialize.
var mpu9250 = require('./mpu9250');
var sleep = require('sleep');

var mpu = new mpu9250({
    device: '/dev/i2c-2',
    scaleValues: true,
    UpMagneto: false
});

var axis = -1;
var axes = ['X', 'Y', 'Z'];
var dir = 'down';
var directions = {
    'up': 1,
    'down': -1
};
var offset = [0, 0, 0];
var scale = [[0, 0], [0, 0], [0, 0]];

if (mpu.initialize()) {
    runNextCapture();
}

/**
 * Set up the next capture for an axis and a direction (up / down).
 */
function runNextCapture() {
    if (dir === 'up') {
        dir = 'down';
    } else {
        axis += 1;
        dir = 'up';
    }
    if (axis === 3) {
        wrapUp();
    }
    console.log('Point the ' + axes[axis] + ' axis arrow ' + dir + '.');
    pressEnterKeyToContinue(function () {
        calibrateAxis(axis, dir);
        runNextCapture();
    });
}

/**
 * This will syncronuously read the accel data from MPU9250.  It will gather the offset and scalar values.
 */
function calibrateAxis() {
    var scaleDir = dir === 'down' ? 0 : 1;

    console.log('Reading values - hold still');
    for (var i = 0; i < NUM_READS; i++) {
        var accelValues = mpu.getAccel();

        for (var a = 0; a < 3; a += 1) {
            if (a === axis) {
                scale[a][scaleDir] += accelValues[a];
            } else {
                offset[a] += accelValues[a];
            }
        }
        sleep.usleep(5000);
    }
}

/**
 * Called when we are done.
 */
function wrapUp() {
    for (var i = 0; i < 3; i++) {
        offset[i] = offset[i] / (NUM_READS * 4);
        scale[i][0] = scale[i][0] / NUM_READS;
        scale[i][1] = scale[i][1] / NUM_READS;
    }
    var calibration = {
        offset: {
            x: offset[0],
            y: offset[1],
            z: offset[2]
        },
        scale: {
            x: scale[0],
            y: scale[1],
            z: scale[2]
        }
    };

    console.log('ACCEL_CALIBRATION = ', calibration);
    var exit = process.exit;
    exit();
}

/**
 * This will ask the user to press the ENTER key to continue.  Then run the callback.
 * @param  {Function} callback
 */
function pressEnterKeyToContinue(callback) {
    console.log('Press ENTER to continue.');

    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    var util = require('util');

    var called = false;
    process.stdin.on('data', function (text) {
        if (called) return;
        if (text === '\n') {
            called = true;
            callback();
            console.log();
        }
    });

}
