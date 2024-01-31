YIUI.ListLayoutViewHandler = (function () {
    var Return = {
        isLayout: true,
        /**
         * 向指定页进行跳转
         */
        doGoToPage: function (control, pageIndex) {
            var formID = control.ofFormID,
                controlKey = control.key,
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
                    control.load(true);
                });
        },
        
        rowInsert: function (listLayoutView, rowIndex, fireEvent) {
            if( !fireEvent ) {
                return;
            }

            var formID = listLayoutView.ofFormID,
                form = YIUI.FormStack.getForm(formID);
            form.getUIProcess().doCalcOneRow(listLayoutView, rowIndex, true);
        },

        loadLayout: function(comp, table, form, enable) {
            var metaObj = comp.metaObj;
            var columnKey = metaObj.columnKey;
            var value = null;
            if(columnKey) {
                var val = table.getByKey(columnKey);
                value = val;
                switch (metaObj.type) {
                    case YIUI.CONTROLTYPE.DICT:
                        if(metaObj.allowMultiSelection && val) {
                            value = [];
                            var oids = val.split(','), o;
                            for(var j = 0;j < oids.length;j++){
                                o = oids[j].trim();
                                if($.isNumeric(o)){
                                    var oid = YIUI.TypeConvertor.toLong(o);
                                    value.push(new YIUI.ItemData({
                                        oid : oid,
                                        itemKey : metaObj.itemKey
                                    }));
                                }
                            }
                        } else {
                            var oid = YIUI.TypeConvertor.toLong(val);
                            value = new YIUI.ItemData({itemKey: metaObj.itemKey, oid: oid});
                        }
                    break;
                    case YIUI.CONTROLTYPE.DYNAMICDICT:
                        var oid = YIUI.TypeConvertor.toLong(val);
                        var itemKey = YIUI.DictHandler.getItemKey(form, metaObj.refKey);
                        value = new YIUI.ItemData({itemKey: itemKey, oid: oid});
                    break;
                    case YIUI.CONTROLTYPE.NUMBEREDITOR:
                        var decScale = metaObj.scale;
                        var roundingMode = metaObj.roundingMode;
                        var showZero = $.isDefined(metaObj.showZero) ? metaObj.showZero : false;
                        
                        if (val) {
                            value = YIUI.TypeConvertor.toDecimal(val);
                        }
                    break;
                }

                if(comp.rendered) {
                    comp.setValue(value, false, false, true, false);
                } else {
                    comp.value = value;
                }
            }
            if(comp.items) {
                for (var i = 0, len = comp.items.length; i < len; i++) {
                    var item = comp.items[i];
                    this.loadLayout(item, table, form, enable);
                }
            }
            comp.ofFormID = form.formID;
            comp.ofFormKey = form.formKey;
            comp.focusManager = form.focusManager;
        },

        /**
         * 显示一行明细
         */
        showDetailRow: function (form, listLayoutView, rowIndex) {
            var document = form.getDocument();
            var tableKey = listLayoutView.tableKey;
            if ( !tableKey ) return;
            var table = document.getByKey(tableKey);
            var row = listLayoutView.data[rowIndex];
            table.setByBkmk(row.bkmkRow.getBookmark());
            
            
            for (var m = 0, size = listLayoutView.columnInfo.length; m < size; m++) {
                var column = listLayoutView.columnInfo[m];
                var columnKey = column.columnKey;
                var value = null;
                if(columnKey) {
                    value = table.getByKey(columnKey);
                }
                listLayoutView.setValueAt(rowIndex, m, value);
            }

            var layout = listLayoutView.layout;
            var enable = false;
            if(layout) {
                if(!row.layout) {
                    row.layout = $.extend(true, {}, layout);
                }
                if(row.root) {
                    this.loadLayout(row.root, table, form, enable);
                } else {
                    this.loadLayout(row.layout, table, form, enable);
                }
            }
        },

        doOnCellClick: function(control, cellIndex) {
            var form = YIUI.FormStack.getForm(control.ofFormID);
            
            var loc = form.getCellLocation(control.OID);
            if(loc) {
                loc.row = cellIndex;
            }

        }

    };
    Return = $.extend({}, YIUI.Handler, Return);
    return Return;
})();