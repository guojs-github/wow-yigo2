/**
 * 上传按钮控件。
 */
YIUI.Control.UploadButton= YIUI.extend(YIUI.Control, {
    /**
     * String。
     * render控件时，为控件自动创建的DOM标签。
     */
    autoEl: '<div></div>',

    handler: YIUI.UploadButtonHandler,
    
    behavior: YIUI.UploadButtonBehavior,
    
    /** 允许上传的文件的类型, 用";"隔开*/
    allowedTypes: '',
    
    /** 上传文件的大小,-1表示无限制 */
    maxSize: -1,
    
    /** 前台完成事件 **/
    finishedEvent: '',
    
    /**  是多文件上传 （暂时没有处理）**/
    isMultiFile: false,
	
    init: function (options) {
        this.base(options);
        var meta = this.getMetaObj();
        this.allowedTypes = meta.Allowedtypes || this.allowedTypes;
        this.maxSize = meta.MaxSize || this.maxSize;
        this.finishedEvent = $.isUndefined(meta.FinishedEvent) ? "" : meta.FinishedEvent.trim();
    },

    needClean: function () {
        return false;
    },

    setTip: function (tip) {
        if(this.tip) {
    		tip = this.tip;
    	}
        if(tip) {
            tip = YIUI.TypeConvertor.toString(tip);
            tip = tip.replace(/\\n/g, "\r");
        }
        $(".upload", this.el).attr("title", tip);
    },

    focus:function () {
        this.base();
        this.el.attr("tabindex",0).focus();
    },

    
    getShowText: function() {
    	return this.value;
    },

    getFormatEl: function() {
    	return this.uploadButton ? this.uploadButton.getTextButton() : null;
    },

    setFormatStyle: function (cssStyle) {
        this.cssStyle = cssStyle;
        this.uploadButton && this.uploadButton.getTextButton().css(cssStyle);
        this.foreColor && this.el.css("color", this.foreColor);
        this.backColor && this.el.css("background-color", this.backColor);
        if (this.format) {
            var hAlign = this.format.hAlign;
            var $el = this.uploadButton.getEl();
            switch(hAlign) {
            case 0:
            	$el.css({textAlign: "left"});
                break;
            case 1:
            	$el.css({textAlign: "center"});
                break;
            case 2:
            	$el.css({textAlign: "right"});
                break;
            }
            var vAlign = this.format.vAlign;
            switch(vAlign){
            case 0:
                $("span.uploadButton", $el).css({
                	"vertical-align": "top"
                });
                break;
            case 2:
                $("span.uploadButton", $el).css({
                	"vertical-align": "bottom"
                });
                break;
            }
        }
    },
    
    setBackColor:function(backColor) {
        this.backColor = backColor;
    	this.el.css("background-color", backColor);
    },

    onSetWidth: function (width) {
        this.uploadButton.setWidth(width);
        
    },

    onSetHeight: function (height) {
        this.uploadButton.setHeight(height);
    },

    /**
     * 完成button的渲染。
     */
    onRender: function (ct) {
        this.base(ct);
        var $this = this,
        	form = YIUI.FormStack.getForm($this.ofFormID),
        	doc = form.getDocument();
        this.uploadButton = new YIUI.Yes_UploadButton({
            el:  $this.el,
            enable: $this.enable,
            IEFile: $.browser.isIE && $this.key && $this.key.toLowerCase().indexOf('upload') != -1,
            uploadFile: function($file){
            	var self = this;
            	var datas = {
            			file: $file,
            			tableKey: doc.mainTableKey,
            			fieldKey: $this.key,
            			maxSize: $this.maxSize,
            			allowedTypes: $this.allowedTypes,
            			finishedEvent: self.finishedEvent
               	};
            	$this.handler.upload(form, datas);
            },
            finishedEvent: function(){
            	$this.handler.finishedEvent($this.ofFormID, $this.finishedEvent, $this.key);
            },
        });
        this.uploadButton.setEnable($this.enable);
        this.uploadButton.getInput().attr("disabled", !$this.enable);
        this.el.addClass("ui-upload");
    },
    

    /**
     * 给DOM添加事件监听。
     */
    install: function () {
        var self = this;
        
        self.el.delegate(".upload","click",function (event) {
        	if( !self.enable ) {
                return false;
            }
            event.stopPropagation();
        });

        self.el.mousedown(function() {
            self.el.addClass("focus");
        }).mouseup(function() {
            self.el.removeClass("focus");
        });
        
//        self.el.keydown(function (event) {
//            var keyCode = event.keyCode || event.charCode;
//
//            switch ( keyCode ) {
//            case 13:
//            case 108:
////            	self.uploadButton.getInput().click();
//                break;
//            case 9:
//                self.focusManager.requestNextFocus();
//                event.preventDefault();
//                break;
//            }
//        });
    }
});
YIUI.reg('uploadbutton', YIUI.Control.UploadButton);