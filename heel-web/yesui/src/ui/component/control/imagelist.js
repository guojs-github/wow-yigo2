/**
 * Created with JetBrains WebStorm.
 * User: chenzs
 * Date: 14-3-26
 * Time: 下午2:52
 */
YIUI.Control.ImageList = YIUI.extend(YIUI.Control, {
    stretch: false,
    items: [],
    handler: YIUI.ImageListHandler,
    behavior: YIUI.ImageListBehavior,
    
    init: function (options) {
    	this.base(options);
    	var meta = this.getMetaObj();
    	this.stretch = meta.stretch || this.stretch;
    	this.clickContent = $.isUndefined(meta.onClick) ? "" : meta.onClick.trim();
    	this.items = meta.items;
    },
    
    setItems: function(items){
    	this.items = items;
    },
    
	setEnable: function (enable) {
    	this.base(enable);
    	if( this.el ) {
    		this._image.setEnable(enable);
    	}
	},
	
	checkEnd: function(value){
		this.value = value;
		if ( value ){
			var imagePath = this._image.getImagePathByValue(value);
			var img = this._image;
			this.getImageBase64URL(imagePath).then(function(url) {
				img.setImagePath(url);
			});
			
		} else {
			this._image.setImagePath(window.cssPath + "/images/empty.PNG");
		}
		this._image.setValue(value);
	},
	
	setControlValue: function(value){
		if( this.el ){
			 this.checkEnd(value);
		}else{
			this.value = value;
		}
	},
	
	onRender: function (ct) {
		this.base(ct);
		var _this = this;
		this._image = new YIUI.Yes_ImageList({
            el: _this.el,
            stretch: _this.stretch,
            items: _this.items,
            click: function() {
                if (!_this.enable || (!_this.value && !_this.image))
                    return;
                _this.handler.doOnClick(_this.ofFormID, _this.clickContent);
            },
        });
		this.el.addClass("ui-img");
		this.checkEnd(this.value);
	},	
	
	install: function () {
        $(this.el).unbind("click");
        var self = this;
        this.el.keydown(function (event) {
            var keyCode = event.keyCode || event.charCode;
            if (keyCode === 9 || keyCode === 13 || keyCode === 108) {  //tab
                self.el.removeAttr("tabIndex");
                self.el.blur();
                self.focusManager.requestNextFocus();
                event.preventDefault();
            }
        });
	}
});
YIUI.reg('imagelist', YIUI.Control.ImageList);