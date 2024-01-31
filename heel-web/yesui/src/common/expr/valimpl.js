(function () {
	YIUI.TblValImpl = function (options) {
		var Return = {
	        getValue: function (tbl, id) {
	        	return tbl.getByKey(id);
	        },
	        setValue: function(tbl, id, value) {
	        	tbl.setByKey(id, value);
	        }
	    };
	    return Return;
    };
	YIUI.DocValImpl = function (options) {
		var Return = {
	        getValue: function (doc, id) {
	        	return doc.getByKey(id);
	        },
	        setValue: function(doc, id, value) {
	        	doc.setByKey(id, value);
	        }
	    };
	    return Return;
    };
	YIUI.JSONObjValImpl = function (options) {
		var Return = {
	        getValue: function (json, id) {
	        	return json[id];
	        },
	        setValue: function(json, id, value) {
	        	json[id] = value;
	        }
	    };
	    return Return;
    };
    YIUI.JSONArrValImpl = function (options) {
    	var Return = {
			getValue: function (arr, id) {
				return arr.get(id);
			},
			setValue: function(arr, id, value) {
				arr.put(id, value);
			}
    	};
    	return Return;
    };
})();
