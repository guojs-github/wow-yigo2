/**
 * Created by 陈瑞 on 2017/3/4 use WebStorm.
 */
(function () {
    YIUI.UIVisibleProcess = YIUI.extend(YIUI.AbstractUIProcess,{
        VisibleItemType : { Head: 0,
                           Column: 1,
                           Operation: 2 },
        init:function (form) {
            this.base(form);
        },

        calcAll:function () {
            var cxt = new View.Context(this.form);

            this.calcComponent(cxt);

            this.calcGridRows(cxt);

            this.impl_refreshGrid(cxt);
        },

      calcComponent: function (cxt) {
        var items = this.visibleTree.items,item,com;
        for( var i = 0;item = items[i];i++ ) {
          if( item.type == this.VisibleItemType.Operation ) continue;
          com = this.form.getComponent(item.source);
          this.calcExprItemObject(com,cxt,item);
        }
      },

      calcGridRows: function (cxt) {
          var rowItems = this.visibleTree.rowItems;
          if( !rowItems ) return;
          var gm = this.form.getGridArray(), grid, items;
          for( var i = 0,size = gm.length;i < size;i++ ) {
             grid = this.form.getComponent(gm[i].key);
             items = rowItems[grid.key];
             if( !items ) continue;
             this.calcRows(grid,cxt,items);
          }
      },

      calcRows: function (grid,cxt,items) {
        grid.hideCount = 0;
        var row,item,count = grid.getRowCount();
        for( var k = 0;k < count;k++ ) {
            row = grid.getRowDataAt(k);
            if (row.rowType === 'Detail') continue;
            if( item = items[row.key] ) {
              cxt.updateLocation(grid.key, k, -1);
              grid.setRowVisible(k, this.calcVisible(item,cxt));
            }
        }
        // 有行隐藏的,刷新行序号
        if( grid.showRowHead ) {
           grid.refreshRowNo();
        }
      },

        calcSubDetail:function (gridKey) {
            var items = this.visibleTree.items,
                cxt = new View.Context(this.form);

            for( var i = 0,item,com;item = items[i];i++ ) {
                com = this.form.getComponent(item.source);

                if( com && YIUI.SubDetailUtil.isSubDetail(this.form,com,gridKey) ) {
                    this.calcExprItemObject(com,cxt,item);
                }

                if( com && com.type == YIUI.CONTROLTYPE.GRID ) {
                    var rowItems = this.visibleTree.rowItems;
                    if( !rowItems ) continue;
                    var items = rowItems[com.key];
                    if( items ) this.calcRows(com,cxt,items);
                }
            }

            this.impl_refreshGrid(cxt);
        },

        calcExprItemObject:function (com,cxt,item) {
            switch (item.objectType){
            case YIUI.ExprItem_Type.Item:
                if( item.type == this.VisibleItemType.Operation ) {
                    this.calcOperationItem(cxt,item);
                } else {
                    this.calcHeadItem(com,item,cxt);
                }
                break;
            case YIUI.ExprItem_Type.Set:
                switch (com.type){
                case YIUI.CONTROLTYPE.GRID:
                    this.calcGrid(com,item,cxt);
                    break;
                case YIUI.CONTROLTYPE.LISTVIEW:
                case YIUI.CONTROLTYPE.LISTLAYOUTVIEW:
                    this.calcListView(com,item,cxt);
                    break;
                }
                break;
            }
        },

      calcOperationItem: function (cxt,item) {
          this.form.setOperationVisible(item.target,this.calcVisible(item,cxt,true));
      },

        calcHeadItem:function (com,item,cxt) {

            if( com.extend ) {
                return com.setVisible(false);
            }

            if( $.inArray(item.source,this.form.buddyKeys) !== -1 )
                return;

            var defaultValue = true;
            if( com.isSubDetail ) {
                var column = YIUI.SubDetailUtil.getBindingColumn(this.form,com);
                if( column ) {
                    defaultValue = !column.hidden;
                }
            }

            var visible = com.isVisible();

            com.setVisible(this.calcVisible(item,cxt,defaultValue));

            if(this.form.rendered && com.isPanel && com.isVisible() && !com.rendered && this.needRender(com)){
                com.render();
            }

            if( visible != com.isVisible() && !com.isSubDetail ) {
                this.moveError(com);
            }
        },

        needRender: function (com) {
            var ownerCt = com.ownerCt;
            if( !ownerCt ) {
                return true; // 没有父面板,需要render
            }
            if( ownerCt.rendered ) {
                if( ownerCt.type == YIUI.CONTROLTYPE.TABPANEL ) {
                    return ownerCt.isActive(com); // 非当前选中tab,不render
                } else {
                    return true;
                }
            }
            return false; // 父面板没有render,不需要render
        },

        calcListView:function (listView,item,cxt) {
            if( !item.items )
                return;
            for(var i = 0,exp;exp = item.items[i];i++){
                if( exp.type != this.VisibleItemType.Column )
                    continue;
                listView.setColumnVisible(exp.target, this.calcVisible(exp,cxt,true));
            }
        },

        calcGrid:function (grid,item,cxt) {
            if( !item.items )
                return;

            var visible,
                exp,
                pos,
                column;

            for( var i = 0;(exp = item.items[i]) && (pos = exp.pos);i++ ){
                if( exp.type != this.VisibleItemType.Column )
                    continue;
                if( pos.columnExpand ) {
                    // 列拓展计算多次
                    for( var k = 0,length = pos.indexes.length;k < length;k++ ) {
                        cxt.updateLocation(grid.key,-1,pos.indexes[k]);

                        column = grid.getColumnAt(pos.indexes[k]);

                        if( column.invalidExpand ) {
                            visible = false;
                        } else {
                            visible = this.calcVisible(exp,cxt,true);
                        }

                        grid.setColumnVisible(pos.indexes[k], visible);
                    }

                    // 存在列拓展改变,但是可见性不变,默认刷新
                    if( grid.rendered ) {
                        cxt.addGrid(grid);
                    }
                } else {
                    column = grid.getMetaColumnAt(pos.index);

                    if( column.invalidExpand ) {
                        visible = false;
                    } else {
                        visible = this.calcVisible(exp,cxt,true);
                    }

                    // 列的可见性改变,移除或者添加行的错误
                    var change = grid.setColumnVisible(pos.index, visible);
                    if( change ) {
                        // 如果该列有检查规则或者必填
                        for( var k = 0,size = grid.getRowCount();k < size;k++ ) {
                            var rowData = grid.getRowDataAt(k);
                            //if( rowData.rowType == 'Detail' ) {
                                this.moveCellError(grid,rowData,k,pos.index);
                           // }
                        }

                        // 添加,算完refresh
                        if( grid.rendered ) {
                            cxt.addGrid(grid);
                        }
                    }

                    var coms = this.form.getCellSubDtlComps(grid.key,exp.target),meta;
                    if( coms ) {
                        for( var j = 0,length = coms.length;j < length;j++ ) {
                            meta = coms[j].getMetaObj();
                            if( !meta.visible ) {
                                coms[j].setVisible(visible);
                            }
                        }
                    }
                }
            }
        },

        valueChanged:function (comp) {
            var items = this.visibleTree.affectItems[comp.key];

            if( !items )
                return;

            var item,
                com;

            var cxt = new View.Context(this.form);
            for( var i = 0;item = items[i];i++ ) {
                com = this.form.getComponent(item.source);

                this.calcExprItemObject(com,cxt,item);
            }

            this.impl_refreshGrid(cxt);
        },

        reCalcComponent:function (com) {
            var items = this.visibleTree.items,
                cxt = new View.Context(this.form),
                item;

            for( var i = 0;item = items[i];i++ ) {
                if( item.source !== com.key )
                    continue;

                this.calcExprItemObject(com,cxt,item);
            }

            this.impl_refreshGrid(cxt);

            if( com.type == YIUI.CONTROLTYPE.GRID ) {
               var rowItems = this.visibleTree.rowItems;
               if( !rowItems ) return;
               var items = rowItems[com.key];
               if( !items ) return;
               this.calcRows(com,cxt,items);
            }
        },

        cellValueChanged:function (grid,rowIndex,colIndex) {
            var editOpt = grid.getCellEditOpt(rowIndex,colIndex),
                items = this.visibleTree.affectItems[editOpt.key];

            if( !items )
                return;

            var cxt = new View.Context(this.form),
                item,
                com;

            cxt.updateLocation(grid.key,rowIndex,colIndex);

            for( var i = 0;item = items[i];i++ ) {
                com = this.form.getComponent(item.source);

                this.calcExprItemObject(com,cxt,item);
            }

            this.impl_refreshGrid(cxt);
        },

        doAfterDeleteRow:function (grid) {
            this.impl_RowChanged(grid);
        },

        // 新增一行,不需要计算   RowCount
        doCalcOneRow:function (com,rowIndex) {
            //if( com.type !== YIUI.CONTROLTYPE.GRID )
            //    return;
           // this.impl_RowChanged(com);
        },

        doAfterRowChanged:function (grid) {
            this.impl_RowChanged(grid);
        },

        impl_RowChanged: function (grid) {
            var detailRow = grid.getDetailMetaRow(),
                item,
                com,
                items;

            if( !detailRow ) {
                return;
            }

            var cxt = new View.Context(this.form);

            for( var i = 0,length = detailRow.cells.length;i < length;i++ ) {
                items = this.visibleTree.affectItems[detailRow.cells[i].key];

                if( items == null ) {
                    continue;
                }

                for( var j = 0;item = items[j];j++ ) {
                    com = this.form.getComponent(item.source);

                    // 略过当前表格(应该不存在source为当前表格的)
                    if( com && com.key == grid.key ) {
                        continue;
                    }

                    // 子明细不计算
                    if( com && YIUI.SubDetailUtil.isSubDetail(this.form,com,grid.key) ) {
                        continue;
                    }

                    this.calcExprItemObject(com,cxt,item);
                }
            }

            this.impl_refreshGrid(cxt);
        },

        // 表格refresh是重量级方法,所以这里算完统一刷新
        impl_refreshGrid: function (cxt) {
            var grids = cxt.getGrids(),grid;
            while( grid = grids.pop() ) {
                grid.refreshGrid();
            }
        }

    });
})();