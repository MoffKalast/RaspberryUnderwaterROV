var i2c = require('i2c');
var Accelerometer = require('./accelerometer')
var Magnetometer = require('./magnetometer')

function LSM303() {
    this.accel = null;
    this.mag = null;
}

LSM303.prototype.accelerometer = function(options){
    if (this.accel == null) {
        this.accel = new Accelerometer(options);
    }
    return this.accel;
}

LSM303.prototype.magnetometer = function(options){
    if (this.mag == null) {
        this.mag = new Magnetometer(options);
    }
    return this.mag;
}

module.exports = LSM303;