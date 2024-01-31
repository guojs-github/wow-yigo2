/**
 * 表格插件
 */
(function ($) {
    "use strict";

    $.ygrid = $.ygrid || {};

    $.extend($.ygrid, {//表格内部使用方法初始化
        version: "1.0.0",
        guid: 1,
        uidPref: 'ygd',
        minWidth: 50,
        regExp: /^#[0-9a-fA-F]{6}$/,
        format: "yyyy-MM-dd HH:mm:ss",
        msie: navigator.appName === 'Microsoft Internet Explorer',  //是否是IE
        getFitWidth: function (el) {
            var span = document.getElementById("__getWidth");
            if (span == null) {
                span = document.createElement("span");
                span.id = "__getWidth";
                document.body.appendChild(span);
                span.style.visibility = "hidden";
                span.style.whiteSpace = "nowrap";
            }

            var pl = $(el).css("padding-left"),
                pr = $(el).css("padding-right");

            span.innerText = el.innerText;
            span.style.fontSize = "15px";
            return parseInt(pl) + span.offsetWidth + parseInt(pr);
        },
        msiever: function () {     //ie版本号
            var rv = -1;
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null) {
                rv = parseFloat(RegExp.$1);
            }
            return rv;
        },
        getCellIndex: function (cell) {  //获取单元格序号
            var c = $(cell);
            if (c.is('tr')) {
                return -1;
            }
            c = (!c.is('td') && !c.is('th') ? c.closest("td,th") : c)[0];
            if ($.ygrid.msie) {
                return $.inArray(c, c.parentNode.cells);
            }
            return c.cellIndex;
        },
        formatString: function (format) { //格式化类似" {0} 共 {1} 页"的字符串，将{}按序号替换成对应的参数
            var args = $.makeArray(arguments).slice(1);
            if (format == null) {
                format = "";
            }
            return format.replace(/\{(\d+)\}/g, function (m, i) {
                return args[i];
            });
        },
        stripPref: function (pref, id) {  //去除id的前缀，返回去除后的id
            var obj = $.type(pref);
            if (obj === "string" || obj === "number") {
                pref = String(pref);
                id = pref !== "" ? String(id).replace(String(pref), "") : id;
            }
            return id;
        },
        stripHtml: function (v) {  //去除html标签，返回标签内容
            v = String(v);
            var regexp = /<("[^"]*"|'[^']*'|[^'">])*>/gi;
            if (v) {
                v = v.replace(regexp, "");
                return (v && v !== '&nbsp;' && v !== '&#160;') ? v.replace(/\"/g, "'") : "";
            }
            return v;
        },
        randId: function (prefix) { //注册ID：添加前缀，进行ID分配
            return (prefix || $.ygrid.uidPref) + ($.ygrid.guid++);
        },
        intNum: function (val, defval) {
            val = parseInt(val, 10);
            if (isNaN(val)) {
                return defval || 0;
            }
            return val;
        },
        extend: function (methods) {  //继续扩展继承，主要用于添加方法
            $.extend($.fn.yGrid, methods);
            if (!this.no_legacy_api) {
                $.fn.extend(methods);
            }
        }
    });

    $.fn.yGrid = function (options) {
        if (this.grid) {
            return;
        }
        if (typeof options === 'string') {   //如果是字符串类型，则是执行表格的事件
            var fn = $.fn.yGrid[options];//得到表格事件
            if (!fn) {
                throw ("yGrid - No such method: " + options);
            }
            var args = $.makeArray(arguments).slice(1);
            return fn.apply(this, args);  //执行表格事件
        }
        return this.each(function () {
            var p = {
                enable: true,//是否可用
                width: 100, //宽度
                height: 150, //高度
                rowNum: 50, //一页显示的行数
                minColWidth:33, // 列最小宽度
             //   showToolBox: true,   //是否显示底部操作工具条
                showPageSet: true, //是否使用分页操作按钮及页码输入
                navButtons: {}, // 工具条上的操作按钮
                scrollPage: false,  //是否使用滚动来代替分页操作，及滚动翻页，如为true，则屏蔽分页操作按钮及页码输入
                colModel: [],  //列集合,其中列的属性为：name:名称,label:显示名称,sortable:排序,editable:可编辑,align:文本位置
                //    colNames: [],  //子叶列的名称(name)或者显示文本(label),比如[列1,列2]
                data: [],  //行数据，比如为[{col1:[value1-1,caption1-1],col2:[value2-1,caption2-1]},{col1:[value1-2,caption1-2],col2:[value2-2,caption2-2]}
                editCells: [],//已经进行编辑的单元格，需要进行保存单元格
                //   _indexMap: {},
                viewRecords: true,//是否显示数据信息，比如“1 - 10 共100条”
                rowSequences: true,//是否显示序号列
                rowSeqWidth: 48, //序号列宽度
                scrollTimeout: 40,//滚动延时时间
                lastpage: 1, //最后一页页码
                clickRow:null,//行点击事件
                focusRowChanged:null,// 焦点行切换事件
                dblClickRow: null,//行双击事件
                dblClickCell: null,//单元格双击事件
                onSortClick: null,   //表头列单元排序点击事件
                specialCellClick: null,  //点击事件，通常是特殊单元格（button，hyperlink，checkbox）的点击事件
                createCellEditor: null, //创建自定义单元格编辑组件
                alwaysShowCellEditor: null,//创建一直显示的单元格编辑组件
                checkAndSet: null,
                endCheck: null,
                endCellEditor: null, //结束自定义编辑组件
                // afterEndCellEditor: null, //结束自定义编辑组件之后的事件
                // extKeyDownEvent: null,//额外的按键事件
                //afterCopy: null, //复制后的事件
                // afterPaste: null, //粘贴后的事件
                groupHeaders: [], //多行表头信息
                bestWidthStatus: false, // 最佳列宽状态
                rowList: [] // 动态分页每页行数范围
            };
            for (var key in options) {
                var value = options[key];
                if ($.isArray(value)) {
                    p[key] = value.slice(0);
                } else {
                    p[key] = value;
                }
            }
            options = null;
            var ts = this,
                grid = {
                    headers: [], //表头的所有子叶列
                    //  cols: [],  //表格第一行的所有单元格
                    dragStart: function (i, e, y) {  //修改列大小，拖动开始
                        var gridLeftPos = $(this.bDiv).offset().left;
                        this.resizing = { idx: i, startX: e.clientX, sOL: e.clientX - gridLeftPos };
                        this.hDiv.style.cursor = "col-resize";
                        this.curGbox = $("#rs_m" + p.id, "#gbox_" + p.id);
                        this.curGbox.css({display: "block", left: e.clientX - gridLeftPos, top: y[1], height: y[2]});
                        document.onselectstart = function () {  //不允许选中文本
                            return false;
                        };

                    },
                    dragMove: function (x) {      //修改列大小，拖动中
                        if (this.resizing) {
                            var diff = x.clientX - this.resizing.startX, h = this.headers[this.resizing.idx],
                                newWidth = h.width + diff;

                            if (newWidth > ts.p.minColWidth ) {
                                this.curGbox.css({left: this.resizing.sOL + diff});
                                this.newWidth = p.tblwidth + diff;
                                h.newWidth = newWidth;
                            }

                        }
                    },
                    dragEnd: function () {         //修改列大小，拖动结束
                        this.hDiv.style.cursor = "default";
                        if (this.resizing) {
                            var idx = this.resizing.idx, nw = this.headers[idx].newWidth || this.headers[idx].width;
                            nw = parseInt(nw, 10);
                            this.resizing = false;
                            this.curGbox && this.curGbox.css({display: "none"});
                            p.colModel[idx].width = nw;
                            this.headers[idx].width = nw;
                            this.headers[idx].el.style.width = nw + "px";
                            //this.cols[idx].style.width = nw + "px";
                            $("tr.ygfirstrow td:eq("+idx+")", ts.grid.bDiv).css("width",nw + "px");
                            p.tblwidth = this.newWidth || p.tblwidth;
                            $('table:first', this.bDiv).css("width", p.tblwidth + "px");
                            $('table:first', this.hDiv).css("width", p.tblwidth + "px");
                            this.hDiv.scrollLeft = this.bDiv.scrollLeft;
                            $(ts).triggerHandler("yGridResizeStop", [nw, idx]);
                        }
                        this.curGbox = null;
                        document.onselectstart = function () {  //允许选中文本
                            return true;
                        };
                    },
                    populateVisible: function () {
                        if (grid.timer) {
                            clearTimeout(grid.timer);
                        }
                        grid.timer = null;
                        var dh = $(grid.bDiv).height();
                        if (!dh) {
                            return;
                        }
                        var table = $("table:first", grid.bDiv);
                        if( table.length == 0 ) {
                            return;
                        }
                        var rowHeight;
                        //  取行高的算法 在行高不一致的情况下,有bug  TODO
                        if ( table[0].rows.length > 1 ) {
                            rowHeight = $(table[0].rows[1]).outerHeight();
                        } else {
                            rowHeight = grid.prevRowHeight;
                        }
                        if (!rowHeight) {
                            return;
                        }
                        grid.prevRowHeight = rowHeight;
                        var scrollTop = grid.scrollTop = grid.bDiv.scrollTop;
                        var ttop = Math.round(table.position().top) - scrollTop;
                        var tbot = ttop + table.height();
                        var div = rowHeight * p.rowNum;
                        var page, npage, empty;
                        if (tbot < dh && ttop <= 0 &&
                            (p.lastpage === undefined || parseInt((tbot + scrollTop + div - 1) / div, 10) <= p.lastpage)) {
                            npage = parseInt((dh - tbot + div - 1) / div, 10);
                            if (tbot >= 0 || npage < 2 || p.scrollPage === true) {
                                page = Math.round((tbot + scrollTop) / div) + 1;
                                ttop = -1;
                            } else {
                                ttop = 1;
                            }
                        }
                        if (ttop > 0) {
                            page = parseInt(scrollTop / div, 10) + 1;
                            npage = parseInt((scrollTop + dh) / div, 10) + 2 - page;
                            empty = true;
                        }

                        if (npage) {
                            if (p.lastpage && (page > p.lastpage || p.lastpage === 1 || (page === p.page && page === p.lastpage))) {
                                return;
                            }
                            p.page = page;
                            if (empty) {
                                grid.emptyRows.call(table[0], false);
                            }
                            grid.populate(npage);
                        }
                    },
                    scrollGrid: function (e) {

                        // 现在锁定做了table的偏移,事件暂时不需要

                        // 列动态锁定时对横向滚动做限制
                        // var nsl = grid.bDiv.scrollLeft;
                        // if( p.frozenColumns && nsl < grid.fsl ) {
                        //     grid.bDiv.scrollLeft = grid.fsl;
                        //     grid.hDiv.scrollLeft = grid.fsl;
                        //     return e.preventDefault();
                        // }

                        // 行动态锁定时对纵向滚动做限制
                        // var nst = grid.bDiv.scrollTop;
                        // if( p.frozenRows && nst < grid.fst ) {
                        //     grid.bDiv.scrollTop = grid.fst;
                        //     return e.preventDefault();
                        // }

                        // 因为滚动有延迟,所以为了保持锁定显示一致,加在最前面
                        if( p.frozenColumns ) {
                            grid.fbDiv.scrollTop( grid.bDiv.scrollTop );
                        }
                        if( p.frozenRows ) {
                            grid.fbDiv2.scrollLeft( grid.bDiv.scrollLeft );
                        }
                        if ( p.scrollPage ) {
                            var scrollTop = grid.bDiv.scrollTop;
                            if (grid.scrollTop === undefined) {
                                grid.scrollTop = 0;
                            }
                            if (scrollTop !== grid.scrollTop) {
                                grid.scrollTop = scrollTop;
                                if (grid.timer) {
                                    clearTimeout(grid.timer);
                                }

                                grid.timer = setTimeout(grid.populateVisible, p.scrollTimeout);
                            }
                        }
                        grid.hDiv.scrollLeft = grid.bDiv.scrollLeft;
                        if (e) {
                            e.stopPropagation();
                        }
                    }
                },
                // 选择模型
                selectModel = {
                    selectionMode:p.selectionMode,
                    focusRow:-1,
                    focusCol:-1,
                    oldRowIndex:-1,
                    oldColIndex:-1,
                    left:-1,
                    top:-1,
                    right:-1,
                    bottom:-1,
                    changed:false,
                    select:function (left,top,right,bottom,focusRow,focusCol) {
                        switch (this.selectionMode) {
                            case YIUI.SelectionMode.RANGE:
                                this.changed = this.left !== left || this.top !== top || this.right !== right || this.bottom !== bottom
                                    || this.focusRow !== focusRow || this.focusCol !== focusCol;
                                this.left = left;
                                this.top = top;
                                this.right = right;
                                this.bottom = bottom;
                                break;
                            case YIUI.SelectionMode.ROW:
                            case YIUI.SelectionMode.CELL:
                                this.changed = this.focusRow != focusRow || this.focusCol != focusCol;
                                break;
                        }
                        this.oldRowIndex = this.focusRow;
                        this.oldColIndex = this.focusCol;
                        this.focusRow = focusRow;
                        this.focusCol = focusCol;
                        return this.changed;
                    }
                };
            p.selectModel = selectModel;
            var setColWidth = function () {    //初始化列宽，以及表格宽度
                var th = this;
                th.p.scrollOffset = 18;
                var initWidth = 0, scw = $.ygrid.intNum(th.p.scrollOffset), cw;
                $.each(th.p.colModel, function (index, col) {
                    if (this.hidden === undefined) {
                        this.hidden = false;
                    }
                    this.widthOrg = cw = $.ygrid.intNum(col.width);
                    if (this.hidden === false) {
                        initWidth += cw;
                    }
                });
                if (isNaN(th.p.width)) {
                    th.p.width = initWidth + (!isNaN(th.p.height) ? scw : 0);
                }
                grid.width = th.p.width;
                th.p.tblwidth = initWidth;
            };
            var getOffset = function (iCol) {     //获取某个列的位置信息
                var th = this, $th = $(th.grid.headers[iCol].el);
                var ret = [$th.position().left + $th.outerWidth()];
                ret[0] -= th.grid.bDiv.scrollLeft;
                ret.push($(th.grid.hDiv).position().top);
                ret.push($(ts.grid.bDiv).offset().top - $(ts.grid.hDiv).offset().top + $(ts.grid.bDiv).height());
                return ret;
            };

            /** 很据模型中的行列查询配置对象*/
            ts.getCellEditOpt = function(rowIndex, colIndex){
                var grid = ts.getControlGrid();
                return grid.getCellEditOpt(rowIndex,colIndex);
            };

            var formatCol = function (column,editOpt,cellData,rowData,isTreeCol) { //格式化单元格，主要是设置单元格属性
                var th = this,align = editOpt.align ? editOpt.align : column.align,
                  meta = editOpt.editOptions, result = ["style='"];
                if (align) {
                    result.push("text-align:");
                    result.push(align);
                    result.push(";");
                }
                if( editOpt.topBorder ) {
                    result.push("border-top: 1px solid black;");
                }
                if( editOpt.rightBorder ) {
                    result.push("border-right: 1px solid black;");
                }
                if( editOpt.bottomBorder ) {
                    result.push("border-bottom: 1px solid black;");
                }
                if( editOpt.leftBorder ) {
                    result.push("border-left: 1px solid black;");
                }
                if( isTreeCol ) {
                    result.push("padding-left:");
                    result.push(rowData.treeLevel * 16 + "px");
                    result.push(";");
                }
                if (cellData && cellData.backColor) {
                    result.push("background-color:");
                    result.push(cellData.backColor);
                    result.push(";");
                }
                var foreColor;
                if( cellData ) {
                    foreColor = cellData.foreColor
                }
                if ( meta && meta.negtiveForeColor && parseFloat(cellData[0]) < 0 ) {
                    foreColor = meta.negtiveForeColor;
                }
                if( foreColor ) { // 负数前景色覆盖默认前景色
                  result.push("color:");
                  result.push(foreColor);
                  result.push(";");
                }
                if (column.hidden === true) {
                    result.push("display:none;");
                }

                if (cellData && (cellData.length > 4 && cellData[4] || cellData.length > 3 && cellData[3])) {
                    result.push("position:relative;");
                }

                result.push("' class='");

                if( meta ) {
                    var cellType = meta.cellType;

                    if ( cellData && !cellData[2] && !rowData.backColor ) {
                        result.push("ui-cell-disabled ");
                    }

                    if ( cellType == YIUI.CONTROLTYPE.IMAGE ) {
                        result.push("ui-cell-image ");
                    }

                    if ( editOpt.isAlwaysShow ) {
                        result.push("always-show "); // 居中显示
                    } else {
                        result.push("space ");// 增加8px显示间距
                    }
                }

                result.push("'");

                var tip = (cellData && cellData[1]) || editOpt.tip;

                if( tip ) {
                   result.push([" title='" , $.ygrid.stripHtml(tip), "' "].join(""));
                }

                result.push(" aria-describedby='");
                result.push([th.p.id, "_", column.name , "'"].join(""));
                return result.join("");
            };

            var addCell = function (column, editOpt, cellData, rowData, isTreeCol) {       //添加单元格
                var prp = formatCol.call(ts, column, editOpt, cellData, rowData, isTreeCol);
                var tcIcon = "";
                if ( isTreeCol && rowData.rowType === 'Detail' ) {
                    var icon = rowData.treeExpand ? "cell-expand" : "cell-collapse";
                    if (rowData.isLeaf) {
                        tcIcon = ["<span class='cell-treeIcon ", "'></span>"].join("");
                    } else {
                        tcIcon = ["<span class='cell-treeIcon ", icon, "'></span>"].join("");
                    }
                }

                var err = "";
                if(cellData.length > 3 && cellData[3]){
                    err = ["<div class='ui-cell-required' title='必填","'>","</div>"].join("");
                }else if(cellData.length > 4 && cellData[4]){
                    err = ["<div class='ui-cell-error' title='",cellData[5] || '',"'>","</div>"].join("");
                }

                return ["<td role=\"gridcell\" ", prp , ">", tcIcon, err, $.htmlEncode(cellData[1]), "</td>"].join("");
            };

            var gotBackColor = function (form,grid,backColor,ri,ci) {
                if( $.ygrid.regExp.test(backColor) ) {
                    return backColor;
                }

                var cxt = new View.Context(form);
                cxt.updateLocation(grid.key,ri,ci);
                return form.eval(backColor,cxt);
            }

            ts.gotBackColor = gotBackColor;

            var addGridRow = function (form, rowData, idx, hcount, load) {

                var $t = this,
                    $row = $($t).getGridRowById($.ygrid.uidPref + idx);

                 if( idx > $t.rows.length - 1 && !$row ) {
                     return;
                 }

                if( load && $row ) { // 批量删除行,会导致滚动条位置变化触发scroll
                    return;
                }

                var array = [], seq = $t.p.rowSequences ? 1 : 0, indexes = [],
                    rowId = $.ygrid.uidPref + idx,grid = $t.getControlGrid();

                var metaRow = grid.getMetaObj().rows[rowData.metaRowIndex];

                // 初始化行背景色
                if( metaRow.backColor ) {
                    rowData.backColor = gotBackColor(form,grid,metaRow.backColor,idx);
                }

                array.push(['<tr role="row" id="' , rowId , '" tabindex="-1" class="ui-widget-content ygrow ui-row-ltr">'].join(""));

                // 序号列
                if ( seq ) {
                  var prp = formatCol.call(ts, $t.p.colModel[0], {isAlwaysShow: true,align: "center"});
                  array.push(["<td role=\"gridcell\" class=\"ygrid-rownum\" " , prp, ">" , "<span></span></td>"].join(""));
                }

                var column,cellData,meta;
                for (var k = seq ? 1 : 0;column = $t.p.colModel[k]; k++) {
                    cellData = rowData.data[k - seq];
                    meta = cellData.typeDef || $t.getCellEditOpt(idx,k - seq);

                    if( meta.isAlwaysShow ) {
                        indexes.push(k);
                    }

                    if( meta.backColor ) {
                        cellData.backColor = gotBackColor(form,grid,meta.backColor,idx,k - seq);
                    }
                    array.push(addCell(column, meta, cellData, rowData, column.index === $t.p.treeIndex));
                }
                array.push("</tr>");

                var $table = $("table:first", $t.grid.bDiv);

                $table.removeClass("ui-ygrid-empty");

                var $Row = $(array.join(''));

                // 如果是往最后插或者表格还没行,直接追加
                if( idx == $t.rows.length - 1 || !$row ) {
                    $table.find("tbody:first").append($Row);
                } else {
                    $Row.insertBefore($row);
                }

                // 定义了高度
                if( rowData.rowHeight ) {
                    $Row.css("height",rowData.rowHeight);
                }

                $("td",$Row).hover(function () {
                    $(this).addClass("ui-state-hover");
                },function () {
                    $(this).removeClass("ui-state-hover");
                });

                // 修复第一列的单元格边框
                if( seq ) {
                    var metaCell = $t.getCellEditOpt(idx,0);
                    if( metaCell.leftBorder ) {
                        $(".ygrid-rownum",$Row).css({"border-right": "1px solid black"});
                    }
                }

                var row = $Row.get(0);

                row.id = rowId;

                // 显示单元格
                for (var c = 0, len = indexes.length; c < len; c++) {
                    $t.p.alwaysShowCellEditor.call($t, $(row.cells[indexes[c]]), idx, indexes[c] - seq);
                }

                if( $t.p.treeIndex != -1 && rowData.parentRow ) {
                    var index = grid.getRowIndexByID(rowData.parentRow.rowID);
                    var parentRow = $(this).getGridRowById($.ygrid.uidPref + index);

                    var $td = $("td:eq("+($t.p.treeIndex + ($t.p.rowSequences ? 1 : 0))+")",parentRow),
                        $span = $("span.cell-treeIcon",$td);

                    if( rowData.parentRow.treeExpand ) {
                        !$span.hasClass("cell-expand") && $span.addClass("cell-expand"); // 不设置多次
                      } else {
                        !$span.hasClass("cell-collapse") && $span.addClass("cell-collapse"); // 不设置多次
                      }

                      if( $span.hasClass('cell-collapse') ) { // 隐藏父行
                          $(row).hide();
                      }
                }

                if( meta.freezeColCnt == 0 && $t.p.freezeColCnt > 0 ) {
                    $("td:eq("+($t.p.freezeColCnt + ($t.p.rowSequences ? 0 : -1))+")",row).addClass("frozenColumn");
                }

                if( rowData.backColor ) {
                    $(row).css('background', rowData.backColor);
                }

                if( rowData.visible == false ) {
                    $(row).hide();
                } else {
                    if (ts.p.rowSequences) $("span", row.cells[0]).html(getRowNo(grid,idx,hcount));
                }

                return row;
            };

            var getRowNo = function (grid,ri,hcount) {
                var num = ri + 1 - hcount;
                if( grid.serialRowNum ) {
                    var pageInfo = grid.pageInfo,
                        pageIndex = pageInfo.curPageIndex,
                        pageCount = pageInfo.pageRowCount;
                    num += pageIndex * pageCount;
                }
                return num;
            }

            var loadGridData = function (data) {        //添加表格行
                if (data) {
                    if (!ts.p.scrollPage) {
                        grid.emptyRows.call(ts, false);
                    }
                } else {
                    return;
                }

                var control =  ts.getControlGrid(),
                    pageInfo = control.pageInfo;

                ts.p.records = pageInfo.totalRowCount;
                ts.p.page = $.ygrid.intNum(data[ts.p.localReader.page], ts.p.page);
                ts.p.reccount = data.rows.length;
                ts.p.lastpage = $.ygrid.intNum(data[ts.p.localReader.total], 1);

                var rowData,ri,row,form = YIUI.FormStack.getForm(control.ofFormID);
                var hcount = control.getHideRowCount();
                for (var i = 0, len = data.rows.length; i < len; i++) {
                    rowData = data.rows[i];
                    ri = ts.p.data.indexOf(rowData);

                    // 添加行
                    row = addGridRow.call(ts, form, rowData, ri, hcount, true);

                    // 初始化行错误信息
                    $(ts).setRowError(i, rowData.error, row);
                }

                ts.updatePager.call(ts);
            };

            ts.mergeCell = function () {
                var grid = ts.getControlGrid();
                if( !grid.hasFixCellMerge && !grid.hasDetailCellMerge && !grid.hasCellExpand ) {
                    return;
                }

                var metaObj = grid.getMetaObj(),
                    rowData,
                    cellData;

                var resolvecspan = function (ci,span) {
                    var model = ts.p.colModel,
                        cm,
                        ret = span,
                        c = 0;
                    for( var k = ci + 1;cm = model[k] && c < span;k++,c++ ) {
                        if( cm.hidden ) {
                            ret--;
                        }
                    }
                    return ret;
                }

                var resolverspan = function (ri,span) {
                    var row,
                        ret = span,
                        c = 0;
                    for( var r = ri + 1;row = ts.rows[r] && c < span;r++,c++ ) {
                        if( $(r).is(":hidden") ) {
                            ret--;
                        }
                    }
                    return ret;
                }

                var ci = ts.p.rowSequences ? 1 : 0;

                // 直接设置colspan和rowspan
                for( var i = 0,size = grid.getRowCount();i < size;i++ ) {
                    rowData = grid.getRowDataAt(i);
                    var $row = $(ts).getGridRowById($.ygrid.uidPref + i);
                    for( var k = 0;k < rowData.data.length;k++ ) {
                        cellData = rowData.data[k];
                        if( cellData.isMerged ) {
                            var rowspan = cellData.rowspan,
                                colspan = cellData.colspan;
                            if( cellData.isMergedHead ) {
                                if (rowspan > 0) {
                                    var span = resolverspan($row.rowIndex, rowspan);
                                    $($row.cells[ci + k]).attr("rowspan", span);
                                }
                                if (colspan > 0) {
                                    var span = resolvecspan(ci, colspan);
                                    $($row.cells[ci + k]).attr("colspan", span);
                                }
                            } else {
                                $($row.cells[ci + k]).hide();
                            }
                        }
                    }
                }
            };

            ts.afterRowOpt = function (ri, isDelete, baseNo) {
                var $t = this, idx, row,len = $t.rows.length;
                for (var i = ri; i < len; i++) {
                    row = $t.rows[i];
                    idx = parseInt($.ygrid.stripPref($.ygrid.uidPref, row.id), 10);
                    idx = idx + (isDelete ? -1 : 1);
                    row.id = $.ygrid.uidPref + idx;
                    if ($t.p.rowSequences && $(row).is(":visible")) {
                        $("span", row.cells[0]).html(baseNo++);
                    }
                }
            };

            ts.refreshRowNo = function () {
              var $t = this, row,len = $t.rows.length,
                control = ts.getControlGrid(),
                hcount = control.getHideRowCount(),
                baseNo = getRowNo(control,hcount,hcount);
              for (var i = 1; i < len; i++) {
                row = $t.rows[i];
                if ($t.p.rowSequences && $(row).is(":visible")) {
                  $("span", row.cells[0]).html(baseNo++);
                }
              }
            };

            ts.deleteGridRow = function (ri, fireEvent) {
                var $t = this, row = $($t).getGridRowById($.ygrid.uidPref + ri);
                if ( row ) {
                    var rowIndex = row.rowIndex,baseNo;
                    if( $t.p.rowSequences ) {
                       baseNo = YIUI.TypeConvertor.toInt($("span", row.cells[0]).html());
                    }

                    $(row).remove();

                    $t.afterRowOpt(rowIndex,true,baseNo);

                    // fireEvent 暂时没用
                    $t.p.pageInfo.totalRowCount--;
                    $t.p.records--;
                    $t.p.reccount--;
                    $t.updatePager.call($t);
                }
            };

            ts.insertGridRow = function (ri, rowData, fireEvent) {
                var $t = this,control = ts.getControlGrid();
                var form = YIUI.FormStack.getForm(control.ofFormID);
                var row = addGridRow.call($t, form, rowData, ri, control.getHideRowCount());

                if( row ) {
                    var rowIndex = row.rowIndex,baseNo;
                    if( fireEvent ) {
                      if( $t.p.rowSequences ) {
                         baseNo = YIUI.TypeConvertor.toInt($("span", row.cells[0]).html());
                      }
                      $t.afterRowOpt(rowIndex + 1,false,baseNo + 1);
                    }
                }
                
                $t.p.pageInfo.totalRowCount++;
                $t.p.records++;
                row && $t.p.reccount++;

                // 加载显示数据插入行时不调用
                if( fireEvent ) $t.updatePager.call($t);
            };

            ts.getColPos = function(colIndex){
                return colIndex + (ts.p.rowSequences ? 1 : 0);
            };

            ts.getColumnCount = function () {
                var count = ts.p.colModel.length;
                if( count > 0 ) {
                    return ts.p.rowSequences ? count - 1 : count;
                }
                return 0;
            }

            // '异步'
            // ts.knvFocus = function () {
            //     // if(!ts.p.scrollPage){
            //     //     return;
            //     //  }
            //     window.setTimeout(function () {
            //         if( !ts.grid )
            //             return;
            //         var scrollLeft = ts.grid.bDiv.scrollLeft,
            //             scrollTop = ts.grid.bDiv.scrollTop;
            //         $("#" + ts.p.knv).attr("tabindex", "-1").focus();
            //         ts.grid.bDiv.scrollTop = scrollTop;
            //         ts.grid.bDiv.scrollLeft = scrollLeft;
            //     }, 0);
            // };

            // 同步方式
            ts.knvFocus2 = function () {
                // window.setTimeout(function () {
                if( !ts.grid ) // 可能会异步调用,ts.grid不存在
                     return;
                //  点击时调用,滚动距离不会改变
                //  var scrollLeft = ts.grid.bDiv.scrollLeft,
                //      scrollTop = ts.grid.bDiv.scrollTop;
                $("#" + ts.p.knv).attr("tabindex", "-1").focus();
                //   ts.grid.bDiv.scrollTop = scrollTop;
                //   ts.grid.bDiv.scrollLeft = scrollLeft;
                //  }, 0);
            };

            var initQueryData = function () {   //初始化表格数据相关信息，主要是分页信息及数据
                if (!$.isArray(ts.p.data)) {
                    return null;
                }

                var data = ts.p.data,total = data.length,
                    grid = ts.getControlGrid();

                var recordsperpage;

                if( ts.p.scrollPage ) {
                    recordsperpage = parseInt(ts.p.rowNum, 10); // 滚动分页:rowNum=50
                } else {
                    recordsperpage = ts.p.data.length; // 非滚动分页:显示全部,rowNum无用
                }

                var page = parseInt(ts.p.page, 10),
                    totalpages = Math.ceil(total / recordsperpage),
                    result = {};
                data = data.slice((page - 1) * recordsperpage, page * recordsperpage);
                result[ts.p.localReader.total] = totalpages == 0 ? 1 : totalpages;
                result[ts.p.localReader.page] = page;
                result[ts.p.localReader.records] = total;
                result[ts.p.localReader.root] = data;

                data = null;
                return result;
            };
            grid.emptyRows = function (scroll) {
                var firstrow = ts.rows.length > 0 ? ts.rows[0] : null;
                $(this.firstChild).empty().append(firstrow);
                if (scroll && ts.p.scrollPage) {
                    $(ts.grid.bDiv.firstChild).css({height: "auto"});
                    $(ts.grid.bDiv.firstChild.firstChild).css({height: 0, display: "none"});
                    if (ts.grid.bDiv.scrollTop !== 0) {
                        ts.grid.bDiv.scrollTop = 0;
                    }
                }
            };
            grid.populate = function (npage) {        //表格载入数据计算
                if (ts.p.page === undefined || ts.p.page <= 0) {
                    ts.p.page = Math.min(1, ts.p.lastpage);
                }

                var lc;
                npage = npage || 1;
                if (npage > 1) {
                    lc = function () {
                        ts.p.page++;
                        grid.populate(npage - 1);
                    };
                }
                var data = initQueryData();
                loadGridData(data);
                if ( lc ) {
                    lc.call(ts);
                }

                ts.doFrozen();
            };

            ts.updatePager = function () {  //更新工具条，主要是分页操作按钮的显示和数据信息的显示
                var th = this;
                if ( th.p.scrollPage ) {    //如果是滚动分页，则修改顶部div，使可见区域呈现在对应位置
                    var $rows = $("tbody:first > tr:gt(0)", th.grid.bDiv);
                    var rh = $rows.outerHeight() || th.grid.prevRowHeight;
                    if (rh) {

                        // 新增使用reccount,打开使用records
                        var count = Math.max(th.p.reccount,th.p.records);

                        height = parseInt(count, 10) * rh;

                        $(">div:first", th.grid.bDiv).css({height: height});

                        if (th.grid.bDiv.scrollTop == 0 && th.p.page > 1) {
                            th.grid.bDiv.scrollTop = th.p.rowNum * (th.p.page - 1) * rh;
                        }
                    }
                    th.grid.bDiv.scrollLeft = th.grid.hDiv.scrollLeft;
                }

                ts.updateToolBox();    // 更新工具栏

                ts.updatePagination(); // 更新页码显示

                ts.updatePageOpt();    // 更新分页操作

                ts.updateRecords();    // 更新记录
            };

            ts.updatePageOpt = function () {
                var pageInfo = ts.p.pageInfo;

                //如果有分页操作，则更新操作按钮的显示以及输入框的页码
                if (pageInfo.pageLoadType != YIUI.PageLoadType.NONE) {
                    var total = pageInfo.totalRowCount,
                        curPage = pageInfo.curPageIndex + 1,
                        pageCount = pageInfo.pageCount;

                    var _id = "_" + ts.p.pager.substr(1);

                    if (curPage == 1 || total == 0) {
                        $("#first" + _id + ", #prev" + _id).addClass("ui-state-disabled");
                    } else {
                        $("#first" + _id + ", #prev" + _id).removeClass("ui-state-disabled");
                    }

                    if (curPage == pageCount || total == 0) {
                        $("#next" + _id + ", #last" + _id).addClass("ui-state-disabled");
                    } else {
                        $("#next" + _id + ", #last" + _id).removeClass("ui-state-disabled");
                    }
                }
            }

            ts.updateToolBox = function () {

                var control = ts.getControlGrid(),
                    pager = ts.grid.pager;

                $(["#add_" , ts.id , ",#del_" , ts.id, ", #upRow_" , ts.id, ", #downRow_" , ts.id, ",.ui-icon-extOpt"].join(""), pager).each(function () {

                    if( control.enable ) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }

                });

                $(["#frozenRow_" , ts.id , ",#frozenColumn_" , ts.id].join(""), pager).each(function () {

                    if( !control.enable ) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }

                });

            };

            ts.updateRecords = function(){
                if (ts.p.viewRecords) {
                    var pageInfo = ts.p.pageInfo;

                    var pageRowCount = pageInfo.pageRowCount;
                    var curPage = pageInfo.curPageIndex + 1;

                    var begin = pageRowCount * (curPage - 1) + 1;
                    var end = begin + ts.p.reccount - 1 ;

                    if(pageInfo.pageLoadType == YIUI.PageLoadType.DB){
                        $(".ui-paging-info", ts.p.pager).html($.ygrid.formatString($.ygrid.defaults.record, begin, end));
                    }else{
                        $(".ui-paging-info", ts.p.pager).html($.ygrid.formatString($.ygrid.defaults.recordtext, begin, end, ts.p.records));
                    }
                }
            };

            //刷新页码
            ts.updatePagination = function(){

                var pagerId = ts.p.id + '_pager',
                    pagination = $("#pagination_" + pagerId);

                var initPagination = function (begin, end, curPage) {
                    $("ul", pagination).html();
                    var btnStr = [], style, sClass;

                    end = end < begin ? begin : end;

                    for (var i = begin; i <= end; i++) {
                        sClass = (i == curPage) ? "ui-state-highlight" : "";
                        btnStr.push(["<li class='pagination_btn " , sClass , "' style='" , style , "' data-num=" , i , ">" , i , "</li>"].join(""));
                    }
                    $("ul", pagination).html(btnStr.join(""));

                    $("li", pagination).click(gotoPageEvent);

                };

                var pageInfo  = ts.getControlGrid().pageInfo;
                var curPage = pageInfo.curPageIndex + 1;
                var indicator = pageInfo.pageIndicatorCount;
                if (pageInfo.pageCount <= indicator) {
                    initPagination(1, pageInfo.pageCount, curPage);
                } else {
                    var step = Math.floor(indicator/2);
                    var begin = (curPage - step) >= 1 ? (curPage - step) : 1, end = begin + indicator - 1;
                    if (end > pageInfo.pageCount) {
                        var gap = end - pageInfo.pageCount;
                        begin -= gap;
                        end -= gap;
                    }
                    initPagination(begin, end, curPage);
                }
            };

            //--------------------------------------------------------------------------------------------------------------

            if (ts.tagName.toUpperCase() !== 'TABLE') {
                alert($.ygrid.error.isNotTable);
                return;
            }
            if (document.documentMode !== undefined) { // IE only
                if (document.documentMode < 5) {
                    alert($.ygrid.error.isErrorMode);
                    return;
                }
            }
            $(this).empty().attr("tabindex", "0");

            this.p = p;
            this.grid = grid;

            // 如果需要序号字段
            if (ts.p.rowSequences) {
                ts.p.colModel.unshift({label: $.ygrid.defaults.seqColText, name: 'rn', width: ts.p.rowSeqWidth,
                    sortable: false, align: 'center'});
            }

            var gv = $("<div class='ui-ygrid-view'></div>");//表格主体
            $(gv).insertBefore(this);
            $(this).removeClass("scroll").appendTo(gv);
            var eg = $("<div class='ui-ygrid ui-widget ui-widget-content'></div>");  //表格整体
            $(eg).attr({id: "gbox_" + this.id, dir: "ltr"}).insertBefore(gv);
            $(gv).attr("id", this.id + "_view").appendTo(eg);
            $(this).attr({cellspacing: "0", cellpadding: "0", border: "0", "role": "grid", "aria-labelledby": "gbox_" + this.id});//表格数据主体
            this.p.id = this.id;
            ts.p.localReader = $.extend(true, {
                root: "rows",
                page: "page",
                total: "total",
                records: "records",
                cell: "cell",
                id: "id"
            }, ts.p.localReader);

            //初始化宽度
            setColWidth.call(ts); //初始化宽度
            $(eg).css("width", grid.width + "px");
            $(gv).css("width", grid.width + "px").before("<div class='ui-ygrid-resize-mark' id='rs_m" + ts.p.id + "'>&#160;</div>");
            //开始构建表头------------------------position:relative是为了后面动态锁定列对列头进行偏移----------------
            var hTable = $(["<table class='ui-ygrid-htable' role='ygrid' aria-labelledby='gbox_" , this.id , "' cellspacing='0' cellpadding='0' border='0'><\/table>"].join("")),
                hb = $("<div class='ui-ygrid-hbox-ltr'></div>").append(hTable);
            grid.hDiv = document.createElement("div");
            $(grid.hDiv).addClass('ui-ygrid-hdiv').css({ width: grid.width + "px"}).append(hb);

            $("table:first", grid.hDiv).css({
                "width": ts.p.tblwidth + "px"
            });

            grid.hDiv.onselectstart = function () {
                return false;
            };
            $(ts).before(grid.hDiv);
            var thead = ["<thead><tr class='ui-ygrid-headers' role='rowheader'>"];
            var tdc = $.ygrid.msie ? "class='ui-th-div-ie'" : "";
            var imgs = ["<span class='s-ico'/>"].join("");  //排序图标
            //添加表头单元格
            var form = YIUI.FormStack.getForm(ts.getControlGrid().ofFormID);
            var cm,name,formulaCaption;
            for (var i = 0; cm = ts.p.colModel[i]; i++) {
                name = cm.label;
                formulaCaption = cm.formulaCaption;
                if ( formulaCaption ) {
                    name = form.eval(formulaCaption, new View.Context(form));
                }
                cm.width = cm.width ? parseInt(cm.width,10) : 80;
                thead.push("<th id='");
                thead.push([ts.p.id , "_" , cm.name].join(""));
                thead.push("' role='columnheader' class='ui-state-default ui-th-column ui-th-ltr'");
                thead.push([" title=\"" , name , "\""].join(""));
                thead.push(">");
                thead.push("<div id='");
                thead.push([$.ygrid.uidPref , "_" , ts.p.id , "_" , cm.name].join(""));
                thead.push("' ");
                thead.push(tdc);
                thead.push(">");
                if ( ts.p.selectFieldIndex != -1 && (i + (ts.p.rowSequences ? -1 : 0)) == ts.p.selectFieldIndex ) {
                    thead.push("<span class='chk'/>");
                }
                thead.push(["<span class='colCaption'>",name,"</span>"].join(""));
                if( cm.sortable ) {
                    thead.push(imgs);
                }
                thead.push("</div></th>");
            }
            thead.push("</tr></thead>");
            imgs = null;
            hTable.append(thead.join(""));

            ts.setSelectAllVisible = function (singleSelect) {
                if( singleSelect ) {
                    $(".chk", hTable).hide();
                } else {
                    $(".chk", hTable).show();
                }
            }

            ts.setSelectAllVisible(ts.getControlGrid().singleSelect);

            // 全选按钮做成一直可用
            hTable.delegate(".chk","click",function (e) {
                // if( $(this).attr("enable") !== 'true' )
                //     return;
                var grid = ts.getControlGrid(),
                    value = !$(this).hasClass('checked');
                grid.needCheckSelect = false;

                grid.gridHandler.selectRange(grid,0,grid.getRowCount(),grid.selectFieldIndex,value);

                $(this).toggleClass('checked');
                grid.needCheckSelect = true;
                e.stopPropagation();
            });

            //开始处理表头单元中的一些特定功能：拖拉大小，排序图标
            thead = $("thead:first", grid.hDiv).get(0);
            var thr = $("tr:first", thead), w, sort, column;
            var firstRow = ["<tr class='ygfirstrow' role='row' style='height:auto'>"];
            var h = thr.height();
            var control = ts.getControlGrid();
            $("th", thr).each(function (j) {
                column = ts.p.colModel[j];
                w = column.width;

                var res = document.createElement("span");
                $(res).html("&#160;").addClass('ui-ygrid-resize ui-ygrid-resize-ltr');

                var _this = $(this);
                _this.css("width", w + "px").prepend(res);
                res = null;
                var hdcol = "";
                if (column.hidden) {
                    _this.css("display", "none");
                    hdcol = "display:none;";
                }
                firstRow.push("<td role='gridcell' style='width:");
                firstRow.push(w + "px;");
                firstRow.push(hdcol);
                firstRow.push("'></td>");

                // 子叶列标志
                _this.attr("leaf",true).attr("colIndex",j);

                grid.headers[j] = {
                    caption:column.label,
                    width: w,
                    orgWidth: w,
                    orgHeight: h,
                    el: this,
                    visible: !column.hidden
                };

                if( column.sortable && control.lastsort == j) {
                    ts.showSortIcon(_this,control.sortorder);
                }

                // 自动化测试用
                $(">div", this).addClass('ui-ygrid-sortable');
            });
            
            ts.showSortIcon = function ($th,order) {
                var lastClass = 'ui-grid-sort-' + (order == "asc" ? "desc" : "asc"),
                  curClass = 'ui-grid-sort-' + order;

                $("div span.s-ico", $th).removeClass(lastClass).addClass(curClass).show();
            }

            // 子叶列绑定事件
            ts.bindEvents2LeafColumn = function () {

                var ts = this,
                    trs = $("tr", ts.grid.hDiv);

                $("th[leaf='true'] span.ui-ygrid-resize",trs).off("mousedown").mousedown(function (e) {
                    var th = $(this).parents("th");
                    var ci = parseInt(th.attr("colIndex"));
                    grid.dragStart(ci, e, getOffset.call(ts, ci));
                });

                // 点击右侧排序,左侧最佳列宽
                $("th[leaf='true']",trs).off("click").click(function (e) {
                	
                	var g = ts.getControlGrid();
                    if( g.hasGroupRow || g.treeIndex != -1 || g.rowExpandIndex != -1 )
                        return;
                    
                    // 点击左半边是最佳列宽,右半边排序
                    if( e.clientX < ($(this).offset().left + $(this).width() / 2) ) 
                        return;

                    var ci = parseInt($(this).attr("colIndex")),
                        cIdx = ts.p.rowSequences ? ci - 1 : ci;

                    if( cIdx == g.selectFieldIndex ) {
                        return;
                    }

                    var column = ts.p.colModel[ci];
                    if( !column.sortable ) { 
                        return;
                    };

                    var order = "asc";
                    if ( g.lastsort != null ) {
                        if( g.lastsort === ci ) {
                          order = g.sortorder == "asc" ? "desc" : "asc";
                        } else {
                          $("div span.s-ico", ts.grid.headers[g.lastsort].el)
                            .removeClass("ui-grid-sort-asc").removeClass("ui-grid-sort-desc");
                        }
                    }

                    ts.showSortIcon(this,order);

                    g.lastsort = ci;
                    g.sortorder = order;

                    if ($.isFunction(ts.p.onSortClick)) {
                        g.onSortClick(cIdx, order);
                    }
                    
                }).off("dblclick").dblclick(function (e) {
                    var target = e.target || e.srcElement;
                    if( $(target).hasClass("s-ico") || $(target).hasClass("chk") ) {
                        return;
                    }
                    var index = parseInt($(this).attr("colIndex"));
                    resizeColumn2BestWidth(this,index);
                });
            };

            // 列拖动中及结束事件
            ts.bindEvents2GridView = function () {
                var ts = this,
                    gView = $(ts.grid.bDiv).parents(".ui-ygrid-view");

                gView.mousemove(function (e) {
                    if (grid.resizing) {
                        grid.dragMove(e);
                    }
                });

                $(document).bind("mouseup.yGrid" + ts.p.id, function () {
                    if (grid.resizing) {
                        grid.dragEnd();
                        return false;
                    }
                    return true;
                });
            }

            /**
             * 表格列最佳列宽
             * @param idx
             */
            var resizeColumn2BestWidth = function (el,idx) {
                var div = $(el).children("div")[0];

                var childrenNodes = div.childNodes,node,tWidth = 0;
                for( var i = 0;node = childrenNodes[i];i++ ) {
                    if( $(node).hasClass("colCaption") ) {
                        tWidth += $.ygrid.getFitWidth(node);
                    } else {
                        tWidth += node.offsetWidth;
                    }
                }

                var oldWidth = $(el).outerWidth();

                $(".ygrow",ts.grid.bDiv).each(function () {
                    var td = $("td",this)[idx],
                        fitWidth = $.ygrid.getFitWidth(td);

                    if( fitWidth > tWidth ) {
                        tWidth = fitWidth;
                    }
                });
                if( tWidth < $.ygrid.minWidth ){
                    tWidth = $.ygrid.minWidth;
                }
                grid.newWidth = p.tblwidth + (tWidth - oldWidth);
                grid.headers[idx].newWidth = tWidth;
                grid.resizing = {idx:idx};
                grid.dragEnd();
            }

            var resizeColumn2OrgWidth = function (el,idx) {
                var oldWidth = el.offsetWidth,
                    width = grid.headers[idx].orgWidth;
                grid.newWidth = p.tblwidth + (width - oldWidth);
                grid.headers[idx].newWidth = width;
                grid.resizing = {idx:idx};
                grid.dragEnd();
            }

            ts.switchWidth = function () {
                var headers = ts.grid.headers;
                for( var i = 0,size = headers.length;i < size;i++ ) {
                    if( ts.p.colModel[i].hidden )
                        continue;
                    if( ts.p.bestWidthStatus ) {
                        resizeColumn2OrgWidth(headers[i].el,i);
                    } else {
                        resizeColumn2BestWidth(headers[i].el,i);
                    }
                }
                ts.p.bestWidthStatus = !ts.p.bestWidthStatus;
            }

            ts.frozenRow = function ($btn,op) {
                var grid = ts.getControlGrid();
                var frozenCount = ts.p.freezeRowCnt;
                var rowIndex = grid.getFocusRowIndex();

                if( !frozenCount ) {
                    if( rowIndex == -1 ) {
                        return;
                    }
                    ts.p.freezeRowCnt = rowIndex + 1;

                    // 冻结行
                    $(ts).setFrozenRows();

                    $btn.attr("title",op.unfrozenrowtitle);
                    $btn.removeClass("ui-icon-frozenRow").addClass("ui-icon-unfrozenRow");
                } else {
                    ts.p.freezeRowCnt = 0;

                    // 解冻行
                    $(ts).destroyFrozenRows();

                    $btn.attr("title",op.frozenrowtitle);
                    $btn.removeClass("ui-icon-unfrozenRow").addClass("ui-icon-frozenRow");
                }
            }

            ts.frozenColumn = function ($btn,op) {
                var grid = ts.getControlGrid();
                var frozenCount = ts.p.freezeColCnt;
                var colIndex = grid.getFocusColIndex();

                if( !frozenCount ) {
                    if( colIndex == -1 ) {
                        return;
                    }

                    ts.p.freezeColCnt = colIndex + 1;

                    // 冻结列
                    $(ts).setFrozenColumns();

                    $btn.attr("title",op.unfrozencoltitle);
                    $btn.removeClass("ui-icon-frozenColumn").addClass("ui-icon-unfrozenColumn");
                } else {
                    ts.p.freezeColCnt = 0;

                    // 解冻列
                    $(ts).destroyFrozenColumns();

                    $btn.attr("title",op.frozencoltitle);
                    $btn.removeClass("ui-icon-unfrozenColumn").addClass("ui-icon-frozenColumn");
                }
            }

            firstRow.push("</tr>");
            var tbody = document.createElement("tbody");
            this.appendChild(tbody);
            $(this).addClass('ui-ygrid-btable ui-ygrid-empty').append(firstRow.join(""));

            firstRow = null;
            //表头构建结束--------------------------------------

            //表格数据主体开始构建------------------------------
            if ($.ygrid.msie) {
                if (String(ts.p.height).toLowerCase() === "auto") {
                    ts.p.height = "100%";
                }
            }
            grid.bDiv = document.createElement("div");
            var height = ts.p.height + (isNaN(ts.p.height) ? "" : "px");

            $(grid.bDiv).addClass('ui-ygrid-bdiv').css("width",grid.width + "px")
                .append($('<div style="position:relative;' + ($.ygrid.msie && $.ygrid.msiever() < 8 ? "height:0.01%;" : "") + '"></div>')
                    .append(this)).scroll(grid.scrollGrid);

            $("table:first", grid.bDiv).css({
                "width": ts.p.tblwidth + "px",
                "position": "relative" //position:relative是为了后面动态锁定列对表体进行偏移
            });

            if (!$.support.tbody) { //IE
                if ($("tbody", this).length === 2) {
                    $("tbody:gt(0)", this).remove();
                }
            }

            $(grid.hDiv).after(grid.bDiv);

            // 根据事件获取单元格位置
            var hitTest = function(e) {
                var hit = {},td = $(e.target).closest("td");
                var ptr = $(td, ts.rows).closest("tr.ygrow");
                if ($(ptr).length === 0) {
                    return hit;
                }

                var rowIndex = parseInt($.ygrid.stripPref($.ygrid.uidPref, ptr[0].id)),
                    colIndex = $.ygrid.getCellIndex(td) - (ts.p.rowSequences ? 1 : 0);
                hit.row = rowIndex,hit.column = colIndex;
                return hit;
            }

            $(grid.bDiv).mousemove(function (e) {
                if (ts.selecting && e.target.tagName === "TD") {

                    // console.log(" mousemove...");

                    if( e.clientX == ts.selecting.x && e.clientY == ts.selecting.y ){
                        // console.log("prevent mousemove...");
                        return;
                    }

                    var hitCell = ts.p.hitCell;

                    if( !hitCell ) {
                        return;
                    }

                    var oldLeft = hitCell.cellIndex - (ts.p.rowSequences ? 1 : 0),
                        oldRight = oldLeft,
                        oldTop = hitCell.parentElement.rowIndex - 1,
                        oldBottom = oldTop,

                        curCell = e.target,

                        rowIndex = curCell.parentElement.rowIndex - 1,
                        colIndex = curCell.cellIndex - (ts.p.rowSequences ? 1 : 0),

                        left = Math.min(colIndex, oldLeft),
                        right = Math.max(colIndex, oldRight),
                        top = Math.min(rowIndex, oldTop),
                        bottom = Math.max(rowIndex, oldBottom);

                    ts.selectGridRow(left,top,right,bottom,top,left);
                }
            }).keydown(function (e) { // 处理方向键直接结束编辑(全键盘操作)
                var _grid = ts.getControlGrid();
                if( _grid.endEditByNav  ) {
                    var keyCode = e.charCode || e.keyCode;
                    switch (keyCode) {
                        case 37:
                            ts.changeFocus("left");
                            break;
                        case 38:
                            ts.changeFocus("top");
                            break;
                        case 39:
                            ts.changeFocus("right");
                            break;
                        case 40:
                            ts.changeFocus("bottom");
                            break;
                        default:
                            break;
                    }
                }
            });
            $(ts).click(function (e,fake) {      //表格点击事件,主要用来触发表格的各种事件以及进入编辑
                // 这里不能做这个限制,否则按钮等的事件无法触发
                //   if ( e.target.tagName === "TD" ) {
                var target = e.target,
                    tagName = target.tagName;
                // var ptr = $(td, ts.rows).closest("tr.ygrow");
                // if ($(ptr).length === 0 || ptr[0].className.indexOf('ui-state-disabled') > -1) {
                //     return;
                // }

                if( tagName === "INPUT" || tagName === 'TR' ) {
                    return;
                }

                // //当前点击单元格 不是编辑单元格，结束编辑
                // if (ts.p.editCells.length > 0) {
                //     $(ts).yGrid("restoreCell", ts.p.editCells[0].ir, ts.p.editCells[0].ic);
                // }

                var grid = ts.getControlGrid(),
                    rowIndex = ts.p.selectModel.focusRow,
                    colIndex = ts.p.selectModel.focusCol,

                    oldRowIndex = ts.p.selectModel.oldRowIndex,

                    ri = rowIndex + 1,ci = colIndex + (ts.p.rowSequences ? 1 : 0),

                    hit = hitTest(e);

                // 光标所在的单元格未改变
                if( !fake && !ts.p.selectModel.changed && hit.row == rowIndex && hit.column == colIndex ) {
                    $(ts).yGrid('editCell', ri, ci, true, e);// 鼠标编辑
                }

                // 单击事件
                if( !fake && $.isFunction(ts.p.clickRow) ) {
                    ts.p.clickRow.call(ts,rowIndex); 
                }

                // 树形表格点击
                if( $(target).hasClass('cell-treeIcon') ){
                    treeClick($(target), ri, ci);
                }

                // 行改变事件
                if( rowIndex != oldRowIndex && $.isFunction(ts.p.focusRowChanged) ) {
                    ts.p.focusRowChanged.call(ts,rowIndex,oldRowIndex);
                }

                grid.focusManager.focusOwner = grid;

            }).mouseup(function (e) {

                if (e.target.tagName === "INPUT") {
                    return;
                }

                var $target = $(e.target).closest("td");
                if( $target.length == 0 ) {
                    return;
                }

                document.onselectstart = function () {
                    return true;
                };

                ts.selecting = null;

                //ts.knvFocus2();

                // 使用同步,焦点从最后一个单元格切换到下一行不能编辑
                window.setTimeout(function () {
                    ts.knvFocus2();
                });

                if ( e.button == 2 ) { // 追溯
                    var grid = ts.getControlGrid(),
                        traces = grid.traces,trace;
                    if( traces && traces.length > 0 ) {

                        // 阻止默认右键
                        document.oncontextmenu = function (e) {
                            var ev = e || window.event;
                            if( ev.preventDefault ) {
                                ev.preventDefault();
                            } else {
                                ev.returnValue = false;
                                ev.cancelBubble = true;
                            }
                            return false;
                        }

                        var form = YIUI.FormStack.getForm(grid.ofFormID),
                            ctx = new View.Context(form),
                            tracemenu = $("#tracemenu");

                        if( tracemenu.length == 0 ) {
                            var html = "<div id='tracemenu' class='contextmenu'>" +
                                "<ul class='menu-list'>" +
                                "</ul>" +
                                "</div>";
                            $(document.body).append($(html));
                            tracemenu = $("#tracemenu");
                        } else {
                            tracemenu.undelegate("li","click").find(".menu-list").empty();
                        }

                        var ul = $(".menu-list", tracemenu);

                        for( var i = 0;trace = traces[i];i++ ) {
                            if( trace.condition && !form.eval(trace.condition,ctx) ) {
                                continue;
                            }

                            $("<li></li>").data("idx",i).append("<a>" + trace.caption + "</a>").appendTo(ul);
                        }

                        if( $("li",tracemenu).length > 0 ) {
                            tracemenu.delegate("li","click", function () {

                                var i = parseInt($(this).data("idx")),
                                    ctx = new View.Context(form);

                                form.eval(traces[i].content,ctx);

                                tracemenu.hide();
                            });

                            tracemenu.css({
                                left: e.clientX + "px",
                                top: e.clientY + "px"
                            });

                            tracemenu.show();
                        }

                        $(document).off("mousedown").on("mousedown",function (e) {
                            var stop = $(e.target).hasClass("menu-list");
                            if( !stop ) {
                                stop = $(e.target).parents('.menu-list').length > 0;
                            }
                            if( stop )
                                return;

                            $("#tracemenu").hide();
                            $(document).off("mousedown");

                            // 恢复右键
                            document.oncontextmenu = function (e) {
                                var ev = e || window.event;
                                return ev.returnValue = true;
                            }

                        });
                    }
                }

            }).mousedown(function (e) {

                if (e.target.tagName === "INPUT" || $(e.target).hasClass("txtbtn") ) { // 文本按钮
                    return;
                }

                // 标签类型是DIV
                var $target = $(e.target).closest("td");
                if( $target.length == 0 ) {
                    return;
                }

                document.onselectstart = function () {
                    return false;
                };

                ts.p.hitCell = $target[0];

                var hit = hitTest(e);

                var rowIndex = hit.row,colIndex = hit.column;

                if( rowIndex == null || colIndex == null || colIndex < 0 )
                    return;

                // 在改变焦点行之前结束控件编辑
                // 需要同步获取焦点,异步会有问题
                ts.knvFocus2();

                var oldRowIndex = ts.p.selectModel.focusRow,
                    oldColIndex = ts.p.selectModel.focusCol;

                if( colIndex == oldColIndex && e.shiftKey ) {

                    var top = Math.min(rowIndex, oldRowIndex);
                    var bottom = Math.max(rowIndex, oldRowIndex);

                    ts.selectGridRow(colIndex,top,colIndex,bottom,rowIndex,colIndex);

                } else {

                    ts.selectGridRow(colIndex,rowIndex,colIndex,rowIndex,rowIndex,colIndex);

                    ts.selecting = {x:e.clientX,y:e.clientY};
                }
            }).dblclick(function (e) {    //表格双击事件,包括单元格双击和行双击
                var td = e.target;
                if ($.ygrid.msie) {   //兼容IE
                    $(td).click();
                }

                var hit = hitTest(e);

                var rowIndex = hit.row,colIndex = hit.column;

                if( rowIndex == null || colIndex == null || colIndex < 0 )
                    return;

                if ($.isFunction(ts.p.dblClickCell)) {
                    ts.p.dblClickCell.call(ts, rowIndex, colIndex);
                }

                if ($.isFunction(ts.p.dblClickRow)) {
                    ts.p.dblClickRow.call(ts, rowIndex);
                }

            });

            ts.populate = function () {
                $(ts).clearGridData();

                if (ts.grid.prevRowHeight && ts.p.scrollPage) {
                    delete ts.p.lastpage;
                    ts.grid.populateVisible();
                } else {
                    ts.grid.populate();
                }
            }

            ts.doFrozen = function () {
                var control = ts.getControlGrid();

                if( !control.enable && !p.frozenRows && p.freezeRowCnt > 0 ) {
                    $(ts).setFrozenRows();
                }

                if( !control.enable && p.freezeColCnt > 0 ) {
                    $(ts).setFrozenColumns();
                }
            }

            ts.unFrozen = function () {
                $(ts).destroyFrozenRows();
                $(ts).destroyFrozenColumns();
            }

            // ----------------------------------表格选择模式--------------------------------------------

            ts.unselect = function (row,left,right) {
                left = left + (ts.p.rowSequences ? 1 : 0), right = right + (ts.p.rowSequences ? 1 : 0);
                $(row.cells).each(function () {
                    if( this.cellIndex >= left && this.cellIndex <= right){
                        $(this).removeClass("ui-state-highlight");
                    }
                });
            };

            ts.select = function (row,left,right) {
                left = left + (ts.p.rowSequences ? 1 : 0), right = right + (ts.p.rowSequences ? 1 : 0);
                $(row.cells).each(function () {
                    if( this.cellIndex >= left && this.cellIndex <= right){
                        $(this).addClass("ui-state-highlight");
                    }
                });
            };

            ts.unselectGridRow = function (rowIndex) {
                var viewRow = $(ts).getGridRowById($.ygrid.uidPref + rowIndex);
                if( viewRow ) {
                    $(viewRow.cells).each(function () {
                        $(this).removeClass("ui-state-highlight");
                    });
                }
            };

            //  传入的是真实的colIndex
            ts.selectGridRow = function (left,top,right,bottom,focusRow,focusCol) {
                var selectModel = ts.p.selectModel;
                var oldFocusRow = -1,oldFocusCol = -1;
                var rid,viewRow;
                switch (selectModel.selectionMode){
                    case YIUI.SelectionMode.RANGE:
                        var oldLeft = selectModel.left,oldRight = selectModel.right,
                            oldTop = selectModel.top,oldBottom = selectModel.bottom;
                        if( selectModel.select(left, top, right, bottom,focusRow,focusCol) ) {
                            $("tbody:first > tr:gt(0)", ts.grid.bDiv).each(function () {
                                var rowIndex = parseInt($.ygrid.stripPref($.ygrid.uidPref, this.id));
                                if(rowIndex >= oldTop && rowIndex <= oldBottom && oldLeft != -1 && oldRight != -1){
                                    ts.unselect(this,oldLeft,oldRight);
                                }
                                if(rowIndex >= top && rowIndex <= bottom ) {
                                    ts.select(this,left,right);
                                }
                            });
                        }
                        break;
                    case YIUI.SelectionMode.ROW:
                        oldFocusRow = selectModel.focusRow;
                        var count = ts.getControlGrid().getColumnCount();
                        if( selectModel.select(0,focusRow,count,focusRow,focusRow,focusCol) ) {
                            if( oldFocusRow != -1 ) {
                                rid = $.ygrid.uidPref + oldFocusRow;
                                viewRow = $(ts).getGridRowById(rid);
                            }
                            if( viewRow ) {
                                ts.unselect(viewRow,0,count - 1);
                            }
                            rid = $.ygrid.uidPref + focusRow;
                            viewRow = $(ts).getGridRowById(rid);
                            if( viewRow ) {
                                ts.select(viewRow,0,count - 1);
                            }
                        }
                        break;
                    case YIUI.SelectionMode.CELL:
                        oldFocusRow = selectModel.focusRow,oldFocusCol = selectModel.focusCol;
                        if( selectModel.select(focusCol,focusRow,focusCol,focusRow,focusRow,focusCol) ) {
                            if( oldFocusRow != -1 && oldFocusCol != -1 ) {
                                rid = $.ygrid.uidPref + oldFocusRow;
                                viewRow = $(ts).getGridRowById(rid);
                            }
                            if( viewRow ) {
                                ts.unselect(viewRow,oldFocusCol,oldFocusCol);
                            }
                            rid = $.ygrid.uidPref + focusRow;
                            viewRow = $(ts).getGridRowById(rid);
                            if( viewRow ) {
                                ts.select(viewRow,focusCol,focusCol);
                            }
                        }
                        break;
                }
            };

            /**
             * 表格焦点策略
             * @param event
             * @returns {*}
             */
            ts.doFocusPolicy = function (keyCode) {
                var row = ts.p.selectModel.focusRow,column = ts.p.selectModel.focusCol,
                    rid = $.ygrid.uidPref + row,colModel = ts.p.colModel;
                var grid = ts.getControlGrid(),cellData = grid.getCellDataAt(row,column);
                switch ( keyCode ){
                    case 13:
                    case 108:// enter
                        var editOpt = ts.getCellEditOpt(row,column);
                        switch (editOpt.editOptions.cellType) {
                            case YIUI.CONTROLTYPE.BUTTON:
                            case YIUI.CONTROLTYPE.HYPERLINK:
                                if( cellData[2] ) {
                                    grid.gridHandler.doOnCellClick(grid,row,column);
                                } else {
                                    return ts.changeFocus();
                                }
                                break;
                            case YIUI.CONTROLTYPE.CHECKBOX:
                                if( cellData[2] ) {
                                    grid.setValueAt(row,column,!cellData[0],true,true);
                                } else {
                                    return ts.changeFocus();
                                }
                                break;
                            default:
                                return ts.changeFocus();
                        }
                        break;
                    case 9:// tab
                        return ts.changeFocus();
                }
                return true;
            };

            var treeClick = function($span, ri, ci){
                if($span.hasClass('ui-state-disabled')){
                    return;
                }

                var isExpand = $span.hasClass('cell-collapse');

                var rowData = ts.p.data[ri - 1];

                if(rowData && rowData.isLeaf){
                    return;
                }

                var grid = ts.getControlGrid();

                if( isExpand ) {
                    showRows(grid,rowData,ri,ci);
                } else {
                    hideRows(grid,rowData,ri,ci);
                }
            };

            // 只显示一层
            var showRows = function (grid,rowData,iRow,iCol) {
                var childRows = rowData.childRows,idx,rowID;
                if( !childRows )
                    return;
                for(var i = 0;rowID = childRows[i];i++) {
                    idx = grid.getRowIndexByID(rowID);
                    $("#" + $.ygrid.uidPref + idx,ts).show();
                }
                var $td = $("td:eq("+iCol+")",ts.rows[iRow]);
                $("span",$td).removeClass('cell-collapse').addClass('cell-expand');
            };

            // 全部收起来
            var hideRows = function (grid,rowData,iRow,iCol) {
                var childRows = rowData.childRows,idx,row,rowID;
                if( !childRows )
                    return;
                for(var i = 0;rowID = childRows[i];i++) {
                    idx = grid.getRowIndexByID(rowID);
                    row = grid.getRowDataAt(idx);
                    hideRows(grid,row,idx + 1,iCol);
                    $("#" + $.ygrid.uidPref + idx,ts).hide();
                }
                var $td = $("td:eq("+iCol+")",ts.rows[iRow]);
                $("span",$td).removeClass('cell-expand').addClass('cell-collapse');
            };

            ts.changeFocus = function (dir) {
                var row = ts.p.selectModel.focusRow,column = ts.p.selectModel.focusCol,
                    rid = $.ygrid.uidPref + row,colModel = ts.p.colModel;
                var grid = ts.getControlGrid();

                if( row == -1 || column == -1 )
                    return;

                var flag = dir ? dir : "right";

                var findVisiblePos = function (iRow, iCol, dir) {
                    var pos = {row:iRow,column:iCol},i,j,rl = ts.rows.length,cl = colModel.length,beg = ts.p.rowSequences ? 1 : 0;
                    if (dir === "next") {
                        // 当前行找
                        for( i = iCol + 1; i < cl; i++ ) {
                            if (colModel[i].hidden !== true) {
                                pos.row = iRow,pos.column = i;
                                return pos;
                            }
                        }
                        // 往下找
                        for( i = iRow + 1;i < rl;i++ ) {
                            if( $(ts.rows[i]).is(":hidden") )
                                continue;
                            for( j = beg; j < cl;j++ ) {
                                if( colModel[j].hidden !== true ) {
                                    pos.row = i,pos.column = j;
                                    return pos;
                                }
                            }
                        }
                    } else if (dir === "pre") {
                        // 当前行找
                        for (i = iCol - 1; i >= beg; i--) {
                            if (colModel[i].hidden !== true) {
                                pos.row = iRow,pos.column = i;
                                return pos;
                            }
                        }
                        // 往上找
                        for( var i = iRow - 1; i > 0;--i ) {
                            if( $(ts.rows[i]).is(":hidden") )
                                continue;
                            for (j = cl - 1; j >= beg; j--) {
                                if (colModel[j].hidden !== true) {
                                    pos.row = i,pos.column = j;
                                    return pos;
                                }
                            }
                        }
                    }
                    return pos;
                };

                var viewRow = $(ts).getGridRowById(rid);
                if( !viewRow )
                    return;
                var ri = viewRow.rowIndex,
                    ci = column + (ts.p.rowSequences ? 1 : 0);
                var pos = {};
                switch ( flag ) {
                    case "left":
                        pos = findVisiblePos(ri,ci,"pre");
                        break;
                    case "top":
                        pos.row = ri - 1,pos.column = ci;
                        break;
                    case "right":
                        pos = findVisiblePos(ri,ci,"next");
                        break;
                    case "bottom":
                        pos.row = ri + 1,pos.column = ci;
                        break;
                }

                // 没改变
                if( pos.row == ri && pos.column == ci )
                    return false;

                ri = pos.row,ci = pos.column;
                if( ri >= 0 && ri < ts.rows.length && ci >= 0 && ci < colModel.length ) {
                    viewRow = ts.rows[ri];
                    if( viewRow ) {
                        $(ts).scrollVisibleCell(ri,ci);
                        $(viewRow.cells[ci]).trigger("mousedown").trigger("mouseup").click();
                    }
                    return true;
                }
                return false;
            };

            // 清空选择
            ts.cleanSelection = function () {
                //var row = ts.p.selectModel.focusRow,column = ts.p.selectModel.focusCol;
                // var viewRow = $(ts).getGridRowById($.ygrid.uidPref + row);
                //  if( !viewRow )
                //     return;
                // $(viewRow.cells[column + (ts.p.rowSequences ? 1 : 0)]).removeClass("ui-state-highlight");
                ts.selectGridRow(-1,-1,-1,-1,-1,-1);
            };

            //表格数据主体构建结束------------------------------
            //构建工具条

            var op = $.extend(this.p.navButtons, $.ygrid.nav);

            // --------------最下方工具条--------------------------------------

            var pagerId = this.p.id + '_pager';

            var pager = $("<div id='" + pagerId + "'></div>");
            var onHoverIn = function () {
                    if (!$(this).hasClass('ui-state-disabled')) {
                        $(this).addClass("ui-state-hover");
                    }
                },
                onHoverOut = function () {
                    $(this).removeClass("ui-state-hover");
                };
            ts.p.pager = "#" + pagerId;
            ts.grid.pager = pager;
            pager.css({width: grid.width + "px"}).addClass('ui-state-default ui-ygrid-pager').attr("dir", "ltr").appendTo(eg);
            pager.append([
                "<div id='pg_" , pagerId , "' class='ui-pager-control' role='group'>" ,
                "<table cellpadding='0' border='0' class='ui-pg-table total' role='row'>" ,
                "<tbody><tr><td id='" , pagerId , "_left' align='left' class='operation'></td>" ,
                "<td id='" , pagerId , "_center' align='right' class='page'></td>",
                "<td id='" , pagerId , "_right' align='right' class='count'></td>",
                "</tr></tbody></table></div>"].join(""));

            var tbd,
                navBTtbl = $("<table cellpadding='0' border='0' class='ui-pg-table navtable'><tbody><tr></tr></tbody></table>");

            //------------------------------工具栏添加操作--------------------------------------

            var control = ts.getControlGrid(),
                metaObj = control.getMetaObj();

            if (metaObj.add || ts.p.opts.indexOf("insert") != -1) {
              tbd = $("<td class='ui-pg-button'></td>").append(["<div class='ui-pg-div'><span class='ui-icon " , op.addIcon , "'></span>", "</div>"].join(""));
                $("tr", navBTtbl).append(tbd);
                $(tbd, navBTtbl)
                    .attr({"title": op.addtitle || "", id: "add_" + ts.p.id})
                    .click(function () {
                      if ($.isFunction(op.addFunc)) {
                        op.addFunc.call(ts, "add");
                      }
                        return false;
                    }).hover(onHoverIn, onHoverOut);
            }
            if (metaObj.del || ts.p.opts.indexOf("delete") != -1) {
              tbd = $("<td class='ui-pg-button'></td>").append(["<div class='ui-pg-div'><span class='ui-icon " , op.delIcon , "'></span>", "</div>"].join(""));
                $("tr", navBTtbl).append(tbd);
                $(tbd, navBTtbl)
                    .attr({"title": op.deltitle || "", id: "del_" + ts.p.id})
                    .click(function () {
                        if ($.isFunction(op.delFunc)) {
                            op.delFunc.call(ts, "del");
                        }
                        return false;
                    }).hover(onHoverIn, onHoverOut);
            }
            if (metaObj.shift || ts.p.opts.indexOf("shift") != -1) {
              tbd = $("<td class='ui-pg-button'></td>").append(["<div class='ui-pg-div'><span class='ui-icon " , op.upRowIcon , "'></span>", "</div>"].join(""));
                $("tr", navBTtbl).append(tbd);
                $(tbd, navBTtbl)
                    .attr({"title": op.uprowtitle || "", id: "upRow_" + ts.p.id})
                    .click(function () {
                        if ($.isFunction(op.upRowFunc)) {
                            op.upRowFunc.call(ts, "upRow");
                        }
                        return false;
                    }).hover(onHoverIn, onHoverOut);
            }
            if (metaObj.shift || ts.p.opts.indexOf("shift") != -1) {
              tbd = $("<td class='ui-pg-button'></td>").append(["<div class='ui-pg-div'><span class='ui-icon " , op.downRowIcon , "'></span>", "</div>"].join(""));
                $("tr", navBTtbl).append(tbd);
                $(tbd, navBTtbl)
                    .attr({"title": op.downrowtitle || "", id: "downRow_" + ts.p.id})
                    .click(function () {
                        if ($.isFunction(op.downRowFunc)) {
                            op.downRowFunc.call(ts, "downRow");
                        }
                        return false;
                    }).hover(onHoverIn, onHoverOut);
            }
            if (metaObj.frozenRow || ts.p.opts.indexOf("frozenRow") != -1) {
              tbd = $("<td class='ui-pg-button'></td>").append(["<div class='ui-pg-div'><span class='ui-icon " , op.frozenRowIcon , "'></span>", "</div>"].join(""));
                $("tr", navBTtbl).append(tbd);
                $(tbd, navBTtbl)
                    .attr({"title": op.frozenrowtitle || "", id: "frozenRow_" + ts.p.id})
                    .click(function () {
                        if ($.isFunction(ts.frozenRow)) {
                            ts.frozenRow($("span",this),op);
                        }
                        return false;
                    }).hover(onHoverIn, onHoverOut);
            }
            if (metaObj.frozenColumn || ts.p.opts.indexOf("frozenColumn") != -1) {
              tbd = $("<td class='ui-pg-button'></td>").append(["<div class='ui-pg-div'><span class='ui-icon " , op.frozenColumnIcon , "'></span>", "</div>"].join(""));
                $("tr", navBTtbl).append(tbd);
                $(tbd, navBTtbl)
                    .attr({"title": op.frozencoltitle || "", id: "frozenColumn_" + ts.p.id})
                    .click(function () {
                        if ($.isFunction(ts.frozenColumn)) {
                            ts.frozenColumn($("span",this),op);
                        }
                        return false;
                    }).hover(onHoverIn, onHoverOut);
            }
            if (metaObj.bestWidth || ts.p.opts.indexOf("bestWidth") != -1) {
                tbd = $("<td class='ui-pg-button'></td>").append(["<div class='ui-pg-div'><span class='ui-icon " , op.bestWidthIcon , "'></span>", "</div>"].join(""));
                $("tr", navBTtbl).append(tbd);
                $(tbd, navBTtbl)
                    .attr({"title": op.bestwidthtitle || "", id: "bestWidth_" + ts.p.id})
                    .click(function () {
                        if ($.isFunction(ts.switchWidth)) {
                            ts.switchWidth();
                        }
                        return false;
                    }).hover(onHoverIn, onHoverOut);
            }
            if( ts.p.extOpts ) {
                ts.p.extOpts.forEach(function (o) {
                  tbd = $("<td class='ui-pg-button'></td>").append(["<div class='ui-pg-div'><span class='ui-icon " , op.extOptIcon , "'></span>", "</div>"].join(""));
                  $("tr", navBTtbl).append(tbd);

                  var _icon = tbd;
                  if( o.icon ) {
                 	control.getImageBase64URL(o.icon).then(function(url) {
                 		$(".ui-icon", _icon).css({backgroundImage: "url("+ url +")"});
                 	});
                  }

                 $(tbd, navBTtbl)
                    .attr({"title": o.caption || "", id: "extOpt_" + ts.p.id})
                    .click(function () {
                      if( o.content ) {
                          form.eval(o.content,new View.Context(form));
                      }
                      return false;
                    }).hover(onHoverIn, onHoverOut);
                });
            }

            $(ts.p.pager + "_left", ts.p.pager).append(navBTtbl);
            tbd = null;
            navBTtbl = null;
            //------------------------------分页相关-----------------------------------------------
            //初始化分页操作按钮
            if (metaObj.pageLoadType != YIUI.PageLoadType.NONE) {
                var pgl = ["<table cellpadding='0' border='0'  class='ui-pg-table'><tbody><tr>"],
                    po = [
                        "first_" + pagerId,
                        "prev_" + pagerId,
                        "next_" + pagerId,
                        "last_" + pagerId,
                        "page_" + pagerId
                    ],
                    pagination = "<td><div id='pagination_" + pagerId + "' class='ui-pagination'><ul></ul></div></td>";

                // 第一页
                pgl.push("<td id='");
                pgl.push(po[0]);
                pgl.push("' class='ui-pg-button'><span class='ui-icon ui-icon-seek-first'></span></td>");

                // 上一页
                pgl.push("<td id='");
                pgl.push(po[1]);
                pgl.push("' class='ui-pg-button'><span class='ui-icon ui-icon-seek-prev'></span></td>");

                // 页码
                pgl.push(pagination);

                // 下一页
                pgl.push("<td id='");
                pgl.push(po[2]);
                pgl.push("' class='ui-pg-button'><span class='ui-icon ui-icon-seek-next'></span></td>");

                // 最后一页
                pgl.push("<td id='");
                pgl.push(po[3]);
                pgl.push("' class='ui-pg-button'><span class='ui-icon ui-icon-seek-end'></span></td>");

                if(ts.p.rowList.length >0){
                    pgl.push("<td id='");
                    pgl.push(po[4] + "'>");
                    pgl.push("<select class='ui-pg-selbox ui-widget-content ui-corner-all'" + " role=\"listbox\" title=\"Records per Page\">");
                    var nm,rowNum = ts.getControlGrid().pageInfo.pageRowCount;
                    for(i = 0;i < ts.p.rowList.length;i++){
                        nm = ts.p.rowList[i].toString();

                        pgl.push("<option role=\"option\" value=\""+nm+"\""+(rowNum === parseInt(nm)?" selected=\"selected\"":"")+">"+nm+"</option>");
                    }
                    pgl.push("</select></td>");
                }

                pgl.push("</tr></tbody></table>");
                $(ts.p.pager + "_center", ts.p.pager).append(pgl.join(""));

                var _id = "_" + ts.p.pager.substr(1);

                //行数改变事件
                var rowNumChangeEvent = function () {
                    var grid = ts.getControlGrid();

                    grid.pageInfo.pageRowCount = parseInt(this.value);

                    ts.p.gotoPage.call(grid, 1);
                    return false;
                }

                $(".ui-pg-selbox","#page_" + pagerId).on('change', rowNumChangeEvent);

                //翻页事件
                var gotoPageEvent = function () {
                    var $this = $(this);
                    if ($this.hasClass("ui-state-disabled")) {
                        return false;
                    }

                    var pageInfo = ts.getControlGrid().pageInfo;
                    var curPage = pageInfo.curPageIndex + 1,
                        page = curPage;

                    //判断做的操作
                    var id = this.id;
                    if(id.startsWith('first')){
                        page = 1;
                    }else if(id.startsWith('prev')){
                        page = page - 1;
                    }else if(id.startsWith('next')){
                        page = page + 1;
                    }else if(id.startsWith('last')){
                        page = pageInfo.pageCount;
                    }else if($this.hasClass('pagination_btn')){
                        page = parseInt($this.attr("data-num"));
                    }

                    if(curPage == page){
                        return false;
                    }

                    //表格翻页 显示为异步，所以点击按钮后 设置 不可编辑 表格翻页结束后恢复
                    $("#first" + _id + ", #prev" + _id + ", #next" + _id + ", #last" + _id).addClass("ui-state-disabled");

                    //转发grid 翻页事件
                    ts.p.gotoPage.call(ts.getControlGrid(), page).always(function () {
                        ts.updatePagination();
                        ts.updateRecords();
                    });

                    return false;
                };

                //  ts.updatePagination();

                $("#first" + _id + ", #prev" + _id + ", #next" + _id + ", #last" + _id).click(gotoPageEvent);
            }

            //初始化数据信息显示
            if (ts.p.viewRecords === true) {
                $(ts.p.pager + "_right", ts.p.pager).append("<div style='text-align:right' class='ui-paging-info'></div>");
            }

            ts.updatePager.call(ts);

            $(ts).bindKeys();

        });
    }
})(jQuery);
//提供给外部使用的事件
(function ($) {

    $.ygrid.extend({
        getGridParam: function (pName) {  //获取表格属性值
            var $t = this[0];
            if (!$t || !$t.grid) {
                return null;
            }
            if (!pName) {
                return $t.p;
            }
            return $t.p[pName] !== undefined ? $t.p[pName] : null;
        },

        setGridParam: function (newParams) {     //设置表格属性
            return this.each(function () {
                if (this.grid && typeof newParams === 'object') {
                    for (var key in newParams) {
                        var value = newParams[key];
                        if ($.isArray(value)) {
                            this.p[key] = value.slice(0);
                        } else {
                            this.p[key] = value;
                        }
                    }
                }
            });
        },

        clearGridData: function () {
            return this.each(function () {
                var $t = this;
                if (!$t.grid) {
                    return;
                }
                var firstRow = $("#" + $t.p.id + " tbody:first tr:first")[0];
                $("#" + $t.p.id + " tbody:first").empty().append(firstRow);
                $t.cleanSelection();
                $t.p.editCells = [];
                // $t.p.data = [];
                $t.p.records = 0;
                $t.p.page = 1;
                $t.p.lastpage = 1;
                $t.p.reccount = 0;

                $t.grid.bDiv.scrollTop = 0;
                $t.grid.bDiv.scrollLeft = 0;
            });
        },

        getFocusRowIndex: function () {
            return this[0].p.selectModel.focusRow;
        },

        getFocusColIndex: function () {
            return this[0].p.selectModel.focusCol;
        },

        bindKeys: function () {
            return this.each(function () {
                this.p.knv = this.p.id + "_kn";
                var knv = $("#" + this.p.knv);
                if (knv.length == 0) {
                    knv = $(["<div tabindex='-1' id='",
                        this.p.knv , "'></div>"].join("")).insertBefore($(this.grid.bDiv).parents(".ui-ygrid-view"));
                }

                var _this = this,
                    handler = YIUI.GridCPHandler;

                knv.keydown(function (event, outEvent) {
                    if (outEvent != null && outEvent.isPropagationStopped()) return;
                    var ts = $(".ui-ygrid-btable", event.target.nextSibling)[0], colModel = ts.p.colModel;
                    var keyCode = event.charCode || event.keyCode || 0;
                    if (keyCode == 0 && outEvent !== undefined) {
                        keyCode = outEvent.charCode || outEvent.keyCode || 0;
                    }
                    var grid = ts.getControlGrid();
                    var ri = ts.p.selectModel.focusRow,ci = ts.p.selectModel.focusCol;
                    if( ri == -1 || ci == -1 )
                        return;
                    var vri = ri + 1,vci = ci + (ts.p.rowSequences ? 1 : 0);

                    // 按下ctrl按键的时候将选中的值填到textArea
                    if( event.ctrlKey ) {
                        var textArea = $("#copyText" + ts.p.id),val;
                        if ( textArea.length == 0 ) {
                            textArea = $("<textarea id='copyText" + ts.p.id + "'/>").appendTo($(document.body));
                            textArea.css({position: "fixed", top: "-10000px", left: left + "px", width: "1000px", height: "200px"});

                            // 粘贴值
                            if( !ts.pasteCellValue ) {
                                ts.pasteCellValue = function () {
                                    ri = ts.p.selectModel.focusRow,ci = ts.p.selectModel.focusCol,val = textArea.val();
                                    if( ri == -1 || ci == -1 || !val )
                                        return;
                                    var rowData = grid.getRowDataAt(ri);
                                    if (rowData.rowType !== 'Detail' || ts.p.editCells.length > 0)
                                        return;

                                    var values, vals, _column, _row;
                                    switch (ts.p.selectModel.selectionMode) {
                                    case YIUI.SelectionMode.CELL:
                                        handler.paste(grid,ri,ci,val);
                                        break;
                                    case YIUI.SelectionMode.RANGE:
                                        values = val.split("\n");
                                        for (var i = ri,k = 0,length = values.length; i < grid.getRowCount() && k < length; i++) {
                                            _row = $("#" + $.ygrid.uidPref + i, ts);
                                            if ( _row.is(":visible") ) {
                                                vals = values[k++].split("\t");
                                                for (var c = ci, size = vals.length,idx = 0; c < rowData.data.length && idx < size; c++) {
                                                    _column = grid.getColumnAt(c);
                                                    if( !_column.hidden ) {
                                                        handler.paste(grid,i,c,vals[idx++]);
                                                    }
                                                }
                                            }
                                        }
                                        break;
                                    case YIUI.SelectionMode.ROW:
                                        values = val.split("\t"),length = rowData.data.length,size = values.length;
                                        for (var c = 0,idx = 0; c < length && idx < size; c++) {
                                            _column = grid.getColumnAt(c);
                                            if( !_column.hidden ) {
                                                handler.paste(grid,ri,c,values[idx++]);
                                            }
                                        }
                                        break;
                                    }
                                }
                            }

                            textArea.keyup(function (event) {

                                var keyCode = event.charCode || event.keyCode;

                                var paste = function () { // 返回异步执行对象
                                    if( keyCode == 86 ) {
                                        var defer = $.Deferred();
                                        YIUI.LoadingUtil.show();
                                        setTimeout(function () {
                                            ts.pasteCellValue();

                                            defer.resolve();
                                        },0);
                                        return defer.promise();
                                    }
                                    return $.noop;
                                }

                                $.when(paste()).always(function () {
                                    textArea.blur();
                                   // textArea.val("");

                                    _this.knvFocus2();

                                    YIUI.LoadingUtil.hide();
                                });
                            });
                        }

                        textArea.val("");

                        var values = [],row,column;
                        switch (ts.p.selectModel.selectionMode) {
                            case YIUI.SelectionMode.CELL:
                                column = grid.getColumnAt(ci);
                                if( !column.hidden ) {
                                    values.push(handler.copy(grid,ri,ci),"\t");
                                }
                                break;
                            case YIUI.SelectionMode.RANGE:
                                var top = ts.p.selectModel.top, bottom = ts.p.selectModel.bottom,
                                    left = ts.p.selectModel.left, right = ts.p.selectModel.right;
                                for (var i = top; i <= bottom; i++) {
                                    row = $("#" + $.ygrid.uidPref + i, ts);
                                    if ( row.is(":visible") ) {
                                        for (var j = left; j <= right; j++) {
                                            column = grid.getColumnAt(j);
                                            if( !column.hidden ) {
                                                values.push(handler.copy(grid,i,j),"\t");
                                            }
                                        }
                                        values.pop();
                                        values.push("\n");
                                    }
                                }
                                break;
                            case YIUI.SelectionMode.ROW:
                                var rowData = grid.getRowDataAt(ri);
                                for (var ci = 0, size = rowData.data.length; ci < size; ci++) {
                                    column = grid.getColumnAt(ci);
                                    if( !column.hidden ) {
                                        values.push(handler.copy(grid,ri,ci),"\t");
                                    }
                                }
                                break;
                        }
                        values.pop();
                        textArea.val(values.join("").trim());
                        textArea.focus();
                        textArea.select();
                    }

                    var doEdit = function (vri, vci, event, keyCode) {
                        var code;
                        if (keyCode >= 48 && keyCode <= 57) { //数字
                            code = String.fromCharCode(keyCode);
                        } else if (keyCode >= 96 && keyCode <= 105) {  //小键盘数字
                            code = String.fromCharCode(keyCode - 48);
                        } else if (keyCode >= 65 && keyCode <= 90) { //字母
                            code = String.fromCharCode(keyCode);
                        } else if (keyCode==32 || keyCode == 109 || keyCode == 189) {
                            code = " ";
                        }
                        if( code ) {
                            event.code = event.shiftKey ? code.toUpperCase() : code.toLowerCase();;
                            $(ts).yGrid('editCell', vri, vci, false, event);
                            event.preventDefault(); // 阻止默认行为
                        }
                    }

                    switch (keyCode) {
                        case 13:
                        case 108:  // Enter,Tab键
                        case 9:
                            if (!ts.doFocusPolicy(keyCode)) {
                                grid.requestNextFocus();
                                if( grid.focusManager.focusOwner !== grid ) {
                                    ts.cleanSelection(); // 如果表单焦点移动到其他组件,清空表格焦点行
                                }
                            }
                            //event.stopPropagation();//  不能阻止传播,可能有快捷键
                            event.preventDefault();// 阻止默认行为
                            break;
                        case 37:
                            ts.changeFocus("left");
                            break;
                        case 38:
                            ts.changeFocus("top");
                            break;
                        case 39:
                            ts.changeFocus("right");
                            break;
                        case 40:
                            ts.changeFocus("bottom");
                            break;
                        case 46:
                            var cell = grid.getCellDataAt(ri, ci);
                            if( cell[2] ) {
                                grid.setValueAt(ri,ci,null,true,true);
                            }
                            break;
                        case 67: // C
                            if (event.ctrlKey) {
                                // noop
                            } else {
                                doEdit(vri, vci, event, keyCode);
                            }
                            break;
                        case 86: // V
                            if ( event.ctrlKey ) {
                                // noop
                            } else {
                                doEdit(vri, vci, event, keyCode);
                            }
                            break;
                        default:
                            return doEdit(vri, vci, event, keyCode);
                    }
                });
            });
        },

        setGridWidth: function (newWidth) {
            return this.each(function () {
                if (!this.grid) {
                    return;
                }
                var $t = this;
                if (isNaN(newWidth)) {
                    return;
                }
                newWidth = parseInt(newWidth, 10);
                $t.grid.width = $t.p.width = newWidth;
                $("#gbox_" + $t.p.id).css("width", newWidth + "px");
                $("#" + $t.p.id + "_view").css("width", newWidth + "px");
                $($t.grid.bDiv).css("width", (newWidth - 5) + "px");
                $($t.grid.hDiv).css("width", (newWidth - 5) + "px");

                $($t).resizeFrozenDiv(true,true);

                $($t.p.pager).css("width", newWidth + "px");
            });
        },

        setGridHeight: function (newHeight) {
            return this.each(function () {
                var $t = this;
                if (!$t.grid) {
                    return;
                }
                var titleH = $($t.grid.hDiv).height();
                if (titleH === 0) {
                    var lastTr = $("tr.ui-ygrid-headers", $t.grid.hDiv);
                    var hrCount = $("tr.ui-ygrid-columnheader", $t.grid.hDiv).length + lastTr.length;
                    var th_H = $("th", lastTr).height();
                    titleH = (th_H + 2) * hrCount;
                }
                newHeight = newHeight - titleH - $($t.p.pager).height();

                $($t.grid.bDiv).css({height: (newHeight) + (isNaN(newHeight) ? "" : "px")});

                $t.p.height = newHeight;

                $($t).resizeFrozenDiv(true,true);
            });
        },

        refreshDynamicEditor: function (typeDef,rowIndex,colIndex) {
            return this.each(function () {
                var $t = this;
                if (!$t.grid) {
                    return;
                }

                var pos = this.getColPos(colIndex);
                var cell = $(this).getGridCellAt(rowIndex + 1, pos);
                if (!cell) {
                    return;
                }

                // 清空组件和样式
                $(cell).empty().removeClass("always-show");

                if( !typeDef.isAlwaysShow ) {
                    return;
                }

                $t.p.alwaysShowCellEditor.call($t,$(cell),rowIndex,colIndex);
            });
        },

        // 通用的调整冻结DIV的方法
        resizeFrozenDiv: function (frozenRows,frozenColumns) {
            return this.each(function () {
                var $t = this;
                if (!$t.grid) {
                    return;
                }
                // 根据纵向滚动条是否存在确定行锁定fbDiv宽度
                if( frozenRows && $t.grid.fbDiv2 ) {
                    if( $("table:first",$t.grid.bDiv).height() > $($t.grid.bDiv).height() ) {
                        $($t.grid.fbDiv2).width($($t.grid.bDiv).width() - 17);
                    } else {
                        $($t.grid.fbDiv2).width($($t.grid.bDiv).width());
                    }
                }
                // 根据横向滚动条是否存在调整列锁定fbDiv高度
                if( frozenColumns && $t.grid.fbDiv ) {
                    if( $("table:first",$t.grid.bDiv).width() > $($t.grid.bDiv).width() ) {
                        $($t.grid.fbDiv).height($($t.grid.bDiv).height() - 17);
                    } else {
                        $($t.grid.fbDiv).height($($t.grid.bDiv).height());
                    }
                }
            });
        },

        setFrozenRows: function () {
            return this.each(function () {
                if( !this.grid ){
                    return;
                }

                var $t = this;

                var grid = $t.getControlGrid();

                var frozenCount = $t.p.freezeRowCnt;

                if( frozenCount > 0 ) {
                    var gView = $($t.grid.bDiv).parents(".ui-ygrid-view");

                    var p = $($t.grid.bDiv).position();

                    // 偏移
                    var top = $(".ui-ygrid-hdiv",gView).height(),
                        left = $t.grid.bDiv.scrollLeft;

                    var rowIndex = frozenCount - 1;
                    var iRow = $t.p.rowSequences ? rowIndex + 1 : rowIndex;

                    var $tr = $($t.rows[iRow]);

                    var divh = $tr.position().top + $tr.outerHeight() - $t.grid.bDiv.scrollTop;

                    $t.grid.fbDiv2 = $(".ui-ygrid-fbdiv2",gView);
                    if( $t.grid.fbDiv2.length == 0 ) {
                        $t.grid.fbDiv2 = $('<div style="position:absolute;left:0px;top:'+top+'px;height:'+divh+'px" class="ui-ygrid-fbdiv2"></div>');
                    }

                    gView.append($t.grid.fbDiv2);

                    $($t).on('yGridResizeStop.setFrozenRows', function (e, w, index) {
                        var btd = $(".ui-ygrid-btable",$t.grid.fbDiv2);
                        $("tr:first td:eq("+index+")", btd).width( w - 1 );
                    });

                    $("#"+$t.p.id+"_frozenRow").remove();

                    $($t).resizeFrozenDiv(true,false);

                    var mh = [];
                    $("tr[role=row].ygrow",$t.grid.bDiv).each(function(){
                        mh.push( $(this).height() );
                    });

                    console.log("setFrozenRows.................");

                    var btbl = $(".ui-ygrid-btable",$t.grid.bDiv).clone(true); // 有性能问题 !!

                    $("tr[role=row]:gt("+frozenCount+")",btbl).remove();

                    $(btbl).attr("id",$t.p.id+"_frozenRow");

                    $($t.grid.fbDiv2).append(btbl);

                    // set the height
                    $("tr[role=row].ygrow",btbl).each(function(i){
                        $(this).height( mh[i] );
                    });

                    // 锁定时的滚动位置
                    $t.grid.fst = $t.grid.bDiv.scrollTop;

                    // 滚动的距离
                    $t.grid.fbDiv2.scrollTop( $t.grid.bDiv.scrollTop );
                    $t.grid.fbDiv2.scrollLeft( $t.grid.bDiv.scrollLeft );

                    // // 设置table偏移量
                    if( $t.grid.fst > 0 ) {
                        $("table:first",$t.grid.bDiv).css({
                            top:$t.grid.fst * (-1) + "px"
                        });
                    }

                    // 滚动条置0
                    $t.grid.bDiv.scrollTop = 0;  // 滚动条能滚动的距离需要改变

                    btbl = null;



                    $t.p.frozenRows = true;
                }
            });
        },

        destroyFrozenRows: function () {
            return this.each(function() {
                if ( !this.grid ) {
                    return;
                }
                if( this.p.frozenRows ) {
                    var $t = this;
                    $($t.grid.fbDiv2).remove();
                    $t.grid.fbDiv2 = null;

                    $(this).off('.setFrozenRows');
                    $($t.grid.bDiv).off('mousewheel DOMMouseScroll');
                    $("table:first",$t.grid.bDiv).css({top:"0px"});

                    $t.grid.bDiv.scrollTop = $t.grid.fst;

                    $t.grid.fst = 0;

                    this.p.frozenRows = false;
                }
            });
        },

        // 由于字典单元格的异步加载,第一次打开会有问题 TODO
        setFrozenColumns: function () {
            return this.each(function () {
                if( !this.grid ){
                    return;
                }

                var $t = this;

                var grid = $t.getControlGrid();

                var frozenCount = $t.p.freezeColCnt;

                if( frozenCount > 0 ) {

                    var gView = $($t.grid.bDiv).parents(".ui-ygrid-view");

                    var divh = parseInt( $(".ui-ygrid-hdiv",gView).height(), 10 );

                    // 锁定列所在的列序号
                    var colIndex = frozenCount - 1;
                    var iCol = $t.p.rowSequences ? colIndex + 1 : colIndex;

                    var el = $($t.grid.headers[iCol].el);

                    var divw = el.position().left + el.outerWidth() - $t.grid.bDiv.scrollLeft;

                    $t.grid.fhDiv = $(".ui-ygrid-fhdiv",gView);
                    if( $t.grid.fhDiv.length == 0 ) {
                        $t.grid.fhDiv = $('<div style="position:absolute;left:0px;top:0px;' + 'height:'+divh+'px;width:'+divw+'px;" class="ui-ygrid-fhdiv"></div>');
                    }

                    $t.grid.fbDiv = $(".ui-ygrid-fbdiv",gView);
                    if( $t.grid.fbDiv.length == 0 ) {
                        $t.grid.fbDiv = $('<div style="position:absolute;left:0px;top:'+ divh +'px;width:'+divw+'px;" class="ui-ygrid-fbdiv"></div>');
                    }

                    // 列头部分
                    gView.append($t.grid.fhDiv);

                    var htbl = $(".ui-ygrid-htable",gView).clone(true); // 有性能问题 !!

                    var dh = [];
                    $(".ui-ygrid-htable tr", gView).each(function () {
                        dh.push(parseInt($(this).height(),10));
                    });

                    $("tr",htbl).each(function(i){
                        $(this).height(dh[i]);
                    });

                    $(htbl).width(1);

                    $($t.grid.fhDiv).empty().append(htbl).mousemove(function (e) {
                        if( $t.grid.resizing ) {
                            $t.grid.dragMove(e);
                            return false;
                        }
                    });

                    $($t).on('yGridResizeStop.setFrozenColumns', function (e, w, index) {
                        var rhth = $(".ui-ygrid-htable",$t.grid.fhDiv),
                            btd = $(".ui-ygrid-btable",$t.grid.fbDiv);

                        $("th:eq("+index+")", rhth).width( w );
                        $("tr:first td:eq("+index+")", btd).width( w );

                    });

                    // 数据部分
                    gView.append($t.grid.fbDiv);

                    // 滚动事件
                    $($t.grid.fbDiv).on('mousewheel DOMMouseScroll', function (e) {
                        var st = $t.grid.bDiv.scrollTop;
                        if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
                            //up
                            $t.grid.bDiv.scrollTop = st - 25;
                        } else {
                            //down
                            $t.grid.bDiv.scrollTop = st + 25;
                        }
                        e.preventDefault();
                    });

                    //$("#"+$t.p.id+"_frozenColumn").remove();

                    $($t).resizeFrozenDiv(false,true);

                    var mh = [];
                    $("tr[role=row].ygrow",$t.grid.bDiv).each(function(){
                        mh.push( $(this).height() );
                    });

                    console.log("setFrozenColumns.................");

                    var btbl = $(".ui-ygrid-btable",$t.grid.bDiv).clone(true);
                    $("tr[role=row]",btbl).each(function(){
                        $("td[role=gridcell]:gt("+iCol+")",this).remove();
                    });

                    $(btbl).width(1).attr("id",$t.p.id+"_frozenColumn");
                    $($t.grid.fbDiv).empty().append(btbl);
                    // set the height
                    $("tr[role=row].ygrow",btbl).each(function(i){
                        $(this).height( mh[i] );
                    });

                    // 记录横向滚动位置
                    $t.grid.fsl = $t.grid.bDiv.scrollLeft;

                    // 滚动的距离
                    $t.grid.fbDiv.scrollTop ( $t.grid.bDiv.scrollTop );
                    $t.grid.fbDiv.scrollLeft ( $t.grid.bDiv.scrollLeft );

                    // $t.grid.fhDiv.scrollTop( $t.grid.bDiv.scrollTop );
                    $t.grid.fhDiv.scrollLeft( $t.grid.bDiv.scrollLeft );

                    // 设置table偏移量
                    if( $t.grid.fsl > 0 ) {
                        $("table:first",$t.grid.bDiv).css({left:$t.grid.fsl * (-1) + "px"});
                        $("table:first",$t.grid.hDiv).css({left:$t.grid.fsl * (-1) + "px"});
                    }

                    // 滚动条置0
                    $t.grid.bDiv.scrollLeft = 0; // 滚动条能滚动的距离需要改变

                    btbl = null;

                    $t.p.frozenColumns = true;
                }
            });
        },

        destroyFrozenColumns: function() {
            return this.each(function() {
                if ( !this.grid ) {
                    return;
                }
                if( this.p.frozenColumns ) {
                    var $t = this;
                    $($t.grid.fhDiv).remove();
                    $($t.grid.fbDiv).remove();
                    $t.grid.fhDiv = null;
                    $t.grid.fbDiv = null;

                    $(this).off('.setFrozenColumns');
                    $("table:first",$t.grid.bDiv).css({left:"0px"});
                    $("table:first",$t.grid.hDiv).css({left:"0px"});

                    $t.grid.bDiv.scrollLeft = $t.grid.fsl; // 恢复滚动条

                    $t.grid.fsl = 0;

                    this.p.frozenColumns = false;
                }
            });
        },

        buildGroupHeaders: function (array) {
            return this.each(function () {
                var th = this, len = array.length;

                $(th.grid.hDiv).find("tr.ui-ygrid-columnheader").remove();
                th.p.groupHeaders = [];

                for (var i = 0; i < len; i++) {
                    $(th).setGroupHeaders(array[i]);
                    th.p.groupHeaders.push(array[i]);
                }

                var headers = th.grid.headers;

                $(headers).each(function () {
                    this.el.rowSpan = 1;
                });

                // 从下往上,合并表头单元格
                var chs = $("tr.ui-ygrid-columnheader", th.grid.hDiv),chCell,rhCell,height,span;
                for (var i = chs.length - 1,ch; ch = chs[i]; i--) {
                    for (var ci = 0, rhci = 0, clen = ch.cells.length; ci < clen; ci++) {
                        chCell = $(ch.cells[ci]);
                        span = parseInt(chCell.attr("span")) || 0;

                        if( !headers[rhci].visible ) {
                            if( span > 0 ) {
                                rhci += span;
                            } else {
                                rhci++;
                            }
                            continue;
                        }

                        if ( span > 0 ) {     // 跨至少一列
                            rhci += span;
                        } else { // 跨一列
                            rhCell = $(headers[rhci].el);

                            rhCell[0].rowSpan += 1;

                            rhCell.insertBefore(chCell);

                            height = rhCell[0].rowSpan * 36;

                            $("div", rhCell).css({height: height + "px", lineHeight: height + "px"});

                            chCell.remove();
                            rhci++;
                        }
                    }
                }

                // 合并完注册相关事件
                th.bindEvents2LeafColumn();
                th.bindEvents2GridView();
            });
        },

        setGroupHeaders: function (o) {     //设置表格多层表头
            return this.each(function () {
                var indexOfColumnHeader = function (text, columnHeaders) {
                    var length = columnHeaders.length;
                    for (var i = 0; i < length; i++) {
                        if (columnHeaders[i].startColumnName === text) {
                            return i;
                        }
                    }
                    return -1;
                };
                var $th = this, groupHeaderArray = o, $rowHeader = $("tr.ui-ygrid-headers", $th.grid.hDiv),
                    $groupHeadRow = $("<tr class='ui-ygrid-columnheader' role='columnheader'></tr>").insertBefore($rowHeader),
                    $firstHeaderRow = $($th.grid.hDiv).find("tr.yg-first-row-header");   //不可见行，用于控制每个列的动态宽度
                if ($firstHeaderRow.length == 0) {
                    $firstHeaderRow = $('<tr>', {role: "row", "aria-hidden": "true"}).addClass("yg-first-row-header");
                } else {
                    $firstHeaderRow.empty();
                }
                for (var j = 0, len = $th.p.colModel.length; j < len; j++) {
                    var thStyle = {width: $th.grid.headers[j].width + 'px', display: ($th.p.colModel[j].hidden ? 'none' : '')};
                    $("<th>", {role: 'gridcell'}).css(thStyle).addClass("ui-first-th-ltr").appendTo($firstHeaderRow);
                }
                var index, colHeader, clen = $th.p.colModel.length;

                var form = YIUI.FormStack.getForm($th.getControlGrid().ofFormID);

                for (var i = 0; i < clen; i++) {   //构建上级表头
                    index = indexOfColumnHeader($th.p.colModel[i].name, groupHeaderArray);

                    colHeader = $('<th class="ui-state-default ui-th-column ui-th-ltr" role="columnheader"></th>').appendTo($groupHeadRow);

                    if( index >= 0 ) {
                        var colDef = groupHeaderArray[index];
                        var colWidth = 0,
                            count = colDef.numberOfColumns,
                            vCount = 0;

                        // 非子叶列公式标题
                        var caption = colDef.caption,
                            formulaCaption = colDef.formulaCaption;
                        if( formulaCaption ) {
                            caption = form.eval(formulaCaption, new View.Context(form));
                        }

                        for (var iCol = 0; iCol < count && (i + iCol < clen); iCol++) {
                            if ( $th.p.colModel[i + iCol].hidden )
                                continue;
                            colWidth += $th.grid.headers[i + iCol].width + 1;
                            vCount += 1;
                        }
                        if (colWidth > 0) {
                            colHeader.css({width: colWidth + "px"});
                        } else {
                            colHeader.hide();
                        }
                        colHeader.html(caption).attr("title",caption);
                        colHeader.attr("span",count).attr("colspan",vCount);
                        i += count - 1;
                    } else {
                        if ($th.p.colModel[i].hidden) {
                            colHeader.hide();
                        }
                    }
                }
                $($th.grid.hDiv).find(".ui-ygrid-htable").children("thead").prepend($firstHeaderRow);
                $($th).bind('yGridResizeStop.setGroupHeaders', function (e, nw, idx) {
                    $firstHeaderRow.find('th').eq(idx).width(nw - 1);
                });
            });
        },

        getGridRowById: function (rowid) { //根据行id获取表格行
            var row;
            this.each(function () {
                try {
                    var i = this.rows.length;
                    while (i--) {
                        if (rowid.toString() === this.rows[i].id) {
                            row = this.rows[i];
                            break;
                        }
                    }
                } catch (e) {
                    row = $(this.grid.bDiv).find("#" + rowid);
                }
            });
            return row;
        },

        getGridRowAt: function (rowIndex) {
            var row;
            this.each(function () {
                var th = this;
                row = th.rows[rowIndex];
            });
            return row;
        },

        getGridCellAt: function (rowIndex, colIndex) {
            var cell;
            this.each(function () {
                var th = this;
                var row = th.rows[rowIndex];
                if (row) {
                    cell = row.cells[colIndex];
                }
            });
            return cell;
        },

        setCellRequired: function (rowIndex, colIndex, isRequired) {
            return this.each(function () {
                var pos = this.getColPos(colIndex);
                var cell = $(this).getGridCellAt(rowIndex + 1, pos);
                if( !cell )
                    return;
                var viewCell = $(cell);
                var errorReg = $("div.ui-cell-required",viewCell);
                if( isRequired ) {
                    if( errorReg.length > 0 )
                        return;
                    viewCell.css({position: "relative"});
                    $("<div></div>").addClass("ui-cell-required").attr({title: '必填'}).appendTo(viewCell);
                } else {
                    if( errorReg.length < 0 )
                        return;
                    errorReg.remove();
                    viewCell.removeAttr("position");
                }
            });
        },

        setCellFocus: function (rowIndex,colIndex) {
            return this.each(function () {
                var $t = this,
                    ri = rowIndex + 1,
                    ci = this.getColPos(colIndex);

                var row = $(this).getGridRowAt(ri);
                if( !row || $(row).is(":hidden") )
                    return;

                var cell = row.cells[ci];
                if( !cell )
                    return;

                $(this).scrollVisibleCell(ri,ci);

                if( cell.editor ) {  // 如果有编辑组件,使编辑组件获得焦点
                    cell.editor.focus();
                } else {
                    $(cell).trigger("mousedown").trigger("mouseup").trigger("click",[true]);
                    $t.select( row, colIndex, colIndex );
                }
            });
        },

        // 只选择,不设置焦点
        selectRow: function (rowIndex, colIndex) {
            return this.each(function () {
                this.selectGridRow(colIndex,rowIndex,colIndex,rowIndex,rowIndex,colIndex);
            });
        },

        setCellBackColor: function (rowIndex, colIndex, color) {
            return this.each(function () {
                var pos = this.getColPos(colIndex);
                var cell = $(this).getGridCellAt(rowIndex + 1, pos);
                if (!cell) {
                    return;
                }
                cell.style.backgroundColor = color;
            });
        },

        setCellForeColor: function (rowIndex, colIndex, color) {
            return this.each(function () {
                var pos = this.getColPos(colIndex);
                var cell = $(this).getGridCellAt(rowIndex + 1, pos);
                if (!cell) {
                    return;
                }
                cell.style.color = color;
            });
        },

        setCellEnable:function (rowIndex,colIndex,enable) {
            return this.each(function(){
                var pos = this.getColPos(colIndex);
                var cell = $(this).getGridCellAt(rowIndex + 1, pos);
                if( !cell )
                    return;

                var rowData = this.p.data[rowIndex];

                if( !rowData.backColor ) {
                    if ( enable ) {
                        $(cell).removeClass("ui-cell-disabled");
                    } else {
                        $(cell).addClass("ui-cell-disabled");
                    }
                }

                var cellData = rowData.data[colIndex];

                var meta = cellData.typeDef || this.getCellEditOpt(rowIndex,colIndex);

                if (meta.isAlwaysShow) {
                    switch (meta.cellType) {
                        case YIUI.CONTROLTYPE.BUTTON:
                        case YIUI.CONTROLTYPE.UPLOADBUTTON:
                            $(".cellEditor", cell)[0] && ($(".cellEditor", cell)[0].enable = enable);
                            break;
                        case YIUI.CONTROLTYPE.LABEL:
                        case YIUI.CONTROLTYPE.HYPERLINK:
                            $(".cellEditor", cell)[0] && ($(".cellEditor", cell)[0].enable = enable);
                            break;
                        case YIUI.CONTROLTYPE.CHECKBOX:
                            $(".cellEditor",cell).attr('enable',enable);
                            break;
                        case YIUI.CONTROLTYPE.IMAGE:
                        case YIUI.CONTROLTYPE.IMAGELIST:	
                            cell.editor.setEnable(enable);
                            break;
                        case YIUI.CONTROLTYPE.TEXTAREA:
                            $("textarea", cell).attr("enable",enable);
                            break;
                        default:
                            break;
                    }
                }
            });
        },

        setCellError: function (rowIndex,colIndex,error,errorMsg) {
            return this.each(function () {
                var pos = this.getColPos(colIndex);
                var cell = $(this).getGridCellAt(rowIndex + 1, pos);
                if( !cell )
                    return;
                var errorReg = $("div.ui-cell-error",cell);
                if( error ) {
                    if( errorReg.length > 0 )
                        return;

                  $("<div class='ui-cell-error'></div>").attr({title: errorMsg}).appendTo(cell).parent().css({"position":"relative"});
                } else {
                    if( errorReg.length < 0 )
                        return;
                  errorReg.parent().removeAttr("position").end().remove();
                }
            });
        },

        // 不显示序号列,行错误不显示
        setRowError: function (rowIndex,o,_viewRow) {
            return this.each(function () {
                var $t = this;
                if( !$t.p.rowSequences ) return;

                var viewRow = _viewRow || $(this).getGridRowById($.ygrid.uidPref + rowIndex);
                if( !viewRow ) return;

                var viewCell = $(viewRow.cells[0]);
                var errorReg = $("div.ui-cell-error", viewCell);
                if( !$.isEmptyObject(o) ) {
                    viewCell.attr({title: $t.getControlGrid().getErrorMsg(o)});
                    if( errorReg.length > 0 ) return;  
                    $("<div></div>").addClass("ui-cell-error").appendTo(viewCell);
                    viewCell.css({position: "relative"});
                } else {
                    if( errorReg.length < 0 ) return;
                    errorReg.remove();
                    viewCell.removeAttr("position");
                }
            });
        },

        setRowVisible: function (rowIndex,visible) {
            return this.each(function () {
                var viewRow = $(this).getGridRowById($.ygrid.uidPref + rowIndex);
                if( !viewRow )
                    return;
                if( !visible ) {
                    $(viewRow).hide();
                } else {
                    $(viewRow).show();
                }
            });
        },

        exchangeRow:function (rowIndex,exIndex) {
            return this.each(function () {
                var $t = this,row = $($t).getGridRowById($.ygrid.uidPref + rowIndex),$exRow,tempId;
                if( !row )
                    return;
                if( rowIndex > exIndex ) {
                    var $exRow = $(row).prev(),tempId = $exRow[0].id; // 上移
                    $exRow.before(row);
                } else {
                    var $exRow = $(row).next(),tempId = $exRow[0].id; // 下移
                    $exRow.after(row);
                }

                // 交换行id
                $exRow[0].id = row.id;
                row.id = tempId;

                // 交换行序号
                $(".ygrid-rownum",row).text(parseInt($.ygrid.stripPref($.ygrid.uidPref, row.id)) + 1);
                $(".ygrid-rownum",$exRow).text(parseInt($.ygrid.stripPref($.ygrid.uidPref, $exRow[0].id)) + 1);

                var colIndex = $t.getControlGrid().getFocusColIndex();
                $t.selectGridRow(colIndex,exIndex,colIndex,exIndex,exIndex,colIndex);

                $t.knvFocus2();
            });
        },

        editCell: function (iRow, iCol, normalEdit, event) {
            return this.each(function () {
                var $t = this;
                if (!$t.grid) {
                    return;
                }
                iCol = parseInt(iCol, 10);
                if ($t.p.editCells.length > 0) {
                    if (iRow == $t.p.iRow && iCol == $t.p.iCol) {
                        return;
                    }
                }

                var _grid = $t.getControlGrid();

                var column = $t.p.colModel[iCol],
                    rowIndex = $t.p.selectModel.focusRow,
                    colIndex = iCol - ($t.p.rowSequences ? 1 : 0),
                    rowData = _grid.getRowDataAt(rowIndex),
                    cellData = rowData.data[colIndex];

                var editOpt = $t.getCellEditOpt(rowIndex, colIndex);

                if( editOpt.cellType == YIUI.CONTROLTYPE.LABEL ) {
                    return;
                }

                if( editOpt.cellType == YIUI.CONTROLTYPE.DYNAMIC ) {
                    editOpt = cellData.typeDef;
                }

                if( !editOpt ) {
                    return;
                }

                if( column.name === 'rn' || editOpt.isAlwaysShow || !cellData[2] )
                    return;

                if( colIndex == $t.p.treeIndex || colIndex === $t.p.rowExpandIndex )
                    return;

                var curCell = $("td:eq(" + iCol + ")", $t.rows[iRow]);

                $(curCell).addClass("ui-edit-cell");

                $t.p.editCells.push({ir: iRow, ic: iCol});

                var opt = {normalEdit: normalEdit, ir: iRow, ic: iCol, id: iRow + "_" + column.name, name: column.name, event:event};

                $t.p.createCellEditor.call(_grid, curCell, rowIndex, colIndex, opt);

                $t.p.iCol = iCol;
                $t.p.iRow = iRow;
            });
        },

      setRowBackColor: function (grid,ri,backColor) {
        return this.each(function () {
              var $t = this;
              var rowId = $.ygrid.uidPref + ri;

              var row = $($t).getGridRowById(rowId);
              if(!$.isDefined(row)){
                return;
              }

            $(row).css('background', backColor);
        });
      },

      updateRowBackColor: function (grid,ri,ci) {
            return this.each(function () {
                var $t = this,
                    form = YIUI.FormStack.getForm(grid.ofFormID);

                var rowId = $.ygrid.uidPref + ri;

                var row = $($t).getGridRowById(rowId);
                if(!$.isDefined(row)){
                    return;
                }

                var rowData = grid.getRowDataAt(ri);
                var metaRow = grid.getMetaObj().rows[rowData.metaRowIndex];

                // 初始化行背景色
                if( metaRow.backColor ) {
                    rowData.backColor = $t.gotBackColor(form,grid,metaRow.backColor,ri,ci);
                    $(row).css('background', rowData.backColor);
                }
            });
        },

        updateCell: function (ri, ci) {
            return this.each(function () {
                var $t = this, v;

                var rowId = $.ygrid.uidPref + ri;

                var row = $($t).getGridRowById(rowId);
                if(!$.isDefined(row)){
                    return;
                }

                var iCol = $t.getColPos(ci);

                var cell = row.cells[iCol];
                if(!$.isDefined(cell)){
                    return;
                }

                var $cell = $(cell),
                    grid = $t.getControlGrid(),
                    cellData = grid.getCellDataAt(ri,ci);

                if ( cellData ) {
                    var editOpt = cellData.typeDef || $t.getCellEditOpt(ri, ci);
                    v = cellData[1];
                    if (editOpt.isAlwaysShow) {
                        switch (editOpt.cellType) {
                            case YIUI.CONTROLTYPE.BUTTON:
                            case YIUI.CONTROLTYPE.UPLOADBUTTON:
                                $(".cellEditor span.txt", $cell).html(v);
                                break;
                            case YIUI.CONTROLTYPE.LABEL:
                            case YIUI.CONTROLTYPE.HYPERLINK:
                                $(".cellEditor", $cell).html(v);
                                break;
                            case YIUI.CONTROLTYPE.CHECKBOX:
                                $(".cellEditor", $cell).removeClass('checked');
                                if( v && v !== 'false' ) {
                                    $(".cellEditor", $cell).addClass('checked');
                                }
                                break;
                            case YIUI.CONTROLTYPE.IMAGE:
                            case YIUI.CONTROLTYPE.IMAGELIST:
                            case YIUI.CONTROLTYPE.ICON:
                                $cell[0].editor.setValue(v);
                                break;
                        }
                    } else {
                        $cell.attr("tabindex", "-1").removeClass("ui-edit-cell");

                        var title = {"title": editOpt.tip || v};

                        var span = $cell.find("span");

                        if($t.p.treeIndex != -1 && $t.p.treeIndex == ci){
                            $($cell).empty().append(span).append(v).attr(title);
                        } else {
                            $($cell).empty().text(v).attr(title);
                        }

                        var foreColor = cellData.foreColor || "";
                        if( editOpt.editOptions.negtiveForeColor && parseFloat(v) < 0 ) {
                            foreColor = editOpt.editOptions.negtiveForeColor;
                        }
                        $cell.css("color",foreColor);


                        // 字典类型caption延迟加载
                        if( $t.p.frozenRows ) {
                            row = $($t.grid.fbDiv2).find("#" + rowId);
                            $cell = $("td:eq(" + iCol + ")", row);
                            if( $cell.length > 0 ) {
                                $($cell).text(v).attr(title);
                            }
                        }

                        if( $t.p.frozenColumns ) {
                            row = $($t.grid.fbDiv).find("#" + rowId);
                            $cell = $("td:eq(" + iCol + ")", row);
                            if( $cell.length > 0 ) {
                                $($cell).text(v).attr(title);
                            }
                        }
                    }

                    // 必填
                    $($t).yGrid("setCellRequired", ri, ci, cellData[3]);

                    // 检查规则
                    $($t).yGrid("setCellError", ri, ci, cellData[4], cellData[5]);
                }

                // 结束编辑
                if( $t.p.editCells.length >= 1 ) {

                    $t.p.editCells.splice(0, 1);

                    // 不加 后面改成 不直接结束编辑FX
                    // $t.knvFocus2();
                }
            });
        },
        //滚动表格使得当前单元格处于显示区域
        scrollVisibleCell: function (iRow, iCol) {
            return this.each(function () {
                var $t = this;
                var ch = $t.grid.bDiv.clientHeight,
                    st = $t.grid.bDiv.scrollTop,
                    crth = $t.rows[iRow].offsetTop + $t.rows[iRow].clientHeight,
                    crt = $t.rows[iRow].offsetTop;
                if (crth >= ch + st) {
                    $t.grid.bDiv.scrollTop = crth - ch;// 下部超界
                } else if (crt < st) {
                    $t.grid.bDiv.scrollTop = crt;// 上部超界
                }
                var cw = $t.grid.bDiv.clientWidth,
                    sl = $t.grid.bDiv.scrollLeft,
                    crclw = $t.rows[iRow].cells[iCol].offsetLeft + $t.rows[iRow].cells[iCol].clientWidth,
                    crcl = $t.rows[iRow].cells[iCol].offsetLeft;
                if (crclw >= cw + sl) {
                    $t.grid.bDiv.scrollLeft = crclw - cw;// 右部超界
                } else if (crcl < sl) {
                    $t.grid.bDiv.scrollLeft = crcl; // 左部超界
                }
            });
        },

        clearBeforeUnload: function () {
            return this.each(function () {
                var grid = this.grid;
                if ($.isFunction(grid.emptyRows)) {
                    grid.emptyRows.call(this, true, true);
                }
                $(document).unbind("mouseup.yGrid" + this.p.id);
                $(grid.hDiv).unbind("mousemove");
                $(grid.bDiv).unbind("mousemove");
                $(this).unbind();
                grid.dragEnd = null;
                grid.dragMove = null;
                grid.dragStart = null;
                grid.emptyRows = null;
                grid.populate = null;
                grid.populateVisible = null;
                grid.scrollGrid = null;
                // grid.clearSelectCells = null;
                grid.timer = null;
                grid.prevRowHeight = null;
                grid.bDiv = null;
                grid.hDiv = null;
                //     grid.cols = null;
                var i, l = grid.headers.length;
                for (i = 0; i < l; i++) {
                    grid.headers[i].el = null;
                }
                //this.updatepager = null;
                //  this.refreshIndex = null;
                //  this.modifyGridCell = null;
                this.formatter = null;
                this.grid = null;
                //   this.p._indexMap = null;
                this.p.data = null;
                this.p = null;
            });
        },

        GridDestroy: function () {
            return this.each(function () {
                if (this.grid) {
                    if (this.p.pager) {
                        $(this.p.pager).remove();
                    }
                    try {
                        $(this).clearBeforeUnload();
                        $("#gbox_" + this.id).remove();
                    } catch (_) {
                    }
                }
            });
        }
    });
})(jQuery);
// //fmatter初始化
// (function ($) {
//     "use strict";
//     $.fmatter = {};
//     $.fn.fmatter = function (formatType, cellval, opts, rwd, act) {
//         var v = cellval;
//         opts = $.extend({}, $.ygrid.formatter, opts);
//         try {
//             v = $.fn.fmatter[formatType].call(this, cellval, opts, rwd, act);
//         } catch (fe) {
//         }
//         return v;
//     };
//     $.extend($.fmatter, {
//         isBoolean: function (o) {
//             return typeof o === 'boolean';
//         },
//         isObject: function (o) {
//             return (o && (typeof o === 'object' || $.isFunction(o))) || false;
//         },
//         isString: function (o) {
//             return typeof o === 'string';
//         },
//         isNumber: function (o) {
//             return typeof o === 'number' && isFinite(o);
//         },
//         isValue: function (o) {
//             return (this.isObject(o) || this.isString(o) || this.isNumber(o) || this.isBoolean(o));
//         },
//         isEmpty: function (o) {
//             if (!this.isString(o) && this.isValue(o)) {
//                 return false;
//             }
//             if (!this.isValue(o)) {
//                 return true;
//             }
//             o = $.trim(o).replace(/\&nbsp\;/ig, '').replace(/\&#160\;/ig, '');
//             return o === "";
//         },
//         extend: function (formatType, formatFunc) {
//             if ($.isFunction(formatFunc)) {
//                 $.fn.fmatter[formatType] = formatFunc;
//             }
//         }
//     });
//     $.fn.fmatter.defaultFormat = function (cellval, opts) {
//         return ($.fmatter.isValue(cellval) && cellval !== "" ) ? cellval : opts.defaultValue || "&#160;";
//     };
//     $.fn.fmatter.hyperlink = function (cellval, opts) { //超链接单元格格式化
//         var op = {baseLinkUrl: opts.baseLinkUrl, showAction: opts.showAction, addParam: opts.addParam || "", target: opts.target, idName: opts.idName},
//             target = "", idUrl;
//         if (opts.colModel !== undefined && opts.colModel.formatOptions !== undefined) {
//             op = $.extend({}, op, opts.colModel.formatOptions);
//         }
//         if (op.target) {
//             target = 'target=' + op.target;
//         }
//         if (op.baseLinkUrl) {
//             idUrl = op.baseLinkUrl + op.showAction + '?' + op.idName + '=' + opts.rowId + op.addParam;
//         } else {
//             idUrl = "#";
//         }
//         if ($.fmatter.isString(cellval) || $.fmatter.isNumber(cellval)) {	//add this one even if its blank string
//             return ["<a  style='width: 100%' " , target , " href='" , idUrl , "' class='ui-hyperlink'>" , cellval , "</a>"].join("");
//         }
//         return $.fn.fmatter.defaultFormat(cellval, opts);
//     };
//     $.fn.fmatter.button = function (cellval, opts) {  //按钮单元格格式化
//         if ($.fmatter.isString(cellval) || $.fmatter.isNumber(cellval)) {
//             cellval = typeof(cellval) == "undefined" ? "" : cellval;
//             return "<button style='width: 100%;height: 100%' class='ui-button'>" + cellval + "</button>"
//         }
//         return $.fn.fmatter.defaultFormat(cellval, opts);
//     };
//     $.fn.fmatter.checkbox = function (cellval, opts) {  //复选框单元格格式化
//         var op = $.extend({}, opts.checkbox), ds;
//         if (opts.colModel !== undefined && opts.colModel.formatOptions !== undefined) {
//             op = $.extend({}, op, opts.colModel.formatOptions);
//         }
//         if (op.disabled === true || (opts.colModel.editable === undefined ? !this.p.enable : !opts.colModel.editable)) {
//             ds = "disabled=\"disabled\"";
//         } else {
//             ds = "";
//         }
//         if ($.fmatter.isEmpty(cellval) || cellval === undefined) {
//             cellval = false;
//         }
//         cellval = String(cellval);
//         cellval = (cellval + "").toLowerCase();
//         var bchk = cellval.search(/(false|f|0|no|n|off|undefined)/i) < 0 ? " checked='checked' " : "";
//         return "<input type=\"checkbox\" style='text-align: center' " + bchk + " value=\"" + cellval + "\" offval=\"false\" " + ds + "/>";
//     };
//     $.fn.fmatter.textEditor = function (cellval, opts) {  //输入框格式化
//         return $.fn.fmatter.defaultFormat(cellval, opts);
//     };
//     $.fn.fmatter.numberEditor = function (cellval, opts) {  //数值框格式化
//         if (isNaN(parseFloat(cellval))) {
//             cellval = "";
//         }
//         return $.fn.fmatter.defaultFormat(cellval, opts);
//     };
//     $.fn.fmatter.datePicker = function (cellval, opts) {  //日期格式化
//         if (!$.fmatter.isEmpty(cellval)) {
//             var option = opts.colModel.editOptions;
//             var date = new Date(parseFloat(cellval, 10));
//             return date.Format(option.formatStr);
//         }
//         return $.fn.fmatter.defaultFormat(cellval, opts);
//     };
// })(jQuery);