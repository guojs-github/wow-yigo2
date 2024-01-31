/**
 * 浏览器控件。
 */
YIUI.Control.WebBrowser = YIUI.extend(YIUI.Control, {

    behavior: YIUI.BaseBehavior,

    isDataBinding: function() {
        return false;
	},

	onRender: function(ct) {
		this.base(ct);
		this.el.addClass("ui-web-bs");
		this.iframe = $("<iframe/>").appendTo(this.el);
		
		this.value && this.setURL(this.value);
	},
	
	checkEnd: function(value) {
		this.url = value;
		this.setURL(value);
	},
	
	setURL: function(url) {
		this.url = url;
		if(!url) {
			this.iframe.attr("src", null);
			return;
		}
		if(url.toLowerCase().indexOf("http") < 0) {
			var index = window.location.href.lastIndexOf("/");
			url = window.location.href.substr(0, index);
			this.url = url + "/" + this.url;
		}
		if(this.url.indexOf("?") > 0) {
			this.url +=  "&formID=" + this.ofFormID;
		} else {
			this.url +=  "?formID=" + this.ofFormID;
		}
		this.iframe.attr("src", this.url);
	},
	
    /**
     * 给DOM添加事件监听。
     */
    install: function () {
        
    }
});
YIUI.reg('webbrowser', YIUI.Control.WebBrowser);