YIUI.GridSumUtil = (function () {
    var Return = {
        evalSum: function (form, grid) {
            if( !grid.hasGroupRow && !grid.hasTotalRow )
                return;
            var length = grid.getRowCount(),
                size = grid.getColumnCount(),
                row;
            for (var i = 0; i < length; i++) {
                row = grid.getRowDataAt(i);
                if (row.rowType == "Group" || row.rowType == "Total") {
                    for (var j = 0; j < size; j++) {
                        this.evalSumFieldValue(form, grid, i, j);
                    }
                }
            }
        },
        evalAffectSum: function (form, grid, rowIndex, colIndex) {
            if ( grid.hasGroupRow ) {
                var row = grid.getRowDataAt(rowIndex),
                    curGroupLevel = row.rowGroupLevel,
                    preRd,
                    nextRd,
                    column;
                for (var i = rowIndex - 1; i >= 0; i--) {    //向上遍历，计算相关分组头中的汇总
                    preRd = grid.getRowDataAt(i);
                    if (preRd.rowType == "Group" && preRd.rowGroupLevel <= curGroupLevel) {
                        curGroupLevel = preRd.rowGroupLevel;
                        this.evalSumFieldValue(form, grid, i, colIndex);
                    }
                    if (preRd.rowGroupLevel == 0) {
                        break;
                    }
                }
                curGroupLevel = row.rowGroupLevel;
                for (var j = rowIndex + 1,count = grid.getRowCount(); j < count; j++) {   //向下遍历，计算相关分组尾中的汇总
                    nextRd = grid.getRowDataAt(j);
                    if (nextRd.rowType == "Group" && nextRd.rowGroupLevel <= curGroupLevel) {
                        curGroupLevel = nextRd.rowGroupLevel;
                        this.evalSumFieldValue(form, grid, j, colIndex);
                    }
                    if (nextRd.rowGroupLevel == 0) {
                        break;
                    }
                }
            }

            if( grid.hasTotalRow ) {
                var size = grid.getColumnCount();
                for (var m = 0,count = grid.getRowCount(); m < count; m++) {   //计算total行的汇总
                    row = grid.getRowDataAt(m);
                    if (row.rowType == "Total") {
                        for (var n = 0; n < size; n++) {
                            this.evalSumFieldValue(form, grid, m, n);
                        }
                    }
                }
            }
        },

        /**
         * 根据默认值公式，计算树形表格里所有层级汇总
         */
        evalTreeSum: function (form, grid) {
            if( grid.hasTree ) {
                var length = grid.getRowCount(),
                    metaObj = grid.getMetaObj(),
                    rowData,
                    metaRow;
                for( var i = 0;i < length;i++ ) {
                    rowData = grid.getRowDataAt(i);
                    if( rowData.rowType === 'Detail' && rowData.isLeaf ) {
                        metaRow = metaObj.rows[rowData.metaRowIndex];
                        for( var k = 0,size = metaRow.cells.length;k < size;k++ ) {
                            this.impl_evalTreeSum(form,grid,rowData,metaRow.cells[k],i,k);
                        }
                    }
                }
            }
        },

        /**
         * 计算树形表格的层级汇总
         */
        evalAffectTreeSum: function (form, grid, rowIndex, colIndex) {
            if( grid.hasTree ) {
                var rowData = grid.getRowDataAt(rowIndex),
                    metaRow = grid.getMetaObj().rows[rowData.metaRowIndex],
                    metaCell = metaRow.cells[colIndex];

                return this.impl_evalTreeSum(form, grid, rowData, metaCell, rowIndex, colIndex);
            }
            return [];
        },

        impl_evalTreeSum: function (form, grid, rowData, metaCell, rowIndex, colIndex) {
            var formula = metaCell.defaultFormulaValue,
                indexes = [];
            if( formula && formula.indexOf('Sum(') != -1 ) {
                var curLevel = rowData.treeLevel - 1,row;
                var cxt = new View.Context(form);
                cxt.setInSide(true);
                for( var i = rowIndex - 1;i >= 0; --i ) {
                    row = grid.getRowDataAt(i);
                    if( row.treeLevel == curLevel ) {
                        cxt.updateLocation(grid.key,i,colIndex);
                        var value = form.eval(formula, cxt, null);
                        grid.setValueAt(i, colIndex, value, true, false);
                        indexes.push(i);
                        curLevel--;
                    }
                    if( curLevel < 0 ) {
                        break;
                    }
                }
            }
            return indexes;
        },

        evalSumFieldValue: function (form, grid, rowIndex, colIndex) {
            var rowData = grid.dataModel.data[rowIndex],
                metaRow = grid.getMetaObj().rows[rowData.metaRowIndex],
                metaCell = metaRow.cells[colIndex],
                formula = metaCell.defaultFormulaValue;
            if ( formula ) {
                var cxt = new View.Context(form);
                cxt.setInSide(true);
                cxt.updateLocation(grid.key,rowIndex,colIndex);
                var value = form.eval(formula, cxt, null);
                grid.setValueAt(rowIndex, colIndex, value, false, false);
            }
        }
    };
    return Return;
})();