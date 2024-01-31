
var ConditionParas = ConditionParas || {};

(function() {
	ConditionParas = function() {
		var Return = {
			condParas: [],
			condFormKey : "",
			highItems: [],
			setCondFormKey: function(condFormKey) {
				this.condFormKey = condFormKey;
			},
			getCondFormKey: function() {
				return this.condFormKey;
			},
			add: function(condItem) {
				this.condParas.push(condItem);
			},
			get: function(i) {
				return this.condParas[i];
			},
			size: function() {
				return this.condParas.length;
			},
			getCondParas: function() {
				return {condParas_items: this.condParas};
			},
			clear: function() {
				this.condParas.length = 0;
				this.highItems.length = 0;
			},
			addHighCond: function(highCond) {
				this.highItems.push(highCond)
			},
			getHighCond: function(i) {
				return this.highItems[i]
			},
			highSize: function() { 
				return this.highItems.length
			},
			getHighCondItems: function() { 
				return {highCond_items: this.highItems}
			}
		};
		return Return;
	};
	
	ConditionItem = function() {
		var Return = {
			/** 查询字段组建的key */
			key: "",
			/** 查询字段类型 */
			type: -1,
			/** 查询条件 */
			condSign: -1,
			/** 条件组标识 */
			group: "",
			/** 条件组头标志 */
			groupHead: false,
			/** 条件组尾标志 */
			groupTail: false,
			/** 查询的目标表 */
			targetTableKey: "",
			/** 条件关联的数据表标识 */
			tableKey: "",
			/** 条件关联的数据列标识 */
			columnKey: "",
			/** 查询的值 */
			value: "",
			setKey: function(key) {
				this.key = key;
			},
			getKey: function() {
				return this.key;
			},
			setType: function(type) {
				this.type = type;
			},
			getType: function() {
				return this.type;
			},
			setCondSign: function(condSign) {
				this.condSign = condSign;
			},
			getCondSign: function() {
				return this.condSign;
			},
			setGroup: function(group) {
				this.group = group;
			},
			getGroup: function() {
				return this.group;
			},
			setGroupHead: function(groupHead) {
				this.groupHead = groupHead;
			},
			isGroupHead: function() {
				return this.groupHead;
			},
			setGroupTail: function(groupTail) {
				this.groupTail = groupTail;
			},
			isGroupTail: function() {
				return this.groupTail;
			},
			setTargetTableKey: function(targetTableKey) {
				this.targetTableKey = targetTableKey;
			},
			getTargetTableKey: function() {
				return this.targetTableKey;
			},
			setTableKey: function(tableKey) {
				this.tableKey = tableKey;
			},
			getTableKey: function() {
				return this.tableKey;
			},
			setColumnKey: function(columnKey) {
				this.columnKey = columnKey;
			},
			getColumnKey: function() {
				return this.columnKey;
			},
			setValue: function(value) {
				this.value = value;
			},
			getValue: function() {
				return this.value;
			}
		};
		return Return;
	};
})();
