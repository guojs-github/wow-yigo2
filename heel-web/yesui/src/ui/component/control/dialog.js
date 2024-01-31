/**
 * 按钮控件。
 */
YIUI.Control.Dialog = YIUI.extend(YIUI.Control, {
    /**
     * String。
     * render控件时，为控件自动创建的DOM标签。
     */
    autoEl: '<div></div>',

    handler: YIUI.DialogHandler,
    
    msgType: YIUI.Dialog_MsgType.YES_NO_CANCEL,
    
    eventList: null,

    isDataBinding: function() {
        return false;
	},
    
    /**
     * 完成button的渲染。
     */
    onRender: function (ct) {
    	this.base(ct);
        this.eventList = {};
    	this.dialog = new YIUI.Yes_Dialog({
    		el: this.el,
    		title: this.title,
    		msg: this.msg,
    		msgType: this.msgType
    	});
    	this.el.addClass("ui-dlg");
    	this.dialog.show();
    },
    
    regEvent: function(key, callback) {
    	this.eventList[key] = callback;
    },
    
    getEvent: function(key) {
    	return this.eventList[key];
    },
    
    regExcp: function(excp) {
    	this.excp = excp;
    },
    
    setOwner: function(form) {
    	this.form = form;
    },
    
    getOwner: function() {
    	return this.form;
    },

    /**
     * 给DOM添加事件监听。
     */
    install: function () {
    	var self = this;
        $(".dlg-btn", self.el).click(function (event) {
        	var opt = $(this).attr("key");
	        var callback = self.getEvent(opt);
	        self.dialog.close();
        	self.handler.doOnClick(self.ofFormID, self.excp, opt, callback);
        });
        $(".dialog-close", self.el).click(function(event) {
	        var callback = self.getEvent(YIUI.Dialog_Btn.STR_NO);
	        self.dialog.close();
        	self.handler.doOnClick(self.ofFormID, self.excp, YIUI.Dialog_Btn.STR_NO, callback);
        });
    }
});
YIUI.reg('dialog', YIUI.Control.Button);