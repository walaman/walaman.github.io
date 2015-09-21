(function(){

var IMG_BG = new Image();
var IMG_BG_DATA_ARRAY = [];
var IMG_BG_WIDTH = 256;
var IMG_BG_HEIGHT = 256;

var SCR_W = 320;
var SCR_H = 375;

var CAM_SL = 200;
var CAM_X = 0;
var CAM_Y = 100;
var CAM_Z = 70;
var CAM_R = 100;
var CAM_DOV = 1400;

var GROUND_W = 320;
var GROUND_H = 240;
var GROUND_X = 0;
var GROUND_Y = 0;

var FPS = 200;
var SCALE = 0.5;
var LOOP_COUNT = 0;

var MATH_SIN = Math.sin;
var MATH_COS = Math.cos;

var MATH_ASIN = Math.asin;
var MATH_ACOS = Math.acos;
var MATH_ATAN = Math.atan;

var MATH_SQRT = Math.sqrt;
var MATH_PI = Math.PI;
var MATH_ABS = Math.abs;

var IMG_OBJ;
var OBJS = [
{
	x : 100,
	y : 0,
	z : 200
}
];

var IMGS_SRC = [
	'ground2.png', 
	'oldman.png'
];

var IMGS;

var renderGround = function (imageDataArray, width, height) {

	LOOP_COUNT = 0;
	var cosCam = MATH_COS(CAM_R * MATH_PI / 180);
	var sinCam = MATH_SIN(CAM_R * MATH_PI / 180);
	var ra = -1, u, v, pd, dx, dy, dp, halfHeight = height/2, halfWidth = width/2, w = CAM_SL;

	for (v = 0; v < halfHeight; v++) {
		for (u = -halfWidth; u < halfWidth; u++) {

			// pd = (CAM_Y / v) * MATH_SQRT( w * w + u * u ); // fish eye
			pd = (CAM_Y / v) * w; // plain
			ra++;

			if (pd > CAM_DOV) continue;

			dx = ((u / w) * cosCam + sinCam) * pd + CAM_X;
			dy = -(cosCam - (u / w) * sinCam) * pd + CAM_Z;

			dp = ((IMG_BG_WIDTH * ~~MATH_ABS(dy & 255)) + ~~MATH_ABS(dx & 255)) * 4;

			imageDataArray[ra] = 
				(~~(IMG_BG_DATA_ARRAY[dp + 3] * (1 - pd / CAM_DOV) ) << 24) | // aplha
				(IMG_BG_DATA_ARRAY[dp + 2] << 16) | // blue
				(IMG_BG_DATA_ARRAY[dp + 1] <<  8) | // green
				 IMG_BG_DATA_ARRAY[dp + 0]; // red

			// LOOP_COUNT++;
		}
	}
	
};

var renderObjects = function(ctx, objs) {

	// pre cal camera state
	var camObjs = [];
	var obj;
	var dist, dx, dy, u, v, w = CAM_SL, da;

	// each objects
	for (var i = objs.length-1; i >= 0; i--) {

		obj = objs[i];

		// cal distance form camera
		dx = CAM_X - obj.x;
		dz = CAM_Z - obj.z;
		dist = MATH_SQRT( dz * dz + dx * dx );

		// cal projected geometry from camera
		v = (CAM_Y / dist) * w;

		da = MATH_ATAN(dx/dz) - CAM_R * MATH_PI / 180;

		dist = MATH_COS(da) * dist;

		ctx.drawImage(IMG_OBJ, 0, v);

		// cal scale factor
		LOOP_COUNT = dist;

		// sort

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
	var width = SCR_W;
	var height = SCR_H;

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
	var imageData = bgCtx.createImageData(width * SCALE, height * SCALE / 2);

	var buf = new ArrayBuffer(imageData.data.length);
	var buf8 = new Uint8ClampedArray(buf);
	var data = new Uint32Array(buf);

	var count = 0;
	var totalFps = 0;;

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
			// CAM_Z += tl / 3;

			// render fps
			date = new Date();
			pft = cft;
			cft = date.getTime();
			tl = cft - pft;
			date = null;

			count++;
			totalFps += 1000/tl;

			ctx.fillText('LOOP: ' + LOOP_COUNT + ', FPS: ' + ~~(totalFps / count), 0, 20);

		}, 1000/FPS);

	};

	// load image
	IMGS = IMGS_LOADER.loadSrcs(IMGS_SRC, function(results){
		IMG_BG_DATA_ARRAY = getRawImageData(IMG_BG).data;
		start();
	});

	IMG_BG = IMGS[0];
	IMG_OBJ = IMGS[1];

};

init();

})();
