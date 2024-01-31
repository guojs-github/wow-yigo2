/**
 * var panel = new YIUI.Panel({
 *		layout : 'flexflow',
 *		height : 480,
 *		items : [{
 *			row : 0,
 *			type : 'panel',
 *			height : 120
 *		}, {
 *			row : 1,
 *			type : 'panel',
 *			height : 40%
 *		}, {
 *			row : 2,
 *			type : 'panel',
 *			height : 60%
 *		}, {
 *			row : 3,
 *			type : 'panel',
 *			height : 220
 *			items : [button, text]
 *		}]
 *	});
 *
 *  panel.render('#ct1');
 */

"use strict";
YIUI.layout.FlexFlowLayout = YIUI.extend(YIUI.layout.AutoLayout,{
	
	layout : function(panelWidth, panelHeight) {
		var ct = this.container,
		items = ct.items,
		item;
		panelWidth -= this.getPlaceholderWidth();
		panelHeight -= this.getPlaceholderHeight() + this.getPlaceholderSize();
		for(var i=0,len=items.length;i<len;i++) {
			item = items[i];
			item.setWidth(panelWidth);
			item.setHeight($.getReal(item.height, panelHeight));
			if(item.hasLayout) {
				item.doLayout(item.getWidth(), item.getHeight());
			}
		}
	},
	
	/** 返回flexflowlayout面板中所有行高度的固定值 */
	getPlaceholderSize : function() {
		var placeholderSize = 0,
			ct = this.container,
			items = ct.items,
			item;
		for(var i= 0,len=items.length;i<len;i++) {
			item = items[i];
			if(item.height == -1 || item.height == "pref") {
				if(item.el){
					placeholderSize += item.el.outerHeight();
				}
			} else if($.isNumeric(item.height)){
				placeholderSize += item.height;
			} 
		}
		return placeholderSize;
	}

});

YIUI.layout['FlexFlowLayout'] = YIUI.layout.FlexFlowLayout;
