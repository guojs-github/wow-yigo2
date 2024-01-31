var IndexedDBProxy = (function(){
	var db = null;
	var DB, tx;
	var dbName;
	var opendb;

	function _indexedDBProxy(name){
		dbName = name;
	};
	_indexedDBProxy.prototype.isOpen = function(){
		return db != null;
	}

	_indexedDBProxy.prototype.open = function(upgrade, version){
		opendb =  $.Deferred(function (def) {
	                var request = indexedDB.open(dbName, version);
	                if(upgrade){
	                    request.onupgradeneeded = upgrade;
	                }
	                
	                request.onsuccess = function () {
	                	db = request.result;
	                    def.resolve(request.result);
	                    console.log('indexdb open...');
                        setTimeout(function(){
                            opendb = null;
                        },100);
	                };

	                request.onerror = def.reject;
	            });
		return opendb;
	};

	var _open = function(){
		var ret;
		if(db != null){
			ret = $.Deferred(function(def){
				return true;
			});
		}else{
			return opendb;
		}
		return ret;
	}

	var _get = function(db, table, key, tx){
		return $.Deferred(function (def) {
	                tx = tx || db.transaction(table, 'readwrite');
	                var store = tx.objectStore(table);
	                var request = store.get(key);
	                request.onsuccess = function (e) {
	                    def.resolve(request.result);
	                };
	                request.onerror = def.reject;
		           
	            });
	};

	var _getByIndex = function(db, table, indexName, key, tx){
		return $.Deferred(function (def) {
	                tx = tx || db.transaction(table, 'readwrite');
	                var store = tx.objectStore(table);

	                var index = store.index(indexName);

	                var request = index.get(IDBKeyRange.only(key));

	                request.onsuccess = function (e) {
	                    def.resolve(request.result);
	                };
	                request.onerror = def.reject;
		           
	            });
	};

	var _put = function(db, table, value, tx){
		return $.Deferred(function (def) {
	                tx = tx || db.transaction(table, 'readwrite');
	                var store = tx.objectStore(table);
	                var request = store.put(value);
	                request.onsuccess = function () {
	                	//console.log("put a item...");
	                    def.resolve(request.result);
	                };
	                request.onerror = def.reject;
	            });
	};

	var _clear = function(db, table, tx){
		return $.Deferred(function (def) {
	                tx = tx || db.transaction(table, 'readwrite');
	                if(db.objectStoreNames.contains(table)){
	               		var store = tx.objectStore(table);

		                var request = store.clear();
		                request.onsuccess = function () {
		                	console.log("clear ..."+dbName);
		                    def.resolve(request.result);
		                };
		                request.onerror = def.reject;
	                }
	            });
	};

	_indexedDBProxy.prototype.get = function(table, key){
		if(db != null){
			return _get(db, table, key);
		}

		return _open().then(function(def){
			return _get(db, table, key);
		});
	};

	_indexedDBProxy.prototype.getByIndex = function(table, indexName, key){
		if(db != null){
			return _getByIndex(db, table, indexName, key);
		}
		return _open().then(function(def){
			return _getByIndex(db, table, indexName, key);
		});
	};

	_indexedDBProxy.prototype.exists = function(table){
		return db.objectStoreNames.contains(table);
	};

	_indexedDBProxy.prototype.put = function(table, value){
		if(db != null){
			return _put(db, table, value);
		}
		return _open().then(function(def){
			return _put(db, table, value);
		});
	};

	_indexedDBProxy.prototype.clear = function(table){
		return _clear(db, table);
	};


	return _indexedDBProxy;
})();