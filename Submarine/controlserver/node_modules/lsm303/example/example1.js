var lsm303 = require('../index.js');

var ls  = new lsm303();

var accel = ls.accelerometer();
var mag = ls.magnetometer();

accel.readAxes(function(err,axes){
    if(err){
        console.log("Error reading Accelerometer Axes : " + err);
    }
    if (axes) {
        console.log('Accelerometer') ;
        console.log(axes);
    }
});

mag.readAxes(function(err,axes){
    if(err){
        console.log("Error reading Magnetometer Axes : " + err);
    }
    if (axes) {
        console.log('Magnetometer') ;
        console.log(axes);
    }
});

mag.readTemp(function(err,temp){
    if(err){
        console.log("Error reading Temperature : " + err);
    }
    if (temp) {
        console.log('Temperature') ;
        console.log(temp);
    }
});
