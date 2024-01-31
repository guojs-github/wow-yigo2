/**
 * Created by 陈瑞 on 2009/7/20.
 */
var View = View || {};

(function () {

    View.Context = function(form) {
        this.form = form;
        this.parent = null;
        this.locationMap = {};
        this.inSide = false;
        this.areaIndex = -1;
        this.expandArea = -1;
        this.colIndex = -1;
        this.tag = null;
        this.excpAction = null;
        this.container = null;
        this._grids = [];

        this.colIndex = -1;

        if( form ) {
            var grids = form.getGridArray(),grid;
            for( var i = 0,size = grids.length;i < size;i++ ) {
                grid = form.getComponent(grids[i].key);
                this.locationMap[grid.key] = new View.LocationInfo(grid.key,grid.getFocusRowIndex(),-1);
            }
            var lvs = form.getLVArray(),lv;
            for( var i = 0,size = lvs.length;i < size;i++ ) {
                lv = form.getComponent(lvs[i].key);
                this.locationMap[lv.key] = new View.LocationInfo(lv.key,lv.getFocusRowIndex(),-1);
            }
        }
    };

    Lang.impl(View.Context, {
        getForm: function () {
            return this.form;
        },
        setParent: function(parent) {
            this.parent = parent;
        },
        getParent: function() {
            return this.parent;
        },
        setRowIndex: function(rowIndex) {
            this.rowIndex = rowIndex;
        },
        setColIndex: function(colIndex) {
            this.colIndex = colIndex;
        },
        setExpandArea: function (expandArea) {
            this.expandArea = expandArea;
        },
        getExpandArea: function () {
            return this.expandArea;
        },
        setContainer: function (container) {
            this.container = container;
        },
        getContainer: function () {
            return this.container;
        },
        getLoc: function (key) {
            return this.locationMap[key];
        },
        setTag: function (tag) {
            this.tag = tag;
        },
        getTag: function () {
            return this.tag;
        },
        setExpAction: function (action) {
            this.excpAction = action;
        },
        getExpAction: function () {
            return this.excpAction;
        },
        setAreaIndex: function (areaIndex) {
            this.areaIndex = areaIndex;
        },
        getAreaIndex: function () {
            return this.areaIndex;
        },
        setColIndex: function (colIndex) {
            this.colIndex = colIndex;
        },
        getColIndex: function () {
            return this.colIndex;
        },
        updateLocation: function (key,row,column) {
            var loc = this.locationMap[key];
            loc.setRow(row);
            loc.setColumn(column);
        },
        setInSide: function (inSide) {
            this.inSide = inSide;
        },
        inSide: function () {
            return this.inSide();
        },
        getGrids: function () {
            return this._grids;
        },
        addGrid: function (grid) {
            if( this._grids.indexOf(grid) == -1 ) { // 不重复添加,否则刷新慢
                this._grids.push(grid);
            }
        }
    });

    View.LocationInfo = function (key,row,column) {
        this.key = "";
        this.row = row;
        this.column = column;
    }

    Lang.impl(View.LocationInfo,{
        setRow: function (row) {
            this.row = row;
        },
        getRow: function () {
            return this.row;
        },
        setColumn: function (column) {
            this.column = column;
        },
        getColumn: function () {
            return this.column;
        }
    });

    View.UnitContext = function (options) {
        this.gridKey = options.gridKey;
        this.row = options.row;
        this.column = options.column;
    }

    Lang.impl(View.UnitContext,{
        getKey: function () {
            return this.gridKey;
        },
        getRow: function () {
            return this.row;
        },
        getColumn: function () {
            return this.column;
        }
    });

    View.ObjectContext = function (obj) {
        this.obj = obj;
    }

    Lang.impl(View.ObjectContext,{
        setObject: function (obj) {
            this.obj = obj;
        },
        getObject: function () {
            return this.obj;
        }
    });

})();
