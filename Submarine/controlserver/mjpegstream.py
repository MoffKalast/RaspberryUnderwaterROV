# Web streaming example
# Source code from the official PiCamera package
# http://picamera.readthedocs.io/en/latest/recipes2.html#web-streaming

import sys
import time
import io
import picamera
import logging
import socketserver
import threading
from threading import Condition
from http import server
from datetime import datetime

streamRES = "640x480"
recordRES = "1640x1232"

FPS = 24

record = False

exposureMode = 'night'
meterMode = 'average'

rotation = 180

captureNumber = 3 # of images
captureExposure = 15 #FPS

class StreamingOutput(object):
    def __init__(self):
        self.frame = None
        self.buffer = io.BytesIO()
        self.condition = Condition()

    def write(self, buf):
        if buf.startswith(b'\xff\xd8'):
            # New frame, copy the existing buffer's content and notify all
            # clients it's available
            self.buffer.truncate()
            with self.condition:
                self.frame = self.buffer.getvalue()
                self.condition.notify_all()
            self.buffer.seek(0)
        return self.buffer.write(buf)

class StreamingHandler(server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/stream.mjpg':
            self.send_response(200)
            self.send_header('Age', 0)
            self.send_header('Cache-Control', 'no-cache, private')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=FRAME')
            self.end_headers()
            try:
                while True:
                    with output.condition:
                        output.condition.wait()
                        frame = output.frame
                    self.wfile.write(b'--FRAME\r\n')
                    self.send_header('Content-Type', 'image/jpeg')
                    self.send_header('Content-Length', len(frame))
                    self.end_headers()
                    self.wfile.write(frame)
                    self.wfile.write(b'\r\n')
            except Exception as e:
                logging.warning('Removed streaming client %s: %s', self.client_address, str(e))
        else:
            self.send_error(404)
            self.end_headers()

class StreamingServer(socketserver.ThreadingMixIn, server.HTTPServer):
    allow_reuse_address = True
    daemon_threads = True


    #METER_MODES = {
       # 'average': mmal.MMAL_PARAM_EXPOSUREMETERINGMODE_AVERAGE,
       # 'spot':    mmal.MMAL_PARAM_EXPOSUREMETERINGMODE_SPOT,
       # 'backlit': mmal.MMAL_PARAM_EXPOSUREMETERINGMODE_BACKLIT,
       # 'matrix':  mmal.MMAL_PARAM_EXPOSUREMETERINGMODE_MATRIX,
       # }

   # EXPOSURE_MODES = {
      #  'off':           mmal.MMAL_PARAM_EXPOSUREMODE_OFF,
      #  'auto':          mmal.MMAL_PARAM_EXPOSUREMODE_AUTO,
      #  'night':         mmal.MMAL_PARAM_EXPOSUREMODE_NIGHT,
      #  'nightpreview':  mmal.MMAL_PARAM_EXPOSUREMODE_NIGHTPREVIEW,
      #  'backlight':     mmal.MMAL_PARAM_EXPOSUREMODE_BACKLIGHT,
      #  'spotlight':     mmal.MMAL_PARAM_EXPOSUREMODE_SPOTLIGHT,
      #  'sports':        mmal.MMAL_PARAM_EXPOSUREMODE_SPORTS,
      #  'snow':          mmal.MMAL_PARAM_EXPOSUREMODE_SNOW,
      #  'beach':         mmal.MMAL_PARAM_EXPOSUREMODE_BEACH,
      #  'verylong':      mmal.MMAL_PARAM_EXPOSUREMODE_VERYLONG,
      #  'fixedfps':      mmal.MMAL_PARAM_EXPOSUREMODE_FIXEDFPS,
      #  'antishake':     mmal.MMAL_PARAM_EXPOSUREMODE_ANTISHAKE,
      #  'fireworks':     mmal.MMAL_PARAM_EXPOSUREMODE_FIREWORKS,
      #  }


output = StreamingOutput()

class ServerThread (threading.Thread):

	def __init__(self, threadID, name):
		threading.Thread.__init__(self)
		self.threadID = threadID
		self.name = name

	def run(self):
		print ("Starting http server.")
		address = ('', 5000)
		server = StreamingServer(address, StreamingHandler)
		while 1:
			server.handle_request()

def photoGallery():
	with picamera.PiCamera(resolution="3280x2464", framerate=captureExposure) as camera:

		camera.exposure_mode = exposureMode
		camera.meter_mode = meterMode
		camera.rotation = rotation

		time.sleep(3)

		timestamp = str(int(time.time()))

		for x in range(0, captureNumber):
			camera.capture('/home/pi/Desktop/dcim/4K/'+timestamp+'_'+str(x)+'.jpg', format='jpeg')

		camera.close()

serverThread = ServerThread(1, "ServerThread")
serverThread.start()

command = input()

while 1:
	print("New Config: "+command)

	params = command.split(' ')
	FPS = int(params[0])
	exposureMode = params[1]
	meterMode = params[2]
	streamRES = params[3]
	recordRES = params[4]
	record = params[5] == 'true'
	
	doGallery = False

	print("with picamera")

	time.sleep(2)
	with picamera.PiCamera(resolution=recordRES, framerate=FPS) as camera:

		camera.exposure_mode = exposureMode
		camera.meter_mode = meterMode
		camera.rotation = rotation

		print("mode set")

		splitparams = streamRES.split('x')
		wid = int(splitparams[0])
		hei = int(splitparams[1])

		print("wid:"+str(wid)+" hei:"+str(hei))

		camera.start_recording(output, format='mjpeg',splitter_port=1, resize=(wid,hei))

		print("streaming")

		if record:

			now = datetime.now()
			date_time = now.strftime("%Y-%m-%d_%H-%M")

			filename = '/home/pi/Desktop/recordings/'+date_time+"_"+str(FPS)+'fps.h264'
			camera.start_recording(filename, format='h264', splitter_port=2)

		print("streamUpdated "+str(camera.resolution[0])+"x"+str(camera.resolution[1])+" "+str(camera.framerate)+" "+str(record))
		print("streamUpdated")

		getcommand = input()

		while getcommand.startswith('PHOTO'):

			print("photoloop")

			if getcommand == "PHOTO_shoot":
				print("Taking photo.")
				camera.capture('/home/pi/Desktop/dcim/'+str(int(time.time()))+'.jpg', format='jpeg', splitter_port=3)
			elif getcommand == "PHOTO_gallery":
				print("Making gallery.")
				doGallery = True
				break

			getcommand = input()

		if not doGallery:
			command = getcommand

		camera.stop_recording()
		camera.close()

	if doGallery:
		photoGallery()
