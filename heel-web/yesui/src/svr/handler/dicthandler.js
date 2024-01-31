YIUI.DictHandler = (function () {

    var Return = {
        doLostFocus: function (extParas) {

        },

        getMetaFilter: function(form, fieldKey, itemFilters, itemKey, cxt) {
            var filter = null;
            if (itemFilters) {
                var itemFilter = itemFilters[itemKey] || itemFilters[''];
                if (itemFilter != null && itemFilter != undefined && itemFilter.length > 0) {
                    for (var i = 0, len = itemFilter.length; i < len; i++) {
                        var cond = itemFilter[i].cond;
                        if (cond && cond.length > 0) {
                            if(!cxt) {
                                cxt = new View.Context(form);
                            }
                            var ret = form.eval(cond, cxt, null);
                            if (ret == true) {
                                filter = itemFilter[i];
                                break;
                            }
                        } else {
                            filter = itemFilter[i];
                            break;
                        }
                    }
                }
            }
            return filter;
        },

        getDictFilter: function (form, fieldKey, itemFilters, itemKey, typeDefKey, cxt) {
            var filter = Return.getMetaFilter(form, fieldKey, itemFilters, itemKey);
            if (filter) {
                var filters = filter.filterVals, filterVal, value, paras = [];
                if (filters !== null && filters.length > 0) {
                    for (var j = 0, len = filters.length; j < len; j++) {
                        filterVal = filters[j];
                        switch (filterVal.type) {
                        case YIUI.FILTERVALUETYPE.CONST:
                            value = filterVal.refVal;
                            break;
                        case YIUI.FILTERVALUETYPE.FORMULA:
                        case YIUI.FILTERVALUETYPE.FIELD:
                            if(!cxt) {
                                cxt = new View.Context(form);
                            }
                            value = form.eval(filterVal.refVal, cxt, null);
                            break;
                        }
                        if( filterVal.dataType == YIUI.DataType.DATE ||
                            filterVal.dataType == YIUI.DataType.DATETIME ) {
                            if( value instanceof Date ) {
                                value = value.getTime();
                            }
                        }
                        paras.push(value);
                    }
                }
                var dictFilter = {};
                dictFilter.itemKey = itemKey;
                dictFilter.formKey = form.formKey;
                dictFilter.fieldKey = fieldKey;
                dictFilter.filterIndex = filter.filterIndex;
                dictFilter.values = paras;
                dictFilter.dependency = filter.dependency;
                dictFilter.typeDefKey = typeDefKey;
                return dictFilter;
            }
            return null;
        },

        getItemKey: function(form, refKey, unitCxt){
            var cxt = new View.Context(form);
            if( unitCxt ) {
                cxt.updateLocation(unitCxt.getKey(),unitCxt.getRow(),unitCxt.getColumn());
            }
            return form.eval(refKey, cxt, null);
        },

        getRoot: function(form, itemKey, rootKey, unitCxt){

            var rootItem = {};

            if (rootKey && rootKey.length >= 0) {

                rootItem = form.getValueByKey(rootKey,unitCxt);

                if (rootItem == null) {
                    rootItem = {};
                    rootItem.oid = 0;
                    rootItem.itemKey = itemKey;
                }
            } else {
                rootItem.oid = 0;
                rootItem.itemKey = itemKey;
            }

            return new YIUI.ItemData(rootItem);
        },

        createRoot: function(form, itemKey, rootKey, cxt){
            var rootItem = Return.getRoot(form, itemKey, rootKey, cxt);

            return new YIUI.MetaService(form).getDataObject(itemKey)
                                .then(function(dataObj){
                                    var ret = {};
                                    ret.root = rootItem;
                                    ret.secondaryType = dataObj.secondaryType;

                                    if(rootItem.getOID() == 0){
                                        ret.rootCaption = dataObj.caption;
                                    }else if(rootItem.hasCaption()){
                                        ret.rootCaption = rootItem.getCaption(); 
                                    }else{
                                        return new YIUI.DictCacheProxy(form).getCaption(itemKey, rootItem.oid).then(function(caption){
                                            rootItem.caption = caption;
                                            ret.root = rootItem;
                                            ret.rootCaption = caption;
                                            return ret;
                                        });
                                    }
                                    return ret;
                                });
        },

        getShowCaption: function(form, val, multiSelect, independent, textField){
            var def = $.Deferred();

            var itemKey = null;
            if(val != null) {
                var captionCache;
                if(form && form.getDocument()){
                    captionCache = form.getDocument().getExpData(YIUI.DocExpandDataKeys.DICT_CAPTIONS);
                }

                var oids, needCaption = false;
                if(multiSelect) {

                    oids = [];
                    var text = '';

                    for (var i = 0, len = val.length; i < len; i++) {
                        var v = val[i];

                        if(v.oid != 0){
                            oids.push(v.oid);
                            if(v.hasCaption() && !textField){
                                text = text + ','+v.getCaption();
                            }else{
                                itemKey = v.getItemKey();
                                var key = itemKey + "_" + v.oid;
                                if(captionCache && captionCache.hasOwnProperty(key) && !textField){
                                    text = text + ','+captionCache[key];  
                                }else{
                                    needCaption = true;
                                }
                            }
                        } else {
                        	if (!independent) {
                        		text = ','+YIUI.I18N.getString("RIGHTSSET_SELECTALL","全选");
                                break;
                        	}
                        }
                    }


                    if(!needCaption){
                        if(text.length > 0){
                            text = text.substring(1);
                        }
                        def.resolve(text);
                        //this.setText(text);
                    }

                } else if(val.oid == 0){
                    def.resolve('');
                    //this.setText('');
                } else if(val instanceof YIUI.ItemData) {
                    //如果值中已含caption 则直接赋值
                    if(val.hasCaption() && !textField){
                        def.resolve(val.getCaption());
                        //this.setText(value.getCaption());
                    }else{
                        oids = val.oid;
                        itemKey = val.getItemKey();
                        var key = itemKey + "_" + val.oid;
                        if(captionCache && captionCache.hasOwnProperty(key) && !textField){
                            def.resolve(captionCache[key]);
                        }else{
                            needCaption = true;
                        }
                    }
                } else {
                    def.resolve('');
                }

                if(needCaption){
                       if(multiSelect) {
                            //TODO 之后做优化 不要循环调用多次
                            var args = [];
                            var dictCacheProxy = new YIUI.DictCacheProxy(form);
                            for(var i = 0 ; i < oids.length ; i++){
                                args.push(dictCacheProxy.getItem(itemKey, oids[i]));
                            }
                            def = $.when.apply($.when,args).then(function(){
                                var c = '';
                                for(var i = 0; i< arguments.length; i ++){
                                    if(arguments[i]){
                                        if(textField){
                                            c = c + ',' + arguments[i].getValue(textField);
                                        }else{
                                            c = c + ',' + arguments[i].caption;
                                        }
                                    }
                                }

                                if(c.length > 0){
                                    c = c.substring(1);
                                }

                                return c;

                            });
                       }else{
                            def = new YIUI.DictCacheProxy(form).getItem(itemKey, oids).then(function(item){
                                        if(item == null){
                                            return '';
                                        }
                                        if(textField){
                                            return item.getValue(textField);
                                        }
                                        return item.caption;
                                    });
                       }
                }

            }else{
                def.resolve('');
            }

            return def.promise();
        },

        doSuggest: function (form, meta, text, dictFilter, root) {
            if (meta.multiSelect) {
                return;
            }
            var def = $.Deferred();
            
            new YIUI.DictService(form).getSuggestData(meta.itemKey, text, meta.stateMask, dictFilter, root).then(function(viewItems) {
                def.resolve(viewItems);
            });

            return def.promise();
        }

    };

    Return = $.extend({}, YIUI.Handler, Return);
    return Return;
})();