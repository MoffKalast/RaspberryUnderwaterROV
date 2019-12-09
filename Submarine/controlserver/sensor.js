'use strict'

//var Accelerometer = require('./sensor/accelerometer')
//var Magnetometer = require('./sensor/magnetometer')
const MotionSensor = require('./sensor/motionsensor');
const WeatherSensor = require('./sensor/weathersensor');
const ADC = require('./sensor/ADC');

const motion = new MotionSensor();
const weather = new WeatherSensor();
const ads1115 = new ADC();

const AHRS = require('ahrs');
const sensorfusion = new AHRS({
	sampleInterval: 20, //Hz
	algorithm: 'Mahony', //`Madgwick` or `Mahony`
	beta: 0.4, // 0.4 The filter noise value, smaller values have smoother estimates, but have higher latency. Only works for Madgwick.
	kp: 0.5, // 0.5 Filter noise for the Mahony.
	ki: 0, // 0
	doInitialisation: true, // BETA: AHRS is run 10 times with the initial value to force a stable outcome
});

var stats = {
	roll: 0,
	pitch: 0,
	heading: 0,
	temp: 0,
	airpressure: 0,
	voltage: 0,
	depth: 0
};

var motiontemp = 0;

setInterval(function () {
	motion.readData(function(data){
		sensorfusion.update(
			-data.gyro.x* 0.024,
			data.gyro.z* 0.024,
			data.gyro.y* 0.024,

			-data.accel.x,
			data.accel.z,
			data.accel.y,

			[
				-data.mag.x,
				data.mag.z,
				data.mag.y,
				0.05
			]
		);

		let euler = sensorfusion.getEulerAngles();
		stats.heading = euler.heading * 180 / Math.PI;
		stats.pitch = euler.pitch * 180 / Math.PI;
		stats.roll = euler.roll * 180 / Math.PI;

		//console.log("GYRO "+data.gyro.x+","+data.gyro.y+","+data.gyro.z);
		// console.log("ACCEL "+data.accel.x+","+data.accel.y+","+data.accel.z);
		// console.log("MAG "+data.mag.x+","+data.mag.y+","+data.mag.z);
		// console.log("----------------")
	});
}, 20);

var adcswitcher = true;

function read(settings){

	// accel.getAngles(function(roll, pitch, delta){
	// 	//console.log("Roll:"+roll+" Pitch:"+pitch+" Delta:"+delta);
	// 	stats.roll = roll;
	// 	stats.pitch = pitch;
	// });

	// mag.getHeading(function(err, heading){
	// 	stats.heading = heading+180;
	// });
	//
	// mag.getTemp(function(err,temp){
	// 	if(err || !temp)
	// 		return;
	// 	stats.temp = temp.celsius;
	// });

	weather.readData(function(temperature, pressure){
		stats.airpressure = parseFloat(pressure);
		stats.temp = parseFloat(temperature-2.0);
	});

	if(adcswitcher)
	{
		ads1115.getPressure(function(pressure){
			// 0.5 – 4.5 VDC
			// 0 - 1.0 MPa
			// 0 - 4.096 V

			//console.log("RAW: "+pressure);

			pressure = parseFloat(pressure);
			pressure /= 1000.0;
			pressure -= 0.5;
			pressure /= 4.0; //pressure in MPa

			//console.log("MPa: "+pressure);

			if(pressure < 0)
				pressure = 0;

			if(settings.water_type == "Salt Water"){
				stats.depth = pressure*99.548; // meters
			}
			else{
				stats.depth = pressure*101.94; // meters
			}

			//console.log("Dep: "+stats.depth);

		});
	}
	else
	{
		ads1115.getVoltage(function(data){
			var voltage = (parseFloat(data)/2649.0)*13.14;
			if(voltage < 0)
				return;
			stats.voltage = voltage;
		});
	}
	adcswitcher = !adcswitcher
}

function getData(){
	return stats;
}

module.exports.getData = getData;
module.exports.read = read;
