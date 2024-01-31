/**
 * 分割按钮
 * */
YIUI.Control.SplitButton = YIUI.extend(YIUI.Control, {

    autoEl: '<div class="ui-splbtn btn-group"></div>',
    handler: YIUI.SplitButtonHandler,
    behavior: YIUI.SplitButtonBehavior,
    _hasShow : false,
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
    
    onRender: function(ct){
    	this.base(ct);
    	var el = this.getEl(),
    		dropdownItems = this.dropdownItems,
    		caption = this.caption,
			buttonLeft = this.buttonLeft = $('<button/>').attr('class', 'btn btn-left').appendTo(el),
			buttonRight = this.buttonRight = $('<button/>').attr('class','btn dp-tgl').attr('data-toggle','dropdown').appendTo(el),
			span = $('<span class="arrow"/>').appendTo(buttonRight);
		$('<label/>').appendTo(buttonLeft);
		this.getMetaObj().icon && this.setIcon(this.getMetaObj().icon);
		$('label',this.buttonLeft).html($('label',this.buttonLeft).html() + caption);

    	if(dropdownItems.length > 0) {
    		var div = this._dropView = $('<div class="sp-vw"/>').attr('id',this.id+"_dropdown").appendTo($(document.body));
    		var	uls = $('<ul/>').appendTo(div);
    		for(var i=0; i<dropdownItems.length; i++){
    			var li = $('<li></li>').appendTo(uls);
    			if(i>5){
    				uls.css("height","180px");
    			}
				if(dropdownItems[i].separator) {
					li.attr("role", "separator").addClass("sep");
				} else {
					$('<a>'+dropdownItems[i].text+'</a>').appendTo(li);
					li.attr("key", dropdownItems[i].key);
				}
    		}
    	}
    },
    
    setIcon: function(icon) {
    	this.icon = icon;
    	var self = this;
    	
    	var _span = $('<span class="icon" />').appendTo($('label',this.buttonLeft));
    	
    	this.getImageBase64URL(icon).then(function(url) {
    		$("span.icon", self.el).css('background-image', 'url('+ url + ')');
    	});
    },

    getFormatEl: function() {
    	return this.buttonLeft ? this.buttonLeft.prev() : null;
    },
    
    setFormatStyle: function(cssStyle) {
		$("label", this.buttonLeft).css(cssStyle);
	},
    
    onSetWidth : function(width) {
    	this.el.css("width", width);
    	var width_l = width - this.buttonRight.outerWidth();
    	this.buttonLeft.css("width", width_l);
	},
	
	onSetHeight : function(height) {
    	this.el.css("height", height);
		this.buttonLeft.css("height", height);
		this.buttonRight.css("height", height);
		var $label = $("label", this.el);
		var labelH = $("label", this.el).height();
		var icon = $("span.icon", this.el);
		if (icon.length > 0){
			icon.width(labelH).height(labelH);
		}
		if (this.format){
			var vAlign = this.format.vAlign;
			var lHeight = $("label", this.buttonLeft).height();
			var brHeight = this.buttonRight.height();
			switch(vAlign){
				case 0:
					this.buttonLeft.css({
						paddingBottom: brHeight - lHeight + "px"
					})
					break;
				case 2:
					this.buttonLeft.css({
						paddingTop: brHeight - lHeight + "px"
					})
				break;
			}
		}
	},
    
    setDisabled : function(disabled) {
    	this.base(disabled);
    	
    	var children = this.getEl().children();
    	$.each(children, function() {
    		if(disabled) {
    			$(this).attr('disabled', 'disabled');
    		} else {
    			$(this).removeAttr('disabled');
    		}
    	});
    },
    
    hideDropdownList: function() {
    	this._dropView && this._dropView.hide();
        this._hasShow = false;
		this.el.removeClass("focus");
    },
    
    afterRender: function() {
    	this.base();
    	if(this.format) {
    		if(this.format.foreColor) {
    			$("label", this.buttonLeft).css("color", this.format.foreColor);
    		}
    		if(this.format.backColor) {
    			this.el.css("background-color", "rgba(0, 0, 0, 0)");
    			this.buttonLeft.css("background-color", this.format.backColor);
    			this.buttonRight.css("background-color", this.format.backColor);
    		}
    	}
    },
    
    beforeDestroy: function() {
        this._dropView && this._dropView.remove();
    },
    focus: function () {
        this.base();
        this.el.attr("tabIndex",this.getTabIndex());
        this.el.focus();
    },
    /** 
	 * 给DOM添加事件监听。
	 */
	install : function() {
		var self = this;

		// TODO 焦点策略


        this.el.keydown(function (event) {
            var keyCode = event.keyCode || event.charCode;
            if (keyCode === 9 || keyCode === 13 || keyCode === 108) {  //tab
                self.el.removeAttr("tabIndex");
                self.el.blur();
                self.focusManager.requestNextFocus();
                event.preventDefault();
            }
        });
		self.buttonRight.click(function(event) {
			if(!self.enable) {
        		return;
        	}
			self.el.addClass("focus");
			if(self._hasShow){
	            self.hideDropdownList();
	            self._hasShow = false;
	            return;
	        }

    		$(document).on("mousedown",function(e){
	            var target = $(e.target);
	            if((target.closest(self._dropView).length == 0)
	                &&(target.closest(self.buttonLeft).length == 0)
	                &&(target.closest(self.buttonRight).length == 0)){
	            	 
	                self.hideDropdownList();
	                $(document).off("mousedown");
	            }
	        });

            if (!self._dropView) return;
            
            YIUI.PositionUtil.setViewPos(self.el, self._dropView, true);
		    
		    // self._dropView.css( "z-index", $.getZindex( self.el ) + 1 );
		    
	        //下拉内容显示的位置
	        self._dropView.slideDown("fast");

		    //self._dropView.width(self.el.width());
		    if(self._dropView[0].scrollWidth > self._dropView[0].clientWidth) {
		    	self._dropView.children("ul").width(self._dropView[0].scrollWidth);
		    }
		    
	        self._hasShow = true;
	        event.stopPropagation();
		});
		if(!this.disabled) {
			var self = this;
			this.buttonLeft.bind('click', function(){
				if(!self.enable) {
	        		return;
	        	}
				self.handler.doOnClick(self.ofFormID, self.clickContent);
				self.el.addClass("focus");
			});
			this.buttonLeft.bind('blur', function() {
				self.el.removeClass("focus");
			})

			var dropdownMenu = $("#"+this.id+"_dropdown");
			$("li", dropdownMenu).bind('click', function(){
				var items = self.dropdownItems;
				var btnKey = $(this).attr("key");
				var formula = "";
			    if(btnKey) {
			    	for (var i = 0, len = items.length; i < len; i++) {
			    		if(items[i].key == btnKey) {
			    			formula = items[i].formula;
			    			break;
			    		}
			    	}
			    }
				self.handler.doOnClick(self.ofFormID, formula);
				self.hideDropdownList();
			});
		} 
	}
});

YIUI.reg('splitbutton',YIUI.Control.SplitButton);