'use strict';

process.on('uncaughtException', err => {
	console.log(err);
})

var settings = {
	general_mult: 70,

	right_depth_mult: 100,
	left_depth_mult: 100,

	right_mult: 100,
	left_mult: 100,

	battery: "SLA AGM 12V",

	stream_res: "640x480",
	record_res: "1640x1232",
	fps: 24,
	recording: false,

	water_type: "Salt Water",
	depth_offset: 0.0,

	meter_mode: "average",
	exposure_mode: "night",

	hdd_space: "?",

	right_depth_invert: false,
	left_depth_invert: false,

	right_invert: false,
	left_invert: false,

	tgtHeading: 0,
	autoHeading: false,

	tgtDepth: 0,
	autoDepth: false,

	heading_P: 0.0,
	depth_P: 0.0,
	balance_P: 0.0,
};

// ------------------------------------------------

var Store = require('data-store');
var store = new Store({ path: 'settings.json' });

if(store.get('settings') != undefined)
	settings = store.get('settings');

var fs = require('fs');
var telemetryLog = null;

var shell = require('shelljs');
var {PythonShell} = require('python-shell');

// ------------------------------------------------

var express = require('express');
var http = require('http')
var socketio = require('socket.io');

var motors = require('./motors.js');
var sensor = require('./sensor.js');

var autoheading = require('./headingAuto.js');
var autodepth = require('./depthAuto.js');
//var calibrate = require('./calibrateSensor.js');

var app = express();
var server = http.Server(app);
var websockets = socketio(server);

server.listen(3000, () => console.log('Server online.'));

console.log("Starting stream at "+settings.stream_res+" "+settings.fps+" FPS");

var pyshell = new PythonShell('/home/pi/Desktop/controlserver/mjpegstream.py', {
	mode: 'text',
	pythonPath: 'python3'
});

updateCamera();

// ------------------------------------------------

var SOCKET_LIST = {};
var lastPing = Date.now();

var left_depth_speed = 0;
var right_depth_speed = 0;

var right_speed = 0;
var left_speed = 0;

var rawDepth = 0.0;

var cputemp = 0.0;

websockets.on('connection', (socket) => {

	socket.on('connected', (data) => {
		console.log('Controller Connected: '+socket.id);
		SOCKET_LIST[socket.id] = socket;
		socket.emit("settings", settings);
		store.set('settings', settings);
	});

	socket.on('disconnect', (data) => {
		console.log('Controller Disconnected: '+socket.id);
		delete SOCKET_LIST[socket.id];

		right_speed = 0;
		left_speed = 0;

		left_depth_speed = 0;
		right_depth_speed = 0;

		settings.autoDepth = false;
		settings.autoHeading = false;

		store.set('settings', settings);
	});

	socket.on('keepalive', () => {
		lastPing = Date.now();
	});

	socket.on('water', (data) => {
		settings.water_type = data;

		socket.emit("settings", settings);
		store.set('settings', settings);
	});

	socket.on('zerodepth', () => {
		settings.depth_offset = -parseFloat(rawDepth);

		socket.emit("settings", settings);
		store.set('settings',settings);
	});

	socket.on('headingP', (data) => {
		settings.heading_P = parseFloat(data);

		socket.emit("settings", settings);
		store.set('settings',settings);
	});

	socket.on('depthP', (data) => {
		settings.depth_P = parseFloat(data);

		socket.emit("settings", settings);
		store.set('settings',settings);
	});

	socket.on('balanceP', (data) => {
		settings.balance_P = parseFloat(data);

		console.log(settings.balance_P);

		socket.emit("settings", settings);
		store.set('settings',settings);
	});

	socket.on('depthspeed', (data) => {
		data = JSON.parse(data);
		let rspd = parseInt(parseFloat(data.right) * parseFloat(settings.general_mult)/100.0 * parseFloat(settings.right_depth_mult)/100.0);
		let lspd = parseInt(parseFloat(data.left) * parseFloat(settings.general_mult)/100.0 * parseFloat(settings.left_depth_mult)/100.0);

		if(settings.right_depth_invert)
			rspd *= -1;

		if(settings.left_depth_invert)
			lspd *= -1;

		right_depth_speed = rspd;
		left_depth_speed = lspd;
	});

	socket.on('motorspeed', (data) => {
		data = JSON.parse(data);
		let rspd = parseInt(parseFloat(data.right) * parseFloat(settings.general_mult)/100.0 * parseFloat(settings.right_mult)/100.0);
		let lspd = parseInt(parseFloat(data.left) * parseFloat(settings.general_mult)/100.0 * parseFloat(settings.left_mult)/100.0);

		if(settings.right_invert)
			rspd *= -1;

		if(settings.left_invert)
			lspd *= -1;

		right_speed = rspd;
		left_speed = lspd;
	});

	socket.on('motordir', (channel) => {

		if (channel === "rightdepth")
			settings.right_depth_invert = !settings.right_depth_invert;
		else if (channel === "leftdepth")
			settings.left_depth_invert = !settings.left_depth_invert;
		else if (channel === "right")
			settings.right_invert = !settings.right_invert;
		else if (channel === "left")
			settings.left_invert = !settings.left_invert;

		socket.emit("settings", settings);
		store.set('settings',settings);
	});

	socket.on('motormult', (data) => {
		data = JSON.parse(data);
		if (data.channel === "rightdepth")
			settings.right_depth_mult = data.val;
		else if (data.channel === "leftdepth")
			settings.left_depth_mult = data.val;
		else if (data.channel === "right")
			settings.right_mult = data.val;
		else if (data.channel === "left")
			settings.left_mult = data.val;
		else if (data.channel === "all")
			settings.general_mult = data.val;

		socket.emit("settings", settings);
		store.set('settings',settings);
	});

	socket.on('autoheading', (data) => {
		data = JSON.parse(data);

		settings.tgtHeading = data.tgt;
		settings.autoHeading = data.active;

		socket.emit("settings", settings);
		store.set('settings',settings);
	});

	socket.on('autodepth', (data) => {
		data = JSON.parse(data);

		settings.tgtDepth = parseFloat(data.depth)-settings.depth_offset;
		settings.autoDepth = data.active;

		socket.emit("settings", settings);
		store.set('settings',settings);
	});

	socket.on('battery', (type) => {
		settings.battery = type;
		socket.emit("settings", settings);
		store.set('settings',settings);
	});

	//https://www.npmjs.com/package/python-shell

	socket.on('photo', () => {
		console.log("Single photo.");
		pyshell.send("PHOTO_shoot");
	});

	socket.on('gallery', () => {
		console.log("4K photo gallery.");

		pyshell.send("PHOTO_gallery");

		pyshell.on('message', function (message) {
			console.log(message);
			if(message == "streamUpdated")
				socket.emit("streamUpdated");
		});
	});

	socket.on('camera_cfg', (data) => {
		data = JSON.parse(data);

		settings.stream_res = data.stream_res;
		settings.record_res = data.record_res;
		settings.meter_mode = data.meter_mode;
		settings.exposure_mode = data.exposure_mode;
		settings.recording = data.recording;
		settings.fps = parseInt(data.fps);

		socket.emit("settings", settings);
		store.set('settings',settings);

		updateCamera();

		pyshell.on('message', function (message) {
			console.log(message);
			if(message == "streamUpdated")
				socket.emit("streamUpdated");
		});
	});

	socket.on('bashcmd', (data) => {
		console.log("--BASHCMD--");
		console.log(data);
		if(data.startsWith("cd ")){

			let path = data.substring(3).trim();
			console.log("path: "+path);
			shell.cd(path);
			socket.emit("log","Changed directory to: "+path);
			console.log("socket emit");
		}
		else
		{
			console.log("execing")
			const {stdout, stderr, code} = shell.exec(data, {silent:true});
			console.log("out:"+stdout+","+stderr+","+code);
			socket.emit("log",(stdout+stderr));
			console.log("socket emit");
		}

		console.log("--END--")

	});

});

function failsafeCheck(){
	if(Date.now()-lastPing > 3000){
		right_speed = 0;
		left_speed = 0;

		left_depth_speed = 0;
		right_depth_speed = 0;

		settings.autoDepth = false;
		settings.autoHeading = false;
	}
}

setInterval(function() {

	failsafeCheck();

    sensor.read(settings);

	let data = sensor.getData();
	autoheading.update(right_speed, settings);
	autodepth.update(settings);

	if(!settings.autoDepth){
		motors.setDepthSpeed(left_depth_speed,right_depth_speed);
		data.right_depth_speed = right_depth_speed;
		data.left_depth_speed = left_depth_speed;
	}
	else{
		let motorspeeds = autodepth.getSpeeds();
		data.right_depth_speed = motorspeeds.right;
		data.left_depth_speed = motorspeeds.left;
	}

	if(!settings.autoHeading){
		motors.setForwardSpeed(left_speed,right_speed);
		data.right_speed = right_speed;
		data.left_speed = left_speed;
	}
	else{
		let motorspeeds = autoheading.getSpeeds();
		data.right_speed = motorspeeds.right;
		data.left_speed = motorspeeds.left;
	}

	rawDepth = parseFloat(data.depth);
	data.depth += settings.depth_offset;

	data.coretemp = parseFloat(cputemp);
	data.heading = parseInt(data.heading);
	data.roll = parseInt(data.roll);
	data.pitch = parseInt(data.pitch);

	for(var i in SOCKET_LIST)
		SOCKET_LIST[i].emit("data", data);

	if(telemetryLog != null)
		logData(data);

}, 100);


function logData(data){

	let writeString = Date.now()+" ";

	writeString += data.heading+" ";
	writeString += data.pitch+" ";
	writeString += data.roll+" ";
	writeString += data.depth.toFixed(2)+" ";

	writeString += data.right_depth_speed+" ";
	writeString += data.left_depth_speed+" ";

	writeString += data.right_speed+" ";
	writeString += data.left_speed+" ";

	writeString += data.temp.toFixed(1)+" ";
	writeString += data.airpressure.toFixed(1)+" ";
	writeString += data.coretemp.toFixed(1)+" ";

	writeString += data.voltage.toFixed(1)+" ";

	telemetryLog.write(writeString+"\n");
}


var disk = require('diskusage');
var coretemp = require("pi-temperature");

setInterval(function() {

	disk.check('/', function(err, info) {
		if (err)
			console.log(err);
		else
			settings.hdd_space = formatBytes(info.free,2);
	});

	coretemp.measure(function(err, temp) {
	    if (err)
			console.error(err);
	    else
			cputemp = temp;
	});

}, 3000);

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function updateCamera(){
	let command = settings.fps+" "+settings.exposure_mode+" "+settings.meter_mode+" "+settings.stream_res+" "+settings.record_res+" "+settings.recording;

	pyshell.send(command);

	if(telemetryLog != null){
		telemetryLog.end();
		telemetryLog = null;
	}

	if(settings.recording)
	{
		let date = new Date();
		let filename = date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate()+"_"+date.getHours()+"-"+date.getMinutes()+"_"+settings.fps+"fps.txt";
		telemetryLog = fs.createWriteStream("/home/pi/Desktop/telemetry/"+filename);
	}
}
