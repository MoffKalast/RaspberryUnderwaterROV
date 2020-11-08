extends MeshInstance


var root
var sub

func _ready():
	root = get_parent()
	sub = root.get_node("Submarine2")

func _process(delta):
	
	var trans = sub.get_global_transform().origin;
	trans.y = 0
	
	set_translation(trans)
	
	get_surface_material(0).set_shader_param("world_object_position",trans)
