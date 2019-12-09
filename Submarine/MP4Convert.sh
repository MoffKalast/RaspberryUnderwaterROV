#!/bin/bash

echo "Encoding all h264 files to mp4..."
echo ""

cd /home/pi/Desktop/recordings

for file in *; do
	if [[ "$file" == *h264 ]]; then
		fps=$(echo "$file"| grep -o "[0-9]*fps")
		fps=${fps%f*}
		filename=${file%.*}
		echo "Converting $filename at $fps fps."
		MP4Box -fps "$fps" -add "$file" "$filename".mp4
		echo ""
	fi
done

echo "Done!"