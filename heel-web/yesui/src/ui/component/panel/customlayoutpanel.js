"use strict";
YIUI.Panel.CustomLayoutPanel = YIUI.extend(YIUI.Panel, {
	layout : 'CustomLayout',
	
	rowGap: 0,
	
	columnGap: 0,
	
    init : function(options) {
		this.base(options);
		
    },
    
    setRowGap: function(rowGap) {
    	this.rowGap = rowGap;
    },
    
    setColumnGap: function(columnGap) {
    	this.columnGap = columnGap;
    },
    
    onRender: function(ct) { 
    	this.base(ct);
    	this.el.addClass("ui-clp");
    	
    	this.rowGap && this.setRowGap(this.rowGap);
		this.columnGap && this.setColumnGap(this.columnGap);
		
    }
    
	
});
YIUI.reg("customlayoutpanel",YIUI.Panel.CustomLayoutPanel);