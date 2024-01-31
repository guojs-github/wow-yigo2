/**
 * 表格单元格搜索框组件
 * @type {*}
 */
YIUI.CellEditor.CellTextButton = YIUI.extend(YIUI.CellEditor.CellTextEditor, {
    init: function (opt) {
        this.base(opt);
        this.opt = opt;
    },

    onRender: function (parent) {
        this.base(parent);
        this.yesCom.el.addClass("ui-txtbtn");
        this._btn = $("<button class='btn txtbtn'>...</button>");
        this._btn.appendTo(this.yesCom.el);
        this._btn.css({height: this.yesCom.getInput().height() + "px", width:"20px", padding: "0", verticalAlign: "top"});
        this.yesCom.getInput().css({width: (parent.width() - this._btn.outerWidth()) + "px"});
    },

    finishInput: function () {
        return this.yesCom.finishInput();
    },

    install: function () {
        var self = this,
            yesCom = self.yesCom;
        this._btn.mousedown(function () {
            yesCom.processing = true;
        }).mouseup(function () {
            yesCom.processing = false;
        }).click(function () {
            self.opt.click();
        });
    }
});