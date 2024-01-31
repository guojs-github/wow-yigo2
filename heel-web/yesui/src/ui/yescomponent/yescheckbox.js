(function () {
    YIUI.Yes_CheckBox = function (options) {
        var Return = {
            el: $("<div></div>"),
            /**是否默认选中*/
            checked: false,
            /**显示文本*/
            text: "",

            getEl: function () {
                return this.el;
            },
            init: function () {
                $("<span class='chk'/>").appendTo(this.el);
                $("<label></label>").appendTo(this.el);
            },
            setChecked: function (checked) {
                this.checked = checked;
                var checkBox = $("span", this.el);
                if (checked === true) {
                    checkBox.attr('isChecked', true);
                    checkBox.addClass('checked');
                    checkBox[0].checked = true;
                } else {
                    checkBox.attr('isChecked', false);
                    checkBox.removeClass("checked");
                    checkBox[0].checked = false;
                }
            },
            setText: function (text) {
                var label = $("label", this.el);
                var isShow = !(text === undefined || text.length == 0)
                label.css({display: (isShow ? "inline-block" : "none")})
                label.html(text);
            },
            getCheckBox: function () {
                return $("span", this.el);
            },
            setEnable: function(enable) {
            	this.enable = enable;
            },
            
            commitValue: $.noop,
            
            getLabel: function () {
                return $("label", this.el);
            },
            getValue: function () {
                return  $("span", this.el).attr("isChecked") === "true" ? 1 : 0;
            },
            getText: function () {
                return  $("label", this.el).html();
            },
            setHeight: function (height) {
                $("label", this.el).css({height: height + "px", lineHeight: height + "px" });
                var $input = $("span.chk", this.el);
                $input.css("margin-top", (height - $input.height()) / 2);
            },
            setWidth: function (width) {
                $("label", this.el).css("width", width - $("span", this.el).outerWidth());
            },

            install: function () {
            	$(".chk").focus(function(){
                	$(this).parent().addClass("focus");
                	$(this).parent().find(".required-icon").removeAttr("tabindex");
                });
                $(".chk").blur(function(){
                	$(this).removeClass("focus-select");
                	$(this).parent().removeClass("focus");
                	$(this).parent().find(".required-icon").attr("tabindex","0");
                });
            }
        };
        Return = $.extend(Return, options);
        if(!options.isPortal) {
        	Return.init();
        }
        Return.install();
        return Return;
    }
})();