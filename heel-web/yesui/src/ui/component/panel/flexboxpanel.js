"use strict";
YIUI.Panel.FlexBoxPanel = YIUI.extend(YIUI.Panel, {
	layout : 'FlexBox',
	
    init : function(options) {
		this.base(options);
        var meta = this.getMetaObj();
		this.repeatCount = meta.repeatCount || 3;
    },
    
    onRender: function(ct) {
    	this.base(ct);
    	this.el.addClass("ui-fbp");
    	
		
	}
	
    
	
});
YIUI.reg("flexboxpanel",YIUI.Panel.FlexBoxPanel);