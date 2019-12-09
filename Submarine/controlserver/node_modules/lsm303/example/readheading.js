var lsm303 = require('../index.js');
var ls  = new lsm303();

var axesTemp = {}, headingTemp = {};

var mag = ls.magnetometer();
var magIntervalCounter = 1;

// Use this setOffset function to enter in resultant x, y, z 
// values from calibration
mag.setOffset(-26, 44, 0);

var magIntervalObj = setInterval(function() {

		// Returns heading in degrees from 0-360
		mag.readHeading(function(err, heading){
			if(err){
				console.log("Error reading Magnetometer Heading : " + err);
			}
			if (heading) {
				headingTemp = heading;
			}
		});
		
		// Returns heading vector in x, y, z cartesian coordinates
		mag.readAxes(function(err, axes) {
			if(err) {
				console.log("Error reading Magnetometes Axes : " + err);
			}
				if (axes) {
					axesTemp = axes;
			}
		});

		magIntervalCounter++;
		if (magIntervalCounter == 5000) {
			clearInterval(magIntervalObj)
		}
		console.log(headingTemp, axesTemp);
}, 200);

