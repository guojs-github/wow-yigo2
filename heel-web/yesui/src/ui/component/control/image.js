/**
 * 目前显示上传的图片，需要在tomcat\conf\Catalina\localhost底下配置path.xml
 * 该文件，设置了一个虚拟路径，其内容为：
 *          <Context docBase="D:/yes/test/Config/YigoApp/Data" path="/path" reloadable="true">
 *          </Context>
 *  其中docBase为上传的图片所在服务端的路径
 * @type {*}
 */
"use strict";
YIUI.Control.Image = YIUI.extend(YIUI.Control, {

    sourceType: YIUI.IMAGE_SOURCETYPE.DATA,
    maxSize: -1,
    imageCut: false,
    stretch: false,

    handler: YIUI.ImageHandler,

    behavior: YIUI.ImageBehavior,

    init: function (options) {
        this.base(options);
        var meta = this.getMetaObj();
        this.sourceType = meta.sourceType || this.sourceType;
        this.image = meta.image;
        this.stretch = meta.stretch || this.stretch;
        this.maxSize = meta.maxSize || this.maxSize;
        this.imageCut = meta.imageCut || this.imageCut;
        this.clickContent = $.isUndefined(meta.onClick) ? "" : meta.onClick.trim();
    },
    
    setEnable: function(enable) {
    	this.base(enable);
    	if( this.el ) {
    		this._image.setEnable(enable);
    	}
    },

    setControlValue: function (value) {
        if( this.sourceType == YIUI.IMAGE_SOURCETYPE.RESOURCE ) {
            return;
        }
        this.base( value );
    },

    checkEnd: function(value) {
        this.value = value;
        var img = this._image;
        if( value ) {
        	this.getImageBase64URL(value).then(function(url) {
        		img.setImagePath(url);
        	});
        	
        } else {
            this._image.setImagePath(window.cssPath + "/images/empty.PNG");
        }
        this._image.update(value);
    },
    
    setSourceType: function (sourceType) {
        this.sourceType = sourceType;
        this._image.setSourceType(sourceType);
    },
    onSetHeight: function (height) {
        this.base(height);
    },
    onSetWidth: function (width) {
        this.base(width);
    },
    setImageCut: function (imageCut) {
        this._image.setImageCut(imageCut);
    },

    onRender: function (ct) {
        this.base(ct);
        var _this = this;
        this._image = new YIUI.Yes_Image({
            el: _this.el,
            sourceType: _this.sourceType,
            stretch: _this.stretch,
            imageCut: _this.imageCut,
            uploadImg: function ($this, paras) {
                var form = YIUI.FormStack.getForm(_this.ofFormID);
                paras = $.extend({
                    service: "UploadImage",
                    formKey: form.formKey,
                    operatorID: $.cookie("userID"),
                    fileID: -1,
                    oid: form.getOID(),
                    mode: 1,
                    isFixName: false,
                    maxSize: _this.maxSize,
                    types: YIUI.ImageTypes,
                    file:$this,
                    success:function (data) {
                        _this.setValue(data.replace(/\\/g, "/"), true, true);
                    }
                }, paras);
                YIUI.FileUtil.ajaxFileUpload(paras);
            },
            click: function() {
                if (!_this.enable || (!_this.value && !_this.image))
                    return;
                _this.handler.doOnClick(_this.ofFormID, _this.clickContent);
            },
            clear: function () {
                Svr.SvrMgr.deleteImage({
                    formKey: _this.ofFormKey,
                    filePath: _this.value,
                    operatorID: $.cookie("userID"),
                    service: "DeleteImage",
                    mode: 1
                });
                _this.setValue("", true, true);
            },
            getImageURL: function (path, callback) {
            	return _this.getImageBase64URL(path).then(callback);
            }
        });

        this.el.addClass("ui-img");

        this.checkEnd(this.image || this.value);
    },

    focus: function () {
        this.base();
        this.el.attr("tabIndex", this.getTabIndex());
        this.el.focus();
    },
    install: function () {
        $(this.el).unbind("click");
        var self = this;
        this.el.keydown(function (event) {
            var keyCode = event.keyCode || event.charCode;
            if (keyCode === 9 || keyCode === 13 || keyCode === 108) {  //tab
                self.el.removeAttr("tabIndex");
                self.el.blur();
                self.focusManager.requestNextFocus();
                event.preventDefault();
            }
        });
    }
});
YIUI.reg('image', YIUI.Control.Image);