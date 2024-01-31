/**
 * 表格单元格图片列表组件
 * @type {*}
 */
YIUI.CellEditor.CellImageList = YIUI.extend(YIUI.CellEditor, {
    init: function (opt) {
        var self = this;
        this.options = opt;
        var form = YIUI.FormStack.getForm(self.options.ofFormID);
        this.yesCom = new YIUI.Yes_ImageList({
              stretch: self.options.stretch,
              items: self.options.items,
              click: function() {
                  if (!self.enable || !self.value)
                      return;
                  self.click();
              },
        });
        this.yesCom.getEl().addClass("ui-img cellEditor");
        this.setValue(opt.value);
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
        	var imagePath = this.yesCom.getImagePathByValue(value);
			
        	var _yesCom = this.yesCom;
        	this.options.getImageBase64URL(imagePath).then(function(url){
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