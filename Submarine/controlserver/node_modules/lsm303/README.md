Node.js LSM303 Accelerometer and Magnetometer Module
====================================================

This module allows you to integrate LSM303 in your Node.js Project

Beaglebone Black Setup
====================================================

Connect the SCL and SDA of LSM303 on P9_19 and P9_20 respectively. Check whether the device is connected properly using i2cdetect ( #i2cdetect -r 1 ).

This module takes 0x19 and 0x1e as the default addresses for Accelerometer and Magnetometer respectively. This can be changed by passing the address during device object creation. Similarly the device path can also be changed. 

Installation
============

```
npm install lsm303
```

Usage
=====

Checkout example/example1.js for basic usage
Magnetometer calibration application also available in examples

```
var lsm303 = require('lsm303');

var ls  = new lsm303();

var accel = ls.accelerometer();
var mag = ls.magnetometer();

accel.readAxes(function(err,axes){
    if(err){
        console.log("Error reading Accelerometer Axes : " + err);
    }
    if (axes) {
        console.log(axes);
    }
});

mag.readAxes(function(err,axes){
    if(err){
        console.log("Error reading Magnetometer Axes : " + err);
    }
    if (axes) {
        console.log(axes);
    }
});

// Non-tilt-compensated readHeading function
mag.readHeading(function(err, heading){
		if(err){
				console.log("Error reading Magnetometer Heading : " + err);
      }   
      if (heading) {
        headingTemp = heading;
      }   
    });

mag.readTemp(function(err,temp){
    if(err){
        console.log("Error reading Temperature : " + err);
    }
    if (temp) {
        console.log(temp);
    }
});
```
