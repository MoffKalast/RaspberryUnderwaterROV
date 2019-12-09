var lsm303 = require('../index');
var ls  = new lsm303();

var axesTemp = {}, headingTemp = {};
var xMin = 0,
		xMax = 0,
		yMin = 0,
		yMax = 0,
		zMin = 0,
		zMax = 0;

var mag = ls.magnetometer();
var magIntervalCounter = 1;

// Use this setOffset function to enter in resultant x, y, z 
// values from calibration
//mag.setOffset(-26, 44, 0);

console.log("Begin slowly spinning LSM303 board / chip in XY plane until there are no new min/max numbers..."); 
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
			if (magIntervalCounter == 1) {
				xMin = axes.x;
				xMax = axes.x;
				yMin = axes.y;
				yMax = axes.y;
				zMin = axes.z;
				zMax = axes.z;
			}
			if(err) {
				console.log("Error reading Magnetometes Axes : " + err);
			}
				if (axes) {
					axesTemp = axes;
					if (axes.x < xMin) { 
						xMin = axes.x;
						console.log("New xMin = " + xMin);
					}
					if (axes.x > xMax) {
						xMax = axes.x;
						console.log("New xMax = " + xMax);
					}
          if (axes.y < yMin) {
            yMin = axes.y;
            console.log("New yMin = " + yMin);
          }
          if (axes.y > yMax) {
            yMax = axes.y;
            console.log("New yMax = " + yMax);
          }
          if (axes.z < zMin) {
            zMin = axes.z;
            console.log("New zMin = " + zMin);
          }
          if (axes.z > zMax) {
            zMax = axes.z;
            console.log("New zMax = " + zMax);
          }
			}
		});
		magIntervalCounter++;
		if (magIntervalCounter == 5000) {
			clearInterval(magIntervalObj)
		}
}, 200);

