/**
 * 所有组件的基础类。
 */
"use strict";
YIUI.Component = YIUI.extend({

    /**
     * String。
     * 组件id，系统中每个组件都有的一个唯一id，可通过此id找到组件：YIUI.get(id)。
     * 如果id未指定，会自动生成一个。
     */
    /** id : null, */

    /**
     * String。
     * 组件key，对应于配置中的key。
     * 对组件做任何操作时，都会用到key。
     */
    /** key : null, */

    /**
     * String。
     * 组件所属的Form的id。
     */
    /** formId : null, */

    /**
     * jQuery包装类型。
     * 控件的dom。
     */
    /** el : null, */

    /**
     * String。
     * render控件时，为控件自动创建的DOM标签。
     */
    autoEl: '<div></div>',

    /**
     * Boolean。
     * 是否可编辑。
     */
    editable: true,

    /**
     * 是否可用
     */
    enable: true,

    /**
     * Boolean。
     * 是否可见
     */
    visible: true,

    /**
     * Number。
     * 组件在面板中的位置。
     */
    /** top : -1, */
    /** left : -1, */

    /**
     * Number、百分比、auto。
     * 组件的宽度、高度。
     * Number: 像素值，固定大小；
     * 百分比: 相对于父组件的宽度、高度；
     * auto: 自适应大小。
     */
    width: -1,
    height: -1,

    /**
     * String。
     * 鼠标悬停时，显示的提示信息。
     */
    /** tip : null, */

    /**
     * Boolean。
     * 该组件是否必填。
     */
    required: false,

    /**
     * Object。
     * 组件上的CSS样式。
     * 例： format : {
	 * 		foreColor : 'red',
	 * 		backColor : 'blue',
	 * 		fontName : 'Arial',
	 * 		fontSize : '12px',
	 * 		bold : true,
	 * 		italic : false,
	 * 		border : '1px',
	 * 		borderStyle : 'solid',
	 * 		borderColor : '#000000',
	 * 		align : 'center'
	 * }
     */
    format: null,

    /**
     * String。
     * 组件的位置，仅在BorderLayout中有效。
     * 取值：top、bottom、left、right、center。
     */
    /** region : null, */

    /**
     * Number。
     * 仅在GridLayout中有效，组件在网格中的第几列、第几行、占几列、占几行。
     */
    /** x : -1, */
    /** y : -1, */
    /** colspan : -1, */
    /** rowspan : -1, */

    /**
     * Object。
     * 组件触发事件时的回调方法。
     *  new YIUI.TextEditor({
	 * 		listeners : {
	 * 			change : function(event) {
	 * 				// 这里的this是当前的TextEditor
	 * 			},
	 * 			keydown : {
	 * 				fn : function(event) {
	 * 					// 这里的this是由scope指定的
	 * 				},
	 * 				scope : scope
	 * 			}
	 * 		}
	 *  });
     */
    listeners: null,

    error: null,
    errorInfo: {},
    /** 触发事件
     *  在组件作为TabPanel面板的子项时，如果子项被选中，触发该事件。
     *  */
    active: null,

    /** 伙伴组件的标识 */
    buddyKey: null,

	/** 是否是伙伴组件*/
    buddy: false,

    /** 是否是继承组件*/
    extend: false,

    /**是否在初始化值以后重新加载不清除,默认是可以清除*/
    clearable: true,

    needRender: true,
    
    /**
     * 初始化方法，此方法由组件构造函数默认调用。
     * @param options 传入属性设置，格式为json : {key : key, caption : caption,...}
     */
    init: function (options) {
        $.extend(this, options);
        
        var meta = this.getMetaObj();
        if(meta) {
        	this.key = $.isUndefined(meta.key) ? this.key : meta.key;
        	this.buddyKey = $.isUndefined(meta.buddyKey) ? "" : meta.buddyKey;
        	this.type = $.isUndefined(meta.type) ? this.type : meta.type;
        	this.caption = $.isUndefined(meta.caption) ? "" : meta.caption;
        	// this.required = $.isUndefined(meta.required) ? this.required : meta.required;
        	// this.enable = $.isUndefined(meta.enable) ? this.enable : meta.enable;
        	// this.visible = $.isUndefined(meta.visible) ? this.visible : meta.visible;
        	this.validation = $.isUndefined(meta.validation) ? "" : meta.validation;
        	this.valueChanged = $.isUndefined(meta.valueChanged) ? "" : meta.valueChanged;
        	this.valueChanging = $.isUndefined(meta.valueChanging) ? "" : meta.valueChanging;
        	// this.defaultValue = $.isUndefined(meta.defaultValue) ? "" : meta.defaultValue;
        	this.defaultFormulaValue = $.isUndefined(meta.defaultFormulaValue) ? "" : meta.defaultFormulaValue;
        	this.columnKey = $.isUndefined(meta.columnKey) ? "" : meta.columnKey;
        	this.tableKey = $.isUndefined(meta.tableKey) ? "" : meta.tableKey;
        	this.bindingCellKey = $.isUndefined(meta.bindingCellKey) ? "" : meta.bindingCellKey;
        	this.isSubDetail = $.isUndefined(meta.isSubDetail) ? false : meta.isSubDetail;
        	this.parentGridKey = $.isUndefined(meta.parentGridKey) ? "" : meta.parentGridKey;
        	this.active = $.isUndefined(meta.active) ? "" : meta.active;
        	this.condition = $.isUndefined(meta.condition) ? null : meta.condition;
        	this.extend = $.isUndefined(meta.extend) ? this.extend : meta.extend;
        	this.needRender = $.isUndefined(meta.extend) ? true : !meta.extend;
            this.clearable = $.isUndefined(meta.clearable) ? this.clearable : meta.clearable;
        }
        
        // 如果id未定义，动态生成个id
        this.getId();

        // 注册控件，以id为唯一标识
        //YIUI.ComponentMgr.register(this);

        // 所有注册的事件监听。
        this.events = this.events || {};

        // 把listens注册到events中
        if (this.listeners) {
            this.addListener(this.listeners);
            delete this.listeners;
        }

        // 用于保存前次设置的width,height,top,left
        this.lastSize = {
            width: -1,
            height: -1
        };
        this.lastPosition = {
            top: -1,
            left: -1
        };
        this.lastFontSize = {
            fontSize: -1
        };

    },
    
    setMetaObj: function(metaObj) {
    	this.metaObj = (metaObj == null ? {} : metaObj);
    },
    
    getMetaObj: function() {
    	return this.metaObj || {};
    },
    
    setOnActive: function(onActive) {
    	this.onActive = onActive;
    },
    
    isOnActive: function() {
    	return $.isUndefined(this.onActive) ? false : this.onActive;
    },

    // 是否支持数据绑定
    isDataBinding: function() {
        return true;
	},

    // 是否有数据绑定
    hasDataBinding: function() {
        return this.tableKey && this.columnKey;
    },
	
    /**
     * 设置组件宽度。
     * @param width：Number类型。
     */
    setWidth: function (width) {
//        width = width < 50 ? 50 : width;
        if (!width || !$.isNumeric(width) || width <= 0)
            return;

        if (!this.rendered) {
            this.width = width;
            return;
        }

        var lastSize = this.lastSize;
        if (lastSize.width !== width) {
            lastSize.width = width;
            this.onSetWidth(width);
        }
    },

    // private 默认的设置组件宽度方法，如果组件有自定义设置宽度方法，可在子组件重写此方法。
    onSetWidth: function (width) {
        this.el.css("width", width);
    },

    /**
     * 获取组件宽度。
     * @return Number。
     */
    getWidth: function () {
        if (this.rendered) {
            return this.getOuterEl().outerWidth();
        }
        return this.width;
    },

    /**
     * 设置组件高度。
     * @param height：Number。
     */
    setHeight: function (height) {
        if (!height || !$.isNumeric(height) || height <= 0)
            return;

        if (!this.rendered) {
            this.height = height;
            return;
        }

        var lastSize = this.lastSize;
        if (lastSize.height !== height) {
            lastSize.height = height;
            this.onSetHeight(height);
        }
    },

    // private 默认的设置组件高度方法，如果组件有自定义设置高度方法，可在子组件重写此方法。
    onSetHeight: function (height) {
        this.el.css("height", height);
    },

    /**
     * 获取组件高度。
     * @return Number。
     */
    getHeight: function () {
        if (this.rendered) {
            return this.getOuterEl().outerHeight();
        }
        return this.height;
    },

    // private 获取除去padding和border的宽度
    getInnerWidth: function () {
        return this.el.width();
    },

    // private 获取除去padding和border的高度
    getInnerHeight: function () {
        return this.el.height();
    },

    /**
     * 设置水平方向位置。
     * @param left：Number。
     */
    setLeft: function (left) {
        if (!left || !$.isNumeric(left) || left <= 0)
            return;

        var lastPosition = this.lastPosition;
        if (lastPosition.left !== left) {
            lastPosition.left = left;
            if (this.rendered) {
                this.el.css('position', 'absolute');
                this.onSetLeft(left);
            } else {
                this.left = left;
            }
        }
    },

    // private 默认的设置组件位置方法，如果组件有自定义设置位置方法，可在子组件重写此方法。
    onSetLeft: function (left) {
        this.el.css("left", left);
    },

    /**
     * 设置竖直方向位置。
     * @param top：Number。
     */
    setTop: function (top) {
        if ((!top && top != 0) || top == 'auto')
            return;

        var lastPosition = this.lastPosition;
        if (lastPosition.top !== top) {
            lastPosition.top = top;
            if (this.rendered) {
                this.el.css('position', 'absolute');
                this.onSetTop(top);
            } else {
                this.top = top;
            }
        }
    },

    // private 默认的设置组件位置方法，如果组件有自定义设置位置方法，可在子组件重写此方法。
    onSetTop: function (top) {
        this.el.css("top", top);
    },

    setPadding: function (padding) {
        this.getOuterEl().css("padding", padding);
    },

    setLeftPadding: function (leftPadding) {
        this.getOuterEl().css("padding-left", leftPadding);
    },

    setRightPadding: function (rightPadding) {
        this.getOuterEl().css("padding-right", rightPadding);
    },

    setTopPadding: function (topPadding) {
        this.getOuterEl().css("padding-top", topPadding);
    },

    setBottomPadding: function (bottomPadding) {
        this.getOuterEl().css("padding-bottom", bottomPadding);
    },

    setMargin: function (margin) {
        this.getOuterEl().css("margin", margin);
    },

    setLeftMargin: function (leftMargin) {
        this.getOuterEl().css("margin-left", leftMargin);
    },

    setRightMargin: function (rightMargin) {
        this.getOuterEl().css("margin-right", rightMargin);
    },

    setTopMargin: function (topMargin) {
        this.getOuterEl().css("margin-top", topMargin);
    },

    setBottomMargin: function (bottomMargin) {
        this.getOuterEl().css("margin-bottom", bottomMargin);
    },

    setBorderColor: function (borderColor) {
        this.getOuterEl().css("border-color", borderColor);
    },

    setBorderRadius: function (borderRadius) {
        this.getOuterEl().css("border-radius", borderRadius);
    },

    setVAlign: function (vAlign) {
        this.vAlign = vAlign;
        switch (this.vAlign) {
            case YIUI.HAlignment.TOP:
                this.el.css("vertical-align", "top");
                break;
            case YIUI.VAlignment.CENTER:
                this.el.css("vertical-align", "middle");
                break;
            case YIUI.VAlignment.BOTTOM:
                this.el.css("vertical-align", "bottom");
                break;
        }
    },
    setHAlign: function (hAlign) {
        this.hAlign = hAlign;
//    	switch(this.hAlign) {
//	    	case YIUI.HAlignment.LEFT:
//		    	this.el.css("float", "left");
//				break;
//	    	case YIUI.VAlignment.CENTER:
//		    	this.el.css("margin", "auto auto");
//		    	break;
//	    	case YIUI.VAlignment.RIGHT:
//		    	this.el.css("float", "right");
//		    	break;
//		}
    },

    /**
     * 返回控件id，如果id未定义，则给组件自动生成一个唯一id。
     * @return String。
     */
    getId: function () {
        if (this.ofFormID) {
            return this.id || (this.id = this.ofFormID + "_" + this.key);
        } else {
            return this.id || YIUI.allotId();
        }
    },

    setColumnKey: function (columnKey) {
        this.columnKey = columnKey;
    },

    setTableKey: function (tableKey) {
        this.tableKey = tableKey;
    },

    setDefaultFormulaValue: function (defaultFormulaValue) {
        this.defaultFormulaValue = defaultFormulaValue;
    },

    getColumnKey: function () {
        return this.columnKey;
    },

    getTableKey: function () {
        return this.tableKey;
    },

    getDefaultFormulaValue: function () {
        return this.defaultFormulaValue;
    },

    dependedValueChange: $.noop,

    reset: function () {
        // 1.相关值清空
        if( this.isDataBinding() && this.needClean() ) {
            this.setValue(null,false,false);
        }

        // 2.控件自己状态重置
    },

    /**
     * 设置控件是否可编辑。
     * @param editable：Boolean。
     */
    setEditable: function (editable) {
        this.editable = editable;
    },
    
    getFormatEl: function() {
    	return this.el;
    },

    /**
     * 设置控件是否可用。
     */
    setEnable: function (enable) {
        this.enable = enable;

        var outerEl = this.getOuterEl();
        if(!outerEl || outerEl.length == 0) return false;
        var el = this.getFormatEl();
        if (this.enable) {
            el.prop("disabled",false);
            outerEl.removeClass("ui-readonly");
        } else {
            el.prop("disabled",true);
            outerEl.addClass("ui-readonly");
        }
    },
    setFocusManager: function (focusManager) {
        this.focusManager = focusManager;
    },
    setTabIndex: function (tabIndex) {
        this.tabIndex = tabIndex;
    },
    getTabIndex: function () {
        return this.tabIndex;
    },

    /**
     * 控件是否可编辑。
     * @return Boolean。
     */
    isEditable: function () {
        return this.editable;
    },

    /**
     * 控件是否可用。
     * @return Boolean。
     */
    isEnable: function () {
        return this.enable;
    },

    /**
     * 设置标题
     */
    setCaption: function (caption) {
        this.caption = caption;
        var ownerCt = this.ownerCt;
        if (ownerCt) {
            ownerCt.changeCaption(this);
        }
    },

    /**
     * 设置控件是否可见。
     * @param visible：Boolean。
     */
    setVisible: function (visible) {
        this.visible = visible;
        var ownerCt = this.ownerCt;
        if (ownerCt) {
            ownerCt.reduceVisible(visible, this);
        }
        var outerEl = this.getOuterEl();
        if(!outerEl) return;
        if (this.buddyKey) {
            var form = YIUI.FormStack.getForm(this.ofFormID);
            var buddyComp = form.getComponent(this.buddyKey);
            if(buddyComp && !buddyComp.extend) {
            	if(buddyComp.rendered) {
            		buddyComp.setVisible(visible);
            	} else {
            		buddyComp.visible = visible;
            	}
            }
        }
        if (this.visible) {
            outerEl.removeClass('ui-hidden');
        } else {
            outerEl.addClass('ui-hidden');
        }
    },

    /**
     * 控件是否可见。
     * @return Boolean。
     */
    isVisible: function () {
        return this.visible;
    },

    /**
     * 设置鼠标悬停时显示的提示信息。
     * @param tip String，显示的文本。
     */
    setTip: function (tip) {
    	if(this.tip) {
    		tip = this.tip;
    	}
        if(tip) {
            tip = YIUI.TypeConvertor.toString(tip);
            tip = tip.replace(/\\n/g, "\r");
        }
    	this.el && this.el.attr("title", tip);
    },

    /**
     * 返回使用的jQueryUI对象的dom。
     * @return jQuery。
     */
    getEl: function () {
        return this.el;
    },

    /**
     * 返回控件最外层dom，有些控件的最外层dom和getEl()不同，比如grid。
     * @return jQuery。
     */
    getOuterEl: function () {
        return this.getEl();
    },

    /**
     * 用于控制在刷新界面时,是否需要清空值
     * @return
     */
    needClean: function () {
        var meta = this.getMetaObj();
        if( !meta ){
            return false;
        }
        
        var controlType = meta.type;

        if(controlType== YIUI.CONTROLTYPE.LABEL
            ||controlType == YIUI.CONTROLTYPE.BUTTON
            ||controlType == YIUI.CONTROLTYPE.HYPERLINK
            ||controlType == YIUI.CONTROLTYPE.UPLOADBUTTON){
            return false;
        }   

        if( meta.condition ){
            return false;
        }

        return this.clearable;
    },

    /**
     * 把控件渲染到container中
     * @param container：jQuery，当前控件的父节点。
     */
    render: function (container) {
        this.doRender(container);
        if (this.hasLayout && !this.container.is(":hidden")) {
            var panelWidth, panelHeight,
                parentWidth = this.container.width(),
                parentHeight = this.container.height();
            if (this.width == -1) {
                panelWidth = $.getReal("100%", parentWidth);
            } else {
                panelWidth = $.getReal(this.width, parentWidth);
            }
            if (this.height == -1) {
                panelHeight = $.getReal("100%", parentHeight);
            } else {
                panelHeight = $.getReal(this.height, parentHeight);
            }
            this.doLayout(panelWidth, panelHeight);
        }
    },

    doRender: function (container) {
        this.container = container ? $(container)
                : (this.container ? $(this.container) : $.getBody());
        if (this.needRender && !this.rendered) {
            this.rendered = true;
            this.beforeRender();
            this.onRender(this.container);
            this.onRenderChildren();
            this.afterRender();
            this.install();
        }
    },
    
    /**
     * 控件渲染前所做准备。
     */
    beforeRender: $.noop,

    setError: function (error, msg) {
        this.errorInfo = {error: error, msg: msg};
        var el = this.getEl(),
            outerEl = this.el;
        if(!el) return;
        if (this.errorInfo.error) {
            $('<span class="error-icon" />').attr("title", msg).appendTo(outerEl);
        } else {
            $(".error-icon", outerEl).remove();
        }
    },

    isError:function () {
        return this.errorInfo.error;
    },

    getErrorMsg:function () {
        return this.errorInfo.msg;
    },

    setRequired: function (required) {
        this.required = required;
        var el = this.getEl(),
            outerEl = this.getOuterEl();
        if( !el ) return;
        if (required) {
            if($(".required-icon", outerEl).length == 0) {
                $('<span class="required-icon" />').appendTo(outerEl);
            }
        } else {
            $(".required-icon", outerEl).remove();
        }
    },

    isRequired: function () {
        return this.required;
    },

    /**
     * 控件渲染到界面，不包含items的渲染。
     */
    onRender: function (ct) {
        var el = this.el;

        // 如果未定义ct，且组件el已定义，取ct为el的parentNode
        if (el && (!ct || ct.length == 0)) {
            this.container = ct = $(el).parent();
        }
        if (!el && this.autoEl) {
            if ($.isString(this.autoEl)) {
                el = $(this.autoEl);
            }
        }
        if (el) {
            if (!el.attr('id')) {
                el.attr('id', this.getId());
            }
            this.el = $(el);
            // 如果发现el已经在DOM树中，不再进行插入
            if (this.el.parents('body')[0] != $.getBody()[0]) {
                ct.append(this.el);
            }
        }
        if (this.errorInfo) {
            this.setError(this.errorInfo.error, this.errorInfo.msg);
        }
        this.setColumnKey(this.columnKey);
        this.setTableKey(this.tableKey);
        if (this.defaultFormulaValue) {
            this.setDefaultFormulaValue(this.defaultFormulaValue);
        }
        this.setKey(this.key);
    },

    onRenderChildren: $.noop,
    /**
     * 重新布局组件
     */
    doLayout: $.noop,

    setKey: function (key) {
        this.key = key;
    },
    /**
     * 设置背景色
     */
    setBackColor: function (backColor) {
        this.backColor = backColor;
        this.getEl() && this.getEl().css({
            'background-image': 'none',
            'background-color': backColor
        });
    },

    /**
     * 设置前景色
     */
    setForeColor: function (foreColor) {
        this.foreColor = foreColor;
        this.getFormatEl() && this.getFormatEl().css('color', foreColor);
    },

    /**
     * 设置组件显示样式。
     * @param style Object，参考style属性说明。
     */
    setStyle: function (style) {
        var cssStyle = {};
        if(style.vAlign > -1) {
        	cssStyle['vertical-align'] = YIUI.VAlignment.parse(style.vAlign);
        	cssStyle['line-height'] = "normal";
        }
        (style.hAlign > -1) && (cssStyle['text-align'] = YIUI.HAlignment.parse(style.hAlign));
        var font = style.font;
        if (font) {
        	font.name && (cssStyle['font-family'] = font.name);
        	font.size && (cssStyle['font-size'] = font.size);
        	font.bold && (cssStyle['font-weight'] = 'bold');
        	font.italic && (cssStyle['font-style'] = 'italic');
        }
        this.setFormatStyle(cssStyle);
    },
    
    setFormatStyle: function (cssStyle) {
        this.getFormatEl().css(cssStyle);
    },

    setCssClass: function (cssClass) {
        this.el.addClass(cssClass);
    },


    /**
     * 控件渲染后所做操作，默认为设置el大小位置，并注册监听事件；对于Panel，还需进行layout。
     */
    afterRender: function () {
		this.required && this.setRequired(this.isNull());

        if( this.type != YIUI.CONTROLTYPE.GRID ) {
            (this.enable != undefined) && this.setEnable(this.enable);
        }

        (this.editable != undefined) && this.setEditable(this.editable);
        (this.visible != undefined) && this.setVisible(this.visible);

        this.backColor && this.setBackColor(this.backColor);
        this.foreColor && this.setForeColor(this.foreColor);
        this.format && this.setStyle(this.format);
        this.setTip(this.tip);

        this.cssClass && this.setCssClass(this.cssClass);
        this.padding && this.setPadding(this.padding);
        this.leftPadding && this.setLeftPadding(this.leftPadding);
        this.rightPadding && this.setRightPadding(this.rightPadding);
        this.topPadding && this.setTopPadding(this.topPadding);
        this.bottomPadding && this.setBottomPadding(this.bottomPadding);

        this.setLeft(this.left);
        this.setTop(this.top);

        this.borderColor && this.setBorderColor(this.borderColor);
        this.borderRadius && this.setBorderRadius(this.borderRadius);

        this.vAlign && this.setVAlign(this.vAlign);
        this.hAlign && this.setHAlign(this.hAlign);
    },

    setBox: function () {
        var ownerCt = this.ownerCt, parentWidth, parentHeight;

        if (ownerCt) {
            if ((ownerCt.type == YIUI.CONTROLTYPE.TABPANEL && ownerCt.items.length >= 1) ||
                (ownerCt.tagName == "tabcontainer" && ownerCt.items.length >= 1) || ownerCt.items.length == 1) {
                if (this.width == -1) {
                    this.width = '100%';
                }
                if (this.height == -1) {
                    this.height = '100%';
                }
            }
        }

        if (ownerCt) {
            // 这里需要用减去layout占位符的宽度高度
            parentWidth = ownerCt.getValidWidth();
            parentHeight = ownerCt.getValidHeight();
            this.setWidth($.getReal(this.width, parentWidth));
            this.setHeight($.getReal(this.height, parentHeight));
        } else {
            var parent = this.el.parent();
            parentWidth = parent.width();
            parentHeight = parent.height();
            this.setWidth(this.width);
            this.setHeight(this.height);
        }
    },

    focus: function () {
        this.focusManager.focusOwner = this;
    },
    
    needTip: function() {
    	return true;
    },
    
    getShowText: function() {
    	return this.caption;
    },
    
    /** 获取图片的服务器地址*/
    getImageBase64URL: function (icon) {
        return new YIUI.Base64ImageService(YIUI.FormStack.getForm(this.ofFormID)).loadBase64Image(icon);
    },

    /**
     * 给DOM添加事件监听。
     */
    install: function () {
        var self = this;
    },

    /**
     * 给组件添加事件监听。
     * @param ename String或Object。
     *              String：事件名称，这里不是DOM上的事件名称，而是组件自定义的；
     *              Object：形如：{change : {fn:fn, scope:scope}}。
     * @param fn Function，事件触发时的回调函数。
     * @param scope Object，可选的，调用fn时的作用域。
     */
    addListener: function (ename, fn, scope) {
        if ($.isObject(ename)) {
            var listeners = ename, listener;
            for (var e in listeners) {
                listener = listeners[e];
                this.addListener(e, listener.fn || listener, listener.scope);
            }
        } else {
            var event = this.events[ename] = this.events[ename]
                || new YIUI.Event(ename, this);
            event.addListener(fn, scope);
        }
    },

    /**
     * 触发组件上注册的所有ename指定的事件监听方法。
     * @param ename String，事件名称，这里不是DOM上的事件名称，而是组件自定义的。
     */
    fireEvent: function (ename) {
        var event = this.events[ename];
        if (event) {
            var args = $.makeArray(arguments);
            args.shift();
            event.fire.apply(event, args);
        }
    },

    /**
     * 给DOM添加事件监听。
     * @param selector String，把事件监听添加到el中的
     * 哪个子DOM上。
     * @param ename String，事件名称，这里是DOM上的事件名称。
     * @param fn Function 事件监听方法。
     * @param scope 调用回调方法的作用域。
     */
    bind: function (selector, ename, fn, scope) {
        scope = scope || this;
        var dom = selector ? $(selector, this.el) : this.el;
        dom.bind(ename, function (event) {
            fn ? fn.call(scope, event) : scope.fireEvent(ename, event);
        });
    },

    /**
     * 销毁控件，防止内存泄露。
     */
    destroy: function () {
        if (this.isDestroyed)
            return;
        if (this.beforeDestroy() !== false) {
            // 如果已经渲染过，先删除已经注册的listeners，然后删除DOM
            if (this.rendered) {
                this.el.destroy();
                delete this.el;
                delete this.listeners;
            }

            // 取消注册控件
            //YIUI.ComponentMgr.unregister(this);

            this.afterDestroy();

            this.isDestroyed = true;
        }
    },

    beforeDestroy: $.noop,

    /**
     * 解除自身所有属性的引用
     */
    afterDestroy: function () {
        for (var prop in this) {
            if (this.hasOwnProperty(prop)) {
                delete this[prop];
            }
        }
    }

});
YIUI.reg('component', YIUI.Component);

// 封装添加到组件上的事件监听
YIUI.Event = function (name, owner) {
    this.name = name;
    this.owner = owner;

    this.listeners = [];
};
YIUI.Event.prototype = {
    addListener: function (fn, /*optional*/scope) {
        var obj = {
            fn: fn,
            scope: scope || this.owner
        };
        this.listeners.push(obj);
    },

    removeListener: function (fn, /*optional*/scope) {
        var index = this.indexOfListener(fn, scope);
        if (index != -1) {
            this.listeners.splice(index, 1);
            return true;
        }

        return false;
    },

    indexOfListener: function (fn, /*optional*/scope) {
        var owner = this.owner, index = -1;
        $.each(this.listeners, function (i) {
            if (this.fn == fn && (this.scope == scope || this.scope == owner)) {
                index = i;
                return false;
            }
        });
        return index;
    },

    fire: function () {
        var args = $.makeArray(arguments), owner = this.owner;
        $.each(this.listeners, function (i) {
            if (this.fn.apply(this.scope || window, args) === false) {
                return false;
            }
        });
    }


};

if($.browser.isIE) {
    YIUI.Component = YIUI.extend(YIUI.Component, {
        setEnable: function (enable) {
            this.enable = enable;
            var outerEl = this.getOuterEl();
            if(!outerEl || outerEl.length == 0) return false;
            var el = this.getFormatEl();
            
            switch(this.type) {
                case YIUI.CONTROLTYPE.TEXTEDITOR:
                case YIUI.CONTROLTYPE.NUMBEREDITOR:
                case YIUI.CONTROLTYPE.COMBOBOX:
                case YIUI.CONTROLTYPE.CHECKLISTBOX:
                case YIUI.CONTROLTYPE.DICT:
                case YIUI.CONTROLTYPE.DATEPICKER:
                case YIUI.CONTROLTYPE.UTCDATEPICKER:
                case YIUI.CONTROLTYPE.TEXTAREA:
                case YIUI.CONTROLTYPE.LISTVIEW:
                case YIUI.CONTROLTYPE.MONTHPICKER:
                case YIUI.CONTROLTYPE.TIMEPICKER:
                if (this.enable) {
                    el.prop("readonly",false);
                    outerEl.removeClass("ui-readonly");
                } else {
                    el.prop("readonly",true);
                    outerEl.addClass("ui-readonly");
                }
                break;
                default:
                if (this.enable) {
                    el.prop("disabled",false);
                    outerEl.removeClass("ui-readonly");
                } else {
                    el.prop("disabled",true);
                    outerEl.addClass("ui-readonly");
                }
                break;
            }
        }
    });
}