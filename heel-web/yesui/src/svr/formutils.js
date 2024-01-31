// YIUI.FormUtil = (function () {
//     var Return = {
// 		//opts 参数集{path: entryPath...}， ct 容器
// 		openEntry: function(opts, ct) {
// 			YIUI.EventHandler.doTreeClick(opts, ct);
// 		},
// 		//args 参数数组{formKey:xx, OID:xx, target:xx, paras:xx}
// 		openForm: function(args, ct) {
// 	        var formKey = args.formKey, OID = args.OID;
// 	        var target = YIUI.FormTarget.NEWTAB;
// 	        if (args.target) {
// 	            target = YIUI.FormTarget.parse(args.target);
// 	        }
// 	        var callParas;
// 	        if (args.callParas) {
// 	            callParas = args.callParas;
// 	        }
// 	        var data = {formKey: formKey, oid: OID.toString(), cmd: "PureOpenForm"};
// 	        if (callParas) {
// 	            data.callParas = callParas;
// 	        }
// 	        Svr.SvrMgr.getEmptyForm(data).done(function(data) {
// 	        	cxt.optType = YIUI.OptType.LOAD;
// 	            if (target == YIUI.FormTarget.SELF) {
// 	                YIUI.UIUtil.show(data, cxt, true);
// 	                return;
// 	            }
// 	            cxt.target = target;
// 	            YIUI.UIUtil.show(data, cxt, false);
// 	        });
// 	        return true;
// 		}
//     };

//     return Return;
// })();