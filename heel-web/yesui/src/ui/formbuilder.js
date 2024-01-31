YIUI.FormBuilder = (function () {
    var Return = {
		
		build: function(metaForm, target, pFormID, opt, filterMap) {
			var form = new YIUI.Form(metaForm);
	        form.target = target || form.target;
            form.pFormID = pFormID || form.parentID;
            if(target == YIUI.FormTarget.MODAL || form.target == YIUI.FormTarget.MODAL) {
        		var popHeight = form.popHeight || "60%";
                var popWidth = form.popWidth || "40%";
                var dialogID = form.formID;
                var dialogDiv = $("<div id=" + dialogID + "></div>");
                
                var settings = {
            		title: form.caption, 
            		showClose: false, 
            		width: popWidth, 
            		height: popHeight
            	};
                var root = form.getRoot();
                settings.resizeCallback = function() {
					var dialogContent = dialogDiv.dialogContent();
					if(root.hasLayout) {
						root.doLayout(dialogContent.width(), dialogContent.height());
					} else {
						root.setWidth(dialogContent.width());
						root.setHeight(dialogContent.height());
					}
		        }
                dialogDiv.modalDialog(null, settings);
                
                var ct = dialogDiv.dialogContent();
        		ct.renderDom = function() {
                    form.getRoot().render(ct);
				};
				form.setContainer(ct);
        	}
            return form;
		}
    };

    return Return;
})();