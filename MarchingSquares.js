// Modified from the base code from CS519 Visualization (Spring 2015).

var x_extent=[-1.0,1.0];
var y_extent=[-1.0,1.0];
var myGrid;

// Method: draw_contour
// Draw the contours.
UGrid2D.prototype.draw_contour = function(canvas, isovalues, scalar_func, line_scale) {
  var isovalue_list = isovalues.split(",");
  var ctx = canvas.getContext('2d');

  dx = canvas.width / this.resolution;
  dy = canvas.height / this.resolution;

  for (var x = 0; x < this.resolution; x++) {
    for (var y = 0; y < this.resolution; y++) {
      var min_x = x * dx;
      var min_y = y * dy;
      var max_x = min_x + dx;
      var max_y = min_y + dy;

      var scalar_0 = scalar_func(pixel2pt(canvas.width, canvas.height, x_extent, y_extent, min_x, min_y));
      var scalar_1 = scalar_func(pixel2pt(canvas.width, canvas.height, x_extent, y_extent, max_x, min_y));
      var scalar_2 = scalar_func(pixel2pt(canvas.width, canvas.height, x_extent, y_extent, max_x, max_y));
      var scalar_3 = scalar_func(pixel2pt(canvas.width, canvas.height, x_extent, y_extent, min_x, max_y));

      for (var i = 0; i < isovalue_list.length; i++) {
        var curr_isovalue = parseFloat(isovalue_list[i]);
        cell_contour(curr_isovalue, scalar_0, scalar_1, scalar_2, scalar_3, min_x, min_y, max_x, max_y, ctx, parseFloat(line_scale));
      }
    }
  }
}

function main() {
  // Check for the various File API support.
  if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
  } else {
    alert('The File APIs are not fully supported in this browser.');
  }

  render();
}

function render(canvas){
  var res = parseFloat(document.getElementById("grid_res").value);
  myGrid = new UGrid2D([x_extent[0], y_extent[0]], [x_extent[1], y_extent[1]], res);
  var canvas = document.getElementById('example');
  if (!canvas) {
    console.log('Failed to retrieve the <canvas> element');
    return false;
  } else {
    console.log(' Got < canvas > element ');
  }

  // Get the rendering context for 2DCG <- (2)
  var ctx = canvas.getContext('2d');

  // Draw the scalar data using an image rpresentation
  var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  //Determine the data range...useful for the color mapping
  var scalar_func = gaussian;
  var mn = scalar_func(pixel2pt(canvas.width, canvas.height, x_extent, y_extent, 0, 0));
  var mx = mn;
  for (var y = 0; y < canvas.height; y++) {
    for (var x = 0; x < canvas.width; x++) {
      var fval = scalar_func(pixel2pt(canvas.width, canvas.height, x_extent, y_extent, x, y));
      if (fval < mn) {
        mn = fval;
      }
      if (fval > mx) {
        mx = fval;
      }
    }
  }

  // Set the colormap based in the radio button
  var color_func = rainbow_colormap;
  if (document.getElementById("greyscale").checked) {
    color_func = greyscale_map;
  }

  //Color the domain according to the scalar value
  for (var y = 0; y < canvas.height; y++) {
    for (var x = 0; x < canvas.width; x++) {
      var fval = scalar_func(pixel2pt(canvas.width, canvas.height, x_extent, y_extent, x, y));
      var color = color_func(fval, mn, mx);

      i = (y * canvas.width + x) * 4

      imgData.data[i] = color[0];
      imgData.data[i + 1] = color[1];
      imgData.data[i + 2] = color[2];
      imgData.data[i + 3] = color[3];
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Draw the grid if necessary
  if (document.getElementById("draw_grid").checked) {
    myGrid.draw_grid(canvas);
  }

  if (document.getElementById("draw_contour").checked) {
    myGrid.draw_contour(canvas, document.getElementById("isovalues").value, scalar_func,
                        document.getElementById("line_scale").value);
  }
}

//--------------------------------------------------------
// Map a point in pixel coordinates to the 2D function domain
function pixel2pt(width,height,x_extent,y_extent, p_x,p_y){
	var pt = [0,0];
	xlen=x_extent[1]-x_extent[0]
	ylen=y_extent[1]-y_extent[0]
	pt[0]=(p_x/width)*xlen + x_extent[0];
	pt[1]=(p_y/height)*ylen + y_extent[0];
	return pt;
	}

//--------------------------------------------------------
// Map a point in domain coordinates to pixel coordinates
function pt2pixel(width,height,x_extent,y_extent, p_x,p_y){
	var pt = [0,0];

	var xlen = (p_x-x_extent[0])/(x_extent[1]-x_extent[0]);
  var ylen = (p_y-y_extent[0])/(y_extent[1]-y_extent[0]);

	pt[0]=Math.round(xlen*width);
	pt[1]=Math.round(ylen*height);
	return pt;
	}

//--------------------------------------------------------
// Draw randomly seeded stremalines

function draw_streamlines(canvas,ctx,num){
  for(var i=0;i<num;i++)
    {
    //Generate random seed
    var x = (2.0*Math.random())-1.0;
    var y = (2.0*Math.random())-1.0;
    var h = 5.0*(x_extent[1]-x_extent[0])/canvas.width;
    var steps = 20.0
    var linpts = euler_integration([x,y],h,steps,gaussian_gradient);

    //draw the line
     var pt = linpts[0];
     var pix = pt2pixel(canvas.width,canvas.height,x_extent,y_extent,pt[0],pt[1]);
     ctx.beginPath();
     ctx.moveTo(pix[0], pix[1]);
     for(var j=1;j<linpts.length;j++){
         pt = linpts[j];
         pixdest = pt2pixel(canvas.width,canvas.height,x_extent,y_extent,pt[0],pt[1]);
	       ctx.lineTo(pixdest[0],pixdest[1]);
         ctx.lineWidth = 1;
         ctx.strokeStyle = '#FFFFFF';
         ctx.stroke();
       }
    }
}

function cell_contour(isovalue, scalar_0, scalar_1, scalar_2, scalar_3, min_x, min_y, max_x, max_y, ctx, line_scale) {
  var s = [scalar_0, scalar_1, scalar_2, scalar_3];

  var b = [scalar_0 > isovalue,
           scalar_1 > isovalue,
           scalar_2 > isovalue,
           scalar_3 > isovalue];

  var pt = [[min_x, min_y],
            [max_x, min_y],
            [max_x, max_y],
            [min_x, max_y]];

  var interx = [];
  for (var i = 0; i < 4; i++) {
    var j = (i + 1) % 4;

    if (b[i] != b[j]) {
      var lambda = (isovalue - s[i]) / (s[j] - s[i]);

      interx.push([(pt[j][0] - pt[i][0]) * lambda + pt[i][0],
                   (pt[j][1] - pt[i][1]) * lambda + pt[i][1]]);
    }
  }

  if (interx.length == 0) {
    return;
  }

  if (interx.length == 2) {
    ctx.beginPath();
    ctx.moveTo(interx[0][0], interx[0][1]);
    ctx.lineWidth = line_scale;
    ctx.lineTo(interx[1][0], interx[1][1]);
    // ctx.lineWidth = 1;
    // set line color
    ctx.strokeStyle = '#000000';
    ctx.stroke();
    return;
  }

  if (interx.length != 4) {
    console.log('Problematic cell.');
  }

  console.log('Ambiguity detected.');

  var judge = (scalar_0 + scalar_1 + scalar_2 + scalar_3) / 4.0 > isovalue;
  var offset = (judge == b[0]) ? 0 : 1;
  for (var i = 0; i < 4; i += 2) {
    var first = (i + offset) % 4;
    var second = (i + offset + 1) % 4;
    ctx.beginPath();
    ctx.moveTo(interx[first][0], interx[first][1]);
    ctx.lineWidth = line_scale;
    ctx.lineTo(interx[second][0], interx[second][1]);
    // set line color
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  }
}
