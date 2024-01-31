/**
 * 表格单元格图片组件
 * @type {*}
 */
YIUI.CellEditor.CellImage = YIUI.extend(YIUI.CellEditor, {
    init: function (opt) {
        var self = this;
        this.options = opt;

        this.yesCom = new YIUI.Yes_Image({
            sourceType: self.options.sourceType,
            stretch: self.options.stretch,
            imageCut: self.options.imageCut,
            uploadImg:function ($this, paras) {
                var form = YIUI.FormStack.getForm(self.options.ofFormID);
                var paras = $.extend({
                    service: "UploadImage",
                    formKey: form.formKey,
                    operatorID: $.cookie("userID"),
                    fileID: -1,
                    oid: form.getOID(),
                    mode: 1,
                    isFixName: false,
                    maxSize: self.options.maxSize,
                    types: YIUI.ImageTypes,
                    file: $this,
                    success: function (data) {
                        self.saveCell(data.replace(/\\/g, "/"));
                    }
                }, paras);
                YIUI.FileUtil.ajaxFileUpload(paras);
            },
            click: function() {
                if (!self.enable || (!self.value && !self.image))
                    return;
                self.click();
            },
            clear: function () {
                Svr.SvrMgr.deleteImage({
                    formKey: self.options.ofFormKey,
                    filePath: self.value,
                    operatorID: $.cookie("userID"),
                    service: "DeleteImage",
                    mode: 1
                });
                self.saveCell("");
            },
            getImageURL:function (path, callback) {            	
                return self.options.getImageBase64URL(path).then(callback);
            }
        });

        this.yesCom.getEl().addClass("ui-img cellEditor");

        this.setValue(opt.image || opt.value);
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
        	
        	this.options.getImageBase64URL(value).then(function(url){
        		_yesCom.setImagePath(url);
        	});
        	
        } else {
            this.yesCom.setImagePath(window.cssPath + "/images/empty.PNG");
        }
        this.yesCom.update(value);
    },
    install: function () {
        $.noop();
    }
});