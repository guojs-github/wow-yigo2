/**
 * Created by 陈瑞 on 2017/3/4 use WebStorm.
 */
var YIUI = YIUI || {};
(function () {
    YIUI.UICalcProcess = YIUI.extend(YIUI.AbstractUIProcess,{
        init:function (form) {
            this.base(form);
        },

        calcAlling: false,

        // 重写初始化
        initTree: function (o) {
            if( o.formula ) {
                o.syntaxTree = this.form.getSyntaxTree(o.formula);
            }
            o.treeInit = true;
        },

        calcAll:function () {

            this.calcAlling = true;

            // 只有新增计算全部,编辑默认如果有计算全部的情况,都只计算无数据绑定的
            // 执行函数RefreshUIFormula的计算由参数控制
            var calcAll = this.form.operationState == YIUI.Form_OperationState.New;

            this.calcAllItems(this.calcTree.items,calcAll);

            var gm = this.form.getGridArray(),grid;
            for( var i = 0,size = gm.length;i < size;i++ ) {
                grid = this.form.getComponent(gm[i].key);

                YIUI.GridSumUtil.evalSum(this.form,grid);

                grid.refreshSelectAll();
            }

            var lvm = this.form.getLVArray(),listview;
            for( var i = 0,size = lvm.length;i < size;i++ ) {
                listview = this.form.getComponent(lvm[i].key);

                listview.refreshSelectAll();
            }

            this.form.removeSysExpVals("IgnoreKeys");

            this.calcAlling = false;
        },

        calcAllItems:function (items,calcAll) {
            var cxt = new View.Context(this.form),
                item,
                com;
            for( var i = 0;item = items[i];i++ ) {
                com = this.form.getComponent(item.source);
                if( !com || com.isSubDetail )
                    continue;

                this.calcExprItemObject(com,item,cxt,calcAll);
            }
        },

        // 计算过程中记录值改变的组件
        status: [],

        // 是否需要检查表达式输入状态,用于提高计算速度
        checkStatus: false,

        // 检查输入是否改变
        checkInputStatus: function(item){
            var changed = false;
            var inputKeys = item.inputKeys;
            for( var i = 0,size = inputKeys.length;i < size;i++ ) {
                if( this.status.indexOf( inputKeys[i] ) != -1 ) {
                    changed = true;
                    break;
                }
            }
            return changed;
        },

        calcExprItemObject: function (com,item,cxt,calcAll) {
            switch (item.objectType) {
            case YIUI.ExprItem_Type.Item:
                if( !this.checkStatus || this.checkInputStatus(item) ) {
                    this.calcHeadItem(com,item,cxt,calcAll);
                }
                break;
            case YIUI.ExprItem_Type.Set:
                switch (com.type){
                case YIUI.CONTROLTYPE.GRID:
                    this.calcGrid(com,cxt,item,calcAll);
                    break;
                case YIUI.CONTROLTYPE.LISTVIEW:
                case YIUI.CONTROLTYPE.LISTLAYOUTVIEW:
                    this.calcListView(com,cxt,item,calcAll);
                    break;
                }
            }
        },

        calcHeadItem:function (com,item,cxt,calcAll) {
            if( item.empty )
                return;
            if( com.type == YIUI.CONTROLTYPE.GRID ){
                var loc = this.form.getCellLocation(item.target);

                cxt.setInSide(true);

                if( loc.areaExpand ) {
                    var areaIndex = cxt.getAreaIndex();
                    if( areaIndex == -1 ) {
                        for( var i = 0;i < loc.rows.length;i++ ) {
                            cxt.setAreaIndex(i);
                            this.impl_calcGridRow(com,cxt,loc.rows[i],item,calcAll);
                        }
                        cxt.setAreaIndex(-1);
                    } else {
                        this.impl_calcGridRow(com,cxt,loc.rows[areaIndex],item,calcAll);
                    }
                } else {
                    this.impl_calcGridRow(com,cxt,loc.row,item,calcAll);
                }

                cxt.setInSide(false);
            } else {
                if( this.needCalc_Com(com,calcAll) ) {
                    var b = com.setValue(this.calcFormulaValue(item,cxt,com.type),true,false);
                    if( this.checkStatus && b ) {
                        this.status.push(item.target);
                    }
                }
            }
        },

        calcListView:function (listView,cxt,item,calcAll) {
            for( var i = 0,count = listView.getRowCount();i < count;i++ ) {
                this.impl_calcListViewRow(listView,cxt,i,item,calcAll);
            }
        },

        impl_calcListViewRow:function (listView,cxt,rowIndex,itemSet,calcAll) {
            if( !itemSet.items )
                return;
            var columnInfo,
                item,
                result;

            cxt.updateLocation(listView.key,rowIndex,-1);

            for( var i = 0;item = itemSet.items[i];i++ ) {
                if( !item.empty ) {
                    columnInfo = listView.getColumnInfo(item.target);
                    if( this.needCalc_listView(columnInfo,calcAll) ) {
                        result = this.calcFormulaValue(item,cxt);
                        if( result != null ) {
                            listView.setValByKey(rowIndex,item.target,result,false);
                        }
                    }
                }
            }
        },

        // 如果第一行所有的表达式都没有计算,直接跳出循环
        calcGrid:function (grid,cxt,item,calcAll) {
            for( var i = 0,rowData,count = grid.getRowCount();i < count;i++ ) {
                rowData = grid.getRowDataAt(i);
                if( rowData.rowType === 'Detail' ) {
                    var processed = this.calcGridRow(grid,cxt,i,item,calcAll);
                    if( !processed ) {
                        break;
                    }
                }
            }
        },

        calcGridRow: function (grid,cxt,rowIndex,itemSet,calcAll) {
            if( !itemSet.items || rowIndex == -1 ) {
                return false;
            }
            var processed = false;
            for( var i = 0,item;item = itemSet.items[i];i++ ) {
                if ( item.empty || item.treeSum ) {
                    continue;
                }
                if( !this.checkStatus || this.checkInputStatus(item) ) {
                    this.impl_calcGridRow(grid,cxt,rowIndex,item,calcAll);
                    processed = true;
                }
            }
            return processed;
        },

        impl_calcGridRow:function (grid,cxt,rowIndex,item,calcAll) {
            var pos = item.pos,
                rowData = grid.getRowDataAt(rowIndex),
                cellData,
                editOpt,
                idx;
            if( pos.columnExpand ) {
                var indexes = this.extractIndexes(cxt,grid,rowIndex,pos.indexes);
                for( var c = 0,length = indexes.length;c < length;c++ ) {
                    idx = indexes[c];
                    if( idx > 0 ) {
                        cellData = rowData.data[idx];
                        editOpt = grid.getCellEditOpt(rowIndex,idx);

                        if( this.needCalc_Cell(grid,rowIndex,idx,editOpt,cellData,calcAll) ) {
                            cxt.setExpandArea(c);
                            cxt.updateLocation(grid.key,rowIndex,idx);
                            var commitValue = rowData.bkmkRow || cellData.bkmkRow;
                            var b = grid.setValueAt(rowIndex,idx,this.calcFormulaValue(item,cxt),commitValue,false);
                            if( this.checkStatus && b ) {
                                this.status.push(item.target);  // 记录改变的,有一个改变,即认为改变
                            }
                        }
                    }
                }
            } else {
                idx = pos.index;
                cellData = rowData.data[idx];
                editOpt = grid.getCellEditOpt(rowIndex,idx);
                if( this.needCalc_Cell(grid,rowIndex,idx,editOpt,cellData,calcAll) ) {
                    cxt.updateLocation(grid.key,rowIndex,-1);
                    var commitValue = rowData.bkmkRow || cellData.bkmkRow || cellData.dimValue;
                    var b = grid.setValueAt(rowIndex,idx,this.calcFormulaValue(item,cxt),commitValue,false);
                    if( this.checkStatus && b ) {
                        this.status.push(item.target); // 记录改变的
                    }
                }
            }
        },

        doCalcGridRow:function (grid,rowIndex,calcAll) {
            var items = this.calcTree.items,
                cxt = new View.Context(this.form),
                item;
            cxt.updateLocation(grid.key,rowIndex,-1);
            for( var i = 0;item = items[i];i++ ) {
                if( item.objectType !== YIUI.ExprItem_Type.Set || item.source !== grid.key )
                    continue;
                this.calcGridRow(grid,cxt,rowIndex,item,calcAll);
            }
        },

        needCalc_Cell:function(grid,ri,ci,metaCell,cellData,calcAll){

            // -1.外部设置参数控制计算范围,优先级最高
            var v = this.form.getSysExpVals("calcAll");
            if( v && YIUI.TypeConvertor.toBoolean(v) ) {
                return true;
            }

            // 1.如果有忽略字段(下推,copyNew),根据忽略字段判断
            var ignoreKeys = this.form.getSysExpVals("IgnoreKeys");
            if( ignoreKeys  ) {
                return ignoreKeys.indexOf(metaCell.key) == -1;
            }

            // 2.常规判断,列出不需要计算的情况
            if( calcAll ) {
                if( this.calcAlling && !grid.isNullValue(cellData[0]) ) {
                    return false;
                }
            } else {
                if( metaCell.columnKey ) {
                    return false;
                }
            }

            return true;
        },

        needCalc_Com:function (com,calcAll) {

            // -1.外部设置参数控制计算范围,优先级最高
            var v = this.form.getSysExpVals("calcAll");
            if( v && YIUI.TypeConvertor.toBoolean(v) ) {
                return true;
            }

            // 1.如果有忽略字段(下推,copyNew),根据忽略字段判断
            var ignoreKeys = this.form.getSysExpVals("IgnoreKeys");
            if( ignoreKeys && ignoreKeys.indexOf(com.key) != -1 ) {
                return false;
            }

            // 2.如果是查询字段,根据是否初始化值判断
            if( com.getMetaObj().condition ) {
                return this.calcAlling ? !com.initValue : calcAll;
            }

            // 3.常规判断,列出不需要计算的情况
            if( calcAll ) {
                if( this.calcAlling && !com.isNull() ) {
                    return false;
                }
            } else {
                if( com.hasDataBinding() || com.bindingCellKey ) {
                    return false;
                }
            }

            return true;
        },

        needCalc_listView:function (columnInfo,calcAll) {

            // -1.外部设置参数控制计算范围,优先级最高
            var v = this.form.getSysExpVals("calcAll");
            if( v && YIUI.TypeConvertor.toBoolean(v) ) {
                return true;
            }

            // 1.如果有忽略字段(下推,copyNew),根据忽略字段判断
            var ignoreKeys = this.form.getSysExpVals("IgnoreKeys");
            if( ignoreKeys && ignoreKeys.indexOf(columnInfo.key) != -1 ) {
                return false;
            }

            // 2.常规判断,不计算全部的情况下,有数据绑定,不计算
            if( !calcAll ) {
                if( columnInfo.columnKey ) {
                    return false;
                }
            }
            return true;
        },

        doCalcOneRow:function (com,rowIndex) {
            if( com.type === YIUI.CONTROLTYPE.GRID ) {
                var rowData = com.getRowDataAt(rowIndex);
                this.doCalcGridRow(com,rowIndex,rowData.bkmkRow == null);
            } else {
                this.doCalcListViewRow(com,rowIndex,false);// ListView没有空行,只计算没有数据绑定的
            }
        },

        doCalcListViewRow:function (listView,rowIndex,calcAll) {
            var items = this.calcTree.items,
                cxt = new View.Context(this.form);
            cxt.updateLocation(listView.key,rowIndex,-1);
            for( var i = 0,exp;exp = items[i];i++ ) {
                if( exp.objectType !== YIUI.ExprItem_Type.Set || exp.source !== listView.key )
                    continue;
                this.impl_calcListViewRow(listView,cxt,rowIndex,exp,calcAll);
            }
        },

        valueChanged:function (comp) {
            var items = this.calcTree.affectItems[comp.key];

            if( !items )
                return;

            this.checkStatus = true;
            this.status.push(comp.key);

            var cxt = new View.Context(this.form),
                item,
                com;
            for( var i = 0;item = items[i];i++ ) {
                com = this.form.getComponent(item.source);
                if( !com ) continue;

                this.calcExprItemObject(com,item,cxt,true);
            }
            this.checkStatus = false;
            this.status.length = 0;
        },

        reCalcComponent:function (com) {

            this.calcAllItems(this.getGridItems(com),false);

            if( com.type === YIUI.CONTROLTYPE.GRID ) {
                YIUI.GridSumUtil.evalSum(this.form,com);
            }

            this.form.removeSysExpVals("IgnoreKeys");
        },

        getGridItems:function (com) {
            var items = this.calcTree.items,
                item,
                _items = [];

            for( var i = 0;item = items[i];i++ ) {
                if( item.source == com.key &&
                    item.objectType == YIUI.ExprItem_Type.Set )
                    _items.push(item);
            }

            if( com.type === YIUI.CONTROLTYPE.GRID ) {
                _items = _items.concat(this.getGridAffectItems(com));
            }

            _items.sort(function (o1,o2) {
                return o1.order - o2.order;
            });

            return _items;
        },

        getGridAffectItems:function (grid) {
            var items;
            if( this.calcTree.gridAffectItems ) {
                items = this.calcTree.gridAffectItems[grid.key];
            }

            if( items ) {
                return items;
            }

            items = [];

            if( !this.calcTree.gridAffectItems ) {
                this.calcTree.gridAffectItems = {};
            }

            this.calcTree.gridAffectItems[grid.key] = items;

            var metaRow = grid.getDetailMetaRow();
            if( !metaRow ) {
                return items;
            }

            var cells = metaRow.cells,
                metaCell,
                _items,
                _item,
                affectItems = this.calcTree.affectItems;

            for( var i = 0;metaCell = cells[i];i++ ) {
                _items = affectItems[metaCell.key];
                if( _items ) {
                    for( var k = 0;_item = _items[k];k++ ) {
                        if( _item.source == grid.key &&
                            _item.objectType == YIUI.ExprItem_Type.Set )
                            continue;

                        items.push(_item);
                    }
                }
            }

            items.sort(function (o1,o2) {
                return o1.order - o2.order;
            });

            return items;
        },

        cellValueChanged:function (grid,rowIndex,colIndex) {

            // 1.树形表格层级汇总,需要每一个修改的行算一遍
            var indexes;
            if( grid.hasTree ) {
                indexes = YIUI.GridSumUtil.evalAffectTreeSum(this.form,grid,rowIndex,colIndex);
            }

            // 2.计算依赖
            var editOpt = grid.getCellEditOpt(rowIndex,colIndex),
                items = this.calcTree.affectItems[editOpt.key];
            if( !items ) {
                return;
            }

            this.checkStatus = true;
            this.status.push(editOpt.key);

            var rowData = grid.getRowDataAt(rowIndex),
                metaRow = grid.getMetaObj().rows[rowData.metaRowIndex];

            var cxt = new View.Context(this.form),
                item,
                com;

            cxt.updateLocation(grid.key,rowIndex,colIndex);
            cxt.setColIndex(colIndex);
            cxt.setAreaIndex(metaRow.areaIndex);

            for( var i = 0;item = items[i];i++ ) {
                com = this.form.getComponent(item.source);
                switch (item.objectType){
                case YIUI.ExprItem_Type.Item:
                    this.calcHeadItem(com,item,cxt,true);
                    break;
                case YIUI.ExprItem_Type.Set:
                    if( com.key === grid.key ) {
                        // 当前行
                        this.calcGridRow(com,cxt,rowIndex,item,true);

                        // 向上计算
                        if( indexes ) {
                            for( var k = 0,size = indexes.length;k < size;k++ ) {
                                this.calcGridRow(com,cxt,indexes[k],item,true);
                            }
                        }
                    } else if ( YIUI.SubDetailUtil.isSubDetail(this.form,grid,com.key) ) {
                        this.calcGridRow(com,cxt,com.getFocusRowIndex(),item,true);
                    } else {
                        this.calcGrid(com,cxt,item,true);
                    }
                    break;
                default:
                    break;
                }
            }
            this.checkStatus = false;
            this.status.length = 0;
        },

        doAfterDeleteRow:function (grid) {
            var items = this.getGridAffectItems(grid);

            var cxt = new View.Context(this.form),
                item,
                com;
            for( var i = 0;item = items[i];i++ ) {
                com = this.form.getComponent(item.source);
                switch (item.objectType){
                case YIUI.ExprItem_Type.Item:
                    this.calcHeadItem(com,item,cxt,true);
                    break;
                case YIUI.ExprItem_Type.Set:
                    if( YIUI.SubDetailUtil.isSubDetail(this.form,grid,com.key) ) {
                        this.calcGridRow(com,cxt,com.getFocusRowIndex(),item,true);
                    }
                    break;
                }
            }
            YIUI.GridSumUtil.evalSum(this.form,grid);
        },

        calcSubDetail:function (gridKey) {
            var items = this.calcTree.items,
                cxt = new View.Context(this.form),
                item,
                com;
            for( var i = 0;item = items[i];i++ ) {
                com = this.form.getComponent(item.source);
                if( !com || !YIUI.SubDetailUtil.isSubDetail(this.form,com,gridKey) )
                    continue;

                this.calcExprItemObject(com,item,cxt,false);
            }

            var gm = this.form.getGridArray(),
                grid;
            for( var i = 0,size = gm.length;i < size;i++ ) {
                grid = this.form.getComponent(gm[i].key);

                if( !YIUI.SubDetailUtil.isSubDetail(this.form,grid,gridKey))
                    continue;

                YIUI.GridSumUtil.evalSum(this.form,grid);

                grid.refreshSelectAll();
            }
        }
    });
})();