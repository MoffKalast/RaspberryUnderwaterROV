extends Camera

var root
var sub
var tilter
var rotator

var vert = -0.5
var horiz = 0.5

var zoom = 1.353

var env
var underwater

func _input(event):
	if event is InputEventMouseMotion and Input.is_action_pressed("rmb"):
		vert -= event.relative.y * 0.005
		horiz -= event.relative.x * 0.005
		
		if vert < -1.5:
			vert = -1.5
		elif vert > 1.5:
			vert = 1.5
		
	if event.is_action_pressed("zoom_in"):
		zoom -= 0.15
	elif event.is_action_pressed("zoom_out"):
		zoom += 0.15
		
	if zoom < 0.5:
		zoom = 0.5

func _ready():
	tilter = get_parent()
	rotator = tilter.get_parent()
	root = rotator.get_parent()
	sub = root.get_node("Submarine2")
	env = root.get_node("WorldEnvironment")
	underwater = root.get_node("Underwater")

func _process(_delta):
	
	var subtrans = sub.get_global_transform().origin
	var trans = rotator.get_global_transform().origin
	var Rrotat = rotator.get_rotation()
	var Trotat = tilter.get_rotation()
	
	Rrotat.y = Rrotat.y * 0.65 + horiz * 0.35
	Trotat.x = Trotat.x * 0.65 + vert * 0.35

	rotator.set_translation(trans * 0.75 + subtrans * 0.25)
	rotator.set_rotation(Rrotat)
	tilter.set_rotation(Trotat)
	
	var localcamtrans = get_translation()
	localcamtrans.z = localcamtrans.z * 0.85 + zoom * 0.15
	set_translation(localcamtrans)
	
	var depth = get_global_transform().origin.y
	var envir = env.get_environment()
	
	if depth < 0:
		envir.fog_enabled = true
		envir.background_mode = 1
		underwater.visible = true
	else:
		envir.fog_enabled = false
		envir.background_mode = 2
		underwater.visible = false
	
	var light = depth
	if depth > 0:
		light = 1.5
	else:
		light = 1.5 + depth/30 
	
	env.get_node("DirectionalLight").light_energy = light
