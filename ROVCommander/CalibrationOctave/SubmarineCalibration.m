
x = load("-ascii","x")';
y = load("-ascii","y")';
z = load("-ascii","z")';

figure(1);
scatter3(x,y,z);
xlabel("X");
ylabel("Y");
zlabel("Z");
title("Raw Data");

"X"
max(x)
min(x)

"Y"
max(y)
min(y)

"Z"
max(z)
min(z)

avg_delta_x = (max(x) + min(x)) / 2
avg_delta_y = (max(y) + min(y)) / 2
avg_delta_z = (max(z) + min(z)) / 2

x -= avg_delta_x;
y -= avg_delta_y;
z -= avg_delta_z;

"Rotate"

#[x, y] = rotatePoints(x, y);
#[y, z] = rotatePoints(y, z);
#[x, z] = rotatePoints(x, z);

figure(2);
scatter(x,y);
title("xy")

distx = (abs(max(x)) + abs(min(x))) / 2
disty = (abs(max(y)) + abs(min(y))) / 2
distz = (abs(max(z)) + abs(min(z))) / 2

avg_delta = (distx + disty + distz) / 3

scale_x = avg_delta / distx
scale_y = avg_delta / disty
scale_z = avg_delta / distz

x1 *= scale_x;
y1 *= scale_y;
z1 *= scale_z;

figure(3);
scatter3(x1,y1,z1);
xlabel("X");
ylabel("Y");
zlabel("Z");
title("Correction");