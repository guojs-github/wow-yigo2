YIUI.SubDetailUtil = (function () {
    var Return = {
        isSubDetail: function (form, comp, gridKey) {
            if (comp.parentGridKey) {
                if (comp.parentGridKey != gridKey) {
                    return Return.isSubDetail(form, Return.getBindingGrid(form, comp), gridKey);
                } else {
                    return true;
                }
            }
            return false;
        }, 
        getBindingGrid: function (form, subDetailComp) {
            var grid = form.getComponent(subDetailComp.parentGridKey);
            if(grid == null) {
                throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, subDetailComp.parentGridKey));
            }
            return grid;
        },
        getBindingCellData: function (form, subDetailComp) {
            var cellKey = subDetailComp.bindingCellKey,
                grid = this.getBindingGrid(form,subDetailComp);
            if( grid == null ) return null;
            var rowIndex = grid.getFocusRowIndex();
            if (rowIndex == -1 || !cellKey) return null;
            var loc = form.getCellLocation(cellKey);
            return grid.getCellDataAt(rowIndex,loc.column);
        },
        getBindingColumn:function (form, subDetailComp) {
            var cellKey = subDetailComp.bindingCellKey;
            if( !cellKey ) return null;
            var grid = this.getBindingGrid(form,subDetailComp);
            if( grid == null ) return null;
            var loc = form.getCellLocation(cellKey);
            return grid.getColumnAt(loc.column);
        },
        clearSubDetailData: function (form, parentGrid) {
            var coms = form.subDetailInfo[parentGrid.key];
            if ( !coms ) {
                return;
            }

            var com;
            for (var i = 0, len = coms.length; i < len; i++) {
                com = form.getComponent(coms[i]);
                if(com == null) {
                    throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                        YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, coms[i]));
                }
                if (com.type == YIUI.CONTROLTYPE.GRID) {
                    this.clearSubDetailData(form,com);
                }
                com.reset();

                com.setRequired(false);

                com.setError(false,null);
            }
        },
        filter:function (form,grid) {
            var parent = this.getBindingGrid(form,grid);
            return this.filterByParent(form,parent,grid.tableKey);
        },
        filterByParent: function (form,parGrid,tableKey) {
            var rowIndex = parGrid.getFocusRowIndex();
            if( rowIndex == -1 ) {
                return false;
            }

            var rowData = parGrid.getRowDataAt(rowIndex);
            if( !rowData.isDetail || rowData.bkmkRow == null ) {
                return false;
            }
            var bookmark = rowData.bkmkRow.getBookmark();

            var doc = form.getDocument(),
                table = doc.getByKey(parGrid.tableKey),
                subTable = doc.getByKey(tableKey);

            table.setByBkmk(bookmark);

            var detailRow = parGrid.getDetailMetaRow();

            switch (detailRow.linkType) {
            case YIUI.LinkType.PARENT:
                var OID = table.getByKey(YIUI.SystemField.OID_SYS_KEY);

                subTable.setFilterEval(function () {
                    var parentBkmk = subTable.getParentBkmk();
                    if( bookmark != null && parentBkmk == bookmark ) {
                        return true;
                    }
                    var POID = subTable.getByKey(YIUI.SystemField.POID_SYS_KEY);
                    if( OID > 0 && POID == OID ) {
                        return true;
                    }
                    return false;
                });
                break;
            case YIUI.LinkType.FOREIGN:
                subTable.setFilterEval(function () {
                    var sourceFields = detailRow.sourceFields,
                        targetFields = detailRow.targetFields,
                        srcField,
                        tgtField;
                    for (var k = 0, slen = sourceFields.length; k < slen; k++) {
                        srcField = sourceFields[k];
                        tgtField = targetFields[k];
                        var dataType = table.cols[table.indexByKey(srcField)].type;
                        var dV = YIUI.Handler.convertValue(table.getByKey(srcField), dataType),
                            compDV = YIUI.Handler.convertValue(subTable.getByKey(tgtField), dataType);
                        if (dV instanceof Decimal && compDV instanceof Decimal) {
                            if (!dV.equals(compDV)) {
                                return false;
                            }
                        } else if (dV !== compDV) {
                            return false;
                        }
                    }
                    return true;
                });
                break;
            }
            subTable.filter();
            return true;
        }
    };
    return Return;
})();