/**
 * 表格单元格字典编辑器
 * @type {*}
 */
YIUI.CellEditor.CellDict = YIUI.extend(YIUI.CellEditor, {
    handler: YIUI.DictHandler,
    
    //字典状态
    stateMask: YIUI.DictStateMask.Enable,

    multiSelect: false,
        
    independent: false,

    pageMaxNum: 10,

    itemKey: null,

    unitContext: null,

    typeDefKey: '',

    //单选字典文字框输入数据是否显示数据行
    promptData: false,

    cssClass: "",

    init: function (opt) {
        this.id = opt.id;
        this.metaObj = opt.editOptions;
        this.itemKey = this.metaObj.itemKey;
        this.typeDefKey = this.metaObj.typeDefKey;
        this.stateMask = $.isUndefined(this.metaObj.stateMask) ? this.stateMask : this.metaObj.stateMask;
        this.root = $.isUndefined(this.metaObj.root) ? this.root : this.metaObj.root;
        this.multiSelect = this.metaObj.allowMultiSelection || this.multiSelect;
        this.independent = this.metaObj.independent || this.independent;
        this.key = opt.key;
        this.loadType = this.metaObj.loadType;
        this.promptData = $.isUndefined(this.metaObj.promptData) ? this.promptData : this.metaObj.promptData;
        this.cssClass = this.metaObj.cssClass || this.cssClass;
    },
    onRender: function (parent) {
        this.base(parent);

        var self = this;
        var formID = this.ofFormID;
        var form = YIUI.FormStack.getForm(formID);
        var dictService = new YIUI.DictService(form);
        var options = {
            
            id: self.id,
            independent: self.independent,
            multiSelect: self.multiSelect,
            pageMaxNum: self.pageMaxNum,
            formKey: form.formKey,
            fieldKey: self.key,
            promptData: self.promptData,
            cssClass: self.cssClass,

            getItemKey: function () {
                return self.getItemKey();
            },

            getStateMask: function(){
                return self.stateMask;
            },

            commitValue: function(value){
                return self.saveCell(value);
            },

            doFocusOut: function(){
                return self.doFocusOut();
            },

            checkDict: function () {
                        
                var _this = self;

                if (!_this.needRebuild && typeof(_this.needRebuild) != "undefined") {
                    return  $.Deferred(function(defer){
                                            defer.resolve(false);
                                        }).promise();
                }

                var formID = _this.ofFormID;
                var form = YIUI.FormStack.getForm(formID);
                var itemKey = _this.getItemKey();

                _this.itemKey = itemKey;

                var dictFilter = _this.handler.getDictFilter(form, _this.key, _this.metaObj.itemFilters, itemKey, _this.typeDefKey);

                return _this.handler.createRoot(form, _this.getItemKey(),
                    _this.root, _this.unitContext) .then(function(result){
                                            if (result) {
                                            	result.loadType = _this.loadType;
                                                result.dictFilter = dictFilter;
                                                _this.setSecondaryType(result.secondaryType);
                                                _this.secondaryType = result.secondaryType;
                                                _this.needRebuild = false;

                                                return result;
                                            }
                                            return false;
                                        });
            },

            doLostFocus: function (text) {
            },
            
            beforeExpand: function (tree, treeNode) {
            },
            
            getDictService: function(){
                return dictService;
            }
        };
        this.yesCom = new YIUI.Yes_BaseDict(options);

        this.yesCom.getEl().addClass("ui-dict");

        this.yesCom.setWidth(parent.width());
        this.yesCom.setHeight(parent.height());
    },
    getDictTree: function(){
        return this.yesCom.dictTree;
    },
    getDropBtn: function () {
        return this.yesCom._dropBtn;
    },
    getValue: function () {
        return this.yesCom.getSelValue();
    },
    focus: function () {
        this.yesCom.focus();
    },
    setValue: function (value) {
        this.yesCom.setSelValue(value);
    },
    getInput: function () {
        return this.yesCom._textBtn;
    },
    setText: function (caption) {
        this.yesCom.setText(caption);
    },
    setInputText: function (text) {
        this.yesCom.setInputText(text);
    },
    getText: function () {
        return this.yesCom.getText();
    },
    beforeDestroy: function () {
        this.yesCom.destroy();
    },
    getMetaObj: function() {
        return this.metaObj;
    },
    setUnitContext: function (cxt) {
        this.unitContext = cxt;
    },
    setSecondaryType: function (type) {
        this.yesCom.setSecondaryType(type);
    },

    getItemKey: function(){
        return this.itemKey;
    }
});