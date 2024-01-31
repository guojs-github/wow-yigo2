YIUI.ToolBarHandler = (function () {
    var Return = {
        /**
         * 控件的点击事件(单击)
         */
        doOnClick: function (formID, item) {
        	var id = formID;
            if(item.formID) {
            	id = item.formID;
            }
            var form = YIUI.FormStack.getForm(id);

            var preAction = item.preAction;
            var action = item.action;
            var excpAction = item.excpAction;

            var cxt = new View.Context(form);
            cxt.setTag(item.tag);
            cxt.setExpAction(excpAction);

          try {
    			if (preAction) {
    				form.eval(preAction, cxt, null);
    			}

                if (action) {
                    form.eval(action, cxt, null);
                }

			} catch (e) {
				if(excpAction) {
					try {
						form.eval(excpAction, cxt);
					} catch (t) {
					}
				}
                console.log(e.stack);
                throw e;
			}
            
        }
    };
    Return = $.extend({}, YIUI.Handler, Return);
    return Return;
})();
