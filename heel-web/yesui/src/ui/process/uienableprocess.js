/**
 * Created by 陈瑞 on 2017/3/2 use WebStorm.
 */
var YIUI = YIUI || {};
(function () {
    YIUI.UIEnableProcess = YIUI.extend(YIUI.AbstractUIProcess,{
        EnableItemType:{
            Head: 0,
            List: 1,
            Column: 2,
            Operation: 3
        },

        init:function (form) {
            this.base(form);
        },

        calcAll:function () {
            var items = this.enableTree.items,
                item,
                com,
                cxt = new View.Context(this.form);
            for( var i = 0;item = items[i];i++ ) {
                if( item.type == this.EnableItemType.Operation ) continue;
                com = this.form.getComponent(item.source);
                this.calcExprItemObject(com,cxt,item);
            }
        },

        calcSubDetail:function (gridKey) {
            var items = this.enableTree.items,
                item,
                com,
                cxt = new View.Context(this.form);
            for( var i = 0;item = items[i];i++ ) {
                if( item.type == this.EnableItemType.Operation ) continue;
                com = this.form.getComponent(item.source);
                if( YIUI.SubDetailUtil.isSubDetail(this.form, com, gridKey) ) {
                    this.calcExprItemObject(com,cxt,item);
                }
            }
        },

        calcExprItemObject: function (com,cxt,item) {
            switch (item.objectType){
            case YIUI.ExprItem_Type.Item:
                if( item.type == this.EnableItemType.Operation ) {
                    this.calcOperationItem(cxt,item);
                } else {
                    this.calcHeadItem(com,cxt,item);
                }
                break;
            case YIUI.ExprItem_Type.Set:
                switch (com.type){
                case YIUI.CONTROLTYPE.GRID:
                    this.calcGrid(com,cxt,item);
                    break;
                case YIUI.CONTROLTYPE.LISTVIEW:
                case YIUI.CONTROLTYPE.LISTLAYOUTVIEW:
                    this.calcListView(com,cxt,item);
                    break;
                }
                break;
            }
        },

      calcOperationItem: function (cxt,item) {
          this.form.setOperationEnable(item.target,this.calcEnable(item,cxt,this.getFormEnable()));
      },

        calcHeadItem:function (com,cxt,item) {
            var enable = false;
            if( com.type == YIUI.CONTROLTYPE.GRID && item.source !== item.target ) {
                var loc = this.form.getCellLocation(item.target);

                if( loc.areaExpand ) {
                    var areaIndex = cxt.getAreaIndex();
                    if( areaIndex == -1 ) {
                        for( var i = 0;i < loc.rows.length;i++ ) {
                            cxt.setAreaIndex(i);
                            this.impl_calcGridRow(com,cxt,loc.rows[i],item);
                        }
                        cxt.setAreaIndex(-1);
                    } else {
                        this.impl_calcGridRow(com,cxt,loc.rows[areaIndex],item);
                    }
                } else {
                    this.impl_calcGridRow(com,cxt,loc.row,item);
                }

            } else {
                var defaultValue = this.getFormEnable();
                if( com.isSubDetail ) {
                    var cell = YIUI.SubDetailUtil.getBindingCellData(this.form,com);
                    if( cell ) {
                        defaultValue = cell[2];
                    }
                }

                if( YIUI.ViewUtil.checkComAccessControl(this.form,com) ) {
                    enable = this.calcEnable(item,cxt,defaultValue);
                }

                com.setEnable(enable);
            }
        },

        calcGrid: function (grid,cxt,itemSet) {
            var rowData;
            for( var i = 0,size = grid.getRowCount(); i < size;i++ ) {
                rowData = grid.getRowDataAt(i);

                switch (rowData.rowType){
                case "Detail":
                    this.calcDetailGridRow(grid,cxt,i,itemSet);
                    break;
                case "Fix":
                    // 不在此处计算
                    break;
                case "Total":
                case "Group":
                    this.calcTitleGridRow(grid,cxt,i);
                    break;
                }
            }
        },

        calcTitleGridRow: function (grid,cxt,rowIndex) {
            var rowData = grid.getRowDataAt(rowIndex);
            var metaRow = grid.getMetaObj().rows[rowData.metaRowIndex],metaCell;
            for( var k = 0,count = metaRow.cells.length;k < count;k++ ) {
                metaCell = metaRow.cells[k];
                if( metaCell.enable ) {
                    grid.setCellEnable(rowIndex,k,this.form.eval(metaCell.enable,cxt));
                } else {
                    grid.setCellEnable(rowIndex,k,this.getFormEnable());
                }
            }
        },

        calcDetailGridRow: function (grid,cxt,rowIndex,itemSet) {
            if( !itemSet.items ) {
                return;
            }

            for( var i = 0,item;item = itemSet.items[i];i++ ) {

                this.impl_calcGridRow(grid,cxt,rowIndex,item);
            }
        },

        impl_calcGridRow:function (grid,cxt,rowIndex,item) {
            var pos = item.pos,
                idx;
            if( pos.columnExpand ) {
                var indexes = this.extractIndexes(cxt,grid,rowIndex,pos.indexes);

                for( var c = 0,size = indexes.length;c < size;c++ ) {
                    idx = indexes[c];

                    if( idx > 0 ) {
                        cxt.setExpandArea(c);
                        cxt.updateLocation(grid.key,rowIndex,idx);
                        grid.setCellEnable(rowIndex,idx,this.calcEnable(item,cxt,this.getFormEnable()));
                    }
                }
            } else {
                var enable = false;
                idx = pos.index;

                cxt.updateLocation(grid.key,rowIndex,-1);
                if( YIUI.ViewUtil.checkCellAccessControl(this.form,grid,rowIndex,item.target) ) {
                    enable = this.calcEnable(item,cxt,this.getFormEnable());
                }

                grid.setCellEnable(rowIndex,idx,enable);

                if( grid.getFocusRowIndex() == rowIndex ) {
                    var coms = this.form.getCellSubDtlComps(grid.key,item.target);
                    if( coms ) {
                        for( var k = 0,length = coms.length;k < length;k++ ) {
                            if( !coms[k].getMetaObj().enable ) {
                                coms[k].setEnable(enable);
                            }
                        }
                    }
                }
            }
        },

        calcListView:function (listView,cxt,itemSet) {
            for( var i = 0,item;item = itemSet.items[i];i++ ) {
                if( item.type != this.EnableItemType.Column )
                    continue;
                listView.setColumnEnable(item.target,this.calcEnable(item,cxt,this.getFormEnable()));
            }
        },

        cellValueChanged:function (grid,rowIndex,colIndex) {
            var editOpt = grid.getCellEditOpt(rowIndex,colIndex);

            var cxt = new View.Context(this.form);

            cxt.updateLocation(grid.key,rowIndex,colIndex);

            var rowData = grid.getRowDataAt(rowIndex);
            var metaRow = grid.getMetaObj().rows[rowData.metaRowIndex];

            cxt.setColIndex(colIndex);
            cxt.setAreaIndex(metaRow.areaIndex);

            this.impl_ValueChanged(grid,cxt,rowIndex,editOpt.key);
        },

        valueChanged:function (com) {
            var items = this.enableTree.affectItems[com.key];

            if( !items ) {
                return;
            }

            var item,
                com,
                cxt = new View.Context(this.form);
            for( var i = 0;item = items[i];i++ ) {
                com = this.form.getComponent(item.source);

                this.calcExprItemObject(com,cxt,item);
            }
        },

        impl_ValueChanged:function (grid,cxt,rowIndex,srcKey) {
            var items = this.enableTree.affectItems[srcKey];

            if( !items ) {
                return;
            }

            var item,
                com;
            for( var i = 0;item = items[i];i++ ) {
                com = this.form.getComponent(item.source);
                switch ( item.objectType ){
                case YIUI.ExprItem_Type.Item:
                    if( item.type == this.EnableItemType.Operation ) {
                        this.calcOperationItem(cxt,item);
                    } else {
                        this.calcHeadItem(com,cxt,item);
                    }
                    break;
                case YIUI.ExprItem_Type.Set:
                    if( grid.key === com.key && srcKey.indexOf(":RowIndex") == -1 ) {
                        this.calcDetailGridRow(grid,cxt,rowIndex,item);
                    } else if ( YIUI.SubDetailUtil.isSubDetail(this.form,grid,com.key) ) {
                        this.calcDetailGridRow(com,cxt,com.getFocusRowIndex(),item);
                    } else {
                        this.calcGrid(com,cxt,item);
                    }
                    break;
                default:
                    break;
                }
            }
        },

        doAfterDeleteRow:function (grid) {
            var cxt = new View.Context(this.form);

            // 计算行数改变的影响
            this.impl_ValueChanged(grid,cxt,-1,grid.key + ":RowCount");

            // 计算行号改变的影响
            this.impl_RowChanged(grid,cxt);
        },

        doAfterRowChanged:function (grid) {
            var cxt = new View.Context(this.form);
            this.impl_RowChanged(grid,cxt);
        },

        impl_RowChanged:function (grid,cxt) {

            if( grid.getFocusRowIndex() == -1 ) {
                return;
            }

            var detailRow = grid.getDetailMetaRow(),
                item,
                com,
                items;

            if( !detailRow ) {
                return;
            }

            for( var i = 0,length = detailRow.cells.length;i < length;i++ ) {
                items = this.enableTree.affectItems[detailRow.cells[i].key];

                if( !items ) {
                    continue;
                }

                for( var k = 0;item = items[k];k++ ) {
                    com = this.form.getComponent(item.source);

                    // 略过当前表格(应该不存在source为当前表格的)
                    if( item.source == grid.key ) {
                        continue;
                    }

                    // 子明细不计算
                    if( com && YIUI.SubDetailUtil.isSubDetail(this.form,com,grid.key) ) {
                        continue;
                    }

                    this.calcExprItemObject(com,cxt,item);
                }
            }
        },

        doCalcOneRow:function (grid,rowIndex) {
            if( grid.type !== YIUI.CONTROLTYPE.GRID ) {
                return;
            }

            var cxt = new View.Context(this.form);
            cxt.updateLocation(grid.key,rowIndex,-1);

            var items = this.enableTree.items;
            for( var i = 0,item;item = items[i];i++ ) {
                if( item.objectType !== YIUI.ExprItem_Type.Set || item.source !== grid.key )
                    continue;

                this.calcDetailGridRow(grid,cxt,rowIndex,item);
            }

            // 计算行数改变的影响
            this.impl_ValueChanged(grid,cxt,-1,grid.key + ":RowCount");

            // 计算行号改变的影响
            this.impl_RowChanged(grid,cxt);
        },

        reCalcComponent:function (com) {
            var items = this.enableTree.items,
                item,
                cxt = new View.Context(this.form);
            for( var i = 0;item = items[i];i++ ) {
                if( item.source !== com.key )
                    continue;

                this.calcExprItemObject(com,cxt,item);
            }
        }

    });
})();