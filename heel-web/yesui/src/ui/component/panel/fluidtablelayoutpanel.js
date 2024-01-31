YIUI.Panel.FluidTableLayoutPanel = YIUI.extend(YIUI.Panel, {
    layout: "FluidTableLayout",
    widths: null,
    rowGap: 0,
    columnGap: 0,
    repeatCount: 1,
    repeatGap: 0,
    rowHeight: 30,
    
    init: function(options) {
    	this.base(options);
    },

//    onSetWidth: function(width) {
//    	width += this.widths.length * this.columnGap + this.repeatCount * this.repeatGap;
//		this.el.css("width", width);
//    },
    
//    onSetHeight: function(height) {
//    	var count = 0,
//    		items = this.items,
//    		repeatCount = this.repeatCount;
//    	for (var i = 0; i < items.length; i++) {
//			if(items[i].buddyKey) {
//				count++;
//			}
//		}
//    	var rows = (items.length + count) / 2;
//		if(rows % repeatCount == 0) {
//			rows = rows / repeatCount;
//		} else {
//			rows = parseInt(rows / repeatCount ) + 1;
//		}
//    	height += rows * this.rowGap;
//		this.el.css("height", height);
//    },
    
    setRowGap: function(rowGap) {
    	this.rowGap = rowGap;
    },
    
    setColumnGap: function(columnGap) {
    	this.columnGap = columnGap;
    },
    
    setRepeatCount: function(repeatCount) {
        if(repeatCount > 1) {
            this.repeatCount = repeatCount;
        }
    },

    setRepeatGap: function(repeatGap) {
        this.repeatGap = repeatGap;
    },
    
    setRowHeight: function(rowHeight) {
    	this.rowHeight = rowHeight;
    },
    
    onRender: function(ct) {
    	this.base(ct);
    	
    	this.rowGap && this.setRowGap(this.rowGap);
        this.columnGap && this.setColumnGap(this.columnGap);
        this.repeatGap && this.setRepeatGap(this.repeatGap);
        this.repeatCount && this.setRepeatCount(this.repeatCount);
        this.rowHeight && this.setRowHeight(this.rowHeight);
    	
    	this.el.addClass("ui-ftlp");
    },
    
    reLayout: function() {
    	if(this.layout instanceof YIUI.layout.FluidTableLayout) {
    		this.layout.repaint();
    	}
    }
    
});
YIUI.reg("fluidtablelayoutpanel", YIUI.Panel.FluidTableLayoutPanel);