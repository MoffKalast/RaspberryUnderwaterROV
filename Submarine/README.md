## ROV Control Server

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

The software leverages the use of Raspicam splitter ports, allowing it to simulatneously stream and record video at different resolutions and formats.
