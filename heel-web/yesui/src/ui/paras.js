(function () {
    YIUI.Paras = function (json) {
    	var Return = {
	    	map: {},
	    	mapType: {},
			put: function(key, value) {
				this.map[key] = value;
			},
			get: function(key) {
	    		if( this.map.hasOwnProperty(key) ) {
	    			return this.map[key];
				}
				return null;
			},
			getMap: function() {
				return this.map;
			},
			init: function() {
				if($.isEmptyObject(json)) return;
				var items = json.items;
				for (var i = 0, len = items.length; i < len; i++) {
					var item = items[i];
					this.put(item.key, item.value);
					this.mapType[item.key] = item.type;
				}
			},
			toJSON: function() {
				var json = {};
				if (!$.isEmptyObject(this.map)) {
					var items = [];
					for(var m in this.map) {
						var v = this.map[m];
						var type = this.mapType[m];
						if(!type || type == -1) {
                            if (typeof v == "string") {
                                type = YIUI.JavaDataType.USER_STRING; // 1 需要先判断字符串eg:"02",是string而不是number
                            } else if (v instanceof Decimal) { // 2
                                type = YIUI.JavaDataType.USER_NUMERIC;
                                v = v.toString();
                            } else if ($.isNumeric(v)) { // 3
								type = YIUI.JavaDataType.USER_LONG;
							} else if (typeof v == "boolean") {
								type = YIUI.JavaDataType.USER_BOOLEAN;
							} else if (v instanceof Date) {
								type = YIUI.JavaDataType.USER_DATETIME;
								v = v.getTime();
							}
						}
						var item = {
							key: m,
							value: v,
							type: type
						}
						items.push(item);
					}
					json.items = items;
				}
				return $.toJSON(json);
			}
    	};
    	Return.init();
        return Return;
    };
    YIUI.FormParasUtil = (function() {
    	var Return = {
			processCallParas: function(parent, form) {
    			if( parent != null ) {
    				var callParas = parent.getCallParas();
					if ( callParas != null ) {
						var map = callParas.map;
						for(var key in map) {
							form.setPara(key, map[key]);
						}
					}
    			}
			}
    	};
    	return Return;
    })();
})();