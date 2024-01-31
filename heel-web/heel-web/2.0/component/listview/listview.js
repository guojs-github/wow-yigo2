/**
 * Listview control.
 * 
 * 2023.9.27 added by guojs.
 */

/**
 * Created with IntelliJ IDEA.
 * User: zhufw
 * Date: 14-4-21
 * Time: 上午10:27
 * To change this template use File | Settings | File Templates.
 */
"use strict";
YIUI.ListViewWithLayout = function(listView)  {
    var columnMap = {};
    $.each(listView.columnInfo , function(i , column) {
        columnMap[column.key] = column;
    });
    var layoutView = listView.layoutView;
    var items = layoutView['items'];
    var _height = 0, _width = 0, _seqWidth = 50;
    return {
        _drawLayoutPanel : function(panel) {
            $("tr[row!='0'] td", panel.el).addClass("lv-cell-sp")
        },

        _getRowLayoutWidth :function() {
            return _width - _seqWidth;
        },

        createFirstDataLayoutView: function() {
            var dataLayout = $.extend(true, {}, layoutView);
            $.each(dataLayout.items, function (i, item) {
                item.type = YIUI.CONTROLTYPE.LABEL;
                item.tagName = "label";
            });
            var $td = $("<td class='lv-layout'></td>");
            $td.css("width", _width);
            $td.css("height", "0px");
            return $td;
        },
        createDataLayoutView: function(rowData) {
            var layoutConfig = $.extend(true, {}, layoutView);
            var $td = $("<td class='lv-layout'></td>");
            $td.css("width", _width);
            $td.css("height", _height);

            $.each(layoutConfig.items, function(i, item) {
                item.ofFormID = listView.ofFormID;
                item.tagName = "label";
                item.type = YIUI.CONTROLTYPE.LABEL;
                var value;
                if (rowData) {
                    var cell = rowData[item.key];
                    value = (cell && cell.value!=="") ? cell.caption: '';
                } else {
                    return;
                }
                item.caption  = value;
                //item.text = value;
                var column = columnMap[item.key];
                switch (column.columnType) {
                    case YIUI.CONTROLTYPE.CHECKBOX:
                        delete item.caption;
                        delete item.text;
                    case YIUI.CONTROLTYPE.BUTTON:
                    case YIUI.CONTROLTYPE.HYPERLINK:
                    case YIUI.CONTROLTYPE.UPLOADBUTTON:
                        item.type = column.columnType;
                        $.extend(item, column);
                        break;
                    case YIUI.CONTROLTYPE.DATEPICKER:
                        if(column.onlyDate){
                            item.caption = value.split(" ")[0];
                        }
                }

            });
            var panel = new YIUI.Panel(layoutConfig);
            panel.render($td);
            panel.doLayout(this._getRowLayoutWidth(), _height);
            //此处清除checkbox.js中定义的值变化事件
            $(".chk", $td).unbind();
            this._drawLayoutPanel(panel);
            return $td;
        },
        createHeadLayoutView: function() {
            var headLayout = $.extend(true, {}, layoutView);
            $.each(headLayout.items, function (i, item) {
                var column = columnMap[item.key];
                item.type = YIUI.CONTROLTYPE.LABEL;
                item.tagName = "label";
                item.caption = column.caption;
            });
            // headLayout.tagName = headLayout.layout.toLowerCase() + "panel"
            // var panel = YIUI.create(headLayout);
            var panel = new YIUI.Panel(headLayout);
            var $th = $("<th class='lv-layout'></th>");
            $th.css("width", this._getRowLayoutWidth());
            $th.css("height", _height);
            panel.render($th);
            panel.doLayout(this._getRowLayoutWidth(), _height);
            this._drawLayoutPanel(panel);
            return $th;
        },
        createColumnHead: function() {
            _width = listView.el.width();
            var $thead = $(".tbl-head thead", listView.$table);
            var $tbody = $(".tbl-body tbody", listView.$table);
            if(listView.columnInfo && listView.columnInfo.length > 0 ){
                var $tr = $('<tr></tr>'),$th;
                var $tr_b = $('<tr class="first"></tr>'),$td;

                //生成序号列
                $th = $('<th><label>'+YIUI.I18N.getString("LISTVIEW_ORDER","序")+'</label></th>').addClass("seq");
                $("label", $th).css("width", "100%").css("overflow", "hidden").css("text-overflow", "ellipsis").css("display", "block");
                $tr.append($th);
                $td = $('<td></td>').addClass("seq");
                $td.css("height", "0px");
                $tr_b.append($td);

                //生成表格列标题布局
                $th = this.createHeadLayoutView();
                $tr.append($th);

                //生成表格数据行布局
                $td = this.createFirstDataLayoutView();
                $tr_b.append($td);

                $("<th class='space'></th>").appendTo($tr);
                $("<td class='space'></td>").css("height", "0px").appendTo($tr_b);
            }
            $thead.append($tr);
            $tbody.append($tr_b);
        },
        onSetWidth: function(width) {
            listView.el.css("width", width);
            listView._pagination.content.css("width", width);
            var $ths = $("th", listView.$table),
                $th, $td, thWidth, _index;
            $("th.space", listView.$table).css("width", "100%");
            var widthItems = layoutView.widths;
            var allWidth = 0;
            $.each(widthItems, function(index, widthItem) {
                thWidth = $.getReal(widthItem, listView.calcRealValues(widthItems, listView.el.width()));
                allWidth += thWidth;
                $(".lv-tb .lv-layout tr td[col='" + index +"']").each( function(_index, el) {
                    $(el).css("width", thWidth);
                    $("div", el).children().eq(0).width(thWidth);
                });
            });

            _width = Math.max(width, allWidth + _seqWidth);
            $(".lv-layout", listView.el).css("width", this._getRowLayoutWidth());
            $("div.ui-pnl", listView.el).css("width", this._getRowLayoutWidth());
            $("table.lv-tb", listView.el).css("width", _width);
            listView.syncHandleWidths();
        },

        addEmptyRow: function() {
            var $body = $(".lv-tb .lv-body", listView.el);
            var $tbl = $(".tbl-body", $body);
            $("tr.space", $tbl).remove();
            if($("tr.data", $tbl).first().length == 0) {
                var lbl = $("tbody label.empty", $tbl);
                if(lbl.length == 0) {
                    lbl = $("<label class='empty'>"+YIUI.I18N.getString("ATTACHMENT_NOCONTENT","表中无内容")+"</label>");
                    $("tbody", $tbl).append(lbl);
                }
                var width = $("tr.first", $tbl).width();
                var top = ($body.height() - lbl.height()) / 2;
                lbl.width(width).css("top", top + "px");
                return;
            }
            var tr_h = $("tr.data", $tbl).first().outerHeight();
            var body_h = $(".tbl-body", $body).outerHeight();
            if(!body_h) {
                var len = $("tr.data", $tbl).length;
                body_h = 0;
                for (var i = 0; i < len; i++) {
                    body_h +=  $("tr.data", $tbl).eq(i).outerHeight();
                }
            }
            var client_h = ($body[0].clientHeight || $body.height());
            var total_h = (client_h - body_h);
            var count = Math.ceil( total_h / 30);
            var last_h = total_h - (count - 1) * 30;
            if(count <= 0) return;
            
            for (var i = 0; i < count; i++) {
                var $tr = $("<tr></tr>").addClass("space").appendTo($tbl);
                var index = $tr.index() + 1;
                if(index % 2 == 0) {
                    $tr.addClass("even");
                }
                $('<td></td>').addClass("seq").appendTo($tr);

                var $td = this.createDataLayoutView();
                $tr.append($td);

                $("<td class='space'></td>").appendTo($tr);
                if(i == count - 1) {
                    $tr.addClass("last");
                    $("td", $tr).height(last_h);
                    var h = client_h - $tbl.height();
                    if(h > 0 && h < tr_h) {
                        $("td", $tr).height(last_h + h);
                    }
                } else {
                    $tr.outerHeight(30);
                }
            }
            this.onSetWidth(_width);
        },

        addDataRow: function(data){
            if(data && listView.$table) {
                var $tbody = $(".tbl-body>tbody", listView.$table);
                $("tr.space", $tbody).remove();
                if($("tr.data", $tbody).length == 0) {
                    $("label.empty", $tbody).remove();
                }
                var $tr , value , $td;
                var _this = this;
                var hasFirst = $("tr.first", $tbody).length == 0 ? false : true;
                $.each(data , function(i , row){
                    $tr = $('<tr></tr>').addClass("data");
                    $td = $('<td></td>').addClass("seq");
                    if(!hasFirst && i == 0) {
                        $tr.addClass("first");
                    }
                    var seq = $tbody.children().length+1;
                    if(seq % 2 == 0) {
                        $tr.addClass("even");
                    }
                    $tr.append($td.html($tbody.children().length));
                    $td = _this.createDataLayoutView(row);
                    $tr.append($td);

                    $("<td class='space'></td>").appendTo($tr);
                    $tbody.append($tr);
                });
            }
        },

        install: function () {
            var self = this;
            listView.$table.delegate(".tbl-body tbody .chk", "click", function(event){
                if(!listView.enable || $(this).attr("enable") == "false") return;

                var colKey = $(event.target).parents('div.ui-chk').attr("id");
                colKey = self._getCompKey(colKey);
                var colIndex = $.inArray(columnMap[colKey],  listView.columnInfo);

                var rowIndex = $(event.target).parents('tr.data').index() - 1;
                var isChecked = $(this).attr('isChecked') == "true" ? false : true;
                listView.setValByIndex(rowIndex,colIndex,isChecked,true);
                event.stopPropagation();
            });

            listView.$table.delegate(".ui-btn", 'click', function(event){
                if(!listView.enable || $(this).attr("enable") == "false") return;
                var colKey = $(this).attr("id");
                colKey = self._getCompKey(colKey);
                var rowIndex = $(event.target).parents('tr.data').index() - 1;
                listView.handler.doOnCellClick(listView, rowIndex , colKey);
                event.stopPropagation();
            });

            listView.$table.delegate(".ui-hlk", 'click',function( event){
                if(!listView.enable || $(this).attr("enable") == "false") return;
                var rowIndex = $(event.target).parents('tr.data').index() - 1;
                var colKey = $(this).attr("id");
                colKey = self._getCompKey(colKey);
                listView.handler.doOnCellClick(listView, rowIndex , colKey);
                event.stopPropagation();
            });
        },

        _getCompKey : function(compID) {
            if (!compID) return compID;
            if (!listView.ofFormID)  return compID;

            var pre = listView.ofFormID + "_";
            if (compID.length > pre.length  && compID.substring(0, pre.length) == pre) {
                return compID.substring(pre.length)
            }
            return compID;
        },

        _createHandles: function () {
            var _this = listView;
            _this.$handleContainer = $("<div class='rc-handle-cntr'/>");
            _this.$table.before(_this.$handleContainer);
            _this.$table.find('th .ui-pnl tr td').each(function (i, el) {
                var $handle;
                $handle = $("<div class='rc-handle' />");
                $handle.data('th', $(el));
                $handle.bind('mousedown', _this, function (e) {
                    var $currentGrip , $leftColumn  , leftColOldW; // _this = e.data;
                    e.preventDefault();
                    $currentGrip = $(e.currentTarget);
                    $leftColumn = $currentGrip.data('th');
                    leftColOldW = $leftColumn.outerWidth();
                    var target = $(e.target);
                    target.addClass("clicked");
                    target.css("height",_this.$table.height());
                    target.attr("display","block");
                    target.data("startPos", target.position().left);
                    var startPosition = e.clientX;
                    var difference , leftColW, tblWidth, layoutWidth;
                    var table = $leftColumn.parents("table.lv-tb").eq(0);
                    var $row = $leftColumn.parents("table.lv-tb .lv-head .lv-layout");
                    var $body = $(".lv-tb .lv-body", _this.el);
                    var client_h1 = ($body[0].clientHeight || $body.height());
                    $(document).on('mousemove.rc', function (e) {
                        $(this).css("display","block");
                        difference = e.clientX - startPosition;
                        target.css('left', target.data("startPos") + difference);
                        leftColW = leftColOldW + difference;
                        tblWidth = table.width() + difference;
                        layoutWidth =  $row.width() + difference;
                        if(leftColW < 10) {
                            leftColW = 10;
                            tblWidth += 10 - leftColW;
                        }
                    });
                    return $(document).one('mouseup', function (e) {
                        $(document).off('mousemove.rc');
                        //table.width(tblWidth);
                        var index = $leftColumn.attr("col");
                        $(".lv-layout tr td[col='" + index +"']", table).each( function(_index, el) {
                            $(el).css("width", leftColW);
                            $("div", el).width(leftColW);
                            $("div", el).children().eq(0).width(leftColW);
                            $(el).parents(".lv-layout").css("width", layoutWidth);
                        });
                        /* $(".lv-layout", table).each(function(_index, el) {
                         $(el).css("width", layoutWidth);
                         });*/

                        target.removeClass("clicked");
                        target.css("height","36");
                        var client_h2 = ($body[0].clientHeight || $body.height());
                        if(client_h1 != client_h2) {
                            _this.addEmptyRow();
                        }
                        return _this.syncHandleWidths();
                    });
                });
                return $handle.appendTo(_this.$handleContainer);
            });
        }
    }
};

// Listview控件
YIUI.Control.ListView = YIUI.extend(YIUI.Control, {

    handler: YIUI.ListViewHandler,

    $table: null,

    height: "100%",

    $handleContainer: null,

    regExp: /^#[0-9a-fA-F]{6}$/,

    init: function(options) { // 初始化
        this.base(options);
        var meta = this.getMetaObj();
        this.columnInfo = meta.columnInfo || this.columnInfo;
        this.cols = meta.cols || this.cols;
        this.hasSelectField = meta.hasSelectField || false;
        this.selectFieldIndex = meta.selectFieldIndex != undefined ? meta.selectFieldIndex : -1;
        this.pageRowCount = meta.pageRowCount || 50;
        this.pageLoadType = meta.pageLoadType;
        this.primaryKeys = meta.primaryKeys;
        this.rowHeight = meta.rowHeight;
        this.rowBackColor = meta.rowBackColor;
        this.data = [];
        if(meta.rowClick) {
            this.hasClick = true;
            this.rowClick = meta.rowClick;
        }
        if(meta.rowDblClick) {
            this.hasDblClick = true;
            this.rowDblClick = meta.rowDblClick;
        }
        if(meta.focusRowChanged) {
            this.hasRowChanged = true;
            this.focusRowChanged = meta.focusRowChanged;
        }
        if(this.height == "pref") {
            this.height = "auto";
        }
        if( this.selectFieldIndex >= 0 ) {
            this.singleSelect = this.columnInfo[this.selectFieldIndex].singleSelect;
        }
    },

    getSelectFieldIndex: function() {
        return this.selectFieldIndex;
    },

    getFieldArray: function(form, fieldKey) {
        var info = this.columnInfo;
        var colKey = "";
        for (var i = 0, len = info.length; i < len; i++) {
            var col = info[i];
            if(col.columnKey == fieldKey) {
                colKey = col.key;
                break;
            }
        }

        var doc = form.getDocument(), OIDList = new Array(), dataTable;
        dataTable = doc.getByKey(this.tableKey);
        var data = this.data, columnIfo = this.columnInfo;
        for (var i = 0, len = data.length; i < len; i++) {
            if (!this.isActiveRowSelect(i))
                continue;
            OIDList.push(this.getValByKey(i, colKey));
        }

        return OIDList;
    },
    isActiveRowSelect: function(i) {
        if (this.hasSelectField) {
            var index = this.selectFieldIndex;
            return this.getValue(i, index);
        }
        return true;
    },

    isDataBinding: function() {
        return false;
    },

    onRender: function (ct /* 此为listview根节点 */) {
        this.base(ct);
        // if (this.data.isTableData) {
        //第1行为表头，其余为明细

        // Create user style object
        if (!this.user_style) { 
            this.user_style = new heelWeb.component.listview.user_style(this, ct);
        }
        // Apply user style
        this.user_style && this.user_style.apply();



        if (this.layoutView) {
            this.layoutViewInvoker = new YIUI.ListViewWithLayout(this);
            this.el.addClass('ui-lv ui-lv-withlayout');
        } else {
            this.el.addClass('ui-lv');
        }

        if($.browser.isIE) {
            this.el.attr("onselectstart", "return false");
        }
        var self = this;
        var rowCount = self.pageRowCount;
        self._pagination = self.el.pagination({
//			pageSize: self.pageRowCount,
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

        var _tbody = $('<tbody></tbody>');
        var _thead = $('<thead></thead>');
//        this.$table = $('<table class="lv-tb"></table>').append(_thead).append(_tbody).appendTo(self._pagination.content);

        var $div = $('<div class="lv-div"></div>').appendTo(self._pagination.content);
        self.$table = $('<table class="lv-tb"></table>').appendTo($div);
        var $tr_h = $('<tr class="head"></tr>').appendTo(this.$table);
        var $td_h = $('<td></td>').attr("colspan", this.columnInfo.length + 1).appendTo($tr_h);
        var $div_h = $('<div class="lv-head"></div>').appendTo($td_h);
        var $head = $('<table class="tbl-head"></table>').append(_thead).appendTo($div_h);

        var $tr_b = $('<tr class="body"></tr>').appendTo(this.$table);
        var $td_b = $('<td></td>').attr("colspan", this.columnInfo.length + 1).appendTo($tr_b);
        var $div_b = $('<div class="lv-body"></div>').appendTo($td_b);
        var $body = $('<table class="tbl-body"></table>').append(_tbody).appendTo($div_b);

        self.createColumnHead();

        self.refreshSelectAll();// 第一次打开使用

        //总行数大于data的长度
        if(this.totalRowCount <= this.pageRowCount) {
            this._pagination.hidePagination();
            this._pagination.content.css("height", "100%");
        }
        this._createHandles();
        this.syncHandleWidths();
        this.addDataRow(this.data); // this.data就是本次需要显示的数据
    
        this.initVisible = this.visible;
    },

    /**
     * 设置单元格显示样式。
     * @param style Object，参考style属性说明。
     */
    setColStyle: function (colEl, style) {
        var cssStyle = colEl.style.cssText || "";
        style.backColor && (cssStyle += "; background-color: " + style.backColor);
        style.foreColor && (cssStyle += "; color: " + style.foreColor);
        if(style.vAlign > -1) {
            cssStyle += "; vertical-align: " + YIUI.VAlignment.parse(style.vAlign);
            cssStyle += "; line-height: normal"; 
        }
        if(style.hAlign > -1) {
            var hAlign = YIUI.HAlignment.parse(style.hAlign);
            cssStyle += "; text-align: " + hAlign;

            var index = colEl.index;
            var $th = $(".lv-head .tbl-head th", this.$table).eq(index);
            if($th.css("text-align") != hAlign) $th.css("text-align", hAlign);
        }
        var font = style.font;
        if(font) {
            font.name && (cssStyle += "; font-family: " + font.name);
            font.size && (cssStyle += "; font-size: " + font.size);
            font.bold && (cssStyle += "; font-weight: " + "bold");
            font.italic && (cssStyle += "; font-style: " + "italic");
        }
        colEl.style.cssText = cssStyle;
    },

    addEmptyRow: function() {
        if (this.layoutViewInvoker) {
            this.layoutViewInvoker.addEmptyRow();
            return;
        }
        if(!this.el) return;
        var $body = $(".lv-div", this.el);
        var $tbl = $(".tbl-body", $body);
        $("tr.space", $tbl).remove();
        var _content = $(".lv-tb .lv-body", this.el);
        var client_h = $body.height() - $(".head", $body).outerHeight();
        if($body[0].clientHeight && (this.height != "auto")) {
        	_content.css("height", client_h);
        } else {
        	client_h = _content.height();
        }
        if($("tr.data", $tbl).first().length == 0) {
            var lbl = $("tbody label.empty", $tbl);
            if(lbl.length == 0) {
                lbl = $("<label class='empty'>"+YIUI.I18N.getString("ATTACHMENT_NOCONTENT","表中无内容")+"</label>");
                $("tbody", $tbl).append(lbl);
            }
            var width = $("tr.first", $tbl).width();
            var top = ($body.height() - lbl.height()) / 2;
            lbl.width(width).css("top", top + "px");
            return;
        }
        var tr_h = $("tr.data", $tbl).first().outerHeight();
        var body_h = $(".tbl-body", $body).outerHeight();
        if(!body_h) {
            var len = $("tr.data", $tbl).length;
            body_h = 0;
            for (var i = 0; i < len; i++) {
                body_h +=  $("tr.data", $tbl).eq(i).outerHeight();
            }
        }
        
        var scroll_h = 0;
        if(_content[0].clientWidth != _content[0].scrollWidth) {
        	scroll_h = _content.height() - _content[0].clientHeight;
	    }
        client_h -= scroll_h;
        
        var total_h = (client_h - body_h);
        var new_h = parseInt(tr_h);
        var count = Math.ceil( total_h / new_h);
        var last_h = total_h - (count - 1) * new_h;
        if(count <= 0) return;

        var frag = document.createDocumentFragment();
        var _index = $(".tbl-body tr.data", $body).length;
        for (var i = 0; i < count; i++) {
        	var $tr = document.createElement("tr");
        	var className = "space";
            var index = _index + i + 1;
            if(index % 2 == 0) {
        		className += " even";
            }
        	var _td = document.createElement("td");
        	$tr.className = "seq";
        	$tr.appendChild(_td);
            var $this = this;
        	for (var j = 0; j < this.columnInfo.length; j++) {
				var column = this.columnInfo[j];
            	var $td = document.createElement("td");

                if(!column.visible) {
                    $td.style.display = "none";
                }
                if(column.format) {
                    $td.index = j + 1;
                    $this.setColStyle($td, column.format)
                }

                $tr.appendChild($td);
			}

        	var space = document.createElement("td");
        	space.className = "space";
        	$tr.appendChild(space);
            if(i == count - 1) {
        		className += " last";
                body_h += last_h;
            } else {
        		$tr.style.height = new_h + "px";
                body_h += new_h;
            }
        	$tr.className = className;
        	frag.appendChild($tr);
        }
        $tbl.append(frag);

        last_h = (client_h - body_h);
        var last_tr = $(".tbl-body tr.space.last", $body)[0];
        if(last_h < 0) {
            var prev_tr = last_tr.previousElementSibling;
            prev_tr.style.height = (new_h + last_h) + "px";
            prev_tr.className += " last";
            last_tr.remove();
        } else {
            last_tr.style.height = last_h + "px";
        }
    },

    onSetHeight : function(height) { // 每次适应屏幕变化，设置控件大小时调用
        this.el.css("height", height);
        var pagesH = $(".paginationjs-pages", this.el).is(":hidden") ? 0 : $(".paginationjs-pages", this.el).outerHeight();
        var realHeight = height - pagesH;
        this._pagination.content.css("height", realHeight);
        var head_h = $(".lv-tb .head", this.el).outerHeight();
        var body_h = realHeight - head_h;

        var $head = $(".lv-tb .lv-head", this.el);
        var $body = $(".lv-tb .lv-body", this.el);
        // $body.outerHeight(body_h);
   	    // $body.css("line-height", $body.height() + "px");
        $body.css("height", body_h + "px");
        $(".space", $head).css("width", "100%");

        this.addEmptyRow();

        if(this.rowHeight > 0) {
            $(".lv-body table tr.data:not([class~='first'])", this.$table).height(this.rowHeight);
        }

        this.syncHandleWidths();
    },

    onSetWidth: function(width) { // 每次适应屏幕变化，设置控件大小时调用
        if (this.layoutViewInvoker) {
            this.layoutViewInvoker.onSetWidth(width);
            return;
        }
        this.el.css("width", width);
        this._pagination.content.css("width", width);
        var $ths = $("th", this.$table),
            $tds = $("tr.first td", this.$table),
            $th, $td, $thWidth, _index;
        $("th.space", this.$table).css("width", "100%");
        var tblW = 0;
        for (var i = 0, len = this.columnInfo.length; i < len; i++) {
            $th = $("[colindex="+i+"]", this.$table);
            $td = $tds.eq($th.index());
//			if(!this.columnInfo[i].visible) continue;
            $thWidth = $.getReal(this.columnInfo[i].width, this.calcRealValues(this.columnInfo, this.el.width()));
            $th.css("width", $thWidth);
            $td.css("width", $thWidth);
           // $("label", $th).css("width", $th.width() - $(".chk", $th).width());
            if(!this.columnInfo[i].visible) {
                $th.hide();
                $td.hide();
            } else {
                tblW += $thWidth;
            }
        }
       
        this.syncHandleWidths();
    },

    createColumnHead: function(){
        if (this.layoutViewInvoker) {
            this.layoutViewInvoker.createColumnHead();
            return;
        }
        var $thead = $(".tbl-head thead", this.$table);
        var $tbody = $(".tbl-body tbody", this.$table);
        if(this.columnInfo && this.columnInfo.length > 0 ){
            var $tr = document.createElement("tr");
            var $tr_b = document.createElement("tr");
            $tr_b.className = "first";
            
            var _th = document.createElement("th");
            _th.className = "seq";
            var lbl = document.createElement("label");
            lbl.innerText = YIUI.I18N.getString("LISTVIEW_SEQ","序号");
            _th.appendChild(lbl);
            $tr.appendChild(_th);

            var $td = document.createElement("td");
            $td.className = "seq";
            $td.style.height = "0px";
            $tr_b.appendChild($td);

            var th_frag = document.createDocumentFragment();
            var td_frag = document.createDocumentFragment();
            var $th, $td;
            for( var i = 0 ; i < this.columnInfo.length ; i ++){
                var column = this.columnInfo[i];
                $th = document.createElement("th");
                
                var th_w = $.getReal(column.width, this.calcRealValues(this.columnInfo, this.el.width()));
                var style = "width: " + th_w + ";";
                $th.style.cssText = style;
                if( i === this.selectFieldIndex && !this.singleSelect ) {
                    var span = document.createElement("span");
                    span.className = "chk";
                    $th.appendChild(span);
                }
                
                $th.setAttribute("colIndex", i);

                // label
                var lbl = document.createElement("label");
                lbl.innerText = column.caption;
                //lbl.style.cssText = "display: inline-block;position: absolute;left: 5px;top: 2px;";
                $th.appendChild(lbl);

                // span
                var span = document.createElement("span");
                span.className = "s-ico";
                $th.appendChild(span);
                if(column.sortable){
                    span.className = "s-ico order";
                }

                $td = document.createElement("td");
                $td.setAttribute("colIndex", i);
                var td_s = "width: " + $.getReal(column.width, this.calcRealValues(this.columnInfo, this.el.width())) + "; height: 0px";
                $td.style.cssText = td_s;

                switch(column.columnType){
                    case YIUI.CONTROLTYPE.TEXTEDITOR:
                        $th.className = "lv-h-txt";
                        break;
                    case YIUI.CONTROLTYPE.CHECKBOX:
                        $th.className = "lv-h-chk";
                        break;
                    case YIUI.CONTROLTYPE.BUTTON:
                        $th.className = "lv-h-btn";
                        break;
                    case YIUI.CONTROLTYPE.HYPERLINK:
                        $th.className = "lv-h-hlk";
                        break;
                    case YIUI.CONTROLTYPE.DATEPICKER:
                        $th.className = "lv-h-dp";
                        break;
                    case YIUI.CONTROLTYPE.MONTHPICKER:
                    	$th.className = "lv-h-mp";
                    	break;
                    case YIUI.CONTROLTYPE.TIMEPICKER:
                    	$th.className = "lv-h-tp";
                    	break;
                }

                th_frag.appendChild($th);
                td_frag.appendChild($td);


            }
            
            var th_space = document.createElement("th");
            th_space.className = "space";
            var td_space = document.createElement("td");
            td_space.className = "space";
            td_space.style.height = "0px";
            th_frag.appendChild(th_space);
            td_frag.appendChild(td_space);

            $tr.appendChild(th_frag);
            $tr_b.appendChild(td_frag);
        }
        $thead.append($tr);
        $tbody.append($tr_b);
    },

    setColumnCaption: function(columnKey, caption) {
        var colIndex = this.findIndex(columnKey);
        var $label = $("thead th[colIndex='"+colIndex+"'] label", this.$table);
        $label.text(caption);
    },

    setColumnEnable: function(columnKey, enable) {
        var colIndex = this.findIndex(columnKey);
        if(colIndex >  -1) {
            var col = this.columnInfo[colIndex];
            col.enable = enable;
        }
        var $th = $("thead th[colIndex='"+colIndex+"']", this.$table);
        var $tdIndex = $th.index();
        if($tdIndex > -1) {
            for (var i = 0, len = this.data.length; i < len; i++) {
                var $tr = $(".tbl-body tr.data", this.$table).eq(i);
                var $td = $("td", $tr).eq($tdIndex);
                var $el = $td.children();
                this.setEnableByEl($el, enable);
            }
        }
    },

    setEnableByEl: function($el, enable) {
        if(enable) {
            $($el, this.el).removeAttr("disabled");
            $($el, this.el).removeClass("disabled");
        } else {
            $($el, this.el).attr("disabled", "disabled");
            $($el, this.el).addClass("disabled");
        }
        $($el, this.el).attr("enable", enable);
    },

    setColumnVisible: function(columnKey, visible) { // 设置列是否可视
        // 样式调整测试代码
        // 界面展现后，再次LoadData时，此处会被调用必须应用自定义样式
        if (this.user_style) {
            if (this.user_style.is_col_hidden(columnKey) == true) {
                visible = false;
            }
            if (this.user_style.is_col_hidden(columnKey) == false) {
                visible = true;
            }
        } 

        var colIndex = this.findIndex(columnKey);
        this.columnInfo[colIndex].visible = visible;

        if(!this.$table || this.$table.length == 0)
            return;

        var $th = $("thead th[colIndex='" + colIndex + "']", this.$table);
        var $tdIndex = $th.index();
        if(visible) {
            $th.show();
            $(".rc-handle", this.$handleContainer).eq($tdIndex).show();
        } else {
            $th.hide();
            $(".rc-handle", this.$handleContainer).eq($tdIndex).hide();
        }
        if ($tdIndex > -1) {
            $(".tbl-body tr.data, .tbl-body tr.space", this.$table).each(function () {
                var $td = $("td", $(this)).eq($tdIndex);
                visible ? $td.show() : $td.hide();
            });
        }

        this.syncHandleWidths();
    },

    calcRealValues: function(columnInfo, parentWidth) {
        var realWidth = 0, columnWidth, width;
        for (var i = 0, len = columnInfo.length; i < len; i++) {
            columnWidth = $.isNumeric(columnInfo[i]) ? columnInfo[i] : columnInfo[i].width;
            if($.isNumeric(columnWidth) && columnWidth > 0) {
                realWidth += parseInt(columnWidth);
            }
        }
        width = parentWidth - realWidth;
        return width < 0 ? 10 : width;
    },

    gotBackColor: function (form,backColor,idx) {
        var color = backColor;
        if( !this.regExp.test(backColor) ) {
            var cxt = new View.Context(form);
            cxt.updateLocation(this.key,idx,-1);
            color = form.eval(color,cxt);
        }
        return this.regExp.test(color) ? color : "";
    },

    refreshBackColor: function (idx) {
        if( !this.rowBackColor ) {
            return;
        }
        var form = YIUI.FormStack.getForm(this.ofFormID);
        var backColor = this.gotBackColor(form,this.rowBackColor,idx);
        var $tr = $(".tbl-body tr.data", this.$table).eq(idx);
        if( $tr ) {
            $tr.css("background-color",backColor);
        }
    },

    addDataRow: function(data,idx){
        if (this.layoutViewInvoker) {
            this.layoutViewInvoker.addDataRow(data);
            return;
        }
        if(data && this.$table) {
            var $tbody = $(".tbl-body tbody", this.$table);
            $("tr.space", $tbody).remove();
            if($("tr.data", $tbody).length == 0) {
                $("label.empty", $tbody).remove();
            }
            var $tr, tr_css = "", caption , $td, _td;
            var listView = this,form;
            var hasFirst = $("tr.first", $tbody).length == 0 ? false : true;

            var _selectOID = listView._selectOID;

            var frag = document.createDocumentFragment();
            var size = $tbody.children("tr.data").length;

        	for (var i = 0, len = data.length; i < len; i++) {
				var row = data[i],tr_style = "";
                $tr = document.createElement("tr");
                tr_css = "data";
                
                _td = document.createElement("td");
                _td.className = "seq";

                var rowBackColor = listView.rowBackColor;
                if ( rowBackColor ){
                    if( !form ) {
                        form = YIUI.FormStack.getForm(listView.ofFormID);
                    }
                    var color = listView.gotBackColor(form,rowBackColor,i);
                    if( color ) {
                        tr_style = "background-color: " + color + ";";
                    }
                }
                if(!hasFirst && i == 0) {
                    tr_css += " first";
                }
                var seq = size + i + 1;
                if(seq % 2 == 0) {
                    tr_css += " even";
                }
                _td.innerText = size + i + 1;
                $tr.appendChild(_td);
                $tr.className = tr_css;

                var _this = this;
                $.each(listView.columnInfo, function(j, column){

                    $td = document.createElement("td");
                    var cell = row[column.key];
                    if(cell) {
                        if(cell.value === "") {
                            caption = "";
                        } else {
                            caption = cell.caption || "";
                        }
                        //caption = $.htmlEncode(caption);
                    }

                    switch(column.columnType){
                        case YIUI.CONTROLTYPE.TEXTEDITOR:
                            caption = YIUI.TextFormat.format(caption, _this);
                            $td.className = "lv-txt";
                            $td.textContent = caption;
                            break;
                        case YIUI.CONTROLTYPE.TEXTAREA:
                            caption = YIUI.TextFormat.format(caption, _this);
                            $td.className = "lv-txta";
                            var txt = document.createElement("textarea");
                            txt.className = "ui-txta";
                            txt.readOnly = true;
                            $td.appendChild(txt);
                            txt.innerText = caption;
                            break;
                        case YIUI.CONTROLTYPE.CHECKBOX:
                            var _chk = document.createElement("span");

                            _chk.className = "chk";
                            _chk.removeAttribute("isChecked");

                            if( cell.value ) {
                                _chk.setAttribute('isChecked', "true");
                                _chk.className += " " + "checked";
                            }

                            _chk.setAttribute("enable", column.enable);
                            _chk.setAttribute("data-key", column.key);
                           // $td.className = "lv-chk";
                            $td.style.textAlign = "center";
                            $td.appendChild(_chk);
                            
                            listView.setEnableByEl(_chk, column.enable);
                            column.el = _chk;
                            break;
                        case YIUI.CONTROLTYPE.BUTTON:
                            var $btn = document.createElement("button");
                            $btn.className = "btn";
                            var $imginfo = document.createElement("span");
                            $imginfo.className = "imginfo";
                            if(column.icon) {
                            	_this.getImageBase64URL(column.icon).then(function(url) {
                            		$imginfo.style.cssText += " background-image: url("+ url +")";
                                });
                            } else {
                                $imginfo.style.cssText += " display: none;"
                            }
                            var $fontinfo = document.createElement("span");
                            $fontinfo.className = "txt";
                            $fontinfo.innerText = caption;
                            
                            $btn.setAttribute("enable", column.enable);
                            $btn.setAttribute("data-key", column.key);
                            $btn.appendChild($imginfo);
                            $btn.appendChild($fontinfo);
                            $td.className = "lv-btn";
                            $td.appendChild($btn);
                            
                            listView.setEnableByEl($btn, column.enable);
                            column.el = $btn;
                            break;
                        case YIUI.CONTROLTYPE.HYPERLINK:
                            var $hyperLink = document.createElement("a");
                            $hyperLink.innerText = caption;
                            $hyperLink.className = "hlk";
                            
                            var showTarget = YIUI.Hyperlink_TargetType.Str_NewTab;
                            var url = null;
                            if (column.url){
                                url = column.url;
                            }else{
                                var form = YIUI.FormStack.getForm(listView.ofFormID);
                                var cxt = new View.Context(form);
                                url = form.eval(column.formulaURL, cxt, null);
                            }
                            switch(column.targetShowType) {
                                case YIUI.Hyperlink_TargetType.Current:
                                    showTarget = YIUI.Hyperlink_TargetType.Str_Current;
                                case YIUI.Hyperlink_TargetType.NewTab:
                                    url && $hyperLink.setAttribute("href", url);
                                    $hyperLink.setAttribute("target", YIUI.Hyperlink_target[showTarget]);
                                    break;
                                default:
                                    $hyperLink.setAttribute("data-url", url);
                                    $hyperLink.setAttribute("data-target", YIUI.Hyperlink_TargetType.New);
                                    break;
                            }
                            $hyperLink.setAttribute("enable", column.enable);
                            $hyperLink.setAttribute("data-key", column.key);
                            $td.className = "lv-hlk";
                            $td.appendChild($hyperLink);
                            
                            listView.setEnableByEl($hyperLink, column.enable);
                            column.el = $hyperLink;
                            break;
                        case YIUI.CONTROLTYPE.DATEPICKER:
                            var onlyDate = column.onlyDate;
                            if(onlyDate){
                                caption = caption.split(" ")[0];
                            }
                            $td.className = "lv-dp";
                            $td.innerText = caption;
                            break;
                        case YIUI.CONTROLTYPE.MONTHPICKER:
                        	$td.className = "lv-mp";
                        	$td.innerText = caption;
                        	break;
                        case YIUI.CONTROLTYPE.TIMEPICKER:
                        	$td.className = "lv-tp";
                        	$td.innerText = caption;
                        	break;
                        default:
                            $td.innerText = caption;
                            break;
                    }
                    if( column.wrapText ) {
                        $td.className += " wrap";
                        $td.innerText= "";
                        $("<div class='div-wrap'>"+caption+"</div>").appendTo($td);

                        
                    }
                    if(!column.visible) {
                        $td.style.display = "none";
                    }
                    if(column.format) {
                    	$td.index = j + 1;
                        listView.setColStyle($td, column.format);
                    }
                    $tr.appendChild($td);
                });

                var space = document.createElement("td");
                space.className = "space";
                $tr.appendChild(space);
                
                if(listView.rowHeight > 0) {
                	tr_style += " height: " + listView.rowHeight + "px";
                }
                tr_style && ($tr.style.cssText = tr_style);

                // 排序后恢复选中行
                if( _selectOID != null ) {
                    var OID = listView.getValByKey(i,YIUI.SystemField.OID_SYS_KEY);
                    if( _selectOID === OID ) {
                        $tr.className += " clicked";
                        listView._selectedRow.removeClass("clicked");
                        listView._selectedRow = $($tr);
                    }
                }
                frag.appendChild($tr);
            };
            if( idx >= 0 && idx <= this.data.length - 1 ) {
                $tbody[0].insertBefore(frag,$tbody[0].rows[idx + 1]);
                $("tr.data", $tbody).each(function (i) {
                   $("td.seq",this).html(i + 1);
                });
            } else {
                $tbody.append(frag);
            }
        }
    },

    clearDataRow: function() {
        if(this.$table) {
            var $tbody = $(".tbl-body tbody", this.$table);
            $("tr", $tbody).not(".first").remove();
        }
    },

    clearAllRows: function() {
        this.data = [];
        this.clearDataRow();
    },

    reset: function() {
        this.curPageIndex = 0;
        this.totalRowCount = 0;
    },

    load: function() {
        var form = YIUI.FormStack.getForm(this.ofFormID);
        var showLV = YIUI.ShowListView(form, this);
        showLV.load(this);

        // form.getUIProcess().resetComponentStatus(this); // 2023.9.28 ignore by guojs, 影响自定义样式代码
        this.refreshSelectAll();
    },

    repaint: function() {
        if(!this.el) return;
        this.clearDataRow();
        this.addDataRow(this.data);
        
        if( this._pagination ) {
            if ( this.totalRowCount < this.pageRowCount ) {
                this._pagination.hidePagination();
                this._pagination.content.css("height", "100%");
            } else if ( this.totalRowCount ) {
                this._pagination.setTotalRowCount(this.totalRowCount, this.curPageIndex == 0);
            }
        }
        this.addEmptyRow();
    },

    needTip: function() {
        return false;
    },

    install: function () {
        var self = this;

        self._pagination.pageChanges = function(pageNum) {
            
            self._selectOID = null;
            self._selectedRow = null;
            self.handler.doGoToPage(self, pageNum); // 下一页，问题是加载数据是异步的
            
            var $body = $(".lv-body", self.el);
            $body.scrollLeft(0);
            $body.scrollTop(0);
        }

        if(this.hasDblClick){
            self.$table.delegate(".tbl-body tr.data", "dblclick", function(event) {
                if(!self.enable || $(this).attr("enable") == "false") return;
                var rowIndex = $(event.target).parents('tr.data').index() - 1;
                self.handler.doOnRowClick(self, rowIndex, self.rowDblClick);
            });
        }

        // 全选按钮点击事件
        self.$table.delegate(".lv-head .chk","click",function (event) {
            // if( $(this).attr("enable") !== 'true' )
            //     return;
            var checked = !$(this).hasClass('checked');
            self.needCheckSelect = false;
            for (var i = 0, len = self.getRowCount(); i < len; i++) {
                self.setValByIndex(i,self.selectFieldIndex,checked,true);
            }
            $(this).toggleClass('checked').removeClass('select');
            self.needCheckSelect = true;
        });

        // 列头排序
        var $thead = $(".tbl-head thead", this.$table);
        $("th",$thead).click(function () {
            var index = $(this).index();
            if( index == 0 || index - 1 == self.selectFieldIndex || index - 1 >= self.columnInfo.length ) {
                return;
            }
            var column = self.columnInfo[index - 1];
            if( !column.sortable ) {
                return;
            }

            var order = "asc";
            if( self.lastsort === index ) {
                order = self.sortorder == "asc" ? "desc" : "asc";
            } else if ( self.lastsort != null ) {
                var el = $("th",$thead).eq(self.lastsort);
                // $("span.s-ico",el).hide();
                $("span.s-ico",el).removeClass("ui-lv-sort-asc").removeClass("ui-lv-sort-desc");
                $("label", el).css({width: "100%"});
            }

            var lastClass = 'ui-lv-sort-' + (order == "asc" ? "desc" : "asc"),
                curClass = 'ui-lv-sort-' + order;

            $("span.s-ico", this).removeClass(lastClass).addClass(curClass).show();

            var width = $(this).width() - $("span.s-ico", this).width();
            $("label", this).css({width: width + "px"});

            self.handler.sort(self, index - 1, order);

            self.lastsort = index;
            self.sortorder = order;
        });

        self.$table.delegate(".tbl-body>tbody>tr", "click", function(event) {
            if(!self.enable || $(this).attr("enable") == "false") return;
            if(!$(this).hasClass("data")) {
                return;
            }

            var rowChange = true;

            var rowIndex = -1;
            if( $(event.target).hasClass("data") ) {
                rowIndex = $(event.target).index() - 1;
            } else {
                rowIndex = $(event.target).parents('tr').index() - 1;
            }

            var oldIndex;
            if(self._selectedRow) {
                oldIndex = self._selectedRow.index() - 1;

                rowChange = (oldIndex != rowIndex);
                self._selectedRow.removeClass("clicked");
            }

            $(this).addClass("clicked");
            self._selectedRow = $(this);
            self._selectOID = self.getValByKey($(this).index() - 1,YIUI.SystemField.OID_SYS_KEY);

            // 点击checkbox等,不执行事件
            if( event.target.tagName !== 'TD' ) {
                return;
            }

            if(self.hasClick){
                self.handler.doOnRowClick(self, rowIndex, self.rowClick);
            }
            if(rowChange && self.hasRowChanged){
                self.handler.doOnRowClick(self, rowIndex, self.focusRowChanged);
            }
        });

        if (this.layoutViewInvoker) {
            this.layoutViewInvoker.install();
        } else {
            self.$table.delegate(".tbl-body tbody .chk", "click", function(event){
                if(!self.enable || $(this).attr("enable") == "false"){
                    return;
                }

                var hitRow = $(event.target).parents('tr'),
                    rowIndex = hitRow.index() - 1,
                    colIndex = $(event.target).parent('td').index() - 1,
                    value = !$(this).hasClass("checked");

                self.doSelect(rowIndex,colIndex,value,event.shiftKey);

                // 继续传播事件,为了选中行,但不执行行事件
             //   event.stopPropagation();
            });

            self.$table.delegate(".btn", 'click',function(event){
                if(!self.enable || $(this).attr("enable") == "false") return;
                var colKey = $(this).data("key");
                var rowIndex = $(event.target).parents('tr').index() - 1;
                self.handler.doOnCellClick(self, rowIndex, colKey);
                event.stopPropagation();
            });

            self.$table.delegate(".hlk", 'click',function( event){
                if(!self.enable || $(this).attr("enable") == "false") return;
                var _url = $(this).data("url");
                var _target = $(this).data("target");
                if(_url && _target == YIUI.Hyperlink_TargetType.New) {
                    window.open(_url, YIUI.Hyperlink_target.New, "alwaysRaised=yes");
                } else if(!_url){
                    var rowIndex = $(event.target).parents('tr').index() - 1;
                    var colKey = $(this).data("key");
                    self.handler.doOnCellClick(self, rowIndex , colKey);
                    event.stopPropagation();
                }

            });
        }
        var $body = $(".lv-tb .lv-body", this.el);
        var $head = $(".lv-tb .lv-head", this.el);
        $body.scroll(function() {
            var left = $body.scrollLeft();
            if(left >= 0) {
                $head.scrollLeft(left);
                if($body[0].clientWidth != $body[0].scrollWidth) {
                    var scroll_w = $body.width() - $body[0].clientWidth;
                    $(".space", $head).outerWidth(scroll_w);
                }
            }
            self.syncHandleWidths();
        });

        
        $(".lv-head th").hover(function(){
            $(this).css("background-color","#ededed");
            var parents = $(this).parents(".lv-div").children(".rc-handle-cntr").children();
            for (var i = 0; i < parents.length; i++) {
                if(i == $(this).index()){
                    parents.eq(i).css({
                        "border-right-color":"#cccccc",
                        "background-color":"#ededed"
                    });
                    break;
                }
            }
         },function(){
              $(this).css("background-color","#f5f5f5");
              $(".rc-handle").css({
                    "border-right-color":"#f5f5f5",
                    "background-color":"#f5f5f5"
              });
         });

        // $(".rc-handle").hover(function(){
        //     $(this).css("border-right-color","#cccccc");
        // });

        self.$table.on('keydown', ".ui-txta", function( event){
            return false;

        });
    },

    setVisible: function(visible) {
        this.base(visible);
        if(this.initVisible != undefined && !this.initVisible && visible) {
            // this._createHandles();
            this.syncHandleWidths();
            this.initVisible = true;
        }
    },

    _createHandles: function () {
        if (this.layoutViewInvoker) {
            this.layoutViewInvoker._createHandles();
            return;
        }

        var _this = this;
        this.$handleContainer = $("<div class='rc-handle-cntr'/>");
        this.$table.before(this.$handleContainer);
        this.$table.find('tr th').each(function (i, el) {
            var $handle;
            $handle = $("<div class='rc-handle' />");
            $handle.data('th', $(el));
            $handle.bind('mousedown', _this, function (e) {
                var $currentGrip , $leftColumn  , leftColOldW  , _this = e.data;
                e.preventDefault();
                $currentGrip = $(e.currentTarget);
                $leftColumn = $currentGrip.data('th');
                leftColOldW = $leftColumn.outerWidth();
                var target = $(e.target);
                target.attr("display","block");
                target.addClass("clicked");
                target.css("height",_this.$table.height());
                
                target.data("startPos", target.position().left);
                var startPosition = e.clientX;
                var difference , leftColW, tblWidth;
                var table = $leftColumn.parents("table").eq(0);
                
                var $body = $(".lv-tb .lv-body", _this.el);
                var client_h1 = ($body[0].clientHeight || $body.height());
                $(document).on('mousemove.rc', function (e) {
                    difference = e.clientX - startPosition;
                    target.css('left', target.data("startPos") + difference);
                    leftColW = leftColOldW + difference;
                    tblWidth = table.width() + difference;
                    if(leftColW < 10) {
                        leftColW = 10;
                        tblWidth += 10 - leftColW;
                    }
                });
                return $(document).one('mouseup', function (e) {
                    $(document).off('mousemove.rc');
                    var leftWidth = $leftColumn.outerWidth();
                    $leftColumn.outerWidth(leftColW);
                    //$("label", $leftColumn).width($leftColumn.width() - $(".chk", $leftColumn).width());
                    var index = $leftColumn.index();
                    var $td_b = $(".lv-tb .lv-body tr.first td", _this.el).eq(index);
//                    $td_b.outerWidth(leftColW);
//                    $td_b.css("width", leftColW);
                    //字典模糊搜索框
                    if($leftColumn.parents().hasClass("dtquery")){
                        var headWidth = $leftColumn.parents(".tbl-head").outerWidth() + ($leftColumn.outerWidth() - leftWidth);
                        $leftColumn.parents(".tbl-head").css("width", headWidth);
                        $td_b.parents(".tbl-body").css("width", headWidth);
                        var lvWidth = parseInt(_this.el.css("max-width"));
                        if(headWidth > lvWidth){
                            _this.$table.css("width",lvWidth);
                        }else{
                            _this.$table.css("width",headWidth);
                        }
                    }
                    $td_b.css("width", $leftColumn.outerWidth());
//	                table.width(tblWidth);
                    target.removeClass("clicked");
                    target.css("height","36");
                    var client_h2 = ($body[0].clientHeight || $body.height());
                    if(client_h1 != client_h2) {
                        // _this.addEmptyRow();
                    }
                    return _this.syncHandleWidths();
                });
            });
            return $handle.appendTo(_this.$handleContainer);
        });
    },

    syncHandleWidths: function () {
        var _this = this;
        this.$handleContainer.width(this.$table.width());
        this.$handleContainer.find('.rc-handle').each(function (_, el) {
        	if(_this.$handleContainer.offset().left != 0){
        		$(el).css({
	                left: $(el).data('th').outerWidth() + ($(el).data('th').offset().left - _this.$handleContainer.offset().left),
	                height: 36
	            });
        	}
        });
    },

    getFocusRowIndex: function() {
        var index = -1;
        if(this._selectedRow) {
            index = this._selectedRow.index() - 1;
        }
        return index;
    },

    findIndex: function(colKey) {
        var cols = this.columnInfo, index = -1;
        for (var i = 0, len = cols.length; i < len; i++) {
            if(cols[i].key == colKey){
                index = i;
                break;
            }
        }
        return index;
    },

    // 是否需要检查全选状态
    needCheckSelect:true,

    refreshSelectAll:function () {
        if( !this.needCheckSelect || this.selectFieldIndex == -1 )
            return;
        var $chk = $(".lv-head .chk", this.el);
        if( $chk.length == 0 )
            return;
        var selectAll = true,select = false;
        if( this.getRowCount() > 0 ) {
            for (var i = 0, len = this.getRowCount(); i < len; i++) {
                var v = this.getValue(i, this.selectFieldIndex);
                if(v){
                    select = true;
                } else {
                    selectAll = false;
                }

                if(!selectAll && select) {
                    break;
                }
            }
        } else {
            selectAll = false;
        }
        $chk.attr('isChecked',false).removeClass('checked');
        if( selectAll ) {
            $chk.removeClass('select').addClass('checked').attr("isChecked",true);
        } else if(select) {
            $chk.addClass('select');
        } else {
            $chk.removeClass('select');
        }
    },

    doSelect:function (rowIndex,colIndex,value,shiftDown) {
        var column = this.columnInfo[colIndex],
            self = this;
        if( shiftDown && !column.singleSelect ) {
            var focusIndex = self.getFocusRowIndex();
            focusIndex = focusIndex == -1 ? rowIndex : focusIndex;

            var start = Math.min(focusIndex, rowIndex);
            var end = Math.max(focusIndex, rowIndex);

            self.handler.selectRange(self,start,end + 1,colIndex,value);
        } else {
            self.setValByIndex(rowIndex,colIndex,value,true);
        }
    },

    setValByKey: function(rowIndex, colKey, value, fireEvent) {
        this.setValByIndex(rowIndex, this.findIndex(colKey), value, fireEvent);
    },

    setValByIndex: function(rowIndex, colIndex, value, fireEvent) {
        var changed = this.setValueAt(rowIndex, colIndex, value);
        if( changed ) {
            var form = YIUI.FormStack.getForm(this.ofFormID);

            // 单选,清除其他字段,多选,检查全选
            if( colIndex == this.selectFieldIndex ) {

                // 单选检查
                if( this.singleSelect ) {
                    this.handler.selectSingle(this,rowIndex,colIndex,value);
                }
                // 选中当前行
                this.handler.selectRow(form,this,rowIndex,colIndex,value);

                // 全选检查
                if( !this.singleSelect ) {
                    this.refreshSelectAll();
                }
            }

            if( fireEvent ) {
                var column = this.columnInfo[colIndex];
                if( column.valueChanged ) {
                    var cxt = new View.Context(form);
                    cxt.updateLocation(this.key,rowIndex,-1);
                    form.eval(column.valueChanged, cxt, null);
                }
            }
        }
    },

    // 只设值,不触发事件
    setValueAt: function(rowIndex, colIndex, value) {
        var column = this.columnInfo[colIndex],key = column.key;
        var row = this.data[rowIndex];
        row[key] = row[key] || {};

        var oldValue = row[key].value;

        var options = {
            oldVal:oldValue,
            newVal:value
        };

        var listView = this;
        var def = $.Deferred();

        var caption = "";
        switch (column.columnType) {
            case YIUI.CONTROLTYPE.DATEPICKER:
                if (value) {
                	value = YIUI.TypeConvertor.toDate(value);
                	var format = "";
                	if( column.onlyDate ) {
                        format = "yyyy-MM-dd";
                    } else {
                        format = column.format || "yyyy-MM-dd HH:mm:ss";
                    }
                    caption = value.Format(format);
                }
                def.resolve(caption);
                break;
            case YIUI.CONTROLTYPE.DICT:
                var val;
                if( column.multiSelect && value) {
                    val = [];
                    var oids = value.split(','), o;
                    for(var j = 0;j < oids.length;j++){
                        o = oids[j].trim();
                        if($.isNumeric(o)){
                            var oid = YIUI.TypeConvertor.toLong(o);
                            val.push(new YIUI.ItemData({
                                oid : oid,
                                itemKey : column.itemKey
                            }));
                        }
                    }
                } else {
                    var oid = YIUI.TypeConvertor.toLong(value);
                    val = new YIUI.ItemData({itemKey: column.itemKey, oid: oid});
                }

                var form = YIUI.FormStack.getForm(listView.ofFormID);

                var captionCache;
                if(form && form.getDocument()){
                    captionCache = form.getDocument().getExpData(YIUI.DocExpandDataKeys.DICT_CAPTIONS);
                }
            
                def = YIUI.DictHandler.getShowCaption(form, val, column.multiSelect, column.independent, column.textField, captionCache);
                break;
            case YIUI.CONTROLTYPE.COMBOBOX:
            case YIUI.CONTROLTYPE.CHECKLISTBOX:
                var form = YIUI.FormStack.getForm(listView.ofFormID);
                def =  YIUI.ComboBoxHandler.getItems(form, column)
                            .then(function(items){
                                    var caption = '', item;
                                    var sourceType = column.sourceType;
                                    var multiSelect = column.columnType == YIUI.CONTROLTYPE.CHECKLISTBOX ? true : false;
                                    caption = YIUI.ComboBoxHandler.getShowCaption(sourceType, items, value, multiSelect, true);
                                    return caption;
                                });
                
                break;
            case YIUI.CONTROLTYPE.NUMBEREDITOR:
                var decScale = column.scale;
                var roundingMode = column.roundingMode;
            	var showZero = $.isDefined(column.showZero) ? column.showZero : false;
            	
                var d = null;
                if (value) {
                    d = YIUI.TypeConvertor.toDecimal(value);
                    if(d.isZero() && !showZero){
                    	caption = '';
                    }else{
                    	caption = d.toFormat(decScale, roundingMode);
                    }
                }
                def.resolve(caption);
                break;
            case YIUI.CONTROLTYPE.LABEL:
                caption = value;
                def.resolve(YIUI.TypeConvertor.toString(caption));
                break;
            case YIUI.CONTROLTYPE.MONTHPICKER:
            	if(value != 0 && value != null){
                    text = YIUI.TIMEFORMAT.monthPickerFormat(value + "");
        		}else{
        			text = "";
        		}
            	
            	def.resolve(text);
            	break;
            case YIUI.CONTROLTYPE.TIMEPICKER:
            	var text;
            	if(value != 0 && value != null){
        			text = YIUI.TIMEFORMAT.timePickerFormat(column.second, value + "");
        		}else{
        			text = "";
        		}
            	def.resolve(text);
            	break;
            case YIUI.CONTROLTYPE.TEXTAREA:
                var maxLength = column.maxLength;
                var settings = {maxLength: options.maxLength};
                var strV = YIUI.TextFormat.format(value, settings);
                caption = strV;
            	def.resolve(strV);
                break;
            default:
                caption = value;
                def.resolve(YIUI.TypeConvertor.toString(caption));
                break;
        }

        row[key].value = value;

        def.then(function(caption){
            var rows = listView.data;
            if(rowIndex >= rows.length){
                return;
            }
            var cells = rows[rowIndex];

            cells[key].caption = caption;
            if(!listView.el){
                return ;
            }

            var $tr = $("table.tbl-body tr.data", listView.$table)[rowIndex];
            if(!$tr){
                return;
            }
            var $td = $("td", $tr).eq(colIndex + 1);

            switch(column.columnType){
                case YIUI.CONTROLTYPE.CHECKBOX:
                    var $chk = $td.children();
                    $chk.attr('isChecked', 'false').removeClass("checked");
                    if( value ) {
                        $chk.attr('isChecked','true').addClass("checked");
                    }
                    break;
                case YIUI.CONTROLTYPE.BUTTON:
                    $("button span.txt", $td).html(value);
                    break;
                case YIUI.CONTROLTYPE.HYPERLINK:
                    $td.children("a").html(value);
                    break;
                default:
                    $td.text(caption);
            }
        });
        return YIUI.BaseBehavior.checkAndSet(options);
    },

    getColumnInfo:function (key) {
        for (var i = 0, length = this.columnInfo.length; i < length; i++) {
            var colInfo = this.columnInfo[i];
            if (colInfo.key === key) {
                return colInfo;
            }
        }
        return null;
    },

    getValue: function(rowIndex , colIndex) {
        var dbKey = this.columnInfo[colIndex].key;
        return this.getValByKey(rowIndex, dbKey);
    },

    getValByKey: function(rowIndex, colKey) {
        var data = this.data[rowIndex],
            v = data[colKey];
        return v && v.value;
    },

    getRowCount: function(){
        return this.data.length;
    },

    getRowDataAt: function(rowIndex) {
        return this.data[rowIndex];
    },

    deleteRow: function(rowIndex) {
        this.handler.rowDelete(this,rowIndex); // 删除数据

        this.data.splice(rowIndex, 1); // 删除行
        var $tbody = $(".tbl-body tbody", this.$table);
        $("tr.data", $tbody).eq(rowIndex).remove();
        for (var i = rowIndex,index = i + 1; i < this.data.length + 1; i++) {
            var $tr = $("tr.data", $tbody).eq(i);
            $(".seq", $tr).html(index);
            if(index % 2 == 0) {
                $tr.addClass("even");
            } else {
                $tr.removeClass("even");
            }
        }
        $("tr.space", $tbody).remove();
        this.addEmptyRow();
    },
    insertRow: function(idx,fireEvent){
        var row = {};
        $.each(this.columnInfo , function(i , column) {
            row[column.key] = {};
        });
        var rowIndex = -1;
        if( idx == undefined || idx == -1 || idx == this.data.length ) {
            this.data.push(row);
            rowIndex = this.data.length - 1;
        } else {
            this.data.splice(idx,0,row);
            rowIndex = idx;
        }
        var newRow = [];
        newRow.push(row);
        this.addDataRow(newRow,idx);
        this.handler.rowInsert(this,idx,fireEvent);
        this.addEmptyRow();
        return rowIndex;
    }
});
YIUI.reg('listview', YIUI.Control.ListView);
