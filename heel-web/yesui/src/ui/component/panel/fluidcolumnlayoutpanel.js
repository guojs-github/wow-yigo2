/**
 * 使用FluidColumnLayout的面板。
 * 使用方式：
 * var panel = new YIUI.Panel.FluidColumnLayoutPanel({
 * 	   fill : true,
 *     items : [{
 *			type: 'panel',
 *			row : 2,
 *			col : 0,
 *			span : 12,
 *			items : [grid]
 *		}, {
 *			type: 'panel',
 *			row : 3,
 *			col : 0,
 *			span : 4,
 *			items : [tree]
 *		}, {
 *			type: 'panel',
 *			row : 3,
 *			col : 0,
 *			span : 8,
 *			items : [list]
 *		}]
 * });
 */
YIUI.Panel.FluidColumnLayoutPanel = YIUI.extend(YIUI.Panel, {
	layout : 'FluidLayout',

	/**
	 * 是否充满整个浏览器
	 */
	fill : false,

	init : function(options) {
		this.base(options);

		this.layoutConfig = this.layoutConfig || {};
		this.layoutConfig.fill = this.fill;
	}
});
YIUI.reg("fluidcolumnlayoutpanel",YIUI.Panel.FluidColumnLayoutPanel);