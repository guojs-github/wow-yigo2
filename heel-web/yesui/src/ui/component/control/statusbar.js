/**
 * Created with JetBrains WebStorm.
 * User: chenzs
 * Date: 14-4-23
 * Time: 上午10:51
 * 状态栏
 */
YIUI.Control.StatusBar = YIUI.extend(YIUI.Control, {
    /** HTML默认创建为label */
    autoEl: '<div></div>',

    isDataBinding: function() {
        return false;
	},
    /** 完成StatusBar的渲染 */
    onRender: function (ct) {
        this.base(ct);
    }
});
YIUI.reg('statusbar', YIUI.Control.StatusBar);