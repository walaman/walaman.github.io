var BG_IMG = new Image();
var BG_IMG_DATA_ARRAY = [];
var BG_IMG_WIDTH = 256;
var BG_IMG_HEIGHT = 256;

var CAM_SL = 100;
var CAM_X = 0;
var CAM_Y = 100;
var CAM_Z = 70;
var CAM_R = -90;
var CAM_DOV = 1000;

var GROUND_W = 320;
var GROUND_H = 240;
var GROUND_X = 0;
var GROUND_Y = 0;

var SCALE = 0.5;

var LOOP_COUNT = 0;

var render = function (imageDataArray, w, h) {

	var u = 0;
	var v = 0;
	var redAt = 0;
	LOOP_COUNT = 0;

	var cosCam = Math.cos(CAM_R * Math.PI / 180);
	var sinCam = Math.sin(CAM_R * Math.PI / 180);

	var projDistance = 0;

	var dx = 0;
	var dy = 0;
	var dw = 0;
	var dp = 0;
	var da = 0;

	for (v = 0; v < h/2; v++) {

		projDistance = (CAM_Y / v) * CAM_SL;

		if (projDistance > CAM_DOV) {
			redAt += w;
			continue;
		}

		da = 1 - projDistance / CAM_DOV;

		for (u = -(w/2); u < w/2; u++) {

			dx = ((cosCam - (u / CAM_SL) * sinCam)
				 * projDistance 
				 + CAM_X)
				 & 255;

			dy = (((u / CAM_SL) * cosCam + sinCam)
				 * projDistance 
				 + CAM_Z)
				 & 255;

			dp = ((BG_IMG_WIDTH * 
					~~(dy < 0 ? -dy : dy)) + 
					~~(dx < 0 ? -dx : dx)) * 4;

			imageDataArray[redAt++] = 
				(~~(BG_IMG_DATA_ARRAY[dp + 3] * da) << 24) | // aplha
				(BG_IMG_DATA_ARRAY[dp + 2] << 16) | // blue
				(BG_IMG_DATA_ARRAY[dp + 1] <<  8) | // green
				 BG_IMG_DATA_ARRAY[dp + 0]; // red

			// imageDataArray[redAt++] = BG_IMG_DATA_ARRAY[dp];

			LOOP_COUNT++;
		}
	}
	
};

var getRawImageData = function(img) {
	var cav = document.createElement('canvas');
	var ctx = cav.getContext('2d');
	cav.width = img.width;
	cav.height = img.height;
	ctx.drawImage(img, 0, 0);
	return ctx.getImageData(0, 0, img.width, img.height);
};

var getRawImage32BitArray = function(img) {

	var cav = document.createElement('canvas');
	var ctx = cav.getContext('2d');
	var width = img.width;
	var height = img.height;

	cav.width = width;
	cav.height = height;
	ctx.drawImage(img, 0, 0);
	var imgDataArray = ctx.getImageData(0, 0, width, height).data;

	var buf = new ArrayBuffer(imgDataArray.length);
	var data = new Uint32Array(buf);

	var dp = 0;
	var redAt = 0;

	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {

			dp = redAt * 4;

			data[redAt++] = 
				(imgDataArray[dp + 3] << 24) | // aplha
				(imgDataArray[dp + 2] << 16) | // blue
				(imgDataArray[dp + 1] <<  8) | // green
				 imgDataArray[dp + 0]; // red

		}
	}


	return data;
};


var init = function () {

	// screen size
	var width = 320;
	var height = 375;

	// game canvas and context
	var cav = document.getElementById('game_canvas');
	var ctx = cav.getContext('2d');

	cav.width = width;
	cav.height = height;

	ctx.webkitImageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
	cav.style.backgroundColor = '#000';
	ctx.fillStyle = '#00F';
	ctx.fillRect(0, 0, width, height);

	// fps counter
	var date = new Date();
	var cft = date.getTime();
	var pft = cft;
	var tl = 0;
	ctx.fillStyle = '#FFF';
	ctx.textAlign = 'left';
	ctx.font = '20px Arial';

	// ground canvas
	var bgCav = document.createElement('canvas');
	var bgCtx = bgCav.getContext('2d');
	bgCav.width = width * SCALE;
	bgCav.height = height * SCALE;

	// reusable image data (for faster render)
	var imageData = bgCtx.createImageData(width * SCALE, height * SCALE/2);

	var buf = new ArrayBuffer(imageData.data.length);
	var buf8 = new Uint8ClampedArray(buf);
	var data = new Uint32Array(buf);

	var start = function(){

		var loop = setInterval(function(){

			// render image
			ctx.clearRect(0, 0, width, height);

			render(data, width * SCALE, height * SCALE);
			imageData.data.set(buf8);
			bgCtx.putImageData(imageData, 0, height * SCALE/2);

			ctx.drawImage(bgCav, 0, 0, width, height);

			// rotation animation
			CAM_R += tl / 50;
			CAM_X += tl / 3;

			// render fps
			date = new Date();
			pft = cft;
			cft = date.getTime();
			tl = cft - pft;
			date = null;
			ctx.fillText('LOOP: ' + LOOP_COUNT + ', FPS: ' + ~~(1000/tl), 0, 20);

		}, 1000/60);

	};

	// load image
	BG_IMG = new Image();
	BG_IMG.onload = function(e){
		BG_IMG_DATA_ARRAY = getRawImageData(BG_IMG).data;
		// BG_IMG_DATA_ARRAY = getRawImage32BitArray(BG_IMG);
		start();
	}
	BG_IMG.src = 'ground2.png';
};
