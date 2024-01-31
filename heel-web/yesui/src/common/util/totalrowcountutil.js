YIUI.TotalRowCountUtil = (function(){
	var Return = {
		getKey: function(tableKey) {
			return tableKey + "_RowCount";
		},
		getRowCount: function(doc, tableKey) {
			return YIUI.TypeConvertor.toInt(doc.getExpData(this.getKey(tableKey)));
		},
		setRowCount: function(doc, tableKey, rowCount) {
			doc.putExpData(this.getKey(tableKey), rowCount);
			doc.expDataType[this.getKey(tableKey)] = YIUI.ExpandDataType.LONG;
		}
	};
	return Return;
})();