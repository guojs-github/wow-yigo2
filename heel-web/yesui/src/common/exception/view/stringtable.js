(function () {
	var obj = {
		/** 表无关联数据，带一个%s参数 */
		NoTableData: "NoTableData",
		/** 组件绑定的表不存在，参数为%s,%s */
		NoBindingTableData: "NoBingingTableData",
		/** 无打印模板定义，参数为%s */
		NoPrintTemplateDefined: "NoPrintTemplateDefined",
		/** 表达式存在循环计算，带一个%s参数 */
		CircleDependency: "CircleDependency",
		/** 表格分页情况下存在列扩展*/
		GridExpandOrGroupInGridPage: "GridExpandOrGroupInGridPage",
		/** 表格分页情况下存在分组行（汇总行）*/
		ExistGroupRowInGridPage: "ExistGroupRowInGridPage",
		/** 存在列拓展的列最外层的列须时title类型*/
		OuterColumnMustBeTitle: "OuterColumnMustBeTitle",
		/** 没有定义的控件类型*/
		UndefinedComponentType: "UndefinedComponentType",
		/** 没有定义的分页类型*/
		UndefinedPageLoadType: "UndefinedPageLoadType",
		/** 无法获取单元格的动态行为*/
		UnableToGetCellBehavior: "UnableToGetCellBehavior",
		/** 界面存在检查规则错误*/
		CheckRuleNotPass: "CheckRuleNotPass",
		/** 表格子表单定义错误*/
		SubDetailBindingError: "SubDetailBindingError",
		/** 表达式标识符定义错误*/
		FormulaIdentifierError: "FormulaIdentifierError",
		/** 组件数据绑定错误,未找到对应数据源*/
		DataBindingError: "DataBindingError",
		/** 子表单未选定行*/
		NoRowSelected: "NoRowSelected",
		/** 序号列未定义*/
		SequenceNoDefine: "SequenceNoDefine",
		/** 表格层次数据显示时，Layer及Hidden字段必须同时存在*/
		LayerOrHiddenNoDefine: "LayerOrHiddenNoDefine",
		/** 表格层次数据显示时，不允许表格列扩展*/
		ShowLayerDataNotAllowGridExpand: "ShowLayerDataNotAllowGridExpand",
		/** 界面存在组件必填要求*/
		RequiredError: "RequiredError",
		/** 组件未找到*/
		NoComponentFound: "NoComponentFound",
		/** 未找到数据表*/
		NoTableFound: "NoTableFound",
		/** 表格过滤关联的源字段与目标字段个数不一致*/
		ForeignFieldsInequality: "ForeignFieldsInequality",
		/** 下推的目标单中表格未找到空白行*/
		NoEmptyRowFound: "NoEmptyRowFound",
		/** 表格树形列类型定义错误*/
		GridTreeColumnDefineError: "GridTreeColumnDefineError",
		/** 未定义的行拓展类型*/
		UndefinedRowExpandType: "UndefinedRowExpandType",
		/** 表单引用的操作未定义 */
		RefOperationNotDefined: "RefOperationNotDefined",
		/** 表格未定义明细数据行*/
		NoDetailRowDefine: "NoDetailRowDefine",
		/** 组件不存在 */
		ComponentNotExists: "ComponentNotExists",
		/** 定制单元格表单的数据源未定义RefDetailTableKey*/
		NoRefDetailTableKeyDefine: "NoRefDetailTableKeyDefine",
		/** 表格行的子明细表单的数据源未定义RefTableKey*/
		NoRefTableKeyDefine: "NoRefTableKeyDefine",
		/** 列拓展自定义的拓展来源未计算出结果*/
		NoExpandSourceGet: "NoExpandSourceGet",
		/** 未定义的子明细连接方式*/
		UndefinedSubDetailLinkType: "UndefinedSubDetailLinkType",
		/** 请先编辑表格数据行,再输入子明细*/
		NoSubDetailsInEmptyRow: "NoSubDetailsInEmptyRow",
		/** 未找到表格或者ListView*/
		NoGridOrListViewFound: "NoGridOrListViewFound",
		/** 非单元格无法设值*/
		NoCellCannotSetValue: "NoCellCannotSetValue",
		/** 无法获取非单元格值*/
		CannnotGetNoCellValue: "CannnotGetNoCellValue",
		/** 复合字典不能设置为多选字典*/
		CompdictCannotSetMultidict: "CompdictCannotSetMultidict",
		/** 动态字典的itemKey字段为空*/
		DynamicdictItemkeyNull: "DynamicdictItemkeyNull",
		/** 复合字典的itemKey字段为空*/
		CompdictItemkeyNull: "CompdictItemkeyNull",
		/** 控件不存在*/
		NoComponent: "NoComponent",
		/** 宽度或高度未定义*/
		NoWidthOrHeight: "NoWidthOrHeight",
		/** 下推的目标单据的key为空 */
		NoKeyTargetBill: "NoKeyTargetBill",
		/** 超出最大数值精度 */
		ExceedValueMaxAccuracy: "ExceedValueMaxAccuracy",
		/** 超出最大数值精度 */
		DateDiffParamError: "DateDiffParamError",
		/** 控件key不存在*/
		NoComponentKey: "NoComponentKey",
		/** 合并单元格定义的行类型不一致*/
		CellMergeDefineError: "CellMergeDefineError",
		/** 下拉项来源定义错误*/
		SourceTypeDefineError: "SourceTypeDefineError",
		/** 需要定义业务关键字*/
		NeedPrimarysDefined: "NeedPrimarysDefined",
		/** 动态单元格需要定义类型表达式*/
		TypeFormulaNeeded: "TypeFormulaNeeded",
		/** 动态单元格组未定义*/
		TypeGroupUnDefined: "TypeGroupUnDefined",
		/** 指定结果的单元格类型未定义*/
		TypeDefUnDefined: "TypeDefUnDefined",
		/** 动态单元格标识列未定义*/
		TypeDefKeyColumnUndefined: "TypeDefKeyColumnUndefined",
		/** 数据中动态单元格标识为空*/
		TypeDefKeyEmpty: "TypeDefKeyEmpty",
		/** 未知的明细类型*/
		UnknownDetailType: "UnknownDetailType",
		/** 列拓展未定义拓展源,无法确定拓展类型*/
		ExpandSourceUndefined: "ExpandSourceUndefined",
		/** 数据拓展数据列未定义*/
		ExpandColumnKeyUndefined: "ExpandColumnKeyUndefined",
		/** 只支持在表单类型为View的情况下使用*/
		ViewFormOnly: "ViewFormOnly",
		/** 是否删除含有子明细的表格行*/
		DeleteRowWithSubDetail: "DeleteRowWithSubDetail",
		/** 是否删除所有选中行*/
		DeleteAllSelectRows: "DeleteAllSelectRows",
		/** 是否删除含有子行的表格行(树形)*/
		DeleteRowWithChildRows: "DeleteRowWithChildRows",
		/** 是否关闭当前界面*/
		ConfirmClose: "ConfirmClose",
		/** 不支持的行拓展类型*/
		UnSupportRowExpandType: "UnSupportRowExpandType",
		/** 无入口权限*/
		NoEntryRights: "NoEntryRights",
		/** 叙事簿未找到ListView*/
		ListViewNotFound: "ListViewNotFound",
		/** 动态字典或者复合字典数据源需要增加一列用于存储ItemKey*/
		ItemKeyColumnUndefined: "ItemKeyColumnUndefined",
		/** 字典值类型错误*/
		DictDataError: "DictDataError",
		/** 附件超出最大值限制*/
		AttachmentExceedMaxSize: "AttachmentExceedMaxSize",
		/** 附件类型错误*/
		AttachmentTypeError: "AttachmentTypeError",
		/** 服务器连接失败*/
		ConnectFailed: "ConnectFailed",
		/** 表单检查规则错误*/
		FormCheckError: "FormCheckError",
		/** 表格行检查规则错误*/
		GridRowError: "GridRowError",
		/** 表格单元格检查规则错误*/
		GridCellError: "GridCellError",
		/** 表格单元格必填*/
		GridCellRequired: "GridCellRequired",
		/** ve不能为空 */
		VeCannotNull: "VeCannotNull",
		/** 没有载入处理类 带一个%s参数*/
		NoLoadHandlerClass: "NoLoadHandlerClass",
		/** 字典根节点计算错误*/
		DictRootNodeCalcError: "DictRootNodeCalcError",
		/** 字典根节点itemKey与当前字典itemKey不一致 */
		ItemkeyNotAgreeWithCurrent: "ItemkeyNotAgreeWithCurrent",
		/** 不是复合字典 */
		ItemkeyNoCompDict: "ItemkeyNoCompDict",
		/** ItemKey的字典不存在*/
		NoDict: "NoDict",
		/** 没有对应的组件创建类*/
		NoComponentBudilderClass: "NoComponentBudilderClass",
		/** IUnitConverter 不支持的类型：*/
		UnitNotSupportType: "UnitNotSupportType",
		/** 不支持的类型*/
		NotSupportType: "NotSupportType",
		/** 字典控件传入的值类型错误*/
		DictInputValueTypeError: "DictInputValueTypeError",
		/** 错误的时间*/
		TimeError: "TimeError",
		/** filterDependence中未处理的类型*/
		filterDependenceUntreatedType: "filterDependenceUntreatedType",
		/** 多选复合字典不允许有数据绑定字段*/
		CompdictNotDataBinding: "CompdictNotDataBinding",
		/** 参数个数不一致*/
		UnEqualParamNum: "UnEqualParamNum",
		/** 单选按钮所属组的标识未定义 */
		RadioButtonNoGroupKey: "RadioButtonNoGroupKey"
	};

	YIUI.StringTable.View = $.extend(YIUI.StringTable, obj);
	
})();