YIUI.SearchBoxHandler = (function () {
    var Return = {

    	needRefresh: true,
    	
    	providerKey: null,
    	
    	getProviderKey: function(control) {
    		var providerKey = this.providerKey;
			if(providerKey){
				return providerKey;
			}

            var form = YIUI.FormStack.getForm(control.ofFormID);
			
			var formulaKey = control.formulaKey;
			if(formulaKey){
                var cxt = new View.Context(form);
				var o = form.eval(formulaKey, cxt, null);
				if(o){
					return o.toString();
				}
			}
    	},
    	
    	setNeedRefresh: function(needRefresh) {
    		this.needRefresh = needRefresh;
    	},
    	
    	popSearchDialog: function(control, text) {
    		var callParas = {
				SearchContent: text
			};
//    		var params = {
//				formKey: control.popConfigKey, 
//				cmd: "PureShowForm", 
//				callParas: JSON.stringify(callParas)
//    		};
//            var success = function (jsonObj) {
//            	var newForm = YIUI.FormBuilder.build(jsonObj, YIUI.FormTarget.MODAL, control.ofFormID);
//            	newForm.regEvent(YIUI.FormEvent.Close, {
//        			doTask: function(form, paras) {
//        				var o = form.getResult();
//        				if(!o){
//        					control.setValue(control.getValue(), true, false);
//        				}else{
//        					control.setValue(o, true, true);
//        				}
//        			}
//            	});
//            };
//            Svr.SvrMgr.dealWithPureForm(params, success);

            var form = YIUI.FormStack.getForm(control.ofFormID);
            var container = form.getContainer();
            var builder = new YIUI.YIUIBuilder(control.popConfigKey);
            builder.setContainer(container);
            builder.setTarget(YIUI.FormTarget.MODAL);
            builder.setParentForm(form);
            builder.setOperationState(YIUI.Form_OperationState.Default);

            builder.newEmpty().then(function(emptyForm){
                var filterMap = emptyForm.getFilterMap();
                filterMap.setOID(OID);

                YIUI.FormParasUtil.processCallParas(form, emptyForm);
                emptyForm.setOptQueue(new YIUI.OptQueue(new YIUI.LoadOpt(emptyForm)));

                builder.builder(emptyForm).then(function(newForm) {
                	newForm.regEvent(YIUI.FormEvent.Close, {
            			doTask: function(form, paras) {
            				var o = form.getResult();
            				if(!o){
            					control.setValue(control.getValue(), true, false);
            				}else{
            					control.setValue(o, true, true);
            				}
            			}
                	});
                });
            });

    	},
    	
    	doOnClick: function(control) {
    		var providerKey = this.providerKey;
    		if(!providerKey || this.needRefresh){
				providerKey = this.getProviderKey(control);
				this.needRefresh = false;
			}
			this.popSearchDialog(control, "");
    	},
    		
        autoComplete: function (control, value) {
        	var providerKey = this.providerKey;
        	if(!providerKey || this.needRefresh){
				providerKey = this.getProviderKey(control);
				this.needRefresh = false;
			}
			var form = YIUI.FormStack.getForm(control.ofFormID);
        	var data = {
    			cmd: "Locate",
    			service: "SearchBoxProviderService",
    			formKey: form.getFormKey(),
    			value: value,
    			providerKey: providerKey
        	};
        	var ret = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, data);
			if(ret){
				control.setValue(ret, true, true);
				return;
			}
			this.popSearchDialog(control, value);
        }
    };
    Return = $.extend({}, YIUI.Handler, Return);
    return Return;
})();
