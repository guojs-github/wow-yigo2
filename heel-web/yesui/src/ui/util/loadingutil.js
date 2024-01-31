YIUI.LoadingUtil = (function() {

	var path = window.cssPath + '/images/loading.gif';

    var html = "<div class='loading mask'></div>" + 
                "<div class='loading image'>" + 
                    "<img alt='loading' src='"+ path +"'>" +
                "</div>";
    // var el = $(html);
    // $(document.body).append(html); // 由于现有script的位置,打包后document.body为undefined
	var mask = $(".loading.mask");
	var img = $(".loading.image");

	var isShow = false;
	
	var mask,img;

	var rt = {
			initEl: function () {
                $(document.body).append(html);
				mask = $(".loading.mask");
				img = $(".loading.image");
            },
			setZIndex: function(index) {
				mask.css("z-index", index);
				img.css("z-index", index);
			},
			show: function() {
				isShow = true;
	        	mask.show();
				if(isShow && img.is(":hidden")) {
					img.css({
						top: $(window).height() / 2,
						left: $(window).width() / 2
					});
					mask.show();
					img.show();
				}
			},
			hide: function() {
				isShow = false;
				if(img.is(":hidden")) {
					mask.hide();
				}
				setTimeout(function() {
					if(!isShow) {
						mask.hide();
						img.hide();
					}
				}, 300);
			}
	};
	return rt;
})();