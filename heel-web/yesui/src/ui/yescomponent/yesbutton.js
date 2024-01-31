(function () {
    YIUI.Yes_Button = function (options) {
        var Return = {
            el: $("<div><button></button></div>"),
            /** 图标 */
            icon: null,
            /** 显示文本 */
            caption: "按钮",

            init: function () {
                var self = this;
                var $input = $("button", this.el);
                if( options.IEFile ) {
                    $("<input type='file' class='upload' name='file'/>").appendTo(this.el);
                }
                $("<span class='txt'></span>").html(this.caption).appendTo($input);
            },
            getEl: function () {
                return this.el;
            },
            getTextButton: function () {
                return $("span.txt", this.el);
            },
            getButton: function () {
                return $("button", this.el);
            },
            setWidth: function (width) {
                this.el.css("width", width);
                $("button", this.el).css("width", this.el.width());
            },
            setHeight: function (height) {
                this.el.css("height", height);
                $("button", this.el).css("height", this.el.height() + "px");
                $("button", this.el).css("line-height", this.el.innerHeight() + "px");
            }
        };
        Return = $.extend(Return, options);
        Return.init();
        return Return;
    }
})();