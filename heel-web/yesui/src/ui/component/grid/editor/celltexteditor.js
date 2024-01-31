/**
 * 表格单元格文本框编辑器
 * @type {*}
 */
YIUI.CellEditor.CellTextEditor = YIUI.extend(YIUI.CellEditor, {
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
     * 输入规范处理
     */
    format: YIUI.TextFormat,

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

    init: function (opt) {

        var meta = opt.editOptions;
        this.textCase = $.isUndefined(meta.caseType) ? this.textCase : meta.caseType;
        this.embedText = $.isUndefined(meta.embedText) ? this.embedText : meta.embedText;
        this.holdFocus = $.isUndefined(meta.holdFocus) ? this.holdFocus : meta.holdFocus;
        this.icon = $.isUndefined(meta.icon) ? this.icon : meta.icon;
        this.invalidChars = $.isUndefined(meta.invalidChars) ? this.invalidChars : meta.invalidChars;
        this.mask = $.isUndefined(meta.mask) ? this.mask : meta.mask;
        this.trim = $.isUndefined(meta.trim) ?  this.trim : meta.trim;
        this.preIcon = $.isUndefined(meta.preIcon) ? this.preIcon : meta.preIcon;
        this.promptText = $.isUndefined(meta.promptText) ? this.promptText : meta.promptText;

        this.selectOnFocus = $.isDefined(meta.selectOnFocus) ? meta.selectOnFocus : this.selectOnFocus;
        this.maxLength = $.isDefined(meta.maxLength) ? meta.maxLength : 255;

    },

    onRender: function (parent) {
        this.base(parent);

        var self = this;
        this.yesCom = new YIUI.Yes_TextEditor({
            value: self.value,
            required: self.required,
            textCase: self.textCase,
            inputType: self.inputType,
            trim: self.trim,
            maxLength: self.maxLength,
            promptText: self.promptText,
            selectOnFocus: self.selectOnFocus,
            invalidChars: self.invalidChars,
            embedText: self.embedText,
            icon: self.icon,
            preIcon: self.preIcon,
            format: self.format,
            cell: true,
            commitValue: function (newValue) {
                self.saveCell(newValue);
            },
            doFocusOut: function(){
                return self.doFocusOut();
            }
        });

        this.yesCom.setEmbedText(this.yesCom.embedText);
        this.yesCom.setWidth(parent.width());
        this.yesCom.setHeight(parent.height());
    },
    getInput: function () {
        return this.yesCom.getInput();
    },

    focus: function () {
        this.yesCom.focus();
    },

    getValue: function () {
        return this.yesCom.value;
    },

    setValue: function (value) {
        this.base(value);
        this.yesCom.setValue(value);
    },

    getText: function () {
        return this.yesCom.value;
    },

    setText: function(text){
        this.yesCom.setText(text);
    },

    finishInput: function () {
        return this.yesCom.finishInput();
    },
    install: function () {
        this.base();
        // var self = this;
        // this.getInput().blur(function (e) {
        //     self.yesCom.saveCell();
        // });
    }
});