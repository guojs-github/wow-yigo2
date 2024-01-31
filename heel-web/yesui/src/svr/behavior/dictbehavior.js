YIUI.DictBehavior = (function () {
    var Return = {
    	isEqual: function(v1, v2) {
    		var equal = true;
    		if($.isArray(v1) && $.isArray(v2)) {
    			if(v1.length != v2.length) {
    				equal = false;
    			} else {
    				for (var i = 0, len1 = v1.length; i < len1; i++) {   					
						if(v1[i].oid != v2[i].oid) {
							equal = false;
							break;
						}					
    				}
    			}
    		} else if(v1 && v2) {
    			equal = v1.oid == v2.oid;
    		} else {
                if(v2 instanceof YIUI.ItemData && v2.oid == 0 && v1 == null){
                    equal = true;
                }else{
                    equal = v1 == v2; 
                }
    		}
    		return equal;
    	},
        
		checkAndSet: function(options, callback) {
			var oldVal = options.oldVal;
        	var newVal = options.newVal;
        	if(newVal instanceof Decimal) {
        		newVal = newVal.toString();
        	}
			
			if( !oldVal && !newVal ) {
				return false; // 值未改变
			}

            if (options.allowMultiSelection) {
            	//多选字典的处理

                var vals = [];

                if(newVal instanceof YIUI.ItemData) {
                    vals.push(newVal);
                } else if ($.isArray(newVal)) {
                    vals = newVal;
                } else if ($.isNumeric(newVal)) {
                    var oid = YIUI.TypeConvertor.toLong(newVal);

                    var o = {
                                itemKey: options.itemKey,
                                oid: oid
                            };
                    vals.push( new YIUI.ItemData(o));
                } else if ($.isString(newVal)) {
					var oids = newVal.split(','), o;
                    for(var j=0;j<oids.length;j++){
                        o = oids[j].trim();
                        if($.isNumeric(o)){
                        	var oid = YIUI.TypeConvertor.toLong(o);

                            var val = new YIUI.ItemData({
        						oid : oid,
        						itemKey : options.itemKey
        					});
                            vals.push(val);
                        }
                    }
				}
                
                if(vals.length > 0){
                    newVal = vals; 
                }else{
                    newVal = null;
                }
                
			} else {
				if (oldVal && newVal) {
					if ((oldVal.itemKey + '_' + oldVal.oid) == (newVal.itemKey
							+ '_' + newVal.oid)) {
						return false;
					}
				}

				if ($.isNumeric(newVal)) {
					newVal = new YIUI.ItemData({
						oid : newVal,
						itemKey : options.itemKey
					});
				} else if (YIUI.YesJSONUtil.isJsonObject(newVal)) {
					newVal = new YIUI.ItemData(JSON.parse(newVal));
				}

				newVal = newVal || null;
			}

            //类型转换完后再验证一次 新旧值是否一致，可能存在，传入的值为long 与itemData的oid一致
            var equal = this.isEqual(oldVal, newVal);
            if (equal) {
                return false;
            }

            if($.isFunction(callback)) {
            	callback(newVal);
            }
            return true;
		}
    };

    Return = $.extend({}, YIUI.BaseBehavior, Return);
    return Return;
})();
