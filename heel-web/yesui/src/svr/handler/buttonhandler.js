YIUI.ButtonHandler = (function () {
    var Return = {
        doOnClick: function (formID, formula, key) {
            var form = YIUI.FormStack.getForm(formID);
            var callback = form.getEvent(key);
            try {
            	if ( callback != null ) {
                	callback(key);
    			} else {
    	            if (formula) {
                        var cxt = new View.Context(form);
    	                form.eval(formula, cxt, null);
    	            }
    			}
			} catch (e) {
                console.log(e.stack);
				YIUI.HeadInfoUtil.clear();
                throw e;
			}
        }
    };
    Return = $.extend({}, YIUI.Handler, Return);
    return Return;
})();
