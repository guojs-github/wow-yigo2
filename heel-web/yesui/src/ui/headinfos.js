YIUI.HeadInfos = (function () {
	var Return = {
			currentMap : {},
			currentSize : 0,
			globalMap: {},
			globalSize : 0,
			
			put: function(key, value, global) {
				var added = false;
				if (global) {
					if ( !this.containsKey(key,global) ) {
						++this.globalSize;
						added = true;
					}
					this.globalMap[key] = value;
				} else {
					if ( !this.containsKey(key,global) ) {
						++this.currentSize;
						added = true;
					}
					this.currentMap[key] = value;
				}
				return added;
			},
			
			containsKey: function(key, global) {
				if (global) {
					return key in this.globalMap;
				} else {
					return key in this.currentMap;
				}
			},
			
			getAll: function () {
				return $.extend({},this.currentMap,this.globalMap);
			},
			
			putAll: function (map) {
				for(var m in map) {
					this.put(m, map[m]);
				}
			},
			
			get: function(key, global) {
				var value = null;
				if (this.containsKey(key, global)) {
					if (global) {
						value = this.globalMap[key];
					} else {
						value = this.currentMap[key];
					}
				} 
				return value;
			},
			
			remove: function(key, global) {
				if (this.containsKey(key, global)) {
					if (global) {
						var value = this.globalMap[key];
						if (delete this.globalMap[key]) {
							--this.globalSize;
							return value;
						}	
					} else {
						var value = this.currentMap[key];
						if (delete this.currentMap[key]) {
							--this.currentSize;
							return value;
						}	
					}
									
				}				
				return null;
			},
			empty: function() {
				return this.currentSize == 0 && this.globalSize == 0;
			},
			clearCurrent: function() {
				this.currentSize = 0;
				this.currentMap = new Object();
			},
			toJSON: function() {
				return $.toJSON($.extend({},this.currentMap,this.globalMap));
			}			
	};
	return Return;
})();