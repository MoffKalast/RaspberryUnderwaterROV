var pigpio = require('pigpio');
var Gpio = pigpio.Gpio;

pigpio.configureClock(2, pigpio.CLOCK_PCM);

//https://github.com/fivdi/pigpio/blob/master/doc/gpio.md#pwmrangerange

var left = {
    pwm: new Gpio(17, {mode: Gpio.OUTPUT}),
    dir: new Gpio(18, {mode: Gpio.OUTPUT}),
    name: "left",
    prevSpd: undefined
}

var right = {
    pwm: new Gpio(22, {mode: Gpio.OUTPUT}),
    dir: new Gpio(23, {mode: Gpio.OUTPUT}),
    name: "right",
    prevSpd: undefined
}

var left_depth = {
    pwm: new Gpio(21, {mode: Gpio.OUTPUT}),
    dir: new Gpio(20, {mode: Gpio.OUTPUT}),
    name: "left_depth",
    prevSpd: undefined
}

var right_depth = {
    pwm: new Gpio(26, {mode: Gpio.OUTPUT}),
    dir: new Gpio(19, {mode: Gpio.OUTPUT}),
    name: "right_depth",
    prevSpd: undefined
}

function initMotor(motor){
    console.log("Init motor driver: "+motor.name);

    motor.pwm.pwmFrequency(20000);
    motor.pwm.pwmRange(100);
    motor.pwm.pwmWrite(0);

    motor.dir.digitalWrite(1);
}

function setSpeed(spd, motor){ //0-100 range

	if(motor.prevSpd == spd)
		return;

	motor.prevSpd = spd;

	console.log("SetSpeed:"+Math.round(spd)+", on motor: "+motor.name);
    if(spd < 0)
        motor.dir.digitalWrite(0);
    else if(spd > 0)
        motor.dir.digitalWrite(1);
    motor.pwm.pwmWrite(Math.round(Math.abs(spd)));
}

function clamp(val, mn, mx){
	if(val > mx)
		return mx;
	if(val < mn)
		return mn;
	return val;
}

function setForwardSpeed(left_speed, right_speed){
    setSpeed(left_speed,left);
    setSpeed(right_speed,right);
}

function setDepthSpeed(left_speed, right_speed){
	setSpeed(left_speed,left_depth);
	setSpeed(right_speed,right_depth);
}

function stopAll(){
	setSpeed(0,left_depth);
	setSpeed(0,right_depth);
	setSpeed(0,left);
    setSpeed(0,right);
}


initMotor(left);
initMotor(right);
initMotor(left_depth);
initMotor(right_depth);

module.exports.stopAll = stopAll;
module.exports.setForwardSpeed = setForwardSpeed;
module.exports.setDepthSpeed = setDepthSpeed;
