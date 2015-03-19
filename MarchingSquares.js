// Modified from the base code from CS519 Visualization (Spring 2015).

var x_extent=[-1.0,1.0];
var y_extent=[-1.0,1.0];
var myGrid;

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


