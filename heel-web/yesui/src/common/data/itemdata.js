var YIUI = YIUI || {};

(function () {
    YIUI.ItemData = function (options) {
    	this.oid = options.oid || 0;
    	this.itemKey = options.itemKey || "";
    	this.fromJSON(options);
    	this.code = options.code || "";
    	//this.caption = options.caption || "";
    };
    Lang.impl(YIUI.ItemData, {
		getOID: function(){
			return this.oid;
		},
		getItemKey: function(){
			return this.itemKey;
		},
		hasCaption: function(){
			return 'caption' in this;
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
		toJSON: function() {
			var jsonObj = {
				oid: this.oid,
				itemKey: this.itemKey,
				caption: this.caption
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
		},
		clone: function () {
			return new YIUI.ItemData({
				oid: this.oid,
				itemKey: this.itemKey,
                caption: this.caption
			});
        }
    });
})();