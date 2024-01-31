YIUI.ViewUtil = (function () {

    var Return = {
        findShadowBkmk: function(doc, tableKey){
            var sdt = doc.getShadow(tableKey);
            if(sdt == null){
                return -1;
            }

            var bookmark = -1;
            var dt = doc.getByKey(tableKey);
            var colIndex = sdt.indexByKey(YIUI.SystemField.OID_SYS_KEY);

            if(colIndex >= 0){
                var oid = dt.get(colIndex);

                if(sdt.first()){
                    while(!sdt.isAfterLast()){
                        if(oid == sdt.get(colIndex)){
                            bookmark = sdt.getBkmk();
                            break;
                        }
                        sdt.next();
                    }
                }
            }else{
                var multiKey = [];
                for(var i = 0, len = sdt.cols.length; i < len ; i ++){
                    if(sdt.cols[i].isPrimary){
                        multiKey.push(i);
                    }
                } 

                if(multiKey.length == 0){
                	 throw new YIUI.ViewException(YIUI.ViewException.PRIMARYKEYS_UNDEFINED);
                }

                if(sdt.first()){
                    while(!sdt.isAfterLast()){
                        for(var index in multiKey){
                            if(sdt.get(index) != dt.get(index)){
                                bookmark = -1;
                                break;
                            }
                            bookmark = sdt.getBkmk();
                        }

                        if(bookmark > -1){
                            break;
                        }
                        sdt.next();
                    }
                }
            }
            return bookmark;
        },
        checkComAccessControl: function (form,com) {
            if( !com.getMetaObj().accessControl )
                return true;
            var table = form.getDocument().getByKey(com.tableKey);
            var val = -1;
            if( table.first() ) {
                val = YIUI.TypeConvertor.toInt(table.getByKey(com.columnKey + "_CF"));
            }
            return ((val & YIUI.FormUIStatusMask.ENABLE) != 0) ? false : true;
        },
        checkCellAccessControl: function (form,grid,ri,key) {
            var rowData = grid.getRowDataAt(ri);

            var loc = form.getCellLocation(key);
            if( loc.expand || !rowData.bkmkRow ) {
                return true;
            }

            var metaCell = grid.getCellEditOpt(ri,loc.column);

            if( !metaCell.accessControl )
                return true;

            var table = form.getDocument().getByKey(metaCell.tableKey);
            if( table.tableMode == YIUI.TableMode.HEAD ) {
                table.first();
            } else {
                table.setByBkmk(rowData.bkmkRow.getBookmark());
            }
            var val = YIUI.TypeConvertor.toInt(table.getByKey(metaCell.columnKey + "_CF"));
            return ((val & YIUI.FormUIStatusMask.ENABLE) != 0) ? false : true;
        },

        updateFormulaItemsIndex: function (form, grid) {

            var updateItem = function (item) {
                delete item.pos.index;
                delete item.pos.indexes;
                var loc = form.getCellLocation(item.target);
                if( loc.expand ) {
                    item.pos.indexes = loc.columns.concat();
                } else {
                    item.pos.index = loc.column;
                }
                item.pos.columnExpand = loc.expand;
            }

            var updateItems = function (allItems) {
                for( var i = 0,exp;exp = allItems[i];i++ ) {
                    if( grid.key && exp.source == grid.key ) {
                        if( exp.objectType == YIUI.ExprItem_Type.Set ) {
                            for( var k = 0,item;item = exp.items[k];k++ ) {
                                updateItem(item);
                            }
                        } else {
                            if( exp.target !== exp.source ) {
                                updateItem(exp);
                            }
                        }
                    }
                }
            }

            var updateAffectItems = function (affectItems) {
                for( var o in affectItems ) {
                    if( affectItems.hasOwnProperty(o) ) {
                        updateItems(affectItems[o]);
                    }
                }
            }

            var dp = form.dependency;

            updateItems(dp.calcTree.items);
            updateAffectItems(dp.calcTree.affectItems);

            updateItems(dp.enableTree.items);
            updateAffectItems(dp.enableTree.affectItems);

            updateItems(dp.visibleTree.items);
            updateAffectItems(dp.visibleTree.affectItems);

            updateItems(dp.checkRuleTree.items);
            updateAffectItems(dp.checkRuleTree.affectItems);
        }
    };
    return Return;
})();

YIUI.ColumnIDUtil = (function () {

    var getSeparatorPos = function (s) {
        for( var i = 0,length = s.length;i < length;i++ ) {
            if( $.isNumeric(s.charAt(i)) ) {
                return i - 1;
            }
        }
        return -1;
    }

    var toColumnIndex = function (columnID) {
        var begin = 'A'.charCodeAt(0),
            end = 'Z'.charCodeAt(0),
            count = end - begin + 1,
            length = columnID.length,
            c = '',
            index = 0;
        for( var i = length - 1;i >= 0;--i ) {
            c = columnID.charAt(length - i - 1);
            if( i == 0 ) {
                index += (c.charCodeAt(0) - begin);
            } else {
                index += (c.charCodeAt(0) - begin + 1) * sqr(count,i);
            }
        }
        return index;
    }

    var sqr = function (a,b) {
        if( b == 0 ) {
            return 1;
        }
        var r = a;
        for( var i = 0;i < b -1;i++ ) {
            r *= a;
        }
        return r;
    }

    var toColumnID = function (columnIndex) {
        var begin = 'A'.charCodeAt(0);
        var end = 'Z'.charCodeAt(0);
        var count = end - begin + 1;

        var multiple = 0;
        var remainder = 0;
        multiple = Math.floor(columnIndex / count);
        remainder = columnIndex % count;
        columnIndex = multiple;

        var colID = "";
        var ch = String.fromCharCode(begin + remainder);
        colID = ch + colID;

        while (multiple != 0) {
            multiple = Math.floor(columnIndex / count);
            remainder = columnIndex % count;
            columnIndex = multiple;
            ch = String.fromCharCode(begin + remainder - 1);
            colID = ch + colID;
        }

        return colID;
    }

    return {
        sqr: sqr,
        toColumnID: toColumnID,
        getSeparatorPos: getSeparatorPos,
        toColumnIndex: toColumnIndex
    }

})();