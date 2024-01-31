/**
 * 流布局面板
 */
YIUI.layout.FlexBox = YIUI.extend(YIUI.layout.AutoLayout, {
	
	layout : function(panelWidth, panelHeight) {
		var ct = this.container,
			el = ct.el,
			items = ct.items,
			item;
			panelWidth -= this.getPlaceholderWidth();
			panelHeight -= this.getPlaceholderHeight();
		for(var i=0,len=items.length;i<len;i++) {
			item = items[i];
			var width = item.width;
			if(item.width == -1) {
				width = "100%";
			} 
			item.setWidth($.getReal(width, panelWidth));
			item.setHeight($.getReal(item.height, panelHeight));
			if(item.hasLayout) {
				item.doLayout(item.getWidth(), item.getHeight());
			}
		}
		
	}


});
YIUI.layout['FlexBox'] = YIUI.layout.FlexBox; 