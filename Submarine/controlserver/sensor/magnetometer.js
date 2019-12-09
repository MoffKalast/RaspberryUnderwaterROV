var I2C = require('i2c');
var Util = require('./util');

class Magnetometer{

	constructor() {

		this.mag = new I2C(0x1e, {
		    device: '/dev/i2c-1',
		    debug: false
		});

		this.mag.writeBytes(0x02, [0x00], function(err) {
		    if(err)
		        console.log("Magnetometer Error: "+err);
		});

		this.mag.writeBytes(0x00, [0x90], function(err) {
		    if(err)
		        console.log("Temperature Sensor Error: "+err);
		});
	}

	getAxes(callback){
		this.mag.readBytes(0x03, 6, function(err, res) {
		    callback(err,Util.buffToXYZMag(res));
		});
	}

	getHeading(callback){
		this.mag.readBytes(0x03, 6, function(err, res) {
		    callback(err, Util.getHeading(res));
		});
	}

	getTemp(callback){
		this.mag.readBytes(0x31, 2, function(err, res) {
		    callback(err,Util.buffToTemp(res));
		});
	}

}
module.exports = Magnetometer;
