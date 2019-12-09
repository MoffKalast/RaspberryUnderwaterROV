## Underwater ROV powered by a Raspberry Pi

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

![Schematic](/_schematics/Submarinedraw.png)

This codebase contains the control code for a homemade remotely controlled submarine and the Unity app for an android device that can be used to record video and drive the sub.

It uses a Raspberry Pi 2 as its central control unit, a RaspiCam V2 for custom video recording, sensors and drivers as described in the schematic below:

![Electronics](/_schematics/RpiElectric4.png)

The repository is divided into two parts:

- **/Submarine** which contains a NodeJS implementation of the submarine control software, along with video streaming and sensor AHRS, interfacting with the app using Socket.io

- */ROVCommander** which is a Unity mobile app that allows for ease of control from a beach or boat

See the subfolder README files for more information on each.


-------------

### Physical Implementation and Vehicle Tests

A test vehicle was constructed out of PVC-U sewer pipe with custom 3D printed PLA parts and an acrylic dome, all sealed together using epoxy glue.

![Electronics](/_schematics/img/20190922_141118.jpg)

The following video contains a short summary on the first round of testing.

[![IMAGE ALT TEXT HERE](http://img.youtube.com/vi/sjRbOp7FrAE/0.jpg)](http://www.youtube.com/watch?v=sjRbOp7FrAE&)

All recorded uncompressed video during testing will be available for download at a later date.

