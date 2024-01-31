/**
 * 表格单元格图标组件
 * @type {*}
 */
YIUI.CellEditor.CellIcon = YIUI.extend(YIUI.CellEditor, {
    init: function (opt) {
        var self = this;
        this.options = opt;
        this.yesCom = new YIUI.Yes_Icon({});
        this.yesCom.getEl().addClass("ui-img cellEditor");
        this.setValue(opt.icon || opt.value);
        this.setEnable(opt.enable);
    },
    onRender: function (parent) {
        this.base(parent);
    },
    getEl: function () {
        return this.yesCom.getEl();
    },
    setEnable: function (enable) {
        this.yesCom.setEnable(enable);
    },
    setValue: function (value) {
        this.base(value);
        if( value ) {
        	var _yesCom = this.yesCom; 
        	
        	this.options.getImageBase64URL(value).then(function(url) {
        		_yesCom.setImagePath(url);
        	});
        } else {
        	this.yesCom.setImagePath(window.cssPath + "/images/empty.PNG");
        }
        this.yesCom.setValue(value);
    },
    install: function () {
        $.noop();
    }
});