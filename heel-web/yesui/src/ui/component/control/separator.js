/**
 * 分隔线
 */

YIUI.Control.Separator = YIUI.extend(YIUI.Control, {

    autoEl: '<hr size="1"></hr>',
    
    onSetHeight : function(height) {
//    	if(!this.orientation || this.orientation == YESUI_Separator_OrientationType.Horizontal) {
//    		this.el.css("height", 1);
//    	} else {
//    		this.el.css("height", height);
//    	}
	},
	
//	onSetWidth: function(width) {
//		if(this.orientation == YESUI_Separator_OrientationType.Vertical) {
//    		this.el.css("width", 1);
//    	} else {
//    		this.el.css("width", width);
//    	}
//	},
	
//	setTextAlignment: function(textAlignment) {
//		this.textAlignment = textAlignment;
//		if(textAlignment == YESUI_Separator_HAlignment.Center) {
//			this.el.css("margin-left", "auto").css("margin-right", "auto");
//		} else if(textAlignment == YESUI_Separator_HAlignment.Right) {
//			this.el.css("margin-left", "auto");
//		}
//	},
	
	onRender: function (ct) {
		this.base(ct);
		this.el.addClass("ui-sep");
		this.el.attr("color", "#dadada");
//		this.setTextAlignment(this.textAlignment);
	}
});
YIUI.reg('separator', YIUI.Control.Separator);