extends Spatial

var index = 0
var telemetry = null

var speed = 0
var heading = 0
var pitch = 0
var roll = 0
var depth = 0

var slerp_rotation = null

var deltatime = 0

var root
var gui
var timeline

var lastsetindex = 0

var MAX_DEPTH = 0
var MAX_DEPTH_INDEX = 0

var trail_scene

var time_start = 0
var slerp_amount = 0.1

var fastforard_index
var fastforward = false

func load_telemetry(path):
	var getdata = FileLoading.load_text_file(path)
	
	telemetry = getdata[0]
	MAX_DEPTH = getdata[1]
	MAX_DEPTH_INDEX = getdata[2]
	
	root.get_node("Ground").set_translation(Vector3(0,-MAX_DEPTH-0.1,0))
	gui.get_node("MaxDepth").value = int(MAX_DEPTH_INDEX * timeline.max_value/len(telemetry))

	reset()

func reset():
	index = 0
	slerp_rotation = null
	lastsetindex = 0
	timeline.value = 0
	slerp_amount = float(telemetry[1][0] - telemetry[0][0])/1000.0
	
	set_translation(Vector3(0,0,0))
	
	get_node("ImmediateGeometry").free()
	add_child(trail_scene.instance())
	
	time_start = OS.get_ticks_msec()
	
func set_index(new_index):
	if new_index < index:
		reset()
	
	lastsetindex = timeline.value
	time_start = OS.get_ticks_msec() - telemetry[index][0]
	
	fastforard_index = new_index
	fastforward = true

func _ready():	
	root = get_parent()
	gui = root.get_node("GUI")
	timeline = gui.get_node("Timeline")
	timeline.value = 0
	
	trail_scene = preload("res://scenes/TrailEffect.tscn")

func set_particles(emitter, pspeed):
	if abs(pspeed) < 15:
		emitter.emitting = false
	else:
		var colour = abs(pspeed)/255.0
		
		emitter.emitting = true
		emitter.process_material.initial_velocity = pspeed/4.0
		emitter.process_material.color = Color(colour,colour,colour,1.0)
		
func get_data(slerp):
	var values_prev = telemetry[index]
	var values_next = telemetry[index+1]
	
	var values = []
	for i in range(len(values_prev)):
		values.append(values_prev[i] * (1.0 - slerp) + slerp * values_next[i])
	
	values[4] = telemetry[index+10][4] * (1.0 - slerp) + slerp * telemetry[index+11][4]
	
	return values

func fast_forward():
	if fastforard_index > index:
		var trans = get_global_transform().origin
		
		var heading = 0
		var pitch = 0
		var roll = 0
		
		for i in range(20):
		
			var values = get_data(0.0)

			heading = deg2rad(values[1])
			pitch = -deg2rad(values[2])
			roll = -deg2rad(values[3])

			var depth = values[4]
			var hover_right_speed = values[5]
			var hover_left_speed = values[6]
			var right_speed = values[7]
			var left_speed = values[8]
			
			var speed = (right_speed + left_speed) * 0.095			
			trans.x -= sin(heading) * speed * 0.001
			trans.z -= cos(heading) * speed * 0.001
			trans.y = -depth-0.03
		
			index +=1
		
		if index > fastforard_index:
			index = fastforard_index			
		
		var newindex = int(index * timeline.max_value/len(telemetry))
		timeline.value = newindex
		lastsetindex = newindex
		time_start = OS.get_ticks_msec() - telemetry[index][0]
		
		set_translation(trans)
		transform.basis = Basis(Quat(Vector3(pitch, heading, roll)))
		
	else:
		fastforward = false		

func _process(delta):
	
	if telemetry == null:
		return
		
	if fastforward:
		fast_forward()
		return
		
	if index >= len(telemetry)-12:
		reset()
	
	var values = get_data(deltatime/slerp_amount)

	var raw_heading = deg2rad(values[1])
	var raw_pitch = -deg2rad(values[2])
	var raw_roll = -deg2rad(values[3])

	var raw_depth = values[4]
	depth = depth * 0.97 + 0.03 * raw_depth

	var hover_right_speed = values[5]
	var hover_left_speed = values[6]
	
	$FrontLeft.rotate_y(-hover_left_speed*0.01)
	set_particles($FrontLeftEmitter,-hover_left_speed)
	
	$FrontRight.rotate_y(hover_right_speed*0.01)
	set_particles($FrontRightEmitter,-hover_right_speed)
	
	var right_speed = values[7]
	var left_speed = values[8]
	
	$RearLeft.rotate_z(left_speed*0.01)
	set_particles($RearLeftEmitter,left_speed)
		
	$RearRight.rotate_z(-right_speed*0.01)
	set_particles($RearRightEmitter,right_speed)

	var airtemp = values[9]
	var airpressure = values[10]/1000.0
	var coretemp = values[11]
	var voltage = values[12]
	
	var datastring = ""
	
	datastring += "\n Time: "+str(stepify(float(OS.get_ticks_msec()-time_start)/1000.0,0.1))+" s\n"
	datastring += " Depth: "+str(stepify(depth,0.01))+" m\n"
	datastring += " Heading: "+str(int(rad2deg(raw_heading)))+" deg\n"
	datastring += " Pitch: "+str(int(rad2deg(raw_pitch)))+" deg\n"
	datastring += " Roll: "+str(int(rad2deg(raw_roll)))+" deg\n\n"
	
	datastring += " R_Hover: "+str(int(hover_right_speed))+" %\n"
	datastring += " L_Hover: "+str(int(hover_left_speed))+" %\n"
	datastring += " R_Forward: "+str(int(right_speed))+" %\n"
	datastring += " L_Forward: "+str(int(left_speed))+" %\n\n"
	
	datastring += " Air Pressure: "+str(stepify(airpressure,0.01))+" bar\n"
	datastring += " Air Temp: "+str(stepify(airtemp,0.1))+" °C\n"
	datastring += " CPU Temp: "+str(stepify(coretemp,0.1))+" °C\n\n"
	
	datastring += " Batt Voltage: "+str(stepify(voltage,0.1))+" V\n"
	
	gui.get_node("Telemetry").text = datastring
	
	var raw_rotation = Quat(Vector3(pitch, heading, roll))
	if slerp_rotation != null:
		slerp_rotation = slerp_rotation.slerp(raw_rotation,0.1)
	else:
		slerp_rotation = raw_rotation
	
	heading = heading * 0.7 + 0.3 * raw_heading
	pitch = pitch * 0.7 + 0.3 * raw_pitch
	roll = roll * 0.7 + 0.3 * raw_roll
	
	if right_speed < 0:
		right_speed *= 0.4
	if left_speed < 0:
		left_speed *= 0.4
	
	var rawspeed = (right_speed + left_speed) * 0.095
	
	speed = speed * 0.99 + 0.01 * rawspeed
	
	var trans = get_global_transform().origin
	
	trans.x -= sin(heading) * speed * 0.001
	trans.z -= cos(heading) * speed * 0.001
	trans.y = -depth-0.03

	set_translation(trans)
	transform.basis = Basis(slerp_rotation)
	
	deltatime += delta
	
	if (OS.get_ticks_msec()-time_start) >= telemetry[index+1][0]:
		slerp_amount = float(telemetry[index+2][0] - telemetry[index+1][0])/1000.0
		deltatime = 0
		index += 1
			
		var newindex = int(index * timeline.max_value/len(telemetry))
		
		if lastsetindex == timeline.value:
			timeline.value = newindex
			lastsetindex = newindex
		else:
			set_index(timeline.value * len(telemetry)/timeline.max_value)
