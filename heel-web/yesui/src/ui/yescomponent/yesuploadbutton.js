(function () {
    YIUI.Yes_UploadButton = function (options) {
        var Return = {
            el: $("<div></div>"),
            id: "",
            /** 图标 */
            icon: null,
            /** 显示文本 */
            caption: "上传",
            
            enable: true,
            
            ofFormID: "",
            

            init: function () {
                var self = this;
                this.id = this.id || this.el.attr("id");
                
                this._span = $("<span class='uploadButton'></span>").appendTo(this.el);
                $("<span class='txt'></span>").html(this.caption).appendTo(this._span);
                this._input = $("<input type='file'  class='upload' name='file'/>").appendTo(this._span);
                this.initUploadButton();
                
            },
            
            initUploadButton: function(){
            	var self = this;
                this.getInput().attr("id", "uploadInput_" + this.id);
                var defaultTip = YIUI.I18N.getString("UPLOADBUTTON_TIP","请选择文件...")
                this.getInput().attr("title", defaultTip);
                self.el.delegate(".upload","change",function (event) {
                	var target = $(event.target);
                	self.uploadFile(target);
               	});
            },
            
            getEl: function () {
                return this.el;
            },
            
            setEnable: function (enable) {
                this.enable = enable;
                this.el[0].enable = enable;
            },
            
            getInput: function () {
                return this._input;
            },
            
            uploadFile: $.noop,
            finishedEvent: $.noop,
            
            getKeys: function(){
            	return this.keys;
            },
            
            getTextButton: function () {
                return $("span.txt", this.el);
            },
            setWidth: function (width) {
            	this.el.css("width", width);
                $("span", this.el).css("width", this.el.width());
            },
            setHeight: function (height) {
            	this.el.css("height", height);
                $("span", this.el).css("height", this.el.height() + "px");
            }
            
           
        };
        Return = $.extend(Return, options);
        Return.init();
        return Return;
    }
})();