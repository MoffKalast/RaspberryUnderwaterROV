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

/**
 * Calibarate the magnometer.
 *
 * Usage:
 *     node calibrate_mag.js
 *
 * Once the calibration is started you will want to move the sensor around all axes.  What we want is to find the
 * extremes (min/max) of the x, y, z values such that we can find the offset and scale values.
 *
 * The output will be JSON text.  You can use this as input for the mpu9250, as an option.
 *
 * These calibration calculations are based on this page:
 * http://www.camelsoftware.com/2016/03/13/imu-maths-calculate-orientation-pt3/
 */

// Instantiate and initialize.
var mpu9250 = require('./mpu9250');
var mpu = new mpu9250({
    device: '/dev/i2c-1',
    scaleValues: true,
    UpMagneto: true
});

var min = {
    x: Infinity,
    y: Infinity,
    z: Infinity
};
var max = {
    x: -Infinity,
    y: -Infinity,
    z: -Infinity
};
var count = 0;
var MAX_NUM = 1000;

console.log('Rotate the magnometer around all 3 axes, until the min and max values don\'t change anymore.');

if (mpu.initialize()) {

    console.log('    x        y        z      min x    min y    min z    max x    max y    max z');

    setInterval(function () {
        if (count++ > MAX_NUM) {
            wrapUp();
        }
        var magdata = mpu.ak8963.getMagAttitude();
        min.x = Math.min(min.x, magdata[0]);
        min.y = Math.min(min.y, magdata[1]);
        min.z = Math.min(min.z, magdata[2]);

        max.x = Math.max(max.x, magdata[0]);
        max.y = Math.max(max.y, magdata[1]);
        max.z = Math.max(max.z, magdata[2]);

        process.stdout.write(p(magdata[0]) + p(magdata[1]) + p(magdata[2]) + p(min.x) + p(min.y) + p(min.z) + p(max.x) + p(max.y) + p(max.z) + '\r');
    }, 50);
}

function p(num) {
    var str = num.toFixed(3);
    while (str.length <= 7) {
        str = ' ' + str;
    }
    return str + ' ';
}

var offset = {};
var scale = {};
function calcCalibration() {
    offset = {
        x: (min.x + max.x) / 2,
        y: (min.y + max.y) / 2,
        z: (min.z + max.z) / 2
    };
    var vmax = {
        x: max.x - ((min.x + max.x) / 2),
        y: max.y - ((min.y + max.y) / 2),
        z: max.z - ((min.z + max.z) / 2)
    };
    var vmin = {
        x: min.x - ((min.x + min.x) / 2),
        y: min.y - ((min.y + min.y) / 2),
        z: min.z - ((min.z + min.z) / 2)
    };
    var avg = {
        x: (vmax.x - vmin.x) / 2,
        y: (vmax.y - vmin.y) / 2,
        z: (vmax.z - vmin.z) / 2
    };
    var avg_radius = (avg.x + avg.y + avg.z) / 2;
    scale = {
        x: avg_radius / avg.x,
        y: avg_radius / avg.y,
        z: avg_radius / avg.z
    };
}

function wrapUp() {
    console.log('\n');
    calcCalibration();
    console.log({
        min: min,
        max: max,
        offset: offset,
        scale: scale
    });

    var exit = process.exit;
    exit(0);
}
