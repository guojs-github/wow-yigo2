(function () {
    YIUI.GridColumnExpand = YIUI.extend({
        form: null,
        grid: null,
        groups: null,

        init: function (form, grid) {
            this.form = form;
            this.grid = grid;
            this.groups = [];
        },

        extractExpandSources: function (metaColumn) {
            var columnExpand = metaColumn.columnExpand;
            var colKey = metaColumn.key;
            var tableKey = this.grid.tableKey;
            if( !tableKey ) {
                tableKey = columnExpand.tableKey;
            }
            var dataTable = this.form.getDocument().getByKey(tableKey),
                columnKey = columnExpand.columnKey;
            var column = dataTable.getColByKey(columnKey),
                dataType = column.type, items = [], caption;

            var cxt = new View.Context(this.form);

            if (columnExpand.expandSourceType == YIUI.ExpandSourceType.DATA) {
                var set = [];
                dataTable.beforeFirst();
                while (dataTable.next()) {
                    value = dataTable.getByKey(columnKey);
                    if( set.indexOf(value) == -1 ) {
                        set.push(value);
                    }
                }

                var itemKey = columnExpand.itemKey,service;
                for ( var i = 0;value = set[i];i++ ) {
                    if (value == null || (dataType == YIUI.DataType.INT && YIUI.TypeConvertor.toInt(value) == 0)) {
                        continue;
                    }

                    caption = value.toString();
                    if( itemKey ) {
                        service = service || new YIUI.DictService(this.form);
                        caption = service.getCaption(itemKey,YIUI.TypeConvertor.toLong(value),true);
                    }

                    items.push(new YIUI.ExpandItem(value,caption,dataType));
                }
            } else {
                var source = columnExpand.content;
                if( !source ) {
                    throw new Error("expand content undefind");
                }

                var result = this.form.eval(source, cxt),
                    value;

                if (result instanceof DataDef.DataTable) {
                    result.beforeFirst();
                    while (result.next()) {
                        value = YIUI.TypeConvertor.toDataType(dataType, result.get(0));
                        caption = YIUI.TypeConvertor.toString(result.get(1));
                        items.push(new YIUI.ExpandItem(value,caption,dataType));
                    }
                } else if (typeof result == "string") {
                    var ret = YIUI.TypeConvertor.toString(result);
                    if (ret.length > 0) {
                        var v = ret.split(";"),item,idx,value,caption;
                        for (var j = 0;item = v[j];j++) {
                            idx = item.indexOf(",");
                            value = item.substring(0,idx);
                            caption = item.substring(idx + 1);
                            items.push(new YIUI.ExpandItem(YIUI.TypeConvertor.toDataType(dataType, value), caption, dataType));
                        }
                    }
                }
            }
            return items;
        },
        initGroups: function (metaGrid) {
            var columns = metaGrid.columns,
                orgMeta = this.grid.getOrgMetaObj(),
                expandModel = this.grid.dataModel.expandModel,
                metaColumn,
                area = 0,
                info;
            for (var i = 0, len = columns.length; i < len; i++) {
                metaColumn = columns[i],info = [];
                var columnExpand = metaColumn.columnExpand;
                if ( columnExpand ) {
                    var root = new YIUI.ColumnExpandGroup();
                    root.setColumn(metaColumn);
                    root.setArea(area);

                    if (columnExpand.expandType == YIUI.ColumnExpandType.DATA) {
                        info.push(columnExpand.columnKey);
                    }

                    this.fillColumnGroups(root,info,metaColumn,area);

                    root.calcCount();
                    root.left = orgMeta.leafIndexMap[root.getFirst().key];
                    root.right = root.left + root.count;

                    this.groups.push(root);

                    expandModel.push(info);

                    area++;
                }
            }
        },
        fillColumnGroups: function (parent, info, column, area) {
            var columns = column.columns,
                metaGrid = this.grid.getOrgMetaObj(),
                rows = metaGrid.rows;
            var child, metaRow, columnExpand;
            if ( columns ) {
                for (var i = 0, len = columns.length; i < len; i++) {
                    child = columns[i],
                    columnExpand = child.columnExpand;
                    if ( columnExpand ) {
                        var group = new YIUI.ColumnExpandGroup();
                        group.setColumn(child);
                        group.area = area;
                        parent.add(group);

                        if (columnExpand.expandType == YIUI.ColumnExpandType.DATA) {
                            info.push(columnExpand.columnKey);
                        }

                        this.fillColumnGroups(group,info,child,area);
                    } else {
                        var cells = new YIUI.ColumnExpandCells();
                        cells.setColumn(child);
                        var idx = metaGrid.leafIndexMap[child.key];
                        for (var j = 0, count = rows.length; j < count; j++) {
                            metaRow = rows[j];
                            cells.addCell(metaRow.cells[idx]);
                        }
                        parent.add(cells);
                    }
                }
            } else {
                var cells = new YIUI.ColumnExpandCells();
                cells.setColumn(column);
                var idx = metaGrid.leafIndexMap[column.key];
                for (var j = 0, count = rows.length; j < count; j++) {
                    metaRow = rows[j];
                    cells.addCell(metaRow.cells[idx]);
                }
                parent.add(cells);
            }
        },
        expandColumns: function (metaGrid) {
            this.expandColumn(metaGrid.columns);
        },
        expandColumn: function (collection) {
            if (collection == null) {
                return;
            }
            var columns = [],metaColumn;
            for (var i = 0;metaColumn = collection[i]; i++) {
                if ( metaColumn.columnExpand != null ) {
                    var expand = metaColumn.columnExpand;
                    if (expand.expandType == YIUI.ColumnExpandType.DATA) {

                        var items = this.extractExpandSources(metaColumn);
                        if (items == null || items.length == 0) {
                            metaColumn.invalidExpand = true;
                            return;
                        }
                        for (var j = 0,item;item = items[j];j++) {
                            var cloneColumn = $.extend(true, {}, metaColumn);
                            var secondKey = YIUI.TypeConvertor.toString(item.value);
                            cloneColumn.key = cloneColumn.key + secondKey;
                            cloneColumn.caption = item.caption;
                            cloneColumn.expValue = item.value;
                            columns.push(cloneColumn);
                        }
                    } else {
                        columns.push(metaColumn);
                    }
                } else {
                    columns.push(metaColumn);
                }
            }

            collection.length = 0;
            for(var i = 0,_column; _column = columns[i]; i ++){
                collection.push(_column);
            }

            for (var k = 0,child;child = collection[k]; k++) {
                if (child.columnExpand != null) {
                    this.form.setPara("PEV",child.expValue);
                    this.expandColumn(child.columns);
                }
            }
        },
        expandGroups: function () {
            for (var i = 0, len = this.groups.length; i < len; i++) {
                this.expandOneGroup(this.groups[i]);
            }
        },
        expandOneGroup: function (group) {
            var column = group.getColumn(),
                columnExpand = column.columnExpand;
            if( columnExpand.expandType == YIUI.ColumnExpandType.DATA ) {
                this.impl_expandGroup(column,group);
            }

            for (var i = 0,obj;obj = group.columnArray[i]; i++) {
                if (obj.getObjectType() == YIUI.ColumnExpandObjectType.Group) {
                    this.form.setPara("PEV",obj.expValue);
                    this.expandOneGroup(obj);
                }
            }
        },
        impl_expandGroup: function (column,group) {
            var columnExpand = column.columnExpand,
                columnKey = columnExpand.columnKey;

            var items = this.extractExpandSources(column);

            if( !items || items.length == 0 ){
                return;
            }

            var item,
                obj,
                newObj,
                tempList = [];

            for( var i = 0,size = items.length;i < size;i++ ) {
                item = items[i];
                for( var k = 0,length = group.size();k < length;k++ ) {
                    obj = group.get(k);
                    newObj = obj.clone();
                    newObj.expValue = item.value;

                    newObj.traversal(item,function (item,cell) {
                        var key = cell.key;

                        cell.columnArea = group.area;
                        cell.isColExpand = true;
                        var crossValue = cell.crossValue,
                            crossValueMap = cell.crossValueMap;

                        if ( !crossValue ) {
                            crossValue = new YIUI.MultiKey();
                            cell.crossValue = crossValue;
                        }
                        if( !crossValueMap ) {
                            crossValueMap = {};
                            cell.crossValueMap = crossValueMap;
                        }

                        var value = item.value,
                            javaType = YIUI.UIUtil.dataType2JavaDataType(item.dataType);

                        var node = new YIUI.MultiKeyNode(javaType, value);
                        crossValue.addValue(node);
                        crossValueMap[columnKey] = node;
                    });
                    tempList.push(newObj);
                }
            }

            group.clear();
            group.addAll(tempList);
        },
        replaceGroups: function (targetMetaGrid) {
            for (var i = this.groups.length - 1; i >= 0; i--) {
                var group = this.groups[i];
                var left = group.left, count = group.count;
                for (var j = 0, len = targetMetaGrid.rows.length; j < len; j++) {
                    var metaRow = targetMetaGrid.rows[j];
                    metaRow.cells.splice(left, count);
                    metaRow.cellKeys.splice(left, count);
                    var leafCells = group.getLeafCells(j);
                    for (var m = 0, mLen = leafCells.length; m < mLen; m++) {
                        metaRow.cells.splice(left + m, 0, leafCells[m]);
                        metaRow.cellKeys.splice(left + m, 0, leafCells[m].key);
                    }
                }
            }
        },
        expand: function () {
            // 每次拓展需要使用原始的配置对象
            var metaGrid = this.grid.getOrgMetaObj(),
                targetMetaGrid = $.extend(true, {}, metaGrid);

            //初始化分组区域
            this.initGroups(targetMetaGrid);

            //扩展组
            this.expandGroups();

            //替换列
            this.expandColumns(targetMetaGrid);

            // 分区域替换单元格,从后往前替换
            this.replaceGroups(targetMetaGrid);

            // 设置表格的配置对象
            this.grid.setMetaObj(targetMetaGrid);
        }
    });
    YIUI.ColumnExpandObjectType = {
        Column: 0,
        Group: 1
    };
    YIUI.ColumnExpandCells = YIUI.extend({
        column: null,
        cellArray: null,
        init: function () {
            this.cellArray = [];
        },
        addCell: function (cellOpt) {
            this.cellArray.push(cellOpt);
        },
        setColumn: function (column) {
            this.column = column;
        },
        getColumn: function () {
            return this.column;
        },
        getObjectType: function () {
            return YIUI.ColumnExpandObjectType.Column;
        },
        clone: function () {
            var newObj = new YIUI.ColumnExpandCells(this.column);
            for (var i = 0, len = this.cellArray.length; i < len; i++) {
                var cell = this.cellArray[i];
                var cloneCell = $.extend(true, {extendInfo: {}}, cell);
                if (cell.crossValue != null) {
                    cloneCell.crossValue = cell.crossValue.clone();
                }
                newObj.addCell(cloneCell);
            }
            return newObj;
        },
        getCell: function (index) {
            return this.cellArray[index];
        },
        traversal: function (context,process) {
            for ( var i = 0,obj;obj = this.cellArray[i]; i++ ) {
                process.call(this,context,obj);
            }
        },
        getColumnCount: function () {
            return 1;
        }
    });
    YIUI.ColumnExpandGroup = YIUI.extend({
        columnArray: null,
        expandCell: null,
        rowIndex: -1,
        column: null,
        left: -1,
        count: -1,
        firstColumn: null,
        area: -1,
        init: function () {
            this.columnArray = [];
            this.count = 0;
        },
        setColumn: function (column) {
            this.column = column;
        },
        getColumn: function () {
            return this.column;
        },
        setArea: function (area) {
            this.area = area;
        },
        getLeafColumnList: function (list) {
            for (var i = 0, len = this.columnArray.length; i < len; i++) {
                var obj = this.columnArray[i];
                if (obj.getObjectType() == YIUI.ColumnExpandObjectType.Column) {
                    list.push(obj);
                } else {
                    obj.getLeafColumnList(list);
                }
            }
        },
        getLeafCells: function (rowIndex) {
            var list = [], leafColumnList = [], column;
            this.getLeafColumnList(leafColumnList);
            for (var i = 0, len = leafColumnList.length; i < len; i++) {
                column = leafColumnList[i];
                list.push(column.getCell(rowIndex));
            }
            return list;
        },
        calcCount: function () {
            this.count = 0;
            var obj;
            for (var i = 0, len = this.columnArray.length; i < len; i++) {
                obj = this.columnArray[i];
                if (obj.getObjectType() == YIUI.ColumnExpandObjectType.Group) {
                    obj.calcCount();
                    this.count += obj.count;
                } else {
                    this.count += 1;
                }
            }
        },
        getFirst: function () {
            var obj = this.columnArray[0];
            if (obj.getObjectType() == YIUI.ColumnExpandObjectType.Group) {
                return obj.getFirst();
            } else {
                return obj.getColumn();
            }
        },
        add: function (obj) {
            this.columnArray.push(obj);
        },
        size: function () {
            return this.columnArray.length;
        },
        clear: function () {
            this.columnArray = [];
        },
        addAll: function (list) {
            for (var i = 0, len = list.length; i < len; i++) {
                this.columnArray.push(list[i]);
            }
        },
        replace: function (index, list) {
            this.columnArray.splice(index, 1);
            for (var i = 0, len = list.length; i < len; i++) {
                this.columnArray.splice(index + i, 0, list[i]);
            }
        },
        get: function (index) {
            return this.columnArray[index];
        },
        getObjectType: function () {
            return YIUI.ColumnExpandObjectType.Group;
        },
        clone: function () {
            var newObj = new YIUI.ColumnExpandGroup();
            newObj.setColumn(this.column);
            for (var i = 0, len = this.columnArray.length; i < len; i++) {
                newObj.add(this.columnArray[i].clone());
            }
            newObj.area = this.area;
            return newObj;
        },
        traversal: function (context,process) {
            for ( var i = 0,obj;obj = this.columnArray[i]; i++ ) {
                obj.traversal(context,process);
            }
        }
    });
})();