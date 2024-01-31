var FilterMap = FilterMap || {};

(function () {

    FilterMap = function (jsonObj) {
    	jsonObj = jsonObj || {};
        var Return = {
            type: jsonObj["type"] || YIUI.DocumentType.DATAOBJECT,
            OID: jsonObj["OID"] || -1,
            needDocInfo: jsonObj["needDocInfo"] || true,
            filterMap: jsonObj["filterMap"] || new Array(),
            setOID: function (OID) {
                this.OID = OID;
            },
            getOID: function () {
                return this.OID;
            },
            setType: function (type) {
                this.type = type;
            },
            getType: function () {
                return this.type;
            },
            setNeedDocInfo: function (needDocInfo) {
                this.needDocInfo = needDocInfo;
            },
            isNeedDocInfo: function () {
                return this.needDocInfo;
            },
            setFilterMap: function (filterMap) {
                this.filterMap = filterMap;
            },
            getFilterMap: function () {
                return this.filterMap;
            },
            addTblDetail: function (tblDetail) {
                this.filterMap.push(tblDetail);
            },
            setStartRow: function (tableKey, row) {
                this.getTblFilter(tableKey).startRow = row;
            },
            setMaxRows: function (tableKey, max) {
                this.getTblFilter(tableKey).maxRows = max;
            },
            setIndicatorCount: function(tableKey, count) {
                this.getTblFilter(tableKey).INDICATORCOUNT = count;
            },
            getTblFilter: function (tableKey) {
                var tbl = this.get(tableKey);
                if (tbl == null) {
                    tbl = new FilterMap.TableFilterDetail();
                    tbl.setTableKey(tableKey);
                    this.addTblDetail(tbl);
                }
                return tbl;
            },
            get: function (tableKey) {
                var maps = this.filterMap, map;
                for (var i = 0, len = maps.length; i < len; i++) {
                    map = maps[i];
                    if (map.tableKey == tableKey) {
                        return map;
                    }
                }
                return null;
            },
            reset: function () {
                this.filterMap.forEach(function (fd) {
                    fd.startRow = 0;
                });
            }
        };
        return Return;
    };

    FilterMap.TableFilterDetail = function () {
        var Return = {
            tableKey: "",
            filter: "",
            startRow: 0,
            maxRows: 0,
            OID: -1,
            fieldValues: null,
            paraValues: null,
            SourceKey: "",
            indicatorCount: 1,
            OrderField: [],
            OrderFieldType: [],
            setTableKey: function (tableKey) {
                this.tableKey = tableKey;
            },
            setFilter: function (filter) {
                this.filter = filter;
            },
            setStartRow: function (startRow) {
                this.startRow = startRow;
            },
            setMaxRows: function (maxRows) {
                this.maxRows = maxRows;
            },
            setPageIndicatorCount: function(count) {
            	this.indicatorCount = count;
            },
            setFieldValues: function (fieldValues) {
                this.fieldValues = fieldValues;
            },
            setParaValues: function (paraValues) {
                this.paraValues = paraValues;
            },
            setSourceKey: function (sourceKey) {
                this.SourceKey = sourceKey;
            },
            addOrderField: function (key, value) {
            	var i = this.OrderField.indexOf(key);
            	if (i > -1) {
            		this.OrderField.splice(i, 1);
                	this.OrderFieldType.splice(i, 1);
            	}
            	
            	this.OrderField.push(key);
            	this.OrderFieldType.push(value);
            },
            clearOrderField: function () {
            	this.OrderField.splice(0, this.OrderField.length);
            	this.OrderFieldType.splice(0, this.OrderFieldType.length);
            }
        };
        return Return;
    };


})();
