/**
 * Created by 陈瑞 on 2017/3/4 use WebStorm.
 */
var YIUI = YIUI || {};
(function () {
    YIUI.UICheckRuleProcess = YIUI.extend(YIUI.AbstractUIProcess,{
        init:function (form) {
            this.base(form);
        },

        calcAll:function () {

            this.calcAllComponents();

            this.checkGridRows();

            this.checkGlobal();
        },

        checkGlobal:function () {
            if( this.form.operationState == YIUI.Form_OperationState.Default ) return;

            var items = this.checkRuleTree.globalItems;

            if( items && items.length > 0 ) {
                var cxt = new View.Context(this.form), result;
                for( var i = 0,item;item = items[i];i++ ) {
                    result = this.calcCheckRule(item,cxt);
                    if( typeof result === 'string' ) {
                        if( result ) {
                            this.form.setError(true,result,this.form.formKey);
                            break;
                        } else {
                            this.form.setError(false,null,this.form.formKey);
                        }
                    } else {
                        if( result ) {
                           this.form.setError(false,null,this.form.formKey);
                        } else {
                           this.form.setError(true,item.errorMsg,this.form.formKey);
                           break;
                        }
                    }
                }
            } else {
               this.form.setError(false,null,this.form.formKey);
            }
        },

        calcAllComponents:function () {
            var items = this.checkRuleTree.items,
                cxt = new View.Context(this.form),
                com,
                item;
            for( var i = 0;item = items[i];i++ ) {
                com = this.form.getComponent(item.source);
                if( com.isSubDetail ) continue;

                this.calcExprItemObject(com,cxt,item);
            }
        },

        calcSubDetail:function (gridKey) {
            var items = this.checkRuleTree.items,
                cxt = new View.Context(this.form),
                com,
                item;
            for( var i = 0;item = items[i];i++ ) {
                com = this.form.getComponent(item.source);
                if( !YIUI.SubDetailUtil.isSubDetail(this.form,com,gridKey) ) continue;

                this.calcExprItemObject(com,cxt,item);
            }
        },

        calcExprItemObject: function (com,cxt,item) {
            switch (item.objectType) {
            case YIUI.ExprItem_Type.Item:
                this.checkHead(com,cxt,item);
                break;
            case YIUI.ExprItem_Type.Set:
                this.checkGrid(com,cxt,item);
                break;
            default:
                break;
            }
        },
        
        checkHead:function (com,cxt,item) {
            if( com.type == YIUI.CONTROLTYPE.GRID ){
                var loc = this.form.getCellLocation(item.target);

                if( loc.areaExpand ) {
                    var areaIndex = cxt.getAreaIndex();
                    if( areaIndex == -1 ) {
                        for( var i = 0;i < loc.rows.length;i++ ) {
                            cxt.setAreaIndex(i);
                            this.impl_calcGridCell(com,loc.rows[i],cxt,item);
                        }
                        cxt.setAreaIndex(-1);
                    } else {
                        this.impl_calcGridCell(com,loc.rows[areaIndex],cxt,item);
                    }
                } else {
                    this.impl_calcGridCell(com,loc.row,cxt,item);
                }

            } else {
                if( this.form.operationState != YIUI.Form_OperationState.Default || com.isEnable() ) {
                    if( item.required || item.items.length > 0 ) {
                        if( item.required ) {
                            com.setRequired(com.isNull());
                        }
                        if( item.items.length > 0 ) {
                            var result = this.calcCheckRule(item,cxt);
                            if( typeof result === 'string' ) {
                                com.setError(result,result);
                            } else {
                                com.setError(!result,result ? null : item.errorMsg);
                            }
                        }
                    } else {
                        if( com.isSubDetail ) {
                            var cellData = YIUI.SubDetailUtil.getBindingCellData(this.form,com);
                            if( cellData ) {
                                com.setRequired(cellData[3]); // 设置子明细的必填
                                com.setError(cellData[4],cellData[5]); // 设置子明细的检查
                            }
                        } else {
                           com.setRequired(false); // 变体设置,从有到无,需要清除效果
                           com.setError(false,null);
                        }
                    }
                } else {
                    com.setRequired(false);
                    com.setError(false,null);
                }
                if( !com.isSubDetail ) {
                    this.moveError(com);
                }
            }
        },

        checkGrid:function (grid,cxt,item) {
            for( var i = 0,size = grid.getRowCount();i < size;i++ ) {
                var rowData = grid.getRowDataAt(i);
                if( rowData.rowType == 'Detail' ) {
                    this.calcGridCell(grid,i,cxt,item);
                }
            }
        },

        calcGridCell:function (grid,rowIndex,cxt,itemSet) {
            if( !itemSet.items ) {
                return;
            }

            for( var i = 0,item;item = itemSet.items[i];i++ ) {

                this.impl_calcGridCell(grid,rowIndex,cxt,item);
            }
        },

        impl_calcGridCell: function (grid,rowIndex,cxt,item) {
            var pos = item.pos,
                idx;
            if( pos.columnExpand ) {

                var indexes = this.extractIndexes(cxt,grid,rowIndex,pos.indexes);

                for( var c = 0,length = indexes.length;c < length;c++ ) {
                    idx = indexes[c];

                    if( idx > 0 ) {
                        var cellData = grid.getCellDataAt(rowIndex,idx);
                        if( this.form.operationState != YIUI.Form_OperationState.Default || cellData[2] ) {
                           if( item.required ) {
                             grid.setCellRequired(rowIndex, idx, grid.isNullValue(cellData[0]));
                           }

                           cxt.setExpandArea(c);
                           cxt.updateLocation(grid.key,rowIndex,idx);

                           var result = this.calcCheckRule(item,cxt);
                           if( typeof result === 'string' ) {
                             grid.setCellError(rowIndex,idx,result,result);
                           } else {
                             grid.setCellError(rowIndex,idx,!result,result ? null : item.errorMsg);
                           }
                        }
                    }
                }
            } else {
                idx = pos.index;
                var rowData = grid.getRowDataAt(rowIndex),
                    cellData = rowData.data[idx];

                if( this.form.operationState != YIUI.Form_OperationState.Default || cellData[2] ) {
                  if( item.required ) {
                    grid.setCellRequired(rowIndex, idx, grid.isNullValue(cellData[0]));
                  } else {
                    grid.setCellRequired(rowIndex, idx, false);
                  }

                  cxt.updateLocation(grid.key,rowIndex,-1);

                  var result = this.calcCheckRule(item,cxt);
                  if( typeof result === 'string' ) {
                    grid.setCellError(rowIndex,idx,result,result);
                  } else {
                    grid.setCellError(rowIndex,idx,!result,result ? null : item.errorMsg);
                  }
                } else {
                  grid.setCellRequired(rowIndex, idx, false);
                  grid.setCellError(rowIndex,idx,false,null);
                }

                this.moveCellError(grid,rowData,rowIndex,idx);

                if( grid.getFocusRowIndex() == rowIndex ) {
                    var coms = this.form.getCellSubDtlComps(grid.key, item.target);
                    if (coms && coms.length > 0) {
                        for (var c = 0, count = coms.length; c < count; c++) {
                            var meta = coms[c].getMetaObj();

                            if( !meta.required ) {
                                coms[c].setRequired(cellData[3]);
                            }

                            if( !meta.checkRule ) {
                                coms[c].setError(cellData[4], cellData[5]);
                            }

                          //  this.moveError(coms[c]);
                        }
                    }
                }
            }
        },

        doCalcOneRow:function (com,rowIndex) {
            if( com.type != YIUI.CONTROLTYPE.GRID ) {
                return;
            }
            var row = com.getRowDataAt(rowIndex);
            if( row.rowType !== 'Detail' ) {
                return;
            }
            var items = this.checkRuleTree.items,
                cxt = new View.Context(this.form);
            cxt.updateLocation(com.key,rowIndex,-1);
            for( var i = 0,item;item = items[i];i++ ) {
                if( item.objectType !== YIUI.ExprItem_Type.Set || item.source !== com.key )
                    continue;

                this.calcGridCell(com,rowIndex,cxt,item);
            }

            this.checkGridRowCheckRule(com,cxt,rowIndex);

            this.impl_valueChanged(com,com.key + ":RowCount");

            this.checkGlobal();
        },

        doAfterDeleteRow: function (grid){
            this.impl_valueChanged(grid,grid.key + ":RowCount");

            this.checkGlobal();
        },

        checkGridRows:function () {
            var gridMap = this.form.getGridArray(),grid,
                cxt = new View.Context(this.form);
            for( var i = 0,gridInfo;gridInfo = gridMap[i];i++ ) {
                grid = this.form.getComponent(gridInfo.key);
                for( var ri = 0,length = grid.getRowCount();ri < length;ri++ ) {
                    this.checkGridRowCheckRule(grid,cxt,ri);
                }
            }
        },

        checkGridRowCheckRule:function (grid,cxt,rowIndex) {
            var rowData = grid.getRowDataAt(rowIndex);
            if( rowData.rowType !== 'Detail' ) return;
            var rowItems = this.checkRuleTree.rows;
            if( !rowItems ) return;
            var items = rowItems[rowData.key];

            if( grid.isEnable() && items && items.length > 0 ) {
                cxt.updateLocation(grid.key,rowIndex,-1);
                for (var k = 0,item;item = items[k]; k++) {
                    var result = this.calcCheckRule(item,cxt);
                    if( typeof result === 'string' ) {
                        if( result ) {
                          grid.setRowError(rowIndex,true,result,rowData.key);
                          break;
                        } else {
                          grid.setRowError(rowIndex,false,null,null);
                        }
                    } else {
                        if( result ) {
                          grid.setRowError(rowIndex,false,null,null);
                        } else {
                          grid.setRowError(rowIndex,true,item.errorMsg,rowData.key);
                          break;
                        }
                    }
                }
            } else {
                grid.setRowError(rowIndex,false,null,null);
            }
        },

        reCalcComponent:function (com) {
            var items = this.checkRuleTree.items,
                item,
                cxt = new View.Context(this.form);
            for( var i = 0;item = items[i];i++ ) {
                if( item.source !== com.key ) continue;

               this.calcExprItemObject(com,cxt,item);
            }

            if( com.type == YIUI.CONTROLTYPE.GRID ) {
                for( var i = 0,size = com.getRowCount();i < size;i++ ){
                    this.checkGridRowCheckRule(com,cxt,i);
                }
            }

            this.checkGlobal();
        },

        valueChanged:function (com) {

            this.impl_valueChanged(com,com.key);

            if( com.isSubDetail && !com.bindingCellKey ) {
                var grid = YIUI.SubDetailUtil.getBindingGrid(this.form,com);
                if( grid ) {
                    var cxt = new View.Context(this.form);
                    cxt.updateLocation(grid.key,grid.getFocusRowIndex(),-1);
                    this.checkGridRowCheckRule(grid,cxt,grid.getFocusRowIndex());
                }
            }

            this.checkGlobal();
        },

        impl_valueChanged:function (comp,key) {
            var items = this.checkRuleTree.affectItems[key];

            if( !items ) return;

            var item,
                com,
                cxt = new View.Context(this.form);

            for( var i = 0;item = items[i];i++ ) {
                com = this.form.getComponent(item.source);
                switch (item.objectType) {
                case YIUI.ExprItem_Type.Item:
                    this.checkHead(com,cxt,item);
                    break;
                case YIUI.ExprItem_Type.Set:
                    if( YIUI.SubDetailUtil.isSubDetail(this.form,comp,com.key) ) {
                        this.calcGridCell(com,com.getFocusRowIndex(),cxt,item);
                    } else {
                        this.checkGrid(com,cxt,item);
                    }
                    break;
                default:
                    break;
                }
            }
        },

        cellValueChanged:function (grid,rowIndex,colIndex) {
            var rowData = grid.getRowDataAt(rowIndex);
            if( rowData.rowType !== "Detail" && rowData.rowType !== "Fix" ) {
                return;
            }

            var metaRow = grid.getMetaObj().rows[rowData.metaRowIndex],
                editOpt = grid.getCellEditOpt(rowIndex,colIndex);

            var items = this.checkRuleTree.affectItems[editOpt.key],
                cxt = new View.Context(this.form),
                com,
                item;

            cxt.updateLocation(grid.key,rowIndex,-1);

            cxt.setColIndex(colIndex);
            cxt.setAreaIndex(metaRow.areaIndex);

            if ( items ) {
                for (var i = 0;item = items[i];i++) {
                    com = this.form.getComponent(item.source);
                    switch (item.objectType) {
                    case YIUI.ExprItem_Type.Item:
                        this.checkHead(com,cxt,item);
                        break;
                    case YIUI.ExprItem_Type.Set:
                        if( rowData.isDetail && com.key == grid.key ) {
                            this.calcGridCell(com,rowIndex,cxt,item);
                        } else {
                            this.checkGrid(com,cxt,item);
                        }
                        break;
                    default:
                        break;
                    }
                }
            }

            this.checkGridRowCheckRule(grid,cxt,rowIndex);

            this.checkGlobal();
        }

    });
})();
