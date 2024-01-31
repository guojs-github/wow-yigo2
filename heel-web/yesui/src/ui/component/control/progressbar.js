/**
 * 进度条控件。
 */
YIUI.Control.Progressbar = YIUI.extend(YIUI.Control, {
	
	autoEl: '<div></div>',
	
	/**
	 * String。
	 * 加载成功所显示的文本。
	 */
	successText: null,
	
	/**
	 * Number。
	 * 最大进度值。
	 */
	maxValue : 100,
	
	/**
	 * Number。
	 * 最小进度值。
	 */
	minValue : 0,
	
	/**
	 * Number。
	 * 初始值。
	 */
	initValue :  0,

    isDataBinding: function() {
        return false;
	},
	
	setValue : function(value, commit, fireEvent){
		var changed = this.base(value, commit, fireEvent);
		
		this.el.progressbar({
			value : value
		});
		return changed;
	},
	
	getValue : function() {
		return this.el.progressbar('value');
	},
	
	onRender: function(parent){
        this.base(parent);
        
        if(this.minValue == 0) {
        	this.el.progressbar({
    			max : this.maxValue,
    			value : this.value
    		});
        } else {
        	this.el.progressbar({
    			max : this.maxValue
    		});
        	
        	// patch：jQueryUI的progressbar不支持设置min
        	$.data(this.el[0], 'ui-progressbar').min = this.minValue;
        	
        	this.el.progressbar({
    			value : this.value
    		});
        }
        
	}
});

YIUI.reg('progressbar', YIUI.Control.Progressbar);