/**
 * 所有容器组件的基础类
 * json样式：
 * {
 * 		layout : 'border',
 * 		width : 600,
 * 		height : 480,
 * 		items : [{
 *  		type : 'label',
 *  		text : 'Hello world!'
 * 		}, ...]
 * }
 */
"use strict";
YIUI.Panel = YIUI.extend(YIUI.Component, {
	/** 如果items未定义type，默认为component */
	defaultType : 'component',
	/** 容器中子控件布局方式 */
	layout : 'auto',

	overflowX: 'visible',

	overflowY: 'visible',

	backImage: '',

	backImagePosition: '',

	isBackImageRepeatX: false,

	isBackImageRepeatY: false,

	/** 布局所需参数 */
	/** layoutConfig : null, */
	/** 面板显示的html，如果定义了html，忽略items和layout */
	/** html : null, */
	/** init方法中，递归初始化所有items */
	init : function(options) {
		this.base(options);
		var items = this.items;
		if(items) {
			delete this.items;
			this.add(items);
		}
	},
    
    setOnActive: function(onActive) {
    	this.onActive = onActive;
    	if(this.items && this.items.length > 0) {
    		for (var i = 0, len = this.items.length; i < len; i++) {
				var item = this.items[i];
				item.setOnActive(onActive);
			}
    	}
    },

    needClean:function(){
        return false;
    },

	isDataBinding: function() {
		return false;
	},

	build: function(form) {
		var rootpanel = form.getRoot();
		this.add(rootpanel);
		this.doRenderChildren();
		this.doLayout(this.el[0].clientWidth, this.el[0].clientHeight);
    	form.setContainer(this);
	},

    focus: function () {
        this.el.focus();
    },

	removeForm: function(form) {
		var rootpanel = form.getRoot();
		this.remove(rootpanel);
	},

	setOverflowX: function(overflowX) {
		if(overflowX.toLowerCase() != "visible") {
			this.overflowX = overflowX;
			this.el.css("overflow-x", overflowX.toLowerCase());
		}
	},

	setOverflowY: function(overflowY) {
		if(overflowY.toLowerCase() != "visible") {
			this.overflowY = overflowY;
			this.el.css("overflow-y", overflowY.toLowerCase());
		}
	},

	setBackImage: function(backImage) {
		this.backImage = backImage;
		var _el = this.el;
    	this.getImageBase64URL(backImage).then(function(url) {
    		_el.css({backgroundImage: "url("+ url +")"});
        });
	},

	setLeftMargin: function(leftMargin) {
		this.leftMargin = leftMargin;
		this.el && this.el.css("margin-left", leftMargin);
	},

	setRightMargin: function(rightMargin) {
		this.el.css("margin-right", rightMargin);
	},

	setTopMargin: function(topMargin) {
		this.topMargin = topMargin;
		this.el && this.el.css("margin-top", topMargin);
	},

	setBottomMargin: function(bottomMargin) {
		this.el.css("margin-bottom", bottomMargin);
	},

	setBackImagePosition: function(backImagePosition) {
		this.backImagePosition = backImagePosition;
		switch(backImagePosition) {
			case "top":
				this.el.css("background-position", "top left");
				break;
			case "bottom":
				this.el.css("background-position", "bottom left");
				break;
			case "left":
				this.el.css("background-position", "center left");
				break;
			case "right":
				this.el.css("background-position", "center right");
				break;
			case "center":
				this.el.css("background-position", "center center");
				break;
		}
		this.el.css("background-position", backImagePosition);
	},

	setBackImageRepeatX: function(isBackImageRepeatX) {
		this.isBackImageRepeatX = isBackImageRepeatX;
		if(isBackImageRepeatX) {
			this.el.css("background-repeat", "repeat-x");
		}
	},

	setbackImageRepeatY: function(isBackImageRepeatY) {
		this.isBackImageRepeatY = isBackImageRepeatY;
		if(isBackImageRepeatY) {
			this.el.css("background-repeat", "repeat-y");
		}
	},

	/**
	 * 添加控件
	 * 如果面板渲染完成后，需要添加控件，调用方式：
	 *  panel.add(comp);
	 *  panel.doLayout();
	 * @param comp 可以是单个控件或控件数组
	 */
	add : function(comp) {
		this.initItems();
		if(this.beforeAdd(comp) !== false) {
			if($.isArray(comp)) {
				var _this = this;
				$.each(comp, function(i) {
					_this.add(this);
				});
				return;
			}
			if(this.get(comp.id)) return;

			var c = this.lookupComponent(comp);
			this.items.push(c);
			c.ownerCt = this;
			this.afterAdd(c);
		}
	},
	beforeAdd : $.noop,
	afterAdd : $.noop,
	
	reduceVisible : $.noop,

    changeCaption : $.noop,

	/**
	 * 获取某个item
	 * @param comp 可能是控件id， 也可能是控件在items中的index
	 */
	get : function(comp) {
		if($.isNumeric(comp)) {
			return this.items[comp];
		} else if($.isString(comp)) {
			var items = this.items,
				item;
			for(var i= 0,len=items.length;i<len;i++) {
				item = items[i];
				if(item && (item.id === comp || item.key === comp)) {
					return item;
				}
			}
		}
		return null;
	},

	/**
	 * 控件在items中的位置
	 * @param comp
	 */
	indexOf : function(comp) {
		var items = this.items;
		for(var i= 0,len=items.length;i<len;i++) {
			if(items[i] === comp) {
				return i;
			}
		}
		return -1;
	},

	/**
	 * 从面板中删除控件
	 * @param comp 将要删除的控件
	 * @param autoDestroy 是否要销毁控件，如果此参数不提供，默认为销毁
	 */
	remove : function(comp, autoDestroy) {
		var index = this.indexOf(comp);
		if(index === -1) {
			// 控件不在面板中
			return;
		}

		// 如果不需要销毁，就只是删除DOM
		if(autoDestroy === false) {
			comp.getEl().remove();
		} else {
			comp.destroy();
		}
		this.items.splice(index, 1);
		return comp;
	},

	/**
	 * 根据传入参数，返回对应的控件
	 * @param comp 可能是控件id，或者json对象
	 * @returns YIUI.Component 如果参数是string，则将其作为控件id，返回已有的控件；
	 *                          如果参数是json，则根据此json创建控件。
	 */
	lookupComponent : function(comp) {
		if($.isString(comp)) {
			return YIUI.ComponentMgr.get(comp);
		} else if(!(comp instanceof YIUI.Component)) {
			return YIUI.create(comp, this.defaultType);
		}
		return comp;
	},
	/**
	 * 重新布局子组件位置
	*/
	doLayout: function(panelWidth, panelHeight) {
		if ( this.layout ) {
//			if(this.layouted) {
//				if(this.height == "pref") {
//					return;
//				}
//			} else {
//				this.layouted = true;
//			}
			this.layout.layout(panelWidth, panelHeight);
		}
	},
	
	/**
	 * 渲染所有的子组件
	*/
	onRenderChildren: function() {
		if(this.html) {
			this.el.html(this.html);
		} else {
			this.getOuterEl().addClass('ui-pnl');
			if($.isObject(this.layout) && !this.layout.layout){
				this.layoutConfig = this.layout;
				this.layout = this.layoutConfig.type;
			}
			if($.isString(this.layout)){
				// 默认布局时，默认按流式布局换行
				if(this.layout == 'auto' || this.layout == 'flow') {
					this.el.css('white-space', 'normal');
				}
				this.layout = new YIUI.layout[this.layout](this.layoutConfig);
			}
			this.setLayout(this.layout);
			if(this.activeItem !== undefined){
				var item = this.activeItem;
				delete this.activeItem;
				this.layout.setActiveItem(item);
			}

			this.doRenderChildren(false, true);
		}
	},
	setTip: $.noop,
	/**
	 * 容器渲染完成后(只是容器的外观、大小等，不包括容器中子控件的渲染)，根据layout属性完成所有子控件的渲染，如果子控件也是panel，
	 * 则递归进行render和layout
	 */
	afterRender: function(){
		this.base();
//        this.setBox();
		
		this.overflowX && this.setOverflowX(this.overflowX);
		this.overflowY && this.setOverflowY(this.overflowY);
		
		this.backImage && this.setBackImage(this.backImage);
		this.backImagePosition && this.setBackImagePosition(this.backImagePosition);
		this.isBackImageRepeatX && this.setBackImageRepeatX(this.isBackImageRepeatX);
		this.isBackImageRepeatY && this.setbackImageRepeatY(this.isBackImageRepeatY);
		this.leftMargin && this.setLeftMargin(this.leftMargin);
		this.rightMargin && this.setRightMargin(this.rightMargin);
		this.topMargin && this.setTopMargin(this.topMargin);
		this.bottomMargin && this.setBottomMargin(this.bottomMargin);
		this.width && this.setWidth(this.width);
		this.height && this.setHeight(this.height);
	},
	/** 设置本布局方式 */
	setLayout : function(layout){
		if(this.layout && this.layout != layout){
			this.layout.setContainer(null);
		}
		this.layout = layout;
		this.initItems();
		layout.setContainer(this);
	},
	/** 确保包含items */
	initItems : function(){
		if(!this.items){
			this.items = [];
		}
	},
	/** doRenderChildren之前所需，如果需要，在子类中继承 */
	beforeDoRenderChildren : $.noop ,
	/** doRenderChildren之后所需，如果需要，在子类中继承 */
	afterDoRenderChildren : $.noop,
	/**
	 * 容器渲染完成后，所有子控件的render和layout
	 * @param shallow 如果是true，不做子控件的doLayout，只做最外层的
	 * @param force 如果是true，当容器不显示在界面上的时候，也强制执行layout
	 */
	doRenderChildren: function(shallow, force){
		if(!this.html && this.beforeDoRenderChildren() !== false) {
			var rendered = this.rendered;
			var forceLayout = force /*|| this.forceLayout*/;
			if(!this.canLayout() || this.collapsed){
				this.deferLayout = this.deferLayout || !shallow;
				if(!forceLayout){
					return;
				}
				shallow = shallow && !this.deferLayout;
			} else {
				delete this.deferLayout;
			}
			if(rendered && this.layout){
				this.layout.render();
			}
//			if(shallow != true && this.items) {
//				var cs = this.items;
//				for (var i = 0, len = cs.length; i < len; i++) {
//					var c = cs[i];
//					if(c.doRenderChildren){
//						c.doRenderChildren(false, forceLayout);
//					}
//				}
//			}
			if(rendered){
				this.afterDoRenderChildren(shallow, forceLayout);
			}
			// Initial layout completed
			this.hasLayout = true;
//			delete this.forceLayout;
		}
	},

	/** 当前容器是否可以进行layout */
	canLayout: function() {
		var el = this.getEl();
		return el && el.css("display") != "none";
	},
	/** 返回jQuery对象 */
	getRenderTarget : function(){
		return this.getEl();
	},

	/**
	 * 返回容器中可以容纳子组件的宽度，用于计算子组件的比例宽度。
	 */
	getValidWidth : function() {
		return this.el.width()/* - this.layout.getPlaceholderWidth()*/;
	},

	/**
	 * 返回容器中可以容纳子组件的高度，用于计算子组件的比例高度。
	 */
	getValidHeight : function() {
		if(this.ownerCt && this.ownerCt.type == YIUI.CONTROLTYPE.TABPANEL) {
			return this.ownerCt.el.height() - $('.ui-tabs-nav', this.ownerCt.getEl()).outerHeight(true) - this.getToolBarHeight() - this.layout.getPlaceholderHeight();
		}
		if(this.type == YIUI.CONTROLTYPE.TABPANEL) {
			return $('.ui-tabs-body', this.getEl()).height() - this.getToolBarHeight() - this.layout.getPlaceholderHeight();
		}

		// 如果没设置过高度，那取现在的高度再去计算子元素的高度也没有意义
		if(!this.height || this.height <= 0) return 0;

		return this.el.height() - this.getToolBarHeight()/* - this.layout.getPlaceholderHeight()*/;
	},

	getToolBarHeight : function() {
		var height = 0;
		$.each(this.items, function(i, item) {
			if(item.type == YIUI.CONTROLTYPE.TOOLBAR) {
				height = item.getHeight();
				return false;
			}
		});
		return height;
	},

	/**
	 * 先destroy所有items
	 */
	beforeDestroy : function() {
		var items = this.items;
		if(items) {
			for(var i=items.length-1;i>=0;i--) {
				items[i].destroy();
				delete items[i];
			}
		}
		delete this.items;

		this.base();
	},

    /**
     * 获取面板宽度。
     * @return Number。
     */
    getWidth: function () {
        if (this.rendered) {
        	return this.getOuterEl().outerWidth();
        }
        return this.width;
    },
    /**
     * 获取面板高度。
     * @return Number。
     */
    getHeight: function () {
        if (this.rendered) {
        	return this.getOuterEl().outerHeight();
        }
        return this.height;
    },
	
    setVisible: function(visible){
        this.needRender = visible;
        this.base(visible);
    },

	needTip: function() {
		return false;
	},

    reLayout: $.noop
});
YIUI.reg('panel', YIUI.Panel);
YIUI.reg('body', YIUI.Panel);