(function () {
    YIUI.Yes_ImageList = function (options) {
        var Return = {
            el: $("<div></div>"),
            image: "",
            stretch: false,
            enable: true,
            items:[],
            init: function () {
                this._img = $("<img />").appendTo(this.el);
                if( this.stretch ) {
                    this._img.addClass("stretch");
                }
            },
            getEl: function () {
                return this.el;
            },
            setStretch: function (stretch) {
                this.stretch = stretch;
            },
            setEnable: function (enable) {
                this.enable = enable;
            },
            getImage: function () {
                return this._img;
            },
            setValue: function (value) {
                this.value = value;
                if( value ) {
                    this._img.removeClass("empty");
                } else {
                    this._img.addClass("empty");
                }
            },
 
            getImagePathByValue: function(value){
            	var item;
        		for (var i = 0 , len = this.items.length, item; i < len; i ++ ) {
        			item = this.items[i];
        			if(YIUI.TypeConvertor.toString(item.value) == YIUI.TypeConvertor.toString(value)) {
        				 return item.image || "";
        			}
        		}
        		return "";
            },
            
            setImagePath: function(path){
            	 this._img.attr("src", path);
            },
            
            click: $.noop,

            install: function () {
                var self = this;
                this._img.bind("click", function (e) {
                    self.click();
                });
            }
        };
        Return = $.extend(Return, options);
        if (!options.isPortal) {
            Return.init();
        }
        Return.install();
        return Return;
    }
})();