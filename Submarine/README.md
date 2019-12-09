## ROV Control Server

A NodejS implementation of a vehicle control software, mostly created to test out the absurd amount of Raspberry Pi hardware libraries for node on npm.

It enables differential drive control for two forward oriented thrusters, automatic heading and roll correction based on gyrocope data,  and depth hold based on pressure data and video streaming / recording using the Camera Module V2. Battery level is also approximated from voltage levels and battery type and forwarded to the control app along with internal hull air pressure, CPU temperature and air temperature.

When video recording is enabled a separate syncronized file of sensor data is also recorded and saved for later analysis.

Hardware Requirements:

- Raspberry Pi 2 B or later

- GY-91

- ADS1115

Software Requirements:

- Python 3

- NodeJS

- pigpio

Libraries used (all of these can be found by their name on NPM):

- data-store (storing settings, as all user inputed settings from the app are stored locally on the server, enabling quick switching of client devices in case one falls into water and dies)

- fs (sensor telemetry file writing)

- shelljs (enabling the app to run bash terminal commands on demand)

- python-shell (the node server runs a python script for video streaming since that seemed the only straightforward way to use the native python Raspicam library that enables usage of splitter ports)

- express, http, socket.io (communcation)

- pigpio (motor control)

- node-ads1x15 (reading the ADS1115 ADC for outside water pressure and battery level data)

- i2c (used for reading a LSM303 sensor that was later replaced by a GY-91)

- mpu9250 (9-dof sensor data readouts)

- bmp280-sensor (temperature and pressure readouts)

- ahrs (sensor fusion for 9-dof gyro/accelerometer/magnetometer sensor via a Mahony filter)

The modules are compiled for use on Raspbian Stretch and Raspberry Pi 2.

### Video Recording & Streaming

The software leverages the use of Raspicam splitter ports, allowing it to simultaneously stream/record video and save photos at different resolutions and formats.
