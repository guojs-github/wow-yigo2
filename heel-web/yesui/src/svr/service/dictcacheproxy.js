var YIUI = YIUI || {};
(function () {

    var cache = new YIUI.DictCache();
    var reqMap = {};

    YIUI.DictCacheProxy = (function () {
        function _DictCacheProxy(f){
            this.form = f;
            
            if(f){
                var appEnv = f.getAppEnv();
                if(appEnv){
                    this.appKey = appEnv.getAppKey();
                }  
            }
        };

        _DictCacheProxy.prototype.getItem = function(itemKey, oid) {

            if(itemKey == null || itemKey.isEmpty()){
                console.error('error itemKey and oid:['+itemKey + "   "+oid+"]");
                return $.Deferred(function(def){
                            def.resolve(null);
                        });
            }
            
            oid = parseInt(oid);

            var key = this.appKey + "_" + itemKey + "_" + oid;

            if(!reqMap[key]){
                var cacheDef = cache.get(key);
                var versionDef = new YIUI.MetaService(this.form).getDataObjectVersion(itemKey);
                var ds = new YIUI.DictService(this.form);

                reqMap[key] = $.when(cacheDef, versionDef)
                                .then(function(data, version){
                                        // TODO check version
                                        if(data){
                                            return YIUI.DataUtil.fromJSONItem(data);
                                        }else{
                                            //不存在；
                                            return ds.getItem(itemKey, oid).then(function(item){
                                 
                                                if(item){
                                                    cache.put(key, item);
                                                }else{
                                                    console.log('dict service not find ......'+itemKey + "  "+oid);    
                                                }

                                                return item;
                                            }); 
                                        }
                                },function(error){
                                    console.log('error ......'+error);
                                }).always(function(){
                                    setTimeout(function(){
                                        delete reqMap[key];
                                    },100);
                                });
            }

            return reqMap[key];  
        };


        _DictCacheProxy.prototype.getCaption = function(itemKey, oid) {
            if(itemKey == null || itemKey.isEmpty()){
                console.error('error itemKey and oid:['+itemKey + "   "+oid+"]");
                return $.Deferred(function(def){
                            def.resolve('');
                        });
            }
            
            return this.getItem(itemKey, oid)
                        .then(function(item){
                            if(item == null){
                                return '';
                            }
                            return item.caption;
                        });
        };

        //删除字典缓存
        _DictCacheProxy.prototype.removeCache = function(itemKey, oid) {
            var key = this.appKey + "_" + itemKey + "_" + oid;
            cache.put(key, null);  
        };

        return _DictCacheProxy;
    })();
})();
