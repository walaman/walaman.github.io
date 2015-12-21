(function(){


/*----------------------------------
  CONST
----------------------------------*/

// math alias
var MATH_SIN = Math.sin;
var MATH_COS = Math.cos;
var MATH_PI = Math.PI;
var MATH_ABS = Math.abs;

// screen
var SCR_W = 320;
var SCR_H = 375;

// camera
var CAM_SL = 160;
var CAM_X = 0;
var CAM_Y = 60;
var CAM_Z = 60;
var CAM_R = 0;
var CAM_DOV = 1400;

// ground
var GROUND_W = 320;
var GROUND_H = 240;
var GROUND_X = 0;
var GROUND_Y = 0;

// performance
var FPS = 100;
var SCALE = 0.5;
var LOOP_COUNT = 0;

// image
var IMG_BG = new Image();
var IMG_BG_DATA_ARRAY = [];
var IMG_BG_WIDTH = 256;
var IMG_BG_HEIGHT = 256;

var IMG_OBJ;
var IMG_OBJ_WIDTH = 31;
var IMG_OBJ_HEIGHT = 38;

var OBJS = [
  {
    x : 0,
    y : 0,
    z : 300,

    dispX : 0,
    dispY : 0,
    dispW : 0,
    dispH : 0,
    dispScale : 1

  }
];

var IMGS_SRC = [
  'ground2.png', 
  'oldman.png'
];

var IMGS;

/*----------------------------------
  render ground in 3d
----------------------------------*/
var renderGround = function (ctx, imageData, imageDataArray32, buf8, width, height) {

  LOOP_COUNT = 0;

  var cosCam = MATH_COS(CAM_R);
  var sinCam = MATH_SIN(CAM_R);
  var projectedImgPixelPos = -1, 
  u, v, 
  viewDistance, 
  dx, dy, groundImgPixelPos, 
  halfHeight = height/2, 
  halfWidth = width/2, 
  w = CAM_SL;

  for (v = 0; v < halfHeight; v++) {

    for (u = -halfWidth; u < halfWidth; u++) {

      viewDistance = (CAM_Y / v) * w;
      projectedImgPixelPos++;

      if (viewDistance > CAM_DOV) continue;

      dx =  ((u / w) * cosCam + sinCam) * viewDistance + CAM_X;
      dy = -(cosCam - (u / w) * sinCam) * viewDistance - CAM_Z;

      groundImgPixelPos = ((IMG_BG_WIDTH * ~~MATH_ABS(dy & 255)) + ~~MATH_ABS(dx & 255)) * 4;

      imageDataArray32[projectedImgPixelPos] = 
    	(~~(IMG_BG_DATA_ARRAY[groundImgPixelPos + 3] * (1 - viewDistance / CAM_DOV) ) << 24) | // aplha
    	(IMG_BG_DATA_ARRAY[groundImgPixelPos + 2] << 16) | // blue
    	(IMG_BG_DATA_ARRAY[groundImgPixelPos + 1] <<  8) | // green
    	 IMG_BG_DATA_ARRAY[groundImgPixelPos + 0]; // red

       LOOP_COUNT++;

    }
  }
  
  // draw ground
  imageData.data.set(buf8);
  ctx.putImageData(imageData, 0, halfHeight);

};

/*----------------------------------
  render objects in 3d
----------------------------------*/
var renderObjects = function(ctx, objs, width, height) {

  // pre cal camera state
  var camObjs = [], camObjOrder,
  obj,
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

    // cal projected geometry from camera
    px =  (dx * cosCam - dz * sinCam);
    py = -(dz * cosCam + dx * sinCam);

    // cal scale factor
    dispScale = CAM_SL / py;
    dispW = IMG_OBJ_WIDTH * dispScale;
    dispH = IMG_OBJ_HEIGHT * dispScale;
    dispX = halfWidth - (px * dispScale) - dispW / 2;
    dispY = halfHeight + (CAM_Y * dispScale) - dispH;

    // skip if out of screen
    if (py < 0 || py > CAM_DOV || dispX + dispW < 0 || dispY > width) 
      continue;

    // set obj
    obj.dispW = dispW;
    obj.dispH = dispH;
    obj.dispX = dispX;
    obj.dispY = dispY;
    obj.dispScale = dispScale;

    // push in order
    for (camObjOrder = camObjs.length - 1; camObjOrder >= 0; camObjOrder--) {
      if (camObjs[camObjOrder].dispScale >= dispScale) break;
    }
    camObjs.splice(camObjOrder + 1, 0, obj);

  }

  // draw objs
  for (var i = camObjs.length - 1; i >= 0; i--) {

    obj = camObjs.pop();
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

};

/*----------------------------------
  Image helpers
----------------------------------*/
var getRawImageData = function(img) {

  var cav = document.createElement('canvas');
  var ctx = cav.getContext('2d');
  cav.width = img.width;
  cav.height = img.height;
  ctx.drawImage(img, 0, 0);

  return ctx.getImageData(0, 0, img.width, img.height);

};

var loadImages = function(srcs, callback) {

  var imgLoadedCount = 0;
  var srcsLength = srcs.length;
  var imgs = [];

  for (var i = 0; i < srcsLength; i++) {
    imgs.push(new Image());
    imgs[i].onload = function(e) {
      if (imgLoadedCount++  === srcsLength - 1) {
        callback(imgs);
      }
    };
    imgs[i].src = srcs[i];
  }
  return imgs;

};

/*----------------------------------
  init
----------------------------------*/
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

  // camera canvas
  var camCav = document.createElement('canvas');
  var camCtx = camCav.getContext('2d');
  camCav.width = width * SCALE;
  camCav.height = height * SCALE;

  // reusable image data (for faster render)
  var imageData = camCtx.createImageData(width * SCALE, height * SCALE / 2);
  var buf = new ArrayBuffer(imageData.data.length);
  var buf8 = new Uint8ClampedArray(buf);
  var data = new Uint32Array(buf);

  var count = 0;
  var totalFps = 0;;

  var onLoop = function() {

    // updates
    CAM_R += tl / 2000;
    CAM_X += tl / 3;
    CAM_Z += tl / 20;

    // clear screen
    ctx.clearRect(0, 0, width, height);
    camCtx.clearRect(0, 0, width * SCALE, height * SCALE);

    // render ground
    renderGround(camCtx, imageData, data, buf8, width * SCALE, height * SCALE);

    // render objects
    renderObjects(camCtx, OBJS, width * SCALE, height * SCALE);

    // draw camera scene
    ctx.drawImage(camCav, 0, 0, width, height);

    // draw UI
    date = new Date();
    pft = cft;
    cft = date.getTime();
    tl = cft - pft;

    count++;
    totalFps += 1000 / tl;

    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'left';
    ctx.font = '20px Arial';
    ctx.fillText('LOOP: ' + ~~LOOP_COUNT + ', FPS: ' + ~~(totalFps / count), 0, 20);

  };

  // load image
  IMGS = loadImages(IMGS_SRC, function(results){
    IMG_BG_DATA_ARRAY = getRawImageData(IMG_BG).data;
    var loop = setInterval(onLoop, 1000/FPS);
  });

  IMG_BG = IMGS[0];
  IMG_OBJ = IMGS[1];

};

init();

})();
