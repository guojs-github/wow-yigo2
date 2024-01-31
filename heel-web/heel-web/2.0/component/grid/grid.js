/**
 * Grid control.
 * 
 * 2023.8.31 added by guojs.
 */

/**
 *
 * cellData结构: 1.value 2.caption 3.enable 4.required 5.error 6.errorMsg
 *
 */

/**
 * guojs
 * Grid控件
 */
YIUI.Control.Grid = YIUI.extend(YIUI.Control, {
    autoEl:'<table></table>',
    gridHandler:YIUI.GridHandler,
    hasColExpand:false,
    hasCellExpand:false,
    hasRowExpand:false,
    hasRowAreaExpand:false,
    hasGroupRow:false,
    hasFixRow:false,
    hasTotalRow:false,
    hasFixCellMerge:false,
    showRowHead:true,
    newEmptyRow:true,
    hasDetailRow:false,
    hideGroup4Editing:false,
    topFixRowCount:0,
    bottomFixRowCount:0,
    endEditByNav:false,
    hasTree: false,
    multiple: false,

    filter: null,

    init: function (options) {
        this.base(options);
        this.orgMetaObj = options.metaObj;
        this.metaObj = options.metaObj; // 表格元数据
        this.selectFieldIndex = options.selectFieldIndex;
        this.rowExpandIndex = options.rowExpandIndex;
        this.treeIndex = options.treeIndex;
        this.primaryKeys = options.primaryKeys || [];
        this.opts = options.opts || [];
        this.extOpts = options.extOpts;

        this.rowList = this.metaObj.rowList || [];
        this.serialSeq = this.metaObj.serialSeq;
        this.serialRowNum = this.metaObj.serialRowNum;
        this.detailMetaRowIndex = this.metaObj.detailMetaRowIndex;
        this.mergeCellKeys = this.metaObj.mergeCellKeys || [];
        this.groupIndexes = this.metaObj.groupIndexes || [];
        this.groupCells = [];
        this.groupHeaders = [];
        this.rowIDMap = {};

        this.dataModel = {
            data: [],
            colModel: {},
            rowMap: {},
            expandModel: []
        };

        this.initDimValue();
        this.initLeafColumns();
        this.initDataModel();
        this.initGroupCells();
        $.ygrid.initI18N();
        
        this.pageInfo = {
            curPageIndex: 0,
            totalRowCount: 0,
            pageLoadType: this.metaObj.pageLoadType,
            pageRowCount: this.metaObj.pageRowCount,
            pageIndicatorCount: this.metaObj.pageIndicatorCount,
            pageCount: 1,
            reset:function () {
                this.curPageIndex = 0;
                this.totalRowCount = 0;
                this.pageCount = 1;
            },
            calcPage:function () {
                var pageCount = Math.ceil(this.totalRowCount / this.pageRowCount);
                this.pageCount = pageCount == 0 ? 1 : pageCount;
            }
        };
    },

    initDimValue: function () {
        var metaObj = this.getMetaObj();
        if( !metaObj.dimValueInit ) {
            var metaRows = metaObj.rows,metaRow,metaCell,dim;
            for( var i = 0,length = metaRows.length;i < length;i++ ) {
                metaRow = metaRows[i];
                dim = metaRow.dimValue;
                if( dim ) {
                    metaRow.dimValue = new YIUI.MultiDimValue(dim);
                }
                for( var k = 0,size = metaRow.cells.length;k < size;k++ ) {
                    metaCell = metaRow.cells[k];
                    dim = metaCell.dimValue;
                    if( dim ) {
                        metaCell.dimValue = new YIUI.MultiDimValue(dim);
                    }
                }
            }
        }
        metaObj.dimValueInit = true;
    },

    initLeafColumns:function () {
        var getLeafColumns = function (_columns) {
            for (var i = 0,column; column = _columns[i]; i++) {
                if (column.columns != null && column.columns.length > 0) {
                    getLeafColumns(column.columns, leafColumns);
                } else {
                    leafColumns.push(column);
                }
            }
        }

        var leafColumns = [];

        var columns = this.getMetaObj().columns;

        getLeafColumns(columns);

        this.metaObj.leafColumns = leafColumns;
    },

    initDataModel: function () { // 初始化数据模型，包括一些显示信息

        // 表格支持多层次树形列
        // leafColumns，获取元数据列定义中关于列定义中叶子节点值，
        var leafColumns = this.getMetaObj().leafColumns; 
        var columns = [], column;

        for (var i = 0, metaColumn; metaColumn = leafColumns[i] /*有趣，当取值超过数组上界，则退出*/; i++) {
            column = {};
            column.key = metaColumn.key; // 编码
            column.label = metaColumn.caption; // 显示名称
            column.formulaCaption = metaColumn.formulaCaption;
            column.name = 'column' + i;
            column.index = i; // 列序号？
            column.parentKey = metaColumn.parentKey;
            column.width = metaColumn.width; // 列宽度
            column.hidden = false; // 这里重新加载的时候,不应该直接重置。现在是在计算的地方处理
            column.sortable = metaColumn.sortable; // 是否排序
            column.visible = metaColumn.visible; // 可否隐藏
            column.columnType = metaColumn.columnType; // 参考配置工具：Fix，固定列；明细列；分组列；汇总列。
            columns.push(column);
        }

        this.dataModel.colModel.columns = columns; // 记录列定义
    },

    initGroupCells: function () {
        var indexes = this.groupIndexes,
            detailRow = this.getDetailMetaRow();

        for( var i = 0,size = indexes.length;i < size;i++ ) {
            this.groupCells.push(detailRow.cells[indexes[i]].key);
        }
    },

    setMetaObj: function (metaObj) { // 更新表格元数据
        if (metaObj != null) {
            this.metaObj = metaObj;
        }
    },

    // 获取配置对象:拓展后的
    getMetaObj: function () { // 获取表格元数据
        return this.metaObj;
    },

    // 获取原始配置对象:未拓展的
    getOrgMetaObj: function () {
        return this.orgMetaObj;
    },

    setVAlign: function (vAlign) {

    },
    setHAlign: function (hAlign) {

    },
    // private 默认的设置组件宽度方法，如果组件有自定义设置宽度方法，可在子组件重写此方法。
    onSetWidth: function (width) {
        this.el && this.el.setGridWidth(width);
    },

    setHeight: function (height) {
        this.base(height);
    },

    // private 默认的设置组件高度方法，如果组件有自定义设置高度方法，可在子组件重写此方法。
    onSetHeight: function (height) {
        this.el && this.el.setGridHeight(height);
    },

    //获得表格最外层节点，或者说表格根节点
    getOuterEl: function () {
        return $("#gbox_" + this.id);
    },

    // 刷新动态单元格,加载时,根据数据中的typeDefKey
    refreshDynamicOpt:function (editOpt,rowIndex,colIndex,defKey) {
        var form = YIUI.FormStack.getForm(this.ofFormID),
            cellData = this.getCellDataAt(rowIndex,colIndex);

        var typeDefKey = defKey;
        if( !typeDefKey ) {
            var cxt = new View.Context(form);
            cxt.updateLocation(this.key,rowIndex,colIndex);

            typeDefKey = form.eval(editOpt.editOptions.typeFormula, cxt);
        }

        if( typeDefKey ) {
            var oldDefKey = cellData.typeDefKey;

            if( typeDefKey != oldDefKey ) {
                var cellTypeDef = form.metaForm.cellTypeGroup[typeDefKey],
                    editOptions = cellTypeDef.editOptions;

                var newData = YIUI.GridUtil.initCellData(editOptions.cellType, cellTypeDef);

                cellData[0] = newData[0];
                cellData[1] = newData[1];
                cellData.typeDef = $.extend({},cellTypeDef);
                cellData.typeDefKey = typeDefKey;

                // 刷新编辑组件
                if( this.el ) {
                    this.el.refreshDynamicEditor(cellTypeDef,rowIndex,colIndex);
                }
            }
        } else {
            delete cellData.typeDef;
            delete cellData.typeDefKey;
        }
        return editOpt;
    },

    // 检查编辑值
    formatInput: function (editOpt,value) {

        var behavior = this.getBehavior(editOpt.cellType);

        if( behavior && behavior.checkValid ) {
            return behavior.checkValid(editOpt,value);
        }

        return value;
    },

    //编辑单元格时如果是自定义编辑组件，则这里进行对应组件的创建
    createCellEditor2: function (cell, rowIndex, colIndex, opt) {
        var self = this,
            editOpt = self.getCellEditOpt(rowIndex,colIndex),
            cellKey = editOpt.key;

        var cellType = editOpt.cellType;

        var editor,
            $t = self.el[0],

            cellData = self.getCellDataAt(rowIndex,colIndex),
            value = cellData[0], orgCaption = cellData[1], caption = cellData[1];

        // 动态单元格处理
        if (cellType == YIUI.CONTROLTYPE.DYNAMIC) {
            self.refreshDynamicOpt(editOpt,rowIndex,colIndex);

            var typeDef = cellData.typeDef;

            if( !typeDef ) {
                return;
            }

            var options = typeDef.editOptions;

            options.key = cellKey;
            options.typeDefKey = cellData.typeDefKey;

            cellType = options.cellType;

            // 复制一个opt
            editOpt = $.extend({}, editOpt);
            editOpt.editOptions = options;

           // value = cellData[0], caption = cellData[1];
        }

        editOpt.id = opt.id;

        if( !opt.normalEdit ) {
            caption = this.formatInput(editOpt, opt.event.code);
        }

        cell.html("").attr("tabIndex", "0");

        var setFocusAndSelect = function (editor, callback) { // 控件设置焦点，内容全选中

            var moveStart = function (element) {
                var pos = element.value.length;
                if (element.setSelectionRange) {
                    element.setSelectionRange(pos, pos);
                } else if (element.createTextRange) {
                    var r = element.createTextRange();
                    r.moveStart('character', pos);
                    r.collapse(true);
                    r.select();
                }
            };

            window.setTimeout(function () {
                $(editor.getInput()).focus(function () {
                    if( !opt.normalEdit ) { // 如果是单击编辑,移动光标
                        moveStart(this);
                    } else {
                        $(this).select(); // 双击编辑,选中全部
                    }
                });
                editor.focus(); // 编辑器获取焦点
                if ($.isFunction(callback)) {
                    callback();
                }
            }, 0);
        };

        var clickDropBtn = function (editor, callback) {
            var event = opt.event || window.event;
            if (event.type === "click") {
                var srcE = event.target || event.srcElement ,
                    x = event.offsetX || (event.clientX - srcE.getBoundingClientRect().left),
                    y = event.offsetY || (event.clientY - srcE.getBoundingClientRect().top),
                    btn = editor.getDropBtn()[0],
                    top = btn.offsetTop, left = btn.offsetLeft,
                    height = btn.offsetHeight, width = btn.offsetWidth;
                if (top <= y && y <= (top + height) && left <= x && x <= (cell[0].offsetLeft + cell[0].offsetWidth)) {
                    return editor.getDropBtn().click();
                }
            }
            setFocusAndSelect(editor, callback);
        };

        switch (cellType) { // 单元格中创建控件
            case YIUI.CONTROLTYPE.TEXTEDITOR: // 文本编辑器
                editor = new YIUI.CellEditor.CellTextEditor(editOpt);
                editor.render(cell);

                editor.setText(caption);
                editor.getInput().addClass("celled");

                editor.setValue(value);
                setFocusAndSelect(editor, () => { // 获得焦点时候
                    editor.getInput().addClass('focus'); //及时，修改样式
                });
                break;
            case YIUI.CONTROLTYPE.NUMBEREDITOR:
                editor = new YIUI.CellEditor.CellNumberEditor(editOpt);
                editor.render(cell);

                editor.setText(caption);
                editor.getInput().addClass("celled");

                editor.setValue(value);
                setFocusAndSelect(editor);
                break;
            case YIUI.CONTROLTYPE.DYNAMICDICT:
                editor = new YIUI.CellEditor.CellDynamicDict(editOpt);
                editor.ofFormID = self.ofFormID;

                editor.render(cell);
                editor.setUnitContext(new View.UnitContext({
                    gridKey: this.key,
                    row: rowIndex
                }));

                editor.setValue(value);
                editor.setText(orgCaption); // 设置_temp
                editor.setInputText(caption); // 设置编辑值

                clickDropBtn(editor);
                break;
          case YIUI.CONTROLTYPE.DICT: // 创建字典控件 
                editor = new YIUI.CellEditor.CellDict(editOpt);
                editor.ofFormID = self.ofFormID;

                editor.render(cell);
                editor.setUnitContext(new View.UnitContext({
                    gridKey: this.key,
                    row: rowIndex
                }));

                editor.setValue(value);
                editor.setText(orgCaption); // 设置_temp
                editor.setInputText(caption); // 设置编辑值

                clickDropBtn(editor);
                break;
            case YIUI.CONTROLTYPE.COMBOBOX:
            case YIUI.CONTROLTYPE.CHECKLISTBOX:
                editor = new YIUI.CellEditor.CellComboBox(editOpt);
                editor.ofFormID = self.ofFormID;

                editor.render(cell);
                editor.setValue(value);
                editor.setText(caption);
                clickDropBtn(editor);
                break;
            case YIUI.CONTROLTYPE.DATEPICKER:
                editor = new YIUI.CellEditor.CellDatePicker(editOpt);
                editor.render(cell);
                editor.setValue(value);
                editor.setText(caption);
                clickDropBtn(editor);
                break;
            case YIUI.CONTROLTYPE.UTCDATEPICKER:
                editor = new YIUI.CellEditor.CellUTCDatePicker(editOpt);
                editor.render(cell);
                editor.setValue(value);
                editor.setText(caption);
                clickDropBtn(editor);
                break;
            case YIUI.CONTROLTYPE.TEXTBUTTON:
                editOpt.click = function () {
                    self.gridHandler.doOnCellClick(self, rowIndex, colIndex);
                };
                editor = new YIUI.CellEditor.CellTextButton(editOpt);
                editor.render(cell);
                editor.setValue(value);
                editor.setText(caption);
                editor.getInput().addClass("celled");
                setFocusAndSelect(editor);
                break;
            case YIUI.CONTROLTYPE.MONTHPICKER:
                editor = new YIUI.CellEditor.CellMonthPicker(editOpt);
                editor.render(cell);
                editor.setValue(value);
                editor.setText(caption);
                clickDropBtn(editor);
                break;
            case YIUI.CONTROLTYPE.TIMEPICKER:
                editor = new YIUI.CellEditor.CellTimePicker(editOpt);
                editor.render(cell);
                editor.setValue(value);
                editor.setText(caption);
                clickDropBtn(editor);
                break;
        }

        if(!editor){
            return;
        }

        //单元格值提交事件
        editor.saveCell = function (value) { 
            // 下拉控件如果没有调用commitValue，则似乎不会自动删除失去焦点的单元格中控件

            editor.beforeDestroy();
            self.getControlGrid().setValueAt(rowIndex, colIndex, value, true, true);
        };

        //焦点离开事件,单元格恢复显示样式
        editor.doFocusOut = function(){
            editor.beforeDestroy();
            $($t).yGrid("updateCell", rowIndex, colIndex, cellData);
            // kvn获取焦点,使键盘事件可用
            // 表格切头控件 会来回调用focusin focusout
            // window.setTimeout(function () {
            //     $t.knvFocus2();
            // }, 0);
        };

        // 统一注册表格单元格编辑组件的事件
        editor.getInput().keydown(function (event) {
            var keyCode = event.charCode || event.keyCode || 0;
            if (keyCode === 13 || keyCode === 108 || keyCode === 9) {
                editor.getInput().blur();
                if (YIUI.DictQuery.willshow) { // 字典弹出模糊查询框,焦点不转移
                   event.stopPropagation();
                }
                $("#" + $t.p.knv).trigger("keydown", event);
            }
        });
        cell[0].editor = editor;
    },

    endCheck2: function(cellData, editOpt, rowIndex, colIndex, val) {

        var typeDef = cellData.typeDef,
            meta;

        if( typeDef ) {
            meta = typeDef.editOptions;
        } else {
            meta = editOpt.editOptions;
        }

        var def,caption;

        switch (meta.cellType) {
            case YIUI.CONTROLTYPE.DICT:
            case YIUI.CONTROLTYPE.DYNAMICDICT:
                def = $.Deferred();
                var form = YIUI.FormStack.getForm(this.ofFormID);
                if(meta.formulaText && val){
                    var cxt = new View.Context(form);
                    cxt.updateLocation(this.key,rowIndex,colIndex);
                    var text = form.eval(meta.formulaText, cxt, null);
                    def.resolve(text);
                }else{
                    return YIUI.DictHandler.getShowCaption(form, val, meta.allowMultiSelection, meta.independent, meta.textField);
                }
                break;
            case YIUI.CONTROLTYPE.COMBOBOX:
            case YIUI.CONTROLTYPE.CHECKLISTBOX:
                def = $.Deferred();
                var form = YIUI.FormStack.getForm(this.ofFormID);

                if(meta.sourceType == YIUI.COMBOBOX_SOURCETYPE.QUERY){
                  caption = YIUI.TypeConvertor.toString(val);
                  def.resolve(caption);
                }else{
                  var cxt = new View.Context(form);
                  cxt.updateLocation(this.key,rowIndex,colIndex);

                  YIUI.ComboBoxHandler.getItems(form, meta, cxt)
                    .then(function(items){
                      var caption = YIUI.ComboBoxHandler.getShowCaption(meta.sourceType, items, val,
                        meta.cellType == YIUI.CONTROLTYPE.CHECKLISTBOX, meta.editable);
                      def.resolve(caption);
                    });
                }
                break;
            case YIUI.CONTROLTYPE.NUMBEREDITOR:
                if( cellData.byZero ) {
                    caption = '#DIV/0';
                } else {
                    var settings = YIUI.NumberEditorHandler.getSettings(meta);
                    caption = YIUI.DecimalFormat.format(val, settings);
                }
                break;
            case YIUI.CONTROLTYPE.TEXTEDITOR:
            case YIUI.CONTROLTYPE.TEXTAREA:;
            case YIUI.CONTROLTYPE.TEXTBUTTON:
                caption = val;
                break;
            case YIUI.CONTROLTYPE.DATEPICKER:
                caption = YIUI.DateFormat.format(val, meta.format, meta.onlyDate);
                break;
            case YIUI.CONTROLTYPE.UTCDATEPICKER:
                caption = YIUI.UTCDateFormat.formatCaption(val, meta.onlyDate);
                break;
            case YIUI.CONTROLTYPE.MONTHPICKER:
            	if(val != 0 && val != null){
            		caption = YIUI.TIMEFORMAT.monthPickerFormat(val + "");
            	}
                break;
            case YIUI.CONTROLTYPE.TIMEPICKER:
            	if(val != 0 && val != null) {
                caption = YIUI.TIMEFORMAT.timePickerFormat(meta.second,val + "");
              }
                break;
            default:
                caption = YIUI.TypeConvertor.toString(val);
        }
        return (def && def.promise()) || caption;
    },

    checkAndSet2: function(cellData, editOpt, rowIndex, colIndex, val, callback) {

        var typeDef = cellData.typeDef,meta;
        if( typeDef ) {
            meta = typeDef.editOptions;
        } else {
            meta = editOpt.editOptions;
        }

        var options = {
            oldVal: cellData[0],
            newVal: val
        };

        options = $.extend(options, meta);

        // 处理除0错误
        if( meta.cellType == YIUI.CONTROLTYPE.NUMBEREDITOR ) {
            cellData.byZero = val == '#DIV/0';
            options.byZero = cellData.byZero;
            if( cellData.byZero ) {
                cellData[1] = '#DIV/0';
            }
        }

        // 动态字典计算ItemKey
        if( meta.cellType == YIUI.CONTROLTYPE.DYNAMICDICT ) {
            var form = YIUI.FormStack.getForm(this.ofFormID);
            options.itemKey = YIUI.DictHandler.getItemKey(form,options.refKey,new View.UnitContext({
                gridKey: this.key,
                row: rowIndex
            }));
        }

        var cellHandler = this.getBehavior(meta.cellType);

        return cellHandler.checkAndSet(options, callback);
    },

    getBehavior: function (cellType) {
        var cellHandler = null;
        switch (cellType) {
            case YIUI.CONTROLTYPE.DICT:
            case YIUI.CONTROLTYPE.DYNAMICDICT:
                cellHandler = YIUI.DictBehavior;
                break;
            case YIUI.CONTROLTYPE.NUMBEREDITOR:
                cellHandler = YIUI.NumberEditorBehavior;
                break;
            case YIUI.CONTROLTYPE.TEXTEDITOR:
            case YIUI.CONTROLTYPE.TEXTBUTTON:
                cellHandler = YIUI.TextEditorBehavior;
                break;
            case YIUI.CONTROLTYPE.COMBOBOX:
                cellHandler = YIUI.ComboBoxBehavior;
                break;
            case YIUI.CONTROLTYPE.CHECKLISTBOX:
                cellHandler = YIUI.CheckListBoxBehavior;
                break;
            case YIUI.CONTROLTYPE.DATEPICKER:
                cellHandler = YIUI.DatePickerBehavior;
                break;
            case YIUI.CONTROLTYPE.UTCDATEPICKER:
                cellHandler = YIUI.UTCDatePickerBehavior;
                break;
            case YIUI.CONTROLTYPE.CHECKBOX:
                cellHandler = YIUI.CheckBoxBehavior;
                break;
            case YIUI.CONTROLTYPE.TEXTAREA:
                cellHandler = YIUI.TextAreaBehavior;
                break;
            case YIUI.CONTROLTYPE.MONTHPICKER:
                cellHandler = YIUI.MonthPickerBehavior;
                break;
            case YIUI.CONTROLTYPE.TIMEPICKER:
                cellHandler = YIUI.TimePickerBehavior;
                break;
            case YIUI.CONTROLTYPE.UPLOADBUTTON:
            	cellHandler = YIUI.UploadButtonBehavior;
            	break;
            default:
                cellHandler = YIUI.BaseBehavior;
        }
        return cellHandler;
    },

    setSingleSelect: function (singleSelect) {
        this.singleSelect = singleSelect;
        this.el && this.el[0].setSelectAllVisible(singleSelect);
    },

    doSelect:function (rowIndex,colIndex,value,shiftDown) {
        var self = this,
            rowData = self.getRowDataAt(rowIndex);
        if( rowData.rowType === 'Detail' && shiftDown && !self.singleSelect ) {
            var model = self.el[0].p.selectModel,
                start = model.top,end = model.bottom + 1;
            self.gridHandler.selectRange(self,start,end,colIndex,value);
        } else {
            self.setValueAt(rowIndex, colIndex, value, true, true);
        }
    },

    alwaysShowCellEditor: function (cell, ri, ci) {
        var editor,
            _this = this,
            grid = _this.getControlGrid(),
            rowData = grid.getRowDataAt(ri),
            cellData = rowData.data[ci],
            enable = cellData[2],
            rowHeight = rowData.rowHeight,
            editOpt = _this.getCellEditOpt(ri, ci);

        var value = cellData[0],
            caption = cellData[1],
            enable = cellData[2];

        var opt = $.extend({},editOpt.editOptions);
        opt.rowID = rowData.rowID;

        cell.html("");
        cell[0].style.height = rowHeight + "px";//兼容FireFox,IE
        cell.attr("title", value);

        var hitTest = function (editor) {
            var tr = editor.parents("tr");
            return parseInt($.ygrid.stripPref($.ygrid.uidPref, tr[0].id), 10);
        }

        var typeDef = cellData.typeDef,meta;
        if( typeDef ) {
            meta = typeDef.editOptions;
        } else {
            meta = editOpt.editOptions;
        }

        switch (meta.cellType) {
            case YIUI.CONTROLTYPE.BUTTON:
       
                editor = $("<div class='ui-btn button cellEditor'><button style='text-align: inherit'><span class='txt button'>" + caption + "</span></button></div>");
                
                if (opt.icon) {
                	var icon = $("<span class='icon button'></span>").prependTo($('button', editor));
                	grid.getImageBase64URL(opt.icon).then(function(url) {
                		icon.css('background-image', 'url('+ url + ')');
                	});
                }
                
                editor[0].enable = enable;
                // 兼容IE
                if( $.browser.isIE && editOpt.key && editOpt.key.toLowerCase().indexOf('upload') != -1 ) {
                    $("<input type='file' class='upload' name='file'/>").appendTo(editor);
                }
                editor.appendTo(cell);
                editor.mousedown(function (e) {
                    e.target.enable && $(this).addClass("hover");
                }).mouseup(function (e) {
                    e.target.enable && $(this).removeClass("hover");
                });

                // delegate!!
                editor.delegate("button,input.upload","click",function (e) {
                    var target = e.target;
                    if ( !$(target).closest(".cellEditor")[0].enable ) {
                        e.stopPropagation();
                        return false;
                    }
                    if( $(target).hasClass('upload') ) {
                        window.up_target = target;
                    }
                    grid.gridHandler.doOnCellClick(grid, hitTest(editor), ci);
                    e.stopPropagation();
                });
                break;
            case YIUI.CONTROLTYPE.HYPERLINK:
                var editor = $("<a class='ui-hlk cellEditor'>" + caption + "</a>");
                editor[0].enable = enable;

                var showTarget = YIUI.Hyperlink_TargetType.Str_NewTab;
                switch (opt.targetType) {
                    case YIUI.Hyperlink_TargetType.Current:
                        showTarget = YIUI.Hyperlink_TargetType.Str_Current;
                    case YIUI.Hyperlink_TargetType.NewTab:
                        if (opt.url != null && opt.url.length > 0) {
                            editor.attr("href", opt.url);
                        }
                        editor.attr("target", YIUI.Hyperlink_target[showTarget]);
                        break;
                }
                editor.mousedown(function (e) {
                    e.delegateTarget.enable && $(this).addClass("hover");
                }).mouseup(function (e) {
                    e.delegateTarget.enable && $(this).removeClass("hover");
                });
                editor.click(function (e) {
                    if ( !this.enable ) {
                        e.stopPropagation();
                        return false;
                    }
                    var url = null;
                    if (opt.url){
                        url = opt.url;
                    }else{
                        var form = YIUI.FormStack.getForm(grid.ofFormID);
                        var cxt = new View.Context(form);
                        url = form.eval(opt.formulaURL, cxt, null);
                    }
                    if (url) {
                        if( opt.targetShowType == YIUI.Hyperlink_TargetType.New ) {
                            window.open(url, YIUI.Hyperlink_target.New, "alwaysRaised=yes");
                        }else if (!opt.targetShowType || opt.targetShowType == YIUI.Hyperlink_TargetType.NewTab){
                            window.open(url);
                        }else if (opt.targetShowType == YIUI.Hyperlink_TargetType.Current){
                            window.open(url, YIUI.Hyperlink_target.Current);
                        }
                    } else{
                        grid.gridHandler.doOnCellClick(grid, hitTest(editor), ci);
                    }
                    e.stopPropagation();
                });
                editor.appendTo(cell);
                break;
            case YIUI.CONTROLTYPE.CHECKBOX:
                var editor = $("<span class='cellEditor chk'/>");
                if( YIUI.TypeConvertor.toBoolean(value) ) {
                    editor.addClass('checked');
                }
                editor.attr('enable',enable);
                cell.prepend(editor);

                editor.click(function (e) {
                    if( $(this).attr('enable') === 'true' ) {
                        var grid = _this.getControlGrid(),
                            v = !$(this).hasClass('checked'),
                            rowIndex = hitTest(editor);

                        grid.doSelect(rowIndex,ci,v,e.shiftKey);
                    }
                });
                break;
            case YIUI.CONTROLTYPE.TEXTAREA:
                opt.enable = enable;
                opt.value  = value;
                opt.selectOnFocus = false;
                var cellTextArea = new YIUI.CellEditor.CellTextArea(opt);
                cellTextArea.render(cell);
                var editor = cellTextArea.getEl();
                var rowIndex = hitTest(editor), value = editor.val(), grid = _this.getControlGrid();
                cellTextArea.saveCell =  function(value){
                    grid.doSelect(rowIndex, ci, value, false);
                };
                cell.addClass("ui-edit-cell");
                cellTextArea.install();
                break;
            case YIUI.CONTROLTYPE.IMAGE:
                opt.ofFormID = grid.ofFormID;
                opt.ofFormKey = grid.ofFormKey;
                opt.enable = enable;
                opt.value = value;
                opt.getImageURL = grid.getImageURL;
                opt.getImageBase64URL = grid.getImageBase64URL;
                editor = new YIUI.CellEditor.CellImage(opt);
                editor.render(cell);
                editor.setEnable(enable);
                editor.saveCell = function (value) {
                    _this.getControlGrid().setValueAt(hitTest(editor.getEl()), ci, value, true, true);
                };
                editor.yesCom.click = function () {
                    if(this.enable) {
                        grid.gridHandler.doOnCellClick(grid, hitTest(editor.getEl()), ci);
                    }
                }
                cell[0].editor = editor;
                break;
            case YIUI.CONTROLTYPE.LABEL:
                editor = $("<div class='cellEditor'>" + caption + "</div>");
                editor[0].enable = enable;
                editor.appendTo(cell);
                break;
            case YIUI.CONTROLTYPE.ICON:
            	opt.ofFormID = grid.ofFormID;
                opt.ofFormKey = grid.ofFormKey;
                opt.enable = enable;
                opt.value = value;
                opt.getImageURL = grid.getImageURL;
                opt.getImageBase64URL = grid.getImageBase64URL;
                editor = new YIUI.CellEditor.CellIcon(opt);
                editor.render(cell);
                editor.setEnable(enable);
                cell[0].editor = editor;
            	break;
            case YIUI.CONTROLTYPE.IMAGELIST:
            	opt.ofFormID = grid.ofFormID;
                opt.ofFormKey = grid.ofFormKey;
                opt.enable = enable;
                opt.value = value;
                opt.getImageURL = grid.getImageURL;
                opt.getImageBase64URL = grid.getImageBase64URL;
                editor = new YIUI.CellEditor.CellImageList(opt);
                editor.render(cell);
                editor.setEnable(enable);
                editor.yesCom.click = function () {
                    if(this.enable) {
                        grid.gridHandler.doOnCellClick(grid, hitTest(editor.getEl()), ci);
                    }
                }
                cell[0].editor = editor;
                break;
            case YIUI.CONTROLTYPE.UPLOADBUTTON:
            	opt.ofFormID = grid.ofFormID;
                opt.ofFormKey = grid.ofFormKey;
                opt.enable = enable;
                opt.value = value;
                opt.tableKey = grid.tableKey;
                opt.rowIndex = ri;
                editor = new YIUI.CellEditor.CellUploadButton(opt);
                editor.render(cell);
                editor.setEnable(enable);
                editor.yesCom.finishedEvent = function () {
                	var editOpt = grid.getCellEditOpt(ri,ci);
                    if (editOpt.editOptions.FinishedEvent) {
                        var form = YIUI.FormStack.getForm(grid.ofFormID);
                        var cxt = new View.Context(form);
                        cxt.updateLocation(grid.key,ri,ci);
                        form.eval($.trim(editOpt.editOptions.FinishedEvent), cxt, null);
                    }
                }
                
                editor.getEl().mousedown(function (e) {
                    e.target.enable && $(this).addClass("hover");
                }).mouseup(function (e) {
                    e.target.enable && $(this).removeClass("hover");
                });
                
	            editor.getEl().delegate("input.upload", "click",function (e) {
	                var target = e.target;
	                if ( !$(target).closest(".cellEditor")[0].enable ) {
	                    e.stopPropagation();
	                    return false;
	                }
	                if( $(target).hasClass('upload') ) {
	                    window.up_target = target;
	                }
	                e.stopPropagation();
	            });
                
                cell[0].editor = editor;
                break;
        }
    },

    gotoPage: function (page) {
        return this.gridHandler.doGoToPage(this, page - 1 ,true);
    },

    // 滚动分页:rowNum=50,非滚动分页:显示全部,rowNum无用
    initPageOpts: function () {
        if( this.getMetaObj().pageLoadType != YIUI.PageLoadType.NONE ) {
            var form = YIUI.FormStack.getForm(this.ofFormID),count;
            if (this.getMetaObj().pageLoadType == YIUI.PageLoadType.DB) {
                count = YIUI.TotalRowCountUtil.getRowCount(form.getDocument(), this.tableKey);
            } else {
                count = form.getDocument().getByKey(this.tableKey).size();
            }
            this.pageInfo.totalRowCount = count;
            this.pageInfo.calcPage();
        } else {
            this.pageInfo.totalRowCount = this.dataModel.data.length;
        }
    },

    // 配置合并
    mergeCell: function () {
        this.mergeCell2(this.mergeCellKeys);
    },

    // 函数合并
    mergeCell2: function (cellKeys,groupKeys) {
        YIUI.GridCellMerger.mergeCell(this,cellKeys,groupKeys);
        this.el && this.el[0].mergeCell();
    },

    rowOptFunc: function (cmd) {
        var self = this,
            grid = self.getControlGrid(),
            focusRow = grid.getFocusRowIndex();
        switch ( cmd ) {
        case "add":
            grid.insertRow(focusRow,true);
            break;
        case "del":
            grid.deleteRow(-1,true);
            break;
        case "upRow":
            grid.gridHandler.doShiftUpRow(grid, focusRow);
            break;
        case "downRow":
            grid.gridHandler.doShiftDownRow(grid, focusRow);
            break;
        }
    },

    onSortClick: function (ci, sortType) {
        this.gridHandler.doOnSortClick(this, ci, sortType);
    },

    //行点击事件
    clickRow:function (newRowIndex) {
        var grid = this.getControlGrid();
        grid.gridHandler.doOnRowClick(grid, newRowIndex);
    },

    //行切换事件
    focusRowChanged:function (newRowIndex, oldRowIndex) {
        var grid = this.getControlGrid();
        grid.gridHandler.rowChange(grid, newRowIndex, oldRowIndex);
    },

    // 行双击事件
    dblClickRow: function (rowIndex) {
        var grid = this.getControlGrid();
        grid.gridHandler.doOnRowDblClick(grid, rowIndex);
    },

    // 单元格双击事件
    dblClickCell: function (rowIndex, colIndex) {
        var grid = this.getControlGrid();
        grid.gridHandler.doOnCellDblClick(grid, rowIndex, colIndex);
    },

    getFocusRowIndex: function () {
        if(this.el){
            return this.el.getFocusRowIndex();
        }
        return -1;
    },
    getFocusColIndex: function () {
        if(this.el){
            return  this.el.getFocusColIndex();
        }

        return -1;
    },

    getGroupIndex: function (groupKey) {
        return this.groupCells.indexOf(groupKey);
    },

    getControlGrid: function () {
        return this;
    },

    //初始化表格构建相关的属性
    initOptions: function () {
        var metaObj = this.getMetaObj(); // 返回已经初始化的字典元数据

        this.options = {
            //populate: false,
            selectionMode: metaObj.selectionMode,
            treeIndex: this.treeIndex,
            treeExpand: this.treeExpand,
            rowExpandIndex: this.rowExpandIndex,
            rowSequences: this.showRowHead,
            // enable: metaObj.editable,
            colModel: this.dataModel.colModel.columns, // 返回列定义信息
            // data: this.dataModel.data,
            navButtons: {
                addIcon: "ui-icon-plus", addFunc: this.rowOptFunc,
                delIcon: "ui-icon-trash", delFunc: this.rowOptFunc,
                upRowIcon: "ui-icon-up", upRowFunc: this.rowOptFunc,
                downRowIcon: "ui-icon-down", downRowFunc: this.rowOptFunc,
                bestWidthIcon:"ui-icon-bestwidth",
                frozenRowIcon:"ui-icon-frozenRow",
                frozenColumnIcon:"ui-icon-frozenColumn",
                extOptIcon: "ui-icon-extOpt"
            },
            opts: this.opts,
            extOpts: this.extOpts,
            createCellEditor: this.createCellEditor2, // 创建控件处理器
            // endCheck: this.endCheck,
            alwaysShowCellEditor: this.alwaysShowCellEditor,
            // afterEndCellEditor: this.afterEndCellEditor,
            //extKeyDownEvent: this.extKeyDownEvent,
            onSortClick: this.onSortClick,
            clickRow: this.clickRow,
            focusRowChanged: this.focusRowChanged,
            dblClickRow: this.dblClickRow,
            dblClickCell: this.dblClickCell,
            getControlGrid: this.getControlGrid,
            pageInfo: this.pageInfo,
            gotoPage: this.gotoPage,
            rowNumChange: this.rowNumChange,
            rowList: this.rowList,
            freezeRowCnt: metaObj.freezeRowCnt,
            freezeColCnt: metaObj.freezeColCnt,
            selectFieldIndex: this.selectFieldIndex,
            scrollPage: this.hasDetailRow && !this.hasTree && metaObj.pageLoadType == YIUI.PageLoadType.NONE // 树形表格scrollPage = false,否则rowNum=50 只显示50
        };
    },

    setGroupHeaders:function (groupHeaders) {
        this.groupHeaders = groupHeaders;
    },

    onRender: function (parent) { // 渲染表格，parent是父节点
        var self = this;
        this.base(parent);
        var $t = this.el[0];
        $t.getControlGrid = function () {
            return self;
        };
        // 初始化显示参数
        this.initOptions();
        
        if (!this.user_style) { // Create user style object
            this.user_style = new heelWeb.component.grid.user_style(this);
        }

        if (this.ex_options().allow_user_style()) { // 自定义样式?
            this.user_style.apply(); 
        }

        /**
         * 显示表格结构，但不包括数据
         * this.options.colModel, 所有表格列显示定义
         */
        this.el.yGrid(this.options); 
        // 绑定数据集
        $t.p.data = this.dataModel.data;
        // 表列头
        this.el.buildGroupHeaders(this.groupHeaders);
        // 显示数据集
        $t.populate();
        $t.mergeCell();
        // 刷新全选记录
        this.refreshSelectAll();
        this.options = null;

        if (this.ex_options().allow_user_style()) { // 自定义样式?
            this.user_style.install(); 

            // 确保表格只读
            setTimeout(() =>{
                this.setEnable(false); 
            }, 100);
        }
    },

    beforeDestroy: function () {
        this.dataModel = null;
        this.groupHeaders = null;
        this.el && this.el.GridDestroy();
    },

    ex_options: function() { // 额外开关
        return {
            options: typeof this.cssClass == 'string' ? this.cssClass : '',
            allow_user_style: function() {
                return this.options.indexOf('allow-user-style') == -1 ? false : true;
            }
        };
    }
});

/**
 * guojs
 * Grid控件的功能扩展
 */
YIUI.Control.Grid = YIUI.extend(YIUI.Control.Grid, {   //纯web使用的一些方法
    rowIDMask: 0,
    randID: function () {
        return "#row" + this.rowIDMask++;
    },

    setEnable: function (enable) { // Grid的可用性设置        
        if (this.ex_options().allow_user_style()) { // 打开自定义开关，Grid只读
            enable = false;
        }

        this.base(enable);

        var el = this.el;
        if( el ) {
            var $t = this.el[0];
           // $t.p.enable = enable;
            if( enable ) {
                $t.unFrozen();
            } else {
                $t.doFrozen();
            }
            el.prop("disabled",false);
        }

        if (this.condition && this.getRowCount() > 0) {
            return this.refreshOpt();
        }

        if( this.hasTree || this.hasRowExpand ) {
            return this.refreshOpt();
        }

        if( enable ) {
            if( this.hasGroupRow && this.hideGroup4Editing ) {
                var data = this.dataModel.data,row;
                for( var i = data.length - 1; row = data[i]; i-- ) {
                    if( row.rowType == 'Group' ) {
                        data.splice(i,1);
                        this.el && this.el[0].deleteGridRow(i);
                    }
                }
            }
            if( this.hasDetailRow && this.newEmptyRow ) {
                if( this.isSubDetail ) {
                    var form = YIUI.FormStack.getForm(this.ofFormID),
                        par = YIUI.SubDetailUtil.getBindingGrid(form,this),
                        focusRow = par.getFocusRowIndex();
                    if( $.isNumeric(focusRow) && focusRow != -1 ) {
                        this.appendAutoRowAndGroup();
                    }
                } else {
                    this.appendAutoRowAndGroup();
                }
            }
        } else {
            this.removeAutoRowAndGroup();
        }

        this.refreshOpt();
    },

    // refreshGrid  在计算所有列的时候不调用
    setColumnVisible: function (index, visible, refreshGrid) {

        var column = this.dataModel.colModel.columns[index],
            changed = (column.hidden == visible);

        column.hidden = !visible;

        if ( refreshGrid ) {
            this.refreshGrid();
        }
        return changed;
    },
    // 非拓展单元格使用
    setValueByKey: function (rowIndex, cellKey, newValue, commitValue, fireEvent) {
        var form = YIUI.FormStack.getForm(this.ofFormID),
            loc = form.getCellLocation(cellKey);
        this.setValueAt(rowIndex,loc.column,newValue,commitValue,fireEvent);
    },
    setCellBackColor: function (rowIndex, colIndex, color) {
        var cellData = this.getCellDataAt(rowIndex,colIndex);
        cellData.backColor = color;

        if( !this.el )
            return;
        this.el.setCellBackColor(rowIndex, colIndex, color);
    },
    setCellForeColor: function (rowIndex, colIndex, color) {
        var cellData = this.getCellDataAt(rowIndex,colIndex);
        cellData.foreColor = color;

        if( !this.el )
            return;
        this.el.setCellForeColor(rowIndex, colIndex, color);
    },
    setFocusCell: function (rowIndex, colIndex) {
        if( !this.el )
            return;
        this.el.setCellFocus(rowIndex, colIndex);
    },

    setCaptionAt: function (rowIndex, colIndex, caption) {
        var cellData = this.getCellDataAt(rowIndex,colIndex);
        cellData[1] = caption;
    },

    // cellData, editOpt 两个参数主要是为了加载的时候不重复取值
    setValueAt: function (rowIndex, colIndex, newValue, commitValue, fireEvent, ignoreChanged, cellData, editOpt) {
        if (rowIndex == undefined || rowIndex < 0 || rowIndex > this.dataModel.data.length) return;

        var _this = this;

        var editOpt = editOpt || _this.getCellEditOpt(rowIndex,colIndex);

        var rowData = _this.getRowDataAt(rowIndex);

        var cellData = cellData || rowData.data[colIndex];

        var isChanged = _this.checkAndSet2(cellData, editOpt, rowIndex, colIndex, newValue,
            function(val) {

                cellData[0] = val;

                //显示单元格内容，为异步处理,这个异步 导致 表格连续插行设置不能在第一行之前插,
                //应该一直从最后插

               var fn = function(text) {

                     // 异步设值的情况下可能当前界面已经不存在,saveData();close()
                    if( _this.isDestroyed ) {
                       return;
                    }          

                    var rows = _this.dataModel.data;

                    // rowIndex在异步的情况下可能会变化,绑定rowData
                    // 根据rowData获取rowIndex
                    var rowIndex = rows.indexOf(rowData);
                    if(rowIndex >= rows.length || rowIndex == -1){
                       return;
                    }
                    
                    var cells = rows[rowIndex].data;
                    if(colIndex >= cells.length){
                       return;
                    }

                     // 值已改变,本次标题无效
                    if( cellData[0] != val ) {
                       return;
                    }

                    if(cellData == cells[colIndex]){
                       cellData[1] = text;

                       if(!_this.el){
                         return ;
                       }

                       _this.el.updateCell(rowIndex, colIndex, cellData);
                       _this.el.updateRowBackColor(_this, rowIndex, colIndex);
                    }
               };

               // 可能是promise对象或者caption
               var o = _this.endCheck2(cellData, editOpt, rowIndex, colIndex, val);

               typeof o === 'object' ? o.done(fn) : fn(o);
            });

        if( isChanged && !ignoreChanged ) {
            var form = YIUI.FormStack.getForm(_this.ofFormID),
                handler = _this.gridHandler;

            // 1.单选,清除其他字段,多选,检查全选
            if( colIndex == _this.selectFieldIndex ) {

                // 单选检查
                if( _this.singleSelect ) {
                    handler.selectSingle(_this, rowIndex, colIndex, cellData[0]);
                }

                // 选中当前行
                if ( rowData.rowType === 'Detail' ) {
                    handler.selectRow(form, _this, rowIndex, colIndex, cellData[0]);
                }

                // 检查全选
                if( !_this.singleSelect ) {
                    _this.refreshSelectAll();
                }
            }

            // 提交值,同时设置影子表数据
            if (commitValue) {
                handler.setCellValueToDocument(form, _this, rowIndex, colIndex, cellData[0]);
            }

            form.getViewDataMonitor().preFireCellValueChanged(_this, rowIndex, colIndex, editOpt.key);

            if (fireEvent) {
                handler.fireEvent(form, _this, rowIndex, colIndex);
            }

            form.getViewDataMonitor().postFireCellValueChanged(_this, rowIndex, colIndex, editOpt.key);
        } else {
            this.el && _this.el.updateCell(rowIndex, colIndex, cellData);
        }
        return isChanged;
    },

    /**
     * 统一使用此方法获取单元格配置对象
     */
    getCellEditOpt: function (rowIndex,colIndex) {
        var row = this.dataModel.data[rowIndex];

        return this.getMetaObj().rows[row.metaRowIndex].cells[colIndex];
    },

    getMetaCellByColumnKey: function (columnKey) {
        var detailRow = this.getDetailMetaRow();
        if( !detailRow ) {
            return null;
        }
        var metaCell,
            _columnKey;
        for( var i = 0,size = detailRow.cells.length;i < size;i++ ) {
            metaCell = detailRow.cells[i];
            _columnKey = metaCell.columnKey;
            if( _columnKey && _columnKey == columnKey ) {
                return metaCell;
            }
        }
        return null;
    },

    // 非拓展时使用
    getValueByKey: function (rowIndex, cellKey) {
        var form = YIUI.FormStack.getForm(this.ofFormID),
            loc = form.getCellLocation(cellKey);
        return this.getValueAt(rowIndex, loc.column);
    },

    // 统一取值公式
    getValueAt: function (rowIndex, colIndex) {
        if( rowIndex == -1 || colIndex == -1 ) {
            return null;
        }
        return this.dataModel.data[rowIndex].data[colIndex][0];
    },

    /**
     *  提供给函数等外部使用使用的插行方法,插入空白行以及树形行
     * @param rowIndex 插行的位置
     */
    insertRow:function (rowIndex,fireEvent) {
        if( !this.impl_insertRow ) {
            if( this.treeIndex == -1 ) {
                this.impl_insertRow = function (rowIndex,fireEvent) {
                    var detailRow,level;

                    var row = this.getRowDataAt(rowIndex);
                    if( row && row.rowType == 'Detail' ) {
                        detailRow = this.getMetaObj().rows[row.metaRowIndex]; // 多区域
                        level = row.rowGroupLevel;
                    } else {
                        detailRow = this.getDetailMetaRow();
                        level = 0;
                    }

                    if( !detailRow ) {
                        return -1;
                    }

                    // 去掉当前行样式
                    if( this.el ) {
                        this.el[0].unselectGridRow(rowIndex);
                    }

                    var ri = this.addGridRow(rowIndex,detailRow,null,level,fireEvent);

                    if( !this.el ) return ri;

                    // 如果有焦点列,设置焦点
                    var ci = this.getFocusColIndex();
                    if( ci >= 0 ) {
                        this.el.setCellFocus(ri,ci);
                    }
                    return ri;
                }
            } else { // 不添加根节点,只添加子节点,且树的类型是主外键关系
                this.impl_insertRow = function (rowIndex,fireEvent) {
                    var detailRow = this.getDetailMetaRow();
                    if( !detailRow )
                        return -1;

                    if( rowIndex < 0 || rowIndex >= this.getRowCount() ) {
                        return -1;
                    }

                    var row = this.getRowDataAt(rowIndex),
                        index = rowIndex + 1;

                    // 去掉当前行样式
                    if( this.el ) {
                        this.el[0].unselectGridRow(rowIndex);
                    }

                    var ri = this.addGridRow(index,detailRow,null,0,fireEvent,{
                        treeLevel: ++row.treeLevel,
                        isLeaf: true,
                        parentRow: row
                    });

                    var newRow = this.getRowDataAt(ri);

                    if( !row.childRows ) {
                        row.childRows = [];
                        row.treeExpand = true; // 打开的状态
                    }
                    row.childRows.push(newRow.rowID);
                    row.isLeaf = false;

                    if( !this.el ) return ri;

                    // 如果有焦点列,设置焦点
                    var ci = this.getFocusColIndex();
                    if( ci >= 0 ) {
                        this.el.setCellFocus(ri,ci);
                    }
                    return ri;
                }
            }
        }
        return this.impl_insertRow(rowIndex,fireEvent);
    },

    /**
     * 新增表格行,底层插行方法
     */
    addGridRow: function (rowIndex, metaRow, bookmarkRow, groupLevel, fireEvent, treeInfo) {
        rowIndex = parseInt(rowIndex, 10);

        var rowData = YIUI.GridUtil.initRowData(this, metaRow, bookmarkRow, groupLevel, treeInfo);

        var data = this.dataModel.data,
            index;
        if (rowIndex >= 0) {
            index = rowIndex;
            data.splice(rowIndex, 0, rowData);
        } else {
            index = data.length;
            data.push(rowData);
        }

        // 加载整个表格的时候不需要及时插入界面行,否则在数据量多的时候会卡
        if( fireEvent && this.el ) {
            this.el[0].insertGridRow(index, rowData, fireEvent);
        }

        this.gridHandler.rowInsert(this, index, fireEvent);

        return index;
    },

    refreshIndex: function (index) {
        var rowData,
            index = index != null ? index : 0,
            data = this.dataModel.data;
        for( var i = index;i < data.length;i++ ) {
            rowData = data[i];
            this.rowIDMap[rowData.rowID] = i;
        }
    },

    appendAutoRowAndGroup:function () {
        this.removeAutoRowAndGroup();
        // 添加空白行
        var rowData,emptyInsert,index;
        for( var i = this.getRowCount() - 1; i >= 0; --i ) {
            index = this.appendEmptyRow(i);
            if( !emptyInsert && index != -1 ) {
                emptyInsert = true;
            }
        }

        // 添加空白分组
        if( this.hasGroupRow && !this.hideGroup4Editing ) {
            this.appendEmptyGroup();
            emptyInsert = true;
        }

        // 如果没插入行,插入一行空白行
        if ( !emptyInsert ) {
            var rowIndex = this.getRowCount() - this.bottomFixRowCount;
            this.addGridRow(rowIndex,this.getDetailMetaRow(),null,0,true);
        }
    },

    appendEmptyRow:function (rowIndex) {
        var rowData = this.getRowDataAt(rowIndex),
            metaObj = this.getMetaObj(),
            metaRow = metaObj.rows[rowData.metaRowIndex];

        var nextIndex = rowIndex + 1,
            preIndex = rowIndex - 1;

        switch ( rowData.rowType ) {
            case "Detail":
                if( nextIndex < this.getRowCount() ) { // 1.非最后一行
                    var nextRow = this.getRowDataAt(nextIndex),
                        nextType = nextRow.rowType;
                    if( nextType === 'Group' || nextType === 'Total' || nextType === 'Fix' ) {
                        return this.addGridRow(nextIndex,this.getDetailMetaRow(),null,rowData.rowGroupLevel,true);
                    }
                } else {  // 2.最后一行
                    return this.addGridRow(nextIndex,this.getDetailMetaRow(),null,rowData.rowGroupLevel,true);
                }
                break;
            case "Fix":
                if( metaRow.isDetailHead ) { // 1.非最后一行
                    if( nextIndex < this.getRowCount() ) {
                        var nextRow = this.getRowDataAt(nextIndex);
                        if( nextRow.rowType !== 'Detail' ) {
                            return this.addGridRow(nextIndex,metaObj.rows[metaRow.detailIndex],null,rowData.rowGroupLevel,true);
                        }
                    } else { // 2.最后一行
                        return this.addGridRow(nextIndex,metaObj.rows[metaRow.detailIndex],null,rowData.rowGroupLevel,true);
                    }
                } else if ( metaRow.isDetailTail ) {
                    if( preIndex >= 0 ) {
                        var preRow = this.getRowDataAt(preIndex);
                        if( preRow.rowType !== 'Detail' ) {
                            return this.addGridRow(rowIndex,metaObj.rows[metaRow.detailIndex],null,rowData.rowGroupLevel,true);
                        }
                    } else {
                        return this.addGridRow(rowIndex,metaObj.rows[metaRow.detailIndex],null,rowData.rowGroupLevel,true);
                    }
                }
                break;
        }
        return -1;
    },

    appendEmptyGroup:function () {

        var _this = this,
            rows = _this.metaObj.rows,
            rowLayer = this.metaObj.rowLayer,
            areaIndex = rowLayer.areaIndex,
            rootGroup = rowLayer.objectArray[areaIndex].objectArray[0];

        // 静态私有方法
        var createNewGroup = function(groupLevel,groupRow){
            var rowObject;
            for( var i = 0,size = groupRow.objectArray.length; i < size;i++ ) {
                rowObject = groupRow.objectArray[i];
                if( rowObject.objectType === YIUI.MetaGridRowObjectType.ROW ) {
                    var metaRow = rows[rowObject.rowIndex];
                    if( metaRow.rowType === 'Detail' ) {
                        groupLevel++;
                    }
                    var rowIndex = _this.getRowCount() - _this.bottomFixRowCount;
                    var newRowIndex = _this.addGridRow(rowIndex,metaRow,null,groupLevel,true);
                    var rowData = _this.getRowDataAt(newRowIndex);
                    rowData.inAutoGroup = true;
                    if( metaRow.rowType === 'Detail' ) {
                        groupLevel--;
                    }
                } else {
                    groupLevel++;
                    createNewGroup(groupLevel,rowObject);
                    groupLevel--;
                }
            }
        }

        createNewGroup(0, rootGroup);
    },

    // 去除所有空白行以及空白分组
    removeAutoRowAndGroup: function () {
        var data = this.dataModel.data, row,
            form = YIUI.FormStack.getForm(this.ofFormID);
        for (var i = data.length - 1; row = data[i]; i--) {
            if ( row.inAutoGroup || YIUI.GridUtil.isEmptyRow(row) ) {
                this.deleteRowAt(form,i,false); // 移除空白行不需要更新相关信息
            }
        }
    },

    /**
     * 删除行,静默删除,只删除模型中的行以及界面上行
     * 不删除数据, 内部使用
     * @param rowIndex
     */
    deleteRowAt:function (form, rowIndex, fireEvent) {

        var lastRow = rowIndex == this.dataModel.data.length - 1;

        var rowData = this.getRowDataAt(rowIndex),
            parentRow = rowData.parentRow;

        // 删除模型行
        this.dataModel.data.splice(rowIndex, 1);

        // 从父行中移除
        if( parentRow ) {
            parentRow.childRows.splice(parentRow.childRows.indexOf(rowData.rowID),1);
        }

        // 从rowIDMap中移除
        delete this.rowIDMap[rowData.rowID];

        if( !this.el ){
            return;
        }

        // 焦点转移
        var ri = lastRow ? rowIndex - 1 : rowIndex,ci = this.getFocusColIndex();

        // 先清空选择模型
        this.el[0].cleanSelection();

        // 删除界面行
        this.el[0].deleteGridRow(rowIndex, fireEvent);

        // 再设置焦点,避免进入编辑状态
        if ( ri >= 0 && ci >= 0 ) {
            this.el.setCellFocus(ri,ci);
        }

        // 删除行事件
        this.gridHandler.rowDelete(form,this,rowIndex,fireEvent);
    },

    /**
     * 删除表格行
     * @param rowIndex
     */
    deleteRow: function (rowIndex,fireEvent) {
        rowIndex = parseInt(rowIndex, 10);

        var form = YIUI.FormStack.getForm(this.ofFormID);

        var isNeedDelete = function (grid,rowIndex) {

            if (rowIndex < 0 || rowIndex >= grid.getRowCount()) {
                return false;
            }

            // 非明细不删
            var row = grid.getRowDataAt(rowIndex);
            if (row.rowType !== 'Detail') {
                return false;
            }

            // 新增空行的情况下在编辑状态空白行判断
            if (grid.newEmptyRow && !row.bkmkRow && form.getOperationState() != YIUI.Form_OperationState.Default) {
                if (rowIndex == grid.getRowCount() - 1) {
                    return false;
                }
                if (grid.getRowDataAt(rowIndex + 1).rowType != "Detail") {
                    return false;
                }
            }
            return true;
        };

        var deleteDir = function (form,grid,rowIndex,rowData,fireEvent) {
            // 取出数据
            var bkmkRow = rowData.bkmkRow,bookmark;
            if( bkmkRow ) {
                if( bkmkRow.getRowType() === YIUI.IRowBkmk.Detail ) {
                    bookmark = bkmkRow.getBookmark();
                } else {
                    bookmark = bkmkRow.getRowArray();
                }

              // 删除影子表数据
              grid.tableKey && deleteShadowRow(form,grid,bookmark);

              // 删除子明细数据
              !grid.hasColumnExpand() && deleteSubDetailData(form,grid,bookmark);

              // 删除数据行
              grid.tableKey && deleteData(form,grid,bookmark);
            }

            // 删除界面行并转移焦点
            ts.deleteRowAt(form, rowIndex, fireEvent);
        };

        var deleteData = function (form,grid,bookmark) {
            if ( bookmark == undefined )
                return true;
            var dataTable = form.getDocument().getByKey(grid.tableKey);
            if ( $.isArray(bookmark) ) {
                for (var i = 0, len = bookmark.length; i < len; i++) {
                    dataTable.setByBkmk(bookmark[i].getBookmark());
                    dataTable.delRow();
                }
            } else {
                dataTable.setByBkmk(bookmark);
                dataTable.delRow();
            }
        }

        var deleteSubDetailData = function (form,grid,bookmark) {
            if ( bookmark == undefined )
                return;
            var delTblData = function (tbl) {
                var subTables = form.getDocument().getByParentKey(tbl.key),subTable;
                var OID = tbl.getByKey('OID'),POID;
                for( var i = 0,size = subTables.length;i < size;i++ ) {
                    subTable = subTables[i];
                    subTable.afterLast();
                    while ( subTable.previous() ) {
                        POID = subTable.getByKey('POID');
                        if ( (POID > 0 && OID === POID) || subTable.getParentBkmk() == tbl.getBkmk() ) {
                            delTblData(subTable);
                            subTable.delRow();
                        }
                    }
                }
            }
            var table = form.getDocument().getByKey(grid.tableKey);
            table.setByBkmk(bookmark);
            delTblData(table);
        }

        var deleteShadowRow = function (form,grid,bookmark) {
            var doc = form.getDocument(), dataTable = doc.getByKey(grid.tableKey);
            var shadowTbl = doc.getShadow(grid.tableKey);
            if( !shadowTbl )
                return;
            if( $.isArray(bookmark) ) {
                for( var i = 0,size = bookmark.length;i < size;i++ ) {
                    dataTable.setByBkmk(bookmark[i]);
                    var bookmark = YIUI.ViewUtil.findShadowBkmk(doc,grid.tableKey);
                    if( bookmark != -1 ) {
                        shadowTbl.setByBkmk(bookmark);
                        shadowTbl.setState(DataDef.R_New);// 置为新增状态,直接删除
                        shadowTbl.delRow();
                    }
                }
            } else {
                dataTable.setByBkmk(bookmark);
                var bookmark = YIUI.ViewUtil.findShadowBkmk(doc,grid.tableKey);
                if( bookmark != -1 ) {
                    shadowTbl.setByBkmk(bookmark);
                    shadowTbl.setState(DataDef.R_New);// 置为新增状态,直接删除
                    shadowTbl.delRow();
                }
            }
        }

        var deleteTreeRow = function (form,grid,rowIndex,rowData,fireEvent) {
            var childRows = rowData.childRows, _child,idx;
            for( var i = childRows.length - 1;i >=0;i-- ) {
                idx = grid.getRowIndexByID(childRows[i]);
                _child = grid.getRowDataAt(idx);
                if( !_child.isLeaf && _child.childRows ) {
                    deleteTreeRow(form,grid,idx,_child,fireEvent);
                } else {
                    deleteDir(form,grid,idx,_child,fireEvent);
                }
            }
            deleteDir(form,grid,rowIndex,rowData,fireEvent);
        }

        var ts = this;

        // 批量删除
        if( rowIndex == -1 && this.selectFieldIndex != -1 ) {
            var indexes = [], v, rowData;
            for( var i = this.getRowCount() - 1;i >= 0; --i ) {
                v = this.getValueAt(i, this.selectFieldIndex);
                if( YIUI.TypeConvertor.toBoolean(v) && isNeedDelete(this,i) ) {
                    indexes.push(i);
                }
            }
            if( indexes.length > 0 ) {
                var options = {
                    msg: YIUI.I18N.getString("GRID_WHETHERALL","确定删除所有选中行?"),
                    msgType: YIUI.Dialog_MsgType.YES_NO
                };
                var dialog = new YIUI.Control.Dialog(options);
                dialog.render();
                dialog.regEvent(YIUI.Dialog_Btn.STR_YES, function () {
                    for( var i = 0,length = indexes.length;i < length;i++ ) {
                        rowData = ts.getRowDataAt(indexes[i]);
                        deleteDir(form,ts,indexes[i],rowData,fireEvent);
                    }
                });
            }
            return true;
        }

        if( rowIndex == -1 ) {
            rowIndex = this.getFocusRowIndex();
        }

        if( rowIndex == -1 ) {
            return;
        }

        if (!isNeedDelete(this,rowIndex)) {
            return false;
        }

        var rowData = this.dataModel.data[rowIndex];
        if ( !YIUI.GridUtil.isEmptyRow(rowData) ) {
            if( form.getDocument().getByParentKey(this.tableKey).length > 0 && fireEvent ) {
                var options = {
                    msg: YIUI.I18N.getString("GRID_WHETHEREMPTY","确定删除当前行及其子数据?"),
                    msgType: YIUI.Dialog_MsgType.YES_NO
                };
                var dialog = new YIUI.Control.Dialog(options);
                dialog.render();
                dialog.regEvent(YIUI.Dialog_Btn.STR_YES, function () {
                    deleteDir(form,ts,rowIndex,rowData,fireEvent);
                });
            } else if ( ts.treeIndex != -1 && rowData.childRows ) {
                var options = {
                    msg: YIUI.I18N.getString("GRID_WHETHEREMPTY","确定删除当前行及其子数据?"),
                    msgType: YIUI.Dialog_MsgType.YES_NO
                };
                var dialog = new YIUI.Control.Dialog(options);
                dialog.render();
                dialog.regEvent(YIUI.Dialog_Btn.STR_YES, function () {
                    deleteTreeRow(form,ts,rowIndex,rowData,fireEvent);
                });
            } else {
                deleteDir(form,ts,rowIndex,rowData,fireEvent);
            }
        } else {
            deleteDir(form,ts,rowIndex,rowData,fireEvent);
        }
        return true;
    },

    // 对外使用此方法,同时判断列拓展和单元格拓展
    hasColumnExpand: function () {
        return this.hasColExpand || this.hasCellExpand;
    },
    getRowIndexByID: function (rowID) {
        return this.rowIDMap[rowID];
    },
    getRowDataAt: function (rowIndex) {
        return this.dataModel.data[rowIndex];
    },
    getCellDataAt: function (rowIndex, colIndex) {
        return this.dataModel.data[rowIndex].data[colIndex];
    },
    setColumnEnable: function (colIndex, enable) {
        this.dataModel.colModel.columns[colIndex].editable = enable;
    },
    // 获取界面列
    getColumnAt: function (colIndex) {
        return this.dataModel.colModel.columns[colIndex];
    },
    // 获取配置子叶列
    getMetaColumnAt: function (colIndex) {
        return this.metaObj.leafColumns[colIndex];
    },

    // 设置单元格可用
    setCellEnable: function (rowIndex, colIndex, enable) {
        if (this.ex_options().allow_user_style()) { // 打开自定义开关，Grid只读
            enable = false;
        }

        var editOpt = this.getCellEditOpt(rowIndex, colIndex);
        if ( !editOpt || editOpt.edittype == "label" )
            return;

        this.dataModel.data[rowIndex].data[colIndex][2] = enable;

        if( !this.el )
            return;

        this.el.setCellEnable(rowIndex, colIndex, enable);
    },

    // 设置单元格必填
    setCellRequired: function (rowIndex, cellIndex, isRequired) {
        var cellData = this.getCellDataAt(rowIndex, cellIndex);
        cellData[3] = isRequired;
        if( !this.el )
            return;
        this.el.setCellRequired(rowIndex, cellIndex, isRequired);
    },

    // 设置单元格错误
    setCellError: function (rowIndex, colIndex, error, errorMsg) {
        var cellData = this.getCellDataAt(rowIndex,colIndex);
        cellData[4] = error;
        cellData[5] = errorMsg;
        if( !this.el )
            return;
        this.el.setCellError(rowIndex, colIndex, error, errorMsg);
    },

    // 设置行背景色
    setRowBackColor: function (rowIndex,backColor) {
      if( !this.el )
        return;
      this.el.setRowBackColor(this, rowIndex, backColor);
    },

    // 设置行错误
    setRowError: function (rowIndex,error,errorMsg,errorSource) {
        var rowData = this.getRowDataAt(rowIndex);
        var source = errorSource || rowData.key;
        if( error ) {
            rowData.error[source] = errorMsg;
        } else {
            delete rowData.error[source];
        }

        if( !this.el )
            return;
        this.el.setRowError(rowIndex,rowData.error);
    },

    getErrorMsg: function(o) {
        return YIUI.UIUtil.getErrorMsg(o);
    },

    // 设置行可见
    setRowVisible: function (rowIndex,visible) {
        var rowData = this.getRowDataAt(rowIndex);
        rowData.visible = visible;
        if( !this.el )
            return;
        this.el.setRowVisible(rowIndex,visible);
    },

    // 刷新行序号
    refreshRowNo: function () {
      if( !this.el )
          return;
      this.el[0].refreshRowNo();
    },

    // 重新render!!
    refreshGrid: function () {
        if( !this.el )
            return;

        console.log( "refreshGrid.........................." + this.key);

        this.getOuterEl().remove();
        if (this.container) {
            this.onRender(this.container); // 渲染表格
            this.afterRender();
        }
        this.lastSize.width > 0 && this.el.setGridWidth(this.lastSize.width);
        this.lastSize.height > 0 && this.el.setGridHeight(this.lastSize.height);
    },

    load: function (construct) {
        var form = YIUI.FormStack.getForm(this.ofFormID);

        YIUI.SubDetailUtil.clearSubDetailData(form, this);

        var show = new YIUI.ShowGridData(form, this);
        show.load(construct);

        form.getUIProcess().resetComponentStatus(this);

        //this.refreshGrid();
    },

    loadSubDetail: function () {
        var form = YIUI.FormStack.getForm(this.ofFormID);

        YIUI.SubDetailUtil.clearSubDetailData(form, this);

        var show = new YIUI.ShowSubDetailData(form, this);
        show.load();
    },

    reset: function () {
        var pageIndex = this.pageInfo.curPageIndex;
        if( pageIndex != 0 ) {
          this.gridHandler.doGoToPage(this,0);
        }
        this.clearGridData();
    },

    refreshOpt: function () {
        this.el && this.el[0].updateToolBox();
    },

    clearGridData: function () {
        this.dataModel.data.length = 0;
        this.hideCount = 0;
        this.el && this.el[0].cleanSelection();
        this.el && this.el.clearGridData();
        this.rowIDMask = 0;
        this.rowIDMap = {};
    },

    clearAllRows: function(fireEvent) {
        console.log("todo clearAllRows");
    },

    getPageInfo: function () {
        return this.pageInfo;
    },

    getRowCount: function () {
        return this.dataModel.data.length;
    },
    /**
     * 获取表格某个字段的值的集合
     */
    getFieldArray: function (form, colKey, condition) {
        var doc = form.getDocument(), list = new Array(), dataTable;
        dataTable = doc.getByKey(this.tableKey);
        for (var i = 0, len = this.dataModel.data.length; i < len; i++) {
            var rd = this.dataModel.data[i], bookmark = rd.bookmark, cell;
            if (rd.isDetail && bookmark !== undefined) {
                dataTable.setByBkmk(bookmark);
                var isSelect = false;
                if (this.selectFieldIndex != -1) {
                    isSelect = this.getValueAt(i, this.selectFieldIndex);
                }
                if (isSelect) {
                    cell = dataTable.getByKey(colKey);
                    list.push(cell);
                }
            }
        }
        if (this.selectFieldIndex != -1 && $.isEmptyObject(list)) {
            throw new YIUI.ViewException(YIUI.ViewException.DATA_BINDING_ERROR,
                YIUI.ViewException.formatMessage(YIUI.ViewException.DATA_BINDING_ERROR));
        }
        return list;
    },

    /**
     * 判断值是否为空值. null,'',undefined,0都是空值,下拉框只要选择了,就不是空值,没选''或者null
     */
    isNullValue:function (value) {
        if( value == null || value == '' ) { // 文本
            return true;
        }
        if( value instanceof Decimal ) { // 数值
            return value.isZero();
        }
        if( value instanceof YIUI.ItemData ) { // 字典
            return value.oid == 0;
        }
        if( $.isArray(value) ) { // 多选字典
            return value.length == 0;
        }
        return false;
    },

    checkEquals: function (o1,o2) {
        if( this.isNullValue(o1) || this.isNullValue(o2) ) {
            return false; // 两个都为空,认为不相等
        }
        if( typeof o1 == 'object' ) {
            if( o1 instanceof YIUI.ItemData ) {
                return o1.getOID() == o2.getOID();
            } else if ( o1 instanceof Decimal ) {
                return parseFloat(o1) == parseFloat(o2);
            } else if ( o1 instanceof Date ) {
                return o1.getTime() == o2.getTime();
            }
        } else {
            return o1 == o2;
        }
    },

    // 非拓展使用
    setColumnCaption: function (cellKey, caption) {

        var form = YIUI.FormStack.getForm(this.ofFormID),
            loc = form.getCellLocation(cellKey);

        var column = this.getColumnAt(loc.column);
        column.label = caption;

        if( !this.el )
            return;

        var ci = loc.column + (this.showRowHead ? 1 : 0);

        $(".colCaption", this.el[0].grid.headers[ci].el).html(caption);
    },

    getColumnCount: function () {
        return this.dataModel.colModel.columns.length;
    },

    // 设置表格焦点行(触发事件,如行点击等)
    setFocusRowIndex: function (rowIndex,focus) {
        if( focus ) {
            this.el && this.el.setCellFocus(rowIndex,0);
        } else {
            this.el && this.el.selectRow(rowIndex,0);
        }
    },
    // 设置表格焦点(触发事件,如行点击等)
    focus: function () {
        if( !this.el )
            return;
        var row = this.getFocusRowIndex(),col = this.getFocusColIndex();
        if( row == -1 || col == -1 ) {
            this.el.setCellFocus(0,0);
        } else {
            this.el.setCellFocus(row,col);
        }
    },
    // 向焦点策略请求下一个焦点
    requestNextFocus: function () {
        this.focusManager.requestNextFocus();
    },

    isActivity: function () {
        var parents = this.el.parents(), parent;
        for (var i = 0, len = parents.length; i < len; i++) {
            parent = parents[i];
            if (parent.style.display == "none") {
                return false;
            }
        }
        return true;
    },

    getLastEmptyRowIndex: function () {
        for (var i = this.getRowCount() - 1; i >= 0; i--) {
            var row = this.getRowDataAt(i);
            if (row.isDetail && row.bookmark == null) {
                return  i;
            }
        }
        return -1;
    },

    // 获取明细行之前隐藏的行数量,用来计算行序号
    getHideRowCount: function () {
        if( this.hideCount > 0 ) {
            return this.hideCount;
        }
        var count = 0,rowData;
        for( var i = 0,size = this.getRowCount();i < size;i++ ) {
            rowData = this.getRowDataAt(i);
            if( rowData.rowType == 'Detail' ) {
               break;
            }
            if( rowData.visible == false ) {
               count++;
            }
        }
        return this.hideCount = count;
    },

    // 是否需要检查全选状态
    needCheckSelect:true,

    refreshSelectAll: function () { // 刷新全选勾选框的状态
        if( !this.needCheckSelect || this.selectFieldIndex == -1 )
            return;

        var $check = $(".chk", $('.ui-ygrid-htable',this.getOuterEl())); // 获取单头全选框
        if( $check.length == 0 ) // 没找到全选框
            return;

        var selectAll = true, hasDataRow;
        for (var i = 0, len = this.getRowCount(); i < len; i++) {
            var rowData = this.getRowDataAt(i);
            if (rowData.rowType !== 'Detail' || YIUI.GridUtil.isEmptyRow(rowData))
                continue;
            hasDataRow = true;
            if (!rowData.data[this.selectFieldIndex][0] ) { // 当前行勾选状态=false
                selectAll = false;
                break;
            }
        }

        // 清除全选状态
        $check.removeClass('checked');

        // hasDataRow，是否存在记录行？
        // selectAll，是否全部选中？
        if( hasDataRow ? selectAll : false ) {
            $check.addClass('checked');
        }
    },

    getHandler: function () {
        return this.gridHandler;
    },

    getDetailMetaRow: function(){
        return this.getMetaObj().rows[this.detailMetaRowIndex];
    },

    dependedValueChange: function(target,depend,value){
        var form = YIUI.FormStack.getForm(this.ofFormID);
        this.gridHandler.dependedValueChange(form,this,target,depend,value);
    }
});
YIUI.reg('grid', YIUI.Control.Grid); // guojs 注册控件

// 表格复制粘贴默认实现
YIUI.GridCPHandler = (function () {

    var copy = function (grid,ri,ci) {
        var data = grid.getCellDataAt(ri, ci);
        return data[1];
    };

    var paste = function (grid,ri,ci,display) {
        var cell = grid.getCellDataAt(ri, ci);
        if ( !cell[2] || !display ) {
            return;
        }

        var form = YIUI.FormStack.getForm(grid.ofFormID),
            cellValue = display,
            editOpt = grid.getCellEditOpt(ri,ci);

        var typeDef = cell.typeDef,meta;
        if( typeDef ) {
            meta = typeDef.editOptions;
        } else {
            meta = editOpt.editOptions;
        }

        switch ( meta.cellType ) {
        case YIUI.CONTROLTYPE.DICT:
            var handler = YIUI.DictHandler,
                formKey = form.formKey,
                fieldKey = editOpt.key,
                itemKey = meta.itemKey,
                filters = meta.itemFilters,
                stateMask = YIUI.DictStateMask.Enable,
                filter = handler.getDictFilter(form, fieldKey, filters, itemKey, cell.typeDefKey);

            if( typeDef ) {
                return;  // TODO 动态单元格字典类型粘贴有问题
            }

            var values = new YIUI.DictService(form).getData(itemKey,display, // 同步执行
                filter,null,stateMask,formKey,fieldKey);

            for( var i = 0,size = values.length;i < size;i++ ) {
                values[i] = new YIUI.ItemData(values[i]);
            }

            if( meta.allowMultiSelection ) {
                cellValue = values;
            } else {
                cellValue = values.length > 0 ? values[0] : null;
            }

            grid.setValueAt(ri, ci, cellValue, true, true);

            break;
        case YIUI.CONTROLTYPE.COMBOBOX:
        case YIUI.CONTROLTYPE.CHECKLISTBOX:
            var cxt = new View.Context(form),
                handler = YIUI.ComboBoxHandler;
            cxt.updateLocation(grid.key,ri,ci);

            var items = handler.getItemsSync(form, meta, cxt);
            var v = handler.getValByCaption(items,display);
            grid.setValueAt(ri, ci, v, true, true);
            break;
        default:
            var v = grid.formatInput(editOpt,cellValue);
            grid.setValueAt(ri, ci, v, true, true);
            break;
        }
    }

    return {
        copy: copy,
        paste: paste
    }
})();