"use strict";
/**
 * 与应用程序版本对应的默认布局Panel，不需要改变任何实现。
 */
YIUI.Panel.FlowLayoutPanel = YIUI.extend(YIUI.Panel, {
	layout: "FlowLayout"
});
YIUI.reg("flowlayoutpanel",YIUI.Panel.FlowLayoutPanel);