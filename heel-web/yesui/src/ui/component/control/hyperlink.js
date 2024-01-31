/**
 * 超链接控件。
 */
YIUI.Control.Hyperlink = YIUI.extend(YIUI.Control, {
    /**
     * String。
     * 自动创建为超链接a。
     */
    autoEl: '<a class="ui-hlk"></a>',

    handler: YIUI.HyperLinkHandler,
    
    behavior: YIUI.HyperLinkBehavior,

    /**
     * String。
     * 超链接地址，也可以是Javascript代码执行。
     */
    //href : 'javascript:void(0);',
    /**
     * String。
     * 在何处打开页面：_blank,_self,_parent,_top,framename。
     */
    target: '_self',
    /**
     * String,参见 YIUI.Hyperlink_TargetType
     */
    targetType: YIUI.Hyperlink_TargetType.NewTab,

    init: function (options) {
        this.base(options);
        var meta = this.getMetaObj();
        this.clickContent = $.isUndefined(meta.onClick) ? "" : meta.onClick.trim();
        this.url = meta.url || null;
        this.formulaURL = meta.formulaURL || null;
        this.targetType = $.isUndefined(meta.targetShowType) ?  this.targetType : meta.targetShowType;
    },
    
    setText: function (text) {
        this.hyperlink.setText(text);
    },
    
    getShowText: function() {
    	return this.hyperlink.getText();
    },

    needClean: function () {
        return false;
    },

    /** 完成超链接的渲染 */
    onRender: function (ct) {
        this.base(ct);
        var $this = this;
        this.hyperlink = new YIUI.Yes_HyperLink({
            el: $this.el,
            url: $this.url,
            formulaURL: $this.formulaURL,
            targetType: $this.targetType
        });
        this.setValue(this.value);
        this.text = this.value;
        if (this.text) {
            this.hyperlink.setText(this.text);
        } else {
            this.hyperlink.setText(this.caption);
        }
    },

    setTip: function (tip) {
        var tip = this.text || this.caption;
        this.base(tip);
    },

    onSetHeight: function (height) {
        this.base(height);
        this.hyperlink.setHeight(height);
    },
    focus: function () {
        this.base();
        this.el.attr("tabindex",0).focus();
    },
    install: function () {
        var self = this;

        this.el.click(function (e) {
            if( self.enable ) {

               self.focusManager.focusOwner = self;
               var url = null;
               if (self.url){
                   url = self.url;
               }else{
                   var form = YIUI.FormStack.getForm(self.ofFormID);
                   var cxt = new View.Context(form);
                   url = form.eval(self.formulaURL, cxt, null);
               }
                if( url ) {
                    if( self.targetType == YIUI.Hyperlink_TargetType.New ) {
                        window.open(url, YIUI.Hyperlink_target.New, "alwaysRaised=yes");
                    }else if (self.targetType == YIUI.Hyperlink_TargetType.NewTab){
                        window.open(url);
                    }else if (self.targetType == YIUI.Hyperlink_TargetType.Current){
                        window.open(url, YIUI.Hyperlink_target.Current);
                    }
                } else {
                    self.handler.doOnClick(self.ofFormID, self.clickContent);
                }
            } else {
                e.preventDefault();
            }
        });

        this.el.keydown(function (event) {
            var keyCode = event.keyCode || event.charCode;
            if (keyCode === 9 || keyCode === 13 || keyCode === 108) {  //tab
                self.focusManager.requestNextFocus();
                event.preventDefault();
            }
        });
    },

    checkEnd: function(value) {
    	this.value = value;
        this.text = value;
        this.hyperlink.setText(this.text);
	}
	
});
YIUI.reg('hyperlink', YIUI.Control.Hyperlink);