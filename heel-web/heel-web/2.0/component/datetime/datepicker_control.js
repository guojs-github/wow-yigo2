/**
 * 日期控件，主要是用于显示日期及时间
 * 
 * 2023.8.9 added by guojs.
 */
YIUI.Control.DatePicker = YIUI.extend(YIUI.Control, {

    autoEl: '<div></div>',

    handler: YIUI.DatePickerHandler,
    
    behavior: YIUI.DatePickerBehavior,

    dateFormat: '',

    isOnlyDate: false,

    init: function (options) {
        this.base(options);
        var meta = this.getMetaObj();
        this.dateFormat = meta.format || '';
        this.isOnlyDate = $.isUndefined(meta.onlyDate) ? false : meta.onlyDate;
    },

    setTip: function (tip) {
        var tip = this.text;
        this.base(tip);
    },

    setEditable: function (editable) {
        this.editable = editable;
        this.datePicker.setEditable(editable);
    },

    /**
     * 设置背景色
     */
    setBackColor: function (backColor) {
        this.backColor = backColor;
        this.datePicker && this.datePicker.getInput().css({
            'background-image': 'none',
            'background-color': backColor
        })
    },
    
    getFormatEl: function() {
        return this.datePicker ? this.datePicker.getInput() : null;
    },

    setFormatStyle: function (cssStyle) {
        this.cssStyle = cssStyle;
        this.datePicker && this.datePicker.getInput().css(cssStyle);
    },

    getText: function () {
      return this.datePicker.getText()
    },

    getShowText: function() {
    	return this.datePicker.getText();
    },

    onRender: function (ct) {
        this.base(ct);
        var $this = this;
        this.datePicker = new YIUI.Yes_DatePicker({
            el: $this.el,
            isOnlyDate: $this.isOnlyDate,
            isEnable: function() {
            	return $this.enable;
            },
            commitValue: function(value) {
        		    $this.setValue(value, true, true);
            }
        });
        this.el.addClass("ui-dp");

        this.checkEnd(this.value);
    },

    afterRender: function () {
        this.base();
    },
    onSetWidth: function (width) {
        this.datePicker.setWidth(width);
    },

    onSetHeight: function (height) {
        this.datePicker.setHeight(height);
    },

    beforeDestroy: function () {
    	this.datePicker && this.datePicker.getDropView().remove();
    },

    focus: function () {
        this.base();
        this.datePicker && this.datePicker.focus();
    },
    
    checkEnd: function(value) {
    	this.value = value;
      var text = YIUI.DateFormat.format(this.value,this.dateFormat,this.isOnlyDate);
      this.datePicker.setText(text);
    },
    
    install: function () {
        this.base();
        var self = this;

        var editor = this.datePicker.getInput();

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

        editor.focus(function() {
            console.log('Datetime control get focus');

            $(this).select(); // 获得焦点时选中已有日期
        })
    }
})
;
YIUI.reg('datepicker', YIUI.Control.DatePicker);