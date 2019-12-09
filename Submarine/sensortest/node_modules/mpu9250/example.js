'use strict';

var mpu9250 = require('./mpu9250');

// These values were generated using calibrate_mag.js - you will want to create your own.
var MAG_CALIBRATION = {
    min: { x: -106.171875, y: -56.8125, z: -14.828125 },
    max: { x: 71.9609375, y: 117.17578125, z: 164.25 },
    offset: { x: -17.10546875, y: 30.181640625, z: 74.7109375 },
    scale: {
        x: 1.491020130696022,
        y: 1.5265373476123123,
        z: 1.483149376145188
    }
};

// These values were generated using calibrate_gyro.js - you will want to create your own.
// NOTE: These are temperature dependent.
var GYRO_OFFSET = {
    x: -1.068045801,
    y: -0.156656488,
    z: 1.3846259541
};

// These values were generated using calibrate_accel.js - you will want to create your own.
var ACCEL_CALIBRATION = {
    offset: {
        x: 0.00943176,
        y: 0.00170817,
        z: 0.05296142
    },
    scale: {
        x: [-0.9931640, 1.0102189],
        y: [-0.9981974, 1.0055884],
        z: [-0.9598844, 1.0665967]
    }
};

// Instantiate and initialize.
var mpu = new mpu9250({
    // i2c path (default is '/dev/i2c-1')
    device: '/dev/i2c-2',

    // Enable/Disable debug mode (default false)
    DEBUG: true,

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

if (mpu.initialize()) {

    var ACCEL_NAME = 'Accel (g)';
    var GYRO_NAME = 'Gyro (°/sec)';
    var MAG_NAME = 'Mag (uT)';
    var HEADING_NAME = 'Heading (°)';
    var stats = new Stats([ACCEL_NAME, GYRO_NAME, MAG_NAME, HEADING_NAME], 1000);

    console.log('\n   Time     Accel.x  Accel.y  Accel.z  Gyro.x   Gyro.y   Gyro.z   Mag.x   Mag.y   Mag.z    Temp(°C) heading(°)');
    var cnt = 0;
    var lastMag = [0, 0, 0];
    setInterval(function() {
        var start = new Date().getTime();
        var m9;
        // Only get the magnetometer values every 100Hz
        var getMag = cnt++ % 2;
        if (getMag) {
            m9 = mpu.getMotion6().concat(lastMag);
        } else {
            m9 = mpu.getMotion9();
            lastMag = [m9[6], m9[7], m9[8]];
        }
        var end = new Date().getTime();
        var t = (end - start) / 1000;

        // Make the numbers pretty
        var str = '';
        for (var i = 0; i < m9.length; i++) {
            str += p(m9[i]);
        }
        stats.add(ACCEL_NAME, m9[0], m9[1], m9[2]);
        stats.add(GYRO_NAME, m9[3], m9[4], m9[5]);
        if (getMag) {
            stats.add(MAG_NAME, m9[6], m9[7], m9[8]);
            stats.addValue(HEADING_NAME, calcHeading(m9[6], m9[7]));
        }

        process.stdout.write(p(t) + str + p(mpu.getTemperatureCelsiusDigital()) + p(calcHeading(m9[6], m9[7])) + '  \r');
    }, 5);
}

function p(num) {
    if (num === undefined) {
        return '       ';
    }
    var str = num.toFixed(3);
    while (str.length <= 7) {
        str = ' ' + str;
    }
    return str + ' ';
}

function calcHeading(x, y) {
    var heading = Math.atan2(y, x) * 180 / Math.PI;

    if (heading < -180) {
        heading += 360;
    } else if (heading > 180) {
        heading -= 360;
    }

    return heading;
}


/**
 * Calculate Statistics
 * @param {[string]} names The names of the vectors.
 */
function Stats(vectorNames, numStats) {

    this.vectorNames = vectorNames;
    this.numStats = numStats;
    this.vectors = {};
    this.done = false;

    for (var i = 0; i < vectorNames.length; i += 1) {
        var name = vectorNames[i];
        this.vectors[name] = {
            x: [],
            y: [],
            z: [],
            pos: 0
        };
    }

    function exitHandler(options, err) {
        if (err) {
            console.log(err.stack);
        } else {
            this.printStats();
        }
        if (options.exit) {
            var exit = process.exit;
            exit();
        }
    }

    // do something when app is closing
    process.on('exit', exitHandler.bind(this, {cleanup: true}));

    // catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(this, {exit: true}));

    // catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind(this, {exit: true}));
}
Stats.prototype.add = function(vectorName, x, y, z) {
    var v = this.vectors[vectorName];
    var len = v.x.length;
    if (v.pos >= this.numStats) {
        v.pos = 0;
    } else {
        v.pos += 1;
    }
    v.x[v.pos] = x;
    v.y[v.pos] = y;
    v.z[v.pos] = z;
};
Stats.prototype.addValue = function(vectorName, x) {
    var v = this.vectors[vectorName];
    v.isValue = true;
    if (v.pos >= this.numStats) {
        v.pos = 0;
    } else {
        v.pos += 1;
    }
    v.x[v.pos] = x;
};
Stats.prototype.printStats = function () {
    if (this.done) return;
    this.done = true;

    console.log('\n\n\nStatistics:');
    console.log('           average   std.dev.  num.same.values');
    for (var i = 0; i < this.vectorNames.length; i += 1) {
        var name = this.vectorNames[i];
        var v = this.vectors[name];
        console.log(name + ':');
        console.log(' -> x: ', average(v.x).toFixed(5), standardDeviation(v.x).toFixed(5), numSameValues(v.x));
        if (!v.isValue) {
            console.log(' -> y: ', average(v.y).toFixed(5), standardDeviation(v.y).toFixed(5), numSameValues(v.y));
            console.log(' -> z: ', average(v.z).toFixed(5), standardDeviation(v.z).toFixed(5), numSameValues(v.z));
        }
        console.log(' -> num samples: ', v.x.length);
        console.log();
    }

    function standardDeviation(values) {
        var avg = average(values);

        var squareDiffs = values.map(function (value) {
            var diff = value - avg;
            var sqrDiff = diff * diff;
            return sqrDiff;
        });

        var avgSquareDiff = average(squareDiffs);

        var stdDev = Math.sqrt(avgSquareDiff);
        return stdDev;
    }

    function average(values) {
        var sumData = values.reduce(function (sum, value) {
            return sum + value;
        }, 0);

        var avg = sumData / values.length;
        return avg;
    }

    function numSameValues(values) {
        var same = 0;
        var lastVal = NaN;
        values.forEach(function(val) {
            if (val === lastVal) {
                same += 1;
            }
            lastVal = val;
        });
        return same;
    }
};
