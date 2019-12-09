var sensor = require('./sensor.js');
var motors = require('./motors.js');

var enabled = false;
var heading = 0;
var target = 0;

var prevleft = 0;
var prevright = 0;

function start(heading){
	target = sensor.getData().heading;
	motors.stopAll();
	enabled = true;
}

function update(speed, settings){

	if(settings.autoHeading && !enabled)
		start(settings.tgtHeading);
	else if(!settings.autoHeading && enabled)
		stop();

	if(enabled)
	{

		target = settings.tgtHeading;

		if (target < 0)
			target += 360;
		else if (target > 360)
			target -= 360;

		heading = sensor.getData().heading;

		if (heading < 0)
			heading += 360;
		else if (heading > 360)
			heading -= 360;

		var delta = getCorrection()*settings.heading_P;

		var leftspeed = speed + delta;
		var rightspeed = speed - delta;

		if(leftspeed < 0)
			leftspeed *= 2;
		else if(rightspeed < 0)
			rightspeed *= 2;

		leftspeed = clamp(leftspeed,-100,100)
		rightspeed = clamp(rightspeed,-100,100)

		var rspd = parseInt(parseFloat(leftspeed) * parseFloat(settings.general_mult)/100.0 * parseFloat(settings.right_mult)/100.0);
		var lspd = parseInt(parseFloat(rightspeed) * parseFloat(settings.general_mult)/100.0 * parseFloat(settings.left_mult)/100.0);

		motors.setForwardSpeed(lspd, rspd);

		prevleft = lspd;
		prevright = rspd;
	}
}

function stop(){
	motors.stopAll();
	enabled = false;
}

function getCorrection(){

    var diff = (heading-target)%360;
    var delta = clamp(Math.abs(diff),-100,100);

    if(delta > 1){
		var outPid = delta;

        if(diff > 0)
            outPid = -outPid;

        if(Math.abs(diff) > 180)
            outPid = -outPid;

        return Math.floor(outPid);
    }

    return 0;
}

function getSpeeds(){
	let pack = {
		right: prevright,
		left: prevleft
	}
	return pack;
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
