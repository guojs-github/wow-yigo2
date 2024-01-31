var DataType = (function () {
    var Return = {
        /** 32位整型 */
        INT: 1001,

        /** 字符串类型 */
        STRING: 1002,

        /** 日期类型 */
        DATE: 1003,

        /** 日期时间类型 */
        DATETIME: 1004,

        /** 数值类型 */
        NUMERIC: 1005,

        /** 双精度浮点数类型 */
        DOUBLE: 1006,

        /** 浮点数类型 */
        FLOAT: 1007,

        /** 二进制类型 */
        BINARY: 1008,

        /** 布尔类型 */
        BOOLEAN: 1009,

        /** 64位整型 */
        LONG: 1010
    };
    return Return;
})();

var DataDef = DataDef || {};

(function () {
    Lang.assign(DataDef, {
        R_Normal: 0,
        R_New: 1,
        R_Modified: 2,
        R_Deleted: 3,

        D_Normal: 0,
        D_New: 1,
        D_Modified: 2,
        D_Deleted: 3,

        D_Obj: 1,
        D_ObjDtl: 2
    });

    DataDef.BkmkMap = function () {
        this.tbs = new Array();
    };

    Lang.impl(DataDef.BkmkMap, {
        put: function (bkmk, idx) {
            if (bkmk >= this.tbs.length) {
                this.tbs.length = bkmk + 1;
            }
            this.tbs[bkmk] = idx;
        },
        get: function (bkmk) {
            if (bkmk < this.tbs.length) {
                return this.tbs[bkmk];
            }
            return undefined;
        },
        remove: function (bkmk) {
            this.tbs[bkmk] = undefined;
        },
        clear: function () {
            this.tbs = new Array();
        }
    });

    DataDef.ColInfo = function (key, type, userType, accessControl, defaultValue,isPrimary, scale) {
        this.key = key;
        this.type = type;
        this.userType = userType;
        this.accessControl = accessControl;
        this.defaultValue = defaultValue;
        this.isPrimary = isPrimary;
        this.scale = scale;
    };

    Lang.impl(DataDef.ColInfo, {
        setKey: function (key) {
            this.key = key;
        },
        getKey: function () {
            return this.key;
        },
        setType: function (type) {
            this.type = type;
        },
        getType: function () {
            return this.type;
        },
        setUserType: function (userType) {
            this.userType = userType;
        },
        getUserType: function () {
            return this.userType;
        },
        setAccessControl: function (accessControl) {
            this.accessControl = accessControl;
        },
        getAccessControl: function () {
            return this.accessControl;
        },
        setDefaultValue: function (defaultValue) {
            this.defaultValue = defaultValue;
        },
        getDefaultValue: function () {
            return this.defaultValue;
        },
        setPrimary:function(primary){
            this.isPrimary = primary;
        } ,
        isPrimary:function(){
            return this.isPrimary;
        },
        getScale: function(){
            return this.scale;
        }
    });

    DataDef.Row = function (size) {
        this.bkmk = -1;
        this.state = 0;
        this.orgVals = null;
        this.vals = Array.dim(size, null);
    };

    DataDef.DataTable = function () {
        this.key = "";
        this.allRows = new Array();
        this.rows = new Array();
        this.cols = new Array();
        this.bkmks = new DataDef.BkmkMap();
        this.pos = -1;
        this.bkmkSeed = 0;
        this.tableMode = -1;
        this.showDelete = false;
        this.isPersist = true;
        this.filterEval = null;
        this.indexMap = new HashMapIgnoreCase();
    };

    Lang.impl(DataDef.DataTable, {
        clone: function () {
            var newTable = new DataDef.DataTable();
            newTable.key = this.key;
            newTable.pos = this.pos;
            newTable.bkmkSeed = this.bkmkSeed;
            newTable.bkmks = $.extend(true, {}, this.bkmks);
            newTable.allRows = $.extend(true, [], this.allRows);
            newTable.rows = $.extend(true, [], this.rows);
            newTable.cols = $.extend(true, [], this.cols);
            return newTable;
        },
        addCol: function (key, type, userType, accessControl,defaultValue,isPrimary,scale) {
            this.indexMap.put(key,this.cols.length);
            var c = new DataDef.ColInfo(key, type, userType, accessControl,defaultValue,isPrimary,scale);
            this.cols.push(c);
        },
        getCol: function (index) {
            return this.cols[index];
        },
        getColumnCount: function () {
            return this.cols.length;
        },
        getColByKey: function (colKey) {
            return this.getCol(this.indexByKey(colKey));
        },
        addRow: function (needDefValue) {
            var r = new DataDef.Row(this.cols.length);
            if(needDefValue){
                var setDefaultValue = function(cols,row){
                    for (var i = 0, l = cols.length; i < l; ++i) {
                        var col = cols[i];
                        var defaultValue = col.getDefaultValue();
                        var type = col.getType();
                        var colKey = col.getKey();
                        if($.isDefined(defaultValue) && defaultValue != null){
                            var val = YIUI.TypeConvertor.toDataType(type, defaultValue);
                            row.vals[i] = val;
                        }else if((type == YIUI.DataType.INT
                                || type == YIUI.DataType.LONG
                                || type == YIUI.DataType.NUMERIC)&&
                                (YIUI.SystemField.OID_SYS_KEY != colKey
                                    && YIUI.SystemField.SOID_SYS_KEY != colKey
                                    && YIUI.SystemField.POID_SYS_KEY != colKey
                                    && YIUI.SystemField.VERID_SYS_KEY != colKey
                                    && YIUI.SystemField.DVERID_SYS_KEY != colKey
                                    )){
                            row.vals[i] = 0;
                        }
                    }
                };
                setDefaultValue(this.cols, r);
            }
            r.bkmk = this.bkmkSeed++;
            r.state = DataDef.R_New;
            this.rows.push(r);
            this.allRows.push(r);
            this.bkmks.put(r.bkmk, this.rows.length - 1);
            this.pos = this.rows.length - 1;
        },
        size: function () {
            return this.rows.length;
        },
        setPos: function (pos) {
            this.pos = pos;
        },
        getPos: function () {
            return this.pos;
        },
        getState: function () {
            return this.rows[this.pos].state;
        },
        setState: function (state) {
            this.rows[this.pos].state = state;
        },
        setByBkmk: function (bkmk) {
            var idx = this.bkmks.get(bkmk);
            if (idx != undefined) {
                this.pos = idx;
            } else {
                this.pos = -1;
            }
        },
        getBkmk: function () {
            return this.rows[this.pos].bkmk;
        },
        getParentBkmk: function () {
            return this.rows[this.pos].parentBkmk;
        },
        setParentBkmk:function(bkmk) {
            this.rows[this.pos].parentBkmk = bkmk;
        },
        beforeFirst: function () {
            this.pos = -1;
        },
        afterLast: function () {
            this.pos = this.rows.length;
        },
        next: function () {
            if (this.pos == this.rows.length) {
                return false;
            }
            ++this.pos;
            return this.pos != this.rows.length;
        },
        previous: function () {
            if (this.pos == -1) {
                return false;
            }
            --this.pos;
            return this.pos != -1;
        },
        first: function () {
            if (this.rows.length == 0) {
                return false;
            }
            this.pos = 0;
            return true;
        },
        last: function () {
            if (this.rows.length == 0) {
                return false;
            }
            this.pos = this.rows.length - 1;
            return true;
        },
        getRowCount: function () {
            return this.rows.length;
        },
        isBeforeFirst: function () {
            return this.pos == -1;
        },
        isAfterLast: function () {
            return this.pos == this.rows.length;
        },
        isFirst: function () {
            return this.rows.length != 0 && this.pos == 0;
        },
        isLast: function () {
            return this.rows.length != 0 && this.pos == this.rows.length - 1;
        },
        isValid: function () {
            return this.rows.length != 0 & this.pos >= 0 && this.pos < this.rows.length;
        },
        get: function (idx) {
            return this.rows[this.pos].vals[idx];
        },
        createOriginData: function (vals) {
            var orgVals = [],ov,cv;
            for( var i = 0,size = vals.length;i < size;i++ ) {
                ov = vals[i];
                if( ov instanceof Date ) {
                    cv = new Date(ov.getTime());
                } else if ( ov instanceof YIUI.ItemData ) {
                    cv = ov.clone();
                } else {
                    cv = ov;
                }
                orgVals[i] = cv;
            }
            return orgVals;
        },
        setObject:function (ri,idx,val) {
            var row = this.rows[ri];
            var rowState = row.state;
            if (rowState == DataDef.R_Normal) {
                row.orgVals = this.createOriginData(row.vals);
                row.state = DataDef.R_Modified;
            }
            row.vals[idx] = val;
        },
        set: function (idx, val) {
            var row = this.rows[this.pos];
            var rowState = row.state;
            if (rowState == DataDef.R_Normal) {
                row.orgVals = this.createOriginData(row.vals);
                row.state = DataDef.R_Modified;
            }
            row.vals[idx] = val;
        },
        setState:function(state) {
            var row = this.rows[this.pos];
            row.state = state;
        },
        setShowDelete:function (showDel) {
            if( this.showDelete != showDel ) {
                this.showDelete = showDel;
                this.filter();
            }
        },
        indexByKey: function (key) {
          return this.indexMap.get(key);
        },
        getByKey: function (key) {
            return this.get(this.indexByKey(key));
        },
        setByKey: function (key, val) {
            this.set(this.indexByKey(key), val);
        },

        setNew: function () {
            this.rows = [];
            this.bkmks.clear();
            this.pos = -1;
            this.rows = this.allRows;
            for (var i = 0, len = this.rows.length; i < len; i++) {
                var row = this.rows[i];
                this.bkmks.put(row.bkmk, i);
                row.state = DataDef.R_New;
                row.orgVals = null;
            }
        },

        clear:function () {
            this.allRows.length = 0;
            this.rows.length = 0;
            this.bkmks.clear();
            this.pos = -1;
            this.bkmkSeed = 0;
        },

        delAll:function () {
            var row;
            for( var i = this.allRows.length - 1; i >= 0; --i ) {
                row = this.allRows[i];
                if( row.state == DataDef.R_New ){
                    this.allRows.splice(i,1);
                } else {
                    row.state = DataDef.R_Deleted;
                }
            }

            this.rows.length = 0;
            this.bkmks.clear();
            if( this.showDelete ) {
                this.rows.push.apply(this,this.allRows);
                for (var i = 0, len = this.rows.length; i < len; i++) {
                    this.bkmks.put(this.rows[i].bkmk, i);
                }
            }
            this.pos = -1;
        },

        delRow: function (idx) {
            if (idx == null) {
                idx = this.pos;
            }
            var r = this.rows[idx], oldSize = this.rows.length;
            this.rows.splice(idx, 1);
            if (r.state == DataDef.R_New) {

                for(var i = 0 ; i < this.allRows.length ; i ++){
                    if(r == this.allRows[i]){
                        this.allRows.splice(i, 1);
                        break;
                    }
                }

                this.bkmks.remove(r.bkmk);
                if (this.pos > idx)
                    this.pos--;
            } else {
                r.state = DataDef.R_Deleted;
                this.bkmks.remove(r.bkmk);
                if (this.pos > idx)
                    this.pos--;
            }
            var newSize = this.rows.length;
            if (newSize != oldSize) {
                for (var i = 0, len = this.rows.length; i < len; i++) {
                    r = this.rows[i];
                    this.bkmks.put(r.bkmk, i);
                }
            }
        },
        batchUpdate: function () {
            var l = this.allRows.length;
            for (var i = l - 1; i >= 0; --i) {
                var r = this.allRows[i];
                if (r.state == DataDef.R_Deleted) {
                    this.allRows.splice(i, 1);
                } else {
                    r.state = DataDef.R_Normal;
                    r.orgVals = null;
                }
            }
        },
        setFilterEval: function (filterEval) {
            this.filterEval = filterEval;
        },
        filter: function () {
            if( this.filterEval == null ) {
                this.rows.length = 0;
                this.bkmks.clear();
                for( var i = 0,row;row = this.allRows[i];i++ ) {
                    if( !this.showDelete && row.state == DataDef.R_Deleted ) {
                        continue;
                    }
                    this.rows.push(row);
                    this.bkmks.put(row.bkmk, this.rows.length - 1);
                }
            } else {
                this.rows.length = 0;
                for( var i = 0,row;row = this.allRows[i];i++ ) {
                    if( !this.showDelete && row.state == DataDef.R_Deleted ) {
                        continue;
                    }
                    this.rows.push(row);
                }

                var removeList = [];

                this.beforeFirst();
                while( this.next() ) {
                    if( !this.filterEval.call(this,this,this.pos) ) {
                        removeList.unshift(this.pos);
                    }
                }

                for( var k = 0,size = removeList.length; k < size;k++ ) {
                    this.rows.splice(removeList[k], 1);
                }

                this.bkmks.clear();
                this.beforeFirst();
                while( this.next() ) {
                    this.bkmks.put(this.getBkmk(),this.pos);
                }
                this.beforeFirst();
            }
            this.pos = -1;
        },
        clearFilter: function () {
            this.filterEval = null;
            this.filter();
        }
    });

    DataDef.Document = function () {
        this.tbls = new Array();
        this.shadows = new HashMap();
        this.maps = new HashMap();
        this.oid = -1;
        this.poid = -1;
        this.verid = -1;
        this.dverid = -1;
        this.state = 0;
        this.docType = DataDef.D_Obj;
        this.expData = new HashMap();
        this.expDataType = new HashMap();
        this.expDataClass = new HashMap();
        this.mainTableKey = "";
        this.object_key = "";
        this.version = 0;
    };

    Lang.impl(DataDef.Document, {
        isNew: function () {
            return this.state == YIUI.DocType.NEW;
        },

        getExpDataInfo: function (key) {
            return {data: this.expData[key], dataType: this.expDataType[key], dataClass: this.expDataClass[key]};
        },

        getExpData: function(key) {
        	return this.expData[key];
        },

        putExpData: function (key, value) {
            this.expData[key] = value;
        },
        
        rmExpData: function (key) {
        	delete this.expData[key];
        	delete this.expDataType[key];
        	delete this.expDataClass[key];
        },

        add: function (key, tbl) {
            this.tbls.push(tbl);
            this.maps.put(key, tbl);
        },

        size:function () {
            return this.tbls.length;
        },

        addShadow: function (key, tbl) {
            this.shadows.put(key, tbl);
        },

        shadowKeys: function() {
            return this.shadows.keys();
        },

        remove: function (key) {
            var tbl = this.maps.get(key);
            this.maps.remove(key);
            for (var i = this.tbls.length - 1; i >= 0; --i) {
                if (this.tbls[i] == tbl) {
                    this.tbls.splice(i, 1);
                    break;
                }
            }
        },

        get: function (idx) {
            return this.tbls[idx];
        },

        setByKey: function (key, tbl) {
            this.maps.put(key, tbl);
            for (var i = this.tbls.length - 1; i >= 0; --i) {
                if (this.tbls[i].key == key) {
                    this.tbls.splice(i, 1, tbl);
                    break;
                }
            }
        },

        /**
         * 获取指定数据表的直接子表
         * @param parentKey
         * @returns {Array}
         */
        getByParentKey: function (parentKey) {
            var subTables = [], table;
            for (var i = 0, len = this.tbls.length; i < len; i++) {
                table = this.tbls[i];
                if (table.parentKey == parentKey) {
                    subTables.push(table);
                }
            }
            return subTables;
        },

        /**
         * 获取指定数据表的所有子表
         * @param parentKey
         * @returns {Array}
         */
        getTblsByParentKey:function (parentKey) {

            var tbls = [], _this = this;

            var getByParent = function (parentKey) {
                var tables = _this.getByParentKey(parentKey);
                tbls.push.apply(tbls,tables);

                for( var i = 0,size = tables.length;i < size;i++ ) {
                    getByParent(tables[i].key);
                }
            }

            getByParent(parentKey);

            return tbls;
        },

        getByKey: function (key) {
            return this.maps.get(key);
        },

        getShadow: function (key){
            return this.shadows.get(key);
        },

        clear: function () {
            this.tbls.length = 0;
            this.maps.clear();
            this.shadows.clear();
        },

        setDocType: function (type) {
            this.docType = type;
        },

        setModified: function () {
            this.state = DataDef.D_Modified;
        },

        batchUpdate: function () {
            for (var i = 0, l = this.tbls.length; i < l; ++i) {
                var t = this.tbls[i];
                t.batchUpdate();
            }
        },

        setNew: function(){
            this.state = YIUI.DocType.NEW;
        },

        clone: function () {
            var newDoc = new DataDef.Document();
            newDoc.oid = this.oid;
            newDoc.poid = this.poid;
            newDoc.verid = this.verid;
            newDoc.dverid = this.dverid;
            newDoc.state = this.state;
            newDoc.docType = this.docType;
            newDoc.mainTableKey = this.mainTableKey;
            newDoc.tbls = [];
            newDoc.maps = new HashMap();
            for (var i = 0, table, len = this.tbls.length; i < len; i++) {
                table = this.tbls[i].clone();
                newDoc.tbls.push(table);
                newDoc.maps.put(table.key, table);
            }
            newDoc.expData = $.extend(true, {}, this.expData);
            newDoc.expDataType = $.extend(true, {}, this.expDataType);
            newDoc.expDataClass = $.extend(true, {}, this.expDataClass);
            return newDoc;
        }
    });

    DataDef.Item = function () {
        this.itemKey = null;
        this.oid = 0;
        this.nodeType = 0;
        this.enable = 0;
        this.caption = null;
        this.mainTableKey = null;
        this.itemTables = {};
    };

    Lang.impl(DataDef.Item, {
        toItemData: function () {
            var itemData = {};
            itemData.itemKey = this.itemKey;
            itemData.oid = this.oid;
            return itemData;
        },

        getValue: function (fieldKey, tableKey) {
            if (!tableKey) {
                tableKey = this.mainTableKey;
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

        }
    });

    DataDef.DataObject = function () {
        this.key = null;
        this.caption = null;
        this.primaryType = 1;
        this.secondaryType = 2;
        this.mainTableKey = null;
        this.tables = [];
    };
    
    Lang.impl(DataDef.DataObject, {
        getKey: function(){
            return this.key;
        },

        getCaption: function(){
            return this.caption;
        },

        getPrimaryType: function(){
            return this.primaryType;
        },

        getSecondaryType: function(){
            return this.secondaryType;
        },

        getMainTableKey: function(){
            return this.mainTableKey;
        },

        getTable: function(key) {
            var table = null;
            for(var i = 0 , len = this.tables.length; i < len; i ++){
                table = this.tables[i];
                if(table.key == key){
                    return table;
                }
            }
            return null;
        },

        getColumn: function(tableKey, colKey){
            var table = this.getTable(colKey === undefined? this.mainTableKey : tableKey);
            if(table){
                var key = colKey === undefined? tableKey : colKey;
                var col;
                for(var i = 0 , len = table.cols.length; i < len; i ++){
                    col = table.cols[i];
                    if(col.key == key){
                        return col;
                    }
                }
            }
            return null;
        },

        getDisplayColumns: function(){
            if(this.displayCols){
                return this.displayCols;
            }
            return null;
        },

        getQueryColumns: function(){
            if(this.queryCols){
                return this.queryCols;
            }
            return null;
        },

        fromJSON: function(jsonObj) {
            if(jsonObj.key) {
                this.key = jsonObj.key;
            }
            if(jsonObj.caption) {
                this.caption = jsonObj.caption;
            }
            if(jsonObj.primaryType) {
                this.primaryType = jsonObj.primaryType;
            }
            if(jsonObj.secondaryType) {
                this.secondaryType = jsonObj.secondaryType;
            }
            if(jsonObj.mainTableKey) {
                this.mainTableKey = jsonObj.mainTableKey;
            }
            if(jsonObj.tables){
                this.tables = jsonObj.tables
            }

            if(this.secondaryType == YIUI.SECONDARYTYPE.COMPDICT){
                this.relation = jsonObj.relation;
            } 

            if(this.secondaryType == YIUI.SECONDARYTYPE.DICT 
                || this.secondaryType == YIUI.SECONDARYTYPE.CHAINDICT ){
                //字典显示字段
                var displayFields = jsonObj.displayFields || "Code;Name";
                var fields = displayFields.split(";");

                this.displayCols = [];

                var col;
                for(var i = 0, len = fields.length; i < len ; i ++){
                    col = this.getColumn(this.mainTableKey, fields[i]);
                    this.displayCols.push(col);
                }

                //模糊查询字段
                var queryFields = jsonObj.queryFields || "Code;Name";
                fields = queryFields.split(";");

                this.queryCols = [];
                for(var i = 0, len = fields.length; i < len ; i ++){
                    col = this.getColumn(this.mainTableKey, fields[i]);
                    this.queryCols.push(col);
                }

            }
        }
    });
})();




