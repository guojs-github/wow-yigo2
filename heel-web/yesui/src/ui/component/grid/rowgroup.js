(function () {
    YIUI.GridRowGroup = YIUI.extend({
        form: null,
        grid: null,
        init: function (form, grid) {
            this.form = form;
            this.grid = grid;
        },
        group: function () {
            this.grid.dataModel.rowMap = {};

            var metaGrid = this.grid.getMetaObj(),
                tableKeys = metaGrid.tableKeys;
            for( var i = 0,size = tableKeys.length;i < size;i++ ) {
                this.buildRowMap(tableKeys[i]);
            }

            var detailRow = this.grid.getDetailMetaRow();
            if( detailRow == null || !this.grid.tableKey ) {
                return;
            }

            var rootBkmk;
            if( this.grid.multiple ) {
                rootBkmk = this.buildMultipleGridRowData();
            } else {
                rootBkmk = this.buildNormalGridRowData(this.sortData());
            }

            this.grid.dataModel.rootBkmk = rootBkmk;
        },
        buildMultipleGridRowData: function () {
            var doc = this.form.getDocument(),
                table = doc.getByKey(this.grid.tableKey),
                rootBkmk = new YIUI.MultiRowBkmk();
            if( !table ) {
                return rootBkmk;
            }

            var primaryKeys = YIUI.DataUtil.getPrimaryKeys(table);
            var dimValue;
            table.beforeFirst();
            while( table.next() ) {
                dimValue = YIUI.DataUtil.makeDimValue(table,primaryKeys);

                var rowBkmk = new YIUI.DetailRowBkmk(table.getBkmk());
                rootBkmk.put(dimValue,rowBkmk);
            }
            return rootBkmk;
        },
        buildRowMap: function (tableKey) {
            var doc = this.form.getDocument(),
                table = doc.getByKey(tableKey),
                column;

            var primaryKeys = YIUI.DataUtil.getPrimaryKeys(table);

            var indexes = [],
                types = [];

            YIUI.DataUtil.getIndexesAndTypes(table,primaryKeys,indexes,types);

            var rowMap = this.grid.dataModel.rowMap[tableKey];
            if( !rowMap ) {
                rowMap = new YIUI.RowMap();
                this.grid.dataModel.rowMap[tableKey] = rowMap;
            }

            var rowBkmk,
                multiKey;

            table.beforeFirst();
            while( table.next() ) {
                multiKey = YIUI.DataUtil.makeMultiKey(table, indexes, types);
                rowBkmk = new YIUI.DetailRowBkmk(table.getBkmk());
                rowMap.put(multiKey,rowBkmk);
            }
        },
        buildNormalGridRowData: function (data) {

            var getGroupInArea = function (area, index) {
                var i = 0, groupList = [];
                var getAllGroup = function (objectArray, groupList) {
                    if (objectArray == null) return;
                    for (var i = 0, len = objectArray.length; i < len; i++) {
                        var obj = objectArray[i];
                        if (obj.objectType == YIUI.MetaGridRowObjectType.GROUP) {
                            groupList.push(obj);
                        }
                        getAllGroup(obj.objectArray, groupList);
                    }
                };
                getAllGroup(area.objectArray, groupList);
                for (var l = 0, lLen = groupList.length; l < lLen; l++) {
                    var obj = groupList[l];
                    obj.leaf = (l == groupList.length - 1);
                }
                return groupList[index];
            };

            var root = new YIUI.GroupRowBkmk(),
                rowLayer = this.grid.getMetaObj().rowLayer,
                areaIndex = rowLayer.areaIndex,
                rowArea = rowLayer.objectArray[areaIndex];

            root.setMetaGroup(rowArea);

            var table = this.form.getDocument().getByKey(this.grid.tableKey);
            var needGroupColumnKeys = this.getGroupCellColumnKeys();
            var primaryKeys = YIUI.DataUtil.getPrimaryKeys(table),
                primaryIndexes = [],
                primaryTypes = [];

            // 业务主键与行映射集合
            var rowMap = null;
            if( primaryKeys.length > 0 ) {
                rowMap = new YIUI.RowMap();
                this.grid.dataModel.rowMap[this.grid.tableKey] = rowMap;
            }

            YIUI.DataUtil.getIndexesAndTypes(table,primaryKeys,primaryIndexes,primaryTypes);

            var tempColumnExpandIndexes = [], tempExpandDataType = [], columnExpandIndexes = [], expandDataType = [];
            var expandCount = 0;
            if (this.grid.hasColumnExpand()) {
                var expandModel = this.grid.dataModel.expandModel;
                for (var j = 0, jLen = expandModel.length; j < jLen; j++) {
                    var expandColumnKeys = expandModel[j];
                    tempColumnExpandIndexes = [];
                    tempExpandDataType = [];
                    YIUI.DataUtil.getIndexesAndTypes(table, expandColumnKeys, tempColumnExpandIndexes, tempExpandDataType);
                    columnExpandIndexes.push(tempColumnExpandIndexes);
                    expandDataType.push(tempExpandDataType);
                }
                expandCount = expandModel.length;
            }
            var expandRowMap = new YIUI.RowMap(), viewGroupGridDataRow = new Array(needGroupColumnKeys.length),
                tempGroupDataMaps = new Array(needGroupColumnKeys.length);
            for (var m = 0, mLen = needGroupColumnKeys.length; m < mLen; m++) {
                tempGroupDataMaps[m] = new YIUI.RowMap();
            }
            var groupIndexes = [], groupDataTypes = [];
            YIUI.DataUtil.getIndexesAndTypes(table, needGroupColumnKeys, groupIndexes, groupDataTypes);
            var groupRow = null, rootGroup = rowArea.objectArray[0];
            if (needGroupColumnKeys == null || needGroupColumnKeys.length == 0) {
                groupRow = new YIUI.GroupRowBkmk();
                groupRow.setMetaGroup(rootGroup);
                groupRow.setLeaf(true);
                root.addRow(groupRow);
            }

            for (var h = 0, hLen = data.length; h < hLen; h++) {
                var index = data[h];
                table.setByBkmk(index);
                var detailGridRow = new YIUI.DetailRowBkmk();
                detailGridRow.setBookmark(table.getBkmk());
                if (needGroupColumnKeys != null && needGroupColumnKeys.length > 0) {
                    var groupKeyValue = new YIUI.MultiKey();
                    for (var f = 0, fLen = needGroupColumnKeys.length; f < fLen; f++) {
                        groupKeyValue = groupKeyValue.shallowClone();
                        groupKeyValue.addValue(new YIUI.MultiKeyNode(groupDataTypes[f], table.get(groupIndexes[f])));
                        var map = tempGroupDataMaps[f];
                        groupRow = map.get(groupKeyValue);
                        if (groupRow == null) {
                            groupRow = new YIUI.GroupRowBkmk(YIUI.DataUtil.makeMultiKey(table, groupIndexes, groupDataTypes));
                            if (f == needGroupColumnKeys.length - 1) {
                                groupRow.setLeaf(true);
                            }
                            groupRow.setMetaGroup(getGroupInArea(rowArea, f));
                            map.put(groupKeyValue, groupRow);
                            if (f == 0) {
                                root.addRow(groupRow);
                            }
                            if (f != 0) {
                                viewGroupGridDataRow[f - 1].addRow(groupRow);
                            }
                            if (this.grid.hasColumnExpand() && f == needGroupColumnKeys.length - 1) {
                                expandRowMap = new YIUI.RowMap();
                            }
                        }
                        viewGroupGridDataRow[f] = groupRow;
                    }
                }
                if (this.grid.hasColumnExpand()) {
                    var multiKey = YIUI.DataUtil.makeMultiKey(table, primaryIndexes, primaryTypes);
                    var expandRow = expandRowMap.get(multiKey);
                    if (expandRow == null) {
                        expandRow = new YIUI.ExpandRowBkmk(expandCount);
                        expandRowMap.put(multiKey, expandRow);
                        rowMap.put(multiKey, expandRow);
                        groupRow.addRow(expandRow);
                    }
                    for (var g = 0; g < expandCount; g++) {
                        tempColumnExpandIndexes = columnExpandIndexes[g];
                        tempExpandDataType = expandDataType[g];
                        var key = YIUI.DataUtil.makeMultiKey(table, tempColumnExpandIndexes, tempExpandDataType);
                        expandRow.add(g, key, detailGridRow);
                    }
                } else {
                    groupRow.addRow(detailGridRow);
                    if( rowMap ) {
                        var multiKey = YIUI.DataUtil.makeMultiKey(table, primaryIndexes, primaryTypes);
                        rowMap.put(multiKey,detailGridRow);
                    }
                }
            }
            return root;
        },
        sortData: function () {
            var keys = this.getGroupCellColumnKeys();
            var table = this.form.getDocument().getByKey(this.grid.tableKey);

            var data = [];
            table.beforeFirst();
            while (table.next()) {
                data.push({
                    bkmk: table.getBkmk()
                });
            }

            if (keys != null && keys.length > 0) {
                var tableSort = new YIUI.DataTableGroupSort(table, keys, data);
                tableSort.sort();
            }

            for( var i = 0,size = data.length;i < size;i++ ) {
                data[i] = data[i].bkmk;
            }

            return data;
        },
        getGroupCellColumnKeys: function () {
            var columnKeys = [],
                indexes = this.grid.groupIndexes,
                dtlMetaRow = this.grid.getDetailMetaRow();
            for (var i = 0,size = indexes.length;i < size;i++ ) {
                columnKeys.push(dtlMetaRow.cells[indexes[i]].columnKey);
            }
            return columnKeys;
        }
    });
    YIUI.RowMap = YIUI.extend({
        map: null,
        init: function () {
            this.map = [];
        },
        put: function (key, rowBkmk) {
            var isMatch = false;
            for (var i = 0, len = this.map.length; i < len; i++) {
                if (this.map[i].key.equals(key)) {
                    this.map[i].row = rowBkmk;
                    isMatch = true;
                    break;
                }
            }
            if (!isMatch) {
                this.map.push({key: key, row: rowBkmk});
            }
        },
        get: function (key) {
            for (var i = 0, len = this.map.length; i < len; i++) {
                if (this.map[i].key.equals(key)) {
                    return this.map[i].row;
                }
            }
            return null;
        },
        getAt: function (index) {
            return this.map[index];
        },
        size: function () {
            return this.map.length;
        }
    });
    YIUI.DataTableGroupSort = YIUI.extend({
        table: null,
        groupKeys: null,
        tempArray: null,
        init: function (table, groupKeys, tempArray) {
            this.table = table;
            this.groupKeys = groupKeys;
            this.tempArray = tempArray;
        },
        sort: function () {
            var self = this;

            // 排序这么写是为了兼容chrome的一个BUG(集合无顺序变化结果可能是乱的)
            for( var i = 0,size = this.tempArray.length;i < size;i++ ) {
                this.tempArray[i].idx = i;
            }

            var sortTable = function (o1, o2) {
                var result = 0, key, value1, value2;
                for (var i = 0, len = self.groupKeys.length; i < len; i++) {
                    key = self.groupKeys[i];
                    self.table.setByBkmk(o1.bkmk);
                    value1 = self.table.getByKey(key);
                    self.table.setByBkmk(o2.bkmk);
                    value2 = self.table.getByKey(key);
                    var colInfo = self.table.getColByKey(key);
                    switch (colInfo.type) {
                        case YIUI.DataType.INT:
                        case YIUI.DataType.DOUBLE:
                        case YIUI.DataType.NUMERIC:
                        case YIUI.DataType.LONG:
                        case YIUI.DataType.FLOAT:
                            var n1 = YIUI.TypeConvertor.toDecimal(value1), n2 = YIUI.TypeConvertor.toDecimal(value2);
                            result = n1.comparedTo(n2);
                            break;
                        case YIUI.DataType.STRING:
                        case YIUI.DataType.TEXT:
                        case YIUI.DataType.FIXED_STRING:
                            result = value1.localeCompare(value2);
                            break;
                        case YIUI.DataType.DATE:
                        case YIUI.DataType.DATETIME:
                            var d1 = YIUI.TypeConvertor.toDate(value1), d2 = YIUI.TypeConvertor.toDate(value2);
                            result = d1.getTime() - d2.getTime();
                            break;
                        case YIUI.DataType.BOOLEAN:
                            var b1 = YIUI.TypeConvertor.toBoolean(value1), b2 = YIUI.TypeConvertor.toBoolean(value2);
                            if (b1 == true && b2 == false) {
                                result = 1;
                            } else if (b1 == false && b2 == true) {
                                result = -1;
                            }
                            break;
                    }
                    if (result != 0) {
                        break;
                    }
                }
                return result || o1.idx - o2.idx;
            };

            this.tempArray.sort(sortTable);
        }
    });
})();