extends Spatial

var camera_pivot;
# Declare member variables here. Examples:
# var a = 2
# var b = "text"
var t;
# Called when the node enters the scene tree for the first time.
func _ready():
	camera_pivot = get_node("CameraPivot");
	var t = get_transform();
	pass # Replace with function body.

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	camera_pivot.rotate_y(delta*0.1);
	#camera_pivot.set_transform(t);
	pass
