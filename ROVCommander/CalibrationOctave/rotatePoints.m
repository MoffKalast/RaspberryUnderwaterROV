function [x, y] = rotatePoints(x, y)

  xy = sqrt(x.*x + y.*y);

  [q, minindex] = min(xy);
  [r, maxindex] = max(xy);

  val = y(minindex);
  angle = asin(val/r);

  rotat = [cos(angle),sin(angle);-sin(angle),cos(angle)];

  xy = rotat * [x,y]';

  x = xy(1,:);
  y = xy(2,:);

  figure(1);
  plot(x,y)