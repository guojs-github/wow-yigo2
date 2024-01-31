/**
 * 简化版本的jqgrid
 */

//表格初始化，工具条初始化以及数据载入。
(function ($) {
    "use strict";
    $.jgrid = $.jgrid || {};
    $.extend($.jgrid, {//表格内部使用方法初始化
        version: "4.6.0",
        guid: 1,
        uidPref: 'jqg.sp_',
        msie: navigator.appName === 'Microsoft Internet Explorer',
        msiever: function () {
            var rv = -1;
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null) {
                rv = parseFloat(RegExp.$1);
            }
            return rv;
        },
        randId: function (prefix) { //注册ID,根据前缀进行ID分配
            return (prefix || $.jgrid.uidPref) + ($.jgrid.guid++);
        },
        jqID: function (sid) { //转移字符串，把两个反斜杠（\\）转化为单个反斜杠（\）
            return String(sid).replace(/[!"#$%&'()*+,.\/:; <=>?@\[\\\]\^`{|}~]/g, "\\$&");
        },
        htmlDecode: function (value) {
            if (value && (value === '&nbsp;' || value === '&#160;' || (value.length === 1 && value.charCodeAt(0) === 160))) {
                return "";
            }
            return !value ? value : String(value).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
        },
        htmlEncode: function (value) {
            return !value ? value : String(value).replace(/&/g, "&amp;").replace(/\"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        },
        format: function (format) { //格式化类似" {0} 共 {1} 页"的字符串，将{}按序号替换成对应的参数
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
        getCellIndex: function (cell) {  //获取单元格序号
            var c = $(cell);
            if (c.is('tr')) {
                return -1;
            }
            c = (!c.is('td') && !c.is('th') ? c.closest("td,th") : c)[0];
            if ($.jgrid.msie) {
                return $.inArray(c, c.parentNode.cells);
            }
            return c.cellIndex;
        },
        getMethod: function (name) {  // 获取方法
            return this.getAccessor($.fn.jqGrid, name);
        },
        extend: function (methods) {  //继续扩展继承，主要用于添加方法
            $.extend($.fn.jqGrid, methods);
            if (!this.no_legacy_api) {
                $.fn.extend(methods);
            }
        },
        getAccessor: function (obj, expr) {  //从表格中得到对应名称的方法
            var ret, p, prm = [], i;
            if (typeof expr === 'function') {
                return expr(obj);
            }
            ret = obj[expr];
            if (ret === undefined) {
                try {
                    if (typeof expr === 'string') {
                        prm = expr.split('.');
                    }
                    i = prm.length;
                    if (i) {
                        ret = obj;
                        while (ret && i--) {
                            p = prm.shift();
                            ret = ret[p];
                        }
                    }
                } catch (e) {
                }
            }
            return ret;
        }
    });

    $.fn.jqGrid = function (pin) {
        if (typeof pin === 'string') {   //如果是字符串类型，则是执行表格的事件
            var fn = $.jgrid.getMethod(pin); //得到表格事件
            if (!fn) {
                throw ("jqGrid - No such method: " + pin);
            }
            var args = $.makeArray(arguments).slice(1);
            return fn.apply(this, args);  //执行表格事件
        }
        return this.each(function () {  //表格初始化
            if (this.grid) {
                return;
            }
            var p = $.extend(true, {
                height: 150,
                page: 1,
                rowNum: 20,
                rowTotal: null,
                records: 0,
                pager: "",
                pgbuttons: true,
                pginput: true,
                colModel: [],
                colNames: [],
                savedRow: [],
                selarrrow: [],
                reccount: 0,
                lastpage: 0,
                lastsort: 0,
                selrow: null,
                beforeSelectRow: null,
                onSelectRow: null,
                ondblClickRow: null,
                onPaging: null,
                onInitGrid: null,
                loadComplete: null,
                gridComplete: null,
                afterInsertRow: null,
                onHeaderClick: null,
                onColumnHeaderClick: null,
                viewrecords: false,
                caption: "",
                hidegrid: true,
                hiddengrid: false,
                userData: {},
                gridstate: "visible",
                cellEdit: false,
                cellsubmit: "clientArray",
                nv: 0,
                toolbar: [false, ""],
                scroll: false,
                deselectAfterSort: true,
                scrollOffset: 18,
                cellLayout: 5,
                gridview: false,
                rownumWidth: 40,
                rownumbers: false,
                pagerpos: 'center',
                recordpos: 'right',
                footerrow: false,
                userDataOnFooter: false,
                hoverrows: true,
                viewsortcols: [false, 'vertical', true],
                resizeclass: '',
                remapColumns: [],
                direction: "ltr",
                toppager: false,
                headertitles: false,
                scrollTimeout: 40,
                data: [],
                _index: {},
                cmTemplate: {},
                prmNames: {page: "page", rows: "rows", sort: "sidx", order: "sord", search: "_search",
                    nd: "nd", id: "id", oper: "oper", editoper: "edit", addoper: "add", deloper: "del",
                    subgridid: "id", npage: null, totalrows: "totalrows"},
                idPrefix: ""
            }, $.jgrid.defaults, pin || {});
            var ts = this, grid = {
                headers: [],
                cols: [],
                footers: [],
                dragStart: function (i, x, y) {
                    var gridLeftPos = $(this.bDiv).offset().left;
                    this.resizing = { idx: i, startX: x.clientX, sOL: x.clientX - gridLeftPos };
                    this.hDiv.style.cursor = "col-resize";
                    this.curGbox = $("#rs_m" + $.jgrid.jqID(p.id), "#gbox_" + $.jgrid.jqID(p.id));
                    this.curGbox.css({display: "block", left: x.clientX - gridLeftPos, top: y[1], height: y[2]});
                    $(ts).triggerHandler("jqGridResizeStart", [x, i]);
                    if ($.isFunction(p.resizeStart)) {
                        p.resizeStart.call(ts, x, i);
                    }
                    document.onselectstart = function () {
                        return false;
                    };
                },
                dragMove: function (x) {
                    if (this.resizing) {
                        var diff = x.clientX - this.resizing.startX,
                            h = this.headers[this.resizing.idx],
                            newWidth = p.direction === "ltr" ? h.width + diff : h.width - diff, hn, nWn;
                        if (newWidth > 33) {
                            this.curGbox.css({left: this.resizing.sOL + diff});
                            if (p.forceFit === true) {
                                hn = this.headers[this.resizing.idx + p.nv];
                                nWn = p.direction === "ltr" ? hn.width - diff : hn.width + diff;
                                if (nWn > 33) {
                                    h.newWidth = newWidth;
                                    hn.newWidth = nWn;
                                }
                            } else {
                                this.newWidth = p.direction === "ltr" ? p.tblwidth + diff : p.tblwidth - diff;
                                h.newWidth = newWidth;
                            }
                        }
                    }
                },
                dragEnd: function () {
                    this.hDiv.style.cursor = "default";
                    if (this.resizing) {
                        var idx = this.resizing.idx,
                            nw = this.headers[idx].newWidth || this.headers[idx].width;
                        nw = parseInt(nw, 10);
                        this.resizing = false;
                        $("#rs_m" + $.jgrid.jqID(p.id)).css("display", "none");
                        p.colModel[idx].width = nw;
                        if (p.isHasGroupCols) {
                            this.headers[idx].width = nw;
                        } else {
                            this.headers[idx].width = nw - 5;
                        }
                        this.headers[idx].el.style.width = nw + "px";
                        this.cols[idx].style.width = nw + "px";
                        if (this.footers.length > 0) {
                            this.footers[idx].style.width = nw + "px";
                        }
                        if (p.forceFit === true) {
                            nw = this.headers[idx + p.nv].newWidth || this.headers[idx + p.nv].width;
                            this.headers[idx + p.nv].width = nw;
                            this.headers[idx + p.nv].el.style.width = nw + "px";
                            this.cols[idx + p.nv].style.width = nw + "px";
                            if (this.footers.length > 0) {
                                this.footers[idx + p.nv].style.width = nw + "px";
                            }
                            p.colModel[idx + p.nv].width = nw;
                        } else {
                            p.tblwidth = this.newWidth || p.tblwidth;
                            $('table:first', this.bDiv).css("width", p.tblwidth + "px");
                            $('table:first', this.hDiv).css("width", p.tblwidth + "px");
                            this.hDiv.scrollLeft = this.bDiv.scrollLeft;
                            if (p.footerrow) {
                                $('table:first', this.sDiv).css("width", p.tblwidth + "px");
                                this.sDiv.scrollLeft = this.bDiv.scrollLeft;
                            }
                        }
                        $(ts).triggerHandler("jqGridResizeStop", [nw, idx]);
                        if ($.isFunction(p.resizeStop)) {
                            p.resizeStop.call(ts, nw, idx);
                        }
                    }
                    this.curGbox = null;
                    document.onselectstart = function () {
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
                    var rows, rh;
                    if (table[0].rows.length) {
                        try {
                            rows = table[0].rows[1];
                            rh = rows ? $(rows).outerHeight() || grid.prevRowHeight : grid.prevRowHeight;
                        } catch (pv) {
                            rh = grid.prevRowHeight;
                        }
                    }
                    if (!rh) {
                        return;
                    }
                    grid.prevRowHeight = rh;
                    var rn = p.rowNum;
                    var scrollTop = grid.scrollTop = grid.bDiv.scrollTop;
                    var ttop = Math.round(table.position().top) - scrollTop;
                    var tbot = ttop + table.height();
                    var div = rh * rn;
                    var page, npage, empty;
                    if (tbot < dh && ttop <= 0 &&
                        (p.lastpage === undefined || parseInt((tbot + scrollTop + div - 1) / div, 10) <= p.lastpage)) {
                        npage = parseInt((dh - tbot + div - 1) / div, 10);
                        if (tbot >= 0 || npage < 2 || p.scroll === true) {
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
                        if (grid.hDiv.loading) {
                            grid.timer = setTimeout(grid.populateVisible, p.scrollTimeout);
                        } else {
                            p.page = page;
                            if (empty) {
                                grid.selectionPreserver(table[0]);
                                grid.emptyRows.call(table[0], false, false);
                            }
                            grid.populate(npage);
                        }
                    }
                },
                scrollGrid: function (e) {
                    if (p.scroll) {
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
                    if (p.footerrow) {
                        grid.sDiv.scrollLeft = grid.bDiv.scrollLeft;
                    }
                    if (e) {
                        e.stopPropagation();
                    }
                },
                selectionPreserver: function (ts) {
                    var p = ts.p,
                        sr = p.selrow, sra = p.selarrrow ? $.makeArray(p.selarrrow) : null,
                        left = ts.grid.bDiv.scrollLeft,
                        restoreSelection = function () {
                            var i;
                            p.selrow = null;
                            p.selarrrow = [];
                            if (sr) {
                                $(ts).jqGrid("setSelection", sr, false, null);
                            }
                            ts.grid.bDiv.scrollLeft = left;
                            $(ts).unbind('.selectionPreserver', restoreSelection);
                        };
                    $(ts).bind('jqGridGridComplete.selectionPreserver', restoreSelection);
                }
            };
            if (this.tagName.toUpperCase() !== 'TABLE') {
                alert("Element is not a table");
                return;
            }
            if (document.documentMode !== undefined) { // IE only
                if (document.documentMode < 5) {
                    alert("Grid can not be used in this ('quirks') mode!");
                    return;
                }
            }
            $(this).empty().attr("tabindex", "0");
            this.p = p;
            this.p.useProp = !!$.fn.prop;
            var i, dir;
            if (this.p.colNames.length === 0) {
                for (i = 0; i < this.p.colModel.length; i++) {
                    this.p.colNames[i] = this.p.colModel[i].label || this.p.colModel[i].name;
                }
            }
            if (this.p.colNames.length !== this.p.colModel.length) {
                alert($.jgrid.errors.model);
                return;
            }
            var gv = $("<div class='ui-jqgrid-view'></div>"),
                isMSIE = $.jgrid.msie;
            ts.p.direction = $.trim(ts.p.direction.toLowerCase());
            if ($.inArray(ts.p.direction, ["ltr", "rtl"]) === -1) {
                ts.p.direction = "ltr";
            }
            dir = ts.p.direction;

            $(gv).insertBefore(this);
            $(this).removeClass("scroll").appendTo(gv);
            var eg = $("<div class='ui-jqgrid ui-widget ui-widget-content ui-corner-all'></div>");
            $(eg).attr({"id": "gbox_" + this.id, "dir": dir}).insertBefore(gv);
            $(gv).attr("id", "gview_" + this.id).appendTo(eg);
            $("<div class='ui-widget-overlay jqgrid-overlay' id='lui_" + this.id + "'></div>").insertBefore(gv);
            $("<div class='loading ui-state-default ui-state-active' id='load_" + this.id + "'>" + this.p.loadtext + "</div>").insertBefore(gv);
            $(this).attr({cellspacing: "0", cellpadding: "0", border: "0", "role": "grid", "aria-labelledby": "gbox_" + this.id});
            var intNum = function (val, defval) {
                    val = parseInt(val, 10);
                    if (isNaN(val)) {
                        return defval || 0;
                    }
                    return val;
                },
                refreshIndex = function () {
                    var datalen = ts.p.data.length, idname, i, val,
                        idname = ts.p.localReader.id;
                    for (i = 0; i < datalen; i++) {
                        val = $.jgrid.getAccessor(ts.p.data[i], idname);
                        if (val === undefined) {
                            val = String(i + 1);
                        }
                        ts.p._index[val] = i;
                    }
                },
                setColWidth = function () {
                    var initwidth = 0, brd = intNum(ts.p.cellLayout, 0), vc = 0, lvc, scw = intNum(ts.p.scrollOffset, 0), cw, hs = false, aw, gw = 0, cr;
                    $.each(ts.p.colModel, function () {
                        if (this.hidden === undefined) {
                            this.hidden = false;
                        }
                        this.widthOrg = cw = intNum(this.width, 0);
                        if (this.hidden === false) {
                            initwidth += cw + brd;
                            if (this.fixed) {
                                gw += cw + brd;
                            } else {
                                vc++;
                            }
                        }
                    });
                    if (isNaN(ts.p.width)) {
                        ts.p.width = initwidth + (!isNaN(ts.p.height) ? scw : 0);
                    }
                    grid.width = ts.p.width;
                    ts.p.tblwidth = initwidth;
                },
                getOffset = function (iCol) {
                    var $th = $(ts.grid.headers[iCol].el), ret = [$th.position().left + $th.outerWidth()];
                    if (ts.p.direction === "rtl") {
                        ret[0] = ts.p.width - ret[0];
                    }
                    ret[0] -= ts.grid.bDiv.scrollLeft;
                    ret.push($(ts.grid.hDiv).position().top);
                    ret.push($(ts.grid.bDiv).offset().top - $(ts.grid.hDiv).offset().top + $(ts.grid.bDiv).height());
                    return ret;
                },
                getColumnHeaderIndex = function (th) {
                    var i, headers = ts.grid.headers, ci = $.jgrid.getCellIndex(th);
                    for (i = 0; i < headers.length; i++) {
                        if (th === headers[i].el) {
                            ci = i;
                            break;
                        }
                    }
                    return ci;
                },
                formatCol = function (pos, rowInd, tv, rawObject, rowId, rdata) {
                    var cm = ts.p.colModel[pos],
                        ral = cm.align, result = "style=\"", clas = cm.classes, nm = cm.name, celp, acp = [];
                    if (ral) {
                        result += "text-align:" + ral + ";";
                    }
                    if (cm.hidden === true) {
                        result += "display:none;";
                    }
                    if (rowInd === 0) {
                        result += "width: " + grid.headers[pos].width + "px;";
                    } else if (cm.cellattr && $.isFunction(cm.cellattr)) {
                        celp = cm.cellattr.call(ts, rowId, tv, rawObject, cm, rdata);
                        if (celp && typeof celp === "string") {
                            celp = celp.replace(/style/i, 'style').replace(/title/i, 'title');
                            if (celp.indexOf('title') > -1) {
                                cm.title = false;
                            }
                            if (celp.indexOf('class') > -1) {
                                clas = undefined;
                            }
                            acp = celp.replace('-style', '-sti').split(/style/);
                            if (acp.length === 2) {
                                acp[1] = $.trim(acp[1].replace('-sti', '-style').replace("=", ""));
                                if (acp[1].indexOf("'") === 0 || acp[1].indexOf('"') === 0) {
                                    acp[1] = acp[1].substring(1);
                                }
                                result += acp[1].replace(/'/gi, '"');
                            } else {
                                result += "\"";
                            }
                        }
                    }
                    if (!acp.length) {
                        acp[0] = "";
                        result += "\"";
                    }
                    result += (clas !== undefined ? (" class=\"" + clas + "\"") : "") + ((cm.title && tv) ? (" title=\"" + $.jgrid.stripHtml(tv) + "\"") : "");
                    result += " aria-describedby=\"" + ts.p.id + "_" + nm + "\"";
                    return result + acp[0];
                },
                cellVal = function (val) {
                    return val == null || val === "" ? "&#160;" : String(val);
                },
                formatter = function (rowId, cellval, colpos, rwdat, _act) {
                    var cm = ts.p.colModel[colpos], v;
                    if (cm.formatter !== undefined) {
                        rowId = String(ts.p.idPrefix) !== "" ? $.jgrid.stripPref(ts.p.idPrefix, rowId) : rowId;
                        var opts = {rowId: rowId, colModel: cm, gid: ts.p.id, pos: colpos };
                        if ($.isFunction(cm.formatter)) {
                            v = cm.formatter.call(ts, cellval, opts, rwdat, _act);
                        } else if ($.fmatter) {
                            v = $.fn.fmatter.call(ts, cm.formatter, cellval, opts, rwdat, _act);
                        } else {
                            v = cellVal(cellval);
                        }
                    } else {
                        v = cellVal(cellval);
                    }
                    return v;
                },
                addCell = function (rowId, cell, pos, irow, srvr, rdata) {
                    var v, prp;
                    v = formatter(rowId, cell, pos, srvr, 'add');
                    prp = formatCol(pos, irow, v, srvr, rowId, rdata);
                    return "<td role=\"gridcell\" " + prp + ">" + v + "</td>";
                },
                addRowNum = function (pos, irow, pG, rN) {
                    var v = (parseInt(pG, 10) - 1) * parseInt(rN, 10) + 1 + irow,
                        prp = formatCol(pos, irow, v, null, irow, true);
                    return "<td role=\"gridcell\" class=\"ui-state-default jqgrid-rownum\" " + prp + ">" + v + "</td>";
                },
                reader = function (datatype) {
                    var field, f = [], j = 0, i;
                    for (i = 0; i < ts.p.colModel.length; i++) {
                        field = ts.p.colModel[i];
                        if (field.name !== 'rn') {
                            f[j] = field.name;
                            if (ts.p.keyIndex !== false && field.key === true) {
                                ts.p.keyName = f[j];
                            }
                            j++;
                        }
                    }
                    return f;
                },
                orderedCols = function (offset) {
                    var order = ts.p.remapColumns;
                    if (!order || !order.length) {
                        order = $.map(ts.p.colModel, function (v, i) {
                            return i;
                        });
                    }
                    if (offset) {
                        order = $.map(order, function (v) {
                            return v < offset ? null : v - offset;
                        });
                    }
                    return order;
                },
                emptyRows = function (scroll, locdata) {
                    var firstrow;
                    firstrow = this.rows.length > 0 ? this.rows[0] : null;
                    $(this.firstChild).empty().append(firstrow);
                    if (scroll && this.p.scroll) {
                        $(this.grid.bDiv.firstChild).css({height: "auto"});
                        $(this.grid.bDiv.firstChild.firstChild).css({height: 0, display: "none"});
                        if (this.grid.bDiv.scrollTop !== 0) {
                            this.grid.bDiv.scrollTop = 0;
                        }
                    }
                    if (locdata === true && this.p.treeGrid) {
                        this.p.data = [];
                        this.p._index = {};
                    }
                },
                constructTr = function (id, hide, altClass, rd, cur, selected) {
                    var tabindex = '-1', restAttr = '', attrName, style = hide ? 'display:none;' : '',
                        classes = 'ui-widget-content jqgrow ui-row-' + ts.p.direction + (altClass ? ' ' + altClass : '') + (selected ? ' ui-state-highlight' : ''),
                        rowAttrObj = $(ts).triggerHandler("jqGridRowAttr", [rd, cur, id]);
                    if (typeof rowAttrObj !== "object") {
                        rowAttrObj = $.isFunction(ts.p.rowattr) ? ts.p.rowattr.call(ts, rd, cur, id) : {};
                    }
                    if (!$.isEmptyObject(rowAttrObj)) {
                        if (rowAttrObj.hasOwnProperty("id")) {
                            id = rowAttrObj.id;
                            delete rowAttrObj.id;
                        }
                        if (rowAttrObj.hasOwnProperty("tabindex")) {
                            tabindex = rowAttrObj.tabindex;
                            delete rowAttrObj.tabindex;
                        }
                        if (rowAttrObj.hasOwnProperty("style")) {
                            style += rowAttrObj.style;
                            delete rowAttrObj.style;
                        }
                        if (rowAttrObj.hasOwnProperty("class")) {
                            classes += ' ' + rowAttrObj['class'];
                            delete rowAttrObj['class'];
                        }
                        try {
                            delete rowAttrObj.role;
                        } catch (ra) {
                        }
                        for (attrName in rowAttrObj) {
                            if (rowAttrObj.hasOwnProperty(attrName)) {
                                restAttr += ' ' + attrName + '=' + rowAttrObj[attrName];
                            }
                        }
                    }
                    return '<tr role="row" id="' + id + '" tabindex="' + tabindex + '" class="' + classes + '"' +
                        (style === '' ? '' : ' style="' + style + '"') + restAttr + '>';
                },
                updatepager = function (rn, dnd) {
                    var cp, last, base, from, to, tot, fmt, pgboxes = "", sppg,
                        tspg = ts.p.pager ? "_" + $.jgrid.jqID(ts.p.pager.substr(1)) : "",
                        tspg_t = ts.p.toppager ? "_" + ts.p.toppager.substr(1) : "";
                    base = parseInt(ts.p.page, 10) - 1;
                    if (base < 0) {
                        base = 0;
                    }
                    base = base * parseInt(ts.p.rowNum, 10);
                    to = base + ts.p.reccount;
                    if (ts.p.scroll) {
                        var rows = $("tbody:first > tr:gt(0)", ts.grid.bDiv);
                        base = to - rows.length;
                        ts.p.reccount = rows.length;
                        var rh = rows.outerHeight() || ts.grid.prevRowHeight;
                        if (rh) {
                            var top = base * rh;
                            var height = parseInt(ts.p.records, 10) * rh;
                            $(">div:first", ts.grid.bDiv).css({height: height}).children("div:first").css({height: top, display: top ? "" : "none"});
                            if (ts.grid.bDiv.scrollTop == 0 && ts.p.page > 1) {
                                ts.grid.bDiv.scrollTop = ts.p.rowNum * (ts.p.page - 1) * rh;
                            }
                        }
                        ts.grid.bDiv.scrollLeft = ts.grid.hDiv.scrollLeft;
                    }
                    pgboxes = ts.p.pager || "";
                    pgboxes += ts.p.toppager ? (pgboxes ? "," + ts.p.toppager : ts.p.toppager) : "";
                    if (pgboxes) {
                        fmt = $.jgrid.formatter.integer || {};
                        cp = intNum(ts.p.page);
                        last = intNum(ts.p.lastpage);
                        $(".selbox", pgboxes)[ ts.p.useProp ? 'prop' : 'attr' ]("disabled", false);
                        if (ts.p.pginput === true) {
                            $('.ui-pg-input', pgboxes).val(ts.p.page);
                            $('#sp_1_' + pgboxes.substr(1)).html(ts.p.lastpage);
                        }
                        if (ts.p.viewrecords) {
                            if (ts.p.reccount === 0) {
                                $(".ui-paging-info", pgboxes).html(ts.p.emptyrecords);
                            } else {
                                from = base + 1;
                                tot = ts.p.records;
                                $(".ui-paging-info", pgboxes).html($.jgrid.format(ts.p.recordtext, from, to, tot));
                            }
                        }
                        if (ts.p.pgbuttons === true) {
                            if (cp <= 0) {
                                cp = last = 0;
                            }
                            if (cp === 1 || cp === 0) {
                                $("#first" + tspg + ", #prev" + tspg).addClass('ui-state-disabled').removeClass('ui-state-hover');
                                if (ts.p.toppager) {
                                    $("#first_t" + tspg_t + ", #prev_t" + tspg_t).addClass('ui-state-disabled').removeClass('ui-state-hover');
                                }
                            } else {
                                $("#first" + tspg + ", #prev" + tspg).removeClass('ui-state-disabled');
                                if (ts.p.toppager) {
                                    $("#first_t" + tspg_t + ", #prev_t" + tspg_t).removeClass('ui-state-disabled');
                                }
                            }
                            if (cp === last || cp === 0) {
                                $("#next" + tspg + ", #last" + tspg).addClass('ui-state-disabled').removeClass('ui-state-hover');
                                if (ts.p.toppager) {
                                    $("#next_t" + tspg_t + ", #last_t" + tspg_t).addClass('ui-state-disabled').removeClass('ui-state-hover');
                                }
                            } else {
                                $("#next" + tspg + ", #last" + tspg).removeClass('ui-state-disabled');
                                if (ts.p.toppager) {
                                    $("#next_t" + tspg_t + ", #last_t" + tspg_t).removeClass('ui-state-disabled');
                                }
                            }
                        }
                    }
                    if (rn === true && ts.p.rownumbers === true) {
                        $(">td.jqgrid-rownum", ts.rows).each(function (i) {
                            $(this).html(base + 1 + i);
                        });
                    }
                    if (dnd && ts.p.jqgdnd) {
                        $(ts).jqGrid('gridDnD', 'updateDnD');
                    }
                    $(ts).triggerHandler("jqGridGridComplete");
                    if ($.isFunction(ts.p.gridComplete)) {
                        ts.p.gridComplete.call(ts);
                    }
                    $(ts).triggerHandler("jqGridAfterGridComplete");
                },
                addJSONData = function (data, t, rcnt, more, adjust) {
                    var startReq = new Date();
                    if (data) {
                        if (ts.p.treeANode === -1 && !ts.p.scroll) {
                            emptyRows.call(ts, false, true);
                            rcnt = 1;
                        } else {
                            rcnt = rcnt > 1 ? rcnt : 1;
                        }
                    } else {
                        return;
                    }

                    var dReader, locid = "_id_", frd,
                        local = ts.p.datatype !== "local" && ts.p.loadonce;
                    if (local) {
                        ts.p.data = [];
                        ts.p._index = {};
                        ts.p.localReader.id = locid;
                    }
                    ts.p.reccount = 0;
                    dReader = ts.p.localReader;
                    frd = 'local';

                    var self = $(ts), ir = 0, v, i, j, f = [], cur, ni = ts.p.rownumbers === true ? 1 : 0,
                        arrayReader = orderedCols(ni), objectReader = reader(frd), rowReader, len, drows,
                        idn, rd = {}, fpos, idr, rowData = [], cn = "", cn1;
                    ts.p.page = intNum($.jgrid.getAccessor(data, dReader.page), ts.p.page);
                    ts.p.lastpage = intNum($.jgrid.getAccessor(data, dReader.total), 1);
                    ts.p.records = intNum($.jgrid.getAccessor(data, dReader.records));
                    ts.p.userData = $.jgrid.getAccessor(data, dReader.userdata) || {};
                    if (ts.p.keyIndex === false) {
                        idn = $.isFunction(dReader.id) ? dReader.id.call(ts, data) : dReader.id;
                    } else {
                        idn = ts.p.keyIndex;
                    }
                    if (!dReader.repeatitems) {
                        f = objectReader;
                        if (f.length > 0 && !isNaN(idn)) {
                            idn = ts.p.keyName;
                        }
                    }
                    drows = $.jgrid.getAccessor(data, dReader.root);
                    if (drows == null && $.isArray(data)) {
                        drows = data;
                    }
                    if (!drows) {
                        drows = [];
                    }
                    len = drows.length;
                    i = 0;
                    if (len > 0 && ts.p.page <= 0) {
                        ts.p.page = 1;
                    }
                    var rn = parseInt(ts.p.rowNum, 10), br = ts.p.scroll ? $.jgrid.randId() : 1, altr, selected = false, selr;
                    if (adjust) {
                        rn *= adjust + 1;
                    }
                    if (ts.p.datatype === "local" && !ts.p.deselectAfterSort) {
                        selected = true;
                    }
                    var afterInsRow = $.isFunction(ts.p.afterInsertRow), grpdata = [], hiderow = false, groupingPrepare;
                    while (i < len) {
                        cur = drows[i];
                        idr = $.jgrid.getAccessor(cur, idn);
                        if (idr === undefined) {
                            if (typeof idn === "number" && ts.p.colModel[idn + ni] != null) {
                                idr = $.jgrid.getAccessor(cur, ts.p.colModel[idn + ni].name);
                            }
                            if (idr === undefined) {
                                idr = br + i;
                                if (f.length === 0) {
                                    if (dReader.cell) {
                                        var ccur = $.jgrid.getAccessor(cur, dReader.cell) || cur;
                                        idr = ccur != null && ccur[idn] !== undefined ? ccur[idn] : idr;
                                        ccur = null;
                                    }
                                }
                            }
                        }
                        idr = ts.p.idPrefix + idr;
                        altr = rcnt === 1 ? 0 : rcnt;
                        cn1 = (altr + i) % 2 === 1 ? cn : '';
                        if (selected) {
                            selr = (idr === ts.p.selrow);
                        }
                        var iStartTrTag = rowData.length;
                        rowData.push("");
                        if (ni) {
                            rowData.push(addRowNum(0, i, ts.p.page, ts.p.rowNum));
                        }
                        rowReader = objectReader;
                        if (dReader.repeatitems) {
                            if (dReader.cell) {
                                cur = $.jgrid.getAccessor(cur, dReader.cell) || cur;
                            }
                            if ($.isArray(cur)) {
                                rowReader = arrayReader;
                            }
                        }
                        for (j = 0; j < rowReader.length; j++) {
                            v = $.jgrid.getAccessor(cur, rowReader[j]);
                            rd[ts.p.colModel[j + ni].name] = v;
                            rowData.push(addCell(idr, v, j + ni, i + rcnt, cur, rd));
                        }
                        rowData[iStartTrTag] = constructTr(idr, hiderow, cn1, rd, cur, selr);
                        rowData.push("</tr>");
                        if (ts.p.grouping) {
                            grpdata.push(rowData);
                            if (!ts.p.groupingView._locgr) {
                                groupingPrepare.call(self, rd, i);
                            }
                            rowData = [];
                        }
                        rd[locid] = $.jgrid.stripPref(ts.p.idPrefix, idr);
                        if (local) {
                            ts.p.data.push(rd);
                            ts.p._index[rd[locid]] = ts.p.data.length - 1;
                        }
                        if (ts.p.gridview === false) {
                            $("#" + $.jgrid.jqID(ts.p.id) + " tbody:first").append(rowData.join(''));
                            self.triggerHandler("jqGridAfterInsertRow", [idr, rd, cur]);
                            if (afterInsRow) {
                                ts.p.afterInsertRow.call(ts, idr, rd, cur);
                            }
                            rowData = [];//ari=0;
                        }
                        rd = {};
                        ir++;
                        i++;
                        if (ir === rn) {
                            break;
                        }
                    }
                    if (ts.p.gridview === true) {
                        fpos = ts.p.treeANode > -1 ? ts.p.treeANode : 0;
                        $("#" + $.jgrid.jqID(ts.p.id) + " tbody:first").append(rowData.join(''));
                    }
                    ts.p.totaltime = new Date() - startReq;
                    if (ir > 0) {
                        if (ts.p.records === 0) {
                            ts.p.records = len;
                        }
                    }
                    rowData = null;
                    if (ts.p.treeGrid === true) {
                        try {
                            self.jqGrid("setTreeNode", fpos + 1, ir + fpos + 1);
                        } catch (e) {
                        }
                    }
                    if (!ts.p.treeGrid && !ts.p.scroll) {
                        ts.grid.bDiv.scrollTop = 0;
                    }
                    ts.p.reccount = ir;
                    ts.p.treeANode = -1;
                    if (ts.p.userDataOnFooter) {
                        self.jqGrid("footerData", "set", ts.p.userData, true);
                    }
                    if (!more) {
                        ts.updatepager(false, true);
                    }
                    while (ir < len && drows[ir]) {
                        cur = drows[ir];
                        idr = $.jgrid.getAccessor(cur, idn);
                        if (idr === undefined) {
                            if (typeof idn === "number" && ts.p.colModel[idn + ni] != null) {
                                idr = $.jgrid.getAccessor(cur, ts.p.colModel[idn + ni].name);
                            }
                            if (idr === undefined) {
                                idr = br + ir;
                                if (f.length === 0) {
                                    if (dReader.cell) {
                                        var ccur2 = $.jgrid.getAccessor(cur, dReader.cell) || cur;
                                        idr = ccur2 != null && ccur2[idn] !== undefined ? ccur2[idn] : idr;
                                        ccur2 = null;
                                    }
                                }
                            }
                        }
                        if (cur) {
                            idr = ts.p.idPrefix + idr;
                            rowReader = objectReader;
                            if (dReader.repeatitems) {
                                if (dReader.cell) {
                                    cur = $.jgrid.getAccessor(cur, dReader.cell) || cur;
                                }
                                if ($.isArray(cur)) {
                                    rowReader = arrayReader;
                                }
                            }

                            for (j = 0; j < rowReader.length; j++) {
                                rd[ts.p.colModel[j + ni].name] = $.jgrid.getAccessor(cur, rowReader[j]);
                            }
                            rd[locid] = $.jgrid.stripPref(ts.p.idPrefix, idr);
                            if (ts.p.grouping) {
                                groupingPrepare.call(self, rd, ir);
                            }
                            ts.p.data.push(rd);
                            ts.p._index[rd[locid]] = ts.p.data.length - 1;
                            rd = {};
                        }
                        ir++;
                    }
                },
                addLocalData = function () {
                    if (!$.isArray(ts.p.data)) {
                        return;
                    }
                    var queryResults = ts.p.data,
                        recordsperpage = parseInt(ts.p.rowNum, 10),
                        total = queryResults.length,
                        page = parseInt(ts.p.page, 10),
                        totalpages = Math.ceil(total / recordsperpage),
                        retresult = {};
                    queryResults = queryResults.slice((page - 1) * recordsperpage, page * recordsperpage);
                    retresult[ts.p.localReader.total] = totalpages;
                    retresult[ts.p.localReader.page] = page;
                    retresult[ts.p.localReader.records] = total;
                    retresult[ts.p.localReader.root] = queryResults;
                    retresult[ts.p.localReader.userdata] = ts.p.userData;
                    queryResults = null;
                    return  retresult;
                },
                populate = function (npage) {
                    if (!ts.grid.hDiv.loading) {
                        var pvis = ts.p.scroll && npage === false,
                            prm = {}, dt, dstr, pN = ts.p.prmNames;
                        if (ts.p.page <= 0) {
                            ts.p.page = Math.min(1, ts.p.lastpage);
                        }
                        if (pN.search !== null) {
                            prm[pN.search] = ts.p.search;
                        }
                        if (pN.nd !== null) {
                            prm[pN.nd] = new Date().getTime();
                        }
                        if (pN.rows !== null) {
                            prm[pN.rows] = ts.p.rowNum;
                        }
                        if (pN.page !== null) {
                            prm[pN.page] = ts.p.page;
                        }
                        if (pN.sort !== null) {
                            prm[pN.sort] = ts.p.sortname;
                        }
                        if (pN.order !== null) {
                            prm[pN.order] = ts.p.sortorder;
                        }
                        if (ts.p.rowTotal !== null && pN.totalrows !== null) {
                            prm[pN.totalrows] = ts.p.rowTotal;
                        }
                        var lcf = $.isFunction(ts.p.loadComplete), lc = lcf ? ts.p.loadComplete : null;
                        var adjust = 0;
                        npage = npage || 1;
                        if (npage > 1) {
                            if (pN.npage !== null) {
                                prm[pN.npage] = npage;
                                adjust = npage - 1;
                                npage = 1;
                            } else {
                                lc = function (req) {
                                    ts.p.page++;
                                    ts.grid.hDiv.loading = false;
                                    if (lcf) {
                                        ts.p.loadComplete.call(ts, req);
                                    }
                                    populate(npage - 1);
                                };
                            }
                        }
                        var rcnt = !ts.p.scroll ? 1 : ts.rows.length - 1;
                        ts.p.datatype = "local";
                        var req = addLocalData();
                        addJSONData(req, ts.grid.bDiv, rcnt, npage > 1, adjust);
                        $(ts).triggerHandler("jqGridLoadComplete", [req]);
                        if (lc) {
                            lc.call(ts, req);
                        }
                        $(ts).triggerHandler("jqGridAfterLoadComplete", [req]);
                        if (pvis) {
                            ts.grid.populateVisible();
                        }
                    }
                },
                setPager = function (pgid, tp) {
                    var sep = "<td class='ui-pg-button ui-state-disabled' style='width:4px;'><span class='ui-separator'></span></td>",
                        pginp = "",
                        pgl = "<table cellspacing='0' cellpadding='0' border='0' style='table-layout:auto;' class='ui-pg-table'><tbody><tr>",
                        str = "", pgcnt, lft, cent, rgt, twd, tdw, i,
                        clearVals = function (onpaging) {
                            var ret;
                            if ($.isFunction(ts.p.onPaging)) {
                                ret = ts.p.onPaging.call(ts, onpaging);
                            }
                            if (ret === 'stop') {
                                return false;
                            }
                            ts.p.selrow = null;
                            ts.p.savedRow = [];
                            return true;
                        };
                    pgid = pgid.substr(1);
                    tp += "_" + pgid;
                    pgcnt = "pg_" + pgid;
                    lft = pgid + "_left";
                    cent = pgid + "_center";
                    rgt = pgid + "_right";
                    $("#" + $.jgrid.jqID(pgid))
                        .append("<div id='" + pgcnt + "' class='ui-pager-control' role='group'><table cellspacing='0' cellpadding='0' border='0' class='ui-pg-table' style='width:100%;table-layout:fixed;height:100%;' role='row'><tbody><tr><td id='"
                            + lft + "' align='left'></td><td id='" + cent + "' align='center' style='white-space:pre;'></td><td id='" + rgt + "' align='right'></td></tr></tbody></table></div>")
                        .attr("dir", "ltr"); //explicit setting
                    if (dir === "rtl") {
                        pgl += str;
                    }
                    if (ts.p.pginput === true) {
                        pginp = "<td dir='" + dir + "'>" + $.jgrid.format(ts.p.pgtext || "", "<input class='ui-pg-input' type='text' size='2' maxlength='7' value='0' role='textbox'/>", "<span id='sp_1_" + $.jgrid.jqID(pgid) + "'></span>") + "</td>";
                    }
                    if (ts.p.pgbuttons === true) {
                        var po = ["first" + tp, "prev" + tp, "next" + tp, "last" + tp];
                        if (dir === "rtl") {
                            po.reverse();
                        }
                        pgl += "<td id='" + po[0] + "' class='ui-pg-button ui-corner-all'><span class='ui-icon ui-icon-seek-first'></span></td>";
                        pgl += "<td id='" + po[1] + "' class='ui-pg-button ui-corner-all'><span class='ui-icon ui-icon-seek-prev'></span></td>";
                        pgl += pginp !== "" ? sep + pginp + sep : "";
                        pgl += "<td id='" + po[2] + "' class='ui-pg-button ui-corner-all'><span class='ui-icon ui-icon-seek-next'></span></td>";
                        pgl += "<td id='" + po[3] + "' class='ui-pg-button ui-corner-all'><span class='ui-icon ui-icon-seek-end'></span></td>";
                    } else if (pginp !== "") {
                        pgl += pginp;
                    }
                    if (dir === "ltr") {
                        pgl += str;
                    }
                    pgl += "</tr></tbody></table>";
                    if (ts.p.viewrecords === true) {
                        $("td#" + pgid + "_" + ts.p.recordpos, "#" + pgcnt).append("<div dir='" + dir + "' style='text-align:" + ts.p.recordpos + "' class='ui-paging-info'></div>");
                    }
                    $("td#" + pgid + "_" + ts.p.pagerpos, "#" + pgcnt).append(pgl);
                    tdw = $(".ui-jqgrid").css("font-size") || "11px";
                    $(document.body).append("<div id='testpg' class='ui-jqgrid ui-widget ui-widget-content' style='font-size:" + tdw + ";visibility:hidden;' ></div>");
                    twd = $(pgl).clone().appendTo("#testpg").width();
                    $("#testpg").remove();
                    if (twd > 0) {
                        if (pginp !== "") {
                            twd += 50;
                        } //should be param
                        $("td#" + pgid + "_" + ts.p.pagerpos, "#" + pgcnt).width(twd);
                    }
                    ts.p._nvtd = [];
                    ts.p._nvtd[0] = twd ? Math.floor((ts.p.width - twd) / 2) : Math.floor(ts.p.width / 3);
                    ts.p._nvtd[1] = 0;
                    pgl = null;
                    $('.ui-pg-selbox', "#" + pgcnt).bind('change', function () {
                        if (!clearVals('records')) {
                            return false;
                        }
                        ts.p.page = Math.round(ts.p.rowNum * (ts.p.page - 1) / this.value - 0.5) + 1;
                        ts.p.rowNum = this.value;
                        if (ts.p.pager) {
                            $('.ui-pg-selbox', ts.p.pager).val(this.value);
                        }
                        if (ts.p.toppager) {
                            $('.ui-pg-selbox', ts.p.toppager).val(this.value);
                        }
                        populate();
                        return false;
                    });
                    if (ts.p.pgbuttons === true) {
                        $(".ui-pg-button", "#" + pgcnt).hover(function () {
                            if ($(this).hasClass('ui-state-disabled')) {
                                this.style.cursor = 'default';
                            } else {
                                $(this).addClass('ui-state-hover');
                                this.style.cursor = 'pointer';
                            }
                        }, function () {
                            if (!$(this).hasClass('ui-state-disabled')) {
                                $(this).removeClass('ui-state-hover');
                                this.style.cursor = "default";
                            }
                        });
                        $("#first" + $.jgrid.jqID(tp) + ", #prev" + $.jgrid.jqID(tp) + ", #next" + $.jgrid.jqID(tp) + ", #last" + $.jgrid.jqID(tp)).click(function () {
                            if ($(this).hasClass("ui-state-disabled")) {
                                return false;
                            }
                            var cp = intNum(ts.p.page, 1),
                                last = intNum(ts.p.lastpage, 1), selclick = false,
                                fp = true, pp = true, np = true, lp = true;
                            if (last === 0 || last === 1) {
                                fp = false;
                                pp = false;
                                np = false;
                                lp = false;
                            }
                            else if (last > 1 && cp >= 1) {
                                if (cp === 1) {
                                    fp = false;
                                    pp = false;
                                }
                                //else if( cp>1 && cp <last){ }
                                else if (cp === last) {
                                    np = false;
                                    lp = false;
                                }
                            } else if (last > 1 && cp === 0) {
                                np = false;
                                lp = false;
                                cp = last - 1;
                            }
                            if (!clearVals(this.id)) {
                                return false;
                            }
                            if (this.id === 'first' + tp && fp) {
                                ts.p.page = 1;
                                selclick = true;
                            }
                            if (this.id === 'prev' + tp && pp) {
                                ts.p.page = (cp - 1);
                                selclick = true;
                            }
                            if (this.id === 'next' + tp && np) {
                                ts.p.page = (cp + 1);
                                selclick = true;
                            }
                            if (this.id === 'last' + tp && lp) {
                                ts.p.page = last;
                                selclick = true;
                            }
                            if (selclick) {
                                populate();
                            }
                            return false;
                        });
                    }
                    if (ts.p.pginput === true) {
                        $('input.ui-pg-input', "#" + pgcnt).keypress(function (e) {
                            var key = e.charCode || e.keyCode || 0;
                            if (key === 13) {
                                if (!clearVals('user')) {
                                    return false;
                                }
                                $(this).val(intNum($(this).val(), 1));
                                ts.p.page = ($(this).val() > 0) ? $(this).val() : ts.p.page;
                                populate();
                                return false;
                            }
                            return this;
                        });
                    }
                };
            this.p.id = this.id;
            ts.p.keyIndex = false;
            ts.p.keyName = false;
            for (i = 0; i < ts.p.colModel.length; i++) {
                ts.p.colModel[i] = $.extend(true, {}, ts.p.cmTemplate, ts.p.colModel[i].template || {}, ts.p.colModel[i]);
                if (ts.p.keyIndex === false && ts.p.colModel[i].key === true) {
                    ts.p.keyIndex = i;
                }
            }
            ts.p.sortorder = ts.p.sortorder.toLowerCase();
            if (this.p.rownumbers) {
                this.p.colNames.unshift("序号");
                this.p.colModel.unshift({label: "序号", name: 'rn', width: ts.p.rownumWidth, sortable: false, resizable: true, hidedlg: true, search: false, align: 'center', fixed: true});
            }
            ts.p.localReader = $.extend(true, {
                root: "rows",
                page: "page",
                total: "total",
                records: "records",
                repeatitems: false,
                cell: "cell",
                id: "id",
                userdata: "userdata",
                subgrid: {root: "rows", repeatitems: true, cell: "cell"}
            }, ts.p.localReader);
            if (ts.p.scroll) {
                ts.p.pgbuttons = false;
                ts.p.pginput = false;
            }
            if (ts.p.data.length) {
                refreshIndex();
            }
            var thead = "<thead><tr class='ui-jqgrid-labels' role='rowheader'>",
                tdc, idn, w, res, sort,
                td, ptr, tbody, imgs, iac = "", idc = "", sortarr = [], sortord = [], sotmp = [];
            if (ts.p.viewsortcols[1] === 'horizontal') {
                iac = " ui-i-asc";
                idc = " ui-i-desc";
            }
            tdc = isMSIE ? "class='ui-th-div-ie'" : "";
            imgs = "<span class='s-ico' style='display:none'>" +
                "<span sort='asc' class='ui-grid-ico-sort ui-icon-asc" + iac + " ui-state-disabled ui-icon ui-icon-triangle-1-n ui-sort-" + dir + "'>" +
                "</span>" +
                "<span sort='desc' class='ui-grid-ico-sort ui-icon-desc" + idc + " ui-state-disabled ui-icon ui-icon-triangle-1-s ui-sort-" + dir + "'>" +
                "</span>" +
                "</span>";
            for (i = 0; i < this.p.colNames.length; i++) {
                var tooltip = ts.p.headertitles ? (" title=\"" + $.jgrid.stripHtml(ts.p.colNames[i]) + "\"") : "";
                thead += "<th id='" + ts.p.id + "_" + ts.p.colModel[i].name + "' role='columnheader' class='ui-state-default ui-th-column ui-th-" + dir + "'" + tooltip + ">";
                idn = ts.p.colModel[i].index || ts.p.colModel[i].name;
                thead += "<div id='jqgh_" + ts.p.id + "_" + ts.p.colModel[i].name + "' " + tdc + ">" + ts.p.colNames[i];
                if (!ts.p.colModel[i].width) {
                    ts.p.colModel[i].width = 150;
                }
                else {
                    ts.p.colModel[i].width = parseInt(ts.p.colModel[i].width, 10);
                }
                if (typeof ts.p.colModel[i].title !== "boolean") {
                    ts.p.colModel[i].title = true;
                }
                thead += imgs + "</div></th>";
            }
            thead += "</tr></thead>";
            imgs = null;
            $(this).append(thead);
            $("thead tr:first th", this).hover(function () {
                $(this).addClass('ui-state-hover');
            }, function () {
                $(this).removeClass('ui-state-hover');
            });
            setColWidth();
            $(eg).css("width", grid.width + "px").append("<div class='ui-jqgrid-resize-mark' id='rs_m" + ts.p.id + "'>&#160;</div>");
            $(gv).css("width", (grid.width - 2) + "px");
            thead = $("thead:first", ts).get(0);
            var tfoot = "";
            if (ts.p.footerrow) {
                tfoot += "<table role='grid' style='width:" + ts.p.tblwidth + "px' class='ui-jqgrid-ftable' cellspacing='0' cellpadding='0' border='0'><tbody><tr role='row' class='ui-widget-content footrow footrow-" + dir + "'>";
            }
            var thr = $("tr:first", thead),
                firstr = "<tr class='jqgfirstrow' role='row' style='height:auto'>";
            ts.p.disableClick = false;
            $("th", thr).each(function (j) {
                w = ts.p.colModel[j].width;
                if (ts.p.colModel[j].resizable === undefined) {
                    ts.p.colModel[j].resizable = true;
                }
                if (ts.p.colModel[j].resizable) {
                    res = document.createElement("span");
                    $(res).html("&#160;").addClass('ui-jqgrid-resize ui-jqgrid-resize-' + dir)
                        .css("cursor", "col-resize");
                    $(this).addClass(ts.p.resizeclass);
                } else {
                    res = "";
                }
                $(this).css("width", w + "px").prepend(res);
                res = null;
                var hdcol = "";
                if (ts.p.colModel[j].hidden) {
                    $(this).css("display", "none");
                    hdcol = "display:none;";
                }
                firstr += "<td role='gridcell' style='height:0px;width:" + w + "px;" + hdcol + "'></td>";
                if (!ts.p.isHasGroupCols) {
                    w = w - 5;
                }
                grid.headers[j] = { width: w, el: this };
                sort = ts.p.colModel[j].sortable;
                if (typeof sort !== 'boolean') {
                    ts.p.colModel[j].sortable = true;
                    sort = true;
                }
                var nm = ts.p.colModel[j].name;
                if (ts.p.viewsortcols[2]) {
                    $(">div", this).addClass('ui-jqgrid-sortable');
                }
                if (sort) {
                    if (ts.p.viewsortcols[0]) {
                        $("div span.s-ico", this).show();
                        if (j === ts.p.lastsort) {
                            $("div span.ui-icon-" + ts.p.sortorder, this).removeClass("ui-state-disabled");
                        }
                    }
                    else if (j === ts.p.lastsort) {
                        $("div span.s-ico", this).show();
                        $("div span.ui-icon-" + ts.p.sortorder, this).removeClass("ui-state-disabled");
                    }
                }
                if (ts.p.footerrow) {
                    tfoot += "<td role='gridcell' " + formatCol(j, 0, '', null, '', false) + ">&#160;</td>";
                }
            }).mousedown(function (e) {
                    if ($(e.target).closest("th>span.ui-jqgrid-resize").length !== 1) {
                        return;
                    }
                    var ci = getColumnHeaderIndex(this);
                    grid.dragStart(ci, e, getOffset(ci));
                    return false;
                }).click(function (e) {
                    var ci = getColumnHeaderIndex(this);
                    var sort = ts.p.colModel[ci].sortable;
                    if (!ts.p.lastsort) {
                        ts.p.sortorder = "asc";
                    } else if (ts.p.lastsort === ci) {
                        ts.p.sortorder = (ts.p.sortorder == "asc" ? "desc" : "asc");
                    } else {
                        var previousSelectedTh = ts.grid.headers[ts.p.lastsort].el;
                        $("div span.s-ico", previousSelectedTh).hide();
                        $("span.ui-grid-ico-sort", previousSelectedTh).addClass('ui-state-disabled');
                        ts.p.sortorder = "asc";
                    }
                    if (sort) {
                        $("div span.s-ico", this).show();
                        $("span.ui-grid-ico-sort", this).addClass('ui-state-disabled');
                        $("div span.ui-icon-" + ts.p.sortorder, this).removeClass("ui-state-disabled");
                        if ($.isFunction(ts.p.onColumnHeaderClick)) {
                            ts.p.onColumnHeaderClick.call(ts, getColumnHeaderIndex(this));
                        }
                        ts.p.lastsort = ci;
                    } else {
                        ts.p.lastsort = null;
                    }
                });
            if (ts.p.footerrow) {
                tfoot += "</tr></tbody></table>";
            }
            firstr += "</tr>";
            tbody = document.createElement("tbody");
            this.appendChild(tbody);
            $(this).addClass('ui-jqgrid-btable').append(firstr);
            firstr = null;
            var hTable = $("<table class='ui-jqgrid-htable' style='width:" + ts.p.tblwidth + "px' role='grid' aria-labelledby='gbox_" + this.id + "' cellspacing='0' cellpadding='0' border='0'></table>").append(thead),
                hg = (ts.p.caption && ts.p.hiddengrid === true) ? true : false,
                hb = $("<div class='ui-jqgrid-hbox" + (dir === "rtl" ? "-rtl" : "" ) + "'></div>");
            thead = null;
            grid.hDiv = document.createElement("div");
            $(grid.hDiv)
                .css({ width: (grid.width - 2) + "px"})
                .addClass("ui-state-default ui-jqgrid-hdiv")
                .append(hb);
            $(hb).append(hTable);
            hTable = null;
            if (hg) {
                $(grid.hDiv).hide();
            }
            if (ts.p.pager) {
                if (typeof ts.p.pager === "string") {
                    if (ts.p.pager.substr(0, 1) !== "#") {
                        ts.p.pager = "#" + ts.p.pager;
                    }
                }
                else {
                    ts.p.pager = "#" + $(ts.p.pager).attr("id");
                }
                $(ts.p.pager).css({width: grid.width + "px"}).addClass('ui-state-default ui-jqgrid-pager').appendTo(eg);
                if (hg) {
                    $(ts.p.pager).hide();
                }
                setPager(ts.p.pager, '');
            }
            if (ts.p.cellEdit === false && ts.p.hoverrows === true) {
                $(ts).bind('mouseover',function (e) {
                    ptr = $(e.target).closest("tr.jqgrow");
                    if ($(ptr).attr("class") !== "ui-subgrid") {
                        $(ptr).addClass("ui-state-hover");
                    }
                }).bind('mouseout', function (e) {
                        ptr = $(e.target).closest("tr.jqgrow");
                        $(ptr).removeClass("ui-state-hover");
                    });
            }
            var ri, ci, tdHtml;
            $(ts).before(grid.hDiv).click(function (e) {
                td = e.target;
                ptr = $(td, ts.rows).closest("tr.jqgrow");
                if ($(ptr).length === 0 || ptr[0].className.indexOf('ui-state-disabled') > -1 || ($(td, ts).closest("table.ui-jqgrid-btable").attr('id') || '').replace("_frozen", "") !== ts.id) {
                    return this;
                }
                var scb = $(td).hasClass("cbox"),
                    cSel = $(ts).triggerHandler("jqGridBeforeSelectRow", [ptr[0].id, e]);
                cSel = (cSel === false || cSel === 'stop') ? false : true;
                if (cSel && $.isFunction(ts.p.beforeSelectRow)) {
                    cSel = ts.p.beforeSelectRow.call(ts, ptr[0].id, e);
                }
                if (td.tagName === 'BUTTON' || td.tagName === 'A' || ((td.tagName === 'INPUT' || td.tagName === 'TEXTAREA' || td.tagName === 'OPTION' || td.tagName === 'SELECT' ) && !scb)) {
                    ts.p.CellClickEvent(ptr[0].id, $.jgrid.getCellIndex(td));
                    return;
                }
                if (cSel === true) {
                    ri = ptr[0].id;
                    ci = $.jgrid.getCellIndex(td);
                    tdHtml = $(td).closest("td,th").html();
                    $(ts).triggerHandler("jqGridCellSelect", [ri, ci, tdHtml, e]);
                    if ($.isFunction(ts.p.onCellSelect)) {
                        ts.p.onCellSelect.call(ts, ri, ci, tdHtml, e);
                    }
                    if (ts.p.cellEdit === true) {
                        ri = ptr[0].rowIndex;
                        try {
                            $(ts).jqGrid("editCell", ri, ci, true);
                        } catch (_) {
                        }
                    } else {
                        $(ts).jqGrid("setSelection", ri, true, e);
                    }
                }
            }).bind('reloadGrid',function (e, opts) {
                    if (opts && opts.current) {
                        ts.grid.selectionPreserver(ts);
                    }
                    if (ts.p.datatype === "local") {
                        if (ts.p.data.length) {
                            refreshIndex();
                        }
                    } else if (!ts.p.treeGrid) {
                        ts.p.selrow = null;
                        ts.p.savedRow = [];
                    }
                    if (ts.p.scroll) {
                        emptyRows.call(ts, true, false);
                    }
                    if (opts && opts.page) {
                        var page = opts.page;
                        if (page > ts.p.lastpage) {
                            page = ts.p.lastpage;
                        }
                        if (page < 1) {
                            page = 1;
                        }
                        ts.p.page = page;
                        if (ts.grid.prevRowHeight) {
                            ts.grid.bDiv.scrollTop = (page - 1) * ts.grid.prevRowHeight * ts.p.rowNum;
                        } else {
                            ts.grid.bDiv.scrollTop = 0;
                        }
                    }
                    if (ts.grid.prevRowHeight && ts.p.scroll) {
                        delete ts.p.lastpage;
                        ts.grid.populateVisible();
                    } else {
                        ts.grid.populate();
                    }
                    return false;
                }).dblclick(function (e) {
                    td = e.target;
                    ptr = $(td, ts.rows).closest("tr.jqgrow");
                    if ($(ptr).length === 0) {
                        return;
                    }
                    ri = ptr[0].rowIndex;
                    ci = $.jgrid.getCellIndex(td);
                    $(ts).triggerHandler("jqGridDblClickRow", [$(ptr).attr("id"), ri, ci, e]);
                    if ($.isFunction(ts.p.ondblClickRow)) {
                        ts.p.ondblClickRow.call(ts, $(ptr).attr("id"), ri, ci, e);
                    }
                });
            grid.bDiv = document.createElement("div");
            if (isMSIE) {
                if (String(ts.p.height).toLowerCase() === "auto") {
                    ts.p.height = "100%";
                }
            }
            $(grid.bDiv)
                .append($('<div style="position:relative;' + (isMSIE && $.jgrid.msiever() < 8 ? "height:0.01%;" : "") + '"></div>').append('<div></div>').append(this))
                .addClass("ui-jqgrid-bdiv")
                .css({ height: ts.p.height + (isNaN(ts.p.height) ? "" : "px"), width: (grid.width - 2) + "px"})
                .scroll(grid.scrollGrid);
            $("table:first", grid.bDiv).css({width: ts.p.tblwidth + "px"});
            if (!$.support.tbody) { //IE
                if ($("tbody", this).length === 2) {
                    $("tbody:gt(0)", this).remove();
                }
            }
            if (hg) {
                $(grid.bDiv).hide();
            }
            grid.cDiv = document.createElement("div");
            var arf = ts.p.hidegrid === true ? $("<a role='link' class='ui-jqgrid-titlebar-close ui-corner-all HeaderButton' />").hover(
                function () {
                    arf.addClass('ui-state-hover');
                },
                function () {
                    arf.removeClass('ui-state-hover');
                })
                .append("<span class='ui-icon ui-icon-circle-triangle-n'></span>").css((dir === "rtl" ? "left" : "right"), "0px") : "";
            $(grid.cDiv).append(arf).append("<span class='ui-jqgrid-title'>" + ts.p.caption + "</span>")
                .addClass("ui-jqgrid-titlebar ui-jqgrid-caption" + (dir === "rtl" ? "-rtl" : "" ) + " ui-widget-header ui-corner-top ui-helper-clearfix");
            $(grid.cDiv).insertBefore(grid.hDiv);
            if (ts.p.toolbar[0]) {
                grid.uDiv = document.createElement("div");
                if (ts.p.toolbar[1] === "top") {
                    $(grid.uDiv).insertBefore(grid.hDiv);
                }
                else if (ts.p.toolbar[1] === "bottom") {
                    $(grid.uDiv).insertAfter(grid.hDiv);
                }
                if (ts.p.toolbar[1] === "both") {
                    grid.ubDiv = document.createElement("div");
                    $(grid.uDiv).addClass("ui-userdata ui-state-default").attr("id", "t_" + this.id).insertBefore(grid.hDiv);
                    $(grid.ubDiv).addClass("ui-userdata ui-state-default").attr("id", "tb_" + this.id).insertAfter(grid.hDiv);
                    if (hg) {
                        $(grid.ubDiv).hide();
                    }
                } else {
                    $(grid.uDiv).width(grid.width).addClass("ui-userdata ui-state-default").attr("id", "t_" + this.id);
                }
                if (hg) {
                    $(grid.uDiv).hide();
                }
            }
            if (ts.p.toppager) {
                ts.p.toppager = $.jgrid.jqID(ts.p.id) + "_toppager";
                grid.topDiv = $("<div id='" + ts.p.toppager + "'></div>")[0];
                ts.p.toppager = "#" + ts.p.toppager;
                $(grid.topDiv).addClass('ui-state-default ui-jqgrid-toppager').width(grid.width).insertBefore(grid.hDiv);
                setPager(ts.p.toppager, '_t');
            }
            if (ts.p.footerrow) {
                grid.sDiv = $("<div class='ui-jqgrid-sdiv'></div>")[0];
                hb = $("<div class='ui-jqgrid-hbox" + (dir === "rtl" ? "-rtl" : "") + "'></div>");
                $(grid.sDiv).append(hb).width(grid.width).insertAfter(grid.hDiv);
                $(hb).append(tfoot);
                grid.footers = $(".ui-jqgrid-ftable", grid.sDiv)[0].rows[0].cells;
                if (ts.p.rownumbers) {
                    grid.footers[0].className = 'ui-state-default jqgrid-rownum';
                }
                if (hg) {
                    $(grid.sDiv).hide();
                }
            }
            hb = null;
            if (ts.p.caption) {
                var tdt = ts.p.datatype;
                if (ts.p.hidegrid === true) {
                    $(".ui-jqgrid-titlebar-close", grid.cDiv).click(function (e) {
                        var onHdCl = $.isFunction(ts.p.onHeaderClick),
                            elems = ".ui-jqgrid-bdiv, .ui-jqgrid-hdiv, .ui-jqgrid-pager, .ui-jqgrid-sdiv",
                            counter, self = this;
                        if (ts.p.toolbar[0] === true) {
                            if (ts.p.toolbar[1] === 'both') {
                                elems += ', #' + $(grid.ubDiv).attr('id');
                            }
                            elems += ', #' + $(grid.uDiv).attr('id');
                        }
                        counter = $(elems, "#gview_" + $.jgrid.jqID(ts.p.id)).length;

                        if (ts.p.gridstate === 'visible') {
                            $(elems, "#gbox_" + $.jgrid.jqID(ts.p.id)).slideUp("fast", function () {
                                counter--;
                                if (counter === 0) {
                                    $("span", self).removeClass("ui-icon-circle-triangle-n").addClass("ui-icon-circle-triangle-s");
                                    ts.p.gridstate = 'hidden';
                                    if ($("#gbox_" + $.jgrid.jqID(ts.p.id)).hasClass("ui-resizable")) {
                                        $(".ui-resizable-handle", "#gbox_" + $.jgrid.jqID(ts.p.id)).hide();
                                    }
                                    $(ts).triggerHandler("jqGridHeaderClick", [ts.p.gridstate, e]);
                                    if (onHdCl) {
                                        if (!hg) {
                                            ts.p.onHeaderClick.call(ts, ts.p.gridstate, e);
                                        }
                                    }
                                }
                            });
                        } else if (ts.p.gridstate === 'hidden') {
                            $(elems, "#gbox_" + $.jgrid.jqID(ts.p.id)).slideDown("fast", function () {
                                counter--;
                                if (counter === 0) {
                                    $("span", self).removeClass("ui-icon-circle-triangle-s").addClass("ui-icon-circle-triangle-n");
                                    if (hg) {
                                        ts.p.datatype = tdt;
                                        populate();
                                        hg = false;
                                    }
                                    ts.p.gridstate = 'visible';
                                    if ($("#gbox_" + $.jgrid.jqID(ts.p.id)).hasClass("ui-resizable")) {
                                        $(".ui-resizable-handle", "#gbox_" + $.jgrid.jqID(ts.p.id)).show();
                                    }
                                    $(ts).triggerHandler("jqGridHeaderClick", [ts.p.gridstate, e]);
                                    if (onHdCl) {
                                        if (!hg) {
                                            ts.p.onHeaderClick.call(ts, ts.p.gridstate, e);
                                        }
                                    }
                                }
                            });
                        }
                        return false;
                    });
                    if (hg) {
                        ts.p.datatype = "local";
                        $(".ui-jqgrid-titlebar-close", grid.cDiv).trigger("click");
                    }
                }
            } else {
                $(grid.cDiv).hide();
            }
            $(grid.hDiv).after(grid.bDiv)
                .mousemove(function (e) {
                    if (grid.resizing) {
                        grid.dragMove(e);
                        return false;
                    }
                });
            $(".ui-jqgrid-labels", grid.hDiv).bind("selectstart", function () {
                return false;
            });
            $(document).bind("mouseup.jqGrid" + ts.p.id, function () {
                if (grid.resizing) {
                    grid.dragEnd();
                    return false;
                }
                return true;
            });
            ts.formatCol = formatCol;
            ts.refreshIndex = refreshIndex;
            ts.constructTr = constructTr;
            ts.updatepager = updatepager;
            ts.formatter = function (rowId, cellval, colpos, rwdat, act) {
                return formatter(rowId, cellval, colpos, rwdat, act);
            };
            $.extend(grid, {populate: populate, emptyRows: emptyRows});
            this.grid = grid;
            this.grid.cols = this.rows[0].cells;
            $(ts).triggerHandler("jqGridInitGrid");
            if ($.isFunction(ts.p.onInitGrid)) {
                ts.p.onInitGrid.call(ts);
            }
            populate();
            ts.p.hiddengrid = false;
        });
    };
})(jQuery);

//提供给外部使用的事件
(function ($) {
    "use strict";
    $.jgrid.extend({
        getGridParam: function (pName) {
            var $t = this[0];
            if (!$t || !$t.grid) {
                return;
            }
            if (!pName) {
                return $t.p;
            }
            return $t.p[pName] !== undefined ? $t.p[pName] : null;
        },
        setGridParam: function (newParams) {
            return this.each(function () {
                if (this.grid && typeof newParams === 'object') {
                    $.extend(true, this.p, newParams);
                }
            });
        },
        setSelection: function (selection, onsr, e) {
            return this.each(function () {
                var $t = this, stat, pt, ner, ia, tpsr, fid;
                if (selection === undefined) {
                    return;
                }
                onsr = onsr === false ? false : true;
                pt = $($t).jqGrid('getGridRowById', selection);
                if (!pt || !pt.className || pt.className.indexOf('ui-state-disabled') > -1) {
                    return;
                }
                $t.p.selrow = pt.id;
                ia = $.inArray($t.p.selrow, $t.p.selarrrow);
                if (ia === -1) {
                    if (pt.className !== "ui-subgrid") {
                        $(pt).addClass("ui-state-highlight").attr("aria-selected", "true");
                    }
                    stat = true;
                    $t.p.selarrrow.push($t.p.selrow);
                } else {
                    if (pt.className !== "ui-subgrid") {
                        $(pt).removeClass("ui-state-highlight").attr("aria-selected", "false");
                    }
                    stat = false;
                    $t.p.selarrrow.splice(ia, 1);
                    tpsr = $t.p.selarrrow[0];
                    $t.p.selrow = (tpsr === undefined) ? null : tpsr;
                }
                $("#jqg_" + $.jgrid.jqID($t.p.id) + "_" + $.jgrid.jqID(pt.id))[$t.p.useProp ? 'prop' : 'attr']("checked", stat);
                if (fid) {
                    if (ia === -1) {
                        $("#" + $.jgrid.jqID(selection), "#" + $.jgrid.jqID(fid)).addClass("ui-state-highlight");
                    } else {
                        $("#" + $.jgrid.jqID(selection), "#" + $.jgrid.jqID(fid)).removeClass("ui-state-highlight");
                    }
                    $("#jqg_" + $.jgrid.jqID($t.p.id) + "_" + $.jgrid.jqID(selection), "#" + $.jgrid.jqID(fid))[$t.p.useProp ? 'prop' : 'attr']("checked", stat);
                }
                if (onsr) {
                    $($t).triggerHandler("jqGridSelectRow", [pt.id, stat, e]);
                    if ($t.p.onSelectRow) {
                        $t.p.onSelectRow.call($t, pt.id, stat, e);
                    }
                }
            });
        },
        getGridRowById: function (rowid) {
            var row;
            this.each(function () {
                try {
                    //row = this.rows.namedItem( rowid );
                    var i = this.rows.length;
                    while (i--) {
                        if (rowid.toString() === this.rows[i].id) {
                            row = this.rows[i];
                            break;
                        }
                    }
                } catch (e) {
                    row = $(this.grid.bDiv).find("#" + $.jgrid.jqID(rowid));
                }
            });
            return row;
        },
        clearGridData: function (clearfooter) {
            return this.each(function () {
                var $t = this;
                if (!$t.grid) {
                    return;
                }
                if (typeof clearfooter !== 'boolean') {
                    clearfooter = false;
                }
                if ($t.p.deepempty) {
                    $("#" + $.jgrid.jqID($t.p.id) + " tbody:first tr:gt(0)").remove();
                }
                else {
                    var trf = $("#" + $.jgrid.jqID($t.p.id) + " tbody:first tr:first")[0];
                    $("#" + $.jgrid.jqID($t.p.id) + " tbody:first").empty().append(trf);
                }
                if ($t.p.footerrow && clearfooter) {
                    $(".ui-jqgrid-ftable td", $t.grid.sDiv).html("&#160;");
                }
                $t.p.selrow = null;
                $t.p.selarrrow = [];
                $t.p.savedRow = [];
                $t.p.records = 0;
                $t.p.page = 1;
                $t.p.lastpage = 0;
                $t.p.reccount = 0;
                $t.p.data = [];
                $t.p._index = {};
                $t.updatepager(true, false);
            });
        },
        setGridWidth: function (nwidth, shrink) {
            return this.each(function () {
                if (!this.grid) {
                    return;
                }
                var $t = this, cw,
                    initwidth = 0, brd = $.jgrid.cell_width ? 0 : $t.p.cellLayout, lvc, vc = 0, hs = false, scw = $t.p.scrollOffset, aw, gw = 0, cr;
                if (typeof shrink !== 'boolean') {
                    shrink = $t.p.shrinkToFit;
                }
                if (isNaN(nwidth)) {
                    return;
                }
                nwidth = parseInt(nwidth, 10);
                $t.grid.width = $t.p.width = nwidth;
                $("#gbox_" + $.jgrid.jqID($t.p.id)).css("width", nwidth + "px");
                $("#gview_" + $.jgrid.jqID($t.p.id)).css("width", nwidth + "px");
                $($t.grid.bDiv).css("width", nwidth + "px");
                $($t.grid.hDiv).css("width", nwidth + "px");
                if ($t.p.pager) {
                    $($t.p.pager).css("width", nwidth + "px");
                }
                if ($t.p.toppager) {
                    $($t.p.toppager).css("width", nwidth + "px");
                }
                if ($t.p.toolbar[0] === true) {
                    $($t.grid.uDiv).css("width", nwidth + "px");
                    if ($t.p.toolbar[1] === "both") {
                        $($t.grid.ubDiv).css("width", nwidth + "px");
                    }
                }
                if ($t.p.footerrow) {
                    $($t.grid.sDiv).css("width", nwidth + "px");
                }
                if (shrink === false && $t.p.forceFit === true) {
                    $t.p.forceFit = false;
                }
                if (shrink === true) {
                    $.each($t.p.colModel, function () {
                        if (this.hidden === false) {
                            cw = this.widthOrg;
                            initwidth += cw + brd;
                            if (this.fixed) {
                                gw += cw + brd;
                            } else {
                                vc++;
                            }
                        }
                    });
                    if (vc === 0) {
                        return;
                    }
                    $t.p.tblwidth = initwidth;
                    aw = nwidth - brd * vc - gw;
                    if (!isNaN($t.p.height)) {
                        if ($($t.grid.bDiv)[0].clientHeight < $($t.grid.bDiv)[0].scrollHeight || $t.rows.length === 1) {
                            hs = true;
                            aw -= scw;
                        }
                    }
                    initwidth = 0;
                    var cle = $t.grid.cols.length > 0;
                    $.each($t.p.colModel, function (i) {
                        if (this.hidden === false && !this.fixed) {
                            cw = this.widthOrg;
                            cw = Math.round(aw * cw / ($t.p.tblwidth - brd * vc - gw));
                            if (cw < 0) {
                                return;
                            }
                            this.width = cw;
                            initwidth += cw;
                            $t.grid.headers[i].width = cw;
                            $t.grid.headers[i].el.style.width = cw + "px";
                            if ($t.p.footerrow) {
                                $t.grid.footers[i].style.width = cw + "px";
                            }
                            if (cle) {
                                $t.grid.cols[i].style.width = cw + "px";
                            }
                            lvc = i;
                        }
                    });

                    if (!lvc) {
                        return;
                    }

                    cr = 0;
                    if (hs) {
                        if (nwidth - gw - (initwidth + brd * vc) !== scw) {
                            cr = nwidth - gw - (initwidth + brd * vc) - scw;
                        }
                    } else if (Math.abs(nwidth - gw - (initwidth + brd * vc)) !== 1) {
                        cr = nwidth - gw - (initwidth + brd * vc);
                    }
                    $t.p.colModel[lvc].width += cr;
                    $t.p.tblwidth = initwidth + cr + brd * vc + gw;
                    if ($t.p.tblwidth > nwidth) {
                        var delta = $t.p.tblwidth - parseInt(nwidth, 10);
                        $t.p.tblwidth = nwidth;
                        cw = $t.p.colModel[lvc].width = $t.p.colModel[lvc].width - delta;
                    } else {
                        cw = $t.p.colModel[lvc].width;
                    }
                    $t.grid.headers[lvc].width = cw;
                    $t.grid.headers[lvc].el.style.width = cw + "px";
                    if (cle) {
                        $t.grid.cols[lvc].style.width = cw + "px";
                    }
                    if ($t.p.footerrow) {
                        $t.grid.footers[lvc].style.width = cw + "px";
                    }
                }
                if ($t.p.tblwidth) {
                    $('table:first', $t.grid.bDiv).css("width", $t.p.tblwidth + "px");
                    $('table:first', $t.grid.hDiv).css("width", $t.p.tblwidth + "px");
                    $t.grid.hDiv.scrollLeft = $t.grid.bDiv.scrollLeft;
                    if ($t.p.footerrow) {
                        $('table:first', $t.grid.sDiv).css("width", $t.p.tblwidth + "px");
                    }
                }
            });
        },
        setGridHeight: function (nh) {
            return this.each(function () {
                var $t = this;
                if (!$t.grid) {
                    return;
                }
                var bDiv = $($t.grid.bDiv);
                bDiv.css({height: nh + (isNaN(nh) ? "" : "px")});
                if ($t.p.frozenColumns === true) {
                    //follow the original set height to use 16, better scrollbar width detection
                    $('#' + $.jgrid.jqID($t.p.id) + "_frozen").parent().height(bDiv.height() - 16);
                }
                $t.p.height = nh;
                if ($t.p.scroll) {
                    $t.grid.populateVisible();
                }
            });
        },
        setCell: function (rowid, colname, nData, cssp, attrp, forceupd) {
            return this.each(function () {
                var $t = this, pos = -1, v, title;
                if (!$t.grid) {
                    return;
                }
                if (isNaN(colname)) {
                    $($t.p.colModel).each(function (i) {
                        if (this.name === colname) {
                            pos = i;
                            return false;
                        }
                    });
                } else {
                    pos = parseInt(colname, 10);
                }
                if (pos >= 0) {
                    var ind = $($t).jqGrid('getGridRowById', rowid);
                    if (ind) {
                        var tcell = $("td:eq(" + pos + ")", ind);
                        if (nData !== "" || forceupd === true) {
                            v = $t.formatter(rowid, nData, pos, ind, 'edit');
                            title = $t.p.colModel[pos].title ? {"title": $.jgrid.stripHtml(v)} : {};
                            if ($t.p.treeGrid && $(".tree-wrap", $(tcell)).length > 0) {
                                $("span", $(tcell)).html(v).attr(title);
                            } else {
                                $(tcell).html(v).attr(title);
                            }
                            if ($t.p.datatype === "local") {
                                var cm = $t.p.colModel[pos], index;
                                nData = cm.formatter && typeof cm.formatter === 'string' && cm.formatter === 'date' ? $.unformat.date.call($t, nData, cm) : nData;
                                index = $t.p._index[$.jgrid.stripPref($t.p.idPrefix, rowid)];
                                if (index !== undefined) {
                                    $t.p.data[index][cm.name] = nData;
                                }
                            }
                        }
                        if (typeof cssp === 'string') {
                            $(tcell).addClass(cssp);
                        } else if (cssp) {
                            $(tcell).css(cssp);
                        }
                        if (typeof attrp === 'object') {
                            $(tcell).attr(attrp);
                        }
                    }
                }
            });
        },
        GridDestroy: function () {
            return this.each(function () {
                if (this.grid) {
                    if (this.p.pager) { // if not part of grid
                        $(this.p.pager).remove();
                    }
                    try {
                        $(this).jqGrid('clearBeforeUnload');
                        $("#gbox_" + $.jgrid.jqID(this.id)).remove();
                    } catch (_) {
                    }
                }
            });
        },
        destroyGroupHeader: function (nullHeader) {
            if (nullHeader === undefined) {
                nullHeader = true;
            }
            return this.each(function () {
                var $t = this, $tr, i, l, headers, $th, $resizing, grid = $t.grid,
                    thead = $("table.ui-jqgrid-htable thead", grid.hDiv), cm = $t.p.colModel, hc;
                if (!grid) {
                    return;
                }

                $(this).unbind('.setGroupHeaders');
                $tr = $("<tr>", {role: "rowheader"}).addClass("ui-jqgrid-labels");
                headers = grid.headers;
                for (i = 0, l = headers.length; i < l; i++) {
                    hc = cm[i].hidden ? "none" : "";
                    $th = $(headers[i].el)
                        .width(headers[i].width)
                        .css('display', hc);
                    try {
                        $th.removeAttr("rowSpan");
                    } catch (rs) {
                        //IE 6/7
                        $th.attr("rowSpan", 1);
                    }
                    $tr.append($th);
                    $resizing = $th.children("span.ui-jqgrid-resize");
                    if ($resizing.length > 0) {// resizable column
                        $resizing[0].style.height = "";
                    }
                    $th.children("div")[0].style.top = "";
                }
                $(thead).children('tr.ui-jqgrid-labels').remove();
                $(thead).prepend($tr);

                if (nullHeader === true) {
                    $($t).jqGrid('setGridParam', { 'groupHeader': null});
                }
            });
        },
        setGroupHeaders: function (o) {
            o = $.extend({
                useColSpanStyle: false,
                groupHeaders: []
            }, o || {});
            return this.each(function () {
                this.p.groupHeader = o;
                var ts = this,
                    i, cmi, skip = 0, $tr, $colHeader, th, $th, thStyle,
                    iCol,
                    cghi,
                    numberOfColumns,
                    titleText,
                    cVisibleColumns,
                    colModel = ts.p.colModel,
                    cml = colModel.length,
                    ths = ts.grid.headers,
                    $htable = $("table.ui-jqgrid-htable", ts.grid.hDiv),
                    $trLabels = $htable.children("thead").children("tr.ui-jqgrid-labels:last").addClass("jqg-second-row-header"),
                    $thead = $htable.children("thead"),
                    $theadInTable,
                    $firstHeaderRow = $htable.find(".jqg-first-row-header");
                if ($firstHeaderRow[0] === undefined) {
                    $firstHeaderRow = $('<tr>', {role: "row", "aria-hidden": "true"}).addClass("jqg-first-row-header").css("height", "auto");
                } else {
                    $firstHeaderRow.empty();
                }
                var $firstRow,
                    inColumnHeader = function (text, columnHeaders) {
                        var length = columnHeaders.length, i;
                        for (i = 0; i < length; i++) {
                            if (columnHeaders[i].startColumnName === text) {
                                return i;
                            }
                        }
                        return -1;
                    };
                $(ts).prepend($thead);
                $tr = $('<tr>', {role: "rowheader"}).addClass("ui-jqgrid-labels jqg-third-row-header");
                var tableFirstRow = $(ts).find("tr.jqgfirstrow");
                for (i = 0; i < cml; i++) {
                    th = ths[i].el;
                    $th = $(th);
                    cmi = colModel[i];
                    thStyle = { height: '0px', width: ths[i].width + 'px', display: (cmi.hidden ? 'none' : '')};
                    $("<th>", {role: 'gridcell'}).css(thStyle).addClass("ui-first-th-" + ts.p.direction).appendTo($firstHeaderRow);
                    tableFirstRow.find("td").eq(i).css({display: cmi.hidden ? 'none' : ''});
                    th.style.width = ""; // remove unneeded style
                    iCol = inColumnHeader(cmi.name, o.groupHeaders);
                    if (iCol >= 0) {
                        cghi = o.groupHeaders[iCol];
                        numberOfColumns = cghi.numberOfColumns;
                        titleText = cghi.titleText;
                        for (cVisibleColumns = 0, iCol = 0; iCol < numberOfColumns && (i + iCol < cml); iCol++) {
                            if (!colModel[i + iCol].hidden) {
                                cVisibleColumns++;
                            }
                        }
                        $colHeader = $('<th>').attr({role: "columnheader"})
                            .addClass("ui-state-default ui-th-column-header ui-th-" + ts.p.direction)
                            .css({'height': '30px', 'border-top': '0 none'})
                            .html(titleText);
                        if (cVisibleColumns > 0) {
                            $colHeader.attr("colspan", String(cVisibleColumns));
                        }
                        if (ts.p.headertitles) {
                            $colHeader.attr("title", $colHeader.text());
                        }
                        if (cVisibleColumns === 0) {
                            $colHeader.hide();
                        }
                        $th.before($colHeader);
                        $tr.append(th);
                        skip = numberOfColumns - 1;
                    } else {
                        if (skip === 0) {
                            if (o.useColSpanStyle) {
                                $th.attr("rowspan", "2");
                            } else {
                                $('<th>', {role: "columnheader"})
                                    .addClass("ui-state-default ui-th-column-header ui-th-" + ts.p.direction)
                                    .css({"display": cmi.hidden ? 'none' : '', 'border-top': '0 none'})
                                    .insertBefore($th);
                                $tr.append(th);
                            }
                        } else {
                            $tr.append(th);
                            skip--;
                        }
                    }
                }
                $theadInTable = $(ts).children("thead");
                $theadInTable.prepend($firstHeaderRow);
                $tr.insertAfter($trLabels);
                $htable.append($theadInTable);
                if (o.useColSpanStyle) {
                    // Increase the height of resizing span of visible headers
                    $htable.find("span.ui-jqgrid-resize").each(function () {
                        var $parent = $(this).parent();
                        if ($parent.is(":visible")) {
                            this.style.cssText = 'height: ' + $parent.height() + 'px !important; cursor: col-resize;';
                        }
                    });
                    $htable.find("div.ui-jqgrid-sortable").each(function () {
                        var $ts = $(this), $parent = $ts.parent();
                        if ($parent.is(":visible") && $parent.is(":has(span.ui-jqgrid-resize)")) {
                            $ts.css('top', ($parent.height() - $ts.outerHeight()) / 2 + 'px');
                        }
                    });
                }
                $firstRow = $theadInTable.find("tr.jqg-first-row-header");
                $(ts).bind('jqGridResizeStop.setGroupHeaders', function (e, nw, idx) {
                    $firstRow.find('th').eq(idx).width(nw - 5);
                });
            });
        },
        navGrid: function (elem, o, pAdd, pDel) {
            o = $.extend({
                add: true,
                addicon: "ui-icon-plus",
                del: true,
                delicon: "ui-icon-trash",
                position: "left",
                closeOnEscape: true,
                beforeRefresh: null,
                afterRefresh: null,
                cloneToTop: false,
                alertwidth: 200,
                alertheight: 'auto',
                alerttop: null,
                alertleft: null,
                alertzIndex: null
            }, $.jgrid.nav, o || {});
            return this.each(function () {
                if (this.nav) {
                    return;
                }
                var alertIDs = {themodal: 'alertmod_' + this.p.id, modalhead: 'alerthd_' + this.p.id, modalcontent: 'alertcnt_' + this.p.id},
                    $t = this, twd, tdw;
                if (!$t.grid || typeof elem !== 'string') {
                    return;
                }
                if ($("#" + alertIDs.themodal)[0] === undefined) {
                    if (!o.alerttop && !o.alertleft) {
                        if (window.innerWidth !== undefined) {
                            o.alertleft = window.innerWidth;
                            o.alerttop = window.innerHeight;
                        } else if (document.documentElement !== undefined && document.documentElement.clientWidth !== undefined && document.documentElement.clientWidth !== 0) {
                            o.alertleft = document.documentElement.clientWidth;
                            o.alerttop = document.documentElement.clientHeight;
                        } else {
                            o.alertleft = 1024;
                            o.alerttop = 768;
                        }
                        o.alertleft = o.alertleft / 2 - parseInt(o.alertwidth, 10) / 2;
                        o.alerttop = o.alerttop / 2 - 25;
                    }
                }
                var clone = 1, i,
                    onHoverIn = function () {
                        if (!$(this).hasClass('ui-state-disabled')) {
                            $(this).addClass("ui-state-hover");
                        }
                    },
                    onHoverOut = function () {
                        $(this).removeClass("ui-state-hover");
                    };
                if (o.cloneToTop && $t.p.toppager) {
                    clone = 2;
                }
                for (i = 0; i < clone; i++) {
                    var tbd,
                        navtbl = $("<table cellspacing='0' cellpadding='0' border='0' class='ui-pg-table navtable' style='float:left;table-layout:auto;'><tbody><tr></tr></tbody></table>"),
                        sep = "<td class='ui-pg-button ui-state-disabled' style='width:4px;'><span class='ui-separator'></span></td>",
                        pgid, elemids;
                    if (i === 0) {
                        pgid = elem;
                        elemids = $t.p.id;
                        if (pgid === $t.p.toppager) {
                            elemids += "_top";
                            clone = 1;
                        }
                    } else {
                        pgid = $t.p.toppager;
                        elemids = $t.p.id + "_top";
                    }
                    if ($t.p.direction === "rtl") {
                        $(navtbl).attr("dir", "rtl").css("float", "right");
                    }
                    if (o.add) {
                        pAdd = pAdd || {};
                        tbd = $("<td class='ui-pg-button ui-corner-all'></td>");
                        $(tbd).append("<div class='ui-pg-div'><span class='ui-icon " + o.addicon + "'></span>" + o.addtext + "</div>");
                        $("tr", navtbl).append(tbd);
                        $(tbd, navtbl)
                            .attr({"title": o.addtitle || "", id: pAdd.id || "add_" + elemids})
                            .click(function () {
                                if (!$(this).hasClass('ui-state-disabled')) {
                                    if ($.isFunction(o.addfunc)) {
                                        o.addfunc.call($t);
                                    } else {
                                        $($t).jqGrid("editGridRow", "new", pAdd);
                                    }
                                }
                                return false;
                            }).hover(onHoverIn, onHoverOut);
                        tbd = null;
                    }
                    if (o.del) {
                        tbd = $("<td class='ui-pg-button ui-corner-all'></td>");
                        pDel = pDel || {};
                        $(tbd).append("<div class='ui-pg-div'><span class='ui-icon " + o.delicon + "'></span>" + o.deltext + "</div>");
                        $("tr", navtbl).append(tbd);
                        $(tbd, navtbl)
                            .attr({"title": o.deltitle || "", id: pDel.id || "del_" + elemids})
                            .click(function () {
                                if (!$(this).hasClass('ui-state-disabled')) {
                                    var dr;
                                    if ($t.p.multiselect) {
                                        dr = $t.p.selarrrow;
                                        if (dr.length === 0) {
                                            dr = null;
                                        }
                                    } else {
                                        dr = $t.p.selrow;
                                    }
                                    if (dr) {
                                        if ($.isFunction(o.delfunc)) {
                                            o.delfunc.call($t, dr);
                                        } else {
                                            $($t).jqGrid("delGridRow", dr, pDel);
                                        }
                                    } else {
//                                        $.jgrid.viewModal("#" + alertIDs.themodal, {gbox: "#gbox_" + $.jgrid.jqID($t.p.id), jqm: true});
//                                        $("#jqg_alrt").focus();
                                    }
                                }
                                return false;
                            }).hover(onHoverIn, onHoverOut);
                        tbd = null;
                    }
                    if (o.add || o.del) {
                        $("tr", navtbl).append(sep);
                    }
                    tdw = $(".ui-jqgrid").css("font-size") || "11px";
                    $('body').append("<div id='testpg2' class='ui-jqgrid ui-widget ui-widget-content' style='font-size:" + tdw + ";visibility:hidden;' ></div>");
                    twd = $(navtbl).clone().appendTo("#testpg2").width();
                    $("#testpg2").remove();
                    $(pgid + "_" + o.position, pgid).append(navtbl);
                    if ($t.p._nvtd) {
                        if (twd > $t.p._nvtd[0]) {
                            $(pgid + "_" + o.position, pgid).width(twd);
                            $t.p._nvtd[0] = twd;
                        }
                        $t.p._nvtd[1] = twd;
                    }
                    tdw = null;
                    twd = null;
                    navtbl = null;
                    this.nav = true;
                }
            });
        },
        GridNav: function (construct) {
            return this.each(function () {
                var $t = this;
                if (!$t.grid || ($t.p.cellEdit !== true && !construct)) {
                    return;
                }
                $t.p.knv = $t.p.id + "_kn";
                var selection = $("<div style='position:fixed;top:0px;width:1px;height:1px;' tabindex='0'><div tabindex='-1' style='width:1px;height:1px;' id='" + $t.p.knv + "'></div></div>"),
                    i, kdir;

                function scrollGrid(iR, iC, tp) {
                    if (tp.substr(0, 1) === 'v') {
                        var ch = $($t.grid.bDiv)[0].clientHeight,
                            st = $($t.grid.bDiv)[0].scrollTop,
                            nROT = $t.rows[iR].offsetTop + $t.rows[iR].clientHeight,
                            pROT = $t.rows[iR].offsetTop;
                        if (tp === 'vd') {
                            if (nROT >= ch) {
                                $($t.grid.bDiv)[0].scrollTop = $($t.grid.bDiv)[0].scrollTop + $t.rows[iR].clientHeight;
                            }
                        }
                        if (tp === 'vu') {
                            if (pROT < st) {
                                $($t.grid.bDiv)[0].scrollTop = $($t.grid.bDiv)[0].scrollTop - $t.rows[iR].clientHeight;
                            }
                        }
                    }
                    if (tp === 'h') {
                        var cw = $($t.grid.bDiv)[0].clientWidth,
                            sl = $($t.grid.bDiv)[0].scrollLeft,
                            nCOL = $t.rows[iR].cells[iC].offsetLeft + $t.rows[iR].cells[iC].clientWidth,
                            pCOL = $t.rows[iR].cells[iC].offsetLeft;
                        if (nCOL >= cw + parseInt(sl, 10)) {
                            $($t.grid.bDiv)[0].scrollLeft = $($t.grid.bDiv)[0].scrollLeft + $t.rows[iR].cells[iC].clientWidth;
                        } else if (pCOL < sl) {
                            $($t.grid.bDiv)[0].scrollLeft = $($t.grid.bDiv)[0].scrollLeft - $t.rows[iR].cells[iC].clientWidth;
                        }
                    }
                }

                function findNextVisible(iC, act) {
                    var ind, i;
                    if (act === 'lft') {
                        ind = iC + 1;
                        for (i = iC; i >= 0; i--) {
                            if ($t.p.colModel[i].hidden !== true) {
                                ind = i;
                                break;
                            }
                        }
                    }
                    if (act === 'rgt') {
                        ind = iC - 1;
                        for (i = iC; i < $t.p.colModel.length; i++) {
                            if ($t.p.colModel[i].hidden !== true) {
                                ind = i;
                                break;
                            }
                        }
                    }
                    return ind;
                }

                $(selection).insertBefore($t.grid.cDiv);
                $("#" + $t.p.knv)
                    .focus()
                    .keydown(function (e) {
                        kdir = e.keyCode;
                        if ($t.p.direction === "rtl") {
                            if (kdir === 37) {
                                kdir = 39;
                            }
                            else if (kdir === 39) {
                                kdir = 37;
                            }
                        }
                        switch (kdir) {
                            case 38:
                                if ($t.p.iRow - 1 > 0) {
                                    scrollGrid($t.p.iRow - 1, $t.p.iCol, 'vu');
                                    $($t).jqGrid("editCell", $t.p.iRow - 1, $t.p.iCol, false);
                                }
                                break;
                            case 40 :
                                if ($t.p.iRow + 1 <= $t.rows.length - 1) {
                                    scrollGrid($t.p.iRow + 1, $t.p.iCol, 'vd');
                                    $($t).jqGrid("editCell", $t.p.iRow + 1, $t.p.iCol, false);
                                }
                                break;
                            case 37 :
                                if ($t.p.iCol - 1 >= 0) {
                                    i = findNextVisible($t.p.iCol - 1, 'lft');
                                    scrollGrid($t.p.iRow, i, 'h');
                                    $($t).jqGrid("editCell", $t.p.iRow, i, false);
                                }
                                break;
                            case 39 :
                                if ($t.p.iCol + 1 <= $t.p.colModel.length - 1) {
                                    i = findNextVisible($t.p.iCol + 1, 'rgt');
                                    scrollGrid($t.p.iRow, i, 'h');
                                    $($t).jqGrid("editCell", $t.p.iRow, i, false);
                                }
                                break;
                            case 13:
                                if (parseInt($t.p.iCol, 10) >= 0 && parseInt($t.p.iRow, 10) >= 0) {
                                    $($t).jqGrid("editCell", $t.p.iRow, $t.p.iCol, true);
                                }
                                break;
                            default :
                                return true;
                        }
                        return false;
                    });
            });
        },
        editCell: function (iRow, iCol, ed) {
            return this.each(function () {
                var $t = this, nm, tmp, cc, cm;
                if (!$t.grid || $t.p.cellEdit !== true) {
                    return;
                }
                iCol = parseInt(iCol, 10);
                // select the row that can be used for other methods
                $t.p.selrow = $t.rows[iRow].id;
                if (!$t.p.knv) {
                    $($t).jqGrid("GridNav");
                }
                // check to see if we have already edited cell
                if ($t.p.savedRow.length > 0) {
                    // prevent second click on that field and enable selects
                    if (ed === true) {
                        if (iRow == $t.p.iRow && iCol == $t.p.iCol) {
                            return;
                        }
                    }
                    // save the cell
                    $($t).jqGrid("saveCell", $t.p.savedRow[0].id, $t.p.savedRow[0].ic);
                } else {
                    window.setTimeout(function () {
                        $("#" + $.jgrid.jqID($t.p.knv)).attr("tabindex", "-1").focus();
                    }, 0);
                }
                cm = $t.p.colModel[iCol];
                nm = cm.name;
                if (nm === 'subgrid' || nm === 'cb' || nm === 'rn') {
                    return;
                }
                cc = $("td:eq(" + iCol + ")", $t.rows[iRow]);
                if (cm.editable === true && ed === true && !cc.hasClass("not-editable-cell")) {
                    if (parseInt($t.p.iCol, 10) >= 0 && parseInt($t.p.iRow, 10) >= 0) {
                        $("td:eq(" + $t.p.iCol + ")", $t.rows[$t.p.iRow]).removeClass("edit-cell ui-state-highlight");
                        $($t.rows[$t.p.iRow]).removeClass("selected-row ui-state-hover");
                    }
                    $(cc).addClass("edit-cell ui-state-highlight");
                    $($t.rows[iRow]).addClass("selected-row ui-state-hover");
                    try {
                        tmp = $.unformat.call($t, cc, {rowId: $t.rows[iRow].id, colModel: cm}, iCol);
                    } catch (_) {
                        tmp = ( cm.edittype && cm.edittype === 'textarea' ) ? $(cc).text() : $(cc).html();
                    }
                    if ($t.p.autoencode) {
                        tmp = $.jgrid.htmlDecode(tmp);
                    }
                    if (!cm.edittype) {
                        cm.edittype = "text";
                    }
                    $t.p.savedRow.push({id: iRow, ic: iCol, name: nm, v: tmp});
                    if (tmp === "&nbsp;" || tmp === "&#160;" || (tmp.length === 1 && tmp.charCodeAt(0) === 160)) {
                        tmp = '';
                    }
                    if ($.isFunction($t.p.formatCell)) {
                        var tmp2 = $t.p.formatCell.call($t, $t.rows[iRow].id, nm, tmp, iRow, iCol);
                        if (tmp2 !== undefined) {
                            tmp = tmp2;
                        }
                    }
                    $($t).triggerHandler("jqGridBeforeEditCell", [$t.rows[iRow].id, nm, tmp, iRow, iCol]);
                    if ($.isFunction($t.p.beforeEditCell)) {
                        $t.p.beforeEditCell.call($t, $t.rows[iRow].id, nm, tmp, iRow, iCol);
                    }
                    var opt = $.extend({}, cm.editoptions || {}, {id: iRow + "_" + nm, name: nm});
                    var elc = $.jgrid.createEl.call($t, cc, cm.edittype, opt, tmp, true, $.extend({}, $.jgrid.ajaxOptions, $t.p.ajaxSelectOptions || {}));
                    $(cc).html("").append(elc).attr("tabindex", "0");
                    $.jgrid.bindEv.call($t, elc, opt);
                    window.setTimeout(function () {
                        $(elc).focus();
                    }, 0);
                    $("input, select, textarea", cc).bind("keydown", function (e) {
                        if (e.keyCode === 27) {
                            if ($("input.hasDatepicker", cc).length > 0) {
                                if ($(".ui-datepicker").is(":hidden")) {
                                    $($t).jqGrid("restoreCell", iRow, iCol);
                                }
                                else {
                                    $("input.hasDatepicker", cc).datepicker('hide');
                                }
                            } else {
                                $($t).jqGrid("restoreCell", iRow, iCol);
                            }
                        } //ESC
                        if (e.keyCode === 13) {
                            $($t).jqGrid("saveCell", iRow, iCol);
                            // Prevent default action
                            return false;
                        } //Enter
                        if (e.keyCode === 9) {
                            if (!$t.grid.hDiv.loading) {
                                if (e.shiftKey) {
                                    $($t).jqGrid("prevCell", iRow, iCol);
                                } //Shift TAb
                                else {
                                    $($t).jqGrid("nextCell", iRow, iCol);
                                } //Tab
                            } else {
                                return false;
                            }
                        }
                        e.stopPropagation();
                    });
                    $($t).triggerHandler("jqGridAfterEditCell", [$t.rows[iRow].id, nm, tmp, iRow, iCol]);
                    if ($.isFunction($t.p.afterEditCell)) {
                        $t.p.afterEditCell.call($t, $t.rows[iRow].id, nm, tmp, iRow, iCol);
                    }
                } else {
                    if (parseInt($t.p.iCol, 10) >= 0 && parseInt($t.p.iRow, 10) >= 0) {
                        $("td:eq(" + $t.p.iCol + ")", $t.rows[$t.p.iRow]).removeClass("edit-cell ui-state-highlight");
                        $($t.rows[$t.p.iRow]).removeClass("selected-row ui-state-hover");
                    }
                    cc.addClass("edit-cell ui-state-highlight");
                    $($t.rows[iRow]).addClass("selected-row ui-state-hover");
                    tmp = cc.html().replace(/\&#160\;/ig, '');
                    $($t).triggerHandler("jqGridSelectCell", [$t.rows[iRow].id, nm, tmp, iRow, iCol]);
                    if ($.isFunction($t.p.onSelectCell)) {
                        $t.p.onSelectCell.call($t, $t.rows[iRow].id, nm, tmp, iRow, iCol);
                    }
                }
                $t.p.iCol = iCol;
                $t.p.iRow = iRow;
            });
        },
        saveCell: function (iRow, iCol) {
            return this.each(function () {
                var $t = this, fr;
                if (!$t.grid || $t.p.cellEdit !== true) {
                    return;
                }
                if ($t.p.savedRow.length >= 1) {
                    fr = 0;
                } else {
                    fr = null;
                }
                if (fr !== null) {
                    var cc = $("td:eq(" + iCol + ")", $t.rows[iRow]), v, v2,
                        cm = $t.p.colModel[iCol], nm = cm.name, nmjq = $.jgrid.jqID(nm);
                    switch (cm.edittype) {
                        case "select":
                            if (!cm.editoptions.multiple) {
                                v = $("#" + iRow + "_" + nmjq + " option:selected", $t.rows[iRow]).val();
                                v2 = $("#" + iRow + "_" + nmjq + " option:selected", $t.rows[iRow]).text();
                            } else {
                                var sel = $("#" + iRow + "_" + nmjq, $t.rows[iRow]), selectedText = [];
                                v = $(sel).val();
                                if (v) {
                                    v.join(",");
                                } else {
                                    v = "";
                                }
                                $("option:selected", sel).each(
                                    function (i, selected) {
                                        selectedText[i] = $(selected).text();
                                    }
                                );
                                v2 = selectedText.join(",");
                            }
                            if (cm.formatter) {
                                v2 = v;
                            }
                            break;
                        case "checkbox":
                            var cbv = ["Yes", "No"];
                            if (cm.editoptions) {
                                cbv = cm.editoptions.value.split(":");
                            }
                            v = $("#" + iRow + "_" + nmjq, $t.rows[iRow]).is(":checked") ? cbv[0] : cbv[1];
                            v2 = v;
                            break;
                        case "password":
                        case "text":
                        case "textarea":
                        case "button" :
                            v = $("#" + iRow + "_" + nmjq, $t.rows[iRow]).val();
                            v2 = v;
                            break;
                        case "textEditor":
                        case "numberEditor":
                        case "comboBox":
                        case "checkListBox":
                        case "dict":
                        case "datePicker":
                            v = cc.val();
                            v2 = v;
                            break;
                        case 'custom' :
                            try {
                                if (cm.editoptions && $.isFunction(cm.editoptions.custom_value)) {
                                    v = cm.editoptions.custom_value.call($t, $(".customelement", cc), 'get');
                                    if (v === undefined) {
                                        throw "e2";
                                    } else {
                                        v2 = v;
                                    }
                                } else {
                                    throw "e1";
                                }
                            } catch (e) {
                                if (e === "e1") {
                                    $.jgrid.info_dialog($.jgrid.errors.errcap, "function 'custom_value' " + $.jgrid.edit.msg.nodefined, $.jgrid.edit.bClose);
                                }
                                if (e === "e2") {
                                    $.jgrid.info_dialog($.jgrid.errors.errcap, "function 'custom_value' " + $.jgrid.edit.msg.novalue, $.jgrid.edit.bClose);
                                }
                                else {
                                    $.jgrid.info_dialog($.jgrid.errors.errcap, e.message, $.jgrid.edit.bClose);
                                }
                            }
                            break;
                    }
                    // The common approach is if nothing changed do not do anything
                    if (v2 !== $t.p.savedRow[fr].v) {
                        var vvv = $($t).triggerHandler("jqGridBeforeSaveCell", [$t.rows[iRow].id, nm, v, iRow, iCol]);
                        if (vvv) {
                            v = vvv;
                            v2 = vvv;
                        }
                        if ($.isFunction($t.p.beforeSaveCell)) {
                            var vv = $t.p.beforeSaveCell.call($t, $t.rows[iRow].id, nm, v, iRow, iCol);
                            if (vv) {
                                v = vv;
                                v2 = vv;
                            }
                        }
                        var cv = $.jgrid.checkValues.call($t, v, iCol);
                        if (cv[0] === true) {
                            var addpost = $($t).triggerHandler("jqGridBeforeSubmitCell", [$t.rows[iRow].id, nm, v, iRow, iCol]) || {};
                            if ($.isFunction($t.p.beforeSubmitCell)) {
                                addpost = $t.p.beforeSubmitCell.call($t, $t.rows[iRow].id, nm, v, iRow, iCol);
                                if (!addpost) {
                                    addpost = {};
                                }
                            }
                            if ($t.p.cellsubmit === 'clientArray') {
                                $(cc).empty();
                                $($t).jqGrid("setCell", $t.rows[iRow].id, iCol, v2, false, false, true);
                                $(cc).addClass("dirty-cell");
                                $($t.rows[iRow]).addClass("edited");
                                $($t).triggerHandler("jqGridAfterSaveCell", [$t.rows[iRow].id, nm, v, iRow, iCol]);
                                if ($.isFunction($t.p.afterSaveCell)) {
                                    $t.p.afterSaveCell.call($t, $t.rows[iRow].id, nm, v, iRow, iCol);
                                }
                                $t.p.savedRow.splice(0, 1);
                            }
                        } else {
                            try {
                                window.setTimeout(function () {
                                    $.jgrid.info_dialog($.jgrid.errors.errcap, v + " " + cv[1], $.jgrid.edit.bClose);
                                }, 100);
                                $($t).jqGrid("restoreCell", iRow, iCol);
                            } catch (e) {
                            }
                        }
                    } else {
                        $($t).jqGrid("restoreCell", iRow, iCol);
                    }
                }
                window.setTimeout(function () {
                    $("#" + $.jgrid.jqID($t.p.knv)).attr("tabindex", "-1").focus();
                }, 0);
            });
        },
        restoreCell: function (iRow, iCol) {
            return this.each(function () {
                var $t = this, fr;
                if (!$t.grid || $t.p.cellEdit !== true) {
                    return;
                }
                if ($t.p.savedRow.length >= 1) {
                    fr = 0;
                } else {
                    fr = null;
                }
                if (fr !== null) {
                    var cc = $("td:eq(" + iCol + ")", $t.rows[iRow]);
                    $(cc).empty().attr("tabindex", "-1");
                    $($t).jqGrid("setCell", $t.rows[iRow].id, iCol, $t.p.savedRow[fr].v, false, false, true);
                    $($t).triggerHandler("jqGridAfterRestoreCell", [$t.rows[iRow].id, $t.p.savedRow[fr].v, iRow, iCol]);
                    if ($.isFunction($t.p.afterRestoreCell)) {
                        $t.p.afterRestoreCell.call($t, $t.rows[iRow].id, $t.p.savedRow[fr].v, iRow, iCol);
                    }
                    $t.p.savedRow.splice(0, 1);
                }
                window.setTimeout(function () {
                    $("#" + $t.p.knv).attr("tabindex", "-1").focus();
                }, 0);
            });
        },
        getRowData: function (rowid) {
            var res = {}, resall, getall = false, len, j = 0;
            this.each(function () {
                var $t = this, nm, ind;
                if (rowid === undefined) {
                    getall = true;
                    resall = [];
                    len = $t.rows.length;
                } else {
                    ind = $($t).jqGrid('getGridRowById', rowid);
                    if (!ind) {
                        return res;
                    }
                    len = 2;
                }
                while (j < len) {
                    if (getall) {
                        ind = $t.rows[j];
                    }
                    if ($(ind).hasClass('jqgrow')) {
                        $('td[role="gridcell"]', ind).each(function (i) {
                            nm = $t.p.colModel[i].name;
                            if (nm !== 'cb' && nm !== 'subgrid' && nm !== 'rn') {
                                if ($t.p.treeGrid === true && nm === $t.p.ExpandColumn) {
                                    res[nm] = $.jgrid.htmlDecode($("span:first", this).html());
                                } else {
                                    try {
                                        res[nm] = $.unformat.call($t, this, {rowId: ind.id, colModel: $t.p.colModel[i]}, i);
                                    } catch (e) {
                                        res[nm] = $.jgrid.htmlDecode($(this).html());
                                    }
                                }
                            }
                        });
                        if (getall) {
                            resall.push(res);
                            res = {};
                        }
                    }
                    j++;
                }
            });
            return resall || res;
        }
    });
})(jQuery);


//表格的一些公共方法
(function ($) {
    "use strict";
    $.extend($.jgrid, {
        checkValues: function (val, valref, customobject, nam) {
            var edtrul, i, nm, dft, len, g = this, cm = g.p.colModel;
            if (customobject === undefined) {
                if (typeof valref === 'string') {
                    for (i = 0, len = cm.length; i < len; i++) {
                        if (cm[i].name === valref) {
                            edtrul = cm[i].editrules;
                            valref = i;
                            if (cm[i].formoptions != null) {
                                nm = cm[i].formoptions.label;
                            }
                            break;
                        }
                    }
                } else if (valref >= 0) {
                    edtrul = cm[valref].editrules;
                }
            } else {
                edtrul = customobject;
                nm = nam === undefined ? "_" : nam;
            }
            if (edtrul) {
                if (!nm) {
                    nm = g.p.colNames != null ? g.p.colNames[valref] : cm[valref].label;
                }
                if (edtrul.required === true) {
                    if ($.jgrid.isEmpty(val)) {
                        return [false, nm + ": " + $.jgrid.edit.msg.required, ""];
                    }
                }
                // force required
                var rqfield = edtrul.required === false ? false : true;
                if (edtrul.number === true) {
                    if (!(rqfield === false && $.jgrid.isEmpty(val))) {
                        if (isNaN(val)) {
                            return [false, nm + ": " + $.jgrid.edit.msg.number, ""];
                        }
                    }
                }
                if (edtrul.minValue !== undefined && !isNaN(edtrul.minValue)) {
                    if (parseFloat(val) < parseFloat(edtrul.minValue)) {
                        return [false, nm + ": " + $.jgrid.edit.msg.minValue + " " + edtrul.minValue, ""];
                    }
                }
                if (edtrul.maxValue !== undefined && !isNaN(edtrul.maxValue)) {
                    if (parseFloat(val) > parseFloat(edtrul.maxValue)) {
                        return [false, nm + ": " + $.jgrid.edit.msg.maxValue + " " + edtrul.maxValue, ""];
                    }
                }
                var filter;
                if (edtrul.email === true) {
                    if (!(rqfield === false && $.jgrid.isEmpty(val))) {
                        // taken from $ Validate plugin
                        filter = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;
                        if (!filter.test(val)) {
                            return [false, nm + ": " + $.jgrid.edit.msg.email, ""];
                        }
                    }
                }
                if (edtrul.integer === true) {
                    if (!(rqfield === false && $.jgrid.isEmpty(val))) {
                        if (isNaN(val)) {
                            return [false, nm + ": " + $.jgrid.edit.msg.integer, ""];
                        }
                        if ((val % 1 !== 0) || (val.indexOf('.') !== -1)) {
                            return [false, nm + ": " + $.jgrid.edit.msg.integer, ""];
                        }
                    }
                }
                if (edtrul.date === true) {
                    if (!(rqfield === false && $.jgrid.isEmpty(val))) {
                        if (cm[valref].formatoptions && cm[valref].formatoptions.newformat) {
                            dft = cm[valref].formatoptions.newformat;
                            if ($.jgrid.formatter.date.masks.hasOwnProperty(dft)) {
                                dft = $.jgrid.formatter.date.masks[dft];
                            }
                        } else {
                            dft = cm[valref].datefmt || "Y-m-d";
                        }
                        if (!$.jgrid.checkDate(dft, val)) {
                            return [false, nm + ": " + $.jgrid.edit.msg.date + " - " + dft, ""];
                        }
                    }
                }
                if (edtrul.time === true) {
                    if (!(rqfield === false && $.jgrid.isEmpty(val))) {
                        if (!$.jgrid.checkTime(val)) {
                            return [false, nm + ": " + $.jgrid.edit.msg.date + " - hh:mm (am/pm)", ""];
                        }
                    }
                }
                if (edtrul.url === true) {
                    if (!(rqfield === false && $.jgrid.isEmpty(val))) {
                        filter = /^(((https?)|(ftp)):\/\/([\-\w]+\.)+\w{2,3}(\/[%\-\w]+(\.\w{2,})?)*(([\w\-\.\?\\\/+@&#;`~=%!]*)(\.\w{2,})?)*\/?)/i;
                        if (!filter.test(val)) {
                            return [false, nm + ": " + $.jgrid.edit.msg.url, ""];
                        }
                    }
                }
                if (edtrul.custom === true) {
                    if (!(rqfield === false && $.jgrid.isEmpty(val))) {
                        if ($.isFunction(edtrul.custom_func)) {
                            var ret = edtrul.custom_func.call(g, val, nm, valref);
                            return $.isArray(ret) ? ret : [false, $.jgrid.edit.msg.customarray, ""];
                        }
                        return [false, $.jgrid.edit.msg.customfcheck, ""];
                    }
                }
            }
            return [true, "", ""];
        },
        bindEv: function (el, opt) {
            var $t = this;
            if ($.isFunction(opt.dataInit)) {
                opt.dataInit.call($t, el, opt);
            }
            if (opt.dataEvents) {
                $.each(opt.dataEvents, function () {
                    if (this.data !== undefined) {
                        $(el).bind(this.type, this.data, this.fn);
                    } else {
                        $(el).bind(this.type, this.fn);
                    }
                });
            }
        },
        createEl: function (parentEl, eltype, options, vl, autowidth, ajaxso) {
            var elem = "", $t = this;

            function setAttributes(elm, atr, exl) {
                var exclude = ['dataInit', 'dataEvents', 'dataUrl', 'buildSelect', 'sopt', 'searchhidden', 'defaultValue', 'attr', 'custom_element', 'custom_value'];
                if (exl !== undefined && $.isArray(exl)) {
                    $.merge(exclude, exl);
                }
                $.each(atr, function (key, value) {
                    if ($.inArray(key, exclude) === -1) {
                        $(elm).attr(key, value);
                    }
                });
                if (!atr.hasOwnProperty('id')) {
                    $(elm).attr('id', $.jgrid.randId());
                }
            }

            switch (eltype) {
                case "textarea" :
                    elem = document.createElement("textarea");
                    if (autowidth) {
                        if (!options.cols) {
                            $(elem).css({width: "100%", height: "100%"});
                        }
                    } else if (!options.cols) {
                        options.cols = 20;
                    }
                    if (!options.rows) {
                        options.rows = 2;
                    }
                    if (vl === '&nbsp;' || vl === '&#160;' || (vl.length === 1 && vl.charCodeAt(0) === 160)) {
                        vl = "";
                    }
                    elem.value = vl;
                    setAttributes(elem, options);
                    $(elem).attr({"role": "textbox", "multiline": "true"});
                    break;
                case "checkbox" : //what code for simple checkbox
                    elem = document.createElement("input");
                    elem.type = "checkbox";
                    if (!options.value) {
                        var vl1 = (vl + "").toLowerCase();
                        if (vl1.search(/(false|f|0|no|n|off|undefined)/i) < 0 && vl1 !== "") {
                            elem.checked = true;
                            elem.defaultChecked = true;
                            elem.value = vl;
                        } else {
                            elem.value = "on";
                        }
                        $(elem).attr("offval", "off");
                    } else {
                        var cbval = options.value.split(":");
                        if (vl === cbval[0]) {
                            elem.checked = true;
                            elem.defaultChecked = true;
                        }
                        elem.value = cbval[0];
                        $(elem).attr("offval", cbval[1]);
                    }
                    setAttributes(elem, options, ['value']);
                    $(elem).attr("role", "checkbox");
                    break;
                case "select" :
                    elem = document.createElement("select");
                    elem.setAttribute("role", "select");
                    var msl, ovm = [];
                    if (options.multiple === true) {
                        msl = true;
                        elem.multiple = "multiple";
                        $(elem).attr("aria-multiselectable", "true");
                    } else {
                        msl = false;
                    }
                    if (options.dataUrl !== undefined) {
                        var rowid = options.name ? String(options.id).substring(0, String(options.id).length - String(options.name).length - 1) : String(options.id),
                            postData = options.postData || ajaxso.postData;

                        if ($t.p && $t.p.idPrefix) {
                            rowid = $.jgrid.stripPref($t.p.idPrefix, rowid);
                        }
                        $.ajax($.extend({
                            url: $.isFunction(options.dataUrl) ? options.dataUrl.call($t, rowid, vl, String(options.name)) : options.dataUrl,
                            type: "GET",
                            dataType: "html",
                            data: $.isFunction(postData) ? postData.call($t, rowid, vl, String(options.name)) : postData,
                            context: {elem: elem, options: options, vl: vl},
                            success: function (data) {
                                var ovm = [], elem = this.elem, vl = this.vl,
                                    options = $.extend({}, this.options),
                                    msl = options.multiple === true,
                                    a = $.isFunction(options.buildSelect) ? options.buildSelect.call($t, data) : data;
                                if (typeof a === 'string') {
                                    a = $($.trim(a)).html();
                                }
                                if (a) {
                                    $(elem).append(a);
                                    setAttributes(elem, options, postData ? ['postData'] : undefined);
                                    if (options.size === undefined) {
                                        options.size = msl ? 3 : 1;
                                    }
                                    if (msl) {
                                        ovm = vl.split(",");
                                        ovm = $.map(ovm, function (n) {
                                            return $.trim(n);
                                        });
                                    } else {
                                        ovm[0] = $.trim(vl);
                                    }
                                    //$(elem).attr(options);
                                    setTimeout(function () {
                                        $("option", elem).each(function (i) {
                                            //if(i===0) { this.selected = ""; }
                                            // fix IE8/IE7 problem with selecting of the first item on multiple=true
                                            if (i === 0 && elem.multiple) {
                                                this.selected = false;
                                            }
                                            $(this).attr("role", "option");
                                            if ($.inArray($.trim($(this).text()), ovm) > -1 || $.inArray($.trim($(this).val()), ovm) > -1) {
                                                this.selected = "selected";
                                            }
                                        });
                                    }, 0);
                                }
                            }
                        }, ajaxso || {}));
                    } else if (options.value) {
                        var i;
                        if (options.size === undefined) {
                            options.size = msl ? 3 : 1;
                        }
                        if (msl) {
                            ovm = vl.split(",");
                            ovm = $.map(ovm, function (n) {
                                return $.trim(n);
                            });
                        }
                        if (typeof options.value === 'function') {
                            options.value = options.value();
                        }
                        var so, sv, ov,
                            sep = options.separator === undefined ? ":" : options.separator,
                            delim = options.delimiter === undefined ? ";" : options.delimiter;
                        if (typeof options.value === 'string') {
                            so = options.value.split(delim);
                            for (i = 0; i < so.length; i++) {
                                sv = so[i].split(sep);
                                if (sv.length > 2) {
                                    sv[1] = $.map(sv,function (n, ii) {
                                        if (ii > 0) {
                                            return n;
                                        }
                                    }).join(sep);
                                }
                                ov = document.createElement("option");
                                ov.setAttribute("role", "option");
                                ov.value = sv[0];
                                ov.innerHTML = sv[1];
                                elem.appendChild(ov);
                                if (!msl && ($.trim(sv[0]) === $.trim(vl) || $.trim(sv[1]) === $.trim(vl))) {
                                    ov.selected = "selected";
                                }
                                if (msl && ($.inArray($.trim(sv[1]), ovm) > -1 || $.inArray($.trim(sv[0]), ovm) > -1)) {
                                    ov.selected = "selected";
                                }
                            }
                        } else if (typeof options.value === 'object') {
                            var oSv = options.value, key;
                            for (key in oSv) {
                                if (oSv.hasOwnProperty(key)) {
                                    ov = document.createElement("option");
                                    ov.setAttribute("role", "option");
                                    ov.value = key;
                                    ov.innerHTML = oSv[key];
                                    elem.appendChild(ov);
                                    if (!msl && ( $.trim(key) === $.trim(vl) || $.trim(oSv[key]) === $.trim(vl))) {
                                        ov.selected = "selected";
                                    }
                                    if (msl && ($.inArray($.trim(oSv[key]), ovm) > -1 || $.inArray($.trim(key), ovm) > -1)) {
                                        ov.selected = "selected";
                                    }
                                }
                            }
                        }
                        setAttributes(elem, options, ['value']);
                    }
                    break;
                case "text" :
                    var textEditor = new YIUI.Control.TextEditor(options);
                    textEditor.render(parentEl);
                    textEditor.setValue(vl);
                    elem = $(textEditor.el).find("input")[0];
                    elem.type = eltype;
                    $(elem).select();
                    setAttributes(elem, options);
                    if (autowidth) {
                        if (!options.size) {
                            $(elem).css({width: "100%", height: "100%"});
                        }
                    }
                    $(elem).attr("role", "textbox");
                    break;
                case "password" :
                case "button" :
                    var role;
                    if (eltype === "button") {
                        role = "button";
                    }
                    else {
                        role = "textbox";
                    }
                    elem = document.createElement("input");
                    elem.type = eltype;
                    elem.value = vl;
                    setAttributes(elem, options);
                    if (eltype !== "button") {
                        if (autowidth) {
                            if (!options.size) {
                                $(elem).css({width: "100%", height: "100%"});
                            }
                        } else if (!options.size) {
                            options.size = 20;
                        }
                    }
                    $(elem).attr("role", role);
                    break;
                case "image" :
                case "file" :
                    elem = document.createElement("input");
                    elem.type = eltype;
                    setAttributes(elem, options);
                    break;
                case "custom" :
                    elem = document.createElement("span");
                    try {
                        if ($.isFunction(options.custom_element)) {
                            var celm = options.custom_element.call($t, vl, options);
                            if (celm) {
                                celm = $(celm).addClass("customelement").attr({id: options.id, name: options.name});
                                $(elem).empty().append(celm);
                            } else {
                                throw "e2";
                            }
                        } else {
                            throw "e1";
                        }
                    } catch (e) {
                        if (e === "e1") {
                            $.jgrid.info_dialog($.jgrid.errors.errcap, "function 'custom_element' " + $.jgrid.edit.msg.nodefined, $.jgrid.edit.bClose);
                        }
                        if (e === "e2") {
                            $.jgrid.info_dialog($.jgrid.errors.errcap, "function 'custom_element' " + $.jgrid.edit.msg.novalue, $.jgrid.edit.bClose);
                        }
                        else {
                            $.jgrid.info_dialog($.jgrid.errors.errcap, typeof e === "string" ? e : e.message, $.jgrid.edit.bClose);
                        }
                    }
                    break;
            }
            return elem;
        }
    });
})(jQuery);


//fmatter初始化
(function ($) {
    "use strict";
    $.fmatter = {};
    $.extend($.fmatter, {
        isBoolean: function (o) {
            return typeof o === 'boolean';
        },
        isObject: function (o) {
            return (o && (typeof o === 'object' || $.isFunction(o))) || false;
        },
        isString: function (o) {
            return typeof o === 'string';
        },
        isNumber: function (o) {
            return typeof o === 'number' && isFinite(o);
        },
        isValue: function (o) {
            return (this.isObject(o) || this.isString(o) || this.isNumber(o) || this.isBoolean(o));
        },
        isEmpty: function (o) {
            if (!this.isString(o) && this.isValue(o)) {
                return false;
            }
            if (!this.isValue(o)) {
                return true;
            }
            o = $.trim(o).replace(/\&nbsp\;/ig, '').replace(/\&#160\;/ig, '');
            return o === "";
        }
    });
    $.fn.fmatter = function (formatType, cellval, opts, rwd, act) {
        var v = cellval;
        opts = $.extend({}, $.jgrid.formatter, opts);
        try {
            v = $.fn.fmatter[formatType].call(this, cellval, opts, rwd, act);
        } catch (fe) {
        }
        return v;
    };
})(jQuery);