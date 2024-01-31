YIUI.UTCDateFormat = (function () {
    var Return = {
		//返回值为long，如"20160701"
    	format: function(value, settings) {
    		var def = {
			    formatStr: "yyyy-MM-dd HH:mm:ss",
			    onlyDate : false
			};
			settings = $.extend(def, settings);
    		var text;
            if (!(value == undefined || value == null || value.length == 0)) {
                if(value instanceof Date) {
                    text = value.Format(settings.formatStr) || "";
                } else if ( $.isNumeric(value) ) {
					text = value.toString();
                } else if ( $.isString(value) ) {
                	text = value;
				}
                text = text.toString().replace(/(\W+)/g, "");
                if(settings.onlyDate) {
            		text = text.substring(0,8);
                }
            }
            return text == null ? null : YIUI.TypeConvertor.toLong(text);
    	},

    	//将"20160701"格式转为"2016-07-01"格式
	    formatCaption: function(d, onlyDate) {
    		var text = "";
    		if( !d ) {
    			return text;
			}
	    	if(onlyDate) {
				var yyyy = parseInt(d / 10000);
				var i = d % 10000;
				var MM = parseInt(i / 100);
				i = i % 100;
				var dd = i;
				if( $.isNumeric(d) && !this.check(yyyy, MM, dd, 00, 00, 00) ){
					throw new Error(YIUI.I18N.getString("DATE_WRONGTIME","错误的时间：")+d);
				}
				if(MM < 10) {
					MM = "0" + MM;
				} 
				if(dd < 10) {
					dd = "0" + dd;
				}
				text = yyyy + "-" + MM + "-" + dd;
			} else {
				//yyyyMMddHHmmss
				var yyyy = parseInt(d / 10000000000);
				var i = d % 10000000000;
				var MM = parseInt(i / 100000000);
				i = i % 100000000;
				var dd = parseInt(i / 1000000);
				i = i % 1000000;
				var HH = parseInt(i / 10000);
				i = i % 10000;
				var mm = parseInt(i / 100);
				i = i % 100;
				var ss = i;
				if( $.isNumeric(d) && !this.check(yyyy, MM, dd, HH, mm, ss) ){
					throw new Error(YIUI.I18N.getString("DATE_WRONGTIME","错误的时间：") +d);
				}
				if(MM < 10) {
					MM = "0" + MM;
				} 
				if(dd < 10) {
					dd = "0" + dd;
				}
				if(HH < 10) {
					HH = "0" + HH;
				} 
				if(mm < 10) {
					mm = "0" + mm;
				}
				if(ss < 10) {
					ss = "0" + ss;
				}
				text = yyyy + "-" + MM + "-" + dd + " " + HH + ":" + mm + ":" + ss;
			}
	    	return text;
	    },
	    
	    check: function(yyyy, MM, dd, HH, mm, ss) {
	    	if(yyyy > 9999){
				return false;
			}
			if(MM > 12){
				return false;
			}
			var days = 30;
			switch(MM){
				case 2:
					if((yyyy % 4 == 0 && yyyy % 100 != 0) || yyyy % 400 == 0){
						days = 29;
					}else{
						days = 28;
					}
					break;
				case 1:
				case 3:
				case 5:
				case 7:
				case 8:
				case 10:
				case 12:
					days = 31;
					break;
			}
			if(dd > days){
				return false;
			}
			if(HH > 23){
				return false;
			}
			if(mm > 59 || ss > 59){
				return false;
			}
			return true;
	    }
    };
    return Return;
})();