(function () {
    YIUI.FormRender = function (options, callback) {
    	
        var Return = {
        	formKey: options.formKey,
        	parameters: options.parameters || "",
        	oid: options.oid || -1,
        	formula: options.formula,
        	formID: null,
    		doLayout: function(width, height) {
        		var form = YIUI.FormStack.getForm(this.formID);
    			form.getRoot().doLayout(width, height);
    		},
        	render: function(ct) {
        		if($.isString(ct)) {
        			ct = $("#" + ct);
        		}
        		var self = this;
        		ct.build = function(form) {
        			this.empty();
        			if(self.formID && self.formID != form.formID) {
        				YIUI.FormStack.removeForm(ct.formID);
        			}
        			form.getRoot().render(this);
        			form.setContainer(this);
        			if(self.formula) {
        				form.eval(self.formula, {form: form}, null);
        			}
        			self.formID = form.formID;
        		};
        		ct.removeForm = function(form) {
        			form.getRoot().el.remove();
        			YIUI.FormStack.removeForm(form.formID);
        			if($.isFunction(ct.close)) {
        				ct.close();
        			}
        		};
            	
        		var success = function(jsonObj) {
            		var pFormID;
            		var form = YIUI.FormBuilder.build(jsonObj);
            		if(form.target != YIUI.FormTarget.MODAL) {
            			ct.build(form);
            		}
            		if($.isFunction(callback)) {
            			callback(form);
            		}
            	};
                if(this.oid > -1) {
                	//打开指定单据
                    var params = {formKey: this.formKey, oid: this.oid, callParas: $.toJSON(this.parameters), cmd: "PureOpenForm"};
                    Svr.SvrMgr.dealWithPureForm(params, success);
                } else {
                    var params = {formKey: this.formKey, oid: this.oid, callParas: $.toJSON(this.parameters), cmd: "PureShowForm"};
                    params.async = true;
                    Svr.SvrMgr.dealWithPureForm(params, success);
                }
        	}
        };
        
        return Return;
    }
})();YIUI.FormUtil = (function () {
    var Return = {
		//opts 参数集{path: entryPath...}， ct 容器
		openEntry: function(opts, ct) {
			YIUI.EventHandler.doTreeClick(opts, ct);
		},
		//args 参数数组{formKey:xx, OID:xx, target:xx, paras:xx}
		openForm: function(args, ct) {
	        var formKey = args.formKey, OID = args.OID;
	        var target = YIUI.FormTarget.NEWTAB;
	        if (args.target) {
	            target = YIUI.FormTarget.parse(args.target);
	        }
	        var callParas;
	        if (args.callParas) {
	            callParas = args.callParas;
	        }
	        var data = {formKey: formKey, oid: OID.toString(), cmd: "PureOpenForm"};
	        if (callParas) {
	            data.callParas = callParas;
	        }
	        var success = function (jsonObj) {
	            var newForm = YIUI.FormBuilder.build(jsonObj, target);
	            if (target != YIUI.FormTarget.MODAL) {
	            	ct.build(newForm);
	            }
	            newForm.setOperationState(YIUI.Form_OperationState.Default);
	        };
	        Svr.SvrMgr.dealWithPureForm(data, success);
	        return true;
		}
    };

    return Return;
})();