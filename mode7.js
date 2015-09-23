(function(){

var MATH_SIN = Math.sin;
var MATH_COS = Math.cos;

var MATH_ASIN = Math.asin;
var MATH_ACOS = Math.acos;
var MATH_ATAN = Math.atan;

var MATH_SQRT = Math.sqrt;
var MATH_PI = Math.PI;
var MATH_ABS = Math.abs;

var IMG_BG = new Image();
var IMG_BG_DATA_ARRAY = [];
var IMG_BG_WIDTH = 256;
var IMG_BG_HEIGHT = 256;

var SCR_W = 320;
var SCR_H = 375;

var CAM_SL = 160;
var CAM_X = 0;
var CAM_Y = 60;
var CAM_Z = 60;
var CAM_R = 0;
var CAM_DOV = 1400;

var GROUND_W = 320;
var GROUND_H = 240;
var GROUND_X = 0;
var GROUND_Y = 0;

var FPS = 100;
var SCALE = 0.5;
var LOOP_COUNT = 0;

var IMG_OBJ;
var IMG_OBJ_WIDTH = 31;
var IMG_OBJ_HEIGHT = 38;

var OBJS = [
{
	x : 70,
	y : 0,
	z : 300,

	dispX : 0,
	dispY : 0,
	dispW : 0,
	dispH : 0

},
{
	x : -70,
	y : 0,
	z : 300,

	dispX : 0,
	dispY : 0,
	dispW : 0,
	dispH : 0
}
];

var IMGS_SRC = [
	'ground2.png', 
	'oldman.png'
];

var IMGS;

var renderGround = function (imageDataArray, width, height) {

	LOOP_COUNT = 0;
	var cosCam = MATH_COS(CAM_R);
	var sinCam = MATH_SIN(CAM_R);
	var ra = -1, 
		u, 
		v, 
		pd, 
		dx, 
		dy, 
		dp, 
		halfHeight = height/2, 
		halfWidth = width/2, 
		w = CAM_SL;

	for (v = 0; v < halfHeight; v++) {
		for (u = -halfWidth; u < halfWidth; u++) {

			pd = (CAM_Y / v) * w;
			ra++;

			if (pd > CAM_DOV) continue;

			dx = ((u / w) * cosCam + sinCam) * pd + CAM_X;
			dy = -(cosCam - (u / w) * sinCam) * pd - CAM_Z;

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

var renderObjects = function(ctx, objs, width, height) {

	// pre cal camera state
	var camObjs = [],
		obj, distance, 
		dx, dz, 
		px, py,
		dispScale, dispX, dispY, dispW, dispH,
		halfHeight = height/2,
		halfWidth = width/2;

	var cosCam = MATH_COS(CAM_R);
	var sinCam = MATH_SIN(CAM_R);

	// projections
	for (var i = objs.length-1; i >= 0; i--) {

		obj = objs[i];

		// cal distance form camera
		dx = CAM_X - obj.x;
		dz = CAM_Z - obj.z;
		distance = MATH_SQRT( dz * dz + dx * dx );

		// cal projected geometry from camera
		px =  ((dx / distance) * cosCam - (dz / distance) * sinCam) * distance;
		py = -((dz / distance) * cosCam + (dx / distance) * sinCam) * distance;
		
		// cal scale factor
		dispScale = CAM_SL / py;
		dispW = IMG_OBJ_WIDTH * dispScale;
		dispH = IMG_OBJ_HEIGHT * dispScale;
		dispX = halfWidth - (px * dispScale) - dispW / 2;
		dispY = halfHeight + (CAM_Y * dispScale) - dispH;

		if (py < 0 || distance > CAM_DOV || 
			dispX + dispW < 0 || dispY > width) continue;

		obj.dispW = dispW;
		obj.dispH = dispH;
		obj.dispX = dispX;
		obj.dispY = dispY;

		ctx.drawImage(
			IMG_OBJ,
			0, 
			0, 
			~~IMG_OBJ_WIDTH, 
			~~IMG_OBJ_HEIGHT,
			~~obj.dispX, 
			~~obj.dispY, 
			~~obj.dispW, 
			~~obj.dispH);

	}

	// draw objs
	for (var i = camObjs.length - 1; i >= 0; i++) {

		obj = camObjs.pop();



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
			ctx.clearRect(0, 0, width * SCALE, height * SCALE);
			bgCtx.putImageData(imageData, 0, height * SCALE/2);

			// render objects
			renderObjects(bgCtx, OBJS, width * SCALE, height * SCALE);

			// draw scene
			ctx.drawImage(bgCav, 0, 0, width, height);

			// update cam
			// CAM_R += tl / 2000;
			// CAM_X += tl / 3;
			CAM_Z += tl / 20;

			// render fps
			date = new Date();
			pft = cft;
			cft = date.getTime();
			tl = cft - pft;
			date = null;

			count++;
			totalFps += 1000/tl;

			ctx.fillText('LOOP: ' + ~~LOOP_COUNT + ', FPS: ' + ~~(totalFps / count), 0, 20);

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
