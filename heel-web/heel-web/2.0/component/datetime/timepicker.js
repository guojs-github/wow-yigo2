/*
	Time picker control.

	2023.8.17 added by guojs.
*/

YIUI.Control.TimePicker = YIUI.extend(YIUI.Control, {
	autoEl : '<div></div>',
	
	handler: YIUI.TimePickerHandler,
	
	behavior : YIUI.TimePickerBehavior,
	
	isSecond: false,
	
	focus : function(){
		this.base();
		this.timePicker && this.timePicker.focus();
	},
	
	init : function(options) {
		this.base(options);
		var meta = this.getMetaObj();
		this.isSecond = meta.second || this.isSecond;
	},
	
	onRender : function(ct) {
		this.base(ct);
		var $this = this;
		this.timePicker = new YIUI.Yes_TimePicker({
			el : $this.el,
			isSecond : $this.isSecond,
			isEnable : function() {
				return $this.enable;
			},
			commitValue: function(value) {
	        	$this.setValue(value, true, true);
	        }
		});
		this.el.addClass("ui-tp");
		this.checkEnd(this.value);
	},
	
	install : function() {
		this.base();
		var self = this;

		var editor = this.timePicker.getInput();

		editor.click(function() {
			if (self.enable) {
				self.focusManager.focusOwner = self;
			}
		});

		editor.keydown(function(event) {
			if (!self.enable) {
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
	
	setTip: function (tip) {
		if(this.value != 0){
			var tip = YIUI.TIMEFORMAT.timePickerFormat(this.isSecond, this.value + "");
		}
        this.base(tip);
    },
    
    setEditable: function (editable) {
        this.editable = editable;
        this.timePicker.setEditable(editable);
    },
    
	setText : function(value){
		var text;
		if(value != 0 && value != null){
			this.timePicker.setValue(value);
			text = YIUI.TIMEFORMAT.timePickerFormat(this.isSecond, value + "");
		}else{
			text = "";
		}
		this.timePicker.setText(text);
	},
	
	setBackColor: function (backColor) {
	    this.backColor = backColor;
	    this.timePicker &&　this.timePicker.getInput().css({
	        'background-image': 'none',
	        'background-color': backColor
	    })
	},
	
	getFormatEl : function() {
		return this.timePicker ? this.timePicker.getInput() : null;
	},
	
	setFormatStyle: function (cssStyle) {
        this.cssStyle = cssStyle;
        this.timePicker && this.timePicker.getInput().css(cssStyle);
    },
    
    getText: function () {
	    return this.timePicker.getText()
	},
	
	getShowText: function() {
    	return this.timePicker.getText();
    },
    
    afterRender: function () {
        this.base();
    },
    
	beforeDestroy: function () {
    	this.timePicker && this.timePicker.getDropView().remove();
    },
    
	onSetWidth : function(width) {
		this.timePicker.setWidth(width);
	},
	
	onSetHeight : function(height) {
		this.timePicker.setHeight(height);
	}
});
YIUI.reg('timepicker', YIUI.Control.TimePicker);