/**
 * 按钮控件。
 */
YIUI.Control.SearchBox = YIUI.extend(YIUI.Control, {

    handler: YIUI.SearchBoxHandler,
    
    behavior: YIUI.SearchBoxBehavior,
    
	providerKey: null,
	providerFormulaKey: null,
	providerDependency: null,
	
    onRender: function (parent) {
        this.base(parent);
        this.el.addClass("ui-srch");
        
        this.txt = $("<input type='text' class='txt'/>").appendTo(this.el);
        this.btn = $("<button class='btn'>...</button>").appendTo(this.el);
        
    },

    onSetHeight: function (height) {
        this.base(height);
    },

    onSetWidth: function (width) {
        this.base(width);
        this.txt.css("width", width - this.btn.outerWidth());
    },

    getControlValue: function() {
    	return this.txt.val();
    },

    checkEnd: function(value) {
    	this.value = value;
    	this.txt.val(this.value);
    },
    
    dependedValueChange: function(targetField, dependedField){
		var meta = this;
		if(!meta.providerKey){
			if(meta.providerDependency == dependedField){
				this.setValue(null, false, true);
				this.handler.setNeedRefresh(true);
			}
		}
	},

    focus: function () {
        this.base();
        this.txt && this.txt.focus();
    },
    
    install: function () {
        this.base();
        var self = this;

        self.btn.click(function(e) {
            if( self.enable ) {
                self.focusManager.focusOwner = self;
                var value = self.getControlValue();
                self.handler.doOnClick(self.ofFormID);
            }
        });

        self.txt.blur(function(e) {
            if( self.enable ) {
                self.focusManager.focusOwner = self;
                var value = self.getControlValue();
                self.handler.autoComplete(self, value);
            }
        });
    }
	
});
YIUI.reg('searchbox', YIUI.Control.SearchBox);