YIUI.ComponentMgr.eachType(function(typeName, type) {
	$.fn['ui.' + typeName] = function(options) {
		this.each(function() {
			var _options;
			//items  错误！！  子控件
			var items = [];
			var children;
			var form = YIUI.FormStack.getForm(options.formID); 
			if(typeName == "splitpanel") {
				children = $(this).children('.ui-split-item');
			} else if(typeName == "tabpanel") {
				children = $(this).find(".ui-tabs-body").children();
			} else if(typeName == "flexflowlayoutpanel") {
				children = $(this).children();
			}
			if(children) {
				for(i=0, len=children.length; i<len; i++){
					var opt = $.extend({
						el: children.eq(i),
						id: children[i].id,
						tagName: children.eq(i).children().attr("xtype"),
						getId: function() {
							return this.id;
						}
					}, null);
					items.push(opt);
				}
			}
			var comp = null;
			if(typeName.indexOf("panel") != -1) {
				var layout = "";
				if(typeName == "tabpanel" || typeName == "tabpanelex") {
					layout = "tablayout";
				} else if(typeName == "flowlayoutpanel" || typeName == "treepanel") {
					layout = "auto";
				} else if(typeName == "flexflowlayoutpanel") {
					layout = "flexflowlayout";
				} else if(typeName == "borderlayoutpanel") {
					layout = "borderlayout";
				} else if(typeName == "columnlayoutpanel") {
					layout = "columnlayout";
				} else if(typeName == "fluidcolumnlayoutpanel") {
					layout = "fluidlayout";
				} else if(typeName == "fluidtablelayoutpanel") {
					layout = "fluidtablelayout";
				} else if(typeName == "gridlayoutpanel") {
					layout = "gridlayout";
				} else if(typeName == "splitpanel") {
					layout = "splitlayout";
				}
				
				_options = $.extend({
					el : $(this),
					tagName: typeName,
					ofFormID: options.formID,
					container : $(this).parent(),
					layout : new YIUI.layout[layout]
//					items : items
				}, options);
				

				comp = new type(_options);
				comp.setLayout(comp.layout);
				comp.hasLayout = true;
				
			} else {           //container
				_options = $.extend({
					el : $(this),
					tagName: typeName,
					ofFormID: options.formID,
					container : $(this).parent()
				}, options);
				comp = new type(_options);
			}
//			comp.rendered = true;
			if($(this)[typeName]) {
				$(this)[typeName].call($(this));
			}
			var parent = null;
			var pDom = $(this).parents("[xtype]");
			if(pDom.length > 0) {
				parent = form.getComponent(pDom.data().key);
			}
			if(parent) {
				parent.add(comp);
			}
			if(!form.getRoot()) {
				form.setRootPanel(comp);
			}
			form.addComponent(comp);
			comp.initDefaultValue(_options);
//			comp.install();
		});
	};
});
