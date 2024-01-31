(function ($) {
	YIUI.CUSTOM_ROLERIGHTS = function(options) {
		var defaul = {
				height: "100%",
				width: "100%",
				maxRows: 50,
				pageIndicatorCount: 3,
				url: "rights/rightsset.html"
					
		};
		options = $.extend(defaul, options);
		var el = options.el || $("<div/>")
		var Return = {
			el: el,
			setHeight: function(height) {
				this.iframe.height(height);
			},
			setWidth: function(width) {
				this.iframe.width(width);
			},
			init: function() {
				var url = options.url+"?data="+encodeURIComponent($.toJSON(options))+"&r=" + Math.random();
				this.iframe = $("<iframe frmeBorder='0' src='"+url+"'/>").appendTo(el);
			},
			install: function() {
				
			}
		};
		Return.init();
		Return.install();
		return Return;
	}
	
	
}(jQuery) );