var Lang = (function() {
	var ext = new Object();
	ext.impl = function(clsObj, impls) {
		for (var name in impls) {
			clsObj.prototype[name] = impls[name];
		}
	};
	ext.assign = function(obj, values) {
		for (var name in values) {
			obj[name] = values[name];
		}
	};
	return ext;
})();

function HashMap() {
	this.size = 0;
	this.table = new Object();
}
	
Lang.impl(HashMap, {
	put: function(key, value) {
		var added = false;
		if ( !this.containsKey(key) ) {
			++this.size;
			added = true;
		}
		this.table[key] = value;
		return added;
	},
	get: function(key) {
		return this.containsKey(key) ? this.table[key] : null;
	},
	remove: function(key) {
		if ( this.containsKey(key) && (delete this.table[key]) ) {
			--this.size;
		}
	},
	containsKey: function(key) {
		return key in this.table;
	},
	keys: function() {
		var keys = new Array();
		for ( var prop in this.table ) {
			keys.push(prop);
		}
		return keys;
	},
	empty: function() {
		return this.size == 0;
	},
	clear: function() {
		this.table = new Object();
	}
});

function HashMapIgnoreCase() {
	this.size = 0;
	this.table = new Object();
}

Lang.impl(HashMapIgnoreCase, {
	put: function(key, value) {
		key = key.toLowerCase();
		var added = false;
		if ( !this.containsKey(key) ) {
			++this.size;
			added = true;
		}
		this.table[key] = value;
		return added;
	},
	get: function(key) {
		key = key.toLowerCase();
		return this.containsKey(key) ? this.table[key] : null;
	},
	remove: function(key) {
		key = key.toLowerCase();
		if ( this.containsKey(key) && (delete this.table[key]) ) {
			--this.size;
		}
	},
	containsKey: function(key) {
		key = key.toLowerCase();
		return key in this.table;
	},
	keys: function() {
		var keys = new Array();
		for ( var prop in this.table ) {
			keys.push(prop);
		}
		return keys;
	},
	empty: function() {
		return this.size == 0;
	},
	clear: function() {
		this.table = new Object();
	}
});

function Stack() {
	this.table = new Array();
}

Lang.impl(Stack, {
	push: function(value) {
		this.table.push(value);
	},
	pop: function() {
		return this.table.pop();
	},
	peek: function() {
		return this.table[this.table.length - 1];
	},
	empty: function() {
		return this.table.length == 0;
	},
	values: function() {
		return this.table;
	},
	size: function() {
		return this.table.length;
	}
});var DataType = (function () {
    var Return = {
        /** 32位整型 */
        INT: 1001,

        /** 字符串类型 */
        STRING: 1002,

        /** 日期类型 */
        DATE: 1003,

        /** 日期时间类型 */
        DATETIME: 1004,

        /** 数值类型 */
        NUMERIC: 1005,

        /** 双精度浮点数类型 */
        DOUBLE: 1006,

        /** 浮点数类型 */
        FLOAT: 1007,

        /** 二进制类型 */
        BINARY: 1008,

        /** 布尔类型 */
        BOOLEAN: 1009,

        /** 64位整型 */
        LONG: 1010
    };
    return Return;
})();

var DynamicCell = (function () {
    var Return = {
        getCellTypeTable: function () {
            if (Return.CellTypeTable == null) {
                var paras = {
                    cmd: "GetCellTypeTable",
                    service: "PureMeta"
                };
                Return.CellTypeTable = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
            }
            return Return.CellTypeTable;
        }
    };
    Return.CellTypeTable = null;
    return Return;
})();

var DataDef = DataDef || {};

(function () {
    Lang.assign(DataDef, {
        R_Normal: 0,
        R_New: 1,
        R_Modified: 2,
        R_Deleted: 3,

        D_Normal: 0,
        D_New: 1,
        D_Modified: 2,
        D_Deleted: 3,

        D_Obj: 1,
        D_ObjDtl: 2
    });

    DataDef.BkmkMap = function () {
        this.tbs = new Array();
    };

    Lang.impl(DataDef.BkmkMap, {
        put: function (bkmk, idx) {
            if (bkmk >= this.tbs.length) {
                this.tbs.length = bkmk + 1;
            }
            this.tbs[bkmk] = idx;
        },
        get: function (bkmk) {
            if (bkmk < this.tbs.length) {
                return this.tbs[bkmk];
            }
            return undefined;
        },
        remove: function (bkmk) {
            this.tbs[bkmk] = undefined;
        },
        clear: function () {
            this.tbs = new Array();
        }
    });

    DataDef.ColInfo = function (key, type, userType, accessControl) {
        this.key = key;
        this.type = type;
        this.userType = userType;
        this.accessControl = accessControl;
    };

    Lang.impl(DataDef.ColInfo, {
        setKey: function (key) {
            this.key = key;
        },
        getKey: function () {
            return this.key;
        },
        setType: function (type) {
            this.type = type;
        },
        getType: function () {
            return this.type;
        },
        setUserType: function (userType) {
            this.userType = userType;
        },
        getUserType: function () {
            return this.userType;
        },
        setAccessControl: function (accessControl) {
            this.accessControl = accessControl;
        },
        getAccessControl: function () {
            return this.accessControl;
        }
    });

    DataDef.Row = function (size) {
        this.bkmk = -1;
        this.state = 0;
        this.orgVals = null;
        this.vals = new Array(size);
    };

    DataDef.DataTable = function () {
        this.key = "";
        this.allRows = new Array();
        this.rows = new Array();
        this.cols = new Array();
        this.bkmks = new DataDef.BkmkMap();
        this.pos = -1;
        this.bkmkSeed = 0;
        this.tableMode = -1;
    };

    Lang.impl(DataDef.DataTable, {
        clone: function () {
            var newTable = new DataDef.DataTable();
            newTable.key = this.key;
            newTable.pos = this.pos;
            newTable.bkmkSeed = this.bkmkSeed;
            newTable.bkmks = $.extend(true, {}, this.bkmks);
            newTable.allRows = $.extend(true, [], this.allRows);
            newTable.rows = $.extend(true, [], this.rows);
            newTable.cols = $.extend(true, [], this.cols);
            return newTable;
        },
        addCol: function (key, type, userType, accessControl) {
            var c = new DataDef.ColInfo(key, type, userType, accessControl);
            this.cols.push(c);
        },
        getCol: function (index) {
            return this.cols[index];
        },
        getColByKey: function (colKey) {
            return this.getCol(this.indexByKey(colKey));
        },
        addRow: function () {
            var r = new DataDef.Row(this.cols.length);
            r.bkmk = this.bkmkSeed++;
            r.state = DataDef.R_New;
            this.rows.push(r);
            this.allRows.push(r);
            this.bkmks.put(r.bkmk, this.rows.length - 1);
            this.pos = this.rows.length - 1;
        },
        size: function () {
            return this.rows.length;
        },
        setPos: function (pos) {
            this.pos = pos;
        },
        pos: function () {
            return this.pos;
        },
        setByBkmk: function (bkmk) {
            var idx = this.bkmks.get(bkmk);
            if (idx != undefined) {
                this.pos = idx;
            } else {
                this.pos = -1;
            }
        },
        getBkmk: function () {
            return this.rows[this.pos].bkmk;
        },
        getParentBkmk: function () {
            return this.rows[this.pos].parentBkmk;
        },
        beforeFirst: function () {
            this.pos = -1;
        },
        afterLast: function () {
            this.pos = this.rows.length;
        },
        next: function () {
            if (this.pos == this.rows.length) {
                return false;
            }
            ++this.pos;
            return this.pos != this.rows.length;
        },
        previous: function () {
            if (this.pos == -1) {
                return false;
            }
            --this.pos;
            return this.pos != -1;
        },
        first: function () {
            if (this.rows.length == 0) {
                return false;
            }
            this.pos = 0;
            return true;
        },
        last: function () {
            if (this.rows.length == 0) {
                return false;
            }
            this.pos = this.rows.length - 1;
            return true;
        },
        getRowCount: function () {
            return this.rows.length;
        },
        isBeforeFirst: function () {
            return this.pos == -1;
        },
        isAfterLast: function () {
            return this.pos == this.rows.length;
        },
        isFirst: function () {
            return this.rows.length != 0 && this.pos == 0;
        },
        isLast: function () {
            return this.rows.length != 0 && this.pos == this.rows.length - 1;
        },
        isValid: function () {
            return this.rows.length != 0 & this.pos >= 0 && this.pos < this.rows.length;
        },
        get: function (idx) {
            return this.rows[this.pos].vals[idx];
        },
        set: function (idx, val) {
            var row = this.rows[this.pos];
            var rowState = row.state;
            if (rowState == DataDef.R_Normal) {
                row.orgVals = $.extend([], row.vals);
                row.state = DataDef.R_Modified;
            }
            row.vals[idx] = val;
        },
        indexByKey: function (key) {
            var cIdx = -1;
            for (var i = 0, l = this.cols.length; i < l; ++i) {
                var col = this.cols[i];
                if (col.key.toLowerCase() == key.toLowerCase()) {
                    cIdx = i;
                    break;
                }
            }
            return cIdx;
        },
        getByKey: function (key) {
            return this.get(this.indexByKey(key));
        },
        setByKey: function (key, val) {
            this.set(this.indexByKey(key), val);
        },

        setNew: function () {
            this.rows = [];
            this.bkmks.clear();
            this.pos = -1;
            this.rows = this.allRows;
            for (var i = 0, len = this.rows.length; i < len; i++) {
                var row = this.rows[i];
                this.bkmks.put(row.bkmk, i);
                row.state = DataDef.R_New;
                row.orgVals = [];
            }
        },
        delRow: function (idx) {
            if (idx == null) {
                idx = this.pos;
            }
            var r = this.rows[idx], oldSize = this.rows.length;
            if (r.state == DataDef.R_New) {
                this.rows.splice(idx, 1);
                this.allRows.splice(idx, 1);
                this.bkmks.remove(r.bkmk);
                if (this.pos > idx)
                    this.pos--;
            } else {
                r.state = DataDef.R_Deleted;
            }
            var newSize = this.rows.length;
            if (newSize != oldSize) {
                for (var i = 0, len = this.rows.length; i < len; i++) {
                    r = this.rows[i];
                    this.bkmks.put(r.bkmk, i);
                }
            }
        },
        batchUpdate: function () {
            var l = this.allRows.length;
            for (var i = l - 1; i >= 0; --i) {
                var r = this.allRows[i];
                if (r.state == DataDef.R_Deleted) {
                    this.allRows.splice(i, 1);
                } else {
                    r.state = DataDef.R_Normal;
                    r.orgVals = null;
                }
            }
        }
    });

    DataDef.Document = function () {
        this.tbls = new Array();
        this.maps = new HashMap();
        this.oid = -1;
        this.poid = -1;
        this.verid = -1;
        this.dverid = -1;
        this.state = 0;
        this.docType = DataDef.D_Obj;
        this.expData = new HashMap();
        this.expDataType = new HashMap();
        this.expDataClass = new HashMap();
        this.mainTableKey = "";
    };

    Lang.impl(DataDef.Document, {
        isNew: function () {
            return this.state == YIUI.DocType.NEW;
        },
        getExpDataInfo: function (key) {
            return {data: this.expData[key], dataType: this.expDataType[key], dataClass: this.expDataClass[key]};
        },
        putExpandData: function (key, value) {
            this.expData[key] = value;
        },
        add: function (key, tbl) {
            this.tbls.push(tbl);
            this.maps.put(key, tbl);
        },
        remove: function (key) {
            var tbl = this.maps.get(key);
            this.maps.remove(key);
            for (var i = this.tbls.length - 1; i >= 0; --i) {
                if (this.tbls[i] == tbl) {
                    this.tbls.splice(i, 1);
                    break;
                }
            }
        },
        get: function (idx) {
            return this.tbls[idx];
        },
        setByKey: function (key, tbl) {
            this.maps.put(key, tbl);
            for (var i = this.tbls.length - 1; i >= 0; --i) {
                if (this.tbls[i].key == key) {
                    this.tbls.splice(i, 1, tbl);
                    break;
                }
            }
        },
        getByParentKey: function (parentKey) {
            var subTables = [], table;
            for (var i = 0, len = this.tbls.length; i < len; i++) {
                table = this.tbls[i];
                if (table.parentKey == parentKey) {
                    subTables.push(table);
                }
            }
            return subTables;
        },
        getByKey: function (key) {
            return this.maps.get(key);
        },
        clear: function () {
            this.tbls.length = 0;
            this.maps.clear();
        },
        setDocType: function (type) {
            this.docType = type;
        },
        setModified: function () {
            this.state = DataDef.D_Modified;
        },
        batchUpdate: function () {
            for (var i = 0, l = this.tbls.length; i < l; ++i) {
                var t = this.tbls[i];
                t.batchUpdate();
            }
        },
        clone: function () {
            var newDoc = new DataDef.Document();
            newDoc.oid = this.oid;
            newDoc.poid = this.poid;
            newDoc.verid = this.verid;
            newDoc.dverid = this.dverid;
            newDoc.state = this.state;
            newDoc.docType = this.docType;
            newDoc.mainTableKey = this.mainTableKey;
            newDoc.tbls = [];
            newDoc.maps = new HashMap();
            for (var i = 0, table, len = this.tbls.length; i < len; i++) {
                table = this.tbls[i].clone();
                newDoc.tbls.push(table);
                newDoc.maps.put(table.key, table);
            }
            newDoc.expData = $.extend(true, {}, this.expData);
            newDoc.expDataType = $.extend(true, {}, this.expDataType);
            newDoc.expDataClass = $.extend(true, {}, this.expDataClass);
            return newDoc;
        }
    });

    DataDef.Item = function () {
        this.itemKey = null;
        this.oid = 0;
        this.nodeType = 0;
        this.enable = 0;
        this.caption = null;
        this.mainTableKey = null;
        this.itemTables = {};
    };

    Lang.impl(DataDef.Item, {
        toItemData: function () {
            var itemData = {};
            itemData.itemKey = this.itemKey;
            itemData.oid = this.oid;
            return itemData;
        },

        getValue: function (fieldKey, tableKey) {
            if (!tableKey) {
                tableKey = this.mainTableKey;
            }

            var table = this.itemTables[tableKey];

            var value = null;
            if (table && table.itemRows.length > 0) {
                if (table.tableMode == 0) {
                    value = table.itemRows[0][fieldKey];
                } else {
                    var len = table.itemRows.length;

                    value = new Array(len);

                    for (var i = 0; i < len; i++) {
                        value.push(table.itemRows[i][fieldKey]);
                    }
                }
            }

            return value;

        }
    });
})();




var YIUI = YIUI || {};
/**
 * 组件类型
 */
YIUI.CONTROLTYPE = {
    PANEL: 0,
    COLUMNLAYOUTPANEL: 1,
    GRIDLAYOUTPANEL: 2,
    SPLITPANEL: 3,
    PAGEPANEL: 4,
    TABPANEL: 5,
    HTMLPANEL: 6,
    FLOWLAYOUTPANEL: 7,
    BORDERLAYOUTPANEL: 8,
    FLEXFLOWLAYOUTPANEL: 9,
    TABLELAYOUTPANEL: 10,
    FLUIDTABLELAYOUTPANEL: 12,

    BUTTON: 200,
    CHECKBOX: 201,
    CHECKLISTBOX: 202,
    COLORPICKER: 203,
    COMBOBOX: 204,
    DATEPICKER: 205,
    DICT: 206,
    FONTPICKER: 207,
    HYPERLINK: 208,
    LABEL: 209,
    NUMBEREDITOR: 210,
    IMAGE: 211,
    PROGRESSBAR: 212,
    RADIOBUTTON: 213,
    TEXTBUTTON: 214,
    TEXTEDITOR: 215,
    LISTVIEW: 216,
    GRID: 217,
    IMAGELIST: 218,
    MASKEDITOR: 219,
    TREEVIEW: 220,
    MENUBAR: 221,
    TREEMENUBAR: 222,
    TOOLBAR: 223,
    CALENDAR: 224,
    RICHEDITOR: 225,
    CHART: 226,
    MAP: 227,
    CONTAINER: 228,
    STATUSBAR: 229,
    BUTTON_GROUP: 230,
    SEPARATOR: 231,
    TOGGLEBUTTON: 232,
    WEBBROWSER: 233,
    PASSWORDEDITOR: 234,
    TREEMENU: 235,
    SPLITBUTTON: 236,
    DROPDOWNBUTTON: 237,
    EMBEDSUB: 238,
    BPM_GRAPH: 239,
    UPLOADBUTTON: 240,
    DYNAMICDICT: 241,
    COMPDICT: 242,
    STATELIST: 243,
    DICTVIEW: 244,
    ATTACHMENT: 245,
    TEXTAREA: 246,
    UTCDATEPICKER: 254,
    DYNAMIC : 20001
};
/**
 * DataObjectSecondaryType
 */
YIUI.SECONDARYTYPE = {
    /** 普通实体数据 */
    NORMAL: 2,
    /** 字典数据 */
    DICT: 3,
    /** 复合字典数据 */
    COMPDICT: 4,
    /** 链式字典数据 */
    CHAINDICT: 5
};
/**
 * 下拉框sourceType
 */
YIUI.COMBOBOX_SOURCETYPE = {
    ITEMS: 0,
    FORMULA: 1,
    QUERY: 2,
    STATUS: 3,
    PARAGROUP: 4
};
/**
 * 下拉框 参数的来源类型
 */
YIUI.COMBOBOX_PARAMETERSOURCETYPE = {
    CONST: 0,
    FORMULA: 1,
    FIELD: 2
};
/**
 * 图片组建sourceType
 */
YIUI.IMAGE_SOURCETYPE = {
    DATA: 1,
    RESOURCE: 2
};
/**
 * 数值框四舍五入方式
 */
YIUI.NUMBEREDITOR_ROUNDINGMODE = {
    HALF_UP: 4,
    ROUND_UP: 0,
    ROUND_DOWN: 1,
    parseStr: function (modeStr) {
        var mode = this.HALF_UP;
        if (modeStr == "HALF_UP") {
            mode = this.HALF_UP;
        } else if (modeStr == "ROUND_UP") {
            mode = this.ROUND_UP;
        } else if (modeStr == "ROUND_DOWN") {
            mode = this.ROUND_DOWN;
        }
        return mode;
    }
};
/**
 * 编辑框大小写类型
 */
YIUI.TEXTEDITOR_CASE = {
    DEFAULT: 0,
    LOWER: 1,
    UPPER: 2
};
/** 菜单树类型 */
YIUI.TREEMENU_TYPE = {
    TREE: 0,
    LISTTREE: 1,
    GROUPTREE: 2
};
/** 超链接目标显示方式 */
YIUI.Hyperlink_target = {
    New: "_blank",
    NewTab: "",
    Current: "_self"
};
/** 图片路径 */
YIUI.Image = {
    VirtualDir: "/path",
    EmptyImg: "Resource/empty.PNG"
};
/** form操作状态 */
YIUI.Form_OperationState = {
    Default: 0,
    New: 1,
    Edit: 2,
    Delete: 3
};
/** form界面状态 */
YIUI.FormUIStatusMask = {
    ENABLE: 0x0001,
    VISIBLE: 0x0002,
    OPERATION: 0x0004
};
/** form目标显示方式 */
YIUI.FormTarget = {
    SELF: 0,
    STR_SELF: "self",
    NEWTAB: 1,
    STR_NEWTAB: "newtab",
    MODAL: 2,
    STR_MODAL: "modal",
    STACK: 3,
    STR_STACK: "stack",
    parse: function (target) {
        var type = -1;
        if (YIUI.FormTarget.STR_SELF == target.toLowerCase()) {
            type = YIUI.FormTarget.SELF;
        } else if (YIUI.FormTarget.STR_NEWTAB == target.toLowerCase()) {
            type = YIUI.FormTarget.NEWTAB;
        } else if (YIUI.FormTarget.STR_MODAL == target.toLowerCase()) {
            type = YIUI.FormTarget.MODAL;
        } else if (YIUI.FormTarget.STR_STACK == target.toLowerCase()) {
        	type = YIUI.FormTarget.STACK;
        }
        return type;
    }
};
/** form类型 */
YIUI.Form_Type = {
    Normal: 0,
    Entity: 1,
    Dict: 2,
    View: 3,
    Condition: 4,
    Detail: 5
};
YIUI.FILTERVALUETYPE = {
    FIELD: 0,
    FORMULA: 1,
    CONST: 2
};
YIUI.ParameterSourceType = {
	CONST: 0,
    FORMULA: 1,
    FIELD: 2
};
YIUI.DocumentType = {
    DATAOBJECT: 1,
    DETAIL: 2
};
YIUI.Dialog_MsgType = {
    DEFAULT: 0,
    YES_NO: 1,
    YES_NO_CANCEL: 2
};
YIUI.Dialog_Btn = {
    OK_OPTION: 0,
    STR_OK: "OK",
    YES_OPTION: 0,
    STR_NO: "NO",
    NO_OPTION: 1,
    STR_YES: "YES",
    CANCEL_OPTION: 2,
    STR_CANCEL: "Cancel",

    parseOption: function (s) {
        if (s == this.STR_OK) {
            return this.OK_OPTION;
        } else if (s == this.STR_YES) {
            return this.YES_OPTION;
        } else if (s == this.STR_NO) {
            return this.NO_OPTION;
        } else if (s == this.STR_CANCEL) {
            return this.CANCEL_OPTION;
        }
    }


};
YIUI.Rights_type = {
    TYPE_ENTRY: 0,
    TYPE_DICT: 1,
    TYPE_FORM: 2
};
YIUI.Rights_objType = {
    OperatorRights: 0,
    RoleRights: 1
};
/** 水平对齐方式 */
YIUI.HAlignment = {
    LEFT: 0,
    CENTER: 1,
    RIGHT: 2
};
/** 垂直对齐方式 */
YIUI.VAlignment = {
    TOP: 0,
    CENTER: 1,
    BOTTOM: 2
};
YIUI.Custom_tag = {
    UserInfoPane: "UserInfoPane",
    RoleRights: "RoleRights",
    OperatorRights: "OperatorRights"
};
/** 操作类型 */
YIUI.OptScript = {
    SAVE: 1,
    LOAD: 2
};

/** Document中扩展数据的类型 */
YIUI.ExpandDataType = {
	INT: 1,
	LONG: 2,
	STRING: 3,
	JSON_OBJECT: 7
};

YIUI.DictStateMask = {
	Enable: 1,
	STR_Enable: "Enable",
	Disable: 2,
	STR_Disable: "Disable",
	Discard: 4,
	STR_Discard: "Discard",
	All: 7,
	Enable_Disable: 3,
	Enable_Discard: 5,
	Disable_Discard: 6
};
YIUI.DictState = {
	Enable: 1,
	Disable: 0,
	Discard: -1
};

YIUI.JavaDataType = {
	USER_INT: 1,
	STR_USER_INT: "Integer",
	USER_STRING: 2,
	STR_USER_STRING: "String",
	USER_DATETIME: 3,
	STR_USER_DATETIME: "Date",
	USER_NUMERIC: 4,
	STR_USER_NEMERIC: "Numeric",
	USER_BINARY: 5,
	STR_USER_BINARY: "Binary",
	USER_BOOLEAN: 6,
	STR_USER_BOOLEAN: "Boolean",
	USER_LONG: 7,
	STR_USER_LONG: "Long",
	USER_DOCUMENT: 8,
	STR_USER_DOCUMENT: "Document",
	USER_DATATABLE: 9,
	STR_USER_DATATABLE: "DataTable"
};

YIUI.DataType = {
	/** 32位整型 */
	INT: 1001,
	STR_INT: "Integer",

	/** 字符串类型 */
	STRING: 1002,
	STR_STRING: "Varchar",

	/** 日期类型 */
	DATE: 1003,
	STR_DATE: "Date",

	/** 日期时间类型 */
	DATETIME: 1004,
	STR_DATETIME: "DateTime",

	/** 数值类型 */
	NUMERIC: 1005,
	STR_NUMERIC: "Numeric",

	/** 双精度浮点数类型 */
	DOUBLE: 1006,
	STR_DOUBLE: "Double",

	/** 浮点数类型 */
	FLOAT: 1007,
	STR_FLOAT: "Float",

	/** 二进制类型 */
	BINARY: 1008,
	STR_BINARY: "Binary",

	/** 布尔类型 */
	BOOLEAN: 1009,
	STR_BOOLEAN: "Boolean",

	/** 64位整型 */
	LONG: 1010,
	STR_LONG: "Long"
};
YIUI.BPMConstants = {
	WORKITEM_VIEW: "WorkitemView",
	WORKITEM_INFO: "WorkitemInfo"
};
YIUI.BPMKeys = {
	SaveBPMMap_KEY: "SaveBPMMap",
	LoadBPM_KEY: "BPM",
	STATE_MACHINE: "StateMachine",
	WORKITEM_INFO: "WrokitemInfo"
};
YIUI.PPObject_Type = {
	ColumnType: "Type",
	ColumnInfo: "Info",
	DicOperator: "Operator",
	DicRole: "Role"
};

YIUI.EnableItem = {
	/** 头控件 */
	Head: 0,
	/** 列表组件--明细 */
	List: 1,
	/** 列 */
	Column: 2,
	/** 操作*/
	Operation: 3
		
};
YIUI.FormShowFlag = {
	/** 显示表单 */
	Show: 0,
	S_Show: "show",
	/** 关闭表单 */
	Close: 1,
	S_Close: "close"
		
};
YIUI.FormEvent = {
	Close: "Close",
	ShowDocument: "ShowDocument"
};
YIUI.SystemField = {
	// 系统字段
	/** 对象的ID */
	OID_SYS_KEY: "OID",
	/** 主数据对象的ID */
	SOID_SYS_KEY: "SOID",
	/** 父对象的ID */
	POID_SYS_KEY: "POID",
	/** 对象的版本 */
	VERID_SYS_KEY: "VERID",
	/** 对象的明细控制版本 */
	DVERID_SYS_KEY: "DVERID",
	/** 已映射的数量 */
	MAPCOUNT_SYS_KEY: "MapCount"
};
YIUI.BatchBPM = {
	BPM_PROCESS_KEY: "BPM_PROCESS_KEY",
	BPM_ACTION_NODE_KEY: "BPM_ACTION_NODE_KEY"
};
YIUI.DirectionType = {
	/** 顶部位置 */
	TOP: 0,
	/** 顶部位置的字符串表示 */
	STR_TOP: "top",
	/** 底部位置 */
	BOTTOM: 1,
	/** 底部位置的字符串表示 */
	STR_BOTTOM: "bottom",
	/** 左部位置 */
	LEFT: 2,
	/** 左部位置的字符串表示 */
	STR_LEFT: "left",
	/** 右部位置 */
	RIGHT: 3,
	/** 右部位置的字符串表示 */
	STR_RIGHT: "right",
	/** 中间位置 */
	CENTER: 4,
	/** 中间位置的字符串表示 */
	STR_CENTER: "center"
};
YIUI.DocType = {
	NORMAL: 0,
	NEW: 1,
	MODIFIED: 2,
	DELETE: 3
};
YIUI.TableMode = {
    UNKNOWN: -1,
    HEAD: 0,
    DETAIL: 1
};YIUI.ViewException = (function () {
    var Return = {
        /*缺少映射数据*/
        DATA_BINDING_ERROR: 0x000F,
        /* 组件未定义 */
        NO_COMPONENT_FOUND: 0x0015,
        /* 非单元格无法设置*/
        NO_CELL_CANNOT_SET_VALUE: 0x002E,
        /* 无法获取非单元格值*/
        CANNNOT_GET_NO_CELL_VALUE: 0x002F,
        /*复合字典不能设置为多选字典*/
        COMPDICT_CANNOT_SET_MULTIDICT: 0x0030,
        /*动态字典的itemKey字段为空*/
        DYNAMICDICT_ITEMKEY_NULL: 0x0031,
        /*复合字典的itemKey字段为空*/
        COMPDICT_ITEMKEY_NULL: 0x0032,
       /*控件不存在*/
        NO_COMPONENT: 0x0033,
        /*宽度或高度未定义*/
        NO_WIDTH_OR_HEIGHT: 0x0034,
        /*下推的目标单据的key为空*/
        NO_KEY_TARGET_BILL: 0x0035,
        //超出最大数值精度
        Exceed_Value_Max_Accuracy: 0x0036,
        //DateDiff公式传入参数有误,请检查配置
        Date_Diff_Param_Error: 0x0037,
        //控件key不存在
        NO_COMPONENT_KEY: 0x0038,
        /* 映射未定义表单标识 */
        MAP_MISS_FORMKEY: 0x001E,
    	NO_TABLE_DATA: 0x0001,
    	NO_BINDING_TABLE_DATA: 0x0002,
    	NO_PRINT_TEMPLATE_DEFINED: 0x0003,
    	CIRCLE_DEPENDENCY: 0x0004,
    	GRID_EXPAND_OR_GROUP_IN_GRID_GE: 0x0005,
    	EXIST_GROUPROW_IN_GRIDPAGE: 0x0006,
    	OUTER_COLUMN_MUSTBE_TITLE: 0x0008,
    	UNDEFINED_COMPONENT_TYPE: 0x0009,
    	UNDEFINED_PAGE_LOAD_TYPE: 0x000A,
    	UNABLE_TO_GET_CELL_BEHAVIOR: 0x000B,
    	CHECK_RULE_NOT_PASS: 0x000C,
    	SUB_DETAIL_BINDING_ERROR: 0x000D,
    	FORMULA_IDENTIFIER_ERROR: 0x000E,
    	NO_ROW_SELECTED: 0x0010,
    	SEQUENCE_NO_DEFINE: 0x0011,
    	LAYER_OR_HIDDEN_NO_DEFINE: 0x0012,
    	SHOW_LAYERDATA_NOTALLOW_GRID_EXPAND: 0x0013,
    	REQUIRED_ERROR: 0x0014,
    	NO_TABLE_FOUND: 0x0016,
    	FOREIGN_FIELDS_INEQUALITY: 0x0017,
    	NO_EMPTY_ROW_FOUND: 0x0018,
    	GRID_TREE_COLUMN_DEFINE_ERROR: 0x0019,
    	UNDEFINED_ROW_EXPAND_TYPE: 0x001A,
    	REF_OPERATION_NOT_DEFINED: 0x001B,
    	NO_DETAIL_ROW_DEFINE: 0x001C,
    	COMPONENT_NOT_EXISTS: 0x001D,
    	NO_REFDETAILTABLEKEY_DEFINE: 0x001E,
    	NO_REFTABLEKEY_DEFINE: 0x001F,
    	NO_EXPANDSOURCE_RESULT_GET: 0x002A,
    	UNDEFINED_SUBDETAIL_LINKTYPE: 0x002B,
    	NO_SUBDETAILS_IN_EMPTYROW: 0x002C,
    	NO_GRID_OR_LISTVIEW_FOUND: 0x002D,
    	//合并单元格定义的行类型不一致
    	CELL_MERGE_DEFINE_ERROR: 0x0039,
    	//下拉项来源定义错误
    	SOURCETYPE_DEFINE_ERROR: 0x0040,
    	//表格有选择字段且没有OID列时,需要定义业务关键字来定位行
    	PRIMARYKEYS_UNDEFINED: 0x0041,
    	//动态单元格需要定义类型表达式,否则无法确定单元格类型
    	TYPE_FORMULA_NEEDED: 0x0042,
    	//动态单元格组未定义
    	TYPE_GROUP_UNDEFINED: 0x0043,
    	//指定结果的单元格类型未定义
    	TYPE_DEF_UNDEFINED: 0x0044,
    	//动态单元格标识列未定义
    	TYPE_DEF_KEYCOLUMN_UNDEFINED: 0x0045,
    	//数据中动态单元格标识为空
    	TYPEDEFKEY_EMPTY: 0x0046,
    	//未知的明细类型
    	UNKNOWN_DETAIL_TYPE: 0x0047,
    	//列拓展未定义拓展源,无法确定拓展类型
    	EXPAND_SOURCE_UNDEFINED: 0x0048,
    	//数据拓展数据列未定义
    	EXPAND_COLUMNKEY_UNDEFIND: 0x0049,
    	//只支持在表单类型为View的情况下使用
    	VIEW_FORM_ONLY: 0x0050,
    	

        throwException: function (code, args) {
            var paras = {};
            paras.service = "PureException";
            paras.code = code;
            if (args != null && args != undefined) {
                paras.args = args;
            }
            var success = function (data) {
                throw new Error( data );
            }
            Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras, success);
        }
    };
    return Return;
})();YIUI.BPMException = (function () {
    var Return = {

		serialVersionUID: 1,

		NO_DEFINE_NODE_TYPE: 0x0001,

		PARTICIPATOR_ERROR: 0x0002,

		DELEGATE_RIGHT_ERROR: 0x0003,

		INSTANCE_STARTED: 0x0004,

		WORKITEM_DATA_TIME_OUT: 0x0005,

		NO_ACTIVE_WORKITEM: 0x0006,

		NO_MAP_DATA: 0x0007,

		NO_PROCESS_DEFINATION: 0x0008,

		NO_BINDING_PROCESS: 0x0009,

		NO_DYNAMIC_BINDING_PROCESS: 0x000A,

		NO_PROCESS_DEFINATION_VERID: 0x000B,

		NO_INSTANCE_DATA: 0x000C,

		DELEGATE_MISS_SRC: 0x000D,

		DELEGATE_MISS_TGT: 0x000E,

		NO_NODE_EXIST: 0x000F,

		NO_BPM_CONTEXT: 0x0010,
		
		MISS_FORM: 0x0011,
    		
        throwException: function (code, args) {
            var paras = {};
            paras.service = "PureException";
            paras.code = code;
            paras.isBPMError = true;
            if (args != null && args != undefined) {
                paras.args = args;
            }
            var success = function (data) {
                throw new Error( data );
            }
            Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras, success);
        }
    };
    return Return;
})();/*! jstz - v1.0.4 - 2012-12-12 */
(function(e){var t=function(){"use strict";var e="s",n=function(e){var t=-e.getTimezoneOffset();return t!==null?t:0},r=function(e,t,n){var r=new Date;return e!==undefined&&r.setFullYear(e),r.setDate(n),r.setMonth(t),r},i=function(e){return n(r(e,0,2))},s=function(e){return n(r(e,5,2))},o=function(e){var t=e.getMonth()>7?s(e.getFullYear()):i(e.getFullYear()),r=n(e);return t-r!==0},u=function(){var t=i(),n=s(),r=i()-s();return r<0?t+",1":r>0?n+",1,"+e:t+",0"},a=function(){var e=u();return new t.TimeZone(t.olson.timezones[e])};return{determine:a,date_is_dst:o}}();t.TimeZone=function(e){"use strict";var n=null,r=function(){return n},i=function(){var e=t.olson.ambiguity_list[n],r=e.length,i=0,s=e[0];for(;i<r;i+=1){s=e[i];if(t.date_is_dst(t.olson.dst_start_dates[s])){n=s;return}}},s=function(){return typeof t.olson.ambiguity_list[n]!="undefined"};return n=e,s()&&i(),{name:r}},t.olson={},t.olson.timezones={"-720,0":"Etc/GMT+12","-660,0":"Pacific/Pago_Pago","-600,1":"America/Adak","-600,0":"Pacific/Honolulu","-570,0":"Pacific/Marquesas","-540,0":"Pacific/Gambier","-540,1":"America/Anchorage","-480,1":"America/Los_Angeles","-480,0":"Pacific/Pitcairn","-420,0":"America/Phoenix","-420,1":"America/Denver","-360,0":"America/Guatemala","-360,1":"America/Chicago","-360,1,s":"Pacific/Easter","-300,0":"America/Bogota","-300,1":"America/New_York","-270,0":"America/Caracas","-240,1":"America/Halifax","-240,0":"America/Santo_Domingo","-240,1,s":"America/Santiago","-210,1":"America/St_Johns","-180,1":"America/Godthab","-180,0":"America/Argentina/Buenos_Aires","-180,1,s":"America/Montevideo","-120,0":"Etc/GMT+2","-120,1":"Etc/GMT+2","-60,1":"Atlantic/Azores","-60,0":"Atlantic/Cape_Verde","0,0":"Etc/UTC","0,1":"Europe/London","60,1":"Europe/Berlin","60,0":"Africa/Lagos","60,1,s":"Africa/Windhoek","120,1":"Asia/Beirut","120,0":"Africa/Johannesburg","180,0":"Asia/Baghdad","180,1":"Europe/Moscow","210,1":"Asia/Tehran","240,0":"Asia/Dubai","240,1":"Asia/Baku","270,0":"Asia/Kabul","300,1":"Asia/Yekaterinburg","300,0":"Asia/Karachi","330,0":"Asia/Kolkata","345,0":"Asia/Kathmandu","360,0":"Asia/Dhaka","360,1":"Asia/Omsk","390,0":"Asia/Rangoon","420,1":"Asia/Krasnoyarsk","420,0":"Asia/Jakarta","480,0":"Asia/Shanghai","480,1":"Asia/Irkutsk","525,0":"Australia/Eucla","525,1,s":"Australia/Eucla","540,1":"Asia/Yakutsk","540,0":"Asia/Tokyo","570,0":"Australia/Darwin","570,1,s":"Australia/Adelaide","600,0":"Australia/Brisbane","600,1":"Asia/Vladivostok","600,1,s":"Australia/Sydney","630,1,s":"Australia/Lord_Howe","660,1":"Asia/Kamchatka","660,0":"Pacific/Noumea","690,0":"Pacific/Norfolk","720,1,s":"Pacific/Auckland","720,0":"Pacific/Tarawa","765,1,s":"Pacific/Chatham","780,0":"Pacific/Tongatapu","780,1,s":"Pacific/Apia","840,0":"Pacific/Kiritimati"},t.olson.dst_start_dates=function(){"use strict";var e=new Date(2010,6,15,1,0,0,0);return{"America/Denver":new Date(2011,2,13,3,0,0,0),"America/Mazatlan":new Date(2011,3,3,3,0,0,0),"America/Chicago":new Date(2011,2,13,3,0,0,0),"America/Mexico_City":new Date(2011,3,3,3,0,0,0),"America/Asuncion":new Date(2012,9,7,3,0,0,0),"America/Santiago":new Date(2012,9,3,3,0,0,0),"America/Campo_Grande":new Date(2012,9,21,5,0,0,0),"America/Montevideo":new Date(2011,9,2,3,0,0,0),"America/Sao_Paulo":new Date(2011,9,16,5,0,0,0),"America/Los_Angeles":new Date(2011,2,13,8,0,0,0),"America/Santa_Isabel":new Date(2011,3,5,8,0,0,0),"America/Havana":new Date(2012,2,10,2,0,0,0),"America/New_York":new Date(2012,2,10,7,0,0,0),"Asia/Beirut":new Date(2011,2,27,1,0,0,0),"Europe/Helsinki":new Date(2011,2,27,4,0,0,0),"Europe/Istanbul":new Date(2011,2,28,5,0,0,0),"Asia/Damascus":new Date(2011,3,1,2,0,0,0),"Asia/Jerusalem":new Date(2011,3,1,6,0,0,0),"Asia/Gaza":new Date(2009,2,28,0,30,0,0),"Africa/Cairo":new Date(2009,3,25,0,30,0,0),"Pacific/Auckland":new Date(2011,8,26,7,0,0,0),"Pacific/Fiji":new Date(2010,11,29,23,0,0,0),"America/Halifax":new Date(2011,2,13,6,0,0,0),"America/Goose_Bay":new Date(2011,2,13,2,1,0,0),"America/Miquelon":new Date(2011,2,13,5,0,0,0),"America/Godthab":new Date(2011,2,27,1,0,0,0),"Europe/Moscow":e,"Asia/Yekaterinburg":e,"Asia/Omsk":e,"Asia/Krasnoyarsk":e,"Asia/Irkutsk":e,"Asia/Yakutsk":e,"Asia/Vladivostok":e,"Asia/Kamchatka":e,"Europe/Minsk":e,"Australia/Perth":new Date(2008,10,1,1,0,0,0)}}(),t.olson.ambiguity_list={"America/Denver":["America/Denver","America/Mazatlan"],"America/Chicago":["America/Chicago","America/Mexico_City"],"America/Santiago":["America/Santiago","America/Asuncion","America/Campo_Grande"],"America/Montevideo":["America/Montevideo","America/Sao_Paulo"],"Asia/Beirut":["Asia/Beirut","Europe/Helsinki","Europe/Istanbul","Asia/Damascus","Asia/Jerusalem","Asia/Gaza"],"Pacific/Auckland":["Pacific/Auckland","Pacific/Fiji"],"America/Los_Angeles":["America/Los_Angeles","America/Santa_Isabel"],"America/New_York":["America/Havana","America/New_York"],"America/Halifax":["America/Goose_Bay","America/Halifax"],"America/Godthab":["America/Miquelon","America/Godthab"],"Asia/Dubai":["Europe/Moscow"],"Asia/Dhaka":["Asia/Yekaterinburg"],"Asia/Jakarta":["Asia/Omsk"],"Asia/Shanghai":["Asia/Krasnoyarsk","Australia/Perth"],"Asia/Tokyo":["Asia/Irkutsk"],"Australia/Brisbane":["Asia/Yakutsk"],"Pacific/Noumea":["Asia/Vladivostok"],"Pacific/Tarawa":["Asia/Kamchatka"],"Africa/Johannesburg":["Asia/Gaza","Africa/Cairo"],"Asia/Baghdad":["Europe/Minsk"]},typeof exports!="undefined"?exports.jstz=t:e.jstz=t})(this);YIUI.DataUtil = (function () {
    var Return = {
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
                    return YIUI.JavaDataType.USER_STRING;

            }
            return -1;
        },
        toJSONDoc: function (document) {
            if (!document) return;

            var doc = {},
                table_list = [],
                table;
            if (document.oid) {
                doc.oid = document.oid;
            }
            if (document.poid) {
                doc.poid = document.poid;
            }
            doc.verid = document.verid || 0;
            doc.dverid = document.dverid || 0;

            doc.state = document.state || DataType.D_Normal;

            if (document.docType) {
                doc.document_type = document.docType;
            }
            var maps = document.maps.table, map;
            for (var i in maps) {
                map = maps[i];
                table = this.toJSONDataTable(map);
                table_list.push(table);
            }
            doc.table_list = table_list;
            doc.expand_data = document.expData;
            doc.expand_data_type = document.expDataType;
            doc.expand_data_class = document.expDataClass;
            return doc;
        },

        toJSONDataTable: function (dataTable) {
            var table = {};
            table.key = dataTable.key;
            table.bookmark_seed = dataTable.bkmkSeed;
            table.tableMode = dataTable.tableMode;
            var allRows = dataTable.allRows,
                row, all_data_rows = [], all_data_row;
            for (var j = 0, len = allRows.length; j < len; j++) {
                row = allRows[j];
                all_data_row = {};
                all_data_row.data = row.vals;
                all_data_row.row_bookmark = row.bkmk;
                all_data_row.row_parent_bookmark = row.parentBkmk;
                all_data_row.row_state = row.state;
                if (row.orgVals) {
                    all_data_row.originaldata = row.orgVals;
                }
                all_data_rows.push(all_data_row);
            }
            table.all_data_rows = all_data_rows;
            var cols = dataTable.cols, col, columns = [], column;
            for (var k = 0, length = cols.length; k < length; k++) {
                col = cols[k];
                column = {};
                column.data_type = col.type;
                column.key = col.key;
                column.index = k;
                column.user_type = col.userType;
                column.accesscontrol = col.accessControl;
                columns.push(column);
            }
            table.columns = columns;
            return table;
        },

        fromJSONDoc: function (document) {
            var doc = new DataDef.Document();
            if (!doc) return;
            if (document.oid) {
                doc.oid = document.oid;
            }
            if (document.poid) {
                doc.poid = document.poid;
            }
            doc.verid = document.verid || 0;
            doc.dverid = document.dverid || 0;

            doc.state = document.state || 0;

            if (document.document_type) {
                doc.docType = document.document_type;
            }
            if (document.table_list) {
                var dataTable, doc_tableList = document.table_list, doc_table, tableKey;
                for (var j = 0; j < doc_tableList.length; j++) {
                    doc_table = doc_tableList[j];
                    tableKey = doc_table.key;
                    dataTable = this.fromJSONDataTable(doc_table);
                    doc.add(tableKey, dataTable);
                }
            }
            doc.expData = document.expand_data;
            doc.expDataType = document.expand_data_type;
            doc.expDataClass = document.expand_data_class;
            return doc;
        },

        fromJSONDataTable: function (jsondt) {
            var dataTable = new DataDef.DataTable();
            if (!jsondt) return null;
            dataTable.key = jsondt.key;
            dataTable.parentKey = jsondt.parentKey;
            dataTable.tableMode = jsondt.tableMode;
            var docTable = jsondt,
                allDataRows = docTable.all_data_rows,
                columns = docTable.columns;
            for (var j = 0; j < columns.length; j++) {
                var column = columns[j];
                dataTable.addCol(column.key, column.data_type, column.user_type, column.accesscontrol);
            }
            for (var i = 0; i < allDataRows.length; i++) {
                var dataRow = allDataRows[i];
                dataTable.addRow();
                for (var k = 0; k < dataRow.data.length; k++) {
                    var row = dataTable.rows[dataTable.pos];
                    row.vals[k] = dataRow.data[k];
                    row.state = dataRow.row_state || DataDef.R_Normal;
                    row.bkmk = dataRow.row_bookmark;
                    if (row.bkmk >= dataTable.bkmkSeed) {
                        dataTable.bkmkSeed++;
                    }
                    dataTable.bkmks.put(row.bkmk, dataTable.rows.length - 1);
                    row.parentBkmk = dataRow.row_parent_bookmark;
                }
            }
            if (docTable.bookmark_seed) {
                dataTable.bkmkSeed = docTable.bookmark_seed;
            }
            return dataTable;
        },

        fromJSONItem: function (json) {
            var item = new DataDef.Item();
            if (!item) return;
            item.itemKey = json.itemKey;
            item.oid = json.oid;
            item.nodeType = json.nodeType || 0;
            item.enable = json.enable || 0;
            item.caption = json.caption;
            item.mainTableKey = json.mainTableKey;
            item.itemTables = json.itemTables;
            return item;
        },
        getShadowTableKey: function (tableKey) {
            return tableKey + "_shadow";
        },
        newShadowDataTable: function (dataTable) {
            var shadowTable = new DataDef.DataTable();
            shadowTable.key = this.getShadowTableKey(dataTable.key);
            var columns = dataTable.cols;
            for (var i = 0; i < columns.length; i++) {
                var column = columns[i];
                shadowTable.addCol(column.key, column.type, column.userType, column.accessControl);
            }
            return shadowTable;
        },
        getPosByPrimaryKeys: function (dataTable, shadowTable, primaryKeys) {
            if (primaryKeys == undefined || primaryKeys == null) {
                YIUI.ViewException.throwException(YIUI.ViewException.PRIMARYKEYS_UNDEFINED);
            }
            shadowTable.beforeFirst();
            var matchPos = -1;
            while (shadowTable.next()) {
                var isMatch = true;
                for (var k = 0, klen = primaryKeys.length; k < klen; k++) {
                    var cDataType = dataTable.cols[dataTable.indexByKey(primaryKeys[k])].type,
                        value = dataTable.getByKey(primaryKeys[k]), sdValue = shadowTable.getByKey(primaryKeys[k]),
                        tValue = YIUI.Handler.convertValue(value, cDataType),
                        tSDValue = YIUI.Handler.convertValue(sdValue, cDataType);
                    if (tValue instanceof  Decimal) {
                        if (!tValue.equals(tSDValue)) {
                            isMatch = false;
                            break;
                        }
                    } else if (tValue != tSDValue) {
                        isMatch = false;
                        break;
                    }
                }
                if (isMatch) {
                    matchPos = shadowTable.pos;
                    break;
                }
            }
            return matchPos;
        },
        posWithShadowRow: function (grid, doc, dataTable) {  //定位影子表的对应的行，如果没有，则新增行
            if (grid.pageInfo.pageLoadType != "DB")return;
            var shadowTableKey = Return.getShadowTableKey(grid.tableKey),
                shadowTable = doc.getByKey(shadowTableKey);
            if (shadowTable == null || shadowTable == undefined) {
                shadowTable = YIUI.DataUtil.newShadowDataTable(dataTable);
                doc.add(shadowTableKey, shadowTable);
            }
            var curOID = dataTable.getByKey(YIUI.DataUtil.System_OID_Key), pos, primaryKeys;
            if (curOID != null && curOID != undefined) {
                primaryKeys = [YIUI.DataUtil.System_OID_Key];
            } else {
                primaryKeys = grid.primaryKeys;
            }
            pos = Return.getPosByPrimaryKeys(dataTable, shadowTable, primaryKeys);
            if (pos != -1) {
                shadowTable.setPos(pos);
            } else {
                shadowTable.addRow();
                for (var j = 0, clen = shadowTable.cols.length; j < clen; j++) {
                    shadowTable.set(j, dataTable.get(j));
                }
                shadowTable.allRows[shadowTable.pos].state = dataTable.allRows[dataTable.pos].state;
            }
            return shadowTable;
        },
        modifyDisplayValueByShadow: function (doc, dataTable, grid, data) {
            var shadowTable = doc.getByKey(YIUI.DataUtil.getShadowTableKey(grid.tableKey)), rowData;
            if (shadowTable) {
                for (var i = 0, len = data.length; i < len; i++) {
                    rowData = data[i];
                    if (rowData.bookmark == undefined || rowData.bookmark == null) continue;
                    dataTable.setByBkmk(rowData.bookmark);
                    var curOID = dataTable.getByKey(YIUI.DataUtil.System_OID_Key), pos, primaryKeys;
                    if (curOID != null && curOID != undefined) {
                        primaryKeys = [YIUI.DataUtil.System_OID_Key];
                    } else {
                        primaryKeys = grid.primaryKeys;
                    }
                    pos = Return.getPosByPrimaryKeys(dataTable, shadowTable, primaryKeys);
                    if (pos != -1) {
                        for (var j = 0, clen = dataTable.cols.length; j < clen; j++) {
                            dataTable.set(j, shadowTable.get(j));
                        }
                        grid.showDetailRow(i, true);
                    }
                }
            }
        },
        deleteAllRow: function (dataTable) {
            for (var len = dataTable.size(), i = len - 1; i >= 0; i--) {
                dataTable.delRow(i);
            }
        },
        append: function (srcTable, tgtTable) {
            var srcIndexArray = [], tgtIndexArray = [];
            for (var i = 0, len = srcTable.cols.length; i < len; i++) {
                var colInfo = srcTable.getCol(i);
                var tgtIndex = tgtTable.indexByKey(colInfo.key);
                if (tgtIndex != -1) {
                    srcIndexArray.push(i);
                    tgtIndexArray.push(tgtIndex);
                }
            }
            srcTable.beforeFirst();
            while (srcTable.next()) {
                tgtTable.addRow();
                for (var j = 0, jLen = srcIndexArray.length; j < jLen; j++) {
                    tgtTable.set(tgtIndexArray[j], srcTable.get(srcIndexArray[j]));
                }
            }
            srcTable.beforeFirst();
            tgtTable.beforeFirst();
        }
    };
    Return.System_SelectField_Key = "SelectField";
    Return.System_OID_Key = "OID";
    return Return;
})();YIUI.NumericUtil = (function () {
    var chineseDigits = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
    var Return = {
        getAmountInWords: function (amount) {
            if (amount.abs().comparedTo(new Decimal(999999999999999.99)) > 0) {
                alert("参数值超出允许范围 (-999999999999999.99 ～ 999999999999999.99)！");
                return;
            }
            var negative = amount.isNegative();
            amount = amount.abs();
            var temp = parseFloat(amount.toFixed(2, YIUI.NUMBEREDITOR_ROUNDINGMODE.HALF_UP)) * 100;
            var numFen = parseInt(temp % 10);
            temp = temp / 10;
            var numJiao = parseInt(temp % 10);
            temp = temp / 10;
            var parts = [], numParts = 0, part;
            for (var ci = 0; ; ci++) {
                if (temp == 0)
                    break;
                part = parseInt(temp % 10000);
                parts[ci] = part;
                numParts++;
                temp = temp / 10000;
            }
            var beforeWanIsZero = true, chineseStr = "", partChinese = "";
            for (var i = 0; i < numParts; i++) {
                partChinese = this.partTranslate(parts[i]);
                if (i % 2 == 0) {
                    beforeWanIsZero = (partChinese == "");
                }
                if (i != 0) {
                    if (i % 2 == 0) {
                        if (parts[i - 1] == 0 || parts[i - 1] >= 1000) {
                            chineseStr = "亿" + chineseStr;
                        } else {
                            chineseStr = "亿零" + chineseStr;
                        }
                    } else {
                        if (partChinese == "" && !beforeWanIsZero) {
                            chineseStr = "零" + chineseStr;
                        } else {
                            if (parts[i - 1] > 0 && parts[i - 1] < 1000) {
                                chineseStr = "零" + chineseStr;
                            } else if (parts[i - 1] < 1000 && parts[i - 1] != 0) {
                                chineseStr = "零" + chineseStr;
                            }
                            if (partChinese !== "") {
                                chineseStr = "万" + chineseStr;
                            }
                        }
                    }
                }
                chineseStr = partChinese + chineseStr;
            }
            if (chineseStr.length > 0) {
                chineseStr = chineseStr + "圆";
            } else {
                chineseStr += "零圆";
            }
            if (numFen == 0 && numJiao == 0) {
                chineseStr = chineseStr + "整";
            } else if (numFen == 0) {
                chineseStr = chineseStr + chineseDigits[numJiao] + "角整";
            } else {
                if (numJiao == 0)
                    chineseStr = chineseStr + "零" + chineseDigits[numFen] + "分";
                else
                    chineseStr = chineseStr + chineseDigits[numJiao] + "角" + chineseDigits[numFen] + "分";
            }
            if (negative)
                chineseStr = "负" + chineseStr;

            return chineseStr;

        },
        partTranslate: function (amount) {
            if (amount < 0 || amount > 10000) {
                alert("NumericUtil：参数必须是大于等于 0，小于 10000 的整数！");
                return;
            }
            var units = ["", "拾", "佰", "仟"], temp = parseInt(amount),
                amountStr = amount.toString(),
                amountStrLength = amountStr.length,
                lastIsZero = true, chineseStr = "";
            for (var i = 0; i < amountStrLength; i++) {
                if (temp == 0)
                    break;
                var digit = parseInt(temp % 10);
                if (digit == 0) {
                    if (!lastIsZero)
                        chineseStr = "零" + chineseStr;
                    lastIsZero = true;
                } else {
                    chineseStr = chineseDigits[digit] + units[i] + chineseStr;
                    lastIsZero = false;
                }
                temp = temp / 10;
            }
            return chineseStr;
        }
    };
    return Return;
})();YIUI.SubDetailUtil = (function () {
    var Return = {
        isSubDetail: function (form, comp, gridKey) {
            if (comp.getMetaObj().parentGridKey != null) {
                if (comp.getMetaObj().parentGridKey != gridKey) {
                    return Return.isSubDetail(form, form.getBindingGrid(form, comp), gridKey);
                } else {
                    return true;
                }
            }
            return false;
        },
        getBindingGrid: function (form, subDetailComp) {
            var parentGridKey = subDetailComp.getMetaObj().parentGridKey,
                grid = form.getGridInfoByKey(parentGridKey);
            if (grid == null) return null;
            return form.getComponent(grid.key);
        },
        getBindingCellData: function (form, subDetailComp) {
            var bindingCellKey = subDetailComp.getMetaObj().bindingCellKey,
                parentGridKey = subDetailComp.getMetaObj().parentGridKey,
                grid = form.getGridInfoByKey(parentGridKey);
            if (grid == null) return null;
            grid = form.getComponent(grid.key);
            var rowIndex = grid.getFocusRowIndex();
            if (rowIndex == -1 || bindingCellKey == null || bindingCellKey == "")
                return null;
            return grid.getCellDataByKey(rowIndex, bindingCellKey);
        },
        getBindingCellError: function (form, subDetailComp) {
            var bindingCellKey = subDetailComp.getMetaObj().bindingCellKey,
                parentGridKey = subDetailComp.getMetaObj().parentGridKey,
                grid = form.getGridInfoByKey(parentGridKey);
            if (grid == null) return null;
            grid = form.getComponent(grid.key);
            var rowIndex = grid.getFocusRowIndex();
            if (rowIndex == -1 || bindingCellKey == null || bindingCellKey == "")
                return null;
            for (var i = 0, len = grid.errorInfoes.cells.length; i < len; i++) {
                var cellInfo = grid.errorInfoes.cells[i];
                if (cellInfo.rowIndex == rowIndex && cellInfo.colIndex == grid.getCellIndexByKey(bindingCellKey)) {
                    return cellInfo;
                }
            }
        },
        showSubDetailData: function (grid, rowIndex) {
            var begin = new Date().getTime(), rowData = grid.getRowDataAt(rowIndex);
            var form = YIUI.FormStack.getForm(grid.ofFormID);
            this.clearSubDetailData(form, grid);
            if (rowData == null || (rowData.isDetail && rowData.bookmark == null)) return;
            var dataTable = form.getDocument().getByKey(grid.tableKey);
            var row = grid.dataModel.data[rowIndex], value, OID = -1, compList, comp, ubookmark, compTable;
            if (row.isDetail && !grid.hasColExpand) {
                if (row.bookmark != null) {
                    dataTable.setByBkmk(row.bookmark);
                    OID = dataTable.getByKey("oid");
                } else {
                    dataTable.beforeFirst();
                }
                compList = form.subDetailInfo[grid.key].compList;
                for (var i = 0, len = compList.length; i < len; i++) {
                    comp = form.getComponent(compList[i]);
                    if (comp instanceof  YIUI.Control.Grid) {
                        compTable = form.getDocument().getByKey(comp.tableKey);
                        comp.dataModel.data = [];
                        var info = form.subDetailInfo[grid.key].info, dtrIndex = comp.metaRowInfo.dtlRowIndex, metaRow;
                        var addNewRow = function (isDetail, metaRow, bookmark, parentBkmk, cellKeys, data) {
                            var newRowIndex = data.length, rowTable, tableKey;
                            var newRow = {};
                            newRow.isDetail = isDetail;
                            newRow.isEditable = (metaRow.rowType == "Detail" || metaRow.rowType == "Fix");
                            newRow.rowID = comp.randID();
                            newRow.bookmark = bookmark;
                            newRow.parentBkmk = parentBkmk;
                            newRow.cellKeys = cellKeys;
                            newRow.rowHeight = metaRow.rowHeight;
                            newRow.metaRowIndex = comp.metaRowInfo.rows.indexOf(metaRow);
                            newRow.rowType = metaRow.rowType;
                            newRow.data = [];
                            data.push(newRow);
                            for (var j = 0, clen = comp.dataModel.colModel.columns.length; j < clen; j++) {
                                var editOpt = comp.dataModel.colModel.cells[cellKeys[j]];
                                if (editOpt !== undefined) {
                                    if (bookmark == undefined) {
                                        tableKey = (editOpt.tableKey == undefined ? metaRow.tableKey : editOpt.tableKey );
                                        rowTable = form.getDocument().getByKey(tableKey);
                                        if (rowTable !== undefined && rowTable !== null) {
                                            rowTable.first();
                                            value = (editOpt.columnKey == undefined ? null : rowTable.getByKey(editOpt.columnKey));
                                        }
                                    } else {
                                        value = (editOpt.columnKey == undefined ? null : compTable.getByKey(editOpt.columnKey));
                                    }
                                    var defaultFV = metaRow.cells[j].defaultFormulaValue,
                                        defaultV = metaRow.cells[j].defaultValue;
                                    if (editOpt !== undefined && value == null
                                        && (editOpt.edittype == "label" || editOpt.edittype == "button" || editOpt.edittype == "hyperLink")) {
                                        value = (metaRow.cells[j].caption == undefined ? "" : metaRow.cells[j].caption);
                                    }
                                    if (value == null && defaultFV !== undefined && defaultFV !== null && defaultFV.length > 0) {
                                        value = form.eval(defaultFV, {form: form, rowIndex: newRowIndex}, null);
                                    }
                                    if (value == null && defaultV !== undefined && defaultV !== null && defaultV.length > 0) {
                                        value = defaultV;
                                    }
                                } else {
                                    value = (metaRow.cells[j].caption == undefined ? "" : metaRow.cells[j].caption);
                                }
                                value = comp.getCellNeedValue(newRowIndex, j, value, true);
                                newRow.data.push(value);
                                value = null;
                            }
                        };
                        for (var j = 0; j < dtrIndex; j++) {
                            metaRow = comp.metaRowInfo.rows[j];
                            addNewRow(false, metaRow, ubookmark, dataTable.getBkmk(), metaRow.cellKeys, comp.dataModel.data);
                        }
                        compTable.beforeFirst();
                        while (compTable.next()) {
                            if (compTable.rows[compTable.pos].state == DataDef.R_Deleted) continue;
                            var inGrid = false;
                            if (info.linkType === 1) {
                                if ((row.bookmark != null && compTable.getParentBkmk() === row.bookmark)
                                    || (compTable.getByKey("POID") === OID && OID > 0)) {
                                    inGrid = true;
                                }
                            } else if (info.linkType == 2) {
                                inGrid = true;
                                var sourceFields = info.sourceFields, targetFields = info.targetFields, srcField, tgtField;
                                for (var k = 0, slen = sourceFields.length; k < slen; k++) {
                                    srcField = sourceFields[k];
                                    tgtField = targetFields[k];
                                    var dataType = dataTable.cols[dataTable.indexByKey(srcField)].type;
                                    var dV = YIUI.Handler.convertValue(dataTable.getByKey(srcField), dataType),
                                        compDV = YIUI.Handler.convertValue(compTable.getByKey(tgtField), dataType);
                                    if (dV instanceof Decimal && compDV instanceof Decimal) {
                                        if (!dV.equals(compDV)) {
                                            inGrid = false;
                                            break;
                                        }
                                    } else if (dV !== compDV) {
                                        inGrid = false;
                                        break;
                                    }
                                }
                            }
                            if (inGrid) {
                                metaRow = comp.metaRowInfo.rows[dtrIndex];
                                addNewRow(true, metaRow, compTable.getBkmk(), dataTable.getBkmk(), metaRow.cellKeys, comp.dataModel.data);
                                inGrid = false;
                            }
                        }
                        for (var m = dtrIndex + 1, length = comp.metaRowInfo.rows.length; m < length; m++) {
                            metaRow = comp.metaRowInfo.rows[m];
                            addNewRow(false, metaRow, ubookmark, dataTable.getBkmk(), metaRow.cellKeys, comp.dataModel.data);
                        }
                        comp.refreshGrid();
                        if (comp.isEnable() && !comp.hasAutoRow() && comp.treeType === -1 && !comp.hasRowExpand) {
                            if (comp.hasGroupRow) {
                                comp.appendAutoRowAndGroup();
                            } else {
                                comp.addGridRow();
                            }
                        } else if (!comp.isEnable() && comp.treeType === -1) {
                            comp.removeAutoRowAndGroup();
                        }
                    } else {
                        if (comp.metaObj.bindingCellKey && comp.metaObj.bindingCellKey.length > 0) {
                            var colInfoes = grid.getColInfoByKey(comp.metaObj.bindingCellKey);
                            if (colInfoes !== null) {
                                for (var ci = 0, clen = colInfoes.length; ci < clen; ci++) {
                                    value = row.data[colInfoes[ci].colIndex][0];
                                    if (comp.type == YIUI.CONTROLTYPE.DICT && value != null && typeof value == 'string') {
                                        value = JSON.parse(value);
                                    }
                                    comp.setValue(value, false, false);
                                }
                            }
                        } else if (comp.tableKey && comp.tableKey.length > 0 && comp.columnKey && comp.columnKey.length > 0) {
                            if (comp.tableKey == grid.tableKey) {
                                if (dataTable.pos >= 0) {
                                    value = dataTable.getByKey(comp.columnKey);
                                    comp.setValue(value, false, false);
                                }
                            } else {
                                compTable = form.getDocument().getByKey(comp.tableKey);
                                compTable.first();
                                value = compTable.getByKey(comp.columnKey);
                                comp.setValue(value, false, false);
                            }
                        }
                    }
                }
                form.getUIProcess().calcSubDetail(grid.key);
            }
            var end = new Date().getTime();
            console.log("showSubDetail Cost: " + (end - begin) + " ms");
        },
        clearSubDetailData: function (form, parentGrid) {
            var subDetailInfo = form.subDetailInfo[parentGrid.key];
            if (subDetailInfo == undefined) return;
            var compList = subDetailInfo.compList, subComp;
            for (var i = 0, len = compList.length; i < len; i++) {
                subComp = form.getComponent(compList[i]);
                if (subComp instanceof  YIUI.Control.Grid) {
                    subComp.dataModel.data = [];
                    subComp.errorInfoes.cells = [];
                    subComp.errorInfoes.rows = [];
                    subComp.el.clearGridData();
                    this.clearSubDetailData(form, subComp);
                } else {
                    if (subComp.needClean()) {
                        subComp.setValue(null, false, false);
                        subComp.setRequired(false);
                        subComp.setError(false, "");
                    }
                }
            }
        }
    };
    return Return;
})();var YIUI = YIUI || {};
YIUI.TypeConvertor = (function () {
	var Return = {
		toString: function (v) {
            return v != null ? v.toString() : "";
        },
        toInt: function(v) {
        	var r;
        	if(v == null || v == "") {
        		r = 0;
        	} else if($.isNumeric(v)) {
        		r = parseInt(v);
        	} else if(typeof a == "boolean") {
        		r = v ? 1 : 0;;
        	} else if(v instanceof Decimal) {
            	//decimal >9 则不作处理
        		if(v.toString().length > 9) {
        			r = v;
        		} else {
        			r = parseInt(v.toString());
        		}
        	}
        	return r;
        },
        toLong: function(v) {
        	var l = this.toInt(v);
        	return l;
        },
        toDecimal: function(v) {
        	var r;
        	if(v == null || v == "") {
        		r = new Decimal(0);
        	} else if($.isNumeric(v)) {
        		r = new Decimal(v);
        	} else if(typeof v == "boolean") {
        		v = v ? 1 : 0;;
        		r = new Decimal(v);
        	} else if(v instanceof Decimal) {
            	r = v;
        	} else if (typeof v == "string") {
				r = v == "" ? new Decimal(0) : new Decimal(v);
			}
        	return r;
        },
        toBoolean: function (v) {
            var bl = false;
            if (v != null) {
                if (typeof(v) == "boolean") {
                    bl = v;
                } else if (typeof(v) == "string") {
                    if (v.toLowerCase() == "true") {
                        bl = true;
                    } else if (v.toLowerCase() == "false" || v == "0") {
                        bl = false;
                    } else {
                        bl = v.length != 0;
                    }
                } else if (v instanceof Decimal) {
                    bl = Boolean(v.toNumber());
                } else {
                    bl = Boolean(v);
                }
            }
            return bl;
        },
        toDate: function(v) {
        	var d = null;
    		if (v != null) {
    			if (v instanceof Date) {
    				d = v;
    			} else if (typeof v == "string") {
					if($.isNumeric(v)) {
						d = new Date(parseInt(value));
					} else {
						v = v.replace(/-/g, "/");
						d = new Date(v);
					}
    			}
    		}
    		return d;
        }
	};
	return Return;
})();YIUI.Base64 = (function () {
    var Return = {
	    encode64: function(input, utf8) {
			var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;
			while (i < input.length) {
				chr1 = input[i++];
				chr2 = input[i++];
				chr3 = input[i++];
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				}
				else if (isNaN(chr3)) {
					enc4 = 64;
				}
				output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
			}
			return output;
		}
    };

    return Return;
})();