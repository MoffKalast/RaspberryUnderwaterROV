'use strict';

var sensor = require('./sensor.js');

var settings = {
	water_type: "Salt Water"
};

setInterval(function() {

    sensor.read(settings);

	let data = sensor.getData();

	console.log(data.roll);
	console.log(data.pitch);
	console.log(data.heading);
	console.log(data.temp);
	console.log(data.airpressure);
	console.log(data.voltage);
	console.log(data.depth);
	console.log("-------------------");

}, 100);
