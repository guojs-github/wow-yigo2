YIUI.EventHandler = (function () {
    var Return = {
        /**
         * 各控件的点击事件(单击)
         * formID: 控件所在表单的ID
         * controlKey: 控件自身的key
         * extParas: 其他参数
         */
        doOnClick: function (control, extParas) {
        },

        /**
         * 单元格单击事件， 用于表格的checkbox , button , hyperlink
         */
        doCellClick: function (control, rowID, colIndex, extParas) {
        },

        /**
         * 表格行点击事件
         */
        doOnRowClick: function (control, rowID, extParas) {
        },

        /**
         * 表格行焦點变化事件
         */
        doOnFocusRowChange: function (control, oldRowID, newRowID, extParas) {
        },

        /**
         * 各控件的点击事件(双击)
         */
        doOnDBClick: function (control, extParas) {
        },

        /**
         * 表格行双击事件
         */
        doOnRowDBClick: function (control, rowID, extParas) {
        },

        /**
         * 表格排序事件
         */
        doOnSortClick: function (control, colIndex, sortType, extParas) {
        },

        /**
         * 获取到焦点时的处理事件
         */
        doGainFocus: function (control, extParas) {
        },

        /**
         * 失去焦点后的处理事件
         */
        doLostFocus: function (control, extParas) {
        },

        /**
         * 向指定页进行跳转
         */
        doGoToPage: function (control, extParas) {
        },

        /**
         * 跳转到首页
         */
        doGoToFirstPage: function (control, extParas) {
        },

        /**
         * 跳转到末页
         */
        doGoToLastPage: function (control, extParas) {
        },

        /**
         * 跳转到上一页
         */
        doGoToPrevPage: function (control, extParas) {
        },

        /**
         * 跳转到下一页
         */
        doGoToNextPage: function (control, extParas) {
        },

        /**
         * 树的汇总节点展开
         */
        doExpand: function (control, extParas) {
        },

        /**
         * 树的汇总节点收缩
         */
        doCollapse: function (control, extParas) {
        },

        /**
         * 菜单树的点击事件
         */
        doTreeClick: function (control, extParas) {
        },

        /**
         * 按会车键所触发的事件
         */
        doEnterPress: function (control, extParas) {
        },

        /**
         * 各控件的值变化事件
         * formID: 控件所在表单的ID
         * controlKey: 控件自身的key
         * newValue: 新的存储值
         * extParas: 其他参数
         */
        doValueChanged: function (control, newValue, extParas) {
        },

        /**
         * 单元格值改变事件
         * formID: 控件所在表单的ID
         * controlKey: 控件自身的key
         * newValue: 新的存储值
         * extParas: 其他参数
         */
        doCellValueChanged: function (control, newValue, extParas) {
        },

        /**
         * 表格粘贴数据
         * @param control 表格控件
         * @param bgRowID  开始行
         * @param bgColIndex 开始列
         * @param pastValue 粘贴值，[{value01,value02,value03},{value11,value12,value13}]
         * @param extParas 其他参数
         */
        doCellPast: function (control, bgRowID, bgColIndex, pastValue, extParas) {
        },

        /**
         * 表格中新增行事件
         */
        doInsertGridRow: function (control, extParas) {
        },

        /**
         * 单元格选中事件
         */
        doGridCellSelect: function (control, rowID, colIndex, extParas) {
        },

        /**
         * 表格中删除行事件
         */
        doDeleteGridRow: function (control, extParas) {
        },

        /**
         * 字典的查询
         */
        doDictViewSearch: function (control, extParas) {
        },

        /**
         * 删除指定的附件
         */
        doDeleteAttachment: function (control, extParas) {
        },

        doCloseForm: function (control) {
        }


    };

    return Return;
})();
