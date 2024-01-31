YIUI.BatchUtil = (function () {
    var Return = {

    		// 获取叙事簿选中行的OID
    		getViewSelectOIDs: function(form, defaultValue) {
    			if( form.type !== YIUI.Form_Type.View ) {
    				throw new Error("getViewSelectOIDs only use in form with type view");
				}
				var tableKey = form.mainTableKey;
    			if( !tableKey ) {
    				var lv = form.getListView(0);
    				lv && (tableKey = lv.tableKey);
				}
				return this.getSelectOIDs(form,tableKey,YIUI.SystemField.OID_SYS_KEY,defaultValue);
    		},

		    // 从数据源中取得选中行的OID,defaultValue指无选择字段时,是否默认选中
    		getSelectOIDs: function(form, tblKey, oidKey, defaultValue) {
    			var oids = [],doc = form.getDocument();
    			var table = doc.getByKey(tblKey);
    			var s_Tbl = doc.getShadow(tblKey);

    			if( s_Tbl != null ) {
    				s_Tbl.beforeFirst();
    				while( s_Tbl.next() ) {
    					var OID = s_Tbl.getByKey(oidKey);
    					oids.push(OID);
    				}
    			} else {
					var s_key = YIUI.SystemField.SELECT_FIELD_KEY;
    				if( table.indexByKey(s_key) != -1 ) {
                        table.beforeFirst();
                        while( table.next() ) {
                            if( YIUI.TypeConvertor.toBoolean(table.getByKey(s_key)) ){
                                oids.push(table.getByKey(oidKey) );
							}
                        }
					} else {
    					if( defaultValue ) {
                            table.beforeFirst();
                            while( table.next() ) {
                                oids.push(table.getByKey(oidKey));
                            }
						}
					}
    			}
    			return oids;
    		}
    };
    return Return;
})();