/**
 * Created by 陈瑞 on 2017/3/14 use WebStorm.
 */
YIUI.GridLookupUtil = (function () {

    var CellLocation = function (options) {
        this.key = options.key;
        this.column = options.column;
        this.columns = options.columns;
        this.row = options.row;
        this.rows = options.rows;
        this.tableKey = options.tableKey;
        this.columnKey = options.columnKey;
        this.expand = options.expand;
    }

    Lang.impl(CellLocation, {
        getKey: function () {
            return this.key;
        },
        getRow: function () {
            return this.row;
        },
        getRows: function () {
            return this.rows;
        },
        getColumn: function () {
            return this.column;
        },
        getColumns: function () {
            return this.columns;
        },
        isExpand: function () {
            return this.expand;
        }
    });

    var Return = {

        /**
         * 建立单元格查找
         */
        buildCellLookup:function (form,com) {
            switch (com.type) {
            case YIUI.CONTROLTYPE.GRID:
                var metaRows = com.getMetaObj().rows,metaRow,key,keys = [];
                for( var i = 0; metaRow = metaRows[i]; i++ ) {
                    var rowIndex = metaRow.rowType === 'Fix' ? i : -1;
                    for (var k = 0,metaCell; metaCell = metaRow.cells[k]; k++) {
                        key = metaCell.key;
                        if( key ) {
                            var tableKey = metaRow.rowType === 'Fix' ? metaCell.tableKey : com.tableKey,
                                columnKey = metaCell.columnKey;
                            var loc = form.formAdapt.getCellLocation(key);
                            if( !loc ) {
                                loc = new CellLocation({
                                    key: com.key,
                                    column: -1,
                                    columns: [],
                                    row: rowIndex,
                                    rows: [],
                                    tableKey: tableKey,
                                    columnKey: columnKey,
                                    expand: false
                                });
                                form.formAdapt.addCellLocation(key,loc);
                            }
                            if( keys.indexOf(key) == -1  ) {
                                loc.columns.length = 0;
                                loc.column = -1;
                                keys.push(key);
                            }
                            if( metaCell.isColExpand ) {
                                loc.columns.push(k);
                            } else {
                                loc.column = k;
                            }
                            loc.expand = metaCell.isColExpand;
                        }
                    }
                }
                break;
            case YIUI.CONTROLTYPE.LISTVIEW:
            case YIUI.CONTROLTYPE.LISTLAYOUTVIEW:
                for (var i = 0,column;column = com.columnInfo[i];i++) {
                    column.tableKey = com.tableKey;
                    loc = new CellLocation({
                        key: com.key,
                        column: i,
                        row: -1,
                        tableKey: com.tableKey,
                        columnKey: column.columnKey
                    });
                    form.formAdapt.addCellLocation(column.key, loc);
                }
                break;
            }
        },

        /**
         * 更新固定行位置
         */
        updateFixPos:function (form,grid) {
            if( !grid.hasFixRow ) {
                return;
            }
            var rowData,metaRow,cellKey,temp,keys = [],metaObj = grid.getMetaObj();
            for( var i = 0,size = grid.getRowCount();i < size;i++ ) {
                rowData = grid.getRowDataAt(i);
                metaRow = metaObj.rows[rowData.metaRowIndex];
                if( rowData.rowType != "Fix" ) {
                    continue;
                }
                for( var j = 0,length = rowData.cellKeys.length;j < length;j++ ) {
                    cellKey = rowData.cellKeys[j];
                    if( cellKey ) {
                        var loc = form.getCellLocation(cellKey);
                        if( keys.indexOf(cellKey) == -1 ) {
                            loc.row = -1;
                            loc.rows.length = 0;
                            keys.push(cellKey);
                        }
                        if( temp != loc ) {
                            if( metaRow.isAreaExpand ) {
                                loc.rows.push(i);
                            } else {
                                loc.row = i;
                            }
                            loc.areaExpand = metaRow.isAreaExpand;
                        }
                        temp = loc;
                    }
                }
            }
        }
    };
    return Return;
})();

