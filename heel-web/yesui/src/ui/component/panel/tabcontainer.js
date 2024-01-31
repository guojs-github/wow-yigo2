/**
 * TabContainer
 * 以TAB页为显示形式的单据容器，单据为Form
 */
YIUI.Panel.TabContainer = YIUI.extend(YIUI.Panel, {

    /**
     * 使用tab布局
     */
    layout: 'tab',

    /**
     * TAB title模板
     */
    tabTemplate: '<li><a href="#{href}"><label style="float: left;">#{title}</label><span class="ui-icon ui-icon-close" role="presentation">Remove Tab</span></a></li>',
    
    /**
     * 默认显示的TAB页的index
     */
    activeTab : -1,
    
    selectedTab: null,

    _hasShow : false,
    
    listeners : {
    	//点击关闭图标
    	closetab : function(e) {

	        var target = $(e.target);
	        var itemId = target.closest('li').attr('aria-controls');
    		YIUI.EventHandler.doCloseForm(this.get(itemId));
	    }

    },
    
    /** 关闭tab页 */
    close: function(compID) {
    	var _index = $("[aria-controls="+compID+"]").index();
    	if((this.activeTab == _index && this.activeTab != 0) || _index < this.activeTab) {
        	this.activeTab -= 1;
    	}
        this.remove(this.get(compID));
    },
    
    /**
     * 添加面板时，如果已渲染，添加header和body
     */
    afterAdd: function(comp) {
        if (!this.rendered) return;
        var title = comp.abbrCaption || '',
            id = comp.id || YIUI.allotId(),
            li = $(this.tabTemplate.replace(/#\{href\}/g, "#" + id).replace(/#\{title\}/g, title)),
            tabs = this.getEl(),
	        head = $("ul.ui-tabs-nav", tabs.children(".ui-tabs-header")),
	        body = tabs.children(".ui-tabs-body");
        $("[href='#"+id+"']", li).addClass("ui-tans-anchor").attr("role", "presentation");
        $("[href='#"+id+"'] label", li).addClass("ui-anchor-label");
        li.data("key", this.key);
        head.append(li);
        comp.el = $('<div id='+ id +'></div>').appendTo(body);
        comp.el.addClass("ui-tabs-tabcontainer ui-widget-content ui-corner-bottom").toggleClass("aria-show")
			.attr("role", "tabpanel");
        
        li.addClass("ui-state-default ui-tabcontainer").attr("role", "tab").toggleClass("aria-selected").attr("aria-controls", comp.id);
       
        if(this.selectedTab) {
        	this.selectedTab.toggleClass("aria-selected");
        	$("#"+this.selectedTab.attr("aria-controls")).toggleClass("aria-show");
        }
        this.setActiveTab(comp);
        this.layout.layout(this.getWidth(), this.getHeight());
        this.selectedTab = li;
       
        var _li = $("<li/>").attr("aria-controls", li.attr("aria-controls")).html($("label", li).text());
    	$("ul", this._dropView).append(_li);
    	
    	this.setDropBtnView();
    	this.setTabListColor();
    },
    
    /** 设置下拉列表的向上向左的偏移 */
    setDropViewLeft: function() {
    	this._dropView.css({
    		"top": this._dropBtn.offset().top + this._dropBtn.height(),
    		"left": document.body.clientWidth - this._dropView.outerWidth() - 30
		});
    },

    /** 设置当前需要显示的tab页
     * @param li: 需要显示的tab页
     */
    setSelectedTab: function(li) {
		if(!this.selectedTab || this.selectedTab.attr("aria-controls") == li.attr("aria-controls")) {
			return;
		} else {
			li.toggleClass("aria-selected");
			this.selectedTab.toggleClass("aria-selected");
			$("#" + this.selectedTab.attr("aria-controls")).toggleClass("aria-show");
		}
		
		var tab = this.get(li.attr('aria-controls'));
		$("#"+tab.id).toggleClass("aria-show");
		this.setActiveTab(tab);
		this.layout.layout(this.getWidth(), this.getHeight());
		this.selectedTab = li;
		
		var scrollLeft = li.position().left - $(".ui-tabs-header", this.el).width() + li.width();
		$(".ui-tabs-header", this.el).scrollLeft(scrollLeft < 0 ? 0 : scrollLeft);
    	this.setTabListColor();
    	
    },
    
    /** 设置点击下拉列表的按钮是否显示 */
    setDropBtnView: function() {
    	var li = $(".ui-tabs-header li", this.el).last();
        if(li.length == 0 || !this.selectedTab) return;
        if(li.position().left + li.width() <= $(".ui-tabs-header", this.el).width()) {
        	this._dropBtn.removeClass("show");
        }
        li = this.selectedTab;
        if(li.position().left + li.width() > $(".ui-tabs-header", this.el).width()) {
        	if(!this._dropBtn.hasClass("show")) {
        		this._dropBtn.addClass("show");
        	}
        	$(".ui-tabs-header", this.el).scrollLeft(li.position().left - $(".ui-tabs-header", this.el).width() + li.width());
        }
    },
    
    /** 设置列表中tab项显示与被隐藏项的样式区别 */
    setTabListColor: function() {
    	var _left = $(".ui-tabs-header", this.el).offset().left;
    	var _childs = $(".ui-tabs-header li", this.el), _child, selectedLi;
    	for (var i = 0, len = _childs.length; i < len; i++) {
    		_child = _childs.eq(i);
    		selectedLi = $("li[aria-controls = "+ _child.attr("aria-controls") +"]", this._dropView);
    		if(_child.offset().left >= _left && _child.offset().left <= _left + $(".ui-tabs-header", this.el).width() ) {
    			selectedLi.addClass("lightColor");
    		} else {
    			selectedLi.removeClass("lightColor");
    		}
		}
    },
    
    /**
     * 添加事件
     */
    install: function() {
        var _this = this;
        $(".ui-tabs-header", _this.el).delegate("li", "click", function(event) {
        	var target = $(event.target);
        	if(target.hasClass('ui-icon-close')) {
        		_this.fireEvent('closetab', event);
        	} else if(target.hasClass('ui-anchor-label') || target.hasClass('ui-tans-anchor')) {
            	_this.setSelectedTab(target.closest('li'));
        	}
        	event.stopPropagation();
        	return false;
        });
        
        _this._dropBtn.click(function(event) {
        	if(!$(this).hasClass("show")) return;
        	if(_this._hasShow){
	            _this.hideTabList();
		        _this._dropView.removeClass("showList");
	            return;
	        } else {
		        _this._dropView.addClass("showList");
	        }
	        _this.setDropViewLeft();
		    _this._dropView.slideDown("fast");
	        _this._dropView.css( "z-index", $.getZindex( _this._dropBtn ) + 1 );
	        
	        $(document).on("mousedown",function(e){
	            var target = $(e.target);
	            if((target.closest(_this._dropView).length == 0)
	                &&(target.closest(_this._dropBtn).length == 0)){
	                _this.hideTabList();
	                _this._dropView.removeClass("showList");
	            }
	        });
	
	        _this._hasShow = true;
	        event.stopPropagation();
        });
        $("ul", _this._dropView).delegate("li", "click", function(event) {
        	var aria_controls = $(this).attr("aria-controls");
        	var _li = $("li[aria-controls = " + aria_controls + "]", _this.el);
        	_this.setSelectedTab(_li);
        	_this.hideTabList();
        });
    },
    
    /** 隐藏下拉列表 */
    hideTabList: function() {
    	this._dropView.hide();
        this._hasShow = false;
    },

    /**
     * 删除面板
     */
    remove: function (comp, autoDestroy) {
        var id = comp.getId();
        var formId = comp.ofFormID;
        comp = this.base(comp, autoDestroy);
        if (!comp) return;

        var tabs = this.getEl();
        YIUI.FormStack.removeForm(formId);
        $('#' + id, tabs).remove();
        $('[aria-controls=' + id + ']', tabs).remove();
        
        $("li[aria-controls="+id+"]", this._dropView).remove();
        
//        var li = $(".ui-tabs-header li", this.el).last();
//        if(li.position().left + li.width() <= $(".ui-tabs-header", tabs).width()) {
//        	this._dropBtn.removeClass("show");
//        }
        
        this.setDropBtnView();
        
        var tab;
        if($(".ui-tabs-body", tabs).children().length <= 0) {
        	this.activeTab = -1;
        	return;
        } else {
        	tab = this.items[this.activeTab];
        }
        if(this.selectedTab && this.selectedTab.attr("aria-controls") == id) {
        	tab.el.toggleClass("aria-show");
            $("li[aria-controls = "+tab.id+"]").toggleClass("aria-selected");
        }
        this.selectedTab = $("li[aria-controls = "+tab.id+"]");
		this.layout.layout(this.getWidth(), this.getHeight());
        
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
    			if(tab == this.items[i].getId()) {
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
YIUI.reg('tabcontainer', YIUI.Panel.TabContainer);