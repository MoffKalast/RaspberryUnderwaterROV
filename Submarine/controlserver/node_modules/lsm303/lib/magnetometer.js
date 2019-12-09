var i2c = require('i2c');
var utils = require('./util');

var mag_address = 0x1e;
var mag_device = '/dev/i2c-1'

function Magnetometer(options) {
    if (options && options.address) {
        mag_address = options.address;
    }
    if (options && options.device) {
        mag_device = options.device;
    }
    this.mag = new i2c(mag_address, {
        device: mag_device,
        debug: false
    });
    this.init();
    this.enableTempSensor();
}

Magnetometer.prototype.setOffset = function(x, y, z) {
    utils.setOffset(x, y, z);
    return;
}
Magnetometer.prototype.init = function(){
    this.mag.writeBytes(0x02, [0x00], function(err) {
        if(err){
            console.log("Error enabling Magnetometer : "+err);
        }
        else{
            console.log("Magnetometer Enabled; Set into continuous conversation mode");
        }
    });
}
Magnetometer.prototype.enableTempSensor = function(){
    this.mag.writeBytes(0x00, [0x90], function(err) {
        if(err){
            console.log("Error enabling Temperature Sensor : "+err);
        }
        else{
            console.log("Temperature Sensor Enabled; 15hz register update");
        }
    });
}
Magnetometer.prototype.readAxes = function(callback){
    this.mag.readBytes(0x03, 6, function(err, res) {
        callback(err,utils.buffToXYZMag(res));
    });
}
Magnetometer.prototype.readHeading = function(callback){
    this.mag.readBytes(0x03, 6, function(err, res) {
        callback(err, utils.buffToHeadMag(res));
    });
}
Magnetometer.prototype.readTemp = function(callback){
    this.mag.readBytes(0x31, 2, function(err, res) {
        callback(err,utils.buffToTemp(res));
    });
}
module.exports = Magnetometer;
