"use strict";
YIUI.Control.ListLayoutView = YIUI.extend(YIUI.Control, {

    handler: YIUI.ListLayoutViewHandler,

    repeatCount: 1,

    init: function(options) {
        this.base(options);
        var meta = this.getMetaObj();
        this.layout = meta.rowLayouts.items[0].layout;
        this.repeatCount = meta.repeatCount || 1;
        this.columnInfo = meta.columnInfo || this.columnInfo;
        this.pageRowCount = meta.pageRowCount || 50;
        this.pageLoadType = meta.pageLoadType;
        this.rowHeight = meta.rowHeight;
    },

    onRender: function (ct) {
        this.base(ct);
        //第1行为表头，其余为明细

        this.el.addClass('ui-llv');

        if($.browser.isIE) {
            this.el.attr("onselectstart", "return false");
        }
        
        var self = this;
        var rowCount = self.pageRowCount;
        self._pagination = self.el.pagination({
            pageSize: rowCount,
            //总记录数
            totalNumber: self.totalRowCount,
            showPages: true,
            showPageDetail: self.showPageDetail || false,
            showFirstButton: self.showFirstButton,
            showLastButton: self.showLastButton,
            pageNumber: self.pageNumber || 1,
            pageIndicatorCount: self.pageIndicatorCount || 5
        });

        
        this.addDataRow(this.data);
    
        var columnInfo = this.columnInfo;
        for (var i = 0, len = columnInfo.length; i < len; i++) {
            var col = columnInfo[i];
            var oid = null;
            if(col.columnKey == YIUI.SystemField.OID_SYS_KEY) {
                oid = col.key;
            }
            if(oid) {
                this.OID = oid;
                break;
            }
        }

        //总行数大于data的长度
        if(this.totalRowCount <= this.pageRowCount) {
            this._pagination.hidePagination();
            this._pagination.content.css("height", "100%");
        }
    },

    onSetWidth: function(width) {
        this.width = width;
        this.el.css("width", width);
        this._pagination.content.css("width", width);
        this.doLayout(this.width, this.height);
    },

    onSetHeight: function(height) {
        this.base(height);
        this.height = height;
        var pagesH = $(".paginationjs-pages", this.el).is(":hidden") ? 0 : $(".paginationjs-pages", this.el).outerHeight();
        var realHeight = height - pagesH;
        this._pagination.content.css("height", realHeight);
        this.doLayout(this.width, this.height);
    },
    
    getValue: function(index , colIndex) {
        var dbKey = this.columnInfo[colIndex].key;
        return this.getValByKey(index, dbKey);
    },

    getValByKey: function(index, colKey) {
        var data = this.data[index],
            v = data[colKey];
        return v && v.value;
    },
    
    getFocusRowIndex: function() {
        var index = -1;
        if(this._selectedRow) {
            index = this._selectedRow.index() - 1;
        }
        return index;
    },

    clearAllRows: function() {
        this.data = [];
        this.clearDataRow();
    },

    clearDataRow: function() {
        this.el && $(".block", this.el).remove();
    },

    doLayout: function(width, height) {
        for (var i = 0, len = this.data.length; i < len; i++) {
            var d = this.data[i];
            var c = d.root;
            if(!width) {
                // this.roo
            }
            if(!height) {
    
            }
            var w = width / this.repeatCount;
            var ct = c.container;
            ct.width(Math.trunc(1 / this.repeatCount * 100) + "%");
            // w && ct.width(Math.trunc(w));
            // ct.height(height)
            // c && c.doLayout(ct.width(), height);
            // w && ct.width(1/this.repeatCount);
            c && c.doLayout(w, height);

        }
    },
    
    load: function() {
        var form = YIUI.FormStack.getForm(this.ofFormID);
        var showLV = YIUI.ShowListView(form, this);
        showLV.load(this);

        form.getUIProcess().resetComponentStatus(this);
        this.doLayout(this.width, this.height);
    },

    repaint: function() {
        if(!this.el) return;
        this.clearDataRow();
        this.addDataRow(this.data);
        
        if( this._pagination ) {
            if (!this.pageRowCount || this.totalRowCount < this.pageRowCount) {
                this._pagination.hidePagination();
                this._pagination.content.css("height", "100%");
            } else if (this.totalRowCount) {
                var reset = true;
                if(this.curPageIndex > 1) {
                    reset = false;
                }
                this._pagination.setTotalRowCount(this.totalRowCount, reset);
                this.curPageIndex = -1;
            }
        }

        
        this.doLayout(this.width, this.height);
    },

    refreshSelectAll: $.noop,

    refreshBackColor: $.noop,

    setColumnEnable: $.noop,

    setColumnVisible: $.noop,

    getRowCount: function(){
        return this.data.length;
    },

    // createColumnHead: function() {
    //     var $tr = $('<tr class="first"></tr>');
    //     for (var i = 0; i < this.repeatCount; i++) {
    //         $tr.append('<td></td>');
    //     }
    //     var $tbody = $(".tbl-body tbody", this.$table);
    //     $tbody.append($tr);
    // },

    // 只设值,不触发事件
    setValueAt: function(rowIndex, colIndex, value) {
        var column = this.columnInfo[colIndex],key = column.key;
        var row = this.data[rowIndex];
        row[key] = row[key] || {};

        row[key].value = value;

    },

    deleteRow: function(rowIndex){
        this.data.splice(rowIndex, 1);
        this._pagination.content.children(".block").eq(rowIndex).remove();
    },

    insertRow: function(idx, fireEvent) {
        var row = {};
        $.each(this.columnInfo , function(i, column) {
            row[column.key] = {};
        });
        var rowIndex = -1;
        if( idx == undefined || idx == -1 || idx == this.data.length ) {
            this.data.push(row);
            rowIndex = this.data.length - 1;
        } else {
            this.data.splice(idx, 0, row);
            rowIndex = idx;
        }
        
        var layout = this.layout;
        if(layout) {
            row.layout = $.extend(true, {}, layout);
        }

        var newRow = [];
        newRow.push(row);
        this.addDataRow(newRow, idx);
        this.handler.rowInsert(this, idx, fireEvent);
        return rowIndex;
    },

    addDataRow: function(data, idx) {
        if(data) {
            // var $tbody = $(".tbl-body tbody", this.$table).eq(0);
            // $("tr.space", $tbody).remove();
            // if($("tr.data", $tbody).length == 0) {
            //     $("label.empty", $tbody).remove();
            // }
            // var $tr, tr_css = "", caption, $td, _td;
            // var llv = this, form;

            // var _selectOID = llv._selectOID;

            var frag = document.createDocumentFragment();
            // var size = $tbody.children("tr.data").length;
            var $data = document.createElement("div");
            // frag.appendChild($data);

            if(this.repeatCount) {
                var rIndex = 0;
                for (var i = 0, len = data.length; i < len; i) {

                    // var tr_style = "";
                    // $tr = document.createElement("tr");
                    // tr_css = "data";
                    // var rowBackColor = llv.rowBackColor;
                    // if ( rowBackColor ){
                    //     if( !form ) {
                    //         form = YIUI.FormStack.getForm(llv.ofFormID);
                    //     }
                    //     var color = llv.gotBackColor(form, rowBackColor, i);
                    //     if( color ) {
                    //         tr_style = "background-color: " + color + ";";
                    //     }
                    // }

                    for (var j = 0; j < this.repeatCount; j++) {
                        var _index = rIndex * this.repeatCount + j;
                        var cell = data[_index];
                        // var $td = document.createElement("td");
                        if(cell) {
                            var item = cell.layout;
                            var $div = document.createElement("div");
                            $div.className = "block";
                            $div.cellIndex = _index;
                            // $td.appendChild($div);
                            // this.el.append($div);
                            frag.appendChild($div);
                            var panel = YIUI.create(item);
                            panel.render($div);
                            cell.root = panel;
                        }
                        // $tr.appendChild($td);
                        i++;
                    }
                    
                    // if(llv.rowHeight > 0) {
                    //     tr_style += " height: " + llv.rowHeight + "px";
                    // }
                    // tr_style && ($tr.style.cssText = tr_style); 

                    rIndex++;
                }
            }

            if( idx >= 0 && idx <= this.data.length - 1 ) {
                // $tbody[0].insertBefore(frag, $tbody[0].rows[idx + 1]);
                $(".block", this.el).eq(idx).after(frag);
            } else {
                // $tbody.append(frag);
                this._pagination.content.append(frag);
            }
        }
    },

    install: function() {
        var self = this;
        this.el.on("click", ".block", function(e) {
            if(!self.enable || $(this).attr("enable") == "false") return;
            var cellIndex = $(this).index();
            self.handler.doOnCellClick(self, cellIndex);
        });
        
        self._pagination.pageChanges = function(pageNum) {
            
            self._selectOID = null;
            self._selectedRow = null;
            self.handler.doGoToPage(self, pageNum);
            
            var $body = $(".lv-body", self.el);
            $body.scrollLeft(0);
            $body.scrollTop(0);
        }
    }

});
YIUI.reg('listlayoutview', YIUI.Control.ListLayoutView);

