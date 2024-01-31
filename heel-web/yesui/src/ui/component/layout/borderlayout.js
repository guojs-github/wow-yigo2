/**
 * 边界布局
 * 把面板分为top、bottom、left、right、center五部分，center必需，其他均可选。
 * center部分的大小根据其他部分大小计算得到。
 * 示例：
 * +-----------------------------------+
 * |                 T                 |
 * +--------+-----------------+--------+
 * |        |                 |        |
 * |   L    |        C        |    R   |
 * |        |                 |        |
 * +--------+-----------------+--------+
 * |                 B                 |
 * +-----------------------------------+
 * var panel = new YIUI.Panel({
 *		layout : 'border',
 *		width : 600,
 *		height : 480,
 *		items : [{
 *			id : 'N',
 *			type : 'panel',
 *			region : 'top',
 *			height : 120
 *		}, {
 *			id : 'W',
 *			type : 'panel',
 *			region : 'left',
 *			width : 120
 *		}, {
 *			id : 'E',
 *			type : 'panel',
 *			region : 'right',
 *			width : 120
 *		}, {
 *			id : 'C',
 *			type : 'panel',
 *			region : 'center',
 *			items : [button, text]
 *		}, {
 *			id : 'S',
 *			type : 'panel',
 *			region : 'bottom',
 *			height : 200
 *		}]
 *	});
 *
 *  panel.render('#ct1');
 */
(function($, undefined) {

	var regions = {
		top : true,
		bottom : true,
		left : true,
		right : true,
		center :true
	};
	YIUI.layout.BorderLayout = YIUI.extend(YIUI.layout.AutoLayout, {
		init : function(options) {
			this.base(options);
		},
		
		layout : function(panelWidth, panelHeight) {
			var ct = this.container,
				top = this.top,
				bottom = this.bottom,
				left = this.left,
				right = this.right,
				center = this.center,
				tmp = [];
			// 这里要用除去padding和border的宽度、高度
			panelWidth -= this.getPlaceholderWidth();
			panelHeight -= this.getPlaceholderHeight();
			var w = panelWidth,
				h = panelHeight,
				centerW = w,
				centerH = h,
				real;
			if(top != undefined) {
				top.setWidth(w);
				if(top.height != -1) {
					real = $.getReal(top.height, h);
					top.setHeight(real);
				} else {
					real = top.getHeight();
				}
				centerH -= real;
				tmp.push(top);
			}
			if(bottom != undefined) {
				bottom.setWidth(w);
				if(bottom.height != -1) {
					real = $.getReal(bottom.height, h);
					bottom.setHeight(real);
				} else {
					real = bottom.getHeight();
				}
				centerH -= real;
				tmp.push(bottom);
			}
			if(left != undefined) {
				if(left.width != -1) {
					real = $.getReal(left.width, w);
					left.setWidth(real);
				} else {
					real = left.getWidth();
				}
				centerW -= real;
				left.setHeight(centerH);
				tmp.push(left);
			}
			if(right != undefined) {
				if(right.width != -1) {
					real = $.getReal(right.width, w);
					right.setWidth(real);
				} else {
					real = right.getWidth();
				}
				centerW -= real;
				right.setHeight(centerH);
				tmp.push(right);
			}
		
			centerW = $.isNumeric(centerW) ? centerW : 'auto';
			centerH = $.isNumeric(centerH) ? centerH : 'auto';
			center.setWidth(centerW);
			center.setHeight(centerH);
			tmp.push(center);
			for (var i = 0, len = tmp.length; i < len; i++) {
				var t = tmp[i];
				if(t.hasLayout) {
					t.doLayout(t.getWidth(), t.getHeight());
				}
			}
		},

		layoutRender : function() {
			var ct = this.container,
				target = ct.getRenderTarget();
			var items = ct.items,
				item,
				region;
			for(var i=0,len=items.length; i<len; i++) {
				item = items[i];
				region = item.region;
				if(regions[region]) {
					this[region] = item;
				}
			}

			var top = this.top,
				bottom = this.bottom,
				left = this.left,
				right = this.right,
				center = this.center;
			if(!center) {
				throw 'No center region defined in borderlayout ' + ct.id;
			}
			ct.el.addClass("ui-blp");
			// borderlayout的最外层设为不显示滚动条，动态适应center的大小
			target.addClass('ui-nooverflow');

			if(top) {
				top.container = this.topEl = $('<div class="item-ct"></div>').attr('id', top.id).appendTo(target);//.height(real);
			}
			var mid = $('<div class="mid"></div>').appendTo(target);
			if(bottom) {
				bottom.container = this.bottomEl = $('<div class="item-ct"></div>').attr('id', bottom.id).appendTo(target);
			}
			if(left) {
				left.container = this.leftEl = $('<div class="item-ct"></div>').attr('id', left.id).appendTo(mid);
			}

			center.container = this.centerEl = $('<div class="item-ct"></div>').attr('id', center.id).appendTo(mid);

			if(right) {
				right.container = this.rightEl = $('<div class="item-ct"></div>').attr('id', right.id).appendTo(mid);
			}

			this.midEl = mid;
		},
		
		/**
		 * beforeLayout中已经设置了各个面板的el
		 */
		isValidParent : function(c, target) {
			return true;
		}
		
	});
	YIUI.layout['BorderLayout'] = YIUI.layout.BorderLayout;
})(jQuery);