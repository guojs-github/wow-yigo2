YIUI.DataUtil = (function () {
    var Return = {
        dataType2JavaDataType: function (dataType) {
            switch (dataType) {
                case YIUI.DataType.LONG:
                    return YIUI.JavaDataType.USER_LONG;
                case YIUI.DataType.BINARY:
                    return YIUI.JavaDataType.USER_BINARY;
                case YIUI.DataType.BOOLEAN:
                    return YIUI.JavaDataType.USER_BOOLEAN;
                case YIUI.DataType.DATE:
                case YIUI.DataType.DATETIME:
                    return YIUI.JavaDataType.USER_DATETIME;
                case YIUI.DataType.DOUBLE:
                case YIUI.DataType.FLOAT:
                case YIUI.DataType.NUMERIC:
                    return YIUI.JavaDataType.USER_NUMERIC;
                case YIUI.DataType.INT:
                    return YIUI.JavaDataType.USER_INT;
                case YIUI.DataType.STRING:
                    return YIUI.JavaDataType.USER_STRING;

            }
            return -1;
        },
        toJSONDoc: function (doc, withShadow, onlyHead) {
            if (!doc) return;

            var json = {},
                table_list = [],
                table;
            if (doc.oid) {
                json.oid = doc.oid;
            }
            if (doc.poid) {
                json.poid = doc.poid;
            }
            json.verid = doc.verid || 0;
            json.dverid = doc.dverid || 0;

            json.state = doc.state || DataType.D_Normal;

            if (doc.docType) {
                json.document_type = doc.docType;
            }

            var keys = doc.maps.table, dt;

            for(var key in keys){
                if(withShadow){
                    dt = doc.getShadow(key) || doc.getByKey(key);
                }else{
                    dt = doc.getByKey(key);
                }

                if( onlyHead && dt.tableMode != YIUI.TableMode.HEAD ) {
                    continue;
                }
  
                table = this.toJSONDataTable(dt);
                table_list.push(table);
            }
            
            json.table_list = table_list;
            json.expand_data = doc.expData;
            json.expand_data_type = doc.expDataType;
            json.expand_data_class = doc.expDataClass;
            json.mainTableKey = doc.mainTableKey;
            json.object_key = doc.object_key;
            return json;
        },

        toJSONDataTable: function (dataTable) {
            if(!dataTable) return;

            var table = {};
            table.key = dataTable.key;
            table.bookmark_seed = dataTable.bkmkSeed;
            table.tableMode = dataTable.tableMode;
            table.isPersist = dataTable.isPersist;

            var cols = dataTable.cols, col, columns = [], column;
            for (var k = 0, length = cols.length; k < length; k++) {
                col = cols[k];
                column = {};
                column.data_type = col.type;
                column.key = col.key;
                column.index = k;
                column.user_type = col.userType;
                column.accesscontrol = col.accessControl;
                column.isPrimary = col.isPrimary;
                columns.push(column);
            }
            table.columns = columns;

            var valsToJSON = function(vals, cols){

                var arr = [], v;
                for(var i = 0, len = vals.length; i < len; i ++){
                    v = vals[i];
                    if(v instanceof Date){
                        arr.push(v.getTime());
                    } else if (v instanceof Decimal){
                        if(cols[i].getScale() > 0){
                            arr.push(v.toFixed(cols[i].getScale()));
                        }else{
                            arr.push(v);  
                        }
                    } else {
                        arr.push(v);
                    }
                }

                return arr;
            }

            var allRows = dataTable.allRows,
                row, all_data_rows = [], all_data_row;
            for (var j = 0, len = allRows.length; j < len; j++) {
                row = allRows[j];
                all_data_row = {};
                all_data_row.data = valsToJSON(row.vals, cols);
                all_data_row.row_bookmark = row.bkmk;
                all_data_row.row_parent_bookmark = row.parentBkmk;
                all_data_row.row_state = row.state;
                if (row.orgVals) {
                    all_data_row.originaldata = valsToJSON(row.orgVals, cols);
                }
                all_data_rows.push(all_data_row);
            }
            table.all_data_rows = all_data_rows;


            return table;
        },

        fromJSONDoc: function (document) {
            if (!document) return;

            var doc = new DataDef.Document();
         
            if (document.oid) {
                doc.oid = document.oid;
            }
            if (document.poid) {
                doc.poid = document.poid;
            }
            doc.verid = document.verid || 0;
            doc.dverid = document.dverid || 0;

            doc.state = document.state || 0;
            doc.version = document.version || 0;
            
            doc.mainTableKey = document.mainTableKey || '';

            if (document.document_type) {
                doc.docType = document.document_type;
            }
            if (document.table_list) {
                var dataTable, doc_tableList = document.table_list, doc_table, tableKey;
                for (var j = 0; j < doc_tableList.length; j++) {
                    doc_table = doc_tableList[j];
                    tableKey = doc_table.key;
                    dataTable = this.fromJSONDataTable(doc_table);
                    doc.add(tableKey, dataTable);
                }
            }
            doc.object_key = document.object_key;
            doc.expData = JSON.parse(JSON.stringify(document.expand_data));
            doc.expDataType = document.expand_data_type;
            doc.expDataClass = document.expand_data_class;
            return doc;
        },

        fromJSONDataTable: function (jsondt) {
            if (!jsondt) return null;

            var dataTable = new DataDef.DataTable();

            dataTable.key = jsondt.key;
            dataTable.parentKey = jsondt.parentKey;
            dataTable.tableMode = jsondt.tableMode;
            dataTable.isPersist = jsondt.isPersist;
            var docTable = jsondt,
                allDataRows = docTable.all_data_rows,
                columns = docTable.columns;
            for (var j = 0; j < columns.length; j++) {
                var column = columns[j];
                dataTable.addCol(column.key, column.data_type, column.user_type, column.accesscontrol, column.defaultValue, column.isPrimary, column.scale);
            }
            var dataRow, len, row, val, col;

            for (var i = 0; i < allDataRows.length; i++) {
                dataRow = allDataRows[i];
                //dataTable.addRow();
                len = dataRow.data.length;
                row = new DataDef.Row();
                //var row = dataTable.rows[dataTable.pos];
                val = null, col;
                for (var k = 0; k < len; k++) {

                    col = columns[k];

                    val = dataRow.data[k];

                    if(val != null){
                        switch(col.data_type){
                            case YIUI.DataType.DATETIME:
                            case YIUI.DataType.DATE:
                                val = new Date(parseInt(val));
                                break;
                            case YIUI.DataType.INT:
                            case YIUI.DataType.LONG:
                                val = parseInt(val);
                                break;
                            case YIUI.DataType.NUMERIC:
                                val = new Decimal(val)
                                break;
                            case YIUI.DataType.BOOLEAN:
                                val = Boolean(val);
                                break;
                        }  
                    }
        
                    row.vals[k] = val;
                }

                row.state = dataRow.row_state || DataDef.R_Normal;
                row.bkmk = dataRow.row_bookmark;

                if (row.bkmk >= dataTable.bkmkSeed) {
                    dataTable.bkmkSeed++;
                }
                row.parentBkmk = dataRow.row_parent_bookmark;

                dataTable.allRows.push(row);
                if( row.state != DataDef.R_Deleted ) {
                    dataTable.rows.push(row);
                    dataTable.bkmks.put(row.bkmk, dataTable.rows.length - 1);
                    dataTable.pos = dataTable.rows.length - 1;
                }
            }
            if (docTable.bookmark_seed) {
                dataTable.bkmkSeed = docTable.bookmark_seed;
            }
            return dataTable;
        },

        fromJSONItem: function (json) {
            var item = new DataDef.Item();
            if (!item) return;
            item.itemKey = json.itemKey;
            item.oid = json.oid;
            item.nodeType = json.nodeType || 0;
            item.enable = json.enable || 0;
            item.caption = json.caption;
            item.mainTableKey = json.mainTableKey;
            item.itemTables = json.itemTables;
            return item;
        },

        newShadowDataTable: function (dataTable) {
            var shadowTable = new DataDef.DataTable();
            shadowTable.key = dataTable.key;
            var columns = dataTable.cols;
            for (var i = 0; i < columns.length; i++) {
                var column = columns[i];
                shadowTable.addCol(column.key, column.type, column.userType, column.accessControl, column.defaultValue, column.isPrimary, column.scale);
            }
            return shadowTable;
        },

        // 创建一个维度值
        makeDimValue: function (table,columnKeys) {
            var dimValue = new YIUI.MultiDimValue();
            for( var i = 0,columnKey;columnKey = columnKeys[i];i++ ) {
                dimValue.addValue(this.makeDimNode(table,columnKey));
            }
            return dimValue;
        },

        // 转换维度数据
        convertDimValue: function (dimValue) {
            var multiKey = new YIUI.MultiKey();
            for( var i = 0,node;node = dimValue.values[i];i++ ) {
                multiKey.addValue(new YIUI.MultiKeyNode(YIUI.UIUtil.dataType2JavaDataType(node.dataType), node.value));
            }
            return multiKey;
        },

        // 创建一个维度节点
        makeDimNode: function (table, columnKey) {
            var dataType = table.getColByKey(columnKey).type,
                value = table.getByKey(columnKey);
            return new YIUI.MultiDimNode({
                columnKey: columnKey,
                dataType: dataType,
                value: value
            });
        },

        // 根据维度值确定数据行
        locate: function (table,dimValue) {

            var node,other;
            table.beforeFirst();
            while( table.next() ) {
                other = new YIUI.MultiDimValue();
                for( var i = 0,size = dimValue.size();i < size;i++ ) {
                    node = dimValue.getValue(i);
                    other.addValue(this.makeDimNode(table,node.columnKey));
                }
                if( dimValue.equals(other) ) {
                    return table.getBkmk();
                }
            }
            return -1;
        },

        getPrimaryKeys: function (table) {
            var primaryKeys = [],column;
            for (var i = 0; column = table.cols[i];i++) {
                if ( column.isPrimary ) {
                    primaryKeys.push(column.getKey());
                }
            }
            return primaryKeys;
        },

        getIndexesAndTypes: function (table, primaryKeys, indexes, types) {
            for (var k = 0, kLen = primaryKeys.length; k < kLen; k++) {
                var tableCol = table.getColByKey(primaryKeys[k]);
                indexes.push(table.indexByKey(primaryKeys[k]));
                types.push(tableCol.getUserType());
            }
        },

        makeMultiKey: function (table, indexes, types) {
            var value = new YIUI.MultiKey();
            for (var i = 0, len = indexes.length; i < len; i++) {
                value.addValue(new YIUI.MultiKeyNode(types[i], table.get(indexes[i])));
            }
            return value;
        },

        deleteAllRow: function (dataTable) {
            for (var len = dataTable.size(), i = len - 1; i >= 0; i--) {
                dataTable.delRow(i);
            }
        },
        
        append: function (srcTable, tgtTable, parentBkmk) {
            var srcIndexArray = [], tgtIndexArray = [],tgtDataTypeArray = [],colInfo,tgtColInfo,tgtIndex;
            for (var i = 0, len = srcTable.cols.length; i < len; i++) {
                colInfo = srcTable.getCol(i);
                tgtColInfo = tgtTable.getColByKey(colInfo.key);
                if ( tgtColInfo ) {
                    srcIndexArray.push(i);
                    tgtIndexArray.push(tgtTable.indexByKey(colInfo.key));
                    tgtDataTypeArray.push(tgtColInfo.type);
                }
            }
            srcTable.beforeFirst();
            while (srcTable.next()) {
                tgtTable.addRow(true);
                for (var j = 0, jLen = srcIndexArray.length; j < jLen; j++) {
                    tgtTable.set(tgtIndexArray[j], YIUI.TypeConvertor.toDataType(tgtDataTypeArray[j],srcTable.get(srcIndexArray[j])));
                }
                if( parentBkmk != undefined && parentBkmk != -1 ) {
                    tgtTable.setParentBkmk(parentBkmk);
                }
            }
            srcTable.beforeFirst();
            tgtTable.beforeFirst();
        }
    };
    return Return;
})();