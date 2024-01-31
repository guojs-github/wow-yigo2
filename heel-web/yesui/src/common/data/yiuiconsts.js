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
    FLUIDTABLELAYOUTPANEL: 11,
    CUSTOMLAYOUTPANEL: 15,
    FLEXBOXPANEL: 16,

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
    DYNAMIC: 20001,
    ICON: 270,
    MONTHPICKER: 284,
    TIMEPICKER: 285,
    LISTLAYOUTVIEW: 300,
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
    CHAINDICT: 5,
    /** 数据对象列表 */
    DATAOBJECTLIST: 8
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
 * 地图类型
 */
YIUI.MapDrawType = {
    CUSTOM: 0,
    BAIDU: 1,
    GAODE: 2
}
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
 * 操作类型
 */
YIUI.OPERATIONTYPE = {
    OPERATION:0,
    OPERATIONCOLLECTION:1
}
/**
 * 数值框四舍五入方式
 */
YIUI.NUMBEREDITOR_ROUNDINGMODE = {
    HALF_UP: 4,
    ROUND_UP: 0,
    ROUND_DOWN: 1,
    ROUND_CEILING: 2,
    ROUND_FLOOR: 3,
    parseStr: function (modeStr) {
        var mode = this.HALF_UP;
        if (modeStr == "HALF_UP") {
            mode = this.HALF_UP;
        } else if (modeStr == "ROUND_UP") {
            mode = this.ROUND_UP;
        } else if (modeStr == "ROUND_DOWN") {
            mode = this.ROUND_DOWN;
        }else if (modeStr == "ROUND_CEILING") {
            mode = this.ROUND_CEILING;
        }else if (modeStr == "ROUND_FLOOR") {
            mode = this.ROUND_FLOOR;
        }
        return mode;
    }
};
/**
 * 编辑框大小写类型
 */
YIUI.TEXTEDITOR_CASE = {
    NONE: 0,
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
    NewTab: "_blank",
    Current: "_self"
};
/** 超链接目标显示方式 */
YIUI.Hyperlink_TargetType = {
    New: 0,
    NewTab: 1,
    Current: 2,
    Str_New: "New",
    Str_NewTab: "NewTab",
    Str_Current: "Current"
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
    OPERATION: 0x0004,
    CHECKRULE: 0x0008
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
YIUI.Form_Type = {
    Normal: 0,
    Entity: 1,
    Dict: 2,
    View: 3,
    Detail: 4,
    Report: 5,
    ChainDict: 6
};
YIUI.DATAOBJECT_TYPE = {
    ENTITY: 0,
    VIRTUAL: 1,
    TEMPLATE: 2
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
YIUI.WorkItem_State = {
    NEW: 1,
    FINISH: 2
}
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
    RIGHT: 2,
    STR_LEFT: "left",
    STR_CENTER: "center",
    STR_RIGHT: "right",
    parse: function (mode) {
        var modeStr = this.STR_LEFT;
        if (mode == this.CENTER) {
            modeStr = this.STR_CENTER;
        } else if (mode == this.RIGHT) {
            modeStr = this.STR_RIGHT;
        }
        return modeStr;
    }
};
/** 垂直对齐方式 */
YIUI.VAlignment = {
    TOP: 0,
    CENTER: 1,
    BOTTOM: 2,
    STR_TOP: "top",
    STR_CENTER: "middle",
    STR_BOTTOM: "bottom",
    parse: function (mode) {
        var modeStr = this.STR_CENTER;
        if (mode == this.TOP) {
            modeStr = this.STR_TOP;
        } else if (mode == this.BOTTOM) {
            modeStr = this.STR_BOTTOM;
        }
        return modeStr;
    }
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
    STR_USER_DATATABLE: "DataTable",
    USER_JSONOBJECT: 10,
    STR_USER_JSONOBJECT: "JSONObject",
    USER_JSONARRAY: 11,
    STR_USER_JSONARRAY: "JSONArray",
    USER_ITEMDATA: 12,
    STR_USER_ITEMDATA: "ItemData"
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
    STR_LONG: "Long",

    /** 文本类型 */
    TEXT: 1011,
    STR_TEXT: "Text",

    /** 定长字符串类型 */
    FIXED_STRING: 1012,
    STR_FIXED_STRING: "Char"
};
YIUI.BPMConstants = {
    WORKITEM_VIEW: "WorkitemView",
    WORKITEM_INFO: "WorkitemInfo",
    BPM_INSTANCE_ID: "InstanceID",
    ELEMENT_STATE: "State",
    BPM_PROCESS_KEY: "ProcessKey",
    BPM_STARTCAPTION: "StartCaption",
    BPM_STARTACTION: "StartAction",
    BPM_TRANSIT_TO: "TransitTo"
};
YIUI.BPMKeys = {
    SaveBPMMap_KEY: "SaveBPMMap",
    LoadBPM_KEY: "BPM",
    STATE_MACHINE: "StateMachine",
    WORKITEM_INFO: "WorkitemInfo",
    LOAD_WORKITEM_INFO:"LoadWorkItemInfo",
    REGISTER_ATTACHMENT: "RegisterAttachment",
	RETREAT_CAPTION: "RetreatCaption",
	CHOOSE_ROLLBACK: "ChooseRollback"
};
YIUI.BPMOperationType = {
    OPT_COMMIT: 0,
    OPT_RETURN: 1,
    OPT_TRANSIT: 2
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
YIUI.SystemField = (function () {

    var _systemField = {
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
        /** 编号*/
        NO_SYS_KEY: "NO",
        /** 状态*/
        STATUS_SYS_KEY: "Status",
        /** 已映射的数量 */
        MAPCOUNT_SYS_KEY: "MapCount",
        /** 选择字段 */
        SELECT_FIELD_KEY : "SelectField",
        /** 序号字段*/
        SEQUENCE_FIELD_KEY :"Sequence",

        /** 附件路径*/
        PATH: "Path",
        /** 附件名称*/
        NAME: "Name",
        /** 附件上传时间*/
        UPLOAD_TIME: "UploadTime",
        /** 附件上传者*/
        UPLOAD_OPERATOR: "UploadOperator"
    }

    return $.extend({},_systemField,{
        isSystemField: function (field) {
            for( var o in _systemField ) {
                if( field && _systemField[o] === field )
                    return true;
            }
            return false;
        }
    });
})();

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
};
YIUI.IRowBkmk = {
    Fix: 0,
    Detail: 1,
    Group: 2,
    Total: 3,
    Expand: 4,
    CustomDetail: 5,
    CustomExpand: 6,
    Multiple: 7
};
YIUI.ExprItem_Type = {
    Item: 0,
    Set: 1
};
YIUI.Attachment_Data = (function () {

    var _attachment = {
        PATH: "Path",
        NAME: "Name",
        UPLOAD_TIME: "UploadTime",
        UPLOAD_OPERATOR: "UploadOperator"
    }

    return $.extend({},_attachment,{
       isAttachmentField:function (field) {
           for( var o in _attachment ) {
               if( field && _attachment[o] === field )
                   return true;
           }
           return false;
       }
    });
})();

YIUI.ExpandSourceType = {
    DATA: 0,
    CUSTOM: 1,
    DICT: 2
};
YIUI.ColumnExpandType = {
    TITLE: 0,
    DATA: 1,
    NONE: -1
};
YIUI.MetaGridRowObjectType = {
    ROW: 0,
    GROUP: 1,
    AREA: 2
};
// YIUI.ShowType = {
//     Default: 0,
//     Dict: 1,
//     Map: 2,
//     Tree: 3,
//     WorkItem: 4,
//     Gantt: 5
// };
YIUI.RowExpandType = {
    DICT: 0,
    FORMULA: 1
};
YIUI.GridTreeType = {
    NONE: -1,
    DICT: 0,
    COMMON: 1
};
YIUI.OptType = {
	NEW: 1,
	LOAD: 2,
	CHECK: 3
};
YIUI.LinkType = {
    PARENT:1,
    FOREIGN:2
};
YIUI.SelectionMode = {
    CELL: 1,
    ROW: 2,
    RANGE: 3
};
YIUI.Dialog_Type = {
	ERROR: 0,
	WARN: 1
};
YIUI.JsonType = {
    JsonObject:0,
    JsonArray:1
}
YIUI.PageLoadType = {
    NONE: 0,
    STR_NONE: "NONE",
	UI:1,
	STR_UI: "UI",
	DB:2,
	STR_DB: "DB"
};

YIUI.InstanceState = {
	/** 注册成功 */
	SIGN: 0,
	/** 运行中 */
	PROCESSING: 1,
	/** 已结束 */
	END: 2,
	/** 强行关闭 */
	KILLED: 3,
	/** 强行关闭 */
	PAUSE: 4
};

/**
 * 系统当前记录的信息类型 
 */
YIUI.HeadInfoType = {
	/** 操作key*/
	SysOpt : "Sys_Opt",
	/** 操作控件类型*/
	SysOptType : "Sys_Opt_Type",
	/** 记录控件caption*/
	SysOptCaption : "Sys_Opt_Caption",
	/** 记录当前formkey*/
	SysOptFormKey :"Sys_Opt_FormKey",
	/** entry路径*/
	SysEntryPath : "Sys_Entry_Path",
	/** 记录当前formCaption*/
	SysOptFormCaption : "Sys_Opt_FormCaption"
};

YIUI.HeadInfoOptType = {
	/** button*/
	STR_Button : "Button",
		
	/** toolbar*/
	STR_Toolbar : "Toolbar",
		
	/** entry*/
	STR_Entry : "Entry"
};
/** 字典加载策略 */
YIUI.DictLoadType = {
    /** 从根到节点 */
    R2L: 0,
    /** 从节点到根 */
    L2R: 1
};
/** 数据对象扩展参数 */
YIUI.DocExpandDataKeys = {
    /** 表行数后缀 */
    ROWCOUNT_SUFFIX: "_RowCount",
    /** 字典显示值缓存 */
    DICT_CAPTIONS: "DictCaptions"
};
