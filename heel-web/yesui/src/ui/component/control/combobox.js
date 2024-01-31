YIUI.Control.ComboBox = YIUI.extend(YIUI.Control, {

    needRebuild: true,

    multiSelect: false,
    
    hasText: false,
    
    sourceType: YIUI.COMBOBOX_SOURCETYPE.ITEMS,

    editable : false,
    
    handler: YIUI.ComboBoxHandler,
    
    behavior: YIUI.ComboBoxBehavior,

    integerValue: false,
    
    enableSort: false,

    //class名
    cssCalss : "",

    init : function(options){
    	this.base(options);
    	this.multiSelect = (this.type == YIUI.CONTROLTYPE.CHECKLISTBOX);

        var meta = this.getMetaObj();
        this.multiSelect = meta.multiSelect || this.multiSelect;
        this.editable = meta.editable || this.editable;
        this.groupKey = meta.groupKey;
        this.globalItems = meta.globalItems;
        this.promptText = meta.promptText;
        this.integerValue = meta.integerValue || this.integerValue;
        this.sourceType = meta.sourceType || this.sourceType;
        this.items = meta.items;
        this.globalItems = meta.globalItems;
        this.queryParas = meta.queryParas;
        this.formula = meta.formula;
        this.cssClass = meta.cssClass || this.cssClass;
    },

    setTip: function (tip) {
        var tip = this.text;
        this.base(tip);
    },
    /** 设置输入提示 */
    setPromptText: function (promptText) {
    	this.yesCombobox.setPromptText(promptText);
    },
    setEditable: function(editable) {
    	if(this.multiSelect) {
    		this.editable = false;
    	} else {
    		this.editable = editable;
    	}
    	this.yesCombobox.setEditable(this.editable);
    },
	
    getCheckedValue : function (){

    },

    /**
     * 由于可以绑定字符串和整型,所以特殊处理一下
     */
    isNull:function () {
        if( this.integerValue ) {
            return this.base() || parseFloat(this.value) == 0;
        }
        return this.base();
    },
    
	dependedValueChange: function(targetField, dependedField){
		this.needRebuild = true;
        this.setValue(null, true, true, false, true);
	},

    reset: function () {
	    this.base();
        this.needRebuild = true;
    },
    
    checkEnd: function(value) {
    	this.value = value;
    	this.yesCombobox.setSelValue(value);

        var _this = this,
            metaObj = _this.getMetaObj();

        if(this.needRebuild || !metaObj.cache){
            var formID = this.ofFormID;
            var form = YIUI.FormStack.getForm(formID);

            this.handler.getItems(form, metaObj)
                        .done(function(items){
                            if(items){
                                _this.setItems(items);
                                var caption = _this.handler.getShowCaption(_this.sourceType, items, value, _this.multiSelect, _this.editable);
                                _this.setText(caption);
                            }else{
                                console.log('field key :'+_this.getMetaObj().key+' combobox items is null.');
                            }
                            _this.needRebuild = false;
                        });
        }else{
            var caption = _this.handler.getShowCaption(_this.sourceType, this.yesCombobox.getItems(), value, _this.multiSelect, _this.editable);
            _this.setText(caption);
        }
	},
    
    /**
     * 获取下拉选项
     */
    
	setFormatStyle: function(cssStyle) {
		this.cssStyle = cssStyle;
		this.yesCombobox.setFormatStyle(cssStyle);
	},
	
    setBackColor: function (backColor) {
        this.backColor = backColor;
        this.getEl() && $("input",this.getEl()).css({
            'background-image': 'none',
            'background-color': backColor
        });
    },

    getFormatEl: function() {
        return this.getEl() ? $("input", this.getEl()) : null;
    },

    onSetWidth: function(width) {
    	this.yesCombobox.setWidth(width);
    },
    
    onSetHeight: function(height) {
    	this.yesCombobox.setHeight(height);
    },
    
    /**
     * 设置下拉框显示值
     * @param {} text
     */
    setText: function (text) {
    	this.text = text;
        this.yesCombobox.setText(text);
    },
    
    getText: function() {
    	return this.text;
    },
    
    getShowText: function() {
    	return this.getText();
    },
    
    /**
     * 设置下拉内容
     * @param {} items
     */
    setItems: function(items) {
    	this.items = items;
    	this.yesCombobox.setItems(items);
    },
    	
    /**
     * 勾选节点
     * @param {} value
     */
    checkItem: function(value){
    	this.yesCombobox.checkItem(value);
    },
    
    beforeDestroy: function() {
    	this.yesCombobox && this.yesCombobox.destroy();
    },
    
    getValue: function() {
    	return this.integerValue ? YIUI.TypeConvertor.toInt(this.value) : this.value;
    },

    focus: function () {
        this.base();
        this.yesCombobox && this.yesCombobox.focus();
    },
    
    setSourceType: function(sourceType) {
    	this.sourceType = sourceType;
    },
    
    install: function() {
    	var self = this;

    	var editor = this.yesCombobox.getEditor();
        
    	editor.click(function (e) {
            if( self.enable ) {
                self.focusManager.focusOwner = self;
            }
        });

    	editor.keydown(function (e) {
            if( !self.enable || e.stop ) {
                return false;
            }
            var keyCode = e.keyCode || e.charCode;
            if (keyCode == 9 || keyCode === 13 || keyCode === 108) {
                self.focusManager.requestNextFocus();
                e.preventDefault();
            }
        });
    },
    
   
    /** 完成button的渲染 */
    onRender: function (ct) {
        this.base(ct);
        var self = this,
            metaObj = self.getMetaObj();
        var formID = this.ofFormID;
        var form = YIUI.FormStack.getForm(formID);
    	this.yesCombobox = new YIUI.Yes_Combobox({
    		el: self.el,
    		multiSelect: self.multiSelect,
    		required: self.required,
    		items: self.items,
    		value: self.value,
    		integerValue: this.getMetaObj().integerValue,
            cssClass: this.cssClass,

            checkItems : function(){
                var def = $.Deferred();
                if(self.needRebuild || !metaObj.cache){
                    self.handler.getItems(form, metaObj)
                                .done(function(items){
                                    self.setItems(items);
                                    self.needRebuild = false;
                                    def.resolve();
                                });
                }else{
                    def.resolve();
                }
                return def.promise();
            },

            isEnable: function() {
            	return self.enable;
            },
    	    doSuggest: function(value) {
                var def = $.Deferred();
            	this.checkItems().done(function() {
            		var items = self.items, viewItems = [], exp = ".*";
                    for (var i = 0, len = value.length; i < len; i++) {
                    	exp += value.charAt(i);
                    	exp += ".*";
                    }
                    var reg = new RegExp(exp,"i");
                    for (var i = 0, len = items.length; i < len; i++) {
                        if (items[i].caption != null) {
                            if (items[i].caption.match(reg)) viewItems.push(items[i]);
                        }
                        if(!self.enableSort){
                        	 if (viewItems.length == 5) break;
                        }
                      }
                    if(self.enableSort){
                    	viewItems = YIUI.SuggestUtil.sort(viewItems, value);
                    }
                    def.resolve(viewItems);
            	});
                return def.promise();
    	    },
    	    commitValue : function (value){
    			return self.setValue(value, true, true, false, true);
    	    }
    	});
        this.el.addClass("ui-cmb");
        if(this.value != null) {
            this.checkEnd(this.value);
        }
        this.promptText && this.setPromptText(this.promptText);
		this.sourceType && this.setSourceType(this.sourceType);
    }
});
YIUI.reg('combobox', YIUI.Control.ComboBox);
YIUI.reg('checklistbox', YIUI.Control.ComboBox);