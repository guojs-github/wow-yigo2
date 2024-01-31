//语言包
(function ($) {
    $.ygrid = $.ygrid || {};
    $.ygrid.initI18N = function(){
        $.extend($.ygrid, {
            defaults: {
                record: "{0} - {1}",
                totalrecord: YIUI.I18N.getString("GRID_TOTAL","共 {0} 条"),
                seqColText: YIUI.I18N.getString("LISTVIEW_SEQ","序号"),  //序号字段名称
                emptyrecords: YIUI.I18N.getString("GRID_NODATA","无数据显示"),
                recordtext: "{0} - {1}\u3000" + YIUI.I18N.getString("GRID_RECORDTEXT","共 {2} 条"), // 共字前是全角空格
                pgtext: YIUI.I18N.getString("GRID_JUMPTO"," 跳转至：{0}页")
            },
            del: {
              caption: YIUI.I18N.getString("ATTACHMENT_DELETE","删除"),
                msg: YIUI.I18N.getString("GRID_DELETERECORD","删除所选记录？"),
                bSubmit: YIUI.I18N.getString("ATTACHMENT_DELETE","删除"),
                bCancel: YIUI.I18N.getString("DICT_CANCEL","取消")
            },
            nav: {
                addtitle: YIUI.I18N.getString("GRID_ADDRECORD","添加新记录"),
                deltitle: YIUI.I18N.getString("GRID_DELRECORD","删除所选记录"),
                uprowtitle: YIUI.I18N.getString("GRID_MOVEUP","上移数据行"),
                downrowtitle: YIUI.I18N.getString("GRID_MOVEDOWN","下移数据行"),
                bestwidthtitle: YIUI.I18N.getString("GRID_BESTWIDTH","最佳列宽"),
                frozencoltitle: YIUI.I18N.getString("GRID_FROZENCOL","冻结列"),
                frozenrowtitle: YIUI.I18N.getString("GRID_FROZENROW","冻结行"),
                unfrozencoltitle: YIUI.I18N.getString("GRID_UNFROZENCOL","解冻列"),
                unfrozenrowtitle: YIUI.I18N.getString("GRID_UNFROZENROW","解冻行")
            },
            formatter: {
                integer: {thousandsSeparator: ",", defaultValue: '0'},
                number: {decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, defaultValue: '0.00'},
                currency: {decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, prefix: "", suffix: "", defaultValue: '0.00'}
            },
            error: {
                isNotTable: YIUI.I18N.getString("GRID_ISNOTTABLE","表格初始化错误，初始化所用HtmlElement不是Table类型"),
                isErrorMode: YIUI.I18N.getString("GRID_ISERRORMODE","表格所在页面的渲染模式(documentMode)低于5"),
                model: YIUI.I18N.getString("GRID_MODEL","colNames 和 colModel 长度不等！"),
                isSortError: YIUI.I18N.getString("GRID_ISSORTERROR","行分组情况下不允许进行排序"),
                compDictNotDataBinding: YIUI.I18N.getString("GRID_NOTALLOW","多选复合字典{0}不允许有数据绑定字段")
            },
            alert: {
                title: YIUI.I18N.getString("GRID_PROMPT","提示"),
                confirm: YIUI.I18N.getString("DATE_CONFIRM","确认")
            },
            cell_imgOpt: {
                open: YIUI.I18N.getString("GRID_SELECT","打开"),
                show: YIUI.I18N.getString("GRID_SHOW","查看"),
                clear: YIUI.I18N.getString("CURRENCY_CLEAN","清除")
            }
        });
    }
    
})(jQuery);