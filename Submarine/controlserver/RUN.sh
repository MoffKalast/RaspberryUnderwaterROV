#!/bin/bash

echo "Stop, hammer time."

sudo killall pigpiod
sudo killall python3
sudo killall node

echo "-------------------------"

echo "Starting node server..."

sudo node app.js

echo "Cleanup..."

sudo killall python3
sudo killall node
