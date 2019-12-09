
import sys
import time
import io
import picamera
import logging
import socketserver
import threading
from threading import Condition
from http import server

streamRES = "800x600"
recordRES = "1640x1232"

record = False

exposureMode = 'night'
meterMode = 'average'

rotation = 180

captureNumber = 5
captureExposure = 10

with picamera.PiCamera(resolution="3280x2464", framerate=captureExposure) as camera:

	camera.exposure_mode = exposureMode
	camera.meter_mode = meterMode
	camera.rotation = rotation
	
	time.sleep(3)
	
	timestamp = str(int(time.time()))
	
	for x in range(0, captureNumber):
		camera.capture('/home/pi/Desktop/dcim/'+timestamp+'_'+str(x)+'.jpg')
	
	camera.close()
