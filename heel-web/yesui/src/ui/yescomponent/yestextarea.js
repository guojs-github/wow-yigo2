(function () {
    YIUI.Yes_TextArea = function(options){


        var Return = {
            el:$("<div></div>"),
            _input:$("<textarea></textarea>"),
            /**
             * Number。
             * 允许输入的最大长度。
             */
            maxLength:  10000,

            /**
             * Number。
             * 输入字符大小写。
             */
            textCase: YIUI.TEXTEDITOR_CASE.NONE,

            /**
             * String。
             * 不允许输入的字符集合。
             */
            invalidChars: null,

            /**
             * String。
             * 当输入框为空时，显示的输入提示。
             */
            promptText: null,

            /**
             * Boolean。
             * 光标进入默认全选。
             */
            selectOnFocus: true,

            init:function(){
                this._input.appendTo(this.el);
                this.setValue(this.value);
                this.setTextCase(this.textCase);
                this.setMaxLength(this.maxLength);
                this.promptText &&  this.setPromptText(this.promptText);

            },
		    
		    isEnable: function() {
		    	return true;
		    },

            setValue: function (value) {
                this.value = value;
            },

            getInput: function () {
                return this._input;
            },

            focus: function () {
                this._input.focus();
            },
            setText: function (value) {
                if (this.getEl()) {
                    this._input.val(value);
                }
            },
            getValue: function () {
                var val = this._input.val();
                return val;
            },
            setBackColor: function (backColor) {
                this.backColor = backColor;
                this._input.css({
                    'background-image': 'none',
                    'background-color': backColor
                })
            },
            setForeColor: function (foreColor) {
                this.foreColor = foreColor;
                this._input.css('color', foreColor);
            },
            setFormatStyle: function (cssStyle) {
                this._input.css(cssStyle);
            },
            setHeight:function(height){
                this.getEl().css('height',height+'px');
                // this._input.css('height',height+'px');
            },
            setWidth:function(width){
                this.getEl().css('width',width+'px');
                // this._input.css('width',width+'px');
            },
            /**
             * input外层wrap了一层div。
             */
            getEl: function () {
                return this.el;
            },
            /** 设置输入字符大小写 */
            setTextCase: function (textCase) {
                var el = this._input;
                this.textCase = textCase;
                if (textCase === YIUI.TEXTEDITOR_CASE.UPPER) {
                    el.addClass('uppercase');
                } else {
                    el.removeClass('uppercase');
                }
                if (textCase === YIUI.TEXTEDITOR_CASE.LOWER) {
                    el.addClass('lowercase');
                } else {
                    el.removeClass('lowercase');
                }
            },
            /**
             * 设置不允许输入的字符
             * 如果validChars存在，则忽略
             */
            setInvalidChars: function (invalidChars) {
                if ($.isString(invalidChars)) {
                    this.invalidChars = invalidChars;
                }
            },
            /** 设置允许输入的最大长度 */
            setMaxLength: function (maxLength) {
                if ($.isNumeric(maxLength) && maxLength > 0) {
                    this.maxLength = maxLength;

                    this._input.attr("maxlength",maxLength);
                }

            },
            /** 设置输入提示 */
            setPromptText: function (promptText) {
                this.promptText = promptText;
                this._input.placeholder(this.promptText);
            },

            finishInput: function () {
                var self = this, curValue = this._input.val();
                if (curValue != YIUI.TypeConvertor.toString(self.value)) {
                    self.setValue(curValue);
                    self.commitValue(curValue);
                    // if (self.required) {
                    //     var required = (curValue == "");
                    //     self.setRequired(required);
                    // }
                }
            },
            commitValue: $.noop,

            doFocusOut: $.noop,

            install: function(){
                var self = this;
                var input = this._input;
                input.on('click',function(){
                    if(!self.isEnable()) return false;
                    self._input.addClass("focus");
                    if (self.needSelectAll){
                        this.select();
                        self.needSelectAll = false
                    }
                }).on('focusin',function(){
                    if(!self.isEnable()) return false;
                    if(self.selectOnFocus){
                        self.needSelectAll = self.selectOnFocus;
                    }
                }).on('blur',function(){
                    if(!self.isEnable()) return false;
                    self.finishInput(); 
                    self._input.removeClass("focus");
                });
                if($.browser.isIE) {
                    self._input.on('keypress', function(event) {
                        if(!self.isEnable()) return false;
                        if($(this).val().length > self.maxLength){
                            var tmpString = $(this).val();
                            $(this).val(tmpString.substring(0,self.maxLength));
                        }
                    });
                }

            }


        };
        Return = $.extend(Return, options);
        if(!options.isPortal){
            Return.init();
        }else{
            Return._input = $("textarea",Return.el);
            Return.setMaxLength(Return.maxLength);
            Return.promptText && Return.setPromptText(Return.promptText);
        }
        Return.install();
        return Return;
    }
})();