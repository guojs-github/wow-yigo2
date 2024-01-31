YIUI.TIMEFORMAT = (function(){
	var Return = {
			monthPickerFormat : function(value){
				if(value.lastIndexOf("-") == -1){
					var val = value.replace(/(\d*)(\d{2})/,"$1-$2");
					var reg = /^\d{4}-((0([1-9]))|(1(0|1|2)))$/;
					if(val.match(reg) == null){
						//console.log("不符合格式:" + val);
						return "";
					}
				}
				
				return val;
			},
			timePickerFormat : function(second,value){
				if(second){
					if(value.length < 6){
	    				value = (Array(6).join("0") + value).slice(-6);
					}
					var val = value.replace(/(\d{2})(\d{2})(\d{2})/,"$1:$2:$3");
					var reg = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
				}else{
					if(value.length < 4){
	        			value = (Array(4).join("0") + value).slice(-4);
					}
					var val = value.replace(/(\d{2})(\d{2})/,"$1:$2");
					var reg = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
				}
				if(val.match(reg) == null){
					//console.log("不符合格式:" + val);
					return "";
				}
				
				return val;
			}
	};
	return Return;
})();