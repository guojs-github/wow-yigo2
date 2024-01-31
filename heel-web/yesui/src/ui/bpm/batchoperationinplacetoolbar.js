YIUI.BatchOperationInplaceToolBar = (function() {
	var Return = {
		BPM_PROCESS_KEY: "BPM_PROCESS_KEY",
		BPM_ACTION_NODE_KEY: "BPM_ACTION_NODE_KEY",
		replace: function(form, operation) {
			var ret = [];
			var list = new YIUI.MetaService(form).getBPMProcess(form.formKey);

	        if(list) {
	        	var nodes = list.nodes;
	        	if(nodes && nodes.length > 0) {
	        		var defaultContent = "BatchStateAction(1,'"+YIUI.I18N.getString("TOOLBAR_VIA","通过")+"')"; //与BPMSetting中DefaultBatchStateAction取值一致
	        		for (var i = 0, len = nodes.length; i < len; i++) {
	        			var node = nodes[i];
	        			if(node["tag-name"] == "StateAction") {
	        				var actionNodeKey = node.key;
	        				var item = node.batchOperation;
	        				var op = {};
	        				if (item.action == null || item.action.isEmpty()) {
	        					op.action = defaultContent;
	        				} else {
	        					op.action = item.action;
	        				}
	        				
	        				var caption = item.caption;
	        				if (caption == null || caption.length == 0) {
	        					caption = YIUI.I18N.getString("TOOLBAR_COMMITWORKITEM","提交工作项");
	        				}
	        				
	        				op.caption = caption;
	        				op.key = item.key;
	        				op.icon = item.icon;
	        				op.enable = item.enable;
	        				op.visible = item.visible;
	        				op.managed = true;
	        				
	        				var preAction = "SetPara('" + this.BPM_PROCESS_KEY + "','" + list.key + "');SetPara('" + this.BPM_ACTION_NODE_KEY + "','" + actionNodeKey + "');"
	        				op.preAction = preAction;
	        				ret.push(op);
	        			}
	        		}
	        	}
	        }
			return ret;
		}
	};
	return Return;
})();

YIUI.BPM_TAG["BATCH"] = YIUI.BatchOperationInplaceToolBar;
