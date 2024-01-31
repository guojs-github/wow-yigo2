/**
 * 按钮控件。
 */
YIUI.Control.Button = YIUI.extend(YIUI.Control, {
    /**
     * String。
     * render控件时，为控件自动创建的DOM标签。
     */
    autoEl: '<div><button></button></div>',

    handler: YIUI.ButtonHandler,
    
    behavior: YIUI.ButtonBehavior,

    /** 图标 */
    icon: null,

    init: function (options) {
        this.base(options);
        var meta = this.getMetaObj();
        this.icon = meta.icon || this.icon;
        this.clickContent = $.isUndefined(meta.onClick) ? "" : meta.onClick.trim();
    },

    needClean: function () {
        return false;
    },

    setTip: function (tip) {
        var tip = this.value;
        this.base(tip);
    },

    focus:function () {
        this.base();
        this.el.attr("tabindex",0).focus();
    },

    checkEnd: function (value) {
        this.value = value;
        if( this.value ) { // 默认caption
            this.button.getTextButton().html(this.value.toString());
        }
    },
    
    getShowText: function() {
    	return this.value;
    },

    getFormatEl: function() {
    	return this.button ? this.button.getTextButton() : null;
    },

    setFormatStyle: function (cssStyle) {
        this.cssStyle = cssStyle;
        this.button && this.button.getTextButton().css(cssStyle);
        this.foreColor && this.button.getTextButton().css("color", this.foreColor);
        this.backColor && $("button", this.el).css("background-color", this.backColor);
        if (this.format) {
            var hAlign = this.format.hAlign;
            var $el = this.button.getEl();
            switch(hAlign) {
            case 0:
                $("button", $el).css({textAlign: "left"});
                break;
            case 1:
                $("button", $el).css({textAlign: "center"});
                break;
            case 2:
                $("button", $el).css({textAlign: "right"});
                break;
            }
            var vAlign = this.format.vAlign;
            switch(vAlign){
            case 0:
                $("span.icon", $el).css({
                    verticalAlign: "top"
                });
                break;
            case 2:
                $("span.icon", $el).css({
                    verticalAlign: "bottom"
                });
                break;
            }
        }
    },
    
    setBackColor:function(backColor) {
        this.backColor = backColor;
    	this.el && $("button", this.el).css("background-color", backColor);
    },

    onSetWidth: function (width) {
        this.button.setWidth(width);
        
    },

    onSetHeight: function (height) {
        this.button.setHeight(height);
        if (this.format){
        	var $el = this.button.getEl();
        	var textheight = this.button.getTextButton().height();
            $(".icon", $el).width(textheight).height(textheight);
        }
    },

    /**
     * 完成button的渲染。
     */
    onRender: function (ct) {
        this.base(ct);
        var $this = this;
        this.button = new YIUI.Yes_Button({
            el: $this.el,
            caption: $this.value || $this.caption,
            IEFile: $.browser.isIE && $this.key && $this.key.toLowerCase().indexOf('upload') != -1
        });
        this.el.addClass("ui-btn");
        this.icon && this.setIcon(this.icon);
    },

    setIcon: function (icon) {
        this.icon = icon;

        var  _span = $("<span class='icon'></span>").prependTo(this.button.getButton());
    	
        this.getImageBase64URL(icon).then(function(url) {
        	_span.css('background-image', 'url('+ url + ')');
        });

    },

    /**
     * 给DOM添加事件监听。
     */
    install: function () {
        var self = this;

        var fireEvent = function (e) {
            if( !self.enable ) {
                return false;
            }
            self.focusManager.focusOwner = self;
            
            YIUI.HeadInfoUtil.put(self, YIUI.HeadInfoOptType.STR_Button, self.ofFormID);

            self.handler.doOnClick(self.ofFormID, self.clickContent, self.key);

            YIUI.HeadInfoUtil.clear();
        };

        self.el.click($.debounce(100, function (e) {
            fireEvent(e);
        }));

        // 文件上传不延时
        self.el.delegate(".upload","click",function (event) {
            var target = event.currentTarget;
            if($(target).hasClass("upload")) {
                window.up_target = target;
            }
            self.focus();
            self.handler.doOnClick(self.ofFormID, self.clickContent, self.key);
            event.stopPropagation();
        });

        self.el.mousedown(function() {
            self.el.addClass("focus");
        }).mouseup(function() {
            self.el.removeClass("focus");
        });

        self.el.keydown(function (event) {
            var keyCode = event.keyCode || event.charCode;

            switch ( keyCode ) {
            case 13:
            case 108:
                fireEvent(event);
                event.preventDefault();
                break;
            case 9:
                self.focusManager.requestNextFocus();
                event.preventDefault();
                break;
            }
        });
    }
});
YIUI.reg('button', YIUI.Control.Button);