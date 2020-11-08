### ROV Telemetry Visualizer - ROViz

A sort of RViz analogue app that visualizes recorded telemetry data in a 3D space using Godot 3.2.3.

![App](/_schematics/img/roviz.png)

Features:
- 3D rendering of the submarine model with spinning propellers and particle effects
- raw value write out of currently displayed data
- timeline to track the data and a mark when the maximum depth was reached (after noise removal)
- file dialog to load telemetry files
- trail rendering to help track past movements

A curated collection of telemetry examples files can be found in the folder named as such.

Plugins used:

- [Godot-Trail-System](https://github.com/OBKF/Godot-Trail-System)
- [godot-realistic-water](https://github.com/godot-extended-libraries/godot-realistic-water/tree/master/realistic_water_shader)
