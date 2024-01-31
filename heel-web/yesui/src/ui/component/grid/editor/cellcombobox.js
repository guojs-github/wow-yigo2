/**
 * 表格单元格下拉框编辑器
 * @type {*}
 * TODO 下拉框与字典不同， 如果下拉内容为表达式， 会初始化的时候计算， 表格的根据依赖对内容做缓存。
 * 初始化计算下拉内容如时间较长， 点下拉的时候可能会未算完， 这个地方需要做优化处理。
 */
YIUI.CellEditor.CellComboBox = YIUI.extend(YIUI.CellEditor, {

    editable: false,

    multiSelect: false,

    integerValue: false,

    def: null,

    cssClass: "",

    init: function (opt) {
        this.id = opt.id;
        var meta = opt.editOptions;
        this.multiSelect = (meta.cellType == YIUI.CONTROLTYPE.CHECKLISTBOX);
        this.editable = $.isUndefined(meta.editable) ? this.editable : meta.editable;
        this.integerValue = $.isUndefined(meta.integerValue) ? this.integerValue : meta.integerValue;
        this.meta = meta;
        this.cssClass = meta.cssClass || this.cssClass;
    },
    onRender: function (parent) {
        this.base(parent);

        var self = this;
             
        var getItems = function(){
            if(self.def == null){
                var form = YIUI.FormStack.getForm(self.ofFormID);
                self.def = YIUI.ComboBoxHandler.getItems(form, self.meta)
                    .then(function(items){
                        self.setItems(items);
                        self.def = null;
                    });
            }
            return self.def;
        }


        this.yesCom = new YIUI.Yes_Combobox({
            id:self.id,
            multiSelect: this.multiSelect,
            integerValue: this.integerValue,
            editable: this.editable,
            cssClass: this.cssClass,

            checkItems : function(){
                return getItems();
            },

            doSuggest: function(value) {
                var def = $.Deferred();
                var _this = this;
                
                this.checkItems().done(function() {
                    var items = _this.items, viewItems = [], exp = ".*";
                    for (var i = 0, len = value.length; i < len; i++) {
                    	exp += value.charAt(i);
                    	exp += ".*";
                    }
                    var reg = new RegExp(exp,"i");
                    for (var i = 0, len = items.length; i < len; i++) {
                        if (items[i].caption != null) {
                            if (items[i].caption.match(reg)) viewItems.push(items[i]);
                        }
                          if (viewItems.length == 5) break;
                      }
                    def.resolve(viewItems);
                });
                return def.promise();
            },
            
            commitValue : function (value){
                self.saveCell(value);
            },

            doFocusOut: function(){
                return self.doFocusOut();
            }
        });

        this.yesCom.getEl().addClass("ui-cmb");

        this.yesCom.setWidth(parent.width());
        this.yesCom.setHeight(parent.height());
    },


    setItems: function(items) {
        //this.items = items;
        this.yesCom.setItems(items);
    },

    setValue: function (value) {
        this.base(value);
        this.yesCom.setSelValue(value);
    },

    getValue: function () {
    	var value = this.yesCom.getSelValue();
    	if (this.integerValue) {
    		value = YIUI.TypeConvertor.toInt(value);
    	}
    	return value;
    },

    focus: function () {
        this.yesCom.focus();
    },

    getText: function () {
        return this.yesCom.getText();
    },

    setText: function (text) {
        this.yesCom.setText(text);
    },

    getInput: function () {
        return this.yesCom._textBtn;
    },
    getDropBtn: function () {
        return this.yesCom._dropBtn;
    },
    beforeDestroy: function () {
        this.yesCom.destroy();
    }
});