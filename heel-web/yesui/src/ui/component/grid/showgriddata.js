/**
 * Created by 陈瑞 on 2018/1/25.
 */
(function () {
    YIUI.ShowGridData = YIUI.extend({
        form: null,
        grid: null,
        init: function (form, grid) {
            this.form = form;
            this.grid = grid;
        },
        load: function (construct) {
            var show;
            if( this.form.type == YIUI.Form_Type.Report ) {
                show = new YIUI.ShowReportGridData(this.form,this.grid);
            } else {
                show = new YIUI.ShowNormalGridData(this.form,this.grid);
            }
            show.load(construct);
        }
    });

    YIUI.ShowNormalGridData = YIUI.extend({
        form: null,
        grid: null,
        init: function (form, grid) {
            this.form = form;
            this.grid = grid;
        },
        load: function (construct) {
            var doc = this.form.getDocument();
            if( doc == null ) {
                return;
            }

            if( this.grid.isSubDetail && !YIUI.SubDetailUtil.filter(this.form,this.grid) ) {
                return;
            }

            var filter = new YIUI.GridFilter(this.form, this.grid);
            filter.filter();

            if( construct ) {
                this.constructGrid();
            }

            var table = doc.getByKey(this.grid.tableKey);
            if (table) {
            	 var rowGroup = new YIUI.GridRowGroup(this.form, this.grid);
               rowGroup.group();
            }

            var builder = new YIUI.GridRowBuilder(this.form, this.grid);
            builder.build();

            YIUI.GridLookupUtil.updateFixPos(this.form,this.grid);

            this.grid.initPageOpts();
            
            this.grid.refreshIndex(); // 需要先刷新rowIDMap

            this.grid.refreshGrid();// 要在这个地方刷新,不然colModel得不到刷新插行报错

            this.grid.mergeCell();

            if( table ) {
                table.clearFilter();
            }
        },

        constructGrid: function () {
            if( this.grid.hasColumnExpand() ) {
                this.grid.dataModel.expandModel.length = 0;

                if( this.grid.hasCellExpand ) {
                    var columnExpand = new YIUI.GridCellExpand(this.form, this.grid);
                    columnExpand.expand();
                } else {
                    var columnExpand = new YIUI.GridColumnExpand(this.form, this.grid);
                    columnExpand.expand();
                }

                YIUI.GridLookupUtil.buildCellLookup(this.form, this.grid);// 更新单元格位置信息

                YIUI.ViewUtil.updateFormulaItemsIndex(this.form, this.grid); // 更新计算表达式位置信息

                this.grid.initLeafColumns();

                this.grid.initDataModel();
            }

            if( this.grid.hasRowAreaExpand ) {
                var areaExpand = new YIUI.GridRowAreaExpand(this.form,this.grid);
                areaExpand.expand();
            }

            YIUI.GridUtil.buildGroupHeaders(this.grid);//重建表头
        }
    });

    YIUI.GridRowBuilder = YIUI.extend({
        form: null,
        grid: null,
        init: function (form, grid) {
            this.form = form;
            this.grid = grid;
        },
        build: function () {

            var self = this;

            var impl_buildMultiple = function () {
                var builder = new YIUI.GridMultiBuilder(self.form,self.grid);
                builder.build();
            }

            var impl_buildNormal = function () {
                self.grid.clearGridData();

                var metaObj = self.grid.getMetaObj(),
                    rowLayer = metaObj.rowLayer,
                    metaRow,
                    rowObject;

                var doc = self.form.getDocument(),
                    table = doc.getByKey(self.grid.tableKey);

                for (var i = 0;rowObject = rowLayer.objectArray[i]; i++) {
                    switch (rowObject.objectType) {
                    case YIUI.MetaGridRowObjectType.ROW:
                        metaRow = metaObj.rows[rowObject.rowIndex];
                        var rowIndex = self.grid.addGridRow(-1, metaRow, null, 0, false);
                        if( metaRow.rowType == 'Fix' ) {
                            self.grid.getHandler().showFixRowData(self.form, self.grid, rowIndex);
                        }
                        break;
                    case YIUI.MetaGridRowObjectType.AREA:
                        var root = self.grid.dataModel.rootBkmk;
                        if( root ) {
                            self.loadGroup(table, root, 0);
                        }
                        break;
                    default:
                        break;
                    }
                }
            }

            if( this.grid.multiple ) {
                impl_buildMultiple();
            } else {
                impl_buildNormal();
            }
        },
        loadGroup:function (table,group,level) {
            var metaGrid = this.grid.getMetaObj(),
                rowObject = group.getMetaGroup(),
                metaRow,
                groupBkmk,
                obj;
            for (var j = 0;obj = rowObject.objectArray[j];j++) {
                switch (obj.objectType) {
                    case YIUI.MetaGridRowObjectType.ROW:
                        metaRow = metaGrid.rows[obj.rowIndex];
                        var index = this.grid.addGridRow(-1, metaRow, null, level, false);

                        var row = this.grid.getRowDataAt(index);
                        row.groupValue = group.groupValue;

                        break;
                    case YIUI.MetaGridRowObjectType.GROUP:
                        for (var k = 0, size = group.getRowCount(); k < size; k++) {
                            level++;
                            groupBkmk = group.getRowAt(k);
                            if( groupBkmk.isLeaf ) {
                                if (this.grid.hasTree) {
                                    var builder = new YIUI.GridRowTreeBuilder(this.form,this.grid);
                                    builder.build(table, groupBkmk);
                                } else if (this.grid.hasRowExpand) {
                                    var builder = new YIUI.GridRowExpandBuilder(this.form,this.grid);
                                    builder.build(table, groupBkmk);
                                } else {
                                    var builder = new YIUI.GridRowSimpleBuilder(this.form,this.grid);
                                    builder.build(groupBkmk, level);
                                }
                            } else {
                                this.loadGroup(table, groupBkmk, level);
                            }
                            level--;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    });

    YIUI.GridRowSimpleBuilder = YIUI.extend({
        form: null,
        grid: null,
        init: function (form, grid) {
            this.form = form;
            this.grid = grid;
        },
        build: function (group, level) {
            var metaGroup = group.getMetaGroup(),
                metaObj = this.grid.getMetaObj(),
                metaRow,
                rowObj;
            for (var i = 0; rowObj = metaGroup.objectArray[i]; i++) {
                metaRow = metaObj.rows[rowObj.rowIndex];
                switch (metaRow.rowType) {
                    case "Group":
                        var index = this.grid.addGridRow(-1, metaRow, null, level, false);

                        var row = this.grid.getRowDataAt(index);
                        row.groupValue = group.groupValue;

                        break;
                    case "Detail":
                        level++;
                        var rowCount = group.getRowCount(),
                            start = 0,
                            end = rowCount;

                        if (this.grid.getMetaObj().pageLoadType == YIUI.PageLoadType.UI) {
                            var curPageIndex = this.grid.pageInfo.curPageIndex,
                                pageRowCount = this.grid.pageInfo.pageRowCount;
                            curPageIndex = curPageIndex == null ? 0 : curPageIndex;
                            start = curPageIndex <= 0 ? 0 : curPageIndex * pageRowCount;
                            end = start + pageRowCount > rowCount ? rowCount : start + pageRowCount;
                        }

                        for (var m = start; m < end; m++) {
                            var rowIndex = this.grid.addGridRow(-1, metaRow, group.getRowAt(m), level, false);
                            this.grid.getHandler().showDetailRowData(this.form, this.grid, rowIndex, metaRow);
                        }
                        level--;
                        break;
                }
            }
        }
    });

    YIUI.GridMultiBuilder = YIUI.extend({
        form: null,
        grid: null,
        init: function (form, grid) {
            this.form = form;
            this.grid = grid;
        },
        build: function (table,group) {

            this.grid.clearGridData();

            var metaObj = this.grid.getMetaObj(),
                rowLayer = metaObj.rowLayer,
                areaIndex = rowLayer.areaIndex,
                rootGroup = rowLayer.objectArray[areaIndex].objectArray[0];

            var count = rootGroup.objectArray.length,
                bkmkMap = this.grid.dataModel.rootBkmk,
                metaGrid = this.grid.getMetaObj(),
                rowIndex,
                rowObj,
                metaRow;

            for( var i = 0;i < count;i++ ) {
                rowObj = rootGroup.objectArray[i];
                if( rowObj.objectType == YIUI.MetaGridRowObjectType.ROW ) {
                    metaRow = metaGrid.rows[rowObj.rowIndex];
                    switch (metaRow.rowType) {
                        case "Fix":
                            rowIndex = this.grid.addGridRow(-1, metaRow, null, 0, false);
                            this.grid.getHandler().showFixRowData(this.form, this.grid, rowIndex);
                            break;
                        case "Detail":
                            var dimValue = metaRow.dimValue;
                            if( !dimValue ) {
                                continue;
                            }
                            var bkmks = bkmkMap.get(dimValue);
                            if( !bkmks ) {
                                continue;
                            }
                            for( var k = 0,size = bkmks.length;k < size;k++ ) {
                                rowIndex = this.grid.addGridRow(-1, metaRow, bkmks[k], 0, false);
                                this.grid.getHandler().showDetailRowData(this.form, this.grid, rowIndex, metaRow);
                            }
                            break;
                        case "Total":
                            this.grid.addGridRow(-1, metaRow, null, 0, false);
                            break;
                    }
                }
            }
        }
    });

    YIUI.GridRowTreeBuilder = YIUI.extend({
        form: null,
        grid: null,
        root: "ROOT",
        init: function (form, grid) {
            this.form = form;
            this.grid = grid;
        },
        build: function (table,group) {
            var tableKey = this.grid.tableKey;
            var rowMap = this.grid.dataModel.rowMap[tableKey];

            var detailRow = this.grid.getDetailMetaRow(),
                rowTree = detailRow.rowTree;

            if( rowTree.content ) {
                this.impl_buildWithCustomData(table,rowMap);
            } else {
                this.impl_buildWithNoCustomData(table,rowMap);
            }
        },
        /**
	    * 有初始数据,需要配置业务关键字,用于定位行
	    */
        impl_buildWithCustomData: function (table,bkmkMap) {
            var detailRow = this.grid.getDetailMetaRow(),
                rowTree = detailRow.rowTree,
                treeIndex = this.grid.treeIndex,
                treeCell = detailRow.cells[treeIndex];

            var content = rowTree.content;
            var cxt = new View.Context(this.form),
                result = this.form.eval(content,cxt);

            if( !result ) {
                return;
            }

            var primaryKeys = YIUI.DataUtil.getPrimaryKeys(table);

            var indexes = [],
                types = [];

            YIUI.DataUtil.getIndexesAndTypes(result,primaryKeys,indexes,types);

            var getMultiKey = function (table) {
                return YIUI.DataUtil.makeMultiKey(table, indexes, types);
            }

            switch (rowTree.treeType) {
                case YIUI.GridTreeType.DICT:

                    var columnKey = treeCell.columnKey,
                        IDMap = {},
                        keys = [];

                    result.beforeFirst();
                    while( result.next() ) {
                        var id = YIUI.TypeConvertor.toLong(result.getByKey(columnKey));
                        
                        var bkmks = IDMap[id];
                        if( !bkmks ) {
                            bkmks = [];
                            IDMap[id] = bkmks;
                        }
                        bkmks.push(new YIUI.DetailRowBkmk(result.getBkmk()));
                        (keys.indexOf(id) == -1) && keys.push(id);
                    }

                    var getParentID = function (item) {
                        var table = item.itemTables[item.mainTableKey];
                        return table.itemRows[0]["ParentID"];
                    };

                    var PIDMap = {},
                        itemKey = treeCell.editOptions.itemKey;

                    var items = new YIUI.DictService(this.form).getItems(itemKey, keys);
                    if( !items ) {
                        return;
                    }

                    var item,parentID,childBkmks;
                    for( var i = 0;item = items[i];i++ ) {
                        parentID = YIUI.TypeConvertor.toLong(getParentID(item));
                        if( parentID == 0 || IDMap[parentID] == null ) {
                            parentID = 0;
                        }
                        childBkmks = PIDMap[parentID];
                        if( !childBkmks ) {
                            childBkmks = [];
                            PIDMap[parentID] = childBkmks;
                        }
                        IDMap[item.oid].forEach(function(bkmk){
                            childBkmks.push(bkmk);
                        });                    
                    }

                    var rootBkmks = PIDMap["0"];
                    if( rootBkmks ) {
                        this.impl_buildTree(PIDMap,bkmkMap,result,columnKey,null,rootBkmks,rowTree,getMultiKey);
                    }
                    break;
                case YIUI.GridTreeType.COMMON:
                    var parent = rowTree.parent,
                        foreign = rowTree.foreign,
                        parSet = [],
                        relationMap = {},
                        parValue,
                        fgnValue;

                    result.beforeFirst();
                    while( result.next() ) {
                        parValue = result.getByKey(parent);
                        parSet.push(parValue);
                    }

                    var childBkmks;
                    result.beforeFirst();
                    while( result.next() ) {
                        parValue = result.getByKey(parent);
                        fgnValue = result.getByKey(foreign);

                        if( !YIUI.TypeConvertor.toBoolean(fgnValue) || parSet.indexOf(fgnValue) == -1 ) {
                            fgnValue = this.root;
                        }

                        childBkmks = relationMap[fgnValue];
                        if( !childBkmks ) {
                            childBkmks = [];
                            relationMap[fgnValue] = childBkmks;
                        }

                        childBkmks.push(new YIUI.DetailRowBkmk(result.getBkmk()));
                    }

                    var rootBkmks = relationMap[this.root];
                    if( rootBkmks ) {
                        this.impl_buildTree(relationMap,bkmkMap,result,parent,null,rootBkmks,rowTree,getMultiKey);
                    }
                    break;
            }
        },
        impl_getLeafBkmk: function () {
            var root = this.grid.dataModel.rootBkmk;

            var getLeaf = function (groupBkmk) {
                var i,
                    size,
                    bkmk,
                    leaf;
                for( i = 0,size = groupBkmk.getRowCount();i < size;i++ ) {
                    bkmk = groupBkmk.getRowAt(i);
                    if( bkmk.isLeaf ) {
                        leaf = bkmk;
                        break;
                    }
                    return getLeaf(bkmk);
                }
                return leaf;
            }

            return getLeaf(root);
        },
        /**
	     * 不需要业务关键字,结构中的视图行就是实际的视图行
	     */
        impl_buildWithNoCustomData: function (table,bkmkMap) { // 需要根据视图行构建
            var detailRow = this.grid.getDetailMetaRow(),
                rowTree = detailRow.rowTree,
                treeIndex = this.grid.treeIndex,
                treeCell = detailRow.cells[treeIndex];

            var root = this.impl_getLeafBkmk(),bkmk,firstBkmk;
            if( root == null ) {
                return;
            }

            switch (rowTree.treeType){
                case YIUI.GridTreeType.DICT:
                    var columnKey = treeCell.columnKey,
                        IDMap = {},
                        keys = [];

                    for( var i = 0,size = root.getRowCount();i < size;i++ ) {
                        bkmk = root.getRowAt(i);
                        if( bkmk.getRowType() == YIUI.IRowBkmk.Expand ) {
                            firstBkmk = bkmk.getAt(0);
                        } else {
                            firstBkmk = bkmk;
                        }
                        table.setByBkmk(firstBkmk.getBookmark());
                        var id = YIUI.TypeConvertor.toLong(table.getByKey(columnKey));
                        
                        var bkmks = IDMap[id];
                        if( !bkmks ) {
                            bkmks = [];
                            IDMap[id] = bkmks;
                        }
                        bkmks.push(bkmk);
                        (keys.indexOf(id) == -1) && keys.push(id);                     
                    }

                    var getParentID = function (item) {
                        var table = item.itemTables[item.mainTableKey],
                            parentID;
                        if (table.tableMode == YIUI.TableMode.HEAD) {
                            parentID = table.itemRows[0]["ParentID"];
                        }
                        return parentID;
                    };

                    var PIDMap = {},
                        itemKey = treeCell.editOptions.itemKey;

                    var items = new YIUI.DictService(this.form).getItems(itemKey, keys);
                    if( !items ) {
                        return;
                    }

                    var item,parentID,childBkmks;
                    for( var i = 0;item = items[i];i++ ) {
                        parentID = YIUI.TypeConvertor.toLong(getParentID(item));
                        if( parentID == 0 || IDMap[parentID] == null ) {
                            parentID = 0;
                        }
                        childBkmks = PIDMap[parentID];
                        if( !childBkmks ) {
                            childBkmks = [];
                            PIDMap[parentID] = childBkmks;
                        }
                        IDMap[item.oid].forEach(function(bkmk){
                            childBkmks.push(bkmk);
                        });
                    }

                    var rootBkmks = PIDMap["0"];
                    if( rootBkmks ) {
                        this.impl_buildTree(PIDMap,bkmkMap,table,columnKey,null,rootBkmks,rowTree);
                    }
                    break;
                case YIUI.GridTreeType.COMMON:
                    var parent = rowTree.parent,
                        foreign = rowTree.foreign,
                        parSet = [],
                        relationMap = {},
                        parValue,
                        fgnValue;

                    for( var i = 0,size = root.getRowCount();i < size;i++ ) {
                        bkmk = root.getRowAt(i);
                        if( bkmk.getRowType() == YIUI.IRowBkmk.Expand ) {
                            firstBkmk = bkmk.getAt(0);
                        } else {
                            firstBkmk = bkmk;
                        }
                        table.setByBkmk(firstBkmk.getBookmark());
                        parValue = table.getByKey(parent);
                        parSet.push(parValue);
                    }

                    var childBkmks;
                    for( var i = 0,size = root.getRowCount();i < size;i++ ) {
                        bkmk = root.getRowAt(i);
                        if( bkmk.getRowType() == YIUI.IRowBkmk.Expand ) {
                            firstBkmk = bkmk.getAt(0);
                        } else {
                            firstBkmk = bkmk;
                        }
                        table.setByBkmk(firstBkmk.getBookmark());
                        parValue = table.getByKey(parent);
                        fgnValue = table.getByKey(foreign);

                        if( !YIUI.TypeConvertor.toBoolean(fgnValue) || parSet.indexOf(fgnValue) == -1 ) {
                            fgnValue = this.root;
                        }

                        childBkmks = relationMap[fgnValue];
                        if( !childBkmks ) {
                            childBkmks = [];
                            relationMap[fgnValue] = childBkmks;
                        }

                        childBkmks.push(bkmk);
                    }

                    var rootBkmks = relationMap[this.root];
                    if( rootBkmks ) {
                        this.impl_buildTree(relationMap,bkmkMap,table,parent,null,rootBkmks,rowTree);
                    }
                    break;
            }
        },
        /** 
         * 没有初始数据的,该bkmk就是实际的行bkmk
         * 有初始数据的,需要根据该行的multiKey寻找对应的行视图
         */
        impl_buildTree: function (relationMap,bkmkMap,table,columnKey,parentRow,bkmks,rowTree,fn) {
            var detailRow = this.grid.getDetailMetaRow(),bkmk,firstBkmk;
            for( var i = 0;bkmk = bkmks[i];i++ ) {

                if( bkmk.getRowType() == YIUI.IRowBkmk.Expand ) {
                    firstBkmk = bkmk.getAt(0);
                } else {
                    firstBkmk = bkmk;
                }

                table.setByBkmk(firstBkmk.getBookmark());
                var mainValue = table.getByKey(columnKey);
                var childBkmks = relationMap[mainValue];

                var rowIndex = this.grid.addGridRow(-1, detailRow, null, 0, false, {
                    treeLevel: parentRow ? parentRow.treeLevel + 1 : 0,
                    isLeaf: !childBkmks,
                    parentRow: parentRow
                });

                var rowData = this.grid.getRowDataAt(rowIndex);

                if( fn ) {
                    var multiKey = fn.call(this,table);
                    rowData.bkmkRow = bkmkMap && bkmkMap.get(multiKey);
                    if( rowData.bkmkRow ) {
                        this.grid.getHandler().showDetailRowData(this.form, this.grid, rowIndex, detailRow);
                    } else {
                        this.grid.getHandler().showRowData(this.form, this.grid, table, rowIndex, detailRow);
                    }
                } else {
                    rowData.bkmkRow = bkmk;
                    this.grid.getHandler().showDetailRowData(this.form, this.grid, rowIndex, detailRow);
                }

                if ( parentRow ) {
                    var childRows = parentRow.childRows;
                    if ( !childRows ) {
                        childRows = [];
                        parentRow.childRows = childRows;
                    }
                    childRows.push(rowData.rowID);
                    parentRow.treeExpand = rowTree.expand || parentRow.treeLevel <= rowTree.expandLevel; // 用来标明打开的状态
                }

                if( childBkmks ) {
                    this.impl_buildTree(relationMap,bkmkMap,table,columnKey,rowData,childBkmks,rowTree,fn);
                }
            }
        }
    });

    YIUI.GridRowExpandBuilder = YIUI.extend({
        form: null,
        grid: null,
        init: function (form, grid) {
            this.form = form;
            this.grid = grid;
        },
        build: function (table,group) {
            var tableKey = this.grid.tableKey;

            var rowMap = this.grid.dataModel.rowMap[tableKey];

            var detailRow = this.grid.getDetailMetaRow(),
                rowExpand = detailRow.rowExpand;

            switch (rowExpand.expandType) {
                case YIUI.RowExpandType.DICT:
                    this.expandByDict(rowExpand,rowMap);
                    break;
                case YIUI.RowExpandType.FORMULA:
                    this.expandByFormula(rowExpand,rowMap);
                    break;
            }
        },
        expandByDict: function (rowExpand,rowMap) {
            var detailRow = this.grid.getDetailMetaRow(),
                expandIndex = this.grid.rowExpandIndex,
                expandCell = detailRow.cells[expandIndex];

            var options = expandCell.editOptions,
                itemKey = options.itemKey,
                filter = YIUI.DictHandler.getDictFilter(this.form, expandCell.key, options.itemFilters, itemKey);

            var items = new YIUI.DictService(this.form).getAllItems(itemKey, filter, YIUI.DictStateMask.Enable);
            if( !items ) {
                return;
            }

            var item,multiKey,bkmkRow,rowIndex;
            for( var i = 0;item = items[i];i++ ) {
                multiKey = new YIUI.MultiKey();
                multiKey.addValue(new YIUI.MultiKeyNode(YIUI.JavaDataType.USER_LONG,item.oid));

                bkmkRow = rowMap.get(multiKey);

                var rowIndex = this.grid.addGridRow(-1, detailRow, bkmkRow, 0, false);
                if( bkmkRow ) {
                    this.grid.getHandler().showDetailRowData(this.form, this.grid, rowIndex, detailRow);
                } else {
                    this.grid.setValueAt(rowIndex, expandIndex, item.oid);
                }
            }
        },
        expandByFormula: function (rowExpand,rowMap) {
            var content = rowExpand.content;
            if( !content ) {
                return;
            }
            var cxt = new View.Context(this.form),
                result = this.form.eval(content,cxt);

            if( !result ) {
                return;
            }

            var table = this.form.getDocument().getByKey(this.grid.tableKey),
                detailRow = this.grid.getDetailMetaRow();

            var primaryKeys = YIUI.DataUtil.getPrimaryKeys(table),
                indexes = [],types = [];

            YIUI.DataUtil.getIndexesAndTypes(result,primaryKeys,indexes,types);

            var multiKey,bkmkRow,rowIndex;
            result.beforeFirst();
            while ( result.next() ) {
                multiKey = YIUI.DataUtil.makeMultiKey(result,indexes,types);

                bkmkRow = rowMap.get(multiKey);

                rowIndex = this.grid.addGridRow(-1, detailRow, bkmkRow, 0, false);
                if( bkmkRow ) {
                    this.grid.getHandler().showDetailRowData(this.form, this.grid, rowIndex, detailRow);
                } else {
                    this.grid.getHandler().showRowData(this.form, this.grid, result, rowIndex, detailRow);
                }
            }
        }
    });

    YIUI.GridFilter = YIUI.extend({
        form: null,
        grid: null,
        init: function (form, grid) {
            this.form = form;
            this.grid = grid;
        },
        filter: function () {
            var filter = this.grid.filter;
            if( !filter ) {
                return;
            }

            var doc = this.form.getDocument(),
                table = doc.getByKey(this.grid.tableKey);

            var self = this;

            var refreshFilterValue = function () {
                var filterValues = filter.filterValues,
                    filterValue,
                    values = [];
                for( var i = 0;filterValue = filterValues[i];i++ ) {
                    switch (filterValue.type){
                        case YIUI.FILTERVALUETYPE.CONST:
                            values.push(filterValue.refValue);
                            break;
                        case YIUI.FILTERVALUETYPE.FORMULA:
                        case YIUI.FILTERVALUETYPE.FIELD:
                            var cxt = new View.Context(self.form);
                            values.push(self.form.eval(filterValue.refValue,cxt));
                            break;
                    }
                }
                return values;
            }

            var compare = function (type,v1,v2,sign) {
                var result,
                    convertor = YIUI.TypeConvertor;

                if( v1 == null || v2 == null ) {
                    if( v1 == null ) {
                        result = (v1 == v2 ? 0 : -1);
                    }
                    if( v2 == null ) {
                        result = 1;
                    }
                } else {
                    switch (type) {
                        case YIUI.JavaDataType.USER_INT:
                        case YIUI.JavaDataType.USER_LONG:
                        case YIUI.JavaDataType.USER_NUMERIC:
                            v1 = convertor.toDecimal(v1);
                            v2 = convertor.toDecimal(v2);
                            result = v1.cmp(v2);
                            break;
                        case YIUI.JavaDataType.USER_STRING:
                            v1 = convertor.toString(v1);
                            v2 = convertor.toString(v2);
                            result = v1.localeCompare(v2);
                            break;
                        case YIUI.JavaDataType.USER_DATETIME:
                            v1 = convertor.toDate(v1);
                            v2 = convertor.toDate(v2);
                            var t1 = v1.getTime(),
                                t2 = v2.getTime();
                            result = ((t1 < t2) ? -1 : ((t1 == t2) ? 0 : 1));
                            break;
                    }
                }

                switch (sign){
                    case "=":
                        return result == 0;
                    case ">":
                        return result < 0;
                    case ">=":
                        return result <= 0;
                    case "<":
                        return result > 0;
                    case "<=":
                        return result >= 0;
                    case "<>":
                    case "!=":
                        return result != 0;
                }
                return false;
            }

            var values = refreshFilterValue();

            table.setFilterEval(function (table, pos) {
                var fValue,
                    fieldKey,
                    dataType;
                for( var i = 0;fValue = filter.filterValues[i];i++ ) {
                    fieldKey = fValue.fieldKey;
                    dataType = fValue.dataType;
                    if( dataType == -1 ) {
                        dataType = table.getColByKey(fieldKey).type;
                    }
                    dataType = YIUI.DataUtil.dataType2JavaDataType(dataType);
                    if( compare(dataType,values[i],table.getByKey(fieldKey),fValue.sign) ) {
                        if( filter.sign == 'OR' ) {
                            return true;
                        }
                    } else {
                        if( filter.sign == 'AND' ) {
                            return false;
                        }
                    }
                }
                return filter.sign == 'AND' ? true : false;
            });
            table.filter();
        }
    });

    YIUI.ShowReportGridData = YIUI.extend({
        form: null,
        grid: null,
        init: function (form, grid) {
            this.form = form;
            this.grid = grid;
        },
        load: function (construct) {
            var doc = this.form.getDocument();
            if (doc == null) {
                return;
            }

            if( this.grid.isSubDetail && !YIUI.SubDetailUtil.filter(this.form,this.grid) ) {
                return;
            }

            var filter = new YIUI.GridFilter(this.form, this.grid);
            filter.filter();

            if (construct) {
                this.constructGrid();
            }
            
            var table = doc.getByKey(this.grid.tableKey);
            if (table) {
            	 var rowGroup = new YIUI.GridRowGroup(this.form, this.grid);
               rowGroup.group();
            }

            var builder = new YIUI.ReportRowBuilder(this.form, this.grid);
            builder.build();

            YIUI.GridLookupUtil.updateFixPos(this.form,this.grid);

            this.grid.initPageOpts();
            
            this.grid.refreshIndex(); // 需要先刷新rowIDMap

            this.grid.refreshGrid();// 在这个地方去刷新,不然很多地方需要分别调用

            this.grid.mergeCell();       

            if( table ) {
                table.clearFilter();
            }
        },

        constructGrid: function () {
            if( this.grid.hasColumnExpand() ) {
                this.grid.dataModel.expandModel.length = 0;

                if( this.grid.hasCellExpand ) {
                    var columnExpand = new YIUI.GridCellExpand(this.form, this.grid);
                    columnExpand.expand();
                } else {
                    var columnExpand = new YIUI.GridColumnExpand(this.form, this.grid);
                    columnExpand.expand();
                }

                YIUI.GridLookupUtil.buildCellLookup(this.form, this.grid);// 更新单元格位置信息

                YIUI.ViewUtil.updateFormulaItemsIndex(this.form, this.grid); // 更新计算表达式位置信息

                this.grid.initLeafColumns();

                this.grid.initDataModel();
            }

            if( this.grid.hasRowAreaExpand ) {
                var areaExpand = new YIUI.GridRowAreaExpand(this.form,this.grid);
                areaExpand.expand();
            }

            YIUI.GridUtil.buildGroupHeaders(this.grid);//重建表头
        }
    });

    YIUI.ReportRowBuilder = YIUI.extend({
        form: null,
        grid: null,
        init: function (form, grid) {
            this.form = form;
            this.grid = grid;
        },
        build: function () {

            var self = this;

            var impl_buildMultiple = function () {
                var builder = new YIUI.GridMultiBuilder(self.form,self.grid);
                builder.build();
            }

            var impl_buildNormal = function () {
                self.grid.clearGridData();

                var metaObj = self.grid.getMetaObj(),
                    rowLayer = metaObj.rowLayer,
                    metaRow,
                    rowObject;

                var doc = self.form.getDocument(),
                    table = doc.getByKey(self.grid.tableKey);

                for (var i = 0;rowObject = rowLayer.objectArray[i]; i++) {
                    switch (rowObject.objectType) {
                        case YIUI.MetaGridRowObjectType.ROW:
                            metaRow = metaObj.rows[rowObject.rowIndex];
                            var rowIndex = self.grid.addGridRow(-1, metaRow, null, 0, false);
                            if( metaRow.rowType == 'Fix' ) {
                                self.grid.getHandler().showFixRowData(self.form, self.grid, rowIndex);
                            }
                            break;
                        case YIUI.MetaGridRowObjectType.AREA:
                            var root = self.grid.dataModel.rootBkmk;
                            if( root ) {
                                self.loadGroup(table, root, 0);
                            }
                            break;
                        default:
                            break;
                    }
                }
            }

            if( this.grid.multiple ) {
                impl_buildMultiple();
            } else {
                impl_buildNormal();
            }
        },
        loadGroup:function (table,group,level) {
            var metaGrid = this.grid.getMetaObj(),
                rowObject = group.getMetaGroup(),
                metaRow,
                groupBkmk,
                obj;
            for (var j = 0;obj = rowObject.objectArray[j];j++) {
                switch (obj.objectType) {
                    case YIUI.MetaGridRowObjectType.ROW:
                        metaRow = metaGrid.rows[obj.rowIndex];
                        var index = this.grid.addGridRow(-1, metaRow, null, level, false);

                        var row = this.grid.getRowDataAt(index);
                        row.groupValue = group.groupValue;

                        break;
                    case YIUI.MetaGridRowObjectType.GROUP:
                        for (var k = 0, size = group.getRowCount(); k < size; k++) {
                            level++;
                            groupBkmk = group.getRowAt(k);
                            if( groupBkmk.isLeaf ) {
                                if (this.grid.hasTree) {
                                    var builder = new YIUI.ReportTreeBuilder(this.form,this.grid);
                                    builder.build(table, groupBkmk);
                                } else if (this.grid.hasRowExpand) {
                                    var builder = new YIUI.ReportExpandBuilder(this.form,this.grid);
                                    builder.build(table, groupBkmk);
                                } else {
                                    var builder = new YIUI.ReportSimpleBuilder(this.form,this.grid);
                                    builder.build(groupBkmk, level);
                                }
                            } else {
                                this.loadGroup(table, groupBkmk, level);
                            }
                            level--;
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    });

    YIUI.ReportSimpleBuilder = YIUI.extend({
        form: null,
        grid: null,
        init: function (form, grid) {
            this.form = form;
            this.grid = grid;
        },
        build: function (group, level) {
            var metaGroup = group.getMetaGroup(),
                metaObj = this.grid.getMetaObj(),
                metaRow,
                rowObj;
            for (var i = 0; rowObj = metaGroup.objectArray[i]; i++) {
                metaRow = metaObj.rows[rowObj.rowIndex];
                switch (metaRow.rowType) {
                    case "Group":
                        var index = this.grid.addGridRow(-1, metaRow, null, level, false);

                        var row = this.grid.getRowDataAt(index);
                        row.groupValue = group.groupValue;

                        break;
                    case "Detail":
                        level++;
                        var rowCount = group.getRowCount(),
                            start = 0,
                            end = rowCount;

                        if (this.grid.getMetaObj().pageLoadType == YIUI.PageLoadType.UI) {
                            var curPageIndex = this.grid.pageInfo.curPageIndex,
                                pageRowCount = this.grid.pageInfo.pageRowCount;
                            curPageIndex = curPageIndex == null ? 0 : curPageIndex;
                            start = curPageIndex <= 0 ? 0 : curPageIndex * pageRowCount;
                            end = start + pageRowCount > rowCount ? rowCount : start + pageRowCount;
                        }

                        for (var m = start; m < end; m++) {
                            var rowIndex = this.grid.addGridRow(-1, metaRow, group.getRowAt(m), level, false);
                            this.grid.getHandler().showDetailRowData(this.form, this.grid, rowIndex, metaRow);
                        }
                        level--;
                        break;
                }
            }
        }
    });

    YIUI.ReportTreeBuilder = YIUI.extend({
        form: null,
        grid: null,
        root: "ROOT",
        init: function (form, grid) {
            this.form = form;
            this.grid = grid;
        },
        build: function (table,group) {
            var tableKey = this.grid.tableKey;
            var rowMap = this.grid.dataModel.rowMap[tableKey];

            var detailRow = this.grid.getDetailMetaRow(),
                rowTree = detailRow.rowTree;

            if( rowTree.content ) {
                this.impl_buildWithCustomData(table,rowMap);
            } else {
                this.impl_buildWithNoCustomData(table,rowMap);
            }
        },
        impl_buildWithCustomData: function (table,bkmkMap) {
            var detailRow = this.grid.getDetailMetaRow(),
                rowTree = detailRow.rowTree,
                treeIndex = this.grid.treeIndex,
                treeCell = detailRow.cells[treeIndex];

            var content = rowTree.content;
            var cxt = new View.Context(this.form),
                result = this.form.eval(content,cxt);

            if( !result ) {
                return;
            }

            var primaryKeys = YIUI.DataUtil.getPrimaryKeys(table);

            var indexes = [],
                types = [];

            YIUI.DataUtil.getIndexesAndTypes(result,primaryKeys,indexes,types);

            var getMultiKey = function (table) {
                return YIUI.DataUtil.makeMultiKey(table, indexes, types);
            }

            switch (rowTree.treeType){
                case YIUI.GridTreeType.DICT:

                    var columnKey = treeCell.columnKey,
                        IDMap = {},
                        keys = [];

                    result.beforeFirst();
                    while( result.next() ) {
                        var id = YIUI.TypeConvertor.toLong(result.getByKey(columnKey));
                        if( id > 0 ) {
                            IDMap[id] = new YIUI.DetailRowBkmk(result.getBkmk());
                            keys.push(id);
                        }
                    }

                    var getParentID = function (item) {
                        var table = item.itemTables[item.mainTableKey];
                        return table.itemRows[0]["ParentID"];
                    };

                    var PIDMap = {},
                        itemKey = treeCell.editOptions.itemKey;

                    var items = new YIUI.DictService(this.form).getItems(itemKey, keys);
                    if( !items ) {
                        return;
                    }

                    var item,parentID,childBkmks;
                    for( var i = 0;item = items[i];i++ ) {
                        parentID = YIUI.TypeConvertor.toLong(getParentID(item));
                        if( parentID == 0 || IDMap[parentID] == null ) {
                            parentID = 0;
                        }
                        childBkmks = PIDMap[parentID];
                        if( !childBkmks ) {
                            childBkmks = [];
                            PIDMap[parentID] = childBkmks;
                        }
                        childBkmks.push(IDMap[item.oid]);
                    }

                    var rootBkmks = PIDMap["0"];
                    if( rootBkmks ) {
                        this.impl_buildTree(PIDMap,bkmkMap,result,columnKey,null,rootBkmks,rowTree,getMultiKey);
                    }
                    break;
                case YIUI.GridTreeType.COMMON:
                    var parent = rowTree.parent,
                        foreign = rowTree.foreign,
                        IDMap = {},
                        relationMap = {},
                        parValue,
                        fgnValue;

                    result.beforeFirst();
                    while( result.next() ) {
                        parValue = result.getByKey(parent);
                        IDMap[parValue] = new YIUI.DetailRowBkmk(result.getBkmk());
                    }

                    var childBkmks;
                    result.beforeFirst();
                    while( result.next() ) {
                        parValue = result.getByKey(parent);
                        fgnValue = result.getByKey(foreign);

                        if( !YIUI.TypeConvertor.toBoolean(fgnValue) || IDMap[fgnValue] == null ) {
                            fgnValue = this.root;
                        }

                        childBkmks = relationMap[fgnValue];
                        if( !childBkmks ) {
                            childBkmks = [];
                            relationMap[fgnValue] = childBkmks;
                        }

                        childBkmks.push(IDMap[parValue]);
                    }

                    var userDataType = result.getColByKey(parent).getUserType();

                    var rootBkmks = relationMap[this.root];
                    if( rootBkmks ) {
                        this.impl_buildTree(relationMap,bkmkMap,result,parent,null,rootBkmks,rowTree,getMultiKey);
                    }
                    break;
            }
        },
        impl_getLeafBkmk: function () {
            var root = this.grid.dataModel.rootBkmk;

            var getLeaf = function (groupBkmk) {
                var i,
                    size,
                    bkmk,
                    leaf;
                for( i = 0,size = groupBkmk.getRowCount();i < size;i++ ) {
                    bkmk = groupBkmk.getRowAt(i);
                    if( bkmk.isLeaf ) {
                        leaf = bkmk;
                        break;
                    }
                    return getLeaf(bkmk);
                }
                return leaf;
            }

            return getLeaf(root);
        },
        impl_buildWithNoCustomData: function (table,bkmkMap) { // 需要根据视图行构建
            var detailRow = this.grid.getDetailMetaRow(),
                rowTree = detailRow.rowTree,
                treeIndex = this.grid.treeIndex,
                treeCell = detailRow.cells[treeIndex];

            var root = this.impl_getLeafBkmk(),bkmk,firstBkmk;
            if( root == null ) {
                return;
            }

            var primaryKeys = YIUI.DataUtil.getPrimaryKeys(table);

            var indexes = [],
                types = [];

            YIUI.DataUtil.getIndexesAndTypes(table,primaryKeys,indexes,types);

            var getMultiKey = function (table) {
                return YIUI.DataUtil.makeMultiKey(table, indexes, types);
            }

            switch (rowTree.treeType){
                case YIUI.GridTreeType.DICT:
                    var columnKey = treeCell.columnKey,
                        IDMap = {},
                        keys = [];

                    for( var i = 0,size = root.getRowCount();i < size;i++ ) {
                        bkmk = root.getRowAt(i);
                        if( bkmk.getRowType() == YIUI.IRowBkmk.Expand ) {
                            firstBkmk = bkmk.getAt(0);
                        } else {
                            firstBkmk = bkmk;
                        }
                        table.setByBkmk(firstBkmk.getBookmark());
                        var id = YIUI.TypeConvertor.toLong(table.getByKey(columnKey));
                        if( id > 0 ) {
                            IDMap[id] = bkmk;
                            keys.push(id);
                        }
                    }

                    var getParentID = function (item) {
                        var table = item.itemTables[item.mainTableKey],
                            parentID;
                        if (table.tableMode == YIUI.TableMode.HEAD) {
                            parentID = table.itemRows[0]["ParentID"];
                        }
                        return parentID;
                    };

                    var PIDMap = {},
                        itemKey = treeCell.editOptions.itemKey;

                    var items = new YIUI.DictService(this.form).getItems(itemKey, keys);
                    if( !items ) {
                        return;
                    }

                    var item,parentID,childBkmks;
                    for( var i = 0;item = items[i];i++ ) {
                        parentID = YIUI.TypeConvertor.toLong(getParentID(item));
                        if( parentID == 0 || IDMap[parentID] == null ) {
                            parentID = 0;
                        }
                        childBkmks = PIDMap[parentID];
                        if( !childBkmks ) {
                            childBkmks = [];
                            PIDMap[parentID] = childBkmks;
                        }
                        childBkmks.push(IDMap[item.oid]);
                    }

                    var rootBkmks = PIDMap["0"];
                    if( rootBkmks ) {
                        this.impl_buildTree(PIDMap,bkmkMap,table,columnKey,null,rootBkmks,rowTree,getMultiKey);
                    }
                    break;
                case YIUI.GridTreeType.COMMON:
                    var parent = rowTree.parent,
                        foreign = rowTree.foreign,
                        IDMap = {},
                        relationMap = {},
                        parValue,
                        fgnValue;

                    for( var i = 0,size = root.getRowCount();i < size;i++ ) {
                        bkmk = root.getRowAt(i);
                        if( bkmk.getRowType() == YIUI.IRowBkmk.Expand ) {
                            firstBkmk = bkmk.getAt(0);
                        } else {
                            firstBkmk = bkmk;
                        }
                        table.setByBkmk(firstBkmk.getBookmark());
                        parValue = table.getByKey(parent);
                        IDMap[parValue] = bkmk;
                    }

                    var childBkmks;
                    for( var i = 0,size = root.getRowCount();i < size;i++ ) {
                        bkmk = root.getRowAt(i);
                        if( bkmk.getRowType() == YIUI.IRowBkmk.Expand ) {
                            firstBkmk = bkmk.getAt(0);
                        } else {
                            firstBkmk = bkmk;
                        }
                        table.setByBkmk(firstBkmk.getBookmark());
                        parValue = table.getByKey(parent);
                        fgnValue = table.getByKey(foreign);

                        if( !YIUI.TypeConvertor.toBoolean(fgnValue) || IDMap[fgnValue] == null ) {
                            fgnValue = this.root;
                        }

                        childBkmks = relationMap[fgnValue];
                        if( !childBkmks ) {
                            childBkmks = [];
                            relationMap[fgnValue] = childBkmks;
                        }

                        childBkmks.push(IDMap[parValue]);
                    }

                    var rootBkmks = relationMap[this.root];
                    if( rootBkmks ) {
                        this.impl_buildTree(relationMap,bkmkMap,table,parent,null,rootBkmks,rowTree,getMultiKey);
                    }
                    break;
            }
        },
        impl_buildTree: function (relationMap,bkmkMap,table,columnKey,parentRow,bkmks,rowTree,fn) {
            var detailRow = this.grid.getDetailMetaRow(),bkmk,firstBkmk;
            for( var i = 0;bkmk = bkmks[i];i++ ) {

                if( bkmk.getRowType() == YIUI.IRowBkmk.Expand ) {
                    firstBkmk = bkmk.getAt(0);
                } else {
                    firstBkmk = bkmk;
                }

                table.setByBkmk(firstBkmk.getBookmark());

                var multiKey = fn.call(this,table);

                var bkmkRow = bkmkMap.get(multiKey),
                    treeLevel = parentRow ? parentRow.treeLevel + 1 : 0;

                var mainValue = table.getByKey(columnKey);
                var childBkmks = relationMap[mainValue];

                var rowIndex = this.grid.addGridRow(-1, detailRow, bkmkRow, 0, false, {
                    treeLevel: treeLevel,
                    isLeaf: !childBkmks,
                    parentRow: parentRow
                });

                var rowData = this.grid.getRowDataAt(rowIndex);

                if ( parentRow ) {
                    var childRows = parentRow.childRows;
                    if ( !childRows ) {
                        childRows = [];
                        parentRow.childRows = childRows;
                    }
                    childRows.push(rowData.rowID);
                    parentRow.treeExpand = rowTree.expand || parentRow.treeLevel <= rowTree.expandLevel;;
                }

                if( bkmkRow ) {
                    this.grid.getHandler().showDetailRowData(this.form, this.grid, rowIndex, detailRow);
                } else {
                    this.grid.getHandler().showRowData(this.form, this.grid, table, rowIndex, detailRow);
                }

                if( childBkmks ) {
                    this.impl_buildTree(relationMap,bkmkMap,table,columnKey,rowData,childBkmks,rowTree,fn);
                }
            }
        }
    });

    YIUI.ReportExpandBuilder = YIUI.extend({
        form: null,
        grid: null,
        init: function (form, grid) {
            this.form = form;
            this.grid = grid;
        },
        build: function (table,group) {
            var tableKey = this.grid.tableKey;

            var rowMap = this.grid.dataModel.rowMap[tableKey];

            var detailRow = this.grid.getDetailMetaRow(),
                rowExpand = detailRow.rowExpand;

            switch (rowExpand.expandType) {
                case YIUI.RowExpandType.DICT:
                    this.expandByDict(rowExpand,rowMap);
                    break;
                case YIUI.RowExpandType.FORMULA:
                    this.expandByFormula(rowExpand,rowMap);
                    break;
            }
        },
        expandByDict: function (rowExpand,rowMap) {
            var detailRow = this.grid.getDetailMetaRow(),
                expandIndex = this.grid.rowExpandIndex,
                expandCell = detailRow.cells[expandIndex];

            var options = expandCell.editOptions,
                itemKey = options.itemKey,
                filter = YIUI.DictHandler.getDictFilter(this.form, expandCell.key, options.itemFilters, itemKey);

            var items = new YIUI.DictService(this.form).getAllItems(itemKey, filter, YIUI.DictStateMask.Enable);
            if( !items ) {
                return;
            }

            var item,multiKey,bkmkRow,rowIndex;
            for( var i = 0;item = items[i];i++ ) {
                multiKey = new YIUI.MultiKey();
                multiKey.addValue(new YIUI.MultiKeyNode(YIUI.JavaDataType.USER_LONG,item.oid));

                bkmkRow = rowMap.get(multiKey);

                var rowIndex = this.grid.addGridRow(-1, detailRow, bkmkRow, 0, false);

                if( bkmkRow ) {
                    this.grid.getHandler().showDetailRowData(this.form, this.grid, rowIndex, detailRow);
                } else {
                    this.grid.setValueAt(rowIndex, expandIndex, item.oid);
                }
            }
        },
        expandByFormula: function (rowExpand,rowMap) {
            var content = rowExpand.content;
            if( !content ) {
                return;
            }
            var cxt = new View.Context(this.form),
                result = this.form.eval(content,cxt);

            if( !result ) {
                return;
            }

            var table = this.form.getDocument().getByKey(this.grid.tableKey),
                detailRow = this.grid.getDetailMetaRow();

            var primaryKeys = YIUI.DataUtil.getPrimaryKeys(table),
                indexes = [],types = [];

            YIUI.DataUtil.getIndexesAndTypes(result,primaryKeys,indexes,types);

            var multiKey,bkmkRow,rowIndex;
            result.beforeFirst();
            while ( result.next() ) {
                multiKey = YIUI.DataUtil.makeMultiKey(result,indexes,types);

                bkmkRow = rowMap.get(multiKey);

                rowIndex = this.grid.addGridRow(-1, detailRow, bkmkRow, 0, false);

                if( bkmkRow ) {
                    this.grid.getHandler().showDetailRowData(this.form, this.grid, rowIndex, detailRow);
                } else {
                    this.grid.getHandler().showRowData(this.form, this.grid, result, rowIndex);
                }
            }
        }
    });
})();

YIUI.GridCellMerger = (function () {

    var fillFixMergeInfo = function (grid,ri,ci,rowspan,colspan) {
        var cellData,
            rowType,
            curType;
        for( var i = 0;i < rowspan;i++ ) {
            rowType = grid.getRowDataAt(ri + i).rowType;
            if( i > 0 && rowType !== curType ) {
                throw new Error("合并单元格配置错误");
            }
            for( var j = 0;j < colspan;j++ ) {
                cellData = grid.getCellDataAt(ri + i,ci + j);
                if( i == 0 && j == 0 ) {
                    cellData.isMerged = true;
                    cellData.isMergedHead = true;
                    cellData.rowspan = rowspan;
                    cellData.colspan = colspan;
                } else {
                    cellData.isMerged = true;
                    cellData.isMergedHead = false;
                    cellData.rowspan = i;
                    cellData.colspan = j;
                }
            }
            curType = rowType;
        }
    }

    var fillDetailMergeInfo = function (grid,ci,rowCount,mergeGroup,fn) {
        var rowFlag = -1,row,headCell,bodyCell,orgKey,curKey;

        var reset = function () { // 重置信息
          rowFlag = -1;
          headCell = null;
          bodyCell = null;
          orgKey = null;
          curKey = null;
        }

        var checkMerge = function (rowData) {
          if( row.rowType == 'Group' ) {
              if( mergeGroup ) { // 如果合并分组行
                  if( rowFlag == -1 ) { // 初始化合并头信息
                      rowFlag = 1;
                      headCell = grid.getCellDataAt(i,ci);
                  } else { // 获取比较单元格
                      bodyCell = grid.getCellDataAt(i,ci);
                  }
              } else { // 不合并重置,当前合并逻辑结束
                 reset();
              }
          } else if ( row.rowType == 'Detail' ) {
             if( rowFlag == -1 ) { // 初始化合并头信息
                 rowFlag = 1;
                 headCell = grid.getCellDataAt(i,ci);
                 if( fn ) {
                    orgKey = fn(row);
                 }
             } else { // 获取比较单元格
                 bodyCell = grid.getCellDataAt(i,ci);
                 if( fn ) {
                     curKey = fn(row);
                 }
             }
          } else {
             reset(); // 非分组或者明细行,重置
          }
        }

        for( var i = 0;i < rowCount;i++ ) {
            row = grid.getRowDataAt(i);

            checkMerge(row);

            if( !headCell || !bodyCell ) { // 没有获取比较单元格信息
                continue;
            }

            // 分组合并,直接处理信息,明细合并,先比较值
            if( row.rowType == 'Group' || (grid.checkEquals(headCell[0],bodyCell[0]) && (!fn || curKey.equals(orgKey) )) ) {
                if( rowFlag == 1 ) {
                    headCell.isMerged = true;
                    headCell.isMergedHead = true;
                }

                headCell.rowspan = ++rowFlag;
                headCell.colspan = 1;

                bodyCell.isMerged = true;
                bodyCell.isMergedHead = false;
                bodyCell.rowspan = headCell.rowspan - 1;
                bodyCell.colspan = 0;
            } else { // 明细比较不通过,开始新的合并逻辑
               reset();
               checkMerge(row);
            }
        }
    }

    // 合并固定行和单元格拓展(也是固定行拓展)
    var mergeFixAndExpand = function (grid) {
        if( grid.hasFixCellMerge || grid.hasCellExpand ) {
            var metaGrid = grid.getMetaObj(), rowData, metaRow, metaCell;
            for( var i = 0,size = grid.getRowCount();i < size;i++ ) {
                rowData = grid.getRowDataAt(i);
                if( rowData.rowType == 'Detail' ) break;
                metaRow = metaGrid.rows[rowData.metaRowIndex];
                for( var k = 0,length = metaRow.cells.length;k < length;k++ ) {
                    metaCell = metaRow.cells[k];
                    if( metaCell.isMerged && metaCell.isMergedHead ) {
                        fillFixMergeInfo(grid,i,k,metaCell.rowspan,metaCell.colspan);
                    }
                }
            }
        }
    }

    // 根据分组字段和单元格标识做合并
    var mergeDetailCell = function (grid,cellKeys,groupKeys) {
        if( cellKeys.length == 0 ) return;
        var loc,metaCell,
            rowCount = grid.getRowCount(),
            metaRow = grid.getDetailMetaRow();

        var multiKeyFn,form = YIUI.FormStack.getForm(grid.ofFormID);
        if( groupKeys && groupKeys.length > 0 ) {
          var table = form.getDocument().getByKey(grid.tableKey);
          var indexes = [],types = [],columnKeys = [];
          groupKeys.forEach(function (key) {
             loc = form.getCellLocation(key);
             metaCell = metaRow.cells[loc.column];
             metaCell.columnKey && columnKeys.push(metaCell.columnKey);
          });
          YIUI.DataUtil.getIndexesAndTypes(table,columnKeys,indexes,types);
          multiKeyFn = function (row) {
              if( !row.bkmkRow ) return null;

              table.setByBkmk(row.bkmkRow.getBookmark());

              return YIUI.DataUtil.makeMultiKey(table, indexes, types);
          }
        }

        for( var i = 0,size = cellKeys.length;i < size;i++ ) {
            loc = form.getCellLocation(cellKeys[i]);
            if( !loc ) continue;
            metaCell = metaRow.cells[loc.column];
            fillDetailMergeInfo(grid,loc.column,rowCount,metaCell.mergeGroup,multiKeyFn);
        }

        grid.hasDetailCellMerge = true; // 设置合并标识,函数时需要
    }

    var mergeCell = function (grid,cellKeys,groupKeys) {

        mergeFixAndExpand(grid);

        mergeDetailCell(grid,cellKeys,groupKeys);
    }

    return {
        mergeCell: mergeCell
    }
})();