/**
 * Created with JetBrains WebStorm.
 * User: chenzs
 * Date: 14-2-14
 * Time: 下午2:31
 * 控件关联数据字段信息存储的对象，存储控件对应的关联的表的key和字段key
 * 通常有关联的控件都会包含一个DataBinding，用以存储关联信息。
 */
YIUI.DataBinding = YIUI.extend({
    tableKey: "",
    columnKey: "",
    init: function (tableKey, columnKey) {
        this.tableKey = tableKey;
        this.columnKey = columnKey;
    },
    setTableKey: function (tableKey) {
        this.tableKey = tableKey;
    },
    getTableKey: function () {
        return this.tableKey;
    },
    setColumnKey: function (columnKey) {
        this.columnKey = columnKey;
    },
    getColumnKey: function () {
        return this.columnKey;
    }
});

