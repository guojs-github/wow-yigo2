YIUI.ListViewHandler = (function () {
    var Return = {
        /**
         * 向指定页进行跳转
         */
        doGoToPage: function (control, pageIndex) {
            var formID = control.ofFormID,
                tableKey = control.tableKey,
                startRow = pageIndex * control.pageRowCount,
                form = YIUI.FormStack.getForm(formID);

            var filterMap = form.getFilterMap();
            filterMap.setStartRow(tableKey, startRow);

            new YIUI.DocService(form).loadFormData(form, form.getFilterMap().OID, form.getFilterMap(), form.getCondParas())
                .then(function(doc){
                    var totalRowCount = startRow + YIUI.TotalRowCountUtil.getRowCount(doc, tableKey);
                    var document = form.getDocument();
                    YIUI.TotalRowCountUtil.setRowCount(document, tableKey, totalRowCount);

                    document.setByKey(tableKey,doc.getByKey(tableKey));

                    control.curPageIndex = pageIndex + 1;
                    control.load();
                });
        },

        /**
         * ListView行点击
         */
        doOnRowClick: function (control, rowIndex, formula) {
            if ( formula ) {
                var form = YIUI.FormStack.getForm(control.ofFormID);
                var cxt = new View.Context(form);
                cxt.updateLocation(control.key,rowIndex,-1);
                form.eval(formula, cxt, null);
            }
        },

        /**
         * Button,HyperLink点击
         */
        doOnCellClick: function (control, rowIndex, colKey) {
            var form = YIUI.FormStack.getForm(control.ofFormID);
            var loc = form.getCellLocation(colKey),
                column = control.columnInfo[loc.column];
            var clickContent = column.clickContent;
            if (clickContent) {
                var cxt = new View.Context(form);
                cxt.updateLocation(control.key,rowIndex,-1);
                form.eval(clickContent, cxt, null);
            }
        },

        sort:function (listView, index, order) {
            var column = listView.columnInfo[index],
                key = column.key;
            listView.data.sort(function (row1, row2) {
                var v1 = row1[key].value;
                var v2 = row2[key].value;

                if( v1 == null && v2 == null ) {
                    return 0;
                }
                if( v1 !== null && v2 == null ) {
                    return order === "asc" ? -1 : 1;
                }
                if( v1 == null && v2 != null ) {
                    return order === "asc" ? 1 : -1;
                }

                switch (column.columnType) {
                case YIUI.CONTROLTYPE.DATEPICKER:
                    var d1 = v1.getTime(),
                        d2 = v2.getTime();
                    return order === "asc" ? d1 - d2 : d2 - d1;
                case YIUI.CONTROLTYPE.DICT:
                    var o1 = typeof v1.getOID == "function" ? v1.getOID() : v1,
                        o2 = typeof v2.getOID == "function" ? v2.getOID() : v2;
                    return order === "asc" ? o1 - o2 : o2 - o1;
                case YIUI.CONTROLTYPE.NUMBEREDITOR:
                    return order === "asc" ? v1 - v2 : v2 - v1;
                default:
                    var s1 = v1 + "",
                        s2 = v2 + "";
                    return order === "asc" ? s1.localeCompare(s2) : s2.localeCompare(s1);
                }
            });
            listView.repaint();
        },

        selectRange:function (listView, start, end, colIndex, value) {
            for( var i = start;i < end;i++ ) {

                listView.setValByIndex(i,colIndex,value,true);

            }
        },

        // 单选时,清除其他字段
        selectSingle:function (listView, rowIndex, colIndex, value) {
            if( value ) {
                for( var i = 0,size = listView.getRowCount();i < size;i++ ) {
                    if( i == rowIndex  )
                        continue;
                    listView.setValByIndex(i, colIndex, false, true);
                }
                var form = YIUI.FormStack.getForm(listView.ofFormID);
                var doc = form.getDocument();
                var shadowTable = doc.getShadow(listView.tableKey);
                if ( shadowTable ) {
                    shadowTable.clear();
                }
            }
        },

        rowInsert: function (listView,rowIndex,fireEvent) {
            if( !fireEvent ) {
                return;
            }

            var formID = listView.ofFormID,
                form = YIUI.FormStack.getForm(formID);
            form.getUIProcess().doCalcOneRow(listView, rowIndex, true);
        },

        /**
         * 删除一行
         */
        rowDelete: function (listView, rowIndex) {
            var formID = listView.ofFormID,
                form = YIUI.FormStack.getForm(formID),
                doc = form.getDocument();

            var tableKey = listView.tableKey;
            if( !tableKey ) return;
            var table = doc.getByKey(tableKey);

            var rowData = listView.getRowDataAt(rowIndex);
            table.setByBkmk(rowData.bkmkRow.getBookmark());

            var shadowBkmk = YIUI.ViewUtil.findShadowBkmk(doc, tableKey);
            var shadowTable = doc.getShadow(tableKey);

            // 删除影子表数据
            if( shadowTable && shadowBkmk != -1 ) {
                shadowTable.setByBkmk(shadowBkmk);
                shadowTable.setState(DataDef.R_New);
                shadowTable.delRow();
            }

            // 删除自身数据
            table.delRow();
        },

        /**
         * 显示一行明细
         */
        showDetailRow: function (form, listView, rowIndex) {
            var document = form.getDocument();
            var tableKey = listView.tableKey;
            if ( !tableKey ) return;
            var table = document.getByKey(tableKey);
            var row = listView.data[rowIndex];
            table.setByBkmk(row.bkmkRow.getBookmark());
            for (var m = 0, size = listView.columnInfo.length; m < size; m++) {
                var column = listView.columnInfo[m];
                var columnKey = column.columnKey;
                var value = null;
                if(columnKey) {
                    value = table.getByKey(columnKey);
                } else if ( m == listView.getSelectFieldIndex() ) {

                    if( listView.pageLoadType == YIUI.PageLoadType.DB ) {
                        if( YIUI.ViewUtil.findShadowBkmk(document, listView.tableKey) != -1 ) {
                            value = true;
                        }
                    } else {
                        value = table.getByKey(YIUI.SystemField.SELECT_FIELD_KEY);
                    }

                } else {
                    if(column.columnType == YIUI.CONTROLTYPE.HYPERLINK ||
                        column.columnType == YIUI.CONTROLTYPE.BUTTON ||
                        column.columnType == YIUI.CONTROLTYPE.LABEL ) {
                        value = column.caption;
                    } else if (column.columnType == YIUI.CONTROLTYPE.HYPERLINK) {
                        value = false;
                    }
                }
                listView.setValueAt(rowIndex, m, value);
            }
        },

        /**
         * 选中一行
         */
        selectRow: function (form, listview, rowIndex, colIndex, newValue) {
            var doc = form.getDocument(),
                row = listview.data[rowIndex],
                tableKey = listview.tableKey;
            if( !tableKey || !row.bkmkRow )
                return;
            var table = doc.getByKey(tableKey),
                selectKey = YIUI.SystemField.SELECT_FIELD_KEY,
                dataType = table.cols[table.indexByKey(selectKey)].type;
            table.setByBkmk(row.bkmkRow.getBookmark());
            newValue = YIUI.Handler.convertValue(newValue, dataType);
            if( listview.pageLoadType == YIUI.PageLoadType.DB ) {
                // if (table.getState() == DataDef.R_New)
                //     return;
                var shadowTable = doc.getShadow(tableKey);
                if( YIUI.TypeConvertor.toBoolean(newValue) ) {
                    shadowTable.addRow();
                    for (var j = 0, clen = shadowTable.cols.length; j < clen; j++) {
                        shadowTable.set(j, table.get(j));
                    }
                    shadowTable.setByKey(selectKey, newValue);
                    shadowTable.setState(table.getState());
                } else {
                    var bkmk = YIUI.ViewUtil.findShadowBkmk(doc,tableKey);
                    if( bkmk != -1 ) {
                        shadowTable.setByBkmk(bkmk);
                        shadowTable.setState(DataDef.R_New);// 置为新增状态,直接删除
                        shadowTable.delRow();
                    }
                }
            } else {
                table.setByKey(selectKey, newValue);
            }
        }
    };
    Return = $.extend({}, YIUI.Handler, Return);
    return Return;
})();