/**
 * 列式布局
 * 把面板分为多行，每行平均分为12列，根据每个item的row判断在第几行，col判断从第几列开始，span判断占几列。
 */
YIUI.layout.ColumnLayout = YIUI.extend(YIUI.layout.AutoLayout, {

	/**
	 * 外层div样式
	 * @private
	 */
	ctCls : 'container-fluid',

	/**
	 * 每列div样式前缀
	 * @private
	 */
	colClsPrefix : 'col-xs-',
	
	layout: function(panelWidth, panelHeight) {
		var ct = this.container,
			items = ct.items,
			item,
			rowEl,
			rows,
			row;
		rows = $(".row", ct.el).data("height", 0);
		panelWidth -= this.getPlaceholderWidth();
		panelHeight -= this.getPlaceholderHeight();
		for(var i= 0,len=items.length;i<len;i++) {
			item = items[i];
			var height = 0, 
				width = 0,
				span = item.colspan || 1;
			if(item.height == -1) {
				height = item.getHeight();
			} else {
				height =  $.getReal(item.height, panelHeight);
			}

			width =  $.getReal(item.width, panelWidth);
			if(width == "auto") width = panelWidth;
			var realW = span/12*width;
			item.setWidth(parseInt(realW));
			item.container.width(parseInt(realW));
			rowEl = item.container.parent();
			if(rowEl.data("height") < height) {
				rowEl.data("height", height);
				item.setHeight(height);
				item.container.height(height);
			} else {
				item.setHeight(rowEl.data("height"));
				item.container.height(rowEl.data("height"));
			}
			if(item.hasLayout) {
				item.doLayout(item.getWidth(), item.getHeight());
			}
		}
		for (var i = 0, len = rows.length; i < len; i++) {
			row = rows.eq(i);
			row.height(row.data("height"));
		}
	},

	layoutRender : function() {
		var ct = this.container,
			target = ct.getRenderTarget(),
			items = ct.items,
			item,
			row,
			col,
			span,
			cells = [],
			tmp = {row: 0, len: 0};
		// 根据items中的row、col、span计算出布局
		for(var i= 0,len=items.length;i<len;i++) {
			item = items[i];
			row = item.y;
			col = item.x
			span = item.colspan || 1;
			
			if(tmp.row != row) {
				tmp.row = row;
				tmp.len = 0;
			}
			if(tmp.row == row && tmp.len >= 12 || col > 11 || col + span > 12) {
//				return;
			}
			tmp.len = col+span;
			cells[row] = cells[row] || [];
			cells[row][col] = item;
		}
		
		this.rows = cells;

		var realTarget = $('<div></div>').addClass(this.ctCls)/*.appendTo(target)*/,
			rowEl,
			columns;
		for(var i= 0,len=cells.length;i<len;i++) {
			columns = cells[i];
			if(!columns) continue;
			rowEl = $('<div></div>').addClass('row').appendTo(target);
			for(var j= 0,len2=columns.length;j<len2;j++) {
				item = columns[j];
				if(item) {
					span = item.colspan || 1;
					// 设置各个item的el，不用重写getItemTarget
					item.container = $('<div></div>').attr('col', j).attr('span',span).addClass(this.colClsPrefix+span).appendTo(rowEl);
				}
			}
		}
		// 解除cells对items的引用
		for(var i= 0,len=cells.length;i<len;i++) {
			columns = cells[i];
			if(!columns) {
				delete cells[i];
				continue;
			}
			for(var j= 0,len2=columns.length;j<len2;j++) {
				delete columns[j];
			}
			delete cells[i];
		}

		// 插入定位所需空白列
		for(var i= 0,rows=target.children(),len=rows.length;i<len;i++) {
			var row = rows[i];
			for(var j= 0,columns=row.childNodes,len2=columns.length;j<len2;j++) {
				var space;
				if(j==0 && $(columns[0]).attr('col') > 0) {
					space = $(columns[0]).attr('col') - 0;
					$('<div></div>').attr('col', 0).attr('span',space).addClass(this.colClsPrefix+space).insertBefore($(columns[0]));
				} else {
					space = $(columns[j+1]).attr('col') - $(columns[j]).attr('col') - $(columns[j]).attr('span');
					if(space > 0) {
						var col = parseInt($(columns[j]).attr('col')) + parseInt($(columns[j]).attr('span')) + 1;
						$('<div></div>').attr('col', col).attr('span',space).addClass(this.colClsPrefix+space).insertAfter($(columns[j]));
					}
				}
			}
		}
	}

});
YIUI.layout['ColumnLayout'] = YIUI.layout.ColumnLayout;