var sensor = require('./sensor.js');
var motors = require('./motors.js');

var enabled = false;
var depth = 0;
var target = 0;

var prevright = 0;
var prevleft = 0;

function start(depth){
	target = sensor.getData().depth;
	motors.stopAll();
	enabled = true;
}

function update(settings){

	if(settings.autoDepth && !enabled)
		start(settings.tgtDepth);
	else if(!settings.autoDepth && enabled)
		stop();

	if(enabled)
	{
		let data = sensor.getData();
		let generalmult = parseFloat(settings.general_mult)/100.0;
		let rightmult = parseFloat(settings.right_depth_mult)/100.0;
		let leftmult = parseFloat(settings.left_depth_mult)/100.0;

		target = settings.tgtDepth;
		depth = data.depth;

		var delta = (depth-target)*(200*settings.depth_P);

		delta = clamp(delta,-100,100);
		delta = parseFloat(delta) * generalmult;

		deltaright = parseInt(delta * rightmult);
		deltaleft = parseInt(delta * leftmult);

		let rolldiff = parseFloat(data.roll) * 10.0 * settings.balance_P * generalmult;
		let rightroll = parseInt(rolldiff * rightmult);
		let leftroll = parseInt(rolldiff * leftmult);

		let rightspeed = parseInt(clamp(delta + rightroll,-100,100))
		let leftspeed = parseInt(clamp(delta - leftroll,-100,100))

		if(settings.right_depth_invert)
			rightspeed *= -1;

		if(settings.left_depth_invert)
			leftspeed *= -1;

		if(Math.abs(rightspeed) < 5)
			rightspeed = 0;
		if(Math.abs(leftspeed) < 5)
			leftspeed = 0;

		console.log("autoDepthSpeed("+leftspeed+", "+rightspeed+");");

		motors.setDepthSpeed(leftspeed, rightspeed);

		prevright = rightspeed;
		prevleft = leftspeed;
	}
}

function getSpeeds(){
	let pack = {
		right: prevright,
		left: prevleft
	}
	return pack;
}

function stop(){
	motors.stopAll();
	enabled = false;
}

function clamp(val, minVal, maxVal){
	if(val < minVal)
		return minVal;
	if(val > maxVal)
		return maxVal;
	return val;
}

module.exports.getSpeeds = getSpeeds;
module.exports.update = update;
