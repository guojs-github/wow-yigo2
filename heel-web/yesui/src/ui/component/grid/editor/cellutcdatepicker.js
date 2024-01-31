/**
 * 表格单元格日期编辑器
 * @type {*}
 */
YIUI.CellEditor.CellUTCDatePicker = YIUI.extend(YIUI.CellEditor, {
    isOnlyDate: false,

    formatStr: "yyyy-MM-dd HH:mm:ss",

    init: function (opt) {
        var meta = opt.editOptions;
        this.isOnlyDate = $.isUndefined(meta.onlyDate) ? this.isOnlyDate : meta.onlyDate;
        this.formatStr && this.setFormatStr();
    },
    onRender: function (parent) {
        this.base(parent);
        var _this = this;

        this.yesCom = new YIUI.Yes_DatePicker({
            formatStr: _this.formatStr,
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

    setFormatStr: function () {
        if (this.isOnlyDate) {
            this.formatStr = this.formatStr.split(" ")[0];
        }
    },

    setValue: function (value) {
        this.base(value);
       // this.yesCom.setValue(value);
    },
    
    getValue: function () {
        return this.yesCom.getValue();
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

    focus: function () {
        this.yesCom.focus();
    },

    beforeDestroy: function () {
        this.yesCom.getDropView().remove();
    },

    setText: function (text) {
        this.yesCom.setText(text);
    },

    getText: function () {
        return this.yesCom.getInput().val();
    },

    install: function () {

    }
});