/**
 * Created with IntelliJ IDEA.
 * User: zhufw
 * Date: 14-3-21
 * Time: 下午5:08
 * To change this template use File | Settings | File Templates.
 */

YIUI.Control.DICT_CKBOXTYPE_NORMAL_SELECT = YIUI.TREEPANEL_CKBOXTYPE_NORMAL_SELECT;

YIUI.Control.DICT_CKBOXTYPE_SINGLE_SELECT = YIUI.TREEPANEL_CKBOXTYPE_SINGLE_SELECT;

YIUI.Control.Dict = YIUI.extend(YIUI.Control, {

	value : null,
	
    handler: YIUI.DictHandler,
    
    behavior: YIUI.DictBehavior,
    
    //字典状态
    stateMask: YIUI.DictStateMask.Enable,
    
    needRebuild: true,
    
    multiSelect: false,

    independent: false,

    pageMaxNum: 10,

    refKey: null,
    
    loadType: YIUI.DictLoadType.R2L,

    formulaText: null,

    textField: null,

    //单选字典文字框输入数据是否显示数据行
    promptData: false,

    //class名
    cssClass: "",

	init : function (options){
		this.base(options);
        var meta = this.getMetaObj();
        this.multiSelect = meta.allowMultiSelection || this.multiSelect;
        this.independent = meta.independent || this.independent;
        this.multiSelect = meta.allowMultiSelection || this.multiSelect;
        this.independent = meta.independent || this.independent;
        this.stateMask = meta.stateMask || this.stateMask;
        this.itemFilters = meta.itemFilters || this.itemFilters;
        this.itemKey = meta.itemKey;
        this.root = meta.root;
        this.refKey = meta.refKey;
        this.loadType = meta.loadType || this.loadType;
        this.formulaText = meta.formulaText;
        this.textField = meta.textField;
        this.promptText = meta.promptText;
        this.promptData = meta.promptData == null ? this.promptData : meta.promptData;
        this.cssClass = meta.cssClass || this.cssClass;
	},
    /** 设置输入提示 */
    setPromptText: function (promptText) {
    	this.yesDict.setPromptText(promptText);
    },
	setEditable: function(editable) {
		this.editable = editable;
    	this.yesDict.setEditable(this.editable);
    },

    getFormatEl: function() {
    	return this.yesDict ? this.yesDict.getInput() : null;
    },

	setBackColor: function(backColor) {
        this.backColor = backColor;
        this.yesDict && this.yesDict.setBackColor(backColor)
	},

	setForeColor: function(foreColor) {
        this.foreColor = foreColor;
        this.yesDict && this.yesDict.setForeColor(foreColor);
	},
	
    setFormatStyle: function(cssStyle) {
        this.yesDict && this.yesDict.setFormatStyle(cssStyle);
	},
	
	setMultiSelect: function(multiSelect) {
		this.multiSelect = multiSelect;
		this.yesDict.setMultiSelect(multiSelect);
	},

    setPromptData: function(promptData){
        this.yesDict.setPromptData(promptData);
    },
	
    beforeDestroy: function() {
    	this.yesDict && this.yesDict.destroy();
    },

    isNull: function() {
    	var value = this.value;
    	if($.isEmptyObject(value)){
			return true;
		}
		if (value instanceof YIUI.ItemData) {
			return value.oid == 0;
		} else if ($.isArray(value)) {
			for (var i = 0, len = value.length; i < len; i++) {
				if(value[i].oid > 0){
					return false;
				}
			}
			return true;
		}
		return false;
    },

    setTip: function (tip) {
        var tip = tip || this.text;
        this.base(tip);
    },
    
    checkEnd: function(value) {
		this.value = value;
		this.yesDict.setSelValue(value);
	   
        var _this = this;
        var formID = this.ofFormID;
        var form = YIUI.FormStack.getForm(formID);

        if(this.formulaText && this.value){
            var cxt = new View.Context(form);
            var text = form.eval(this.formulaText, cxt, null);
            this.setText(text);
            this.setTip(text);
        }else{
            this.handler.getShowCaption(form, value, this.multiSelect, this.independent, this.textField)
                    .done(function(text){
                        if( text && !_this.value ) // 可能后台获取标题返回的时候值已经被清空
                            return;
                        _this.setText(text);
                        _this.setTip(text);
                    });
        }
  	},
    
    /** 获取控件真实值 */
    getValue: function () {
    	return this.value;
    },
    
    onSetWidth: function(width) {
    	this.yesDict.setWidth(width);
    },
    
    onSetHeight: function(height) {
    	this.yesDict.setHeight(height);
    },
    
    getDictTree: function(){
    	return this.yesDict.dictTree;
    },
    
    onRender: function (ct) {
        this.base(ct);
        var $this = this;

        var formID = $this.ofFormID;
        var form = YIUI.FormStack.getForm(formID);
        var dictService = new YIUI.DictService(form);
        var options = {
            el: $this.el,
            caption: $this.caption,
            secondaryType: $this.secondaryType,
            dataSource: $this.dataSource,
            independent: $this.independent,
            multiSelect: $this.multiSelect,
            pageMaxNum: $this.pageMaxNum,
            formKey: form.formKey,
            fieldKey: $this.getMetaObj().key,
            cssClass: $this.cssClass,
            getItemKey: function() {
                return $this.itemKey;
            },
            getStateMask: function(){
                return $this.stateMask;
            },
            checkDict: function() {
                return $this.checkDict();
            },
            commitValue:function(value){
                return $this.setValue(value, true, true, false, true);
            },
            isEnable: function() {
                return $this.enable;
            },
            doSuggest: function(value) {
                
                var rootValue = null;
                if ($this.getDictTree().rootNode != null) {
                    rootValue = $this.getDictTree().getNodeValue($this.getDictTree().rootNode);
                }

                var def = $this.handler.doSuggest(form, $this.getMetaObj(), value, $this.getDictTree().dictFilter, rootValue)
                            .then(function(viewItems) {
                                if (viewItems.length == 0) {
                                    $this.hasSuggest = false;
                                } else {
                                    $this.hasSuggest = true;
                                }
                                return viewItems;
                            });
                return def.promise();
            },
            valueChange: function(text) {
                $this.handler.doLostFocus($this, text);
            },
            beforeExpand: function(tree , treeNode) {
            },
            getDictService: function(){
                return dictService;
            }
        };
        this.yesDict = new YIUI.Yes_BaseDict(options);
    	
        this.el.addClass("ui-dict");

        this.checkEnd(this.value);
        this.setMultiSelect(this.multiSelect);
        this.setDynamic(this.isDynamic);
        this.setStateMask(this.stateMask);
        this.promptText && this.setPromptText(this.promptText);
        this.setPromptData(this.promptData);
    },
    
    setStateMask: function(stateMask) {
    	this.stateMask = stateMask;
    },
    
    setDynamic: function(isDynamic) {
    	this.isDynamic = isDynamic;
    },

    focus: function () {
        this.base();
        this.yesDict && this.yesDict.focus();
    },
    
    install: function() {
    	this.base();

        var self = this;
        self.yesDict.focusManager = self.focusManager;

        var editor = this.yesDict.getInput();

        editor.click(function () {
            if( self.enable ) {
                self.focusManager.focusOwner = self;
            }
        });

        // 焦点策略事件
        editor.keydown(function (event) {
            if(!self.enable) {
                return false;
            }
            var keyCode = event.keyCode || event.charCode;
            if( keyCode == 9 || keyCode == 13 || keyCode == 108 ) {
                if(self.promptData && self.yesDict.$suggestView.css("display") == "block"){
                    self.yesDict.hideSuggestView();
                    self.focus();
                }
                self.focusManager.requestNextFocus();
                event.preventDefault();
            }
        });
    },
   
    setText: function (text) {
    	this.text = text;
    	this.yesDict && this.yesDict.setText(text);
    } , 
    
    getText: function () {
        return this.yesDict.getText();
    },

    getShowText: function() {
    	return this.getText();
    },

	dependedValueChange: function(targetField, dependedField){

        var formID =this.ofFormID;
        var form = YIUI.FormStack.getForm(formID);

        var meta = this.getMetaObj();

        //动态字典计算itemKey
		if(meta.type == YIUI.CONTROLTYPE.DYNAMICDICT){
			if(meta.refKey && meta.refKey == dependedField){
                //this.itemKey = this.handler.getItemKey(form, meta.refKey);
				this.needRebuild = true;
			}
		}
		
		if(!this.needRebuild){
			if(meta.root && meta.root.length > 0){
				if(meta.root == dependedField){
                    //this.handler.getRoot(form, this.root);

					this.needRebuild = true;
				}	
			}
		}

		if(!this.needRebuild){
            var metaFilter = this.handler.getMetaFilter(form, this.key, meta.itemFilters, this.itemKey);
            if(metaFilter){
                if(metaFilter.dependency){
                    var str = ','+metaFilter.dependency+',';
                    if(str.indexOf((','+dependedField+',')) >= 0 ){
                        this.needRebuild = true;
                    }
                }
            }else if(this.yesDict.dictTree.dictFilter){
                 this.needRebuild = true;
            }
		}
		
		if(this.needRebuild){
			this.setText("");
			this.setValue(null, true, true, false, true);
            if(this.yesDict){
                this.yesDict.startRow = 0;
            }
		}
	},
    
    setSecondaryType: function (type) {
        this.yesDict.setSecondaryType(type);
    } , 
    
    checkDict: function() {
    	
        var _this = this;

        if (!_this.needRebuild && typeof(_this.needRebuild) != "undefined") {
            return  $.Deferred(function(defer){
                                    defer.resolve(false);
                                }).promise();
        }

        var formID = _this.ofFormID;
        var form = YIUI.FormStack.getForm(formID);

        if( this.type == YIUI.CONTROLTYPE.DYNAMICDICT ) {
            this.itemKey = YIUI.DictHandler.getItemKey(form,this.refKey);
        }
        
        var dictFilter = _this.handler.getDictFilter(form, _this.key, _this.getMetaObj().itemFilters, _this.itemKey);

        return _this.handler.createRoot(form,
                                 _this.itemKey,
                                 _this.root)
                            .then(function(result){
                                    if (result) {
                                    	result.loadType = _this.loadType;
                                        result.dictFilter = dictFilter;
                                        _this.setSecondaryType(result.secondaryType);
                                        var resultType = result.secondaryType;
                                        _this.secondaryType = result.secondaryType;
                                        _this.needRebuild = false;

                                        return result;
                                    }
                                    return false;
                                });
    }
});
YIUI.reg('dict', YIUI.Control.Dict);
YIUI.reg('compdict', YIUI.Control.Dict);
YIUI.reg('dynamicdict', YIUI.Control.Dict);
