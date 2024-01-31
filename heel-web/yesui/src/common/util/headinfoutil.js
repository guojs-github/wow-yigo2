YIUI.HeadInfoUtil = (function () {
    var Return = {
        put: function (self, type, ofFormID) {
        	if (type == YIUI.HeadInfoOptType.STR_Button) {

        		YIUI.HeadInfos.put(YIUI.HeadInfoType.SysOpt, self.key);
                YIUI.HeadInfos.put(YIUI.HeadInfoType.SysOptType, type);
                YIUI.HeadInfos.put(YIUI.HeadInfoType.SysOptCaption, self.caption);
                var form = YIUI.FormStack.getForm(ofFormID);
                YIUI.HeadInfos.put(YIUI.HeadInfoType.SysOptFormKey, form.getFormKey());
                YIUI.HeadInfos.put(YIUI.HeadInfoType.SysOptFormCaption, form.getCaption());

        	} else if (type == YIUI.HeadInfoOptType.STR_Toolbar) {

        		YIUI.HeadInfos.put(YIUI.HeadInfoType.SysOpt, self.key);
                YIUI.HeadInfos.put(YIUI.HeadInfoType.SysOptType, type);
                YIUI.HeadInfos.put(YIUI.HeadInfoType.SysOptCaption, self.caption);
                var form = YIUI.FormStack.getForm(ofFormID);
                YIUI.HeadInfos.put(YIUI.HeadInfoType.SysOptFormKey, form.getFormKey());
                YIUI.HeadInfos.put(YIUI.HeadInfoType.SysOptFormCaption, form.getCaption());

        	} else if (type == YIUI.HeadInfoOptType.STR_Entry) {

        		YIUI.HeadInfos.put(YIUI.HeadInfoType.SysOpt, self.key);
                YIUI.HeadInfos.put(YIUI.HeadInfoType.SysOptType, type);
                YIUI.HeadInfos.put(YIUI.HeadInfoType.SysOptCaption, self.name);
                YIUI.HeadInfos.put(YIUI.HeadInfoType.SysEntryPath, self.path);

        	}            
        },

        clear: function () {
        	YIUI.HeadInfos.clearCurrent();
        },
        
        putAll: function (map) {
        	YIUI.HeadInfos.putAll(map);
        },
        
        getAll: function () {
        	return YIUI.HeadInfos.getAll();
        }
    };
    return Return;
})();