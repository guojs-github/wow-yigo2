/**
 * 富文本编辑框控件。
 */
YIUI.Control.RichEditor = YIUI.extend(YIUI.Control, {
    /**
     * String。
     * render控件时，为控件自动创建的DOM标签。
     */
    autoEl: '<div><textarea></textarea></div>',
    editor: null,
    shadow: null,
    _input: null,
    value: null,
    required: false,
    emptyV: "<p><br></p>",

    handler: YIUI.RichEditorHandler,

    behavior: YIUI.RichEditorBehavior,

    checkEnd: function(value) {
        this.value = value;
        if(value == "" || value == null) {
            this._input.html(this.emptyV);
        }else{
            this._input.html(value);
        }
    },
    
    setEnable: function (enable) {
        this.base(enable);
        if(!this.shadow) return;
        if (enable) {
            this.shadow.hide();
        } else {
            this.shadow.show();
        }
        this.editor.$txt.attr("contenteditable",enable);
    },

    setVisible: function(visible) {
        this.base(visible);
        if(!this.editor) return;
        if (!visible) {
            this.editor.$editorContainer.css("display", "none");
        } else {
            this.editor.$editorContainer.css("display", "block");
        }
    },

    onSetHeight: function (height) {
        this.base(height);
        var btnHeight = this.editor.$btnContainer.outerHeight();
        var h = this.el.height();
        this.editor.$txt.css("min-height", h - btnHeight);
        this.editor.$txtContainer.css("height", h - btnHeight);
        this.shadow.css("height", btnHeight);
    },

    onSetWidth: function (width) {
        var btnWidthArr = new Array();
        var btngroups = $(".wangEditor-btn-container-group");
        for (var i=0; i < btngroups.length; i++) {
            btnWidthArr.push(btngroups[i].offsetWidth);
        }
        btnWidthArr.sort(function (a, b) {
            return a-b;
        });
        var maxbtnWidth = btnWidthArr[btnWidthArr.length - 1];
        if (width < maxbtnWidth) {
            var columngap = parseInt(this.getOuterEl().css("margin-left")) || 32;
            var realWidth = maxbtnWidth + columngap;
            this.base(realWidth);
            this.editor.width = realWidth;
            this.shadow.css("width", realWidth);
        } else {
            this.base(width);
            this.editor.width = width;
            this.shadow.css("width", width);
        }
    },

    onRender: function (ct) {
        this.base(ct);
        this.editor = $("textarea", this.el).wangEditor();
        this.shadow = $("<div class='ui-redt sd'></div>").appendTo(this.el);
        this.shadow.parent().css("position", "relative");
        this._input = this.editor.$txt;
        if (this.value) {
            this._input.html(this.value);
        }
        this.el.addClass("ui-rich");
    },
    focus: function () {
        this.base();
        this.el.focus();
    },

    install : function() {
        this.base();
        var self = this;

        self._input.click(function () {
            if( self.enable ) {
                self.focusManager.focusOwner = self;
            }
        });

        self._input.bind("blur", function() {
            self.finishInput();
        })
    },

    finishInput: function () {
        var curValue = this._input.html();
        if(curValue != this.emptyV) {
            this.setValue(curValue, true, true);
        }
    },

    valueChange: function (newValue) {
        this.setValue(newValue, true, true);
    },

    getOuterEl: function () {
        return this.el;
    }
});
YIUI.reg('richeditor', YIUI.Control.RichEditor);