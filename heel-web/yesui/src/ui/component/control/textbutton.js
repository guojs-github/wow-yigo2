YIUI.Control.TextButton = YIUI.extend(YIUI.Control.TextEditor, {

    handler: YIUI.TextButtonHandler,

    behavior: YIUI.TextEditorBehavior,

    init: function (options) {
        this.base(options);
        var meta = this.getMetaObj();
        this.textCase = meta.caseType || this.caseType;
        this.promptText = meta.promptText || this.promptText;
        this.invalidChars = $.isUndefined(meta.invalidChars) ? this.invalidChars : meta.invalidChars;
        this.maxLength = $.isDefined(meta.maxLength) ? meta.maxLength : 255;
        this.clickContent = meta.onClick || "";
        this.keyEnter = meta.keyEnter || "";
    },

    onRender: function (parent) {
        this.base(parent);
        this.el.addClass("ui-txtbtn");
        this._btn = $("<button class='btn'></button>").appendTo(this.el);
    },

    onSetHeight: function (height) {
        this.base(height);
        this._btn.css({height: height + "px"});
    },

    onSetWidth: function (width) {
        this.base(width);
        var btnW = this._btn.outerWidth();
        $("input", this.el).css({width: (width - btnW) + "px"});
        var cIcon = $("span.clear", this.el), right = cIcon[0].style.right;
        cIcon.css({right: (right + btnW) + "px"});
    },

    setTip: function (tip) {
        var tip = $("input", this.el).val();
        this.base(tip);
    },

    getFormatEl: function() {
    	return this.el ? $("input", this.el) : null;
    },

    install: function () {
        this.base();
        var self = this;

        $("input,button", this.el).click(function () {
            if( self.enable ) {
                self.focusManager.focusOwner = self;
            }
        });

        var yesCom = self.yesText;

        this._btn.mousedown(function () {
            yesCom.processing = true;
        }).mouseup(function () {
            yesCom.processing = false;
        }).click(function () {
            if( !self.enable ) {
                return false;
            }

            self.handler.doOnClick(self.ofFormID, self.clickContent);
        });
    }
});
YIUI.reg('textbutton', YIUI.Control.TextButton);