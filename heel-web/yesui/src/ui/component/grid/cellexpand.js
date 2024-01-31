(function () {
    YIUI.GridCellExpand = YIUI.extend({
        form: null,
        grid: null,
        groups: null,

        init: function (form, grid) {
            this.form = form;
            this.grid = grid;
            this.groups = [];
        },

        expand: function () {
            var metaGrid = this.grid.getOrgMetaObj(),
                targetMetaGrid = $.extend(true, {}, metaGrid);

            //初始化分组区域
            this.initGroup(targetMetaGrid);

            // 拓展分组
            this.expandGroup();

            // 标题处理
            this.mergeGroupTitle();

            // 替换列和单元格
            this.replaceGroup(targetMetaGrid);

            // 刷新列的标题
            this.refreshColumnCaption(targetMetaGrid);

            // 设置表格的配置对象
            this.grid.setMetaObj(targetMetaGrid);
        },
        initGroup:function (metaGrid) {
            var rows = metaGrid.rows,
                columns = metaGrid.columns,
                rowCount = rows.length,
                colCount = columns.length;

            var metaCell,
                columnExpand,
                tempGroups = [],
                group,
                area = 0,
                expandModel = this.grid.dataModel.expandModel,
                i,
                k,
                info;

            for( i = 0;i < colCount;i++ ) {
                info = null;
                for( k = 0;k < rowCount;k++ ) {
                    metaCell = rows[k].cells[i];
                    columnExpand = metaCell.columnExpand;
                    if( columnExpand ) {
                        group = new YIUI.CellExpandCellGroup();
                        group.metaCell = metaCell;
                        group.rowIndex = k;
                        group.left = i;
                        group.right = i;
                        tempGroups.push(group);

                        if( columnExpand.expandType == YIUI.ColumnExpandType.DATA ) {
                            info = info || [];
                            info.push(columnExpand.columnKey);
                        }
                    }
                }

                if( tempGroups.length > 0 ) {
                    this.groups.add(this.fillCellGroups(tempGroups,metaGrid,area++));
                    tempGroups.length = 0;
                    expandModel.push(info);
                }
            }
        },
        fillCellGroups: function (groups,metaGrid,area) {
            var rows = metaGrid.rows,
                columns = metaGrid.columns,
                group,
                parent,
                metaCell;
            for( var i = 0,size = groups.length;group = groups[i];i++ ) {
                if( i == size - 1 ) {
                    group.leaf = true;
                } else {
                    group.leaf = false;
                }

                metaCell = group.metaCell;
                if( metaCell.isMerged && metaCell.isMergedHead ) {
                    var colspan = metaCell.colspan;
                    if( colspan > 1 ) {
                        group.right = group.left + colspan - 1;
                    }
                }

                if( parent ) {
                    if( group.left != parent.left ) {
                        group.left = parent.left;
                    }
                    if( group.right != parent.right ) {
                        group.right = parent.right;
                    }
                }

                group.area = area;

                if( group.leaf ) {
                    var left = group.left,
                        right = group.right,
                        size = rows.length;
                    for( var k = left;k <= right;k++ ) {
                        var cells = new YIUI.CellExpandCellList();
                        cells.column = columns[k];
                        for( var m = 0;m < size;m++ ) {
                            cells.add(rows[m].cells[k]);
                        }
                        group.add(cells);
                    }
                }

                if( parent != null ) {
                    parent.add(group);
                }

                parent = group;
            }
            return groups[0];
        },
        expandGroup: function () {
            for( var i = 0,group;group = this.groups[i];i++ ) {
                group.calcCount();
                this.expandOneGroup(group);
            }
        },
        expandOneGroup: function (group) {
            var metaCell = group.metaCell,
                columnExpand = metaCell.columnExpand;
            if( columnExpand.expandType == YIUI.ColumnExpandType.DATA ) {
                this.impl_expandGroup(metaCell,group);
            }

            var obj,
                size = group.size();
            for( var i = 0;i < size;i++ ) {
                obj = group.get(i);
                if( obj.objectType == YIUI.CellExpandObjectType.Group ) {
                    this.form.setPara("PEV",obj.expValue);
                    this.expandOneGroup(obj);
                }
            }
        },
        impl_expandGroup: function (metaCell,group) {
            var columnExpand = metaCell.columnExpand,
                columnKey = columnExpand.columnKey,
                cellKey = metaCell.key;

            var items = this.extractExpandSources(metaCell);

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
                         if( key && key == cellKey ) {
                             cell.caption = item.caption;
                         }

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
        refreshColumnCaption: function (metaGrid) {
            var columns = metaGrid.columns,
                column,
                caption;
            for( var i = 0,size = columns.length;i < size;i++ ) {
                caption = YIUI.ColumnIDUtil.toColumnID(i);
                columns[i].caption = caption;
            }
        },
        mergeGroupTitle: function () {
            for( var i = 0,group;group = this.groups[i];i++ ) {
                this.impl_mergeGroupTitle(group);
            }
        },
        impl_mergeGroupTitle: function (group) {
            if( group.leaf ) {
                return;
            }

            var obj,metaCell;
            for( var i = 0,size = group.size();i < size;i++ ) {
                obj = group.get(i);
                if( obj.objectType == YIUI.CellExpandObjectType.Group ) {
                    var cells = [];
                    obj.getLeafCells(cells,group.rowIndex);

                    for( var k = 0,length = cells.length;k < length;k++ ) {
                        metaCell = cells[k];
                        if( k == 0 ) {
                            metaCell.isMerged = true;
                            metaCell.isMergedHead = true;
                            metaCell.colspan = length;
                        } else {
                            metaCell.isMerged = true;
                            metaCell.isMergedHead = false;
                        }
                    }
                }
            }

            for( var m = 0,count = group.size();m < count;m++ ) {
                obj = group.get(m);
                if( obj.objectType == YIUI.CellExpandObjectType.Group ) {
                    this.impl_mergeGroupTitle(obj);
                }
            }
        },
        replaceGroup: function (metaGrid) {
            var rows = metaGrid.rows,
                columns = metaGrid.columns,
                group,
                left,
                count,
                metaRow,
                size = this.groups.length;

            for( var i = 0;i < size;i++ ) {
                group = this.groups[i];
                left = group.left;
                count = group.count;

                var leafColumns = [];
                group.getLeafColumns(leafColumns);

                columns.splice(left,count);
                for( var k = 0;k < leafColumns.length;k++ ) {
                    columns.splice(left + k, 0, leafColumns[k]);
                }

                var cells = [];
                for (var j = 0, len = rows.length; j < len; j++) {
                    group.getLeafCells(cells,j);
                    metaRow = rows[j];
                    metaRow.cells.splice(left, count);
                    metaRow.cellKeys.splice(left, count);
                    for (var m = 0, mLen = cells.length; m < mLen; m++) {
                        metaRow.cells.splice(left + m, 0, cells[m]);
                        metaRow.cellKeys.splice(left + m, 0, cells[m].key);
                    }
                    cells.length = 0;
                }
            }
        },

        extractExpandSources: function (metaCell) {
            var columnExpand = metaCell.columnExpand;
            var colKey = metaCell.key;
            var tableKey = this.grid.tableKey;
            if( !tableKey ) {
                tableKey = columnExpand.tableKey;
            }
            var dataTable = this.form.getDocument().getByKey(tableKey),
                columnKey = columnExpand.columnKey;
            var column = dataTable.getColByKey(columnKey),
                dataType = column.type, items = [], value, caption;

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

                var result = this.form.eval(source, cxt);

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
        }
    });
    YIUI.CellExpandCellList = YIUI.extend({
        column: null,
        cellArray: null,
        init: function () {
            this.cellArray = [];
            this.objectType = YIUI.CellExpandObjectType.Cells;
        },
        add: function (cell) {
            this.cellArray.push(cell);
        },
        size: function () {
            return this.cellArray.length;
        },
        clone: function () {
            var newObj = new YIUI.CellExpandCellList(),cell,clone;
            for (var i = 0, len = this.cellArray.length; i < len; i++) {
                cell = this.cellArray[i];
                clone = $.extend(true,{},cell);
                if (cell.crossValue != null) {
                    clone.crossValue = cell.crossValue.clone();
                }
                newObj.add(clone);
            }
            newObj.column = $.extend(true,{},this.column);
            return newObj;
        },
        traversal: function (context,process) {
            for ( var i = 0,obj;obj = this.cellArray[i]; i++ ) {
                process.call(this,context,obj);
            }
        },
        getLeafColumns: function (columns) {
            columns.push(this.column);
        },
        getLeafCells: function (cells,rowIndex) {
            cells.push(this.cellArray[rowIndex]);
        },
    });
    YIUI.CellExpandObjectType = {
        Cells: 0,
        Group: 1
    },
    YIUI.CellExpandCellGroup = YIUI.extend({
        objectArray: null,
        metaCell: null,
        rowIndex: -1,
        left: -1,
        right: -1,
        leaf: false,
        count: 0,
        area: -1,

        init: function () {
            this.objectArray = [];
            this.objectType = YIUI.CellExpandObjectType.Group;
        },
        add: function (obj) {
            this.objectArray.push(obj);
        },
        get: function (i) {
            return this.objectArray[i];
        },
        size: function () {
            return this.objectArray.length;
        },
        clear: function () {
            this.objectArray = [];
        },
        addAll: function (list) {
            for (var i = 0, len = list.length; i < len; i++) {
                this.objectArray.push(list[i]);
            }
        },
        clone: function () {
            var newObj = new YIUI.CellExpandCellGroup();
            newObj.metaCell = this.metaCell;
            newObj.rowIndex = this.rowIndex;
            newObj.leaf = this.leaf;
            newObj.area = this.area;
            for (var i = 0, len = this.objectArray.length; i < len; i++) {
                newObj.add(this.objectArray[i].clone());
            }
            return newObj;
        },
        calcCount: function () {
            this.count = 0;
            for ( var i = 0,obj;obj = this.objectArray[i]; i++ ) {
                obj = this.objectArray[i];
                if (obj.objectType == YIUI.CellExpandCellGroup.Group) {
                    obj.calcCount();
                    this.count += obj.count;
                } else {
                    this.count += 1;
                }
            }
        },
        traversal: function (context,process) {
            for ( var i = 0,obj;obj = this.objectArray[i]; i++ ) {
                obj.traversal(context,process);
            }
        },
        getLeafColumns: function (columns) {
            for (var i = 0,obj;obj = this.objectArray[i]; i++) {
                obj.getLeafColumns(columns);
            }
        },
        getLeafCells: function (cells,rowIndex) {
            for (var i = 0,obj;obj = this.objectArray[i]; i++) {
                obj.getLeafCells(cells,rowIndex);
            }
        }
    });
})();