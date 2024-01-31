/**
 * 单选按鈕，一组单选按钮中，只能有个一个按钮时处于选中状态。
 * name形式: ofFormID + '_' + groupKey。
 */
YIUI.Control.RadioButton = YIUI.extend(YIUI.Control, {
	/**
	 * String。
	 * 此控件由radio和label组成，因此自动创建为div。
	 */
    autoEl: '<div class="ui-rdo" tabindex="0">',

    handler: YIUI.RadioButtonHandler,
    
    behavior: YIUI.RadioButtonBehavior,
    
    /** 
     * Boolean。
     * 是否默认选中。
     */
    checked : false,
    
    /** 
     * String。
     * 分组名称 ,名称相同，则在一个分组内。
     */
    groupKey : '',

    /**
     * 组头控件名称
     */
    headKey: '',
    
    /**
     * String。
     * 单个RadioButton设置的值。
     * 区别于value。
     */
    metaValue: '',
    
    init: function(options) {
        this.base(options);
        var meta = this.getMetaObj();
        this.groupKey = $.isUndefined(meta.groupKey) ? this.groupKey : meta.groupKey;
        this.isGroupHead = $.isUndefined(meta.isGroupHead) ? false : meta.isGroupHead;
        this.metaValue = $.isUndefined(meta.metaValue) ? "" : meta.metaValue;
    },

    setValue:function (value, commit, fireEvent, ignoreChanged, editing) {
		if( !this.isGroupHead )
			return;
		return this.base(value, commit, fireEvent, ignoreChanged, editing);
    },

    checkEnd: function(value) {
        this.value = value;
        this.setChecked(value);
	},

    setChecked: function (value) {
        var radios = $("." + this.ofFormID+ '_' + this.groupKey),radio;
        radios.removeClass("checked").removeClass("unchk");
        for (var i = 0,length = radios.length;i < length;i++) {
            radio = $(radios[i]);
            if (radio.attr("value") == value) {
                radio.removeClass("unchk").addClass("checked");
            } else {
                radio.addClass("unchk");
            }
        }
    },
	
    getValue: function() {
    	return this.value;
    },
    
    setText: function(text) {
    	$("label", this.el).html(text);
    },
    
    getText: function() {
    	return $("label", this.el).html();
    },
    
    getShowText: function() {
    	return this.getText();
    },

    setTip: function (tip) {
        var tip = this.caption;
        this.base(tip);
    },
    
    getFormatEl: function() {
    	return this.el ? $("label", this.el) : null;
    },
    
    onSetHeight: function (height) {
        this.base(height);
        var $wrap = $(".wrap",this.el);
        var vAlign = this.format.vAlign;
        switch(vAlign) {
        case 0:
            $wrap.css({top: "0px"});
            break;
        case 2:
            $wrap.css({bottom: "0px"});
            break;
        default:
            $wrap.css({height: height + "px", lineHeight: height + "px" });
            var $input = $("span.rdo", this.el);
            $input.css("margin-top", (height - $input.height()) / 2);
            break;
        }
        
    },
    
    onSetWidth: function(width) {
    	this.base(width);
    	$("label", this.el).css("width", width - $("span.rdo", this.el).outerWidth());
    },

    setFormatStyle: function(cssStyle) {
    	$("label", this.el).css(cssStyle);
    	$("span.rdo", this.el).css(cssStyle);
	},
	
    onRender: function (ct) {
    	this.base(ct);
    	var $wrap = $("<div class='wrap'></div>");
    	var radio = $('<span class="' + this.ofFormID + '_' + this.groupKey + ' unchk rdo" id="radio_' + this.id + '" type="radio" value="' + this.metaValue +
            '" name="' + this.ofFormID + '_' + this.groupKey + '"/>').appendTo($wrap);

        $('<label id = label_"' + this.id + ' for="radio_' + this.id + '">' + this.caption + '</label>').appendTo($wrap);
        $wrap.appendTo(this.el);

        var value = this.value;
        if( !this.isGroupHead ) {
            var form = YIUI.FormStack.getForm(this.ofFormID),
                head = form.getComponent(this.headKey);
            if(head == null) {
                throw new YIUI.ViewException(YIUI.ViewException.RadioButtonNoGroupKey,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.RadioButtonNoGroupKey, this.key));
            }
            value = head.getValue();
        }

        this.setChecked(value);
    },
    focus: function () {
	    this.base();
        $("span.rdo", this.el).attr("tabindex",0).focus();
    },
    install : function() {
    	this.base();

    	var self = this;

        var fire = function (event) {
            if( self.enable ) {
                self.focusManager.focusOwner = self;

                var newValue = self.metaValue,
                    target = self;
                if(!self.isGroupHead) {
                    var form = YIUI.FormStack.getForm(self.ofFormID);
                    target = form.getComponent(self.headKey);
                    if(target == null) {
                        throw new YIUI.ViewException(YIUI.ViewException.RadioButtonNoGroupKey,
                            YIUI.ViewException.formatMessage(YIUI.ViewException.RadioButtonNoGroupKey, self.key));
                    }
                }

                target.setValue(newValue,true,true);

                event.preventDefault();
            }
        }

    	$("span.rdo,label", this.el).click(function(e){
    		fire(e);
    	});

        $("span.rdo", this.el).keydown(function (event) {
            var keyCode = event.keyCode || event.charCode;
            if (keyCode === 108 || keyCode === 9) {
                self.focusManager.requestNextFocus();
                event.preventDefault();
            }else if(keyCode === 13){
//            	self.focusManager.requestNextFocus();
//                event.preventDefault();
            	fire(event);
            	$(this).addClass("focus-select");
            	$(this).parent().parent().removeClass("focus");
            }
        });
        
        $("span.rdo").focus(function(){
        	$(this).parent().parent().addClass("focus");
        });
        
        $("span.rdo").blur(function(){
        	$(this).parent().parent().removeClass("focus");
        	$(this).removeClass("focus-select");
        });
    }
});
YIUI.reg('radiobutton', YIUI.Control.RadioButton);