//calibration
var offset = {x: -57.5, y: 839, z: 564.5};
var scale = {x: 0.97441, y: 0.96459, z: 1.0672};

class Util {

	static buffToXYZAccel(buffer){
		let pos = {
		    x: this.trueRound( this.bitToDec(((buffer[1] << 8) | buffer[0]) >> 4,12) * 0.001 , 1 ),
		    y: this.trueRound( this.bitToDec(((buffer[3] << 8) | buffer[2]) >> 4,12) * 0.001 , 1 ),
		    z: this.trueRound( this.bitToDec(((buffer[5] << 8) | buffer[4]) >> 4,12) * 0.001 , 1 )
		};
		return pos;
	}

	static buffToTemp(buffer){
		let temp = {
			celsius : (((buffer[0] << 8) | buffer[1]) >> 4)/8 + 18
		};
		return temp;
	}

	static buffToXYZMag(buffer){
		let pos = {
			x: (this.bitToDec((buffer[0] << 8) | buffer[1],16) - offset.x) * scale.x,
			z: (this.bitToDec((buffer[2] << 8) | buffer[3],16) - offset.z) * scale.z,
			y: (this.bitToDec((buffer[4] << 8) | buffer[5],16) - offset.y) * scale.y
		};
		return pos;
	}

	static getHeading(buffer){
		let pos = {
			x: (this.bitToDec((buffer[0] << 8) | buffer[1],16) - offset.x) * scale.x,
			z: (this.bitToDec((buffer[2] << 8) | buffer[3],16) - offset.z) * scale.z,
			y: (this.bitToDec((buffer[4] << 8) | buffer[5],16) - offset.y) * scale.y
		}
		// https://arduino.stackexchange.com/questions/18625/converting-three-axis-magnetometer-to-degrees
		return parseInt(Math.atan2(pos.z, -pos.y) * 180.0 / Math.PI); //this.toPolar(pos.y, pos.z);
	}
	static bitToDec(value,no_of_bits) {
		let upper = Math.pow(2,no_of_bits);
		if (value > upper / 2)
			return value - upper;
		else
			return value;
	}

	static trueRound(value, digits){
		return parseFloat((Math.round((value*Math.pow(10,digits)).toFixed(digits-1))/Math.pow(10,digits)).toFixed(digits));
	}

	static toPolar(x, y) {
		let polarCoords = {};
		polarCoords.r = Math.sqrt(x * x + y * y);
		polarCoords.theta = Math.PI / 2 - Math.atan2(y, x);
		if (polarCoords.theta < 0) {
			polarCoords.theta += 2 * Math.PI;
		}
		polarCoords.theta = 2 * Math.PI - polarCoords.theta;
		polarCoords.theta = (180 / Math.PI * polarCoords.theta);
		return ((polarCoords.theta != 360) ? polarCoords.theta : 0);
	}
}

module.exports = Util;
