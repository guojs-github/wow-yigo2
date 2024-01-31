/**
 * 使用BorderLayout的面板。
 * 使用方式：参考borderlayout.js
 */
"use strict";
YIUI.Panel.BorderLayoutPanel = YIUI.extend(YIUI.Panel, {
	layout : 'BorderLayout',

    install : function() {
		var _this = this;
//			$("#" + this.getId()).resize(function(){
//				_this.layout.layout();
//			});
	}
});
YIUI.reg("borderlayoutpanel",YIUI.Panel.BorderLayoutPanel);