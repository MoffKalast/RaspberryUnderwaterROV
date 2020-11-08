## Underwater ROV powered by a Raspberry Pi

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

![Schematic](/_schematics/draw_side.png)

This codebase contains the control code for a homemade remotely controlled submarine and the Unity app for an android device that can be used to record video and drive the sub.

It uses a Raspberry Pi 2 as its central control unit, a Pi Camera V2 (later with D160 sensor) for custom video recording, sensors and drivers as described in the schematic below:

![Electronics](/_schematics/RpiElectric5.png)

The repository is divided into three parts:

- **/Submarine** which contains a NodeJS implementation of the submarine control software, along with video streaming and sensor AHRS, interfacting with the app using Socket.io

- **/ROVCommander** which is a Unity mobile app that allows for ease of control from a beach or boat

- **/ROViz** that contains the telemetry visualization application written in Godot (project source + exported Win64 binary)

See the subfolder README files for more information on each.


-------------

### Physical Implementation and Vehicle Tests

A test vehicle was constructed out of PVC-U sewer pipe with custom 3D printed PLA parts and an acrylic dome, all sealed together using epoxy glue.

![Electronics](/_schematics/img/rovoutside.jpg)

The following video contains a short summary of construction and testing.

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/DufHhX7p4Xk/0.jpg)](https://www.youtube.com/watch?v=DufHhX7p4Xk)

All recorded uncompressed video during testing will be available for download if I ever find a place to host 50GB for free.
