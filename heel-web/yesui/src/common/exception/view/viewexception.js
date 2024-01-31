YIUI.ViewException = (function () {
    /**
     * 视图异常类
     * 大类编号:800B
     */
    // 0001 - 表无关联数据
    _ViewException.NO_TABLE_DATA = 0x0001;
    // 0002 - 组件绑定的表不存在
    _ViewException.NO_BINDING_TABLE_DATA = 0x0002;
    // 0003 - 表单无打印模板定义
    _ViewException.NO_PRINT_TEMPLATE_DEFINED = 0x0003;
    // 0004 - 表达式的计算关系存在环路
    _ViewException.CIRCLE_DEPENDENCY = 0x0004;
    // 0005 - 表格分页情况下做列扩展
    _ViewException.GRID_EXPAND_OR_GROUP_IN_GRID_PAGE = 0x0005;
    // 0006 - 表格分页情况下存在分组行（汇总行）
    _ViewException.EXIST_GROUPROW_IN_GRIDPAGE = 0x0006;
    // 0008 - 列拓展最外层的列须是title类型
    _ViewException.OUTER_COLUMN_MUSTBE_TITLE = 0x0008;
    // 0009 - 没有定义的控件类型
    _ViewException.UNDEFINED_COMPONENT_TYPE = 0x0009;
    // 000A - 表格分页类型定义错误
    _ViewException.UNDEFINED_PAGE_LOAD_TYPE = 0x000A;
    // 000B - 无法获取单元格的动态行为
    _ViewException.UNABLE_TO_GET_CELL_BEHAVIOR = 0x000B;
    // 000C - 界面存在检查规则错误
    _ViewException.COMPONENT_CHECK_ERROR = 0x000C;
    // 000D - 表格子表单绑定错误
    _ViewException.SUB_DETAIL_BINDING_ERROR = 0x000D;
    // 000E - 表达式标识符定义错误
    _ViewException.FORMULA_IDENTIFIER_ERROR = 0x000E;
    // 000F - 组件数据绑定错误;未找到对应数据源
    _ViewException.DATA_BINDING_ERROR = 0x000F;
    // 0010 - 未选定表格行
    _ViewException.NO_ROW_SELECTED = 0x0010;
    // 0011 - 序号字段未定义
    _ViewException.SEQUENCE_NO_DEFINE = 0x0011;
    // 0012 - 表格层次数据显示时，Layer及Hidden字段必须同时存在
    _ViewException.LAYER_OR_HIDDEN_NO_DEFINE = 0x0012;
    // 0013 - 表格层次数据显示不支持列扩展
    _ViewException.SHOW_LAYERDATA_NOTALLOW_GRID_EXPAND = 0x0013;
    // 0014 - 界面存在必填错误
    _ViewException.COMPONENT_REQUIRED = 0x0014;
    // 0015 - 组件未定义
    _ViewException.NO_COMPONENT_FOUND = 0x0015;
    // 0016 - 未找到数据表
    _ViewException.NO_TABLE_FOUND = 0x0016;
    // 0017 - 表格过滤关联的源字段与目标字段个数不一致
    _ViewException.FOREIGN_FIELDS_INEQUALITY = 0x0017;
    // 0018 - 下推的目标单中表格未找到空白行
    _ViewException.NO_EMPTY_ROW_FOUND = 0x0018;
    // 0019 - 表格树形列类型定义错误
    _ViewException.GRID_TREE_COLUMN_DEFINE_ERROR = 0x0019;
    // 001A - 未定义的表格行拓展类型
    _ViewException.UNDEFINED_ROW_EXPAND_TYPE = 0x001A;
    // 001B - 引用的操作未定义
    _ViewException.REF_OPERATION_NOT_DEFINED = 0x001B;
    // 001C - 表格未定义明细数据行
    _ViewException.NO_DETAIL_ROW_DEFINE = 0x001C;
    // 001D - 组件不存在
    _ViewException.COMPONENT_NOT_EXISTS = 0x001D;
    // 001E - 定制单元格表单的数据源未定义RefDetailTableKey
    _ViewException.NO_REFDETAILTABLEKEY_DEFINE = 0x001E;
    // 001F - 表格行的子明细表单的数据源未定义RefTableKey
    _ViewException.NO_REFTABLEKEY_DEFINE = 0x001F;
    // 002A - 列拓展自定义的拓展来源未计算出结果
    _ViewException.NO_EXPANDSOURCE_RESULT_GET = 0x002A;
    // 002B - 未定义的子明细关联方式
    _ViewException.UNDEFINED_SUBDETAIL_LINKTYPE = 0x002B;
    // 002C - 请先编辑表格数据行;再输入子明细
    _ViewException.NO_SUBDETAILS_IN_EMPTYROW = 0x002C;
    // 002D - 未找到对应的表格或者ListView
    _ViewException.NO_GRID_OR_LISTVIEW_FOUND = 0x002D;

    //web端添加 
    //非单元格无法设置
    // 002E - 下拉项来源定义错误
    _ViewException.NO_CELL_CANNOT_SET_VALUE = 0x002E;
    //无法获取非单元格值
    _ViewException.CANNNOT_GET_NO_CELL_VALUE = 0x002F; 
    //复合字典不能设置为多选字典
    _ViewException.COMPDICT_CANNOT_SET_MULTIDICT = 0x0030; 
    //动态字典的itemKey字段为空
    _ViewException.DYNAMICDICT_ITEMKEY_NULL = 0x0031;
    //复合字典的itemKey字段为空
    _ViewException.COMPDICT_ITEMKEY_NULL = 0x0032;
    //控件不存在
    _ViewException.NO_COMPONENT = 0x0033;
    //宽度或高度未定义
    _ViewException.NO_WIDTH_OR_HEIGHT = 0x0034;
    //下推的目标单据的key为空 
    _ViewException.NO_KEY_TARGET_BILL = 0x0035;
    //超出最大数值精度
    _ViewException.Exceed_Value_Max_Accuracy = 0x0036;
    //DateDiff公式传入参数有误;请检查配置
    _ViewException.Date_Diff_Param_Error = 0x0037;
    //控件key不存在
    _ViewException.NO_COMPONENT_KEY = 0x0038;
    //合并单元格定义的行类型不一致
    _ViewException.CELL_MERGE_DEFINE_ERROR = 0x0039;
    //下拉项来源定义错误
    _ViewException.SOURCETYPE_DEFINE_ERROR = 0x0040;
    //表格有选择字段且没有OID列时;需要定义业务关键字来定位行
    _ViewException.PRIMARYKEYS_UNDEFINED = 0x0041;
    //动态单元格需要定义类型表达式;否则无法确定单元格类型
    _ViewException.TYPE_FORMULA_NEEDED = 0x0042;
    //动态单元格组未定义
    _ViewException.TYPE_GROUP_UNDEFINED = 0x0043;
    //指定结果的单元格类型未定义
    _ViewException.TYPE_DEF_UNDEFINED = 0x0044;
    //动态单元格标识列未定义
    _ViewException.TYPE_DEF_KEYCOLUMN_UNDEFINED = 0x0045;
    //数据中动态单元格标识为空
    _ViewException.TYPEDEFKEY_EMPTY = 0x0046;
    //未知的明细类型
    _ViewException.UNKNOWN_DETAIL_TYPE = 0x0047;
    //列拓展未定义拓展源;无法确定拓展类型
    _ViewException.EXPAND_SOURCE_UNDEFINED = 0x0048;
    //数据拓展数据列未定义
    _ViewException.EXPAND_COLUMNKEY_UNDEFIND = 0x0049;
    //只支持在表单类型为View的情况下使用
    _ViewException.VIEW_FORM_ONLY = 0x0050;
    //不支持的行拓展类型
    _ViewException.UNSUPPORT_ROWEXPAND_TYPE = 0x0051;
    //叙事簿未找到ListView组件 
    _ViewException.LISTVIEW_NOT_FOUND_IN_VIEW = 0x0052;
    //无入口权限
    _ViewException.NO_ENTRYRIGHTS = 0x0053;
    //动态字典或者复合字典数据源需要增加一列用于存储ItemKey
    _ViewException.ITEMKEY_COLUMN_UNDEFINED = 0x0054;
    //字典值错误
    _ViewException.DICT_DATA_ERROR = 0x0055;
    //客户端数字证书找不到
    _ViewException.CLIENT_CERTIFICATE_NOT_FOUND = 0x0056;
    //服务器连接失败
    _ViewException.CONNECT_FAILED = 0x0057;
    // 表单检查规则错误
    _ViewException.FORM_CHECK_ERROR = 0x0058;
    // 表格行检查错误
    _ViewException.GRID_ROW_ERROR = 0x0059;
    // 表格单元格检查错误
    _ViewException.GRID_CELL_ERROR = 0x0060;
    // 表格单元格必填
    _ViewException.GRID_CELL_REQUIRED = 0x0061;
    // ve不能为空
    _ViewException.VE_CANNOT_NULL = 0x0062;
    // 没有载入处理类
    _ViewException.NO_LOAD_HANDLER_CLASS = 0x0063;
    // 字典根节点计算错误
    _ViewException.DICT_ROOT_NODE_CALC_ERROR = 0x0064;
    // 字典根节点itemKey与当前字典itemKey不一致
    _ViewException.ITEMKEY_NOT_AGREE_WITH_CURRENT = 0x0065;
    // 不是复合字典
    _ViewException.ITEMKEY_NO_COMPDICT = 0x0066;
    // ItemKey的字典不存在
    _ViewException.NO_DICT = 0x0067;
    // 没有对应的组件创建类
    _ViewException.NO_COMPONENT_BUILDER_CLASS = 0x0068;
    //不支持的类型：
    _ViewException.NOT_SUPPORT_TYPE = 0x0070;
    //字典控件传入的值类型错误
    _ViewException.DICT_INPUT_VALUE_TYPE_ERROR = 0x0071;
    //错误的时间
    _ViewException.TIME_ERROR = 0x0072;
    //filterDependence中未处理的类型
    _ViewException.FILTER_DEPEND_UNTREATED_TYPE = 0x0073;
    //多选复合字典不允许有数据绑定字段
    _ViewException.COMPDICT_NOT_DATA_BINDING = 0x0074;
    //参数个数不一致
    _ViewException.UNEQUAL_PARAM_NUM = 0x0075;
    //单选按钮所属组的标识未定义
    _ViewException.RadioButtonNoGroupKey = 0x0076;

    var StringTable = YIUI.StringTable.View;

    var errorInfo = new HashMap();
    errorInfo.put(_ViewException.NO_TABLE_DATA, StringTable.NoTableData);
    errorInfo.put(_ViewException.NO_BINDING_TABLE_DATA, StringTable.NoBindingTableData);
    errorInfo.put(_ViewException.NO_PRINT_TEMPLATE_DEFINED, StringTable.NoPrintTemplateDefined);
    errorInfo.put(_ViewException.CIRCLE_DEPENDENCY, StringTable.CircleDependency);
    errorInfo.put(_ViewException.GRID_EXPAND_OR_GROUP_IN_GRID_PAGE, StringTable.GridExpandOrGroupInGridPage);
    errorInfo.put(_ViewException.EXIST_GROUPROW_IN_GRIDPAGE, StringTable.ExistGroupRowInGridPage);
    errorInfo.put(_ViewException.OUTER_COLUMN_MUSTBE_TITLE, StringTable.OuterColumnMustBeTitle);
    errorInfo.put(_ViewException.UNDEFINED_COMPONENT_TYPE, StringTable.UndefinedComponentType);
    errorInfo.put(_ViewException.UNDEFINED_PAGE_LOAD_TYPE, StringTable.UndefinedPageLoadType);
    errorInfo.put(_ViewException.UNABLE_TO_GET_CELL_BEHAVIOR, StringTable.UnableToGetCellBehavior);
    errorInfo.put(_ViewException.COMPONENT_CHECK_ERROR, StringTable.CheckRuleNotPass);
    errorInfo.put(_ViewException.SUB_DETAIL_BINDING_ERROR, StringTable.SubDetailBindingError);
    errorInfo.put(_ViewException.FORMULA_IDENTIFIER_ERROR, StringTable.FormulaIdentifierError);
    errorInfo.put(_ViewException.DATA_BINDING_ERROR, StringTable.DataBindingError);
    errorInfo.put(_ViewException.NO_ROW_SELECTED, StringTable.NoRowSelected);
    errorInfo.put(_ViewException.SEQUENCE_NO_DEFINE, StringTable.SequenceNoDefine);
    errorInfo.put(_ViewException.LAYER_OR_HIDDEN_NO_DEFINE, StringTable.LayerOrHiddenNoDefine);
    errorInfo.put(_ViewException.SHOW_LAYERDATA_NOTALLOW_GRID_EXPAND, StringTable.ShowLayerDataNotAllowGridExpand);
    errorInfo.put(_ViewException.COMPONENT_REQUIRED, StringTable.RequiredError);
    errorInfo.put(_ViewException.NO_COMPONENT_FOUND, StringTable.NoComponentFound);
    errorInfo.put(_ViewException.NO_TABLE_FOUND, StringTable.NoTableFound);
    errorInfo.put(_ViewException.FOREIGN_FIELDS_INEQUALITY, StringTable.ForeignFieldsInequality);
    errorInfo.put(_ViewException.NO_EMPTY_ROW_FOUND, StringTable.NoEmptyRowFound);
    errorInfo.put(_ViewException.GRID_TREE_COLUMN_DEFINE_ERROR, StringTable.GridTreeColumnDefineError);
    errorInfo.put(_ViewException.UNDEFINED_ROW_EXPAND_TYPE, StringTable.UndefinedRowExpandType);
    errorInfo.put(_ViewException.NO_DETAIL_ROW_DEFINE, StringTable.NoDetailRowDefine);
    errorInfo.put(_ViewException.COMPONENT_NOT_EXISTS, StringTable.ComponentNotExists);
    errorInfo.put(_ViewException.NO_REFDETAILTABLEKEY_DEFINE, StringTable.NoRefDetailTableKeyDefine);
    errorInfo.put(_ViewException.NO_REFTABLEKEY_DEFINE, StringTable.NoRefTableKeyDefine);
    errorInfo.put(_ViewException.NO_EXPANDSOURCE_RESULT_GET, StringTable.NoExpandSourceGet);
    errorInfo.put(_ViewException.UNDEFINED_SUBDETAIL_LINKTYPE, StringTable.UndefinedSubDetailLinkType);
    errorInfo.put(_ViewException.NO_SUBDETAILS_IN_EMPTYROW, StringTable.NoSubDetailsInEmptyRow);
    errorInfo.put(_ViewException.NO_GRID_OR_LISTVIEW_FOUND, StringTable.NoGridOrListViewFound);
    errorInfo.put(_ViewException.NO_CELL_CANNOT_SET_VALUE, StringTable.NoCellCannotSetValue);
    errorInfo.put(_ViewException.CANNNOT_GET_NO_CELL_VALUE, StringTable.CannnotGetNoCellValue);
    errorInfo.put(_ViewException.COMPDICT_CANNOT_SET_MULTIDICT, StringTable.CompdictCannotSetMultidict);
    errorInfo.put(_ViewException.DYNAMICDICT_ITEMKEY_NULL, StringTable.DynamicdictItemkeyNull);
    errorInfo.put(_ViewException.COMPDICT_ITEMKEY_NULL, StringTable.CompdictItemkeyNull);
    errorInfo.put(_ViewException.NO_COMPONENT, StringTable.NoComponent);
    errorInfo.put(_ViewException.NO_WIDTH_OR_HEIGHT, StringTable.NoWidthOrHeight);
    errorInfo.put(_ViewException.NO_KEY_TARGET_BILL, StringTable.NoKeyTargetBill);
    errorInfo.put(_ViewException.Exceed_Value_Max_Accuracy, StringTable.ExceedValueMaxAccuracy);
    errorInfo.put(_ViewException.Date_Diff_Param_Error, StringTable.DateDiffParamError);
    errorInfo.put(_ViewException.NO_COMPONENT_KEY, StringTable.NoComponentKey);
    errorInfo.put(_ViewException.CELL_MERGE_DEFINE_ERROR, StringTable.CellMergeDefineError);
    errorInfo.put(_ViewException.SOURCETYPE_DEFINE_ERROR, StringTable.SourceTypeDefineError);
    errorInfo.put(_ViewException.PRIMARYKEYS_UNDEFINED, StringTable.NeedPrimarysDefined);
    errorInfo.put(_ViewException.TYPE_FORMULA_NEEDED, StringTable.TypeFormulaNeeded);
    errorInfo.put(_ViewException.TYPE_GROUP_UNDEFINED, StringTable.TypeGroupUnDefined);
    errorInfo.put(_ViewException.TYPE_DEF_UNDEFINED, StringTable.TypeDefUnDefined);
    errorInfo.put(_ViewException.TYPE_DEF_KEYCOLUMN_UNDEFINED, StringTable.TypeDefKeyColumnUndefined);
    errorInfo.put(_ViewException.TYPEDEFKEY_EMPTY, StringTable.TypeDefKeyEmpty);
    errorInfo.put(_ViewException.UNKNOWN_DETAIL_TYPE, StringTable.UnknownDetailType);
    errorInfo.put(_ViewException.EXPAND_SOURCE_UNDEFINED, StringTable.ExpandSourceUndefined);
    errorInfo.put(_ViewException.EXPAND_COLUMNKEY_UNDEFIND, StringTable.ExpandColumnKeyUndefined);
    errorInfo.put(_ViewException.VIEW_FORM_ONLY, StringTable.ViewFormOnly);
    errorInfo.put(_ViewException.UNSUPPORT_ROWEXPAND_TYPE, StringTable.UnSupportRowExpandType);
    errorInfo.put(_ViewException.NO_ENTRYRIGHTS, StringTable.NoEntryRights);
    errorInfo.put(_ViewException.LISTVIEW_NOT_FOUND_IN_VIEW, StringTable.ListViewNotFound);
    errorInfo.put(_ViewException.ITEMKEY_COLUMN_UNDEFINED, StringTable.ItemKeyColumnUndefined);
    errorInfo.put(_ViewException.DICT_DATA_ERROR, StringTable.DictDataError);
    errorInfo.put(_ViewException.CONNECT_FAILED, StringTable.ConnectFailed);
    errorInfo.put(_ViewException.FORM_CHECK_ERROR, StringTable.FormCheckError);
    errorInfo.put(_ViewException.GRID_ROW_ERROR, StringTable.GridRowError);
    errorInfo.put(_ViewException.GRID_CELL_ERROR, StringTable.GridCellError);
    errorInfo.put(_ViewException.GRID_CELL_REQUIRED, StringTable.GridCellRequired);
    errorInfo.put(_ViewException.VE_CANNOT_NULL, StringTable.VeCannotNull);
    errorInfo.put(_ViewException.NO_LOAD_HANDLER_CLASS, StringTable.NoLoadHandlerClass);
    errorInfo.put(_ViewException.DICT_ROOT_NODE_CALC_ERROR, StringTable.DictRootNodeCalcError);
    errorInfo.put(_ViewException.ITEMKEY_NOT_AGREE_WITH_CURRENT, StringTable.ItemkeyNotAgreeWithCurrent);
    errorInfo.put(_ViewException.ITEMKEY_NO_COMPDICT, StringTable.ItemkeyNoCompDict);
    errorInfo.put(_ViewException.NO_DICT, StringTable.NoDict);
    errorInfo.put(_ViewException.NO_COMPONENT_BUILDER_CLASS, StringTable.NoComponentBuilderClass);
    errorInfo.put(_ViewException.NOT_SUPPORT_TYPE, StringTable.NotSupportType);
    errorInfo.put(_ViewException.DICT_INPUT_VALUE_TYPE_ERROR, StringTable.DictInputValueTypeError);          
    errorInfo.put(_ViewException.TIME_ERROR, StringTable.TimeError);          
    errorInfo.put(_ViewException.FILTER_DEPEND_UNTREATED_TYPE, StringTable.filterDependenceUntreatedType);
    errorInfo.put(_ViewException.COMPDICT_NOT_DATA_BINDING, StringTable.CompdictNotDataBinding);
    errorInfo.put(_ViewException.UNEQUAL_PARAM_NUM, StringTable.UnEqualParamNum);
    errorInfo.put(_ViewException.RadioButtonNoGroupKey, StringTable.RadioButtonNoGroupKey);

    var getGroupCode = function() {
        return 0x800B;
    };

    function _ViewException(code, message){
        var c = getGroupCode() << 16 | code;  
        YIUI.CoreException.call(this, c, message);
        this.name = 'YIUI.ViewException';
    };

    _ViewException.prototype = new YIUI.CoreException();

    _ViewException.formatMessage = function(/*locale, */code) {
                                        var key = errorInfo.get(code);
                                        var format = StringTable.getString(/*locale, */key);
                                        var msg = StringTable.format(format, arguments, 1);
                                        return msg;
                                    };
    return _ViewException;
})();
