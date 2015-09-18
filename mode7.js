var BG_IMG = new Image();
var BG_IMG_DATA_ARRAY = [];
var BG_IMG_WIDTH = 320;
var BG_IMG_HEIGHT = 240;

var CAM_SL = 90;
var CAM_X = 160;
var CAM_Y = 40;
var CAM_Z = 70;
var CAM_R = 0;

var GROUND_W = 320;
var GROUND_H = 240;
var GROUND_Y = 0;
var SCALE = 0.5;

var LOOP_COUNT = 0;

var drawImagePixel = function(canvasDataArray, canvasRedAt, imageDataArray, imageReadAt) {
	canvasDataArray[canvasRedAt + 0] = imageDataArray[imageReadAt + 0];
	canvasDataArray[canvasRedAt + 1] = imageDataArray[imageReadAt + 1];
	canvasDataArray[canvasRedAt + 2] = imageDataArray[imageReadAt + 2];
	canvasDataArray[canvasRedAt + 3] = imageDataArray[imageReadAt + 3];
};

var drawTransparent = function(canvasDataArray, canvasRedAt, imageDataArray, imageReadAt) {
	canvasDataArray[canvasRedAt + 3] = 0;
};

var render = function (ctx, imageData, imageDataData, w, h) {

	var u = 0;
	var v = 0;
	var redAt = 0;
	LOOP_COUNT = 0;

	var cosCam = Math.cos(CAM_R * Math.PI / 180);
	var sinCam = Math.sin(CAM_R * Math.PI / 180);

	var projDistance = 0;

	var dx = 0;
	var dy = 0;

	for (v = 0; v < h/2; v++) {

		projDistance = (CAM_Y / v) * CAM_SL;

		for (u = -(w/2); u < w/2; u++) {

			drawImagePixel(
				imageDataData, 
				(redAt++) * 4, 
				BG_IMG_DATA_ARRAY, 
				((BG_IMG_WIDTH * ~~Math.abs((((u / CAM_SL) * cosCam + sinCam) * projDistance + CAM_Z) % BG_IMG_HEIGHT)) + 
				~~Math.abs(((cosCam - (u / CAM_SL) * sinCam) * projDistance + CAM_X) % BG_IMG_WIDTH)) * 4);

			LOOP_COUNT++;

		}
	}
	
	ctx.putImageData(imageData, 0, 0);
};

var getRawImageData = function(img) {
	var cav = document.createElement('canvas');
	var ctx = cav.getContext('2d');
	cav.width = img.width;
	cav.height = img.height;
	ctx.drawImage(img, 0, 0);
	return ctx.getImageData(0, 0, img.width, img.height);
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
	var imageData = bgCtx.getImageData(0, 0, width * SCALE, height * SCALE);
	var imageDataData = imageData.data;

	var start = function(){

		var loop = setInterval(function(){

			// render image
			ctx.clearRect(0, 0, width, height);
			render(bgCtx, imageData, imageDataData, width * SCALE, height * SCALE);
			ctx.drawImage(
				bgCav, 
				0, 0, width * SCALE, height * SCALE/2, 
				0, height * SCALE, width, height * SCALE);

			// rotation animation
			CAM_R += tl/100;

			// render fps
			date = new Date();
			pft = cft;
			cft = date.getTime();
			tl = cft - pft;
			date = null;
			ctx.fillText('LOOP: ' + LOOP_COUNT + ', FPS: ' + ~~(1000/tl), 0, 20);

		}, 1000/200);

	};

	// load image
	BG_IMG = new Image();
	BG_IMG.onload = function(e){
		BG_IMG_DATA_ARRAY = getRawImageData(BG_IMG).data;
		start();
	}
	BG_IMG.src = 'ground.png';
};
