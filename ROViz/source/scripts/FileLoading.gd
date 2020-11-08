extends Node

func load_text_file(path):
	var f = File.new()
	var err = f.open(path, File.READ)
	if err != OK:
		printerr("Could not open file, error code ", err)
		return ""
	var text = f.get_as_text()
	f.close()
	
	var list = text.split("\n")
	var data = []
	var maxdepth = 0
	var maxdepthindex = 0
		
	var timeoffset = int(list[0].split(" ")[0])
		
	var x = 0
	for sample in list:
		var values = sample.split(" ")
				
		var floatvalues = []
		for i in len(values):
			floatvalues.append(float(values[i]))
			
		floatvalues[0] = int(values[0]) - timeoffset
		
		if len(floatvalues) == 12:
			floatvalues.insert(5, floatvalues[5])
			floatvalues.insert(10, 1000.0)
			floatvalues[5] *= -1
			floatvalues[6] *= -1
			
		if len(floatvalues) > 5:
			if floatvalues[4] < 0:
				floatvalues[4] = -floatvalues[4]
			if floatvalues[4] > 25:
				floatvalues[4] = data[len(data)-1][4]
			
			if floatvalues[4] > maxdepth:
				maxdepth = floatvalues[4]
				maxdepthindex = x
		
			data.append(floatvalues)
			x +=1
	
	return [data, maxdepth, maxdepthindex]
