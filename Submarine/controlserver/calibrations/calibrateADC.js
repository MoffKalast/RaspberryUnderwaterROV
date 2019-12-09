var ads1x15 = require('node-ads1x15');  

var adc = new ads1x15(1); 
 
var channel = 0;
var samplesPerSecond = '16'; //16,32,64,128,250,475,860 
var progGainAmp = '4096'; // 256, 512, 1024, 2048, 4096, 6144

setInterval(function() {

	if(!adc.busy)  
	{  
		adc.readADCSingleEnded(channel, progGainAmp, samplesPerSecond, function(err, data) {   
			if(err)
				throw err;
				
			var voltage = (data/2649)*13.14;
		
			console.log(voltage+"V");
		
		});  
	}  
    
}, 100);
