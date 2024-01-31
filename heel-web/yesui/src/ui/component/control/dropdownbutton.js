/**
 * 下拉按钮控件
 * */
YIUI.Control.DropdownButton = YIUI.extend(YIUI.Control, {
    /**
     * String。
     * render控件时，为控件自动创建的DOM标签。
     */
    autoEl: '<div class="ui-dropbtn btn-group"></div>',

    handler: YIUI.DropdownButtonHandler,

    /**
     * 图标
     */
    icon: '',

    caption: '',
    /** ["xxx","xxx","xxx"...] */
    dropdownItems: [],

    isDataBinding: function() {
        return false;
	},

    init: function (options) {
        this.base(options);
        var meta = this.getMetaObj();
        this.clickContent = $.isUndefined(meta.onClick) ? "" : meta.onClick.trim();
        this.dropdownItems = meta.dropdownItems;
    },
    
    setTip: function (tip) {
        var tip = this.caption;
        this.base(tip);
    },
    
    onRender: function (ct) {
        this.base(ct);
        var el = this.getEl(),
        	meta = this.getMetaObj(),
            dropdownItems = this.dropdownItems,
            caption = this.caption,
            a = this.button = $('<a/>').attr('class', 'btn dp-tgl').attr('data-toggle', 'dropdown').appendTo(el);
        meta.icon && this.setIcon(meta.icon);
        $('<label>').text(caption).appendTo(a);
        $('<span class="arrow"/>').appendTo(a);
        if (dropdownItems.length > 0) {
            var div = this._dropView = $('<div class="dpbtn-vw"/>').attr('id', this.id + "_dropdown").appendTo($(document.body));
            var uls = $('<ul/>').appendTo(div);
            for (var i = 0; i < dropdownItems.length; i++) {
                var li = $('<li></li>').appendTo(uls);
                if(i>5){
                	uls.css("height","180px");
    			}
                if (dropdownItems[i].separator) {
                    li.attr("role", "separator").addClass("sep");
                } else {
                    $('<a>' + dropdownItems[i].text + '</a>').appendTo(li);
                    li.attr("key", dropdownItems[i].key);
                }
            }
        }
    },

    setIcon: function (icon) {
        this.icon = icon;

        var  _span = $('<span class="icon"/>').appendTo(this.button);
    	
    	this.getImageBase64URL(icon).then(function(url) {

    		_span.css("background-image", "url("+ url + ")");
        });
    },

    setBackColor: function (backColor) {
        this.backColor = backColor;
        this.button && this.button.css({
            'background-image': 'none',
            'background-color': backColor
        })
    },

    setForeColor: function (foreColor) {
        this.foreColor = foreColor;
        this.button && $("label", this.button).css('color', foreColor);
    },

    setFormatStyle: function (cssStyle) {
        $("label", this.button).css(cssStyle);
        var hAlign = this.format.hAlign;
        if(hAlign > -1) {
            this.button.css("text-align", YIUI.HAlignment.parse(hAlign));
        };

        var vAlign = this.format.vAlign;
        switch(vAlign){
        case 0:
            $("span.icon", this.button).css({
                verticalAlign: "top"
            });
            break;
        case 2:
            $("span.icon", this.button).css({
                verticalAlign: "bottom"
            });
            break;
        }
        
    },

    onSetWidth: function (width) {
        this.button.css("width", width);
    },

    onSetHeight: function (height) {
        this.button.css("height", height);
        this.button.css("line-height", this.button.innerHeight() + "px");
		var icon = $("span.icon", this.el);
        var h = $("label", this.el).height();
		icon.css({
            width: h + "px",
            height: h + "px"
        });

    },

    setDisabled: function (disabled) {
        this.base(disabled);

        var children = this.getEl().children();
        $.each(children, function () {
            if (disabled) {
                $(this).attr('disabled', 'disabled');
            } else {
                $(this).removeAttr('disabled');
            }
        });
    },

    hideDropdownList: function () {
    	this._dropView && this._dropView.hide();
        this._hasShow = false;
        this.el.removeClass("focus");
    },

    beforeDestroy: function () {
    	this._dropView && this._dropView.remove();
    },
    focus: function () {
        this.el.attr("tabIndex",this.getTabIndex());
        this.el.focus();
    },
    /**
     * 给DOM添加事件监听。
     */
    install: function () {
        var self = this;


        // TODO 焦点策略暂未处理


        this.el.keydown(function (event) {
            var keyCode = event.keyCode || event.charCode;
            if (keyCode === 9 || keyCode === 13 || keyCode === 108) {  //tab
                self.el.removeAttr("tabIndex");
                self.el.blur();
                self.focusManager.requestNextFocus();
                event.preventDefault();
            }
        });
//        $(window).resize(function () {
//            self.hideDropdownList();
//            $(document).off("mousedown");
//	    });
        self.el.click(function (event) {
            if (!self.enable) {
                return;
            }
            self.el.addClass("focus");
            if (self._hasShow) {
                self.hideDropdownList();
                self._hasShow = false;
                return;
            }
            $(document).on("mousedown", function (e) {
                var target = $(e.target);
                if ((target.closest(self._dropView).length == 0)
                    && (target.closest(self.button).length == 0)) {

                    self.hideDropdownList();
                    $(document).off("mousedown");
                }
            });
            if (!self._dropView) return;

            YIUI.PositionUtil.setViewPos(self.el, self._dropView, true);

            //下拉内容显示的位置
            self._dropView.slideDown("fast");

            if (self._dropView[0].scrollWidth > self._dropView[0].clientWidth) {
                self._dropView.children("ul").width(self._dropView[0].scrollWidth);
            }

//            self._dropView.css({
//                width: self.el.width()
//            });
            self._dropView.css({
                width: "182px"
            });
            self._hasShow = true;
            event.stopPropagation();
        });
        $("a", this.el).blur(function() {
        	self.hideDropdownList();
        });
        if (!this.disabled) {
            var dropdownMenu = $("#" + this.id + "_dropdown");
            $("li", dropdownMenu).bind('click', function () {
            	var formula = "";
				var btnKey = $(this).attr("key");
            	var items = self.dropdownItems;
    		    for (var i = 0, len = items.length; i < len; i++) {
    				if(items[i].key == btnKey) {
    					formula = items[i].formula;
    					break;
    				}
    			}
                self.handler.doOnClick(self.ofFormID, formula);
                self.hideDropdownList();
            });
        }
    }

});

YIUI.reg('dropdownbutton', YIUI.Control.DropdownButton);