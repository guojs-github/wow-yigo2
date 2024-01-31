var YIUI = YIUI || {};
/**
 * 字典节点对象，存放基本属性
 */
(function () {
    YIUI.Item = function (options) {
    	this.itemKey = "";
        this.oid =  0;
        this.nodeType = 0;
        this.enable = 0;
        this.caption = "";
        this.mainTableKey = "";
        this.itemTables = {};
        this.fromJSON(options);
    };

    Lang.impl(YIUI.Item, {
		getOID: function(){
			return this.oid;
		},

		getItemKey: function(){
			return this.itemKey;
		},

		getNodeType: function(){
			return this.nodeType;
		},

		getEnable: function(){
			return this.enable;
		},

		getCaption: function() {
			return this.caption;
		},

		equals: function(o){
			if(o == null){
				return false;
			}
			return this.toString() == o.toString();
		},

		toString: function(){
			return this.itemKey + "_" + this.oid;
		},

		toItemData: function(){
			var o = {};
			o.oid = this.oid;
			o.itemKey = this.itemKey;
			o.caption = this.caption;
			return new YIUI.ItemData(o);
		},

		getValue: function (key, tableKey) {
            if (!tableKey) {
                tableKey = this.mainTableKey;
            }

			var fieldKey = key,
				index = key.indexOf('.');

			if(index > 0){
				tableKey = key.substring(0, index);
				fieldKey = key.substring(index+1);
			}

            var table = this.itemTables[tableKey];

            var value = null;
            if (table && table.itemRows.length > 0) {
                if (table.tableMode == 0) {
                    value = table.itemRows[0][fieldKey];
                } else {
                    var len = table.itemRows.length;

                    value = new Array(len);

                    for (var i = 0; i < len; i++) {
                        value.push(table.itemRows[i][fieldKey]);
                    }
                }
            }

            return value;

        },

		toJSON: function() {
			var jsonObj = {
				oid: this.oid,
				itemKey: this.itemKey,
				caption: this.caption,
				enable: this.enable,
				nodeType: this.nodeType,
				mainTableKey: this.mainTableKey,
				itemTables: this.itemTables
			};
			return jsonObj;
		},

		fromJSON: function(jsonObj) {
			if(jsonObj.oid) {
				this.oid = jsonObj.oid;
			}

			if(jsonObj.itemKey) {
				this.itemKey = jsonObj.itemKey;
			}

			if(jsonObj.caption) {
				this.caption = jsonObj.caption;
			}

			if(jsonObj.enable){
				this.enable = jsonObj.enable;
			}

			if(jsonObj.nodeType){
				this.nodeType = jsonObj.nodeType;
			}

			if(jsonObj.mainTableKey){
				this.mainTableKey = jsonObj.mainTableKey;
			}

			if(jsonObj.itemTables){
				this.itemTables = jsonObj.itemTables;
			}

		}
    });
})();