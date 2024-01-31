YIUI.GridHandler = (function () {

    var dynamicDepChange = function (editOpt,depend) {
        return editOpt.cellType == YIUI.CONTROLTYPE.DYNAMIC && editOpt.editOptions.dependency && editOpt.editOptions.dependency.indexOf( depend ) != -1;
    }

    var impl_dependedValueChanged = function (form, grid, row, col, depend, target, value) {
        var editOpt = grid.getCellEditOpt(row,col);
        var cellData = grid.getCellDataAt(row,col);
        var typeDef = cellData.typeDef,meta;
        if( typeDef ) {
            meta = typeDef.editOptions;
        } else {
            meta = editOpt.editOptions;
        }

        switch ( meta.cellType ) {
        case YIUI.CONTROLTYPE.COMBOBOX:
        case YIUI.CONTROLTYPE.CHECKLISTBOX:
            if( meta.dependency && meta.dependency.indexOf( depend ) != -1 ) {
                grid.setValueAt(row, col, value, true, true);
            }
            break;
        case YIUI.CONTROLTYPE.DICT:
        case YIUI.CONTROLTYPE.DYNAMICDICT:
            // var result = false;
            // if( meta.refKey === depend || meta.root === depend ){
            //     result = true;
            // }
            // if( !result ) {
            //     var filter = YIUI.DictHandler.getMetaFilter(form, target, meta.itemFilters, meta.itemKey);
            //     if( filter && filter.dependency && filter.dependency.indexOf( depend ) != -1 ){
            //         result = true;
            //     }
            // }
            // if( result ) {
                grid.setValueAt(row, col, value, true, true);  // 字典单元格的依赖,直接清空,无法判断依赖
            // }
            break;
        default:
            if( dynamicDepChange(editOpt, depend) ) {
                grid.setValueAt(row, col, value, true, true);
            }
            break;
        }
        if( dynamicDepChange(editOpt, depend) ) { // 刷新behavior
            grid.refreshDynamicOpt(editOpt,row,col);
        }
    }

    // 静态私有方法
    var _dependedValueChanged = function (form, grid, row, depend, target, value) {
        var loc = form.getCellLocation(target);
        if( loc.expand ) {
            for (var i = 0,columns = loc.columns;i < columns.length; i++) {
                impl_dependedValueChanged(form, grid, row, columns[i], depend, target, value);
            }
        } else {
            impl_dependedValueChanged(form, grid, row, loc.column, depend, target, value);
        }
    }

    var Return = {
        /**
         * 单元格单击事件,用于表格的button , hyperlink等
         */
        doOnCellClick: function (grid, rowIndex, colIndex, value) {
            var editOpt = grid.getCellEditOpt(rowIndex,colIndex);

            switch (editOpt.cellType) {
                case YIUI.CONTROLTYPE.BUTTON:
                case YIUI.CONTROLTYPE.HYPERLINK:
                case YIUI.CONTROLTYPE.IMAGE:
                case YIUI.CONTROLTYPE.TEXTBUTTON:
                case YIUI.CONTROLTYPE.IMAGELIST:
                    if (editOpt.editOptions.onClick) {
                        var form = YIUI.FormStack.getForm(grid.ofFormID);
                        var cxt = new View.Context(form);
                        cxt.updateLocation(grid.key,rowIndex,colIndex);
                        form.eval($.trim(editOpt.editOptions.onClick), cxt, null);
                    }
                    break;
            }
        },

        /**
         * 表格行点击
         */
        doOnRowClick: function (grid, rowIndex) {

            var rowClick = grid.getMetaObj().rowClick;

            if ( rowClick ) {
                var form = YIUI.FormStack.getForm(grid.ofFormID),
                    cxt = new View.Context(form);

                cxt.updateLocation(grid.key,rowIndex,-1);

                form.eval(rowClick, cxt, null);
            }
        },

        /**
         * 表格行双击事件
         */
        doOnRowDblClick: function (grid, rowIndex) {

            var rowDblClick = grid.getMetaObj().rowDblClick;

            if( rowDblClick ) {
                var form = YIUI.FormStack.getForm(grid.ofFormID),
                    cxt = new View.Context(form);

                cxt.updateLocation(grid.key,rowIndex,-1);

                form.eval(rowDblClick, cxt, null);
            }

        },

        /**
         * 单元格双击事件
         */
        doOnCellDblClick: function (grid, rowIndex, colIndex) {

            var editOpt = grid.getCellEditOpt(rowIndex,colIndex);

            var cellDblClick = editOpt.cellDblClick;

            if( cellDblClick ) {
                var form = YIUI.FormStack.getForm(grid.ofFormID),
                    cxt = new View.Context(form);

                cxt.updateLocation(grid.key,rowIndex,colIndex);

                form.eval(cellDblClick, cxt, null);
            }

        },

        rowChange: function (grid, newRowIndex, oldRowIndex) {

            grid.loadSubDetail();

            var form = YIUI.FormStack.getForm(grid.ofFormID);

            form.getUIProcess().doAfterRowChanged(grid);

            var rowChanged = grid.getMetaObj().focusRowChanged;

            if( rowChanged ) {
                var cxt = new View.Context(form);
                cxt.updateLocation(grid.key,newRowIndex,-1);
                form.eval(rowChanged, cxt, null);
            }
        },

        /**
         * 表格排序事件
         */
        doOnSortClick: function (grid, colIndex, sortType) {
            grid.dataModel.data.sort(function (row1, row2) {
                if (row1.rowType == "Fix" || row1.rowType == "Total" || row2.rowType == "Fix" || row2.rowType == "Total") {
                    return row1.metaRowIndex - row2.metaRowIndex;
                }
                if ( !row2.bkmkRow ) return -1;
                if ( !row1.bkmkRow ) return 1;
                var v1 = row1.data[colIndex][0], v2 = row2.data[colIndex][0];
                if (v1 == undefined && v2 == undefined) return 0;
                if (v1 !== undefined && v2 == undefined) return sortType === "asc" ? -1 : 1;
                if (v1 == undefined && v2 !== undefined) return sortType === "asc" ? 1 : -1;

                if( typeof v1 == 'object' ) {
                    if( v1 instanceof YIUI.ItemData ) {
                      v1 = v1.getOID();v2 = v2.getOID();
                    } else if ( v1 instanceof Decimal ) {
                      v1 = parseFloat(v1);v2 = parseFloat(v2);
                    } else if ( v1 instanceof Date ) {
                      v1 = v1.getTime();v2 = v2.getTime();
                    }
                  return sortType === "desc" ? v2 - v1 : v1 - v2;
                }
                return sortType === "desc" ? v2.localeCompare(v1) : v1.localeCompare(v2);
            });
            grid.refreshGrid();
        },

        doShiftUpRow: function (control, rowIndex) {
            if(rowIndex <= 0){
                return;
            }

            var rowData = control.getRowDataAt(rowIndex - 1);

            if( rowData.rowType != "Detail" ) {
                return;
            }

            rowData = control.getRowDataAt(rowIndex);

            if ( rowData.rowType != "Detail" ) {
                return;
            }

            this.doExchangeRow(control, rowIndex, rowIndex - 1);
        },

        doShiftDownRow: function (control, rowIndex) {
            if(rowIndex < 0){
                return;
            }

            var rowData = control.getRowDataAt(rowIndex);

            if( rowData.rowType != "Detail" ) {
                return;
            }

            if( rowIndex + 1 >= control.getRowCount() ) {
                return;
            }

            rowData = control.getRowDataAt(rowIndex + 1);

            if( rowData.rowType != "Detail" ) {
                return;
            }

            this.doExchangeRow(control, rowIndex, rowIndex + 1);
        },

        doExchangeRow: function (grid, rowIndex, excIndex) {
            var row = grid.getRowDataAt(rowIndex),
                excRow = grid.getRowDataAt(excIndex);

            grid.dataModel.data.splice(rowIndex, 1, excRow);
            grid.dataModel.data.splice(excIndex, 1, row);

            this.exchangeRowSequence(grid,rowIndex,excIndex);

            grid.el.exchangeRow(rowIndex,excIndex);
        },

        /**
         * 向指定页进行跳转
         */
        doGoToPage: function (control, pageIndex, needShow) {
            var def = $.Deferred();

            control.pageInfo.curPageIndex = pageIndex;

            if (control.getMetaObj().pageLoadType == YIUI.PageLoadType.UI) {
                if( needShow ) def.resolve(control.load(false));
            } else {
                var form = YIUI.FormStack.getForm(control.ofFormID),
                    filterMap = form.getFilterMap(),
                    pageCount = control.pageInfo.pageRowCount,
                    tableKey = control.tableKey,
                    condPara = form.getCondParas();

                filterMap.setOID(form.getOID());
                filterMap.getTblFilter(tableKey).startRow = pageIndex * pageCount;
                filterMap.getTblFilter(tableKey).maxRows = pageCount;

                var postLoad = function (doc) {
                    var document = form.getDocument(),
                        dataTable = doc.getByKey(tableKey);

                    document.setByKey(tableKey, dataTable);

                    var totalRowCount = pageIndex * pageCount + YIUI.TotalRowCountUtil.getRowCount(doc, tableKey);
                    YIUI.TotalRowCountUtil.setRowCount(document, tableKey, totalRowCount);
                }

                var service = new YIUI.DocService(form);

                if( needShow ) {
                  def = new YIUI.DocService(form).loadFormData(form, filterMap.OID, filterMap, condPara)
                    .then(function(doc){
                        postLoad(doc);
                        control.load(false);
                    });
                } else { // 重置,需要同步加载
                  def.resolve(postLoad(service.loadFormData(form, filterMap.OID, filterMap, condPara, true)));
                }
            }
            return def.promise();
        },
        /**
         * 跳转到首页
         */
        doGoToFirstPage: function (control, pageInfo) {
        },
        /**
         * 跳转到末页
         */
        doGoToLastPage: function (control, pageInfo) {
        },
        /**
         * 跳转到上一页
         */
        doGoToPrevPage: function (control, pageInfo) {
        },
        /**
         * 跳转到下一页
         */
        doGoToNextPage: function (control, pageInfo) {
        },

        /**
         * 表格中新增行事件
         */
        rowInsert: function (grid, rowIndex, fireEvent) {
            if( !fireEvent ) {
                return;
            }

            grid.refreshIndex(rowIndex);

            var form = YIUI.FormStack.getForm(grid.ofFormID);

            YIUI.GridLookupUtil.updateFixPos(form,grid);

            var focusIndex = grid.getFocusRowIndex();
            if( rowIndex == focusIndex ) {
                grid.loadSubDetail();
            }

            form.getUIProcess().doCalcOneRow(grid, rowIndex);

            var rowInsert = grid.getMetaObj().rowInsert;
            if ( rowInsert ) {
                var cxt = new View.Context(form);
                cxt.updateLocation(grid.key,rowIndex,-1);
                form.eval(rowInsert, cxt, null);
            }
        },

        /**
         * 表格中删除行事件
         */
        rowDelete: function (form, grid, rowIndex, fireEvent) {
            if( !fireEvent ) {
                return;
            }

            grid.refreshIndex(rowIndex);

            YIUI.GridLookupUtil.updateFixPos(form,grid);

            grid.loadSubDetail();

            grid.refreshSelectAll();

            form.getUIProcess().doPostDeleteRow(grid);

            if(grid.serialSeq) {
                this.dealWithSequence(form, grid, rowIndex);
            }

            var metaObj = grid.getMetaObj();
            if (metaObj.rowDelete) {
                var cxt = new View.Context(form);
                form.eval(metaObj.rowDelete, cxt, null);
            }
        },

        rowDeleteAll:function (form,grid,fireEvent) {
            if( !fireEvent ) {
                return;
            }

            grid.refreshSelectAll();

            YIUI.GridLookupUtil.updateFixPos(form,grid);

            form.getUIProcess().doPostDeleteRow(grid);
        },

        setCellValueToDocument: function (form, grid, rowIndex, colIndex, newValue) {
            var row = grid.getRowDataAt(rowIndex);
            switch (row.rowType) {
                case "Fix":
                    this.setFixValueToDoc(form, grid, rowIndex, colIndex);
                    break;
                case "Detail":
                    this.setDtlValueToDoc(form, grid, rowIndex, colIndex);
                    this.setSubDetailValue(form, grid, rowIndex, colIndex, newValue);
                    break;
            }
        },
        setCellValueToDataTable: function (form, grid, table, editOpt, cellData) {
            var columnKey = editOpt.columnKey;

            if ( !columnKey )
                return;

            var cellType = editOpt.cellType;

            var newValue = cellData[0];

            switch (cellType) {
                case YIUI.CONTROLTYPE.DYNAMICDICT:
                case YIUI.CONTROLTYPE.DICT:
                    var editOptions = editOpt.editOptions;
                    if ( newValue == null ) {
                        if (editOptions.allowMultiSelection) {  // TODO itemkey 没清空
                            table.setByKey(columnKey, null);
                        } else {
                            table.setByKey(columnKey, 0);
                        }
                        break;
                    }
                    if (editOptions.allowMultiSelection) {
                        var oids = [], itemKey = "";
                        if (editOptions.isCompDict) {
                            $.error($.ygrid.formatString($.ygrid.compDictNotDataBinding, editOpt.key))
                        }
                        for (var i = 0, len = newValue.length; i < len; i++) {
                            oids.push(newValue[i].oid);
                            oids.push(",");
                        }
                        if (oids && oids.length > 0) {
                            oids.pop();
                            itemKey = newValue[0].itemKey;
                        }
                        table.setByKey(columnKey, oids.join(""));
                        if (cellType == YIUI.CONTROLTYPE.DYNAMICDICT) {
                            table.setByKey(columnKey + "ItemKey", itemKey);
                        }
                    } else {
                        table.setByKey(columnKey, newValue.oid);
                        if (cellType == YIUI.CONTROLTYPE.DYNAMICDICT || cellType == YIUI.CONTROLTYPE.COMPDICT ) {
                            table.setByKey(columnKey + "ItemKey", newValue.itemKey);
                        }
                    }
                    break;
                case YIUI.CONTROLTYPE.DYNAMIC:
                    this.setDynamicCellValueToDataTable(form, grid, table, editOpt, cellData);
                    break;
                case YIUI.CONTROLTYPE.MONTHPICKER:
                    table.setByKey(columnKey, newValue);
                    break;
                case YIUI.CONTROLTYPE.TIMEPICKER:
                    table.setByKey(columnKey, newValue);
                    break;
                default:
                    var dataType = table.getColByKey(columnKey).type;
                    table.setByKey(columnKey, YIUI.Handler.convertValue(newValue, dataType));
                    break;
            }
        },

        // 设置动态单元格的值
        setDynamicCellValueToDataTable: function (form, grid, table, editOpt, cellData) {
            var typeDef = cellData.typeDef;
            if( !typeDef ) {
                return;
            }

            var curOptions = typeDef.editOptions,
                typeDefKey = typeDef.key,
                cellType = typeDef.cellType;

            var columnKey = editOpt.columnKey;

            var newValue = cellData[0];

            // 统一NULL
            if( grid.isNullValue(newValue) ) {
                newValue = null;
                typeDefKey = null;
            }

            switch ( cellType ) {
                case YIUI.CONTROLTYPE.DYNAMICDICT:
                case YIUI.CONTROLTYPE.DICT:
                    if (curOptions.allowMultiSelection) {
                        var oids = [], itemKey = "";
                        if (curOptions.isCompDict) {
                            $.error($.ygrid.formatString($.ygrid.compDictNotDataBinding, editOpt.key))
                        }
                        if( newValue ) {
                            for (var i = 0, len = newValue.length; i < len; i++) {
                                oids.push(newValue[i].oid);
                                oids.push(",");
                            }
                        }
                        if (oids && oids.length > 0) {
                            oids.pop();
                            itemKey = newValue[0].itemKey;
                        }
                        table.setByKey(columnKey, oids.join(""));
                        if (cellType == YIUI.CONTROLTYPE.DYNAMICDICT) {
                            table.setByKey(columnKey + "ItemKey", itemKey);
                        }
                    } else {
                        var oid = newValue ? newValue.oid : null;
                        table.setByKey(columnKey, oid);
                        if (cellType == YIUI.CONTROLTYPE.DYNAMICDICT || cellType == YIUI.CONTROLTYPE.COMPDICT ) {
                            table.setByKey(columnKey + "ItemKey", newValue.itemKey);
                        }
                    }
                    break;
                case YIUI.CONTROLTYPE.DATEPICKER:
                    var result = null;
                    if( newValue ) {
                        var format = null;
                        if( curOptions.onlyDate ) {
                            format = 'yyyy-MM-dd';
                        } else {
                            format = 'yyyy-MM-dd HH:mm:ss';
                        }
                        result = newValue.Format(format);
                    }
                    table.setByKey(columnKey,result);
                    break;
                default:
                    var dataType = table.getColByKey(columnKey).type;
                    table.setByKey(columnKey, YIUI.Handler.convertValue(newValue, dataType));
                    break;
            }
            // 设置TypeDefKey字段
            table.setByKey(columnKey + "TypeDefKey", typeDefKey);
        },

        setFixValueToDoc: function (form, grid, rowIndex, colIndex) {
            var editOpt = grid.getCellEditOpt(rowIndex,colIndex),
                cellData = grid.getCellDataAt(rowIndex,colIndex),
                doc = form.getDocument();
            if ( !doc ) {
                return;
            }
            var table = doc.getByKey(editOpt.tableKey);
            if ( !table ) {
                return;
            }
            var bkmkRow = cellData.bkmkRow;
            if( bkmkRow ) {
                table.setByBkmk(bkmkRow.getBookmark());
                this.setCellValueToDataTable(form, grid, table, editOpt, cellData);
            } else {
                this.flushFixCell(form, grid, editOpt, rowIndex, colIndex);
            }
        },

        flushFixCell: function (form, grid, metaCell, rowIndex, colIndex) {
            var doc = form.getDocument(),
                table = doc.getByKey(metaCell.tableKey),
                metaGrid = grid.getMetaObj();

            table.addRow(true); // 新增一行
            var bkmkRow = new YIUI.DetailRowBkmk(table.getBkmk());

            var rowData = grid.getRowDataAt(rowIndex),
                metaRow = metaGrid.rows[rowData.metaRowIndex],
                rowDimValue = metaRow.dimValue,
                node;

            // 刷入行的维度数据
            if( grid.hasRowAreaExpand && rowDimValue ) {
                for (var c = 0, length = rowDimValue.values.length; c < length; c++) {
                    node = rowDimValue.values[c];
                    table.setByKey(node.columnKey, node.value);
                }
            }

            var dimValue = metaCell.dimValue;
            if( dimValue ) {
                var cellData = grid.getCellDataAt(rowIndex, colIndex),
                    node;
                for( var i = 0,length = dimValue.size();i < length;i++ ) {
                    node = dimValue.getValue(i);
                    table.setByKey(node.columnKey, YIUI.Handler.convertValue(node.value, node.dataType));
                }

                this.setCellValueToDataTable(form, grid, table, metaCell, cellData);

                cellData.bkmkRow = bkmkRow;
            } else {
                if (metaCell.isColExpand) {

                    var crossValue = metaCell.crossValue,
                        areaIndex = metaCell.columnArea,
                        node,
                        columnKey;

                    var expInfo = grid.dataModel.expandModel[areaIndex];
                    for (var k = 0, length = crossValue.values.length; k < length; k++) {
                        node = crossValue.values[k];
                        columnKey = expInfo[k];
                        if( columnKey ) {
                            table.setByKey(columnKey, node.value);
                        }
                    }

                    // 寻找起始行,默认从0开始,因为可能一个区域是一行
                    var startRow = 0;

                    // 如果当前行不是区域头,向上寻找
                    if( grid.hasRowAreaExpand ) {
                        if( !metaRow.isAreaHead ) {
                            for( var i = rowIndex;i >= 0; --i ) {
                                rowData = grid.getRowDataAt(i);
                                metaRow = metaGrid.rows[rowData.metaRowIndex];
                                if( metaRow.isAreaHead ) {
                                    startRow = i;
                                    break;
                                }
                            }
                        } else {  // 当前行是区域头,从当前行开始刷入值
                            startRow = rowIndex;
                        }
                    }

                    // 需找起始列
                    var startCol = colIndex;
                    var tempKey = null;
                    for( var i = colIndex;i >= 0;--i ) {
                        metaCell = metaRow.cells[i];

                        tempKey = metaCell.crossValue;
                        if( tempKey == null || !tempKey.equals(crossValue) ) {
                            break;
                        }

                        startCol = i;
                    }

                    // 循环行,填值
                    var row,
                        metaRow,
                        cellData;
                    for (var i = startRow, size = grid.getRowCount(); i < size; i++) {
                        row = grid.getRowDataAt(i);
                        if (row.rowType !== 'Fix') {
                            break;
                        }

                        metaRow = metaGrid.rows[row.metaRowIndex];
                        if( rowDimValue && !rowDimValue.equals(metaRow.dimValue) ) {
                            break;
                        }

                        for( var k = startCol,length = metaRow.cells.length;k < length;k++ ) {
                            metaCell = grid.getCellEditOpt(i, k);
                            cellData = row.data[k];

                            if( !crossValue.equals(metaCell.crossValue) ) {
                                break;
                            }

                            if( metaCell.columnKey ) {
                                this.setCellValueToDataTable(form, grid, table, metaCell, cellData);
                                cellData.bkmkRow = bkmkRow;
                            }
                        }
                    }
                } else {
                    var cellData = grid.getCellDataAt(rowIndex, colIndex);

                    this.setCellValueToDataTable(form, grid, table, metaCell, cellData);

                    cellData.bkmkRow = bkmkRow;
                }
            }
        },

        selectRange: function (grid, start, end, ci, value) {
            var cell,
                row;
            for( var i = start;i < end;i++ ) {
                row = grid.getRowDataAt(i);
                cell = row.data[ci];
                if( row.rowType !== 'Detail' || YIUI.GridUtil.isEmptyRow(row) || !cell[2] )
                    continue;
                grid.setValueAt(i,ci,value,true,true);
            }
        },

        // 单选时,清除其他字段
        selectSingle: function (grid, rowIndex, colIndex, value) {
            if( value ) {
                var row;
                for( var i = 0,size = grid.getRowCount();i < size;i++ ) {
                    row = grid.getRowDataAt(i);
                    if( i == rowIndex || row.rowType !== 'Detail' || YIUI.GridUtil.isEmptyRow(row) )
                        continue;
                    grid.setValueAt(i,colIndex,false,true,true);
                }
                var form = YIUI.FormStack.getForm(grid.ofFormID);
                var doc = form.getDocument();
                var shadowTable = doc.getShadow(grid.tableKey);
                if ( shadowTable ) {
                    shadowTable.clear();
                }
            }
        },

        selectRow: function (form, grid, rowIndex, colIndex, newValue) {

            if( !grid.tableKey ) {
                return;
            }

            var row = grid.getRowDataAt(rowIndex),
                tableKey = grid.tableKey,
                doc = form.getDocument(),
                dataTable = doc.getByKey(tableKey);

            var bkmkRow = row.bkmkRow;

            if ( !bkmkRow ) {
                return;
            }

            var selectKey = YIUI.SystemField.SELECT_FIELD_KEY,
                dataType = dataTable.cols[dataTable.indexByKey(selectKey)].type;

            newValue = YIUI.TypeConvertor.toDataType(dataType, newValue);

            if ( grid.hasColumnExpand() ) {
                for (var i = 0, len = bkmkRow.size(); i < len; i++) {
                    dataTable.setByBkmk(bkmkRow.getAt(i).getBookmark());
                    dataTable.setByKey(selectKey, newValue);
                }
            } else {
                dataTable.setByBkmk(bkmkRow.getBookmark());
                if (grid.pageInfo.pageLoadType == YIUI.PageLoadType.DB) {
                    var shadowTable = doc.getShadow(tableKey);
                    if (dataTable.getState() == DataDef.R_New)
                        return;
                    if (YIUI.TypeConvertor.toBoolean(newValue)) {
                        if( YIUI.ViewUtil.findShadowBkmk(doc,tableKey) != -1 ) 
                            return;

                        shadowTable.addRow();
                        for (var j = 0, clen = shadowTable.cols.length; j < clen; j++) {
                            shadowTable.set(j, dataTable.get(j));
                        }
                        
                        shadowTable.setByKey(selectKey, newValue);
                        shadowTable.setState(dataTable.getState());
                    } else {
                        var bkmk = YIUI.ViewUtil.findShadowBkmk(doc,tableKey);
                        if (bkmk != -1) {
                            shadowTable.setByBkmk(bkmk);
                            shadowTable.setState(DataDef.R_New);// 置为新增状态,直接删除
                            shadowTable.delRow();
                        }
                    }
                } else {
                    dataTable.setByKey(selectKey, newValue);
                }
            }
        },
        setDtlValueToDoc: function (form, grid, rowIndex, colIndex) {
            var editOpt = grid.getCellEditOpt(rowIndex,colIndex),
                rowData = grid.getRowDataAt(rowIndex),
                cellData = rowData.data[colIndex],
                doc = form.getDocument();

            if ( !doc || !editOpt.hasDB )
                return;

            var table = doc.getByKey(grid.tableKey);

            var bkmkRow = rowData.bkmkRow;

            if( rowData.rowType === 'Detail' && !bkmkRow ) {
                this.flushRow(form, grid, rowIndex);

                grid.loadSubDetail();

                this.dealWithSequence(form, grid, rowIndex);
            } else {
                if (grid.hasColumnExpand()) {
                    if (editOpt.isColExpand) {
                        var  crossValue = editOpt.crossValue,
                            areaIndex = editOpt.columnArea;

                        var cellBkmk = bkmkRow.getAtArea(areaIndex,crossValue);

                        if ( !cellBkmk ) {
                            table.addRow(true);

                            cellBkmk = new YIUI.DetailRowBkmk(table.getBkmk());
                            bkmkRow.add(areaIndex,crossValue,cellBkmk);

                            // 扩展数据赋值
                            var expInfo = grid.dataModel.expandModel[areaIndex],
                                node;
                            for (var k = 0, count = crossValue.values.length; k < count; k++) {
                                node = crossValue.values[k];

                                table.setByKey(expInfo[k], node.value);
                            }

                            // 刷入非拓展字段
                            var metaRow = grid.getMetaObj().rows[rowData.metaRowIndex];
                            for (var i = 0,size = metaRow.cells.length;i < size;i++) {//循环单元格
                                var _editOpt = metaRow.cells[i];
                                if ( !_editOpt.isColExpand ) {
                                    this.setCellValueToDataTable(form, grid, table, _editOpt, rowData.data[i]);
                                }
                            }
                        } else {
                            table.setByBkmk(cellBkmk.getBookmark());
                        }
                        this.setCellValueToDataTable(form, grid, table, editOpt, cellData);
                    } else {
                        for (var i = 0, len = bkmkRow.size(); i < len; i++) {
                            table.setByBkmk(bkmkRow.getAt(i).getBookmark());
                            this.setCellValueToDataTable(form, grid, table, editOpt, cellData);
                        }
                    }
                } else {
                    table.setByBkmk(bkmkRow.getBookmark());
                    // 设置数据表的值
                    this.setCellValueToDataTable(form, grid, table, editOpt, cellData);
                    // 设置影子表的值
                    this.setValue2ShadowTable(form, grid, editOpt, table);
                }
            }
        },

        // 设置子明细头控件的值
        setSubDetailValue:function (form,grid,rowIndex,colIndex,newValue) {
            var editOpt = grid.getCellEditOpt(rowIndex,colIndex),
                coms = form.subDetailInfo[editOpt.key];
            if( coms ) {
                for (var i = 0, len = coms.length; i < len; i++) {
                    form.getComponent(coms[i]).setValue(newValue, true, true);
                }
            }
        },

        setValue2ShadowTable:function (form, grid, editOpt, dataTable) {
            var doc = form.getDocument(),
                shadowTable = doc.getShadow(grid.tableKey),
                columnKey = editOpt.columnKey;
            if( !shadowTable  || !editOpt.columnKey )
                return;

            var bookmark = YIUI.ViewUtil.findShadowBkmk(doc, grid.tableKey);
            if( bookmark == -1 )
                return;

            shadowTable.setByBkmk(bookmark);

            shadowTable.setByKey(columnKey,dataTable.getByKey(columnKey));

            // 是否有ItemKey列
            var itemKeyColumn = columnKey + "ItemKey";
            if( shadowTable.getColByKey(itemKeyColumn) ) {
                shadowTable.setByKey(itemKeyColumn, dataTable.get(itemKeyColumn));
            }

            // 是否有TypeDefKey列
            var typeDefKeyColumn = columnKey + "TypeDefKey";
            if( shadowTable.getColByKey(itemKeyColumn) ) {
                shadowTable.setByKey(typeDefKeyColumn, dataTable.getByKey(typeDefKeyColumn));
            }
        },

        // 获取拓展的维度数据对应的key
        crossValKey:function(metaCell){
            var key = [];
            key.push(metaCell.columnArea);
            var crossValue = metaCell.crossValue;
            if( crossValue ) {
                for( var i = 0;i < crossValue.values.length;i++ ) {
                    var node = crossValue.values[i];
                    key.push(node.columnKey,node.dataType,node.value);
                }
            }
            return key.join("_");
        },
        flushRow: function (form, grid, rowIndex) {
            var rowData = grid.getRowDataAt(rowIndex),
                metaRow = grid.getMetaObj().rows[rowData.metaRowIndex],
                table = form.getDocument().getByKey(grid.tableKey),
                viewRow;
            if (grid.hasColumnExpand()) {

                var expandModel = grid.dataModel.expandModel;

                var cellData,
                    metaCell,
                    crossValue,
                    areaIndex,
                    viewRow = new YIUI.ExpandRowBkmk(expandModel.length);

                for (var i = 0, len = rowData.data.length; i < len; i++) {
                    cellData = rowData.data[i];
                    metaCell = metaRow.cells[i];
                    if (metaCell.isColExpand) {
                        crossValue = metaCell.crossValue;
                        areaIndex = metaCell.columnArea;

                        var detailViewRow = viewRow.getAtArea(areaIndex,crossValue);

                        if ( !detailViewRow ) {
                            table.addRow(true);

                            detailViewRow = new YIUI.DetailRowBkmk(table.getBkmk());
                            viewRow.add(areaIndex,crossValue,detailViewRow);

                            //扩展数据赋值
                            var expInfo = expandModel[areaIndex],
                                node,
                                expKey;
                            for (var k = 0, cLen = crossValue.values.length; k < cLen; k++) {
                                node = crossValue.values[k];
                                expKey = expInfo[k];
                                if (expKey !== undefined && expKey !== null && expKey.length > 0) {
                                    table.setByKey(expKey, node.value);
                                }
                            }
                        }
                        this.setCellValueToDataTable(form, grid, table, metaCell, cellData);
                    }
                }
                for (var m = 0, size = viewRow.size(); m < size; m++) {
                    table.setByBkmk(viewRow.getAt(m).getBookmark());
                    for (var n = 0, length = rowData.data.length; n < length; n++) {
                        metaCell = metaRow.cells[n];
                        if ( !metaCell.isColExpand ) {
                            this.setCellValueToDataTable(form, grid, table, metaCell, rowData.data[n]);
                        }
                    }
                }
            } else {
                table.addRow(true);
                viewRow = new YIUI.DetailRowBkmk(table.getBkmk());

                // 设置维度值
                var dimValue = metaRow.dimValue,dimNode;
                if( dimValue ) {
                    for( var l = 0,size = dimValue.size();l < size;l++ ) {
                        dimNode = dimValue.getValue(l);
                        table.setByKey(dimNode.getColumnKey(),YIUI.Handler.convertValue(dimNode.getValue(), dimNode.getDataType()));
                    }
                }

                for (var k = 0, len = rowData.data.length; k < len; k++) {
                    metaCell = metaRow.cells[k];
                    this.setCellValueToDataTable(form, grid, table, metaCell, rowData.data[k]);
                }

                // 目前树的新增行只支持通用类型(ERP)
                if( grid.treeIndex != -1 && rowData.parentRow) {
                    var parentRow = rowData.parentRow;
                    if( parentRow.bkmkRow ) {
                        var rowTree = metaRow.rowTree,mainValue;
                        table.setByBkmk(parentRow.bkmkRow.getBookmark());
                        mainValue = table.getByKey(rowTree.parent);
                        table.setByBkmk(viewRow.getBookmark());
                        table.setByKey(rowTree.foreign,mainValue);
                    }
                }

                if( grid.isSubDetail ) {
                    var pGrid = YIUI.SubDetailUtil.getBindingGrid(form,grid),
                        parentRow = pGrid.getRowDataAt(pGrid.getFocusRowIndex());
                    table.rows[table.pos].parentBkmk = parentRow.bkmkRow.getBookmark();
                }
            }
            rowData.bkmkRow = viewRow;
        },

        showRowData:function (form,grid,table,rowIndex) {
            var value,
                rowData = grid.getRowDataAt(rowIndex),
                metaRow = grid.getMetaObj().rows[rowData.metaRowIndex],
                columnKey;

            for (var i = 0,metaCell;metaCell = metaRow.cells[i]; i++) {
                columnKey = metaCell.columnKey;
                if( columnKey && table.getColByKey(columnKey) ) {
                    value = YIUI.UIUtil.getCompValue(metaCell, table);
                    grid.setValueAt(rowIndex, i, value, false, false, true, null, metaCell);
                }
            }
        },

        showDetailRowData: function (form, grid, rowIndex, metaRow) {
            var doc = form.getDocument();
            if (doc == null) return;
            var dataTable = doc.getByKey(grid.tableKey);
            if (dataTable == null) return;
            var rowData = grid.getRowDataAt(rowIndex),
              rowbkmk = rowData.bkmkRow, firstRow = rowbkmk, cellData;
            if (rowbkmk instanceof YIUI.ExpandRowBkmk) {
              firstRow = rowbkmk.getAt(0);
            }

            var value,
                metaCell,
                metaRow = metaRow || grid.getMetaObj().rows[rowData.metaRowIndex];

            for (var i = 0;metaCell = metaRow.cells[i]; i++) {

                cellData = rowData.data[i];

                if ( metaCell.hasDB ) {

                    // 这边统一刷新behavior,setValueAt处不刷新
                    // 只刷新动态单元格,因为WEB的behavior是单例对象
                    if( metaCell.cellType == YIUI.CONTROLTYPE.DYNAMIC ) {

                        dataTable.setByBkmk(firstRow.getBookmark());

                        var typeDefKey = dataTable.getByKey(metaCell.columnKey + "TypeDefKey");

                        grid.refreshDynamicOpt(metaCell,rowIndex,i,typeDefKey);
                    }

                    // 设置值
                    if (metaCell.isColExpand) {
                        var detailRowBkmk = rowbkmk.getAtArea(metaCell.columnArea, metaCell.crossValue);
                        if (detailRowBkmk != null) {
                            dataTable.setByBkmk(detailRowBkmk.getBookmark());
                            value = YIUI.UIUtil.getCompValue(metaCell, dataTable);

                            grid.setValueAt(rowIndex, i, value, false, false, true, cellData, metaCell);
                        }
                    } else {
                        dataTable.setByBkmk(firstRow.getBookmark());
                        value = YIUI.UIUtil.getCompValue(metaCell, dataTable);


                        // 耗时点!!
                        grid.setValueAt(rowIndex, i, value, false, false, true, cellData, metaCell);


                    }
                } else if (metaCell.isSelect) {

                    dataTable.setByBkmk(firstRow.getBookmark());

                    if(grid.pageInfo.pageLoadType == YIUI.PageLoadType.DB){
                        if( YIUI.ViewUtil.findShadowBkmk(doc, grid.tableKey) != -1 ) {
                            grid.setValueAt(rowIndex, i, true, false, false, true, cellData, metaCell);
                        }
                    } else {
                        grid.setValueAt(rowIndex, i, dataTable.getByKey(YIUI.SystemField.SELECT_FIELD_KEY), false, false, true, cellData, metaCell);
                    }

                } else if (metaCell.cellType == YIUI.CONTROLTYPE.LABEL
                    || metaCell.cellType == YIUI.CONTROLTYPE.BUTTON
                    || metaCell.cellType == YIUI.CONTROLTYPE.HYPERLINK) {

                    //  grid.setCaptionAt(rowIndex, i, cellData[1]);
                }
            }

        },

        showFixRowData: function (form,grid,rowIndex) {
            var document = form.getDocument(),
                table,
                dimValue,
                value;

            var rowData = grid.getRowDataAt(rowIndex),
                metaRow = grid.getMetaObj().rows[rowData.metaRowIndex],
                rowDimValue = metaRow.dimValue,
                metaCell,
                tableKey,
                cellData;

            for (var i = 0;metaCell = metaRow.cells[i]; i++) {
                cellData = rowData.data[i];
                if( metaCell.columnKey && metaCell.tableKey ) {
                    tableKey = metaCell.tableKey;
                    table = document.getByKey(tableKey);
                    dimValue = metaCell.dimValue;
                    if( dimValue ) {
                        var bkmk = YIUI.DataUtil.locate(table,dimValue);
                        if( bkmk != -1 ) {
                            value = YIUI.UIUtil.getCompValue(metaCell, table);
                            grid.setValueAt(rowIndex, i, value, false, false, true, cellData, metaCell);
                            cellData.bkmkRow = new YIUI.DetailRowBkmk(bkmk);
                        }
                    } else {
                        if( metaCell.isColExpand ) {
                            var rowMap = grid.dataModel.rowMap[tableKey];
                            if( rowMap ) {
                                var crossValue = metaCell.crossValue,
                                    realKey = crossValue.clone();
                                if( rowDimValue ) {
                                    var multiKey = YIUI.DataUtil.convertDimValue(rowDimValue);
                                    realKey.values = multiKey.values.concat(realKey.values);
                                }
                                var bkmkRow = rowMap.get(realKey);
                                if( bkmkRow ) {
                                    table.setByBkmk(bkmkRow.getBookmark());
                                    value = YIUI.UIUtil.getCompValue(metaCell, table);
                                    grid.setValueAt(rowIndex, i, value, false, false, true, cellData, metaCell);
                                    cellData.bkmkRow = bkmkRow;
                                }
                            }
                        } else {
                            if( rowDimValue ) {
                                var bkmk = YIUI.DataUtil.locate(table,rowDimValue);
                                if( bkmk != -1 ) {
                                    value = YIUI.UIUtil.getCompValue(metaCell, table);
                                    grid.setValueAt(rowIndex, i, value, false, false, true, cellData, metaCell);
                                    cellData.bkmkRow = new YIUI.DetailRowBkmk(bkmk);
                                }
                            } else {
                                if( table.first() ) {
                                    value = YIUI.UIUtil.getCompValue(metaCell, table);
                                    grid.setValueAt(rowIndex, i, value, false, false, true, cellData, metaCell);
                                    cellData.bkmkRow = new YIUI.DetailRowBkmk(table.getBkmk());
                                }
                            }
                        }
                    }
                } else {
                    // 如果没有数据绑定,没有值,只有caption
                    //grid.setValueAt(rowIndex, i, cellData[1], false, false, true);
                }
            }
        },

        /**
         *处理表格值变化时需要发生的相关事件
         */
        fireEvent: function (form, grid, rowIndex, colIndex) {

            var editOpt = grid.getCellEditOpt(rowIndex,colIndex);

            // 触发事件
            form.getViewDataMonitor().fireCellValueChanged(grid, rowIndex, colIndex, editOpt.key);

            // 非明细,不需要新增行或者分组
            var rowData = grid.getRowDataAt(rowIndex);
            if( rowData.rowType != 'Detail' ) {
                return;
            }

            if ( (grid.isEnable() && grid.newEmptyRow && editOpt.columnKey) || grid.condition ) {

                grid.appendEmptyRow(rowIndex);

                if( rowData.inAutoGroup ) {
                    rowData.inAutoGroup = false;
                    for (var i = rowIndex - 1; i >= 0; i--) {
                        var pRow = grid.dataModel.data[i];
                        if (!pRow.inAutoGroup) break;
                        pRow.inAutoGroup = false;
                    }
                    for (var k = rowIndex + 1, len = grid.dataModel.data.length; k < len; k++) {
                        var nRow = grid.dataModel.data[k];
                        if (!nRow.inAutoGroup) break;
                        nRow.inAutoGroup = false;
                    }
                    grid.appendEmptyGroup();
                }
            }
        },

        exchangeRowSequence: function (grid, rowIndex, anotherIndex) {

            var formID = grid.ofFormID,
                form = YIUI.FormStack.getForm(formID);

            var SYS_SEQUENCE = YIUI.SystemField.SEQUENCE_FIELD_KEY;
            var dataTable = form.getDocument().getByKey(grid.tableKey);
            var seqIndex = dataTable.indexByKey(SYS_SEQUENCE);
            if (seqIndex == -1) {
                return;
            }

            var row = grid.getRowDataAt(rowIndex),
                anotherRow = grid.getRowDataAt(anotherIndex);

            if( !row.bkmkRow || !anotherRow.bkmkRow ) {
                return;
            }

            var bkmk = row.bkmkRow;

            if (grid.hasColumnExpand()) {
                dataTable.setByBkmk(bkmk.getAt(0).getBookmark());
                var seq = YIUI.TypeConvertor.toInt(dataTable.getByKey(SYS_SEQUENCE));

                var anotherBkmk = anotherRow.bkmkRow;
                dataTable.setByBkmk(anotherBkmk.getAt(0).getBookmark());
                var anotherSeq = YIUI.TypeConvertor.toInt(dataTable.getByKey(SYS_SEQUENCE));

                for (var j = 0, jlen = anotherBkmk.size(); j < jlen; j++) {
                    dataTable.setByBkmk(anotherBkmk.getAt(j).getBookmark());
                    dataTable.setByKey(SYS_SEQUENCE, seq);
                }
                dataTable.setByBkmk(bkmk.getAt(0).getBookmark());
                for (var j = 0, jlen = anotherBkmk.size(); j < jlen; j++) {
                    dataTable.setByBkmk(anotherBkmk.getAt(j).getBookmark());
                    dataTable.setByKey(SYS_SEQUENCE, anotherSeq);
                }

            } else {
                dataTable.setByBkmk(bkmk.getBookmark());
                var seq = YIUI.TypeConvertor.toInt(dataTable.getByKey(SYS_SEQUENCE));

                dataTable.setByBkmk(anotherRow.bkmkRow.getBookmark());
                var anotherSeq = YIUI.TypeConvertor.toInt(dataTable.getByKey(SYS_SEQUENCE));

                dataTable.setByKey(SYS_SEQUENCE, seq);
                dataTable.setByBkmk(bkmk.getBookmark());
                dataTable.setByKey(SYS_SEQUENCE, anotherSeq);
            }
        },

        dealWithSequence: function (form, grid, rowIndex) {
            var SYS_SEQUENCE = YIUI.SystemField.SEQUENCE_FIELD_KEY;
            var dataTable = form.getDocument().getByKey(grid.tableKey);
            if( dataTable.size() == 0 ) {
                return;
            }
            var seqIndex = dataTable.indexByKey(SYS_SEQUENCE);
            if (seqIndex == -1) {
                return;
            }
            var row, bkmk, seq, curSeq = 0;
            for ( var i = rowIndex -1; i >= 0; --i) {
                row = grid.dataModel.data[i];

                if (!row.isDetail || !row.bkmkRow) {
                    continue;
                }

                bkmk = row.bkmkRow;
                if (grid.hasColumnExpand()) {
                    dataTable.setByBkmk(bkmk.getAt(0).getBookmark());
                } else {
                    dataTable.setByBkmk(bkmk.getBookmark());
                }
                curSeq = YIUI.TypeConvertor.toInt(dataTable.getByKey(SYS_SEQUENCE));
                break;
            }
            if (grid.serialSeq) {
                for ( var i = rowIndex,len = grid.dataModel.data.length; i < len; i++){
                    row = grid.dataModel.data[i];
                    if (!row.isDetail || !row.bkmkRow) {
                        continue;
                    }
                    bkmk = row.bkmkRow;
                    if (grid.hasColumnExpand()) {
                        dataTable.setByBkmk(bkmk.getAt(0).getBookmark());
                        seq = ++curSeq;
                        for (var j = 0, jlen = bkmk.size(); j < jlen; j++) {
                            dataTable.setByBkmk(bkmk.getAt(j).getBookmark());
                            dataTable.setByKey(SYS_SEQUENCE, seq);
                        }
                    } else {
                        dataTable.setByBkmk(bkmk.getBookmark());
                        dataTable.setByKey(SYS_SEQUENCE, ++curSeq);
                    }
                }
            } else {
                for (var i = rowIndex, len = grid.dataModel.data.length; i < len; i++) {
                    row = grid.dataModel.data[i];
                    if (!row.isDetail || !row.bkmkRow) {
                        continue;
                    }
                    bkmk = row.bkmkRow;
                    if (grid.hasColumnExpand()) {
                        dataTable.setByBkmk(bkmk.getAt(0).getBookmark());
                        seq = YIUI.TypeConvertor.toInt(dataTable.getByKey(SYS_SEQUENCE));
                        if (seq == undefined || seq == null || seq <= curSeq) {
                            seq = curSeq + 1;
                            for (var j = 0, jlen = bkmk.size(); j < jlen; j++) {
                                dataTable.setByBkmk(bkmk.getAt(j).getBookmark());
                                dataTable.setByKey(SYS_SEQUENCE, seq);
                            }
                        } 
						//else {
                        //    break;
                        //}
                    } else {
                        dataTable.setByBkmk(bkmk.getBookmark());
                        seq = YIUI.TypeConvertor.toInt(dataTable.getByKey(SYS_SEQUENCE));
                        if (seq == undefined || seq == null || seq <= curSeq) {
                            seq = curSeq + 1;
                            dataTable.setByKey(SYS_SEQUENCE, seq);
                        } 
						//else {
                        //    break;
                        //}
                    }
                    curSeq = seq;
                }
            }
        },
        dependedValueChange: function (form, grid, target, depend, value) {
            var loc = form.getCellLocation(target);
            if( loc ) {
                if (loc.row == null || loc.row == -1) {
                    for (var i = 0, len = grid.getRowCount(); i < len; i++) {
                        var row = grid.getRowDataAt(i);
                        if (row.rowType == 'Detail' && row.bkmkRow) {
                            _dependedValueChanged(form, grid, i, depend, target, value);
                        }
                    }
                } else {
                    _dependedValueChanged(form, grid, loc.row, depend, target, value);
                }
            } else {
                if( grid.key === target ) {
                    grid.load(true);
                }
            }
        },
        dependedCellValueChange: function (form, grid, rowIndex, depend, target, value) {
            _dependedValueChanged(form, grid, rowIndex, depend, target, value);
        }
    };
    Return = $.extend({}, YIUI.Handler, Return);
    return Return;
})();