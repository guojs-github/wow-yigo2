/**
 * TAB布局
 */
YIUI.layout.Tab = YIUI.extend(YIUI.layout.AutoLayout, {
	layout : function(panelWidth, panelHeight) {
		var ct = this.container;
		panelHeight -= this.getPlaceholderHeight();
		panelWidth -= this.getPlaceholderWidth();
        if(ct.items && ct.items.length != 0) {
			var ul = $("ul.ui-tabs-nav", ct.el),
				body = $(ct.el.children(".ui-tabs-body"));
			
//			ct._dropView.css("max-height", document.body.clientHeight - ct._dropView.position().top);
			
	    	body.width(panelWidth);
			// 设置body高度，使滚动条局限在body里，不影响TAB header
			body.height(panelHeight - ul.outerHeight(true));
	    	$(".ui-tabs-header", this.el).width(panelWidth - 30);
			
			var tab = ct.items[ct.activeTab];
			if(tab) {
				tab.setWidth(body.width());
				tab.setHeight(body.height());
				if(tab.hasLayout) {
					tab.doLayout(tab.getWidth(), tab.getHeight());
				}
				
				if(ct.selectedTab) {
					$(".ui-tabs-header", ct.el).scrollLeft(ct.selectedTab.position().left - $(".ui-tabs-header", ct.el).width() + ct.selectedTab.width());
				}
			}
		}
        
        ct.setDropBtnView();
        ct.setTabListColor();
	},
	layoutRender : function() {
		var ct = this.container,
			target = ct.getRenderTarget(),
			items = ct.items,
			item;

//		var realTarget = $('<div></div>').addClass("ui-tabs").appendTo(target),
		// TAB header
		var ul = $('<ul/>');
		var header = $("<div></div>").addClass("ui-tabs-header").appendTo(target).append(ul);
		
		var tabs_list = ct._dropBtn = $("<span></span>").addClass("ui-tabs dropdownBtn").appendTo(target);
		ct._dropView = $('<div><ul/></div>').addClass('ui-tabs tabs-list');
		$(document.body).append(ct._dropView);
		
		ul.addClass("ui-tabs-nav ui-corner-all");
		ul.attr("role", "tablist");
		

		// 添加body使滚动条不影响header
		var body = $('<div>').addClass('ui-tabs-body').appendTo(target);

		for(var i=0,len=items.length; i<len; i++) {
			item = items[i];
			item.id = item.id || YIUI.allotId();
			if(!item.title) {
				item.title = item.caption;
			}
			var _li = $(YIUI.Panel.TabPanel.prototype.tabTemplate.replace(/#\{href\}/g, "#" + item.id).replace(/#\{title\}/g, item.title)).appendTo(ul);
			if(i == 0) {
				ct.selectedTab = _li;
				ct.activeTab = 0;
			} else {
			}
			_li.addClass("ui-state-default ui-corner-top")
				.attr("role", "tab").attr("aria-controls", item.id);
			$("[href='#"+item.id+"']", _li).addClass("ui-tans-anchor").attr("role", "presentation");
			$("[href='#"+item.id+"'] label", _li).addClass("ui-anchor-label");
			var _div = $('<div>').attr('id', item.id).appendTo(body);
			item.container = _div;
			_div.addClass("ui-tabs-panel ui-corner-bottom")
					.attr("role", "tabpanel");
			
			if(i == 0) {
				_li.toggleClass("aria-selected");
				_div.toggleClass("aria-show");
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
YIUI.layout['tab'] = YIUI.layout.Tab;
