(function () {

    var DB_NAME = "YigoCache",
        DICT_TABLE_NAME = 'DictCache',
        META_TABLE_NAME = 'MetaCache',
        DOC_TABLE_NAME = 'DocCache',
        DATAOBJ_TABLE_NAME = 'DataObjCache',
        RIGHTS_TABLE_NAME = 'RightsCache';

    var tables = [DICT_TABLE_NAME, META_TABLE_NAME, DOC_TABLE_NAME, DATAOBJ_TABLE_NAME, RIGHTS_TABLE_NAME];
    var _indexedDB = null;

    var supportIndexedDB = "indexedDB" in window;
    //var supportIndexedDB = false;
    if(supportIndexedDB){
        console.log('support index db');

        var upgrade = function (evt) {

            for(var i = 0, len = tables.length; i < len; i++){
                if(evt.currentTarget.result.objectStoreNames.contains(tables[i])){
                    evt.currentTarget.result.deleteObjectStore(tables[i]);
                }

                var store = evt.currentTarget.result.createObjectStore(
                    tables[i],{keyPath: 'key'});

                store.createIndex('index_keypath', 'key', { unique: true });

            }

            console.debug("initDb.onupgradeneeded");
        };

        _indexedDB = new IndexedDBProxy(DB_NAME);
        _indexedDB.open(upgrade, 5).then(function(d){
            for(var i = 0, len = tables.length; i < len; i++){
                if(_indexedDB.exists(tables[i])){
                    _indexedDB.clear(tables[i]);
                } 
            }

            indexedDB.deleteDatabase('YigoDictDB');
        },function(e){
            console.debug("open error");
            indexedDB.deleteDatabase(DB_NAME);
            _indexedDB.open(upgrade, 5).then(function(d){
                for(var i = 0, len = tables.length; i < len; i++){
                    if(_indexedDB.exists(tables[i])){
                        _indexedDB.clear(tables[i]);
                    }
                }

                indexedDB.deleteDatabase('YigoDictDB');
            },function(e){
                console.debug("open error");
            });
        });
    }

    var IndexedDBCache = function(){

        function _indexedDBCache(tableName){
            this.tableName = tableName;
        };

        _indexedDBCache.prototype.get = function(key){
            return _indexedDB.get(this.tableName, key).then(function(data){
                        if(data){
                            // console.log('cache...............');
                            return data.value;
                        }else{
                            // console.log('cache...............not find'+oid);
                            return null;
                        }
                    });
        };

        _indexedDBCache.prototype.put = function(key, value){
            var o = {};
            o.key = key;
            o.value = value;
            _indexedDB.put(this.tableName, o);
        };

        return _indexedDBCache;
    }();

    var TempCache = function(){

        function _tempCache(size){
            this.cache = new LRUCache(size);
        };

        _tempCache.prototype.get = function(key){
            var self = this;
            return $.Deferred(function(def){
                        def.resolve(self.cache.get(key));
                    }).promise();
        };

        _tempCache.prototype.put = function(key, value){
            this.cache.set(key, value);
        };

        return _tempCache;
    }();

    var dictCache = null;
    YIUI.DictCache = function(){

        if(!dictCache){
            dictCache = {
                get : function(key){
                    return this.getCache().get(key);
                },
                put : function(key, item){
                    return this.getCache().put(key, item);
                },
                getCache : function(){
                    if(this.cache){
                        return this.cache;
                    }
                    if(_indexedDB && _indexedDB.isOpen()){
                        this.cache = new IndexedDBCache(DICT_TABLE_NAME);
                    }else{
                        this.cache = new TempCache(200);
                    } 
                    return this.cache;
                }
            };
        }

        return dictCache;
    };

    var rightsCache = null;
    YIUI.RightsCache = function(){
        if(!rightsCache){
            rightsCache = {
                get : function(key){
                    return this.getCache().get(key);
                },
                put : function(key, doc){
                    return this.getCache().put(key, doc);
                },
                getCache : function(){
                    if(this.cache){
                        return this.cache;
                    }
                    if(_indexedDB && _indexedDB.isOpen()){
                        this.cache = new IndexedDBCache(RIGHTS_TABLE_NAME);
                    }else{
                        this.cache = new TempCache(10);
                    } 
                    return this.cache;
                }
            };
        }

        return rightsCache;
    };

    var metaCache = null;
    YIUI.MetaCache = function(){
        if(!metaCache){
            metaCache = {
                get : function(key){
                    return this.getCache().get(key);
                },
                put : function(key, doc){
                    return this.getCache().put(key, doc);
                },
                getCache : function(){
                    if(this.cache){
                        return this.cache;
                    }
                    if(_indexedDB && _indexedDB.isOpen()){
                        this.cache = new IndexedDBCache(META_TABLE_NAME);
                    }else{
                        this.cache = new TempCache(10);
                    } 
                    return this.cache;
                }
            };
        }
        return metaCache;    
    };

    var docCache = null;
    YIUI.DocCache = function(){
        if(!docCache){
            docCache = {
                get : function(key){
                    return this.getCache().get(key);
                },
                put : function(key, doc){
                    return this.getCache().put(key, doc);
                },
                getCache : function(){
                    if(this.cache){
                        return this.cache;
                    }
                    if(_indexedDB && _indexedDB.isOpen()){
                        this.cache = new IndexedDBCache(DOC_TABLE_NAME);
                    }else{
                        this.cache = new TempCache(30);
                    } 
                    return this.cache;
                }
            };
        }
        return docCache;
    };

    var dataObjCache = null;
    YIUI.DataObjCache = function(){
        if(!dataObjCache){
            dataObjCache = {
                get : function(key){
                    return this.getCache().get(key);
                },
                put : function(key, doc){
                    return this.getCache().put(key, doc);
                },
                getCache : function(){
                    if(this.cache){
                        return this.cache;
                    }
                    if(_indexedDB && _indexedDB.isOpen()){
                        this.cache = new IndexedDBCache(DATAOBJ_TABLE_NAME);
                    }else{
                        this.cache = new TempCache(30);
                    } 
                    return this.cache;
                }
            };
        }
        return dataObjCache;
    };
})();
