var OBJLOOP = OBJLOOP || {};
(function () {
    OBJLOOP.DataTableLoop = function (table) {
        this.table = table;
    };
    Lang.impl(OBJLOOP.DataTableLoop, {
        hasNext: function () {
            return this.table.getRowCount() > 0 && !this.table.isLast();
        },
        next: function () {
            this.table.next();
        },
        clean: function () {

        }
    });
    OBJLOOP.GridLoop = function (cxt, grid, includeEmptyRow) {
        this.total = 0;
        this.pos = -1;
        this.context = cxt;
        this.includeEmptyRow = includeEmptyRow;
        this.grid = grid;
        this.count = 0;

        var row;
        for (var i = 0, tmpCount = grid.getRowCount(); i < tmpCount; i++) {
            row = grid.getRowDataAt(i);

            if ( this.needLoop(row,includeEmptyRow) ) {
                this.total++;
            }
        }
    };
    Lang.impl(OBJLOOP.GridLoop, {
        needLoop:function (row,includeEmptyRow) {
            if( !row.isDetail )
                return false;

            if( !includeEmptyRow &&  !row.bkmkRow )
                return false;

            return true;
        },
        hasNext: function () {
            return this.total > 0 && this.count != this.total;
        },
        next: function () {
            if( this.forward() ) {
                this.context.updateLocation(this.grid.key,this.pos,-1);
            }
        },
        forward:function () {
            var row = null;
            for( var i = this.pos >= 0 ? this.pos : 0,size = this.grid.getRowCount();i < size;i++ ) {
                row = this.grid.getRowDataAt(i);

                this.pos++;

                if( this.needLoop(row, this.includeEmptyRow) ) {
                    this.count++;
                    return true;
                }
            }
            return false;
        },
        clean: function () {

        }
    });
    OBJLOOP.ListViewLoop = function (cxt, listView) {
        this.index = -1;
        this.context = cxt;
        this.key = listView.key;
        this.count = listView.data.length;
    };
    Lang.impl(OBJLOOP.ListViewLoop, {
        hasNext: function () {
            return this.count > 0 && this.index < this.count - 1;
        },
        next: function () {
            ++this.index;
            this.context.updateLocation(this.key,this.index,-1);
        },
        clean: function () {

        }
    });
})();