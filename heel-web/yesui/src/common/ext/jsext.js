var Lang = (function() {
	var ext = new Object();
	ext.impl = function(clsObj, impls) {
		for (var name in impls) {
			clsObj.prototype[name] = impls[name];
		}
	};
	ext.assign = function(obj, values) {
		for (var name in values) {
			obj[name] = values[name];
		}
	};
	return ext;
})();

function HashMap() {
	this.size = 0;
	this.table = new Object();
}
	
Lang.impl(HashMap, {
	put: function(key, value) {
		var added = false;
		if ( !this.containsKey(key) ) {
			++this.size;
			added = true;
		}
		this.table[key] = value;
		return added;
	},
	get: function(key) {
		return this.containsKey(key) ? this.table[key] : null;
	},
	remove: function(key) {
		if ( this.containsKey(key) && (delete this.table[key]) ) {
			--this.size;
		}
	},
	containsKey: function(key) {
		return key in this.table;
	},
	keys: function() {
		var keys = new Array();
		for ( var prop in this.table ) {
			keys.push(prop);
		}
		return keys;
	},
	empty: function() {
		return this.size == 0;
	},
	clear: function() {
		this.table = new Object();
	}
});

function HashMapIgnoreCase() {
	this.size = 0;
	this.table = new Object();
}

Lang.impl(HashMapIgnoreCase, {
	put: function(key, value) {
		key = key.toLowerCase();
		var added = false;
		if ( !this.containsKey(key) ) {
			++this.size;
			added = true;
		}
		this.table[key] = value;
		return added;
	},
	get: function(key) {
		key = key.toLowerCase();
		return this.containsKey(key) ? this.table[key] : null;
	},
	remove: function(key) {
		key = key.toLowerCase();
		if ( this.containsKey(key) && (delete this.table[key]) ) {
			--this.size;
		}
	},
	containsKey: function(key) {
		key = key.toLowerCase();
		return key in this.table;
	},
	keys: function() {
		var keys = new Array();
		for ( var prop in this.table ) {
			keys.push(prop);
		}
		return keys;
	},
	empty: function() {
		return this.size == 0;
	},
	clear: function() {
		this.table = new Object();
	}
});

function Stack() {
	this.table = new Array();
}

Lang.impl(Stack, {
	push: function(value) {
		this.table.push(value);
	},
	pop: function() {
		return this.table.pop();
	},
	peek: function() {
		return this.table[this.table.length - 1];
	},
	empty: function() {
		return this.table.length == 0;
	},
	values: function() {
		return this.table;
	},
	size: function() {
		return this.table.length;
	}
});