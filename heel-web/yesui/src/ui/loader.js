(function($, undefined) {
	/**
	 * 根据HTML逆向生成组件结构
	 * @param context DOM节点的jQuery封装
	 * @returns 最外层组件的数组，其他的组件都在最外层组件的items中
	 */
	YIUI.loadComponents = function(context) {
		if(!context) return;
		
		var els = $('[xtype]', context);
		var components = [];
		els.each(function() {
			var el = $(this),
				id = el.attr('id'),
				_options = el.attr('options'),
				options = parseOptions(_options);
			
			if(!id) {
				id = YIUI.allotId();
				el.attr('id', id);
			}
			var config = {
				id : id,
				type : el.attr('xtype'),
				el : el
			};
			
			// 对各种控件特殊处理
			var xtype = config.type;
			if(xtype == 'htmlelement') {
				var tagName = el[0].tagName.toLowerCase();
				config.autoEl = '<' + tagName + '></' + tagName + '>';
				if(tagName == 'a') {
					config.text = el.html();
					//?????
				}
			} else if(xtype == YIUI.CONTROLTYPE.MENUBAR) {
				config.items = loadMenuItems(el.children()[0]);
			} else if(xtype == YIUI.CONTROLTYPE.GRIDLAYOUTPANEL) {
				options.widths = options.widths.substring(1, options.widths.length - 1).split(',');
				options.heights = options.heights.substring(1, options.heights.length - 1).split(',');
			} else if(xtype ==  YIUI.CONTROLTYPE.TREEMENUBAR) {
				var nodes = [];
				loadTreeMenuBarNodes(el.children()[0], nodes, 0);
				config.nodes = nodes;
			} 
			$.extend(config, options);
			YIUI.create(config, 'component');
		});
		
		var all = YIUI.ComponentMgr.all,
			topComponents = [];
		for(var i in all) {
			if(all[i].el) {
				var component = all[i],
					id = component.id,
					el = component.el,
					ownerId = el.parents('[xtype]').attr('id');
				if(ownerId) {
					var owner = YIUI.get(ownerId);
					owner.add(component);
				} else {
					// 没有parent，是最外层组件
					topComponents.push(component);
				}
				// TODO 解除引用el？？
				delete component.el;
			}
		};
		
		return topComponents;
	};
	
	function parseOptions(optionsStr) {
		var _options = optionsStr.substring(0, optionsStr.length - 1);
		// 给options的key和value加双引号，变为json格式
		_options = '{"' + _options.replace(/#/g, '":"').replace(/;/g, '","') + '"}';
		var options = JSON.parse(_options);
		
		return options;
	}
	
	function loadMenuItems(ul) {
		if(!ul) return;
		var items = [],
			children = ul.childNodes,
			item,
			tmp;
		for(var i=0,len=children.length;i<len;i++) {
			tmp = children[i].childNodes;
			item = {
				text : tmp[0].innerHTML
			};
			if(tmp[1]) {
				item.items = loadMenuItems(tmp[1]);
			}
			items.push(item);
		}
		return items;
	}
	
	function loadTreeMenuBarNodes(ul, nodes, parentId) {
		if(!ul || ul.childNodes.length == 0) return;
		var items = [],
			children = ul.childNodes,
			item,
			tmp,
			options;
		for(var i=0,len=children.length;i<len;i++) {
			if(!children[i].tagName) continue;
			
			tmp = children[i].childNodes;
			options = parseOptions($(children[i]).attr('options'));
			item = {
				name : $(tmp[0]).html(),
				id : options.key,
				pId : parentId
			};
			nodes.push(item);
			if(tmp[1]) {
				loadTreeMenuBarNodes(tmp[1], nodes, item.id);
			}
		}
	}
	
})(jQuery);
