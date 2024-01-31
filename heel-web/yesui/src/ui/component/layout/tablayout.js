/**
 * TAB布局
 */
YIUI.layout.TabsLayout = YIUI.extend(YIUI.layout.AutoLayout, {
	layout : function(panelWidth, panelHeight) {
		var ct = this.container;
		var body = ct.el.children(".tab-body"),
			overflow = body.css('overflow');

		panelHeight -= this.getPlaceholderHeight();
		panelWidth -= this.getPlaceholderWidth();
		var oldWidth = body.width();
        if(ct.items && ct.items.length != 0) {
			var head = $(ct.el.children(".tab-head")),
				body = $(ct.el.children(".tab-body")),
				list = $(".list", head),
				btn = $(".btn", head),
				tabPosition = ct.tabPosition;
			switch (tabPosition) {
				case YIUI.DirectionType.TOP: 
				case YIUI.DirectionType.BOTTOM: 
					head.width(panelWidth);
					// 设置body高度，使滚动条局限在body里，不影响TAB header
					body.height(panelHeight - head.outerHeight(true));
					body.width(panelWidth);
					list.width(head.outerWidth() - btn.outerWidth());
					break;
				case YIUI.DirectionType.LEFT: 
				case YIUI.DirectionType.RIGHT: 
					body.height(panelHeight);
					var ul_h = head.outerHeight(true);
					if($.browser.isIE && $.browser.version == 9) {
						ul_h = head.outerWidth();
					}
					body.width(panelWidth - ul_h);
					head.width(panelHeight);
					if($.browser.isIE && $.browser.version == 9) {
						list.width(head.outerHeight() - btn.outerHeight());
					} else {
						list.width(head.outerWidth() - btn.outerWidth());
					}
					break;
			}
			var tab = ct.items[ct.activeTab];
			if(tab) {
				tab.setWidth(body.width());
				tab.setHeight(body.height());
				if(tab.hasLayout) {
					tab.doLayout(tab.getWidth(), tab.getHeight());
				}
			}

			
			var newWidth = body.width();
			var diff = oldWidth - newWidth;
			if(diff < 0) {
				var s_Left = list.scrollLeft();
				list.scrollLeft(s_Left + diff);
			} else {
				ct.setTabScroll();
			}

			ct.setDropBtnVisible();
		}
	},
	layoutRender : function() {
		var ct = this.container,
			target = ct.getRenderTarget(),
			items = ct.items,
			item;

		// TAB header
		var head = ct._head;
		var list = $(".list", head);
		var ul = $("ul.tab-list", head);
		var view = ct._dropView;
		// 添加body使滚动条不影响header
		var body = $("<div class='tab-body'>");
		var tabPosition = ct.tabPosition;
		switch (tabPosition) {
			case YIUI.DirectionType.TOP: 
				view.addClass("top");
				head.addClass("top");
				body.appendTo(target);
				break;
			case YIUI.DirectionType.BOTTOM: 
				view.addClass("bottom");
				head.addClass("bottom");
				body.prependTo(target);
				break;
			case YIUI.DirectionType.LEFT: 
				view.addClass("left");
				head.addClass("left");
				body.prependTo(target);
				body.css("float", "right");
				break;
			case YIUI.DirectionType.RIGHT: 
				view.addClass("right");
				head.addClass("right");
				body.prependTo(target);
				body.css("float", "left");
				break;
		}

		for(var i=0,len=items.length; i<len; i++) {
			item = items[i];
			item.id = item.id || YIUI.allotId();
			var tabID = "tab_" + item.id;
			var title = item.title;
			if(!title) {
				title = item.caption;
			}
			var _li = $(YIUI.Panel.TabPanel.prototype.tabTemplate.replace(/#\{href\}/g, "#" + tabID).replace(/#\{title\}/g, title)).appendTo(ul);
			_li.addClass("ui-state-default ui-corner-top")
				.attr("role", "tab").attr("aria-controls", tabID);
			$("[href='#"+tabID+"']", _li).addClass("ui-tans-anchor").attr("role", "presentation");
			$("[href='#"+tabID+"'] label", _li).addClass("ui-anchor-label");
			$("[href='#"+tabID+"'] label", _li).attr("title",title);
			var _div = $('<div>').attr('id', tabID).appendTo(body);
			item.container = _div;
			_div.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom")
					.attr("role", "tabpanel");
			
			if(ct.activeTab < 0 && item.visible) {
				ct.selectedTab = _li;
				ct.activeTab = i;
				_li.toggleClass("aria-selected");
				_div.toggleClass("aria-show");
				_div.show();
				item.needRender = true;
			} else {
				_div.hide();
				item.needRender = false;
			}

			if(!item.visible) {
				_li.css("display", "none");
			}
		}
	},

	afterRender : function() {
		var container = this.container;
		var body = $(container.el.children()[1]),
			overflow = body.css('overflow');
	},
	
	/**
	 * beforeLayout中已经设置了各个面板的el
	 */
	isValidParent : function(c, target) {
		return true;
	}
});
YIUI.layout['TabLayout'] = YIUI.layout.TabsLayout;