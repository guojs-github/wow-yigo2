
YIUI.Component.HtmlElement = YIUI.extend(YIUI.Component, {
	
	add : function(comp) {
		if(!this.items) {
			this.items = [];
		}
		
		if($.isArray(comp)) {
			var _this = this;
			$.each(comp, function(i) {
				_this.add(this);
			});
			return;
		}

		var c = YIUI.Panel.prototype.lookupComponent.call(this, comp);
		this.items.push(c);
	},
	
	onRender : function(ct) {
		this.base(ct);
		if(this.text) {
			this.el.html(this.text);
		} else if(this.items) {
			var el = this.el;
			$.each(this.items, function(index, item) {
				item.render(el);
			});
		}
	},
	
	afterRender : function() {
		if(this.text) {
			YIUI.Component.prototype.afterRender.call(this);
		} else {
			this.base();
		}
	}
});
YIUI.reg("htmlelement", YIUI.Component.HtmlElement);