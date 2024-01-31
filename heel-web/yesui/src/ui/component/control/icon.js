/**
 * 图标控件。
 */
YIUI.Control.Icon = YIUI.extend(YIUI.Control, {
	icon: "",
	handler: YIUI.IconHandler,
	behavior: YIUI.IconBehavior,
	
	init: function(options){
		this.base(options);
		var meta = this.getMetaObj();
		this.icon = meta.icon || this.icon;
		this.URL = meta.URL || this.URL;
	},
	
	checkEnd: function(value){
		this.value = value;
		var _icon = this._icon;
		if ( value ){
			if(value.substr(0,7) == "http://" || value.substr(0,8) == "https://"){
				this._icon.setImagePath(value);
			}else{
				this.getImageBase64URL(value).then(function(url) {
		    		_icon.setImagePath(url);
		        });
			}
		} else {
			this._icon.setImagePath(window.cssPath + "/images/empty.PNG");
		}
		this._icon.setValue(value);
	},
	
	onRender: function (ct) {
		this.base(ct);
		var _this = this;
		this._icon = new YIUI.Yes_Icon({
            el: _this.el
        });
		this.el.addClass("ui-ico");
		this.checkEnd(this.value || this.icon || this.URL);
//		this.checkEnd(this.icon);
	}	

});
YIUI.reg('icon', YIUI.Control.Icon);