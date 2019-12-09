var pigpio = require('pigpio');
var Gpio = pigpio.Gpio;

var speaker = new Gpio(21, {mode: Gpio.OUTPUT});

speaker.pwmFrequency(20000);
speaker.pwmRange(100);
speaker.pwmWrite(0);

function startup(){
	
	speaker.pwmWrite(10);
	
	setTimeout(function()
	{
		speaker.pwmWrite(0);
		setTimeout(function()
		{
			speaker.pwmWrite(15);

			setTimeout(function()
			{
				speaker.pwmWrite(0);
				setTimeout(function()
				{
					speaker.pwmWrite(20);

					setTimeout(function()
					{
						speaker.pwmWrite(0);				
					},120);
				},100);
			},100);
		},100);		
	},10);
}

function single(){
	
	speaker.pwmWrite(15);
	
	setTimeout(function(){
		speaker.pwmWrite(0);
	},200);
}

module.exports.single = single;
module.exports.startup = startup;

