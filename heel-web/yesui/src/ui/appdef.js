
YIUI.AppDef = (function() {
	var p = new View.Parser();
	var rt = {
		setStatus: function(status) {
			if(status) {
				var org_lbl = $(".navRight label.org_lbl");
				var html_text = "";
				for(var i = 0, len = status.length; i < len; i++) {
					var s = status[i];
					var text = s.caption;
					if(s.formula) {
						try {
							text = p.eval(s.formula);
							text = YIUI.TypeConvertor.toString(text);
						} catch (e) {
							text = s.caption;
						}
					}
					html_text += "<p key='"+ s.key +"'>" + text + "</p>";
				}
				org_lbl.html(html_text);
				this.org_status = status;
			}
		},
		updateStatusInfo: function(key, text) {
			var status = this.org_status;
			if(status) {
				var org_lbl = $(".navRight label.org_lbl");
				for(var i = 0, len = status.length; i < len; i++) {
					var s = status[i];
					if(key == s.key) {
						$("[key='"+key+"']", org_lbl).html(text);
						break;
					}
				}
			}
		},
		refreshStatusInfo: function(key) {
			var status = this.org_status;
			if(status) {
				var org_lbl = $(".navRight label.org_lbl");
				var l = $("[key='"+key+"']", org_lbl);
				if (l.length == 0) {
					return;
				}
				for(var i = 0, len = status.length; i < len; i++) {
					var s = status[i];
					if(s.key == key) {
						var formula = s.formula;
						if (formula != null && !formula.isEmpty()) {
							var v = p.eval(s.formula);
							var text = YIUI.TypeConvertor.toString(v);
							l.html(text);
						}
						break;
					}
				}
				
			}
		}
	};
	return rt;
})();
