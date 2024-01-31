/**
 * 密码输入框。
 * 继承自TextEditor。
 */
YIUI.Control.PasswordEditor = YIUI.extend(YIUI.Control.TextEditor, {

	/**
	 * String。
	 * 自动创建为type为password的input。
	 */
    inputType: 'password',

    handler: YIUI.PasswordEditorHandler,

    behavior: YIUI.BaseBehavior,
    
    setTip: function(tip) {
    	if(this.el && this.tip) {
    		this.el.attr("title", this.tip);
    	}
    }
    
});
YIUI.reg('passwordeditor', YIUI.Control.PasswordEditor);