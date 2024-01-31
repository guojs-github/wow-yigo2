YIUI.UploadButtonHandler = (function () {
    var Return = {
    		
		keys:[  YIUI.Attachment_Data.NAME,
                YIUI.Attachment_Data.PATH,
                YIUI.Attachment_Data.UPLOAD_TIME,
                YIUI.Attachment_Data.UPLOAD_OPERATOR ],
                
        finishedEvent: function (formID, formula, key) {
            var form = YIUI.FormStack.getForm(formID);
            try {
            	if (formula) {
                    var cxt = new View.Context(form);
	                form.eval(formula, cxt, null);
	            }
			} catch (e) {
                console.log(e.stack);
                throw e;
			}
        },
        
        upload: function(form, opts){

        	var self = this;
        	    fileID = opts.file.data("fileID") || -1;
        	    
    	    var doc = form.getDocument(),
            table = doc.getByKey(opts.tableKey);

            var oid = form.getOID(); // 附件所在表单OID
            if( oid == -1 ) {
                oid = form.getPara("OID"); // 参数取
            }
            
            var grid,
            rowIndex = opts.rowIndex,
            path = ""; // 取到当前行数据的附件path,用于删除
            if( table.tableMode == YIUI.TableMode.DETAIL ) {
            	grid = form.getGrid(opts.tableKey);
                if( rowIndex == -1 ) {
                    return false;
                }
                var row = grid.getRowDataAt(rowIndex);
                if( row.bkmkRow ){
                    table.setByBkmk(row.bkmkRow.getBookmark());
                    path = YIUI.TypeConvertor.toString(table.getByKey(YIUI.Attachment_Data.PATH));
                }
            } else {
                table.first();
                path = YIUI.TypeConvertor.toString(table.getByKey(YIUI.Attachment_Data.PATH));
            }
        	
        	var success = function (data) {
        		 if( !data ) return;
        		 if( opts.tableKey ){
        	         var keys = self.keys;
            		 if( table.tableMode == YIUI.TableMode.DETAIL ) {
                         for( var i = 0;i < keys.length;i++ ) {
                             var metaCell = grid.getMetaCellByColumnKey(keys[i]);
                             if( metaCell ) {
                                 grid.setValueByKey(rowIndex,metaCell.key,data[keys[i]],true,true);
                             }
                         }
                     } else {
                         for( var i = 0,size = keys.length;i < size;i++ ) {
                             var com = form.getCompByDataBinding(opts.tableKey,keys[i]);
                             if( com ) {
                                 com.setValue(data[keys[i]],true,true);
                             }
                         }
                     } 
        		 }
        		 //处理前台上传后完成事件
        		 opts.finishedEvent();
    		  };
    		  
    		var paras = {
    			file: opts.file,
    	    	service:"UploadAttachment",
    	    	cmd: "UploadFile",
    			formKey: form.formKey,
    			fileID: fileID,
    			oid: form.getOID(),
    			mode: 1,
    			path: path,
    			fieldKey:opts.fieldKey,
    			maxSize: opts.maxSize,
    			types: !opts.allowedTypes ? null : opts.allowedTypes.split(";"),
    			success: success
    		};
    		
    		YIUI.FileUtil.ajaxFileUpload(paras);
        
        }
        
    };
    Return = $.extend({}, YIUI.Handler, Return);
    return Return;
})();
