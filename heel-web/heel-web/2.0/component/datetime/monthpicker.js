/*
	Month picker control.

	2023.8.17 added by guojs.
*/
YIUI.Control.MonthPicker = YIUI.extend(YIUI.Control,{
	autoEl : '<div></div>',
	
	handler: YIUI.MonthPickerHandler,
	
	behavior : YIUI.MonthPickerBehavior,
	
	init: function(options){
		this.base(options);
	},
	
	setTip: function (tip) {
        var tip = YIUI.TIMEFORMAT.monthPickerFormat(this.value + "");
        this.base(tip);
    },
    
    setEditable: function (editable) {
        this.editable = editable;
        this.monthPicker.setEditable(editable);
    },
    
    getFormatEl: function() {
        return this.monthPicker ? this.monthPicker.getInput() : null;
    },
    
    setFormatStyle: function (cssStyle) {
        this.cssStyle = cssStyle;
        this.monthPicker && this.monthPicker.getInput().css(cssStyle);
    },
    
    getText: function () {
	   return this.monthPicker.getText()
	},
	
	getShowText: function() {
	   return this.monthPicker.getText();
	},
    
    focus : function(){
    	this.base();
    	this.monthPicker && this.monthPicker.focus();
    },
    
	onRender: function(ct){
		this.base(ct);
		var $this = this;
		this.monthPicker = new YIUI.Yes_MonthPicker({
			el : $this.el,
			isEnable : function(){
				return $this.enable;
			},
			commitValue: function(value) {
	        	$this.setValue(value, true, true);
	        }
		});
		this.el.addClass("ui-mp");
		this.checkEnd(this.value);
	},
	
	install : function(){
		this.base();
        var self = this;

        var editor = this.monthPicker.getInput();

        editor.click(function () {
            if( self.enable ) {
                self.focusManager.focusOwner = self;
            }
        });

        editor.keydown(function (event) {
        	if(!self.enable) {
        		return false;
        	}
            var keyCode = event.keyCode || event.charCode;
            if (keyCode === 9 || keyCode === 13 || keyCode === 108) {
                self.focusManager.requestNextFocus();
                event.preventDefault();
            }
        });
		
	},
	
	checkEnd : function(value){
		var text = "";
		if(value){
			text = YIUI.TypeConvertor.toInt(value);
		}
		this.setText(text);
	},
	
	setText : function(value){
		var text;
		if(value != 0 && value != null){
			this.monthPicker.setValue(value);
			text = YIUI.TIMEFORMAT.monthPickerFormat(value + "");
		}else{
			text = "";
		}
		this.monthPicker.setText(text);
	},
	
	setBackColor: function (backColor) {
	    this.backColor = backColor;
	    this.monthPicker && this.monthPicker.getInput().css({
	        'background-image': 'none',
	        'background-color': backColor
	    })
	},
	
	afterRender: function () {
        this.base();
    },
	
	beforeDestroy: function () {
    	this.monthPicker && this.monthPicker.getDropView().remove();
    },
    
	onSetWidth : function(width){
		this.monthPicker.setWidth(width);
	},
	
	onSetHeight : function(height){
		this.monthPicker.setHeight(height);
	}
});
YIUI.reg('monthpicker',YIUI.Control.MonthPicker);