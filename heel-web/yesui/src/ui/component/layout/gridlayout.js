/**
 * 网格布局
 * 使用<table></table>来实现布局。
 * 根据container的widths、heights来确定列数、行数、列宽、行高。
 * 根据container的rowGap columnGap设置行间距与列间距
 * 根据container.items中的x、y来确定控件的位置(第几列、第几行)，colspan、rowspan来确定控件的大小(占几列、占几行)。
 * 示例：
 * +--------+-----------------+
 * |        |   B             |
 * |   A    |--------+--------|
 * |        |   C    |   D    |
 * +--------+--------+--------+
 * var panel = new YIUI.Panel({
 * 		layout : 'grid',
 * 		widths : [100, 100, 100],
 * 		heights : [30, 30],
 * 		rowGap : 10,
 * 		columnGap : 10,
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
YIUI.layout.GridLayout = YIUI.extend(YIUI.layout.AutoLayout, {
	
	layout : function(panelWidth, panelHeight) {
		var ct = this.container,
			el = ct.el,
			target = ct.getRenderTarget(),
			rowGap = ct.rowGap || 0,
			columnGap = ct.columnGap || 0,
			widths = ct.widths,
			minWidths = ct.minWidths,
			heights = ct.heights,
            table = this.table,
			tr,
			td;
		if(!widths || !heights) {
			// YIUI.ViewException.throwException(YIUI.ViewException.NO_WIDTH_OR_HEIGHT);
			throw new YIUI.ViewException(YIUI.ViewException.NO_WIDTH_OR_HEIGHT);
		}

		if($.supportCss3("grid-template-rows")) {
			
			var padding_w = parseInt(ct.leftPadding || ct.padding || 0) + parseInt(ct.rightPadding || ct.padding || 0);
			var padding_h = parseInt(ct.topPadding || ct.padding || 0) + parseInt(ct.bottomPadding || ct.padding || 0);

			panelWidth -= padding_w;
			panelHeight -= padding_h;
			ct.el.width(panelWidth);
			if(ct.height != "pref") {
				ct.el.height(panelHeight);
			}
			
			panelWidth -= columnGap * (widths.length - 1);
			var realWidths = this.calcRealValues(panelWidth, widths);
			panelHeight -= rowGap * (heights.length - 1);
			var realHeights = this.calcRealValues(panelHeight, heights);
			var items = ct.items,
				item,
				row,
				col,
				colspan,
				rowspan;
			for(var i = 0, len = items.length; i < len; i++) {
				item = items[i];
				col = item.x + 1;
				row = item.y + 1;
				colspan = item.colspan || 1;
				rowspan = item.rowspan || 1;
			
				var $div = item.container;
				var cssText = "grid-row-start: " + row + ";"
							+ "grid-column-start: " + col + ";";
				if(rowspan > 1) {
					cssText += "grid-row-end: " + (row + rowspan) + ";";
				}
				if(colspan > 1) {
					cssText += "grid-column-end: " + (col + colspan) + ";";
				}
				$div[0].style.cssText = cssText;
				$div.attr("row", row);
				$div.attr("col", col);
				
				var realW = this.getRealWidth(minWidths[item.x], realWidths[item.x]);
				if(colspan > 1) {
					for (var j = 1; j < colspan; j++) {
						realW += realWidths[item.x + j];
						realW += columnGap;
					}
				}
				item.setWidth(realW);
				var realH = realHeights[item.y];
				if(rowspan > 1) {
					for (var j = 1; j < rowspan; j++) {
						realH += realHeights[item.y + j];
						realH += rowGap;
					}
				}
				item.setHeight(realH);

				// item.setWidth($div.width());
				// item.setHeight($div.height());
	
				if(item.hasLayout){
					if(item.type == YIUI.CONTROLTYPE.GRIDLAYOUTPANEL) {
						item.doLayout(item.getOuterEl().outerWidth(), item.getOuterEl().outerHeight());
					} else {
						item.doLayout(item.getWidth(), item.getHeight());
					}
				}
			}
			return;
		}

		panelHeight -= rowGap * (heights.length - 1) + this.getPlaceholderHeight();
		var realHeights = this.calcRealValues(panelHeight, heights);
		
		for(var i=0; i<realHeights.length; i++) {
//			tr = $('tr[row='+i+']', table).height(realHeights[i]);
			tr = $(table[0].rows[i+1]).height(realHeights[i]);
		}
		var tr_f = $('tr.first', table);
		panelWidth -= columnGap * (widths.length - 1) + this.getPlaceholderWidth();
		var realWidths = this.calcRealValues(panelWidth, widths);
		var realW = -1;
		for(var j=0; j<realWidths.length; j++) {
			td = $(tr_f[0].cells[j]);
			var x = td.attr("col");
			realW = this.getRealWidth(minWidths[x], realWidths[x]);
			td.width(realW);
			$("span", td).css("width", realW);
			if(ct.oddColumnColor && j%2 == 0) {
				td.css("background-color", ct.oddColumnColor);
			}
		}
		
		var items = ct.items,
			item,
			row,
			col,
			colspan,
			rowspan;
		for(var i= 0,len=items.length;i<len;i++) {
			item = items[i];
			// if(!item.visible) continue;
			col = item.x;
			row = item.y;
			colspan = item.colspan || 1;
			rowspan = item.rowspan || 1;
			
			var realWidth = this.getRealWidth(minWidths[col], realWidths[col]),
				realHeight = realHeights[row];
			if(realHeight == "pref" && $.isNumeric(item.height)) {
				realHeight = item.height;
			}
			if(colspan > 1) {
				for (var j = 1; j < colspan; j++) {
					realW = this.getRealWidth(minWidths[col + j], realWidths[col + j]);
					realWidth += realW + columnGap;
				}
			}
			if(rowspan > 1) {
				for (var j = 1; j < rowspan; j++) {
					realHeight += realHeights[row + j] + rowGap;
				}
			}
			if(row > 0) {
				item.setTopMargin(rowGap);
			}
			if(col > 0) {
				item.setLeftMargin(columnGap);
			}
			item.setWidth(realWidth);
            item.setHeight(realHeight);
			if(item.hasLayout){
				item.doLayout(item.getWidth(), item.getHeight());
			}
		}
	},
	
	getRealWidth: function(minWidth, width){
		var realWidth = width;
		if(minWidth != -1 && minWidth > width) {
			realWidth = minWidth;
		}
		return realWidth;
	},
	
	layoutRender : function() {
		if($.supportCss3("grid-template-rows")) {
			this.base();
			
			var ct = this.container;
			ct.getWidth = function(width) {
				if (ct.rendered) {
					return this.getOuterEl().parent().width();
				}
				return ct.width;
			};
			ct.getHeight = function(height) {
				if (ct.rendered) {
					return ct.getOuterEl().parent().height();
				}
				return ct.height;
			};

			var getSize = function(sizes, minSizes) {
				var s = "";
				for (var i = 0, len = sizes.length; i < len; i++) {
					var size = sizes[i];
					var minSize = 0;
					if(minSizes) {
						minSize = minSizes[i];
					}
					if(minSize <= 0) minSize = 0;
					if($.isNumeric(size)) {
						size = size + "px";
						minSize && (size = "minmax(" + minSize + "px, " + size + ")");
					} else if(size == "pref") {
						size = "auto";
					} else if($.isPercentage(size)){
						size = parseInt(size) + "fr";
						minSize && (size = "minmax(" + minSize + "px, " + size + ")");
					}
					s += " " + size;
				}
				return s;
			};
			
			var widths = ct.widths,
				minWidths = ct.minWidths,
				heights = ct.heights,
				rowGap = ct.rowGap || 0,
				columnGap = ct.columnGap || 0;
			var w = getSize(widths, minWidths);
			var h = getSize(heights);
			
			ct.el.css({
				"display": "grid",
				"grid-template-rows": h,
				"grid-template-columns": w,
				"grid-row-gap": rowGap + "px",
				"grid-column-gap": columnGap + "px"
			});

			return;
		}
		var ct = this.container,
			target = ct.getRenderTarget(),
			widths = ct.widths,
			heights = ct.heights;
		if(!widths || !heights) {
            throw new YIUI.ViewException(YIUI.ViewException.NO_WIDTH_OR_HEIGHT,
                YIUI.ViewException.formatMessage(YIUI.ViewException.NO_WIDTH_OR_HEIGHT));
		}
		
		var realWidths = this.calcRealValues(ct.getWidth(), widths);
		var realHeights = this.calcRealValues(ct.getHeight(), heights);
		var table = $('<table class="layout"></table>').attr({border : 0,cellpadding : 0, cellspacing : 0}).appendTo(target),
			firstRow = true,
			rowGap = ct.rowGap || 0,
			tr,
			td;
		this.table = table;

		var tblH = 0, tr_f;
		for(var i=0;i<realHeights.length;i++) {
			if(i == 0) {
				tr_f = $('<tr></tr>').addClass("first").appendTo(table);
			}
			tr = $('<tr row="'+i+'"></tr>').appendTo(table);
			for(var j=0;j<realWidths.length;j++) {
				if(i == 0) {
					var td = $('<td col="'+j+'"></td>').appendTo(tr_f);
					var span = $("<span/>").appendTo(td);
					if(j > 0) {
						var columnGap = ct.columnGap || 0;
						if(columnGap) {
							span.css("margin-left", columnGap+"px");
						}
					}
				}
				td = $('<td col="'+j+'"></td>').appendTo(tr);
			}
			tblH += realHeights[i];
		}
		tblH += (realHeights.length - 1) * rowGap;
//		table.css("height", tblH);
		var items = ct.items,
			item,
			row,
			col,
			colspan,
			rowspan;
		for(var i= 0,len=items.length;i<len;i++) {
			item = items[i];
			col = item.x;
			row = item.y;
			colspan = item.colspan || 1;
			rowspan = item.rowspan || 1;
//			tr = $('tr[row='+row+']', table);
			tr = $(table[0].rows[row+1]);
			td = this.getCell(row, col);
			// if(!item.visible) {
			// 	continue;
			// }

			td.attr('colspan', colspan).attr('rowspan', rowspan);
			// item.width = realWidths[col];
			// item.height = realHeights[row];

			if(td.next().attr("col") != col + 1) continue;
			td.nextAll('td:lt('+(colspan-1)+')').remove();
			tr.nextAll('tr:lt('+(rowspan-1)+')').each(function() {
				var td = $('td[col='+col+']', $(this));
				td.nextAll('td:lt('+(colspan-1)+')').remove();
				td.remove();
			});
		}
	},
	
	// private 根据比例计算固定宽度高度
	calcRealValues : function(total, valueWithPercentage) {
		var result = [], 
			totalPercentage = 0,
			totalPercentageValue,
			len = valueWithPercentage.length,
			percentages = [],
			realTotalValue = 0,
			i, tmp;
		for (i = 0; i < len; i++) {
			tmp = valueWithPercentage[i];
			if($.isPercentage(tmp)) {
				tmp = parseInt(tmp, 10) / 100;
				totalPercentage += tmp;
				percentages.push(i);
			} else if($.isNumeric(tmp) && tmp < 1) {
				percentages.push(i);
			} else if(tmp == "auto") {
				percentages.push(i);
			} else if(tmp == "pref") {
				percentages.push(i);
			} else {
				realTotalValue += tmp;
			}
			result[i] = tmp;
		}
		if(realTotalValue <= total) {
			totalPercentageValue = total - realTotalValue;
			if (totalPercentage == 0)
				totalPercentage = 1;
			len = percentages.length;
			for (i = 0; i < len; i++) {
				if ((tmp = result[percentages[i]]) > 0) {
					result[percentages[i]] = Math.floor(totalPercentageValue * tmp );
					realTotalValue += result[percentages[i]];
				} else if((tmp = result[percentages[i]]) == "auto") {

					if(i == len - 1) {
						result[percentages[i]] = totalPercentageValue - parseInt(totalPercentageValue / len) * (len - 1);
					} else {
						result[percentages[i]] = parseInt(totalPercentageValue / len);
					}

					// result[percentages[i]] = totalPercentageValue / len;
				} else if ((tmp = result[percentages[i]]) == "pref") {
					// var item, rowspan, maxHeight = -1;
					// for (var j = 0, length = this.container.items.length; j < length; j++) {
					// 	item = this.container.items[j];
					// 	var height = item.height==-1?item.getHeight():item.height;
					// 	rowspan = item.rowspan || 1;
					// 	if(item.y == percentages[i] && rowspan == 1 && height > maxHeight) {
					// 		maxHeight = height;
					// 	}
					// }
					// result[percentages[i]] = maxHeight;
					result[percentages[i]] = "pref";
				}
			}
		} 
		return result;
	},

	getCell : function(row, col) {
//		var tr = $('tr[row='+row+']', this.table);
		var tr = $(this.table[0].rows[row+1]);
		// return $('td[col='+col+']', tr); //  这种写法在网格嵌套网格的时候会有问题
        return tr.children("[col="+col+"]");
	},

	/**
	 * 返回控件comp即将被render到的dom
	 * @param comp
	 * @param index comp在items中的index
	 */
	getItemTarget : function(comp, index) {
		if($.supportCss3("grid-template-rows")) {
			return comp.container || this.container.getRenderTarget();
		} else {
			return this.getCell(comp.y, comp.x);
		}
	}
});
YIUI.layout['GridLayout'] = YIUI.layout.GridLayout;