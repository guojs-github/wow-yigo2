"use strict";
YIUI.ComboBoxHandler = (function () {

    var cache = new LRUCache(20);

    var getCacheKey = function(form, meta, cxt){
        var sourceType = meta.sourceType || YIUI.COMBOBOX_SOURCETYPE.ITEMS;

        if(sourceType == YIUI.COMBOBOX_SOURCETYPE.FORMULA || sourceType == YIUI.COMBOBOX_SOURCETYPE.QUERY){
            var data = {};
            data.key = meta.key;
            data.formKey = form.getFormKey(); // 处理没有依赖,设置缓存

            var dependency = meta.dependency;
            if( dependency ){
                var fields = dependency.split(","), field;
                for(var i = 0 ; i < fields.length ; i ++){
                    field = fields[i];
                    data[field] = form.eval(field, cxt, null);
                }
            }

            return $.toJSON(data);
        }
        return null;
    }

    var getFormulaItems = function(form, meta, cxt){
        var items = [];
        if (meta.formula) {
            var rs = form.eval($.trim(meta.formula), cxt, null);
            if ($.isString(rs)) {
                var item_Arr = rs.split(";");
                for (var i = 0, len = item_Arr.length; i < len; i++) {
                    var item_obj = item_Arr[i].split(",");
                    var i1 = item_obj[0];
                    var i2 = "";
                    if (item_obj.length > 1) {
                        i2 = item_obj[1];
                    } else {
                        i2 = i1;
                    }
                    var item = {
                        value: i1,
                        caption: i2
                    };
                    items.push(item);
                }
            } else if (rs instanceof DataDef.DataTable) {
                rs.beforeFirst();
                if (rs.cols.length == 1) {// 如果查询的是一列,那么认为是查询了value,caption从全局中匹配
                    var globalItems = meta.globalItems;
                    var pItems = form.eval($.trim(globalItems), cxt, null);
                    while (rs.next()) {
                        var value = YIUI.TypeConvertor.toString(rs.get(0));
                        var caption = "";
                        if (pItems && pItems.length > 0) {
                            for (var i = 0, len = pItems.length; i < len; i++) {
                                var pItem = pItems[i];
                                if (pItem.value == value) {
                                    caption = pItem.caption;
                                    break;
                                }
                            }
                        }
                        caption = caption == "" ? value : caption;
                        var item = {
                            value: value,
                            caption: caption
                        };
                        items.push(item);
                    }
                } else if (rs.cols.length > 1) {
                    while (rs.next()) {
                        var value = YIUI.TypeConvertor.toString(rs.get(0));
                        var caption = YIUI.TypeConvertor.toString(rs.get(1));
                        var item = {
                            value: value,
                            caption: caption
                        };
                        items.push(item);
                    }
                }
            } else if($.isArray(rs)) {
                items = items.concat(rs);
            } else if(rs && $.isArray(rs.items)) {
                items = items.concat(rs.items);
            }  
        } 

        return items;
    }

    var getQueryItems = function(form, meta, cxt, async){
        var queryParas = meta.queryParas || [];
        var data = {}, type;
        data.formKey = form.getFormKey();
        data.fieldKey = meta.key;
        data.typeDefKey = meta.typeDefKey;
        data.queryIndex = 0;
        data.service = "ComboBoxService";
        data.cmd = "getQueryItems";
        
        var sourceType, value, paras = [];
        for (var i = 0, len = queryParas.length; i < len; i++) {
            sourceType = queryParas[i].sourceType;
            value = queryParas[i].value;
            switch (sourceType) {
            case YIUI.COMBOBOX_PARAMETERSOURCETYPE.CONST:
                break;
            case YIUI.COMBOBOX_PARAMETERSOURCETYPE.FORMULA:
            case YIUI.COMBOBOX_PARAMETERSOURCETYPE.FIELD:
                value = form.eval(value, cxt, null);
                break;
            }
            if(value instanceof Date) {
            	value = value.getTime();
            }
            paras.push(value);
        }
        data.paras = $.toJSON(paras);

        if( async ) {
            return new Svr.Request(form).getData(data);
        } else {
            return new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL,data);
        }
    }

    var Return = {
        //获取下拉框的值
        getItems: function (form, meta, cxt) {

            var def = $.Deferred();

            var sourceType = meta.sourceType || YIUI.COMBOBOX_SOURCETYPE.ITEMS, cacheKey;

            switch (sourceType) {
            case YIUI.COMBOBOX_SOURCETYPE.ITEMS:
            case YIUI.COMBOBOX_SOURCETYPE.STATUS:
            case YIUI.COMBOBOX_SOURCETYPE.PARAGROUP:
                def.resolve(meta.items);
                break;
            case YIUI.COMBOBOX_SOURCETYPE.FORMULA:

                if (cxt == null) {
                    cxt = new View.Context(form);
                }

                if( meta.cache ) {
                    cacheKey = getCacheKey(form, meta, cxt);
                }

                var items = null;
                if( cacheKey ){
                    items = cache.get(cacheKey);
                }

                if( items == null ){
                    items = getFormulaItems(form, meta, cxt);
                    if( meta.cache && cacheKey ) {
                        cache.set(cacheKey, items);
                    }
                }

                def.resolve(items);
                break;
            case YIUI.COMBOBOX_SOURCETYPE.QUERY:

                if (cxt == null) {
                    cxt = new View.Context(form);
                }

                if( meta.cache ) {
                    cacheKey = getCacheKey(form, meta, cxt);
                }

                var items = null;
                if(cacheKey){
                    items = cache.get(cacheKey);
                }

                if(items == null){
                    def = getQueryItems(form, meta, cxt, true).then(function(d){
                        if( meta.cache && cacheKey ) {
                            cache.set(cacheKey, d);
                        }
                        return d;
                    });
                }else{
                    def.resolve(items);
                }

                break;
            }

            return def.promise();
        },

        // 同步获取
        getItemsSync: function (form, meta, cxt) {

            var sourceType = meta.sourceType || YIUI.COMBOBOX_SOURCETYPE.ITEMS, cacheKey, items;

            switch (sourceType) {
            case YIUI.COMBOBOX_SOURCETYPE.ITEMS:
            case YIUI.COMBOBOX_SOURCETYPE.STATUS:
            case YIUI.COMBOBOX_SOURCETYPE.PARAGROUP:
                items = meta.items;
                break;
            case YIUI.COMBOBOX_SOURCETYPE.FORMULA:
                if (cxt == null) {
                    cxt = new View.Context(form);
                }

                if( meta.cache ) {
                    cacheKey = getCacheKey(form, meta, cxt);
                }

                if( cacheKey ) {
                    items = cache.get(cacheKey);
                }

                if( items == null ) {
                    items = getFormulaItems(form, meta, cxt);
                    if( meta.cache && cacheKey ) {
                        cache.set(cacheKey, items);
                    }
                }
                break;
            case YIUI.COMBOBOX_SOURCETYPE.QUERY:
                if (cxt == null) {
                    cxt = new View.Context(form);
                }

                if( meta.cache ) {
                    cacheKey = getCacheKey(form, meta, cxt);
                }

                if(cacheKey){
                    items = cache.get(cacheKey);
                }

                if(items == null){
                    items = getQueryItems(form, meta, cxt);
                    if( meta.cache && cacheKey ) {
                        cache.set(cacheKey, items);
                    }
                }
                break;
            }

            return items;
        },

        getShowCaption: function(sourceType, items, value, multiSelect, editable) {

            if( !items )
                return "";

            var getItemCaption = function(v) {
                var item;
                for (var i = 0, len = items.length, item; i < len; i++) {
                    item = items[i];
                    if(YIUI.TypeConvertor.toString(item.value) == YIUI.TypeConvertor.toString(v)) {
                        return item.caption || "";
                    }
                }
                return "";
            };

            var caption = "";
            if (value != null && value !== "") {  // 0 == "" !!
                switch (sourceType) {
                case YIUI.COMBOBOX_SOURCETYPE.QUERY:
                    caption = value;
                    break;
                default:
                    if(multiSelect) {
                        value = YIUI.TypeConvertor.toString(value);
                        var values = value.split(",");
                        for (var i = 0, len = values.length; i < len; i++) {
                            if(i > 0) {
                                caption += ",";
                            }
                            caption += getItemCaption(values[i]);
                        }
                    } else {
                        caption = getItemCaption(value);
                    }
                    break;
                }
            }
            if(!caption && editable) {
            	caption = YIUI.TypeConvertor.toString(value);
            }
            return caption;
        },

        doSuggest: function (form, meta, value) {
            var def = $.Deferred();
            var viewItems = [];

            var def = $.Deferred();
            this.getComboboxItems(form, meta)
                        .done(function(items){
                            for (var i = 0, len = items.length; i < len; i++) {
                            	if (items[i].caption != null) {
                            		if (items[i].caption.indexOf(value) >= 0) viewItems.push(items[i]);
                            	}
                                if (viewItems.length == 5) break;
                            }
                            def.resolve(viewItems);
                        });

            return def.promise();
            
        },
        getValByCaption: function (items,caption) {
            var getItemVal = function(text) {
                for (var i = 0,item;item = items[i];i++) {
                    if( item.caption == text ) {
                        return item.value;
                    }
                }
                return "";
            };

            var texts = caption.split(","),v;
            for( var k = 0,size = texts.length;k < size;k++ ) {
                if( !v ) {
                    v = getItemVal(texts[k]);
                } else {
                    v += "," + getItemVal(texts[k]);
                }
            }
            return v;
        }
    };

    Return = $.extend({}, YIUI.Handler, Return);
    return Return;
})();