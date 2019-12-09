var i2c = require('i2c');
var Util = require('./util');

class Accelerometer{

	constructor(){

		this.accel = new i2c(0x19, {
		    device: '/dev/i2c-1',
		    debug: false
		});

		this.accel.writeBytes(0x20, [0x57], function(err) {
		    if(err)
		        console.log("Accelerometer Error: "+err);
		});

		this.accel.writeBytes(0x23, [0x00], function(err) {
		    if(err)
		        console.log("Resolution Error: "+err);
		});
	}

	readAxes(callback){
    	this.accel.readBytes(0x28 | 0x80, 6, function(err, res) {
        	callback(err,Util.buffToXYZAccel(res));
		});
	}

	getAngles(callback){
    	this.accel.readBytes(0x28 | 0x80, 6, function(err, res) {
        	let axes = Util.buffToXYZAccel(res);

        	let length = Math.sqrt(axes.x*axes.x + axes.y*axes.y + axes.z*axes.z);
			let x = -axes.y/length;
			let y = axes.x/length+0.000001;
			let z = axes.z/length;

			let pitch = -Math.floor((Math.atan(x/-y)*180)/Math.PI);
			let roll = -Math.floor((Math.atan(z/-y)*180)/Math.PI);

			//console.log("pitch: "+pitch);
			//console.log("roll: "+roll);

			callback(roll,pitch,length-0.9);
		});
	}
}

module.exports = Accelerometer;
