### ROV Commander Unity App

![App](/_schematics/img/controlapp.png)

Libraries used:

- [socket.io-unity](https://github.com/floatinghotpot/socket.io-unity)

- MjpegProcessor


The Unity project requires Unity 2017.4.26f1 due to the Socket.io library used for communication. The app presumes a LAN connection with the submarine control server, be it via an ethernet link + USB OTG or a wifi connection.

The app was developed exclusively for the Lenovo Tab 3, so minor gui tweaks may be needed for use on other devices.
