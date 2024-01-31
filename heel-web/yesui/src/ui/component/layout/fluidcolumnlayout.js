/**
 * 响应式列式布局，仅用于网站页面布局。
 * 把面板分为多行，每行平均分为12列，根据每个item的span来判断占几列。
 */
YIUI.layout.FluidColumnLayout = YIUI.extend(YIUI.layout.AutoLayout, {

	/**
	 * 是否充满整个浏览器
	 */
	fill : false,

	/**
	 * 每列div样式前缀
	 * @private
	 */
	colClsPrefix : 'col-md-',

	init : function(options) {
		this.base(options);

		if(!this.fill) {
			this.ctCls = 'container';
		}
	}
});
YIUI.layout['FluidLayout'] = YIUI.layout.FluidColumnLayout;