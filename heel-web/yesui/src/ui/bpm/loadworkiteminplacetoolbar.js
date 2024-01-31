YIUI.LoadWorkitemInplaceToolBar = (function() {
	var Return = {
		replace: function(form, operation) {
			var ret = [];
			var doc = form.getDocument();
			if (doc == null)
				return ret;
			// 撤销工作项
			var s = doc.getExpData(YIUI.BPMKeys.STATE_MACHINE);
			if (s != null) {
				var rollback = doc.getExpData(YIUI.BPMKeys.CHOOSE_ROLLBACK);
				var chooseRollback = false;
				if (rollback != null) {
					chooseRollback = YIUI.TypeConvertor.toBoolean(rollback);
				}
				var formula = "RevokeWorkitem(" + s + ")";
				if (chooseRollback) {
					formula = "RollbackToWorkitem(" + s + ")";
				}
				var op = {};
				var c = doc.getExpData(YIUI.BPMKeys.RETREAT_CAPTION);
				if (c != null) {
					op.caption = c.toString();
				} else {
	                op.caption = YIUI.I18N.getString("TOOLBAR_REVOCATECOMMITED","撤销已提交审批");
				}
				op.action = formula;
				op.key = "InverseState";
				op.enable = operation.enableCnt || "ReadOnly()";
				op.visible = operation.visibleCnt || "";
				op.managed = true;
				
				ret.push(op);
			}
	
			// 打开的工作项
			var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
			if (info != null) {
				for (var i = 0, len = info.ItemList.length; i < len; i++) {
					var item = info.ItemList[i];
					var op = {};
					var caption = item.i18nCaption;
					if (caption == null || caption.length == 0) {
						caption = item.caption;
					}
					if (caption == null || caption.length == 0) {
	                    caption = YIUI.I18N.getString("TOOLBAR_COMMITWORKITEM","提交工作项");
	                }
					op.caption = caption;
					op.action = item.action;
					op.key = item.key;
					op.enable = item.enable;
					op.icon = item.icon;
					op.visible = item.visible;
					op.managed = true;
	
					if (item.customKey != null && item.customKey.length > 0) {
						op.preAction = "SetCustomKey('" + item.customKey + "')";
					}
	
					ret.push(op);
				}
				return ret;
			}
	
			// 自动加载工作项
			var info = doc.getExpData(YIUI.BPMKeys.WORKITEM_INFO);
			if (info != null) {
	
				// 附件的工作项不加载
				var existAttachment = info.AttachmentType >= 0;
				if (existAttachment)
					return ret;
				form.setSysExpVals(YIUI.BPMConstants.WORKITEM_INFO, info);
				for (var i = 0, len = info.ItemList.length; i < len; i++) {
					var item = info.ItemList[i];
					var op = {};
					var caption = item.i18nCaption;
					if (caption == null || caption.length == 0) {
						caption = item.caption;
					}
					if (caption == null || caption.length == 0) {
	                    caption = YIUI.I18N.getString("TOOLBAR_COMMITWORKITEM","提交工作项");
					}
					op.caption = item.caption;
					op.action = item.action;
					op.key = item.key;
					op.enable = item.enable;
					op.icon = item.icon;
					op.visible = item.visible;
					op.managed = true;
	
					if (item.customKey != null && item.customKey.length > 0) {
						op.preAction = "SetCustomKey('" + item.customKey + "')";
					}
					ret.push(op);
				}
			}
	
			return ret;
		
		}
	}
	return Return;
})();

YIUI.BPM_TAG["WORKITEM"] = YIUI.LoadWorkitemInplaceToolBar;