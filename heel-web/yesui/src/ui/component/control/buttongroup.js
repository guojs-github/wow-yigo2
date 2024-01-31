YIUI.Control.ButtonGroup = YIUI.extend(YIUI.Control,{
	autoEl : '<div></div>',
	
	/**
	 * [{value:XXX, text:XXX},...]
	 */
    items : [],
	/** 组合按钮的类型（单选radio、复选checkbox） */
	buttonType : 'radio',

    isDataBinding: function() {
        return false;
	},
	
	onRender : function(ct){
        this.base(ct);
        var el = this.getEl(),
        	buttons = this.items,
        	/** 获取当前控件的id */
        	id = this.getId(),
        	inputId,
        	labelId,
        	button;
		for(var i = 0;i<buttons.length;i++){
			button = buttons[i];
			inputId = id + i;
			var input = $('<input />').attr('type',this.buttonType).attr('name',id).attr('id', inputId).val(button.value).appendTo(el);
			var label = $('<label></label>').attr('for', inputId).html(button.text).appendTo(el);
		}
		el.buttonset({type:this.buttonType});
	},
	
	onSetWidth : function(width) {
		var avgWidth = width / this.items.length - $('label', this.el).cssNum('margin-right');
		this.el.css('width', width + 'px');
		$('label', this.el).css('width', avgWidth + 'px');
	},
	
	onSetHeight : function(height) {
		var span = $('label span', this.el);
		span.css('line-height', (height - span.cssNum('padding-top') - span.cssNum('padding-bottom')) + 'px');
	}
	
});

YIUI.reg('buttongroup',YIUI.Control.ButtonGroup);