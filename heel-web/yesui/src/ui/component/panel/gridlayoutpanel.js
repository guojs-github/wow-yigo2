/**
 * Created with JetBrains WebStorm.
 * User: chenzs
 * Date: 14-3-20
 * Time: 下午2:15
 */
YIUI.Panel.GridLayoutPanel = YIUI.extend(YIUI.Panel, {
    layout: "GridLayout",
    widths: null,
    minWidths: null,
    heights: null,
    rowGap: 0,
    columnGap: 0,
    oddColumnColor: null,
    forceLayout: true,
    
    setOddColumnColor: function(oddColumnColor) {
    	this.oddColumnColor = oddColumnColor;
		this.el.addClass("oddColumnColor");
    },
    
    setForceLayout: function(forceLayout) {
    	this.forceLayout = forceLayout;
    	this.layout.layout = $.noop;
    	this.layout.render = $.noop;
    },
    
    setRowGap: function(rowGap) {
    	this.rowGap = rowGap;
    },
    
    setColumnGap: function(columnGap) {
    	this.columnGap = columnGap;
    },
    
    onRender: function(ct) {
    	this.base(ct);
    	this.el.addClass("ui-glp");
    	
    	this.oddColumnColor && this.setOddColumnColor(this.oddColumnColor);
    	this.rowGap && this.setRowGap(this.rowGap);
    	this.columnGap && this.setColumnGap(this.columnGap);
    },
    
    afterRender: function() {
    	this.base();
    	if(this.forceLayout == false) {
    		this.setForceLayout(this.forceLayout);
    	}
    }
    
});
YIUI.reg("gridlayoutpanel", YIUI.Panel.GridLayoutPanel);