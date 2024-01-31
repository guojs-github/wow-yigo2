"use strict";
YIUI.Panel.FlexFlowLayoutPanel = YIUI.extend(YIUI.Panel, {
	layout : 'FlexFlowLayout',
	
	getPlaceholderSize : function() {
		var placeholderSize = 0,
			items = this.items,
			item;
		for(var i= 0,len=items.length;i<len;i++) {
			item = items[i].el;
			if(!$.isPercentage(item.attr("height"))){
				placeholderSize += item.height();
			}
		}
		return placeholderSize;
	}
});
YIUI.reg("flexflowlayoutpanel",YIUI.Panel.FlexFlowLayoutPanel);