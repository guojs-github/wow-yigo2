YIUI.UIUtil = (function () {
    var Return = {
        getCompValue: function (control, table) {
            var compValue = null;
            var value = null;

            var columnKey = control.columnKey;

            if (table.isValid()) {
                value = table.getByKey(columnKey);
            }
            if (value == null) {
                return value;
            }
            var type = control.type || control.editOptions.cellType;
            var itemKey;
            switch (type) {
                case YIUI.CONTROLTYPE.DICT:
                case YIUI.CONTROLTYPE.COMPDICT:
                case YIUI.CONTROLTYPE.DYNAMICDICT:
                    itemKey = control.itemKey || control.editOptions.itemKey;
                    if (control.editOptions.allowMultiSelection) {
                        if (type == YIUI.CONTROLTYPE.DYNAMICDICT) {
                            itemKey = table.getByKey(columnKey + "ItemKey");
                        }

                        if (type == YIUI.CONTROLTYPE.COMPDICT) {
                            throw new YIUI.ViewException(YIUI.ViewException.COMPDICT_CANNOT_SET_MULTIDICT,
                                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPDICT_CANNOT_SET_MULTIDICT, control.key));
                        }
                    } else {
                        if ((parseInt(value)) <= 0) {
                            break;
                        }
                        if (type == YIUI.CONTROLTYPE.DYNAMICDICT) {
                            itemKey = table.getByKey(columnKey + "ItemKey");

                            if (itemKey == null || itemKey.length == 0) {
                                throw new YIUI.ViewException(YIUI.ViewException.DYNAMICDICT_ITEMKEY_NULL,
                                    YIUI.ViewException.formatMessage(YIUI.ViewException.DYNAMICDICT_ITEMKEY_NULL, control.key));
                            }
                        } else if (type == YIUI.CONTROLTYPE.COMPDICT) {
                            itemKey = table.getByKey(columnKey + "ItemKey");
                            if (itemKey == null || itemKey.length == 0) {
                                throw new YIUI.ViewException(YIUI.ViewException.COMPDICT_ITEMKEY_NULL,
                                    YIUI.ViewException.formatMessage(YIUI.ViewException.COMPDICT_ITEMKEY_NULL, control.key));
                            }
                            if (control.multiSelect) {
                                throw new YIUI.ViewException(YIUI.ViewException.COMPDICT_CANNOT_SET_MULTIDICT,
                                    YIUI.ViewException.formatMessage(YIUI.ViewException.COMPDICT_CANNOT_SET_MULTIDICT, control.key));
                            }
                        }
                    }

                    //是否有预加载的caption字段
                    var captionKey = columnKey + "_caption";
                    var columnIndex = table.indexByKey(captionKey);
                    if(columnIndex > 0){

                    }else{
                        compValue = this.convertDictValue(itemKey, control, value);
                    }

                    break;
                default:
                    compValue = value;
            }
            return compValue;
        },

        convertDictValue: function (itemKey, control, value) {
            var ret = null;
            if (control.editOptions.allowMultiSelection) {
                var ids = value;
                if (ids.length > 0) {
                    var oids = ids.split(",");
                    if (oids.length > 0) {
                        var list = [];
                        for (var i = 0, len = oids.length; i < len; i++) {
                            list.push(new YIUI.ItemData({
                                itemKey: itemKey,
                                oid: oids[i]
                            }));
                        }
                        ret = list;
                    }
                }
            } else {
                var oid = parseFloat(value);
                ret = new YIUI.ItemData({
                        itemKey: itemKey,
                        oid: oid
                    });
            }
            return ret;
        },


        format: function (format, args, startPos) {
            var result = "";
            var length = format.length;
            var Para = function () {
                this.index = -1;
                this.setIndex = function (index) {
                    this.index = index;
                };
                this.getIndex = function () {
                    return this.index;
                }
            };
            var v = [];
            var l_i = 0;
            var i = 0;
            while (i < length) {
                var c = format.charAt(i);
                if (c == '{') {
                    var s_b = i;
                    var s_e = -1;
                    // 潜在的参数
                    ++i;
                    if (i < length) {
                        c = format.charAt(i);
                        if ($.isNumeric(c)) {
                            while ($.isNumeric(c) && i < length) {
                                ++i;
                                c = format.charAt(i);
                            }
                            if (i < length) {
                                if (c == '}') {
                                    s_e = i;
                                }
                                ++i;
                            }
                        } else {
                            ++i;
                        }
                    }
                    if (s_e != -1) {
                        // 生成之前的字符串
                        if (l_i < s_b) {
                            v.push(format.substring(l_i, s_b));
                        }

                        // 找到一个参数
                        var p = new Para();
                        var s = format.substring(s_b + 1, s_e);
                        p.setIndex(parseInt(s));
                        v.push(p);
                        l_i = s_e + 1;
                    }
                } else {
                    ++i;
                }
            }
            if (l_i < i) {
                v.push(format.substring(l_i));
            }

            var obj;
            for (var vi = 0, len = v.length; vi < len; vi++) {
                obj = v[vi];
                if (obj instanceof  Para) {
                    result += args[obj.getIndex() - 1 + startPos];
                } else {
                    result += obj;
                }
            }

            return result;
        },
        
        isNull: function (v) {
            return (v == undefined || v == null);
        },

        getErrorMsg: function(o) {
            var msg = "",idx = 1;
            for( var i in o) {
                if( o.hasOwnProperty(i) && o[i] ) {
                    msg += (idx++) + ":" + o[i] + "\n";
                }
            }
            return msg;
        },

        getCompareType: function (v1, v2) {
            var type = -1;
            if (this.isNull(v1)) {
                var temp = v2;
                v2 = v1;
                v1 = temp;
            }
            if (this.isNull(v1)) {
                type = DataType.NUMERIC;
            } else if (typeof v1 == "string") {
                if ($.isNumeric(v1)) {
                    type = DataType.NUMERIC;
                } else {
                    type = DataType.STRING;
                }
            } else if (typeof v1 == "number") {
                if (this.isNull(v2)) {
                    type = DataType.NUMERIC;
                } else if (typeof v2 == "string") {
                    type = DataType.STRING;
                } else {
                    type = DataType.NUMERIC;
                }
            } else if (typeof  v1 == "boolean") {
                if (this.isNull(v2)) {
                    type = DataType.NUMERIC;
                } else if (typeof v2 == "number" || v2 instanceof Decimal) {
                    type = DataType.NUMERIC;
                } else if (typeof v2 == "string") {
                    type = DataType.STRING;
                } else if (typeof v2 == "boolean") {
                    type = DataType.BOOLEAN;
                }
            } else if (v1 instanceof Decimal) {
                if (this.isNull(v2)) {
                    type = DataType.NUMERIC;
                } else if (typeof v2 == "number" || v2 instanceof Decimal) {
                    type = DataType.NUMERIC;
                } else if (typeof v2 == "string") {
                    type = DataType.STRING;
                } else if (typeof v2 == "boolean") {
                    type = DataType.BOOLEAN;
                }
            }
            return type;
        },
        dataType2JavaDataType: function (dataType) {
            switch (dataType) {
                case YIUI.DataType.LONG:
                    return YIUI.JavaDataType.USER_LONG;
                case YIUI.DataType.BINARY:
                    return YIUI.JavaDataType.USER_BINARY;
                case YIUI.DataType.BOOLEAN:
                    return YIUI.JavaDataType.USER_BOOLEAN;
                case YIUI.DataType.DATE:
                case YIUI.DataType.DATETIME:
                    return YIUI.JavaDataType.USER_DATETIME;
                case YIUI.DataType.DOUBLE:
                case YIUI.DataType.FLOAT:
                case YIUI.DataType.NUMERIC:
                    return YIUI.JavaDataType.USER_NUMERIC;
                case YIUI.DataType.INT:
                    return YIUI.JavaDataType.USER_INT;
                case YIUI.DataType.STRING:
                case YIUI.DataType.TEXT:
                case YIUI.DataType.FIXED_STRING:
                    return YIUI.JavaDataType.USER_STRING;
            }
            return -1;
        }
    };

    return Return;
})();