/**
 * 表格编辑器基础类
 * @type {*}
 */
YIUI.CellEditor = YIUI.extend({
    /** 编辑器内部组件*/
    yesCom: null,
    /** 编辑器的值*/
    value: null,

    setValue: function (value) {
        this.value = value;
    },
    getValue: function () {
        return this.value;
    },
    render: function (parent) {
        this.onRender(parent);
        parent.append(this.yesCom.getEl());
        this.install();
    },
    getText: function () {
        return this.text;
    },
    setText: function (text) {
        this.text = text;
    },
    getEl: function () {
        return this.yesCom.getEl();
    },
    focus:$.noop,
    onRender: $.noop,
    beforeDestroy: $.noop,
    install: $.noop
});