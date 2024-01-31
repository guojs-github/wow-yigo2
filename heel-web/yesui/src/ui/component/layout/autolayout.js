"use strict";
// layout的命名空间
YIUI.layout = {};
/**
 * 默认布局方式，所有其他布局类的父类。
 * 只是单纯的把每个控件渲染到界面上，不提供位置等信息。
 */
YIUI.layout.AutoLayout = YIUI.extend({

	/**
	 * 是否已经做过layoutRender，避免重复
	 */
	prepared: false,
	
	init : function(options) {
		$.extend(this, options);
	},
	/** 重新布局子组件的位置 */
	layout: function(panelWidth, panelHeight) {
		panelHeight -= this.getPlaceholderHeight();
		panelWidth -= this.getPlaceholderWidth();
		var ct = this.container,
			items = ct.items,
			item;
		for(var i=0,len=items.length;i<len;i++) {
			item = items[i];
			var itemWidth = $.getReal("100%",panelWidth), itemHeight;
			if(item.height == -1) {
				itemHeight = item.getHeight();
			} else {
				itemHeight = $.getReal(item.height, panelHeight);
			}
			item.setWidth(itemWidth);
			item.setHeight(itemHeight);
			if(item.hasLayout) {
				item.doLayout(item.getWidth(), item.getHeight());
			}
		}
	},

	/** 此方法为调用接口，完成此layout的所有工作 */
    render : function() {
		var target = this.container.getRenderTarget();
		if(!this.prepared) {
			this.prepared = true;
			this.layoutRender();
		}
		this.onRender(this.container, target);
		this.afterRender();
    },

    // private
    onRender : function(ct, target){
        this.renderChildren(ct, target);
    },

	/**
	 * 此方法中做一些render前的准备工作，比如为renderChildren提供ItemTarget
	 * 在子类中，如果需要定义各个元素的位置、大小、显示样式，需要新建div，并设置：comp.el = new_div
	 * 例如BorderLayout、TabsLayout
	 */
	layoutRender : function() {
		var ct = this.container,
		target = ct.getRenderTarget();
		var items = ct.items,
		item;
		
		var _div;
		for (var i = 0; i < items.length; i++) {
			item = items[i];
			if( !item.extend ) {
                _div = $("<div></div>").appendTo(target);
				item.container = _div;
			}
		}
		
	},

	/**
	 * 此方法中做一些render后的工作，通常是做各区域的宽高设置。
	 */
	afterRender : $.noop,

    /** 检查控件c是否可以渲染到target中 */
    isValidParent : function(c, target){
        return target && c.getOuterEl().parent()[0] == target[0];
    },

    /** 渲染container中的所有控件 */
    renderChildren : function(ct, target){
        var items = ct.items;
        for(var i = 0, len = items.length; i < len; i++) {
            var c = items[i],
				itemTarget = this.getItemTarget(c, i);
            if(c && (!c.rendered/* || !this.isValidParent(c, itemTarget)*/)){
                this.renderItem(c, itemTarget);
            }
        }
    },

	/**
	 * 返回控件comp即将被render到的dom
	 * @param comp
	 * @param index comp在items中的index
	 */
	getItemTarget : function(comp, index) {
		return comp.container || this.container.getRenderTarget();
	},

    /** 把控件c渲染到target中 */
    renderItem : function(c, target){
        if(c && !c.rendered){
            c.doRender(target);
        } else if(c && !this.isValidParent(c, target)){
            target.insertBefore(c.getEl());
            c.container = target;
        }
    },

    /** 设置此layout的container */
    setContainer : function(ct){
        this.container = ct;
    },

	/** 某些layout可能只有一个item是显示的，比如tabs */
	setActiveItem : function(item) {

	},
	
	/** 返回layout需要的所有占位符的宽度 */
	getPlaceholderWidth : function() {
		var ct = this.container;
		var width = 0;
		width = parseInt(ct.leftPadding || ct.padding || 0) + parseInt(ct.rightPadding || ct.padding || 0);
		var el = ct.el;
		if(ct.visible && el.height() < el[0].scrollHeight && ct.overflowY.equalsIgnoreCase("auto"))  {
			width += el.outerWidth() - el[0].clientWidth;
		}
		return width;
	},
	
	/** 返回layout需要的所有占位符的高度 */
	getPlaceholderHeight : function() {
		var ct = this.container;
		var height = 0;
		height = parseInt(ct.topPadding || ct.padding || 0) + parseInt(ct.bottomPadding || ct.padding || 0);
		var el = ct.el;
		if(ct.visible && el.width() < el[0].scrollWidth && ct.overflowX.equalsIgnoreCase("auto"))  {
			height += el.outerHeight() - el[0].clientHeight;
		}
		return height;
	}
});
YIUI.layout['auto'] = YIUI.layout.AutoLayout;
YIUI.layout['flow'] = YIUI.layout.AutoLayout;