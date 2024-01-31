/**
 * 分割布局
 * 把面板分为多行或多列，可支持拖动分隔条
 * +---------------+      +---+- --- -+---+
 * |               |      |   |       |   |
 * +---------------+      |   |       |   |
 *                        |   |       |   |
 * |      ...      |      |   |  ...  |   |
 *                    or  |   |       |   |
 * +---------------+      |   |       |   |
 * |               |      |   |       |   |
 * +---------------+      +---+- --- -+---+
 */
(function($, undefined) {
	
YIUI.layout.SplitLayout = YIUI.extend(YIUI.layout.AutoLayout, {
	
	/**
	 * 分隔条尺寸
	 */
	resizerSize : 4,

	/**
	 * 拖放时每个区域的最小尺寸
	 */
	regionMinSize : 0,
	
	init : function(options) {
		this.base(options);

		// 用于存储拖动分隔条时的信息
		this.resize = {};
	},

	layout: function(panelWidth, panelHeight) {
		var ct = this.container,
		items = ct.items,
		item,
		children = ct.el.children(".spl-item"),
		resizer = ct.el.children(".spl-resizer"),
		vertical = ct.orientation === 'vertical',
		splits = ct.splitSizes;
		panelHeight -= this.getPlaceholderHeight();
		panelWidth -= this.getPlaceholderWidth();
		for (var i = 0, len = resizer.length; i < len; i++) {
			if(vertical) {
				resizer.eq(i).width(panelWidth);
			} else {
				resizer.eq(i).height(panelHeight);
			}
		}
		
		var h = panelHeight - this.getPlaceholderSize();
		var w = panelWidth - this.getPlaceholderSize();
		for (var i = 0, len = children.length; i < len; i++) {
			var child = children.eq(i);
			if(vertical) {
				child.height($.getReal(splits[i].size, h));
			} else {
				child.width($.getReal(splits[i].size, w));
			}
		}
		// 如果控件高度或宽度未设置，默认充满该Split区域
		for (var i = 0, len = items.length; i < len; i++) {
			item = items[i];
			if(vertical) {
				item.setWidth(panelWidth);
				item.setHeight(item.container.height());
			} else {
				item.setWidth(item.container.width());
				item.setHeight(panelHeight);
			}
			if(item.hasLayout) {
				item.doLayout(item.getWidth(), item.getHeight());
			}
		}
	},
	
	layoutRender : function() {
		var ct = this.container,
			target = ct.getRenderTarget(),
			items = ct.items,
			splits = ct.splitSizes,
			vertical = ct.orientation === 'vertical',
			split,
			item,
			_div;
		target.css('overflow', 'hidden');
		for(var i= 0,len=splits.length;i<len;i++) {
			split = splits[i];
			item = items[i];
			_div = $('<div class="spl-item"></div>').appendTo(target);
			if(item) {
				item.container = _div;
			}
			if(i < len - 1) {
				$('<div class="spl-resizer"></div>').addClass(vertical ? 'resizer-h' : 'resizer-v').attr('region', i).appendTo(target);
			}
			if(vertical) {
				_div.addClass('v-item');
			} else {
				_div.addClass('h-item');
			}
		}
		
		
	},
	
	/** 返回分割面板中行或列的固定值大小 */
	getPlaceholderSize : function() {
		var placeholderSize = 0,
			ct = this.container,
			splits = ct.splitSizes;
		for(var i= 0,len=splits.length;i<len;i++) {
			if(!$.isPercentage(splits[i].size) && splits[i].size > 0){
				placeholderSize += splits[i].size;
			}
		}
		return placeholderSize;
	},
	afterRender : function() {
		this.base();
	},
	
	/** 返回layout需要的所有占位符的宽度 */
	getPlaceholderWidth : function() {
		var width = this.base();
		var ct = this.container,
			items = ct.items,
			vertical = ct.orientation === 'vertical';
		width += (vertical ? 0 : this.resizerSize * (items.length - 1));
		return width;
	},
	
	/** 返回layout需要的所有占位符的高度 */
	getPlaceholderHeight : function() {
		var height = this.base();
		var ct = this.container,
			items = ct.items,
			vertical = ct.orientation === 'vertical';
		height += (vertical ? this.resizerSize * (items.length - 1) : 0);
		return height;
	}
});
YIUI.layout['SplitLayout'] = YIUI.layout.SplitLayout;

})(jQuery);