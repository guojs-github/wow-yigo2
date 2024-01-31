YIUI.BPMInplaceToolBar = (function() {
	var Return = {
		replace: function(form, operation) {
			var ret = [];
	
			var doc = form.getDocument();
			if (doc == null)
				return ret;
			var table = doc.getExpData(YIUI.BPMKeys.LoadBPM_KEY);
	
			if (table != null) {
				table = YIUI.DataUtil.fromJSONDataTable(table);
				table.first();
				var instanceID = table.getByKey(YIUI.BPMConstants.BPM_INSTANCE_ID);
				var instanceState = table.getByKey(YIUI.BPMConstants.ELEMENT_STATE);
				var processKey = table.getByKey(YIUI.BPMConstants.BPM_PROCESS_KEY);
				var transitTo = table.getByKey(YIUI.BPMConstants.BPM_TRANSIT_TO);
				if ((instanceID >= 0 && instanceState == YIUI.InstanceState.SIGN) || (instanceID <= 0 && processKey != null && processKey.length > 0)) {
					var caption = table.getByKey(YIUI.BPMConstants.BPM_STARTCAPTION);
					var action = table.getByKey(YIUI.BPMConstants.BPM_STARTACTION);
					if (action == null || action.length == 0) {
						action = "StartInstance(\"" + processKey + "\")";
					}
	
					var op = {};
					if( caption==null || caption.isEmpty() ) {
	                    caption = YIUI.I18N.getString("TOOLBAR_STARTINSTANCE","启动流程");
					}
					op.caption = caption;
					op.action = action;
					op.key = operation.key;
					op.enable = operation.enableCnt || "ReadOnly()";
					op.visible = operation.visibleCnt || "";
					op.managed = true;
	
					ret.push(op);
				}
			}
			
			if(transitTo && transitTo != -1) {
				var caption = YIUI.I18N.getString("TOOLBAR_DIRECTSENDING","直送");
				var action = "StartInstance(\"\",{pattern:{Transit}})";
				var op = {};
				
				op.caption = caption;
				op.action = action;
				op.key = operation.key + "sv";
				op.enable = operation.enableCnt || "ReadOnly()";
				op.visible = operation.visibleCnt || "";
				op.managed = true;

				ret.push(op);
			}
	
			return ret;
		}
	};
	return Return;
})();

YIUI.BPM_TAG["BPM"] = YIUI.BPMInplaceToolBar;