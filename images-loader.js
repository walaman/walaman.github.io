var IMGS_LOADER = (function() {

	return {

		loadSrcs : function(srcs, callback) {

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

		}


	};

})();