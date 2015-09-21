(function(){


var BG_IMG = new Image();
var BG_IMG_DATA_ARRAY = [];
var BG_IMG_WIDTH = 256;
var BG_IMG_HEIGHT = 256;

var CAM_SL = 170;
var CAM_X = 0;
var CAM_Y = 200;
var CAM_Z = 70;
var CAM_R = 0;
var CAM_DOV = 1400;


var GROUND_W = 320;
var GROUND_H = 240;
var GROUND_X = 0;
var GROUND_Y = 0;

var FPS = 60;
var SCALE = 0.5;

var MATH_SIN = Math.sin;
var MATH_COS = Math.cos;
var MATH_SQRT = Math.sqrt;

var LOOP_COUNT = 0;

var OBJS = [
{
	x : -100,
	y : 0,
	z : 200
},
{
	x : 100,
	y : 0,
	z : 200
}
];

var renderGround = function (imageDataArray, w, h) {

	LOOP_COUNT = 0;

	var cosCam = MATH_COS(CAM_R * Math.PI / 180);
	var sinCam = MATH_SIN(CAM_R * Math.PI / 180);
	var ra = 0, u, v, pd, dx, dy, dp;

	for (v = 0; v < h/2; v++) {
		for (u = -(w/2); u < w/2; u++) {

			pd = (CAM_Y / v) * MATH_SQRT(CAM_SL*CAM_SL + u*u);

			if (pd > CAM_DOV) {
				ra++;
				continue;
			}

			dx = (((u / CAM_SL) * cosCam + sinCam)
				 * pd 
				 + CAM_X)
				 & 255;

			dy = -((cosCam - (u / CAM_SL) * sinCam)
				 * pd 
				 + CAM_Z)
				 & 255;

			dp = ((BG_IMG_WIDTH * 
					~~(dy < 0 ? -dy : dy)) + 
					~~(dx < 0 ? -dx : dx)) * 4;

			imageDataArray[ra++] = 
				(~~(BG_IMG_DATA_ARRAY[dp + 3] * (1 - pd / CAM_DOV) ) << 24) | // aplha
				(BG_IMG_DATA_ARRAY[dp + 2] << 16) | // blue
				(BG_IMG_DATA_ARRAY[dp + 1] <<  8) | // green
				 BG_IMG_DATA_ARRAY[dp + 0]; // red

			LOOP_COUNT++;
		}
	}
	
};

var renderObjects = function(ctx, objs) {

	// pre cal camera state

	// each objects
	for (var i = objs.length; i >= 0; i--) {

		// cal projected postion form camera

		// 
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

var setup = function() {

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

			// clear screen
			ctx.clearRect(0, 0, width, height);

			// render ground
			renderGround(data, width * SCALE, height * SCALE);
			imageData.data.set(buf8);
			bgCtx.putImageData(imageData, 0, height * SCALE/2);

			// render objects
			renderObjects(bgCtx, OBJS);

			// draw scene
			ctx.drawImage(bgCav, 0, 0, width, height);

			// update cam
			CAM_R += tl / 50;
			// CAM_X += tl / 3;

			// render fps
			date = new Date();
			pft = cft;
			cft = date.getTime();
			tl = cft - pft;
			date = null;
			ctx.fillText('LOOP: ' + LOOP_COUNT + ', FPS: ' + ~~(1000/tl), 0, 20);

		}, 1000/FPS);

	};

	// load image
	BG_IMG = new Image();
	BG_IMG.onload = function(e){
		BG_IMG_DATA_ARRAY = getRawImageData(BG_IMG).data;
		start();
	}
	BG_IMG.src = 'ground2.png';
};

init();

})();
