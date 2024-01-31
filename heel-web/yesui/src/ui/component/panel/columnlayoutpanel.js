/**
 * 使用ColumnLayout的面板。
 * 使用方式：
 * var panel = new YIUI.Panel.ColumnLayoutPanel({
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
YIUI.Panel.ColumnLayoutPanel = YIUI.extend(YIUI.Panel, {
	layout : 'ColumnLayout',

    onRender: function(ct) {
    	this.base(ct);
    	this.el.addClass("ui-clp");
    	
    }
    
});
YIUI.reg("columnlayoutpanel",YIUI.Panel.ColumnLayoutPanel);