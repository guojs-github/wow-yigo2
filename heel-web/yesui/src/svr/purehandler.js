YIUI.EventHandler = (function () {
    var Return = {

        /**
         * 菜单树的点击事件
         */
        doTreeClick: function (control, container) {
            var path = control.path, paras, close = control.close;
        	var target = control.target;
        	var node = $("[path='"+path+"']");
			var enable = node.attr("enable");
			var close = control.close;
			if( enable !== undefined && !YIUI.TypeConvertor.toBoolean(enable) )
				return;
			var single = false;
        	if (node.length > 0) {
        		single = YIUI.TypeConvertor.toBoolean(node.attr("single"));
//        		if(single) {
//                    var formKey = node.attr("formKey");
                    paras = node.attr("paras");
//                	var li = $("[formKey='"+formKey+"']", container.el);
//                    if(!paras.isEmpty()) {
//                    	li = $("[formKey='"+formKey+"'][paras='"+paras+"']", container.el);
//                    }
//                	if(li.length > 0) {
//                		li.click();
//                		return;
//                	}
//        		}
        	}
        	
        	YIUI.HeadInfoUtil.put(control, YIUI.HeadInfoOptType.STR_Entry);
        	
            var formKey = node.attr("formKey"), appKey = node.attr("appKey");

            var builder = new YIUI.YIUIBuilder(formKey);
            builder.setContainer(container);
            builder.setTarget(target);
            builder.setClose(close);

            new YIUI.MetaService().getMetaFormByEntry(path, appKey)
                .then(function(meta){
					if(!meta) {
						return;
					}
					
                    if( single ) {
                        var lis = $("[formKey='"+formKey+"']", container.el),li;
                        lis.each(function () {

                            var checkSingle = YIUI.TypeConvertor.toBoolean($(this).attr("single"));

                            if( checkSingle && $(this).attr("paras") == paras ) {
                                return li = $(this);
                            }
                        });
                    	if( li ) {
                            return li.click();
                    	}
                    }
                	
                    var appEnv = new YIUI.AppEnv();
                    appEnv.setAppKey(appKey);

                    var metaForm = new YIUI.MetaForm(meta);
                    var emptyForm = new YIUI.Form(metaForm, appEnv);
                    emptyForm.single = single;
                    emptyForm.entryPath = path;
                    emptyForm.entryParas = paras;
                    emptyForm.entryClose = close;

                    if((emptyForm.type == YIUI.Form_Type.Entity ||emptyForm.type == YIUI.Form_Type.Dict)
                        && emptyForm.metaForm.initState == YIUI.Form_OperationState.New){

                        emptyForm.setOptQueue(new YIUI.OptQueue(new YIUI.NewOpt(emptyForm)));
                    }

                    builder.builder(emptyForm);
                }); 

            YIUI.HeadInfoUtil.clear();
        },

        doCloseForm: function (control) {
            var formID = control.ofFormID;
            var form = YIUI.FormStack.getForm(formID);
			if(form){
				form.fireClose();
			}
        }

    };
    return Return;
})();
