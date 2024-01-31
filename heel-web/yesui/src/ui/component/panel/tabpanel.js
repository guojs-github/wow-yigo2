/**
 * TAB页面板
 */
"use strict";
YIUI.Panel.TabPanel = YIUI.extend(YIUI.Panel, {

    /**
     * 使用tabs布局
     */
    layout: 'TabLayout',

    /**
     * TAB title模板
     */
    tabTemplate: '<li><a href="#{href}"><label>#{title}</label></a></li>',
    
    /**
     * 默认显示的TAB页的index
     */
    activeTab : -1,
    
    selectedTab: null,
    
	height: "100%",
	
	tabPosition: YIUI.DirectionType.TOP,
	
	setTabPosition: function(tabPosition) {
		this.tabPosition = tabPosition;
	},
    
    onRender: function(ct) {
    	this.base(ct);
    	this.el.addClass("ui-tabpnl");
    	this.tabPosition && this.setTabPosition(this.tabPosition);
    	if(this.height == "pref") {
    		this.height = "100%";
		}

		this._head = $("<div class='tab-head'><div class='list'><ul class='ui-tabs-nav tab-list'/></div><span class='btn'></span></div>").appendTo(this.el);
		this._dropView = $("<div class='drop-view'></div>").appendTo(this.el);
	},

	addListitem: function() {
		var _childs = $("li", this._head), _child, selectedLi;
		var _ul = $("<ul/>");
		switch(this.tabPosition) {
			case YIUI.DirectionType.TOP:
			case YIUI.DirectionType.BOTTOM:
			var _left = this._head.offset().left;
			for (var i = 0, len = _childs.length; i < len; i++) {
				_child = _childs.eq(i);
				if(_child.is(":hidden")) continue;
				var left =  _child.offset().left;
				if(!(left >= _left && left + _child.outerWidth() <= _left + this._head.width() )) {
					var _li = $("<li></li>");
					_child.attr("aria-controls");
					_li.html($("label", _child).html());
					_li.attr("aria-controls", _child.attr("aria-controls"));
					_li.appendTo(_ul);
				}
			}
			break;
			case YIUI.DirectionType.LEFT:
			case YIUI.DirectionType.RIGHT:
			var _top = this._head.offset().top;
			for (var i = 0, len = _childs.length; i < len; i++) {
				_child = _childs.eq(i);
				var top =  _child.offset().top;
				if(!(top >= _top && top + _child.outerWidth() <= _top + this._head.width() )) {
					var _li = $("<li></li>");
					_child.attr("aria-controls");
					_li.html($("label", _child).html());
					_li.attr("aria-controls", _child.attr("aria-controls"));
					_li.appendTo(_ul);
				}
			}
			break;
		}
		this._dropView.html(_ul);
	},

	hideDropList: function() {
		this._dropView.removeClass("show");
		this._hasShow = false;
	},
    
    /**
     * 添加面板时，如果已渲染，添加head和body
     */
    afterAdd: function (comp) {
        if (!this.rendered) return;

        var title = comp.title || item.caption,
            id = comp.id || YIUI.allotId(),
			tabID = "tab_" + id,
            li = $(this.tabTemplate.replace(/#\{href\}/g, "#" + tabID).replace(/#\{title\}/g, title)),
            tabs = this.getEl(),
	        head = tabs.children(".ui-tabs-nav"),
	        body = tabs.children(".tab-body");
        $("[href='#"+tabID+"']", li).addClass("ui-tans-anchor").attr("role", "presentation");
        $("[href='#"+tabID+"'] label", li).addClass("ui-anchor-label");
        head.append(li);
        var _div = $('<div id='+ tabID +'></div>').appendTo(body);
        comp.el.appendTo(_div);
        _div.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").toggleClass("aria-show")
			.attr("role", "tabpanel");
        
        li.addClass("ui-state-default ui-corner-top").toggleClass("aria-selected")
        	.attr("aria-controls", tabID);
        
        if(this.selectedTab) {
        	this.selectedTab.toggleClass("aria-selected");
        	$("#"+this.selectedTab.attr("aria-controls")).toggleClass("aria-show");
        }
        this.setActiveTab(comp);
        this.layout.layout(this.getWidth(), this.getHeight());
        this.selectedTab = li;
    },

    changeCaption: function (comp) {
        if(!this.el) return;

        var found = false,i,len;
        for (i = 0, len = this.items.length; i < len; i++) {
            if ( this.items[i] == comp ) {
                found = true;
                break;
            }
        }
        if( found ) {
            $("li:eq("+i+") label", this.el).attr("title",comp.caption).text(comp.caption);
		}
    },
    
    reduceVisible: function(visible, comp) {
    	if(!this.el) return;
    	var key = comp.key;
		var _li = $("[aria-controls='tab_"+ comp.id +"']", this.el);

        // 当前面板肯定包含component,不需要做多余检查

		if(visible) {
			var lis = $("li:not(':hidden')", this.el);
			if(lis.length == 0 && !this.el.is(":hidden")) {
				this.setTabSel($("a", _li));
			} 
			_li.show();
		} else {
			var id = _li.attr('aria-controls');
    		$("#"+id).removeClass("aria-show");
			_li.hide();
			
			if(this.selectedTab && (_li.attr("aria-controls") != this.selectedTab.attr("aria-controls"))) return;
			var $li_p = _li.prevAll().not(":hidden").last();
			var $li_n = _li.nextAll().not(":hidden").first();
			var $li_s = null;
			if($li_p.length > 0) {
				$li_s = $li_p;
			} else if($li_n.length > 0) {
				$li_s = $li_n;
			}
			if(!$li_s) {
                this.selectedTab = null;
                return;
            }
			this.setTabSel($("a", $li_s));
		}
    },

	impl_setTabSel: function ($sel_li, event) {
    	var _this = this,
        	tabID = $sel_li.attr('aria-controls');

        if(_this.selectedTab && _this.selectedTab.attr("aria-controls") == $sel_li.attr("aria-controls")) {
            if(event) {
                if(event.stopPropagation) {
                    event.stopPropagation();
                } else {
                    event.cancelBubble = true;
                }
            }
            return false;
        } else {
			if(!$sel_li.is(":hidden") && _this.selectedTab && _this.selectedTab.attr("aria-controls") != $sel_li.attr("aria-controls")) {
				_this.selectedTab.removeClass("aria-selected");
				$("#" + _this.selectedTab.attr("aria-controls")).removeClass("aria-show");
			}
			if(!$sel_li.hasClass("aria-selected")) {
				$sel_li.addClass("aria-selected");
			}

			$("#"+tabID).addClass("aria-show").show();
			_this.setActiveTab(tabID);
			_this.selectedTab = $sel_li;

            var form = YIUI.FormStack.getForm(_this.ofFormID);
            var cxt = new View.Context(form);
            var tab = _this.get(tabID.substr(4));
            if(!tab.rendered && tab.visible) {
                tab.needRender = true;
                tab.render();
            }
            var active = tab.active;
            if(active) {
                form.eval(active, cxt);
            }

            if(tab.rendered) {
                _this.layout.layout(_this.getWidth(), _this.getHeight());
            }
            if(_this.itemChanged) {
                form.eval(_this.itemChanged, cxt);
            }
        }
    },

	// 根据内部组件选择
    setTabSel2: function (com) {
    	var _this = this,
        	_li = $("[aria-controls='tab_"+ com.id +"']", _this._head);
        _this.impl_setTabSel(_li);
    },

	// 点击标题选择
    setTabSel: function(target, event) {
    	var _this = this;
    	if(target.hasClass('ui-anchor-label') || target.hasClass('ui-tans-anchor')) {
			_this.impl_setTabSel(target.closest('li'),event);
    	}
	},

    // com: tab页里面的根面板
    isActive: function (com) {
        return this.selectedTab.attr('aria-controls') == "tab_" + com.id;
    },

	setTabScroll: function() {
		var selTab = this.selectedTab;
		if(!selTab) return;
		var head = $(".list", this._head);
		var scrollLeft = 0;
		var isVertical = this.tabPosition == YIUI.DirectionType.LEFT || this.tabPosition == YIUI.DirectionType.RIGHT;
		if(!isVertical) {
			var diff_left = selTab.position().left - head.position().left;
			var reset = selTab.position().left < head.width() && diff_left < 0;
			if((selTab.position().left + selTab.width()) > head.width() || reset) {
				scrollLeft = selTab.position().left - head.width() + selTab.width();
			}
		} else {
			var diff_top = selTab.position().top - head.position().top;
			var reset = selTab.position().top < head.width() && diff_top < 0;
			if((selTab.position().top + selTab.width()) > head.width() || reset) {
				scrollLeft = selTab.position().top - head.width() + selTab.width();
			}
		}
		head.scrollLeft(scrollLeft);
	},
	setViewPos: function() {
		var view = this._dropView;
		var btn = $(".btn", this._head);
		var offset = btn.offset();
		switch(this.tabPosition) {
			case YIUI.DirectionType.TOP:
			view.css({
				top: offset.top + this._head.outerHeight(),
				left: offset.left + btn.outerWidth() - view.outerWidth()
			});
			break;
			case YIUI.DirectionType.BOTTOM:
			view.css({
				top: offset.top - view.outerHeight(),
				left: offset.left + btn.outerWidth() - view.outerWidth()
			});
			break;
			case YIUI.DirectionType.LEFT:
			view.css({
				top: offset.top - view.outerWidth(),
				left: offset.left + view.outerHeight()
			});
			break;
			case YIUI.DirectionType.RIGHT:
			view.css({
				top: offset.top - view.outerWidth() + btn.outerWidth(),
				left: offset.left - btn.outerHeight()
			});
			break;
		}
	},
    /**
     * 添加事件
     */
    install: function () {
        var _this = this;
        $("ul", _this._head).click(function(event) {
        	var target = $(event.target);
        	_this.setTabSel(target, event);
        	event.stopPropagation();
        	return false;
		});
		$(".btn", _this._head).click(function(event) {
			if(!$(this).hasClass("show")) return;
			if(_this._hasShow){
				_this.hideDropList();
				_this._dropView.removeClass("show");
				return;
			} else {
				_this._dropView.addClass("show");
			}
			_this.addListitem();
			
			_this.setViewPos();
			
			$(document).off("mousedown").on("mousedown",function (e) {
				var target = $(e.target);
				if((target.closest(_this._dropView).length == 0)
					&&(target.closest($(".btn", _this._head)).length == 0)){
					_this.hideDropList();
					_this._dropView.removeClass("showList");
					$(document).off("mousedown");
				}
			});

			_this._hasShow = true;
			event.stopPropagation();
		});
		_this._dropView.delegate("li", "click", function(event) {
			var aria_controls = $(this).attr("aria-controls");
			var _li = $("li[aria-controls = " + aria_controls + "] a", _this._head);
			_this.setTabSel(_li);
			_this.hideDropList();
		});
	},
	
	/** 设置点击下拉列表的按钮是否显示 */
	setDropBtnVisible: function() {
		this._dropView.removeClass("show");
		$(".btn", this._head).removeClass("show");
		var head = $("li", this._head);
		var li = head.last();
		if(li.length == 0 || !this.selectedTab) return;
		if(((this.tabPosition == YIUI.DirectionType.TOP || this.tabPosition == YIUI.DirectionType.BOTTOM) && (li.position().left + li.width()) > this._head.width()) ||
			(this.tabPosition == YIUI.DirectionType.LEFT || this.tabPosition == YIUI.DirectionType.RIGHT) && (li.width() + li.position().top > this._head.width()) ||
			($(".list", this._head).scrollLeft() > 0)) {
			$(".btn", this._head).addClass("show");
		}
	},
    
    /**
     * 设置当前需要显示的TAB页
     * @param tab: 可以是TAB页的index、id、或TAB页的panel对象
     */
    setActiveTab : function(tab) {
    	var index = -1;
    	if($.isNumeric(tab)) {
    		if(tab < 0 && tab > this.items.length - 1) return;
    		index = tab;
    	} else if($.isString(tab)) {
    		for(var i=0;i<this.items.length;i++) {
    			if(tab == "tab_" + this.items[i].getId()) {
    				index = i;
    				break;
    			}
    		}
    	} else if($.isObject(tab)) {
    		for(var i=0;i<this.items.length;i++) {
    			if(tab == this.items[i]) {
    				index = i;
    				break;
    			}
    		}
    	} 
    	if(index != -1) {
    		if(this.activeTab != index) {
    			this.activeTab = index;
    		} 
    	}
    }
   
});
YIUI.reg('tabpanel', YIUI.Panel.TabPanel);