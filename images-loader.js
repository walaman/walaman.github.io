var IMG_LOADER = (function(){

	var resList = [];

	var loadResList = function(mediaList, resList, cb){

		resList = resList;

		this.cb = cb;

		for (var i = resList.length - 1; i >= 0; i--) {
			resList[i].loaded = false;
			loadRes(mediaList, resList[i]);
		};
	};

	var loadRes = function(mediaList, res){
		var mediaId = res.id;
		mediaList[mediaId] = new Image();

		mediaList[mediaId].onload = function(e){
			mediaDidLoad(e, mediaId);
		};

		mediaList[mediaId].src = res.url;
	};

	var mediaDidLoad = function(e, mediaId){

		var loadedN = 0;

		for (var i = resList.length - 1; i >= 0; i--) {
			if (resList[i].id == mediaId) 
				resList[i].loaded = true;
			if (resList[i].loaded) 
				loadedN ++;
		};
		
		if (loadedN == resList.length) 
			this.cb.mediaLoaderCompleted();
	};

	var mirrorImg = function(mediaList){

		var ctx;
		var mKey;

		for (var k in mediaList){

			mKey = k + "_m";
			mediaList[mKey] = document.createElement('canvas');
			ctx = mediaList[mKey].getContext('2d');
			ctx.translate(mediaList[k].width, 0);
			ctx.scale(-1, 1);
			ctx.drawImage(mediaList[k], 0, 0);

		}
	};

	return {

	};

})();