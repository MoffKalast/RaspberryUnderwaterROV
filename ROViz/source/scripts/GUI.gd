extends Control

var root
var sub

func _ready():
	root = get_parent()
	sub = root.get_node("Submarine2")
	
func _on_Button_pressed():
	$FileDialog.popup()
	
func _input(event):
	if Input.is_action_pressed("Exit"):
		get_tree().quit()
	
func _on_Exit_pressed():
	get_tree().quit()

func _on_FileDialog_file_selected(path):
	if not ".txt" in path:
		return
	sub.load_telemetry(path)


