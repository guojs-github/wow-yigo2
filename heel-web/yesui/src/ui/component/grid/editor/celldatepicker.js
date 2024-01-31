/**
 * 表格单元格日期编辑器
 * @type {*}
 */
YIUI.CellEditor.CellDatePicker = YIUI.extend(YIUI.CellEditor, {

    format: '',

    isOnlyDate: false,

    init: function (opt) {
        this.id = opt.id;
        var meta = opt.editOptions;
        this.isOnlyDate = $.isUndefined(meta.onlyDate) ? false : meta.onlyDate;
    },
    onRender: function (parent) {
        this.base(parent);
        var _this = this;

        this.yesCom = new YIUI.Yes_DatePicker({
            id:_this.id,
            isOnlyDate: _this.isOnlyDate,
            commitValue: function(value) {
                _this.saveCell(value, true, true);
            },
            
            doFocusOut: function(){
                return _this.doFocusOut();
            }
        });

        this.yesCom.getEl().addClass("ui-dp");
        this.yesCom.setWidth(parent.width());
        this.yesCom.setHeight(parent.height());
    },

    setValue: function (value) {
        this.base(value);
    },
    
    getValue: function () {
        return this.yesCom.getValue();
    },

    focus: function () {
        this.yesCom.focus();
    },

    getDropBtn: function () {
        return this.yesCom.getBtn();
    },

    getDropView: function () {
        return this.yesCom.getDropView();
    },

    getInput: function () {
        return this.yesCom.getInput();
    },

    finishInput: function () {

    },

    beforeDestroy: function () {
        this.yesCom.getDropView().remove();
    },

    setText: function (text) {
        this.yesCom.setText(text);
    },

    getText: function () {
        return this.yesCom.getText();
    },

    install: function () {

    }
});