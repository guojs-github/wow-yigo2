/**
 * 流布局面板
 */
YIUI.layout.CustomLayout = YIUI.extend(YIUI.layout.AutoLayout, {

	getSize: function(sizes) {
		var s = "";
		for (var i = 0, len = sizes.length; i < len; i++) {
			var size = sizes[i];
			// if($.isNumeric(size)) {
			// 	s += " " + size + "px";
			// } else {
			// 	s += " " + size;
			// }

			if($.isNumeric(size)) {
				s += " " + size + "px";
			} else if(size == "pref") {
				s += " auto";
			} else if($.isPercentage(size)) {
				s += " " + parseInt(size) + "fr";
			} else {
				s += " " + size;
			}
		}
		return s;
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
				} else if ((tmp = result[percentages[i]]) == "pref") {
					result[percentages[i]] = "pref";
				}
			}
		} 
		return result;
	},

	layout : function(panelWidth, panelHeight) {
		var ct = this.container,
			el = ct.el,
			target = ct.getRenderTarget(),
			rowGap = ct.rowGap || 0,
			columnGap = ct.columnGap || 0,
			widths = ct.widths,
			heights = ct.heights,
            table = this.table,
			tr,
			td;
		if(!widths || !heights) {
			throw new YIUI.ViewException(YIUI.ViewException.NO_WIDTH_OR_HEIGHT);
		}

		var w = this.getSize(widths);
		var h = this.getSize(heights);
		
		el.css({
			"display": "grid",
			"grid-template-rows": h,
			"grid-template-columns": w,
			"grid-row-gap": rowGap + "px",
			"grid-column-gap": columnGap + "px"
		});
		
		el.children().children().hide();

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
			
			item.setWidth($div.width());
			item.setHeight($div.height());

			if(item.hasLayout){
				item.doLayout(item.getWidth(), item.getHeight());
			}
		}

		el.children().children().show();
	}


});
YIUI.layout['CustomLayout'] = YIUI.layout.CustomLayout; 