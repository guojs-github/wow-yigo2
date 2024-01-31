var View = View || {};
(function () {
	var TblFuns = {
		insert: function(name, cxt, args) {
			var table = cxt.obj;
			var row = table.addRow();
			return row;
		},
		append: function(name, cxt, args) {
			var table = cxt.obj;
			var row = table.addRow();
			return row;
		},
		beforefirst: function(name, cxt, args) {
			var table = cxt.obj;
			table.beforeFirst();
			return true;
		},
		next: function(name, cxt, args) {
			var table = cxt.obj;
			var result = table.next();
			return result;
		},
		size: function(name, cxt, args) {
			var table = cxt.obj;
			return table.size();
		}
	};
	View.TblFunImpl = new HashMap();
	Expr.regCluster(View.TblFunImpl, TblFuns);

	var DocFuns = {
		get: function(name, cxt, args) {
			var doc = cxt.obj;
			var key = YIUI.TypeConvertor.toString(args[0]);
			var table = doc.getByKey(key);
			return table;
		},
		set: function(name, cxt, args) {
			var doc = cxt.obj;
			var key = YIUI.TypeConvertor.toString(args[0]);
			var table = args[1];
			doc.setByKey(key, table);
			return true;
		}
	};
	View.DocFunImpl = new HashMap();
	Expr.regCluster(View.DocFunImpl, TblFuns);

	var JSONObjFuns = {
		length: function(name, cxt, args) {
			var obj = cxt.obj;
			return Object.getOwnPropertyNames(obj).length;
		},
		get: function(name, cxt, args) {
			var obj = cxt.obj;
			var key = YIUI.TypeConvertor.toString(args[0]);
			return obj[key];
		},
		has: function(name, cxt, args) {
			var obj = cxt.obj;
			var key = YIUI.TypeConvertor.toString(args[0]);
			return obj.hasOwnProperty(key);
		},
		put: function(name, cxt, args) {
			var obj = cxt.obj;
			var key = YIUI.TypeConvertor.toString(args[0]);
			var value = args[1];
			obj[key] = value;
			return obj;
		},
		remove: function(name, cxt, args) {
			var obj = cxt.obj;
			var key = YIUI.TypeConvertor.toString(args[0]);
			delete obj[key];
			return obj;
		}
	};
	View.JSONObjFunImpl = new HashMap();
	Expr.regCluster(View.JSONObjFunImpl, JSONObjFuns);

	var JSONArrFuns = {
		length: function(name, cxt, args) {
			var obj = cxt.obj;
			return obj.length;
		},
		get: function(name, cxt, args) {
			var obj = cxt.obj;
			var index = YIUI.TypeConvertor.toInt(args[0]);
			return obj[index];
		},
		put: function(name, cxt, args) {
			var obj = cxt.obj;
			var index = YIUI.TypeConvertor.toInt(args[0]);
			var value = args[1];
			obj[index] = value;
			return obj;
		},
		remove: function(name, cxt, args) {
			var obj = cxt.obj;
			var index = YIUI.TypeConvertor.toInt(args[0]);
			obj.splice(index, 1);
			return obj;
		}
	};
	View.JSONArrFunImpl = new HashMap();
	Expr.regCluster(View.JSONArrFunImpl, JSONArrFuns);
})();
