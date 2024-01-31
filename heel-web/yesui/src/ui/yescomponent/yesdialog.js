(function() {
	YIUI.Yes_Dialog = function(options) {
		var defaul = {
			el: $("<div></div>"),
			msg: YIUI.I18N.getString("DIALOG_WCLOSE","是否关闭"),
			msgType: YIUI.Dialog_MsgType.YES_NO,
			items: []
		};
		options = $.extend(defaul, options);
		var msgType = options.msgType, items;
		var OK_Btn = {
			metaObj: {
				key: "OK",
				caption: YIUI.I18N.getString("CURRENCY_OK","确定")
			}
		};
		var YES_Btn = {
			metaObj: {
				key: "YES",
				caption: YIUI.I18N.getString("DIALOG_YES","是")
			}
		};
		var NO_Btn = {
			metaObj: {
				key: "NO",
				caption: YIUI.I18N.getString("DIALOG_NO","否")
			}
		};
		var Cancel_Btn = {
			metaObj: {
				key: "Cancel",
				caption: YIUI.I18N.getString("DICT_CANCEL","取消")
			}
		};
		switch(msgType) {
			case YIUI.Dialog_MsgType.DEFAULT:
				items = [OK_Btn];
				break;
			case YIUI.Dialog_MsgType.YES_NO:
				items = [YES_Btn, NO_Btn];
				break;
			case YIUI.Dialog_MsgType.YES_NO_CANCEL:
				items = [YES_Btn, NO_Btn, Cancel_Btn];
				break;
		}
		options.items = items;
		var dialogDiv = options.el;
		var btns = {};
		var createHtml = function(hasOK, hasYes, hasNO, hasCancel) {
	    	var label = new YIUI.Control.Label({
	    		x: 1,
	    		y: 1,
	    		colspan: 2,
	    		topMargin: 0,
				metaObj: {
					visible: true,
					caption: options.msg
				}
	    	});
	    	
	    	var item, btn;
	    	var gridpanel = new YIUI.Panel.GridLayoutPanel({
	    		rowGap : 5,
				columnGap : 2,
	    		widths : [5, "50%", "50%"],
	    		minWidths : [ "-1", "-1", "-1"],
	    		heights : [0, "pref", 30, 29, 20]
	    	});
	    	gridpanel.add(label);
	    	
	    	var flowpanel = new YIUI.Panel.FlexFlowLayoutPanel({
	    		x: 1,
				y: 3,
				colspan: 2,
				visible: true,
				cssClass: "dialog_btns"
	    	});
	    	
	    	for (var i = 0, len = items.length; i < len; i++) {
				item = items[i];
				btn = new YIUI.Control.Button({
					metaObj: item.metaObj,
					width: 68,
					height: 29,
					left: i*8,
					listeners: null
    				
		    	});
		    	btns[btn.key] = btn;
		    	flowpanel.add(btn);
			}
	    	gridpanel.add(flowpanel);
	    	return gridpanel;
	    }

		var content = createHtml();
		
		var Return = {
			el: dialogDiv,
			show: function() {
				var settings = {title: options.title, showClose: false, width: "auto", height: "auto"};
				settings.resizeCallback = function() {
					var dialogContent = dialogDiv.dialogContent();
					if(content.hasLayout) {
						content.doLayout(dialogContent.width(), dialogContent.height());
					} else {
						content.setWidth(dialogContent.width());
						content.setHeight(dialogContent.height());
					}
		        }
		        dialogDiv.modalDialog(null, settings);
		        content.render(dialogDiv.dialogContent());
		        var btn;
		        var i = 0;
		        for (var key in btns) {
		        	btn = btns[key];
		        	btn.el.attr("key", key);
		        	if(key == "YES" || key == "OK"){
		        		btn.el.addClass("color");
		        	}
		        	btn.el.addClass("dlg-btn");
		        	btn.el.unbind();
		        	$("div.ui-pnl.dialog_btns").css("margin-right",(i*8)+"px");
		        	i++;
				}
		        var left = ($(window).width() / 2 - dialogDiv.width() / 2) + "px";
		        var top = ($(window).height() / 2 - dialogDiv.height() / 2) + "px";
		        dialogDiv.css({left: left, top: top});
		        $(".ui-lbl label", dialogDiv).css({
		            "white-space": "pre-wrap",
		            "word-wrap": "break-word",
		            "word-break": "break-word"
		        });    
			},

			parseOpt: function(key) {
				var opt = -1;
				if(key == YIUI.Dialog_Btn.STR_YES){
					opt = YIUI.Dialog_Btn.YES_OPTION;
				}else if(key == YIUI.Dialog_Btn.STR_NO){
					opt = YIUI.Dialog_Btn.NO_OPTION;
				}else if(key == YIUI.Dialog_Btn.STR_CANCEL){
					opt = YIUI.Dialog_Btn.CANCEL_OPTION;
				}else if(key == YIUI.Dialog_Btn.STR_OK){
					opt = YIUI.Dialog_Btn.OK_OPTION;
				}
				return opt;	
			},
			close: function() {
				dialogDiv.close();
			}
		};
		return Return;
		
	}
})();

