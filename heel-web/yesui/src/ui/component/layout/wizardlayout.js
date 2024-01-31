YIUI.layout.Wizardlayout = YIUI.extend(YIUI.layout.AutoLayout, {
	layout : function(panelWidth, panelHeight) {
		var ct = this.container;

        var index = ct.selectItem.index();
        var right = index * panelWidth;
        ct.body.css("right", right + "px");
        
        var top = (panelHeight - $('.wizard-btn', this.el).height()) / 2;
        $('.wizard-btn', this.el).css("margin-top", top + "px");
        
		panelHeight -= this.getPlaceholderHeight();
		panelWidth -= this.getPlaceholderWidth();
		var items = ct.items;
        if(items && items.length != 0) {
			for (var i = 0, len = items.length; i < len; i++) {
				var item = items[i];
				var foot = item.container.next(".wizard-foot");
				var height = panelHeight - foot.outerHeight();
				item.setHeight(height);
				item.setWidth(panelWidth);
				if(item.hasLayout){
					item.doLayout(item.getWidth(), item.getHeight());
				}
			}
		}
        
	},
	layoutRender : function() {
		var ct = this.container,
			target = ct.getRenderTarget(),
			items = ct.items,
			item,
			funcMap = ct.funcMap,
			warp = $(".ui-wizard-warp", ct.el);
		
		for(var i=0, len=items.length; i<len; i++) {
			item = items[i];
			var _div = $("<div class='wizard-item'></div>").attr("key", item.key).appendTo(ct.body);
	    	var body = $("<div class = 'wizard-body'></div>").appendTo(_div);
			if(item) {
				item.container = body;
				if(i == 0) {
					warp.addClass("first");
					ct.selectItem = _div;
				}
				_div.attr("index", i);
				funcMap[item.key] = {
					check: item.check,
					leave: item.leave,
					active: item.active
				};
			}
		}
	},

	/**
	 * beforeLayout中已经设置了各个面板的el
	 */
	isValidParent : function(c, target) {
		return true;
	}
});
YIUI.layout['WizardLayout'] = YIUI.layout.Wizardlayout;