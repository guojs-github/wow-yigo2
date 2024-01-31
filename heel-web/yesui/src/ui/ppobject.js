(function () {
	YIUI.PPObject = function(obj) {
		var Return = {
			LONG: 1,
			ARRAY: 2,
			DATATABLE: 3,
			type: -1,
			operatorID: -1,
			operatorList: [],
			complexOperatorTable: null,
			init: function() {
				if ($.isNumeric(obj)) {
					this.type = this.LONG;
					this.operatorID = parseInt(obj);
				} else if (obj instanceof Array) {
					this.type = this.ARRAY;
					this.operatorList = obj;
				} else if (obj instanceof DataDef.DataTable) {
					this.type = this.DATATABLE;
					this.complexOperatorTable = obj;
				} else if (typeof obj == "string") {
					this.type = this.ARRAY;
					this.operatorList = obj.split(",");
				}
			},
			toJSON: function() {
				var jsonObj = {};
				jsonObj.Type = this.type;
				if (this.type == this.LONG) {
					jsonObj.OperatorID = this.operatorID;
				} else if (this.type == this.ARRAY) {
					var ja = [];
					for (var i = 0, len = this.operatorList.length; i < len; i++) {
						if(this.operatorList[i] instanceof YIUI.ItemData)
							ja.push(this.operatorList[i].oid);
						else
							ja.push(this.operatorList[i]);
					}
					jsonObj.OperatorList = ja;
				} else if (this.type == this.DATATABLE) {
					var tblJson = YIUI.DataUtil.toJSONDataTable(this.complexOperatorTable);
					jsonObj.ComplexOperatorTable = tblJson;
				}
				return jsonObj;
			}

		};
		Return.init();
		return Return;
	};
})();