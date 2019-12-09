var lsm303 = require('lsm303');
var ls  = new lsm303();

var fs = require('fs');
var x = fs.createWriteStream("x");
var y = fs.createWriteStream("y");
var z = fs.createWriteStream("z");

var offset = {x: 0, y: 0, z: 0};
var scale = {x: 1.0, y: 1.0, z: 1.0};

var counter = 0;

//https://www.fierceelectronics.com/components/compensating-for-tilt-hard-iron-and-soft-iron-effects
//https://appelsiini.net/2018/calibrate-magnetometer/

var mag = ls.magnetometer();
var magIntervalObj = setInterval(function() {

		mag.readAxes(function(err, axes) {

			let x1 = (axes.x - offset.x) * scale.x;
			let y1 = (axes.y - offset.y) * scale.y;
			let z1 = (axes.z - offset.z) * scale.z;

			x.write(x1+"\n");
			y.write(y1+"\n");
			z.write(z1+"\n");

			counter+=1;

			console.log(counter);

			if(counter >= 1000){
				x.end();
				y.end();
				z.end();
				console.log("data recorded");
				process.exit()
			}
		});

}, 100);
