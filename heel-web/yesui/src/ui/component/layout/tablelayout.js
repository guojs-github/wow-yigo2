/**
 * table-cell布局
 * 使用display: table-cell;来实现布局。
 * 根据container的widths、heights来确定列数、行数、列宽、行高，可以是固定值、百分比。
 * 根据container.items中的x、y来确定控件的位置(第几列、第几行)，colspan、rowspan来确定控件的大小(占几列、占几行)。
 * 示例：
 * +--------+-----------------+
 * |        |   B             |
 * |   A    |--------+--------|
 * |        |   C    |   D    |
 * +--------+--------+--------+
 * var panel = new YIUI.Panel({
 * 		layout : 'table',
 * 		widths : [100, '60%', '40%'],
 * 		heights : [30, 30],
 * 		items : [{
 * 		 	// A
 * 		 	x : 0,
 * 		 	y : 0,
 *			rowspan : 2
 * 		}, {
 * 		 	// B
 * 		 	x : 1,
 * 		 	y : 0,
 *			colspan : 2
 * 		}, {
 * 		 	// C
 * 		 	x : 1,
 * 		 	y : 1
 * 		}, {
 * 		 	// D
 * 		 	x : 2,
 * 		 	y : 1
 * 		}]
 * });
 * panel.render('#ct1');
 */
YIUI.layout.TableLayout = YIUI.extend(YIUI.layout.AutoLayout, {
	layoutRender : function() {
		var ct = this.container,
			target = ct.getRenderTarget(),
			widths = ct.widths,
			heights = ct.heights;
		if(!widths || !heights) {
			throw 'widths or heights not defined!';
		}

		// 计算百分比
		var realWidths = YIUI.layout.GridLayout.prototype.calcRealValues.call(this, ct.getWidth(), widths);
		var realHeights = YIUI.layout.GridLayout.prototype.calcRealValues.call(this, ct.getHeight(), heights);
		var table = $('<div class="table"></div>').appendTo(target),
			firstRow = true,
			total = 0;
		this.table = table;

		for(var i=0;i<realHeights.length;i++) {
			var row = $('<div class="table-row" row="'+i+'"></div>').appendTo(table);
			for(var j=0;j<realWidths.length;j++) {
				var cell = $('<div col="'+j+'"></td>').addClass('table-cell').css({height:realHeights[i]}).appendTo(row);
				if(firstRow) {
					total += realWidths[j];
					cell.css({width:realWidths[j],'max-width':realWidths[j]});
				}
			}
			firstRow = false;
		}
		// 如果所有列宽总和小于table总宽度，为防止各列自动扩展宽度，最后面再加一列占位
		if(total < ct.getWidth()) {
			$(table.children(null,'.table-row')[0]).append($('<div class="table-cell" style="visibility:hidden;"></div>').css('width', ct.getWidth()-total));
		}

		var items = ct.items,
			rows = table[0].childNodes,
			cols = rows[0].childNodes;
		for(var i= 0,len=items.length;i<len;i++) {
			var item = items[i],
				x = item.x,
				y = item.y,
				colspan = item.colspan || 1,
				rowspan = item.rowspan || 1,
				cell = this.getCell(y, x);
			if(colspan == 1 && rowspan == 1) {
				cell.attr('pos', y+'_'+x);
			} else {
				var width = 0,height= 0,left= 0,top=0;
				for(var j=0;j<colspan;j++) {
					width += realWidths[x+j];
				}
				for(var j=0;j<rowspan;j++) {
					height += realHeights[y+j];
				}
				for(var j=rowspan-1;j>=0;j--) {
					for(var k=colspan-1;k>=0;k--) {
						if(j==0 && k==0) continue;
						this.getCell(y+j, x+k).css('visibility', 'hidden');
					}
				}
				
				cell.css({position:'absolute',width:width,height:height}).attr('pos', y+'_'+x);
			}

			item.width = cell.width();
			item.height = cell.height();
		}
	},
	
	afterRender : function() {
		
	},

	// private 根据行、列获取某个cell DOM
	getCell : function(row, col) {
		return $(this.table[0].childNodes[row].childNodes[col]);
	},

	/**
	 * 返回控件comp即将被render到的dom
	 * @param comp
	 * @param index comp在items中的index
	 */
	getItemTarget : function(comp, index) {
		return $('div[pos='+comp.y+'_'+comp.x+']');
	}
});
YIUI.layout['TableLayout'] = YIUI.layout.TableLayout;