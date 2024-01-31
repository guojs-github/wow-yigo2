/**
 * 文本编辑框，主要是提供文本字符类型数据输入
 * 1、可以自定义文本输入最大字符长度（默认为255），一个中文也只算一个字符，例如：12abc好12,这个为8个字符长度
 * 2、可以自定义文本显示为全大写或全小写,默认为无限制，大小写都可输入
 * 3、可以自定义不可输入字符。例如：定义不可输入字符串为：“a2v:,A”,则字符串中的字母数字符号都不可输入，键盘按键按下后都没有反应。
 * 另外，特别需要注意的是一些转义字符，例如单引号（'），双引号（"），这些转义字符定义时需要加斜杠。
 * 例如，定义为：“A?:,\'\"”，则单引号和双引号都不可输入。
 * 注意：不可输入字符区分中英文字符，比如“\"”这是英文的双引号，“\””这时中文的双引号。
 * 4、文本框失去焦点时会判断文本框是否为空值，是，则灰色显示提示文本。获取焦点时会清空提示文本，并恢复字体颜色。
 */

YIUI.Control.TextEditor = YIUI.extend(YIUI.Control, {

    autoEl: "<span></span>",

    handler: YIUI.TextEditorHandler,

    behavior: YIUI.TextEditorBehavior,

    format_: YIUI.TextFormat,

    /**
     * Number。
     * 允许输入的最大长度。
     */
    maxLength: 255,

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
     * 是否去除首尾多余空格。
     */
    trim: false,

    /**
     * Boolean。
     * 光标进入默认全选。
     */
    selectOnFocus: true,

    /**
     * 掩码，为固定长度字符串。
     * 规定：
     *  9 : 任意数字，[0-9]
     *  a : 任意英文字母，[A-Za-z]
     *  * : 任意数字、英文字母，[A-Za-z0-9]
     *  _ : 控件里显示的占位符
     * 当掩码中需要包含9、a、*、\时，使用转义\9、\a、\*、\\。
     */
    mask: null,

    /**
     * String。
     * 右侧图标url。
     */
    icon: null,

    /**
     * String。
     * 左侧内嵌文本。
     */
    embedText: null,

    /**
     * 左侧图标
     */
    preIcon: null,

    /**
     * 保持焦点
     */
    holdFocus: false,

    keyEnter: "",

    init: function (options) {
        this.base(options);

        var meta = this.getMetaObj();
        this.textCase = $.isUndefined(meta.caseType) ? this.textCase : meta.caseType;
        this.embedText = $.isUndefined(meta.embedText) ? this.embedText : meta.embedText;
        this.holdFocus = $.isUndefined(meta.holdFocus) ? this.holdFocus : meta.holdFocus;
        this.icon = $.isUndefined(meta.icon) ? this.icon : meta.icon;
        this.invalidChars = $.isUndefined(meta.invalidChars) ? this.invalidChars : meta.invalidChars;
        this.mask = $.isUndefined(meta.mask) ? this.mask : meta.mask;
        this.preIcon = $.isUndefined(meta.preIcon) ? this.preIcon : meta.preIcon;
        this.promptText = $.isUndefined(meta.promptText) ? this.promptText : meta.promptText;
        this.trim = $.isUndefined(meta.trim) ?  this.trim : meta.trim;

        this.maxLength = $.isDefined(meta.maxLength) ? meta.maxLength : 255;
        this.selectOnFocus = $.isDefined(meta.selectOnFocus) ? meta.selectOnFocus : this.selectOnFocus;
        this.keyEnter = $.isDefined(meta.keyEnter) ? meta.keyEnter : this.keyEnter;

    },

    checkEnd: function(value) {
        this.value = value;
        this.yesText.setValue(value);
        this.yesText.setText(value);
    },

    getShowText: function() {
        return this.value;
    },

    getFormatEl: function() {
        return this.yesText ? this.yesText.getInput() : null;
    },

    setBackColor: function (backColor) {
        this.backColor = backColor;
        this.yesText && this.yesText.setBackColor(backColor);
    },

    setForeColor: function (foreColor) {
        this.foreColor = foreColor;
        this.yesText && this.yesText.setForeColor(foreColor);
    },

    setFormatStyle: function (cssStyle) {
        this.yesText && this.yesText.setFormatStyle(cssStyle);
    },

    onSetHeight: function (height) {
        this.yesText.setHeight(height);
    },

    onSetWidth: function (width) {
        this.yesText.setWidth(width);
    },

    /**
     * input外层wrap了一层span。
     */
    getOuterEl: function () {
        return this.el;
    },

    setTip: function (tip) {
        var tip = this.value;
        this.base(tip);
    },

    /**
     * 控件渲染到界面，不包含items的渲染。
     */
    onRender: function (parent) {
        this.base(parent);
        var $this = this;
        var meta = this.getMetaObj();

        this.yesText = new YIUI.Yes_TextEditor({
            el: $this.el,
            value: $this.value,
            textCase: $this.textCase,
            inputType: $this.inputType,
            trim: $this.trim,
            maxLength: $this.maxLength,
            promptText: $this.promptText,
            selectOnFocus: $this.selectOnFocus,
            invalidChars: $this.invalidChars,
            embedText: $this.embedText,
            icon: $this.icon,
            preIcon: $this.preIcon,
            format: $this.format_,
            isEnable: function() {
                return $this.enable;
            },
            commitValue: function (newValue) {
                $this.setValue(newValue, true, true);
            }
        });
        this.el.addClass("ui-txted");
        this.icon && this.setIcon(this.icon);
        this.preIcon && this.setPreIcon(this.preIcon);
        this.holdFocus && this.setHoldFocus(this.holdFocus);
        this.checkEnd($this.value);
    },

    setIcon: function (icon) {
        this.icon = icon;

        var  _span = $('<span class="icon" />');
    	
    	this.getImageBase64URL(icon).then(function(url) {
    		_span.css('background-image', 'url('+ url +')');
        });
    	
    	_span.appendTo(this.yesText.getEl());
    },

    setPreIcon: function (preIcon) {
        this.preIcon = preIcon;

        var  _span = $('<span class="pre-icon" />');
    	
    	this.getImageBase64URL(preIcon).then(function(url) {
    		_span.css('background-image', 'url('+ url +')');
        });
    	
    	_span.appendTo(this.yesText.getEl());
    
    },

    setHoldFocus: function(holdFocus) {
        this.holdFocus = holdFocus;
    },

    afterRender: function () {
        this.base();
    },

    focus: function () {
        this.base();
        this.yesText && this.yesText.focus();
    },

    install: function () {
        this.base();
        var self = this;

        var editor = this.yesText.getInput();

        editor.click(function () {
            if( self.enable ) {
                self.focusManager.focusOwner = self;
            }
        });

        editor.keydown(function (event) {
            if(!self.enable) return false;
            switch (event.keyCode || event.charCode) {
                case 13:
                case 108: // enter
                    self.setValue(self.yesText.getValue(),true,true);
                    if (self.holdFocus) {
                        self.yesText.getInput().focus();
                    } else {
                        self.focusManager.requestNextFocus();
                    }
                    if( self.keyEnter ) {
                        self.handler.doEnterPress(self.ofFormID, self.keyEnter);
                    }
                    event.preventDefault();
                    break;
                case 9: // tab
                    self.focusManager.requestNextFocus();
                    event.preventDefault();
                    break;
            }
        });
    }

});
YIUI.reg('texteditor', YIUI.Control.TextEditor);

// 掩码控件也以文字输入框实现
YIUI.reg('maskeditor', YIUI.Control.TextEditor);