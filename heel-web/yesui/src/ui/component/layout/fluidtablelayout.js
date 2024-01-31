YIUI.layout.FluidTableLayout = YIUI.extend(YIUI.layout.AutoLayout, {
	layout : function(panelWidth, panelHeight) {
		var ct = this.container,
		target = ct.getRenderTarget(),
		repeatCount = ct.repeatCount || 1,
		items = ct.items,
		rowHeight = ct.rowHeight,
		rowGap = ct.rowGap || 0,
		columnGap = ct.columnGap || 0,
		repeatGap = ct.repeatGap || 0,
		widths = ct.widths;
		if(!widths) {
			throw 'widths is undefined';
		}
		
		var table = this.table,
			firstRow = true,
			tr,
			td,
			count = 0;
		for (var i = 0; i < items.length; i++) {
			if(items[i].buddyKey) {
				count++;
			}
		}
		count = items.length - 2*count;
		var rows = (items.length + count) / 2;
		if(rows % repeatCount == 0) {
			rows = rows / repeatCount;
		} else {
			rows = parseInt(rows / repeatCount ) + 1;
		}
		var cols = 2 * repeatCount;

		panelWidth -= widths.length * columnGap * repeatCount + (repeatCount - 1) * repeatGap + this.getPlaceholderWidth();
		panelHeight -= rows * rowHeight + this.getPlaceholderHeight();
		var parentWidth = this.getRealWidth(widths, panelWidth / repeatCount);
		var item;
		for (var i = 0; i < rows; i++) {
			tr = $(table[0].rows[i]).height(rowHeight);
			for (var j = 0; j < cols; j++) {
				td = $(tr[0].cells[j]);
				var $tdW = $.getReal(widths[j % 2 == 0 ? 0 : 1], parentWidth);
				if(firstRow) {
					td.width($tdW);
				}
				if(td.children().length > 0) {
					var idx = td.attr("index");
					item = items[idx];
					item.setWidth($tdW);
					item.setHeight(rowHeight);
					
					item.getOuterEl().css("margin-left", "0");
					item.getOuterEl().css("margin-top", "0");
					
					if(columnGap > 0 && !item.hasBuddyKey) {
						item.getOuterEl().css("margin-left", columnGap + "px");
					}
					if(repeatCount > 1 && j > 1) {
						if(item.hasBuddyKey) {
							item.getOuterEl().css("margin-left", repeatGap + "px");
						}
					} 
					if(i > 0) {
						item.getOuterEl().css("margin-top", rowGap + "px");
					}
					if(item.hasLayout){
						item.doLayout(item.getWidth(), item.getHeight());
					}
				}
			}
			firstRow = false;
		}
		
	},
	
	getRealWidth: function(widths, parentWidth) {
		var realWidth = 0;
		for (var i = 0; i < widths.length; i++) {
			if($.isNumeric(widths[i]) && widths[i] > 0) {
				realWidth += widths[i];
			}
		}
		return parentWidth - realWidth;
	},
	
	repaint: function() {
		this.reset();
		var ct = this.container;
		var el = ct.getEl();
		this.layout(el.outerWidth(), el.outerHeight());
	},
	
	reset: function() {
		var ct = this.container,
			target = ct.getRenderTarget(),
			repeatCount = ct.repeatCount || 1,
			items = ct.items,
			rowHeight = ct.rowHeight,
			widths = ct.widths;
		if(!widths) {
			throw 'widths is undefined';
		}
		
		var table = this.table,
			tr,
			td;
		
		var count = 0;
		for (var i = 0; i < items.length; i++) {
			if(items[i].buddyKey) {
				count++;
			}
		}
		count = items.length - 2*count;
		
		var rows = (items.length + count) / 2;
		if(rows % repeatCount == 0) {
			rows = rows / repeatCount;
		} else {
			rows = parseInt(rows / repeatCount ) + 1;
		}
		
		for (var i = 0; i < items.length; i++) {
			item = items[i];
			if(item.buddyKey != undefined) {
				for (var j = 0; j < items.length; j++) {
					var _item = items[j];
					if(_item.key == item.buddyKey) {
						_item.rgtVisible = item.visible;
						_item.hasBuddyKey = true;
						item.leftVisible = _item.visible;
						continue;
					}
				}
			}
		}
		
		var _index = 0;
		var vItems = [];
		for (var i = 0; i < rows; i++) {
			tr = $("tr[row="+i+"]", table);
			for (var j = 0; j < (2 * repeatCount); j++) {
				var item = items[_index];
				var idx = _index;
				if(item) {
					_index++;
					
					if(item.hasBuddyKey) {
						//左
						if(!item.rgtVisible) {
							j--;
							vItems.push(item);
						}
					} else {
						if(item.visible) {
							//右
							if(!item.buddyKey) {
								//有伙伴组件
								j++;
							}
						} else {
							//右
							if(item.buddyKey) {
								if(!item.visible) {
									j--;
									vItems.push(item);
								}
							} else {
								j--;
							}
							continue;
						}
					}
					
					td = $("td[col="+j+"]", tr);
					td.attr("index", idx);
					item.container = td;
					item.el.appendTo(td);
//					if(item.width == -1) {
						item.width = widths[j % 2 == 0 ? 0 : 1];
//					}
					item.height = rowHeight;

				}
			}
		}
		var hRows = vItems.length/repeatCount/2 + rows;
		$("tr[row]", table).slice(rows).remove();
		for (var i = rows; i < hRows; i++) {
			tr = $("<tr row="+i+"/>").appendTo(table);
			for (var j = 0, len = vItems.length; j < len; j++) {
				var item = vItems[j];
				td = $("<td/>").appendTo(tr);
				item.el.appendTo(td);
			}
			tr.hide();
		}
	},
	
	layoutRender: function() {
		var ct = this.container,
		target = ct.getRenderTarget(),
		repeatCount = ct.repeatCount || 1,
		items = ct.items,
		rowHeight = ct.rowHeight,
		widths = ct.widths;
		if(!widths) {
			throw 'widths is undefined';
		}
		
		var table = $('<table class="layout"></table>').attr({border : 0,cellpadding : 0, cellspacing : 0}).appendTo(target),
		tr,
		td;
		this.table = table;
		
		var count = 0;
		for (var i = 0; i < items.length; i++) {
			if(items[i].buddyKey) {
				count++;
			}
		}
		count = items.length - 2*count;
		
		var rows = (items.length + count) / 2;
		if(rows % repeatCount == 0) {
			rows = rows / repeatCount;
		} else {
			rows = parseInt(rows / repeatCount ) + 1;
		}
		
		for (var i = 0; i < items.length; i++) {
			item = items[i];
			if(item.buddyKey != undefined) {
				for (var j = 0; j < items.length; j++) {
					var _item = items[j];
					if(_item.key == item.buddyKey) {
						_item.hasBuddyKey = true;
						_item.rgtVisible = item.visible;
						continue;
					}
				}
			}
		}
		
		var _index = 0;
		var vItems = [];
		for (var i = 0; i < rows; i++) {
			tr = $('<tr row="'+i+'"></tr>').appendTo(table);
			for (var j = 0; j < (2 * repeatCount); j++) {
				var item = items[_index];
				var idx = _index;
				if(item) {
					if(!item.visible || (item.hasBuddyKey && !item.rgtVisible)) {
						vItems.push(item);
						_index++;
						j--;
						continue;
					}
					if(!item.buddyKey && !item.hasBuddyKey) {
						$('<td col="'+j+'"></td>').appendTo(tr);
						j++;
					} 
					if(item.buddyKey) {
						var bkItem = ct.get(item.buddyKey);
						if(!bkItem.visible) {
							$('<td col="'+j+'"></td>').appendTo(tr);
							j++;
						}
					}
					td = $('<td col="'+j+'"></td>').appendTo(tr);
					td.attr("index", idx);
					item.container = td;
					if(item.width == -1) {
						item.width = widths[j % 2 == 0 ? 0 : 1];
					}
					item.height = rowHeight;
				} else {
					$('<td col="'+j+'"></td>').appendTo(tr);
				}
				_index++;
			}
		}
		var hRows = vItems.length/repeatCount/2 + rows;
		for (var i = rows; i < hRows; i++) {
			tr = $('<tr row="'+i+'"></tr>').appendTo(table);
			tr.hide();
			for (var j = 0, len = vItems.length; j < len; j++) {
				var item = vItems[j];
				td = $('<td col="'+j+'"></td>').appendTo(tr);
				item.container = td;
			}
		}
	}

});
YIUI.layout['FluidTableLayout'] = YIUI.layout.FluidTableLayout;