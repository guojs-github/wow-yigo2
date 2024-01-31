(function () {
    YIUI.Yes_HyperLink = function (options) {
        var Return = {
            el: $("<a class='ui-hlk'></a>"),
            /** 超链接地址，也可以是Javascript代码执行 */
            //href: 'javascript:void(0);',
            /** 参见YIUI.Hyperlink_target*/
            targetType: YIUI.Hyperlink_TargetType.NewTab,
            /** 链接地址 */
            url: "",
            init: function () {
                var self = this;
                self.enable = options.enable;
                this.el.mousedown(function () {
                    self.enable && $(this).addClass("hover");
                }).mouseup(function () {
                        self.enable && $(this).removeClass("hover");
                    });
            },
            getEl: function () {
                return this.el;
            },
            setText: function (text) {
                this.el.html(text);
            },
            getText: function () {
                return this.el.html();
            },
            setHeight: function (height) {
                this.el.css({"line-height": height + "px", height: height + "px"});
            },
            setWidth: function (width) {
                this.el.css({ width: width + "px"});
            }
        };
        Return = $.extend(Return, options);
        if(!options.isPortal) {
        	Return.init();
        }
        return Return;
    }
})();