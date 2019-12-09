'use strict';
const BMP280 = require('bmp280-sensor');

class WeatherSensor{

	constructor(){
		this.bmp280 = new BMP280({
		  i2cBusNumber  : 1,    // defaults to 1
		  i2cAddress    : 0x76, // defaults to 0x76
		  verbose       : false
		});

		this.bmp280.config({
			powerMode: 1,                // 0 - sleep, 1|2 - one measurement, 3 - continuous
			pressureOversampling: 0,     // 0 - Skipped, 1 - ×1, 2 - ×2, 3 - ×4, 4 - ×8, 5 - ×16
			temperatureOversampling: 0,  // 0 - Skipped, 1 - ×1, 2 - ×2, 3 - ×4, 4 - ×8, 5 - ×16
			iirFilter: 2,                // Coefficient: 0 - off, 1 - 2, 2 - 4, 3 - 8, 4 - 16
			standby: 4                   // 0 - 0.5ms, 1 - 62.5ms, 2 - 125ms, 3 - 250ms, 4 - 500ms, 5 - 1000ms, 6 - 2000ms, 7 - 4000ms
		});
	}

	readData(callback){
		this.bmp280.readSensors()
			.then((data) => {
				callback(data.Temperature, data.Pressure);
			})
			.then(() => {
				this.bmp280.close();
			})
			.catch((err) => {
				console.log(err);
				this.bmp280.close();
			});
	}
}

module.exports = WeatherSensor;
