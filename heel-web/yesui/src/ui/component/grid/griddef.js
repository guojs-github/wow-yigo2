(function () {
    
    var equals = function (o1,o2) {
        if( o1 instanceof Decimal ) {
            return o1.equals(o2);
        } else if ( o1 instanceof Date ) {
            return o1.getTime() == o2.getTime();
        }
        return o1 == o2;
    }
    
    YIUI.MultiDimNode = YIUI.extend({
        columnKey: "",
        dataType: -1,
        value: null,
        init: function (options) {
            this.columnKey = options.columnKey;
            this.dataType = options.dataType;
            this.value = options.value;
        },
        getColumnKey: function () {
            return this.columnKey;
        },
        getDataType: function () {
            return this.dataType;
        },
        getValue: function () {
            return this.value;
        },
        equals: function (obj) {
            if (this == obj) return true;
            if (obj == null) return false;
            if (typeof obj != typeof this) return false;
            if (this.columnKey != obj.columnKey ) return false;
            if (this.dataType != obj.dataType) return false;
            if (this.value == null) {
                if (obj.value != null)
                    return false;
            } else if (!equals(this.value,obj.value)) {
                return false;
            }
            return true;
        },
        clone: function () {
            return new YIUI.MultiDimNode({
                columnKey: this.columnKey,
                dataType: this.dataType,
                value: this.value
            });
        }
    });
    YIUI.MultiDimValue = YIUI.extend({
        values: [],
        init: function (json) {
            this.values = [];
            if( json ) {
                for( var i = 0,length = json.length;i < length;i++ ) {
                    this.addValue(new YIUI.MultiDimNode(json[i]));
                }
            }
        },
        setValues: function (values) {
            this.values = values;
        },
        addValue: function (value) {
            this.values.push(value);
        },
        addAll: function (values) {
            for( var i = 0,v;v = values[i];i++ ) {
                this.values.push(v);
            }
        },
        size: function () {
            return this.values.length;
        },
        getValue: function (index) {
            return this.values[index];
        },
        clone: function () {
            var newObj = new YIUI.MultiDimValue();
            for (var i = 0,value; value = this.values[i]; i++) {
                newObj.addValue(value.clone());
            }
            return newObj;
        },
        equals: function (obj) {
            if (obj == this) return true;
            if (obj == null) return false;
            if (typeof obj != typeof this) return false;
            if (this.size() != obj.size()) return false;
            for (var i = 0, len = this.size(); i < len; i++) {
                var node_A = this.getValue(i);
                var node_B = obj.getValue(i);
                if (!node_A.equals(node_B)) {
                    return false;
                }
            }
            return true;
        }
    });
    YIUI.MultiKeyNode = YIUI.extend({
        dataType: -1,
        value: null,
        init: function (dataType, value) {
            this.dataType = dataType;
            this.value = value;
        },
        getDataType: function () {
            return this.dataType;
        },
        getValue: function () {
            return this.value;
        },
        equals: function (obj) {
            if (this == obj) return true;
            if (obj == null) return false;
            if (typeof obj != typeof this) return false;
            if (this.dataType != obj.dataType) return false;
            if (this.value == null) {
                if (obj.value != null) {
                    return false;
                }
            } else if (!equals(this.value,obj.value)) {
                return false;
            }
            return true;
        },
        toString: function () {
            return (this.value == null ? '' : this.value.toString()) + '_' + this.dataType;
        },
        clone: function () {
            return new YIUI.MultiKeyNode(this.dataType, this.value);
        }
    });
    YIUI.MultiKey = YIUI.extend({
        values: [],
        userObject: null,
        init: function () {
            this.values = [];
        },
        setValues: function (values) {
            this.values = values;
        },
        addValue: function (value) {
            this.values.push(value);
        },
        addAll: function (valueList) {
            for( var i = 0,v;v = valueList[i];i++ ) {
                this.values.push(v);
            }
        },
        getValueCount: function () {
            return this.values.length;
        },
        getValue: function (index) {
            return this.values[index];
        },
        setUserObject: function (userObj) {
            this.userObject = userObj;
        },
        getUserObject: function () {
            return this.userObject;
        },
        contains: function (otherValue) {
            var count = this.getValueCount(),
                otherCount = otherValue.getValueCount(),
                v1,
                v2;

            if( count < otherCount ) {
                return false;
            }

            for( var i = 0;i < otherCount;i++ ) {
                v1 = this.getValue(i);
                v2 = otherValue.getValue(i);
                if( !v1.equals(v2) ) {
                    return false;
                }
            }
            return true;
        },
        clone: function () {
            var newObj = new YIUI.MultiKey();
            for (var i = 0,value; value = this.values[i]; i++) {
                newObj.addValue(value.clone());
            }
            return newObj;
        },
        shallowClone: function () {
            var newObj = new YIUI.MultiKey();
            newObj.addAll(this.values);
            return newObj;
        },
        newInstance: function () {
            return new YIUI.MultiKey();
        },
        toString: function () {
            var sValue = '';
            for (var i = 0,value; value = this.values[i]; i++) {
                sValue += value.toString() + "_";
            }
            return sValue.substring(0,sValue.length - 1);
        },
        equals: function (obj) {
            if (obj == this) return true;
            if (obj == null) return false;
            if (typeof obj != typeof this) return false;
            if (this.getValueCount() != obj.getValueCount()) return false;
            for (var i = 0, len = this.getValueCount(); i < len; i++) {
                var node_A = this.getValue(i);
                var node_B = obj.getValue(i);
                if (!node_A.equals(node_B)) {
                    return false;
                }
            }
            return true;
        },
        compare: function (other) {
            var count = this.getValueCount(), result = 0;
            for (var i = 0; i < count; i++) {
                var node1 = this.getValue(i), node2 = other.getValue(i),
                    value1 = node1.getValue(), value2 = node2.getValue();
                if (value1 == null && value2 != null) {
                    return -1;
                } else if (value1 != null && value2 == null) {
                    return -1;
                } else if (value1 == null && value2 == null) {
                    continue;
                }
                switch (node1.getDataType()) {
                    case YIUI.JavaDataType.USER_INT:
                    case YIUI.JavaDataType.USER_LONG:
                    case YIUI.JavaDataType.USER_NUMERIC:
                        result = YIUI.TypeConvertor.toDecimal(value1).comparedTo(YIUI.TypeConvertor.toDecimal(value2));
                        break;
                    case YIUI.JavaDataType.USER_DATETIME:
                        var date1 = YIUI.TypeConvertor.toDate(value1).getTime(),
                            date2 = YIUI.TypeConvertor.toDate(value2).getTime();
                        result = (date1 - date2) > 0 ? 1 : (date1 == date2 ? 0 : -1);
                        break;
                    case YIUI.JavaDataType.USER_STRING:
                        result = YIUI.TypeConvertor.toString(value1).localeCompare(YIUI.TypeConvertor.toString(value2));
                        break;
                }
                if (result != 0) {
                    break;
                }
            }
            return result;
        }
    });
    YIUI.BaseRowBkmk = YIUI.extend({
        bookmark: -1,
        init: function (bkmk) {
            this.bookmark = (bkmk != undefined ? bkmk : -1);
        },
        setBookmark: function (bkmk) {
            this.bookmark = bkmk;
        },
        getBookmark: function () {
            return this.bookmark;
        }
    });
    YIUI.FixRowBkmk = YIUI.extend(YIUI.BaseRowBkmk, {
        getRowType: function () {
            return YIUI.IRowBkmk.Fix;
        }
    });
    YIUI.DetailRowBkmk = YIUI.extend(YIUI.BaseRowBkmk, {
        getRowType: function () {
            return YIUI.IRowBkmk.Detail;
        },
        toString: function () {
            return "Detail_" + this.bookmark;
        },
        equals: function (obj) {
            if (obj == null) {
                return false;
            }
            if (!(obj instanceof  YIUI.DetailRowBkmk)) {
                return false;
            }
            return this.bookmark == obj.bookmark;
        }
    });
    YIUI.GroupRowBkmk = YIUI.extend(YIUI.BaseRowBkmk, {
        rowArray: [],
        metaGroup: null,
        isLeaf: false,
        groupValue: null,
        init: function (groupValue) {
            this.groupValue = groupValue;
            this.rowArray = [];
        },
        getRowType: function () {
            return YIUI.IRowBkmk.Group;
        },
        addRow: function (bkmk) {
            this.rowArray.push(bkmk);
        },
        setLeaf: function (isLeaf) {
            this.isLeaf = isLeaf;
        },
        getRowCount: function () {
            return this.rowArray.length;
        },
        getRowAt: function (rowIndex) {
            if (rowIndex < 0 || rowIndex >= this.rowArray.length)
                return null;
            return this.rowArray[rowIndex];
        },
        setMetaGroup: function (metaGroup) {
            this.metaGroup = metaGroup;
        },
        getMetaGroup: function () {
            return this.metaGroup;
        }
    });
    YIUI.MultiRowBkmk = YIUI.extend(YIUI.BaseRowBkmk, {
        rowMap: [],
        init: function () {
          this.rowMap = [];
        },
        put: function(dimValue,bkmk) {
            var isMatch = false;
            for (var i = 0,e; e = this.rowMap[i]; i++) {
                if (e.key.equals(dimValue)) {
                    e.rows.push(bkmk);
                    isMatch = true;
                    break;
                }
            }
            if (!isMatch) {
                this.rowMap.push({key: dimValue, rows: [bkmk]});
            }
        },
        get: function (dimValue) {
            for (var i = 0,e; e = this.rowMap[i]; i++) {
                if (e.key.equals(dimValue)) {
                    return e.rows;
                }
            }
            return null;
        },
        getRowType: function () {
            return YIUI.IRowBkmk.Multiple;
        }
    });
    YIUI.ExpandRowBkmk = YIUI.extend(YIUI.BaseRowBkmk, {
        rowArray: [],
        expandRowMapList: [],
        init: function (count) {
            this.rowArray = [];
            this.expandRowMapList = [];
            for (var i = 0; i < count; i++) {
                this.expandRowMapList.push(new YIUI.RowMap());
            }
        },
        getRowType: function () {
            return YIUI.IRowBkmk.Expand;
        },
        size: function () {
            return this.rowArray.length;
        },
        add: function (areaIndex, key, row) {
            if (this.rowArray.indexOf(row) < 0) {
                this.rowArray.push(row);
            }
            var map = this.expandRowMapList[areaIndex], isMatch = false;
            for (var i = 0, len = map.size(); i < len; i++) {
                if (map.getAt(i).key.equals(key)) {
                    map.getAt(i).row = row;
                    isMatch = true;
                    break;
                }
            }
            if (!isMatch) {
                map.put(key, row);
            }
        },
        getAt: function (index) {
            return this.rowArray[index];
        },
        getRowArray: function () {
            return this.rowArray;
        },
        getAtArea: function (areaIndex, key) {
            var map = this.expandRowMapList[areaIndex];
            for (var i = 0, len = map.size(); i < len; i++) {
                if (map.getAt(i).key.equals(key)) {
                    return map.getAt(i).row;
                }
            }
            return null;
        }
    });
    YIUI.ExpandItem = YIUI.extend({
        value: null,
        caption: '',
        dataType: -1,

        init:function (value,caption,dataType) {
            this.value = value;
            this.caption = caption;
            this.dataType = dataType;
        }
    });
})();