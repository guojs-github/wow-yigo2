/**
 * 标签控件，主要用于显示文本。
 */
(function () {
    YIUI.Yes_Label = function (options) {
        var Return = {
            /**
             * String。
             * render控件时，自动创建为label。
             */
            el: $("<div></div>"),
            
            icon: null,
            
            init: function() {
            	this.label = $("<label style='width: 100%'></label>").appendTo(this.el);
            	this.caption && this.setCaption(this.caption);
            },

            setWidth: function (width) {
                this.el.css("width", width);
            },

            setHeight: function (height) {
                this.el.css("height", height);
                this.el.css("line-height", height + "px");
                this.el.css("position", "relative");
                $("span.icon", this.el).width( height ).height( height );
            },

            setCssStyle: function (cssStyle) {
                this.label.css(cssStyle);
            },

            getEl: function () {
                return this.el;
            },

            setCaption: function (caption) {
            	if(caption) {
            		caption = caption.toString();
            	}
                this.caption = caption || "";
                var text = this.caption.replace(/\\n/g, "<br/>").replace(/\ /g, "&nbsp;");
                this.label.html(text);
            },

            setValue: function (value) {
              	this.setCaption(value == null ? "" : value.toString());
            }
        };
        Return = $.extend(Return, options);
        if(!options.isPortal) {
        	Return.init();
        }
        return Return;
    }
})();