var ads1x15 = require('node-ads1x15');

class ADC{

	constructor(){

		this.adc = new ads1x15(1);

		this.voltageChannel = 0;
		this.voltageGain = '4096'; // 256, 512, 1024, 2048, 4096, 6144

		this.pressureChannel = 1;
		this.pressureGain = '4096'; // 256, 512, 1024, 2048, 4096, 6144

		this.samplesPerSecond = '16'; //16,32,64,128,250,475,860
	}

	getVoltage(callback){
		if(!this.adc.busy)
		{
			this.adc.readADCSingleEnded(this.voltageChannel, this.voltageGain, this.samplesPerSecond, function(err, data) {
				if(err)
					callback(-1);
				else{
					callback(data);
				}
			});
		}
	}

	getPressure(callback){
		if(!this.adc.busy)
		{
			this.adc.readADCSingleEnded(this.pressureChannel, this.pressureGain, this.samplesPerSecond, function(err, data) {
				if(err)
					callback(-1);
				else{
					callback(data);
				}
			});
		}
	}
}

module.exports = ADC;
