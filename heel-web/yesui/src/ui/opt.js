(function () {
    YIUI.OptQueue = function(opts) {
        var reFun = function(opts) {
            var Return = {
                optArray: [],
                init: function() {
                    if (opts) {
                        if($.isArray(opts)) {
                            for ( var i = 0, len = opts.length; i < len; i++ ) {
                                this.optArray.push(opts[i]);
                            }
                        } else {
                            this.optArray.push(opts);
                        }
                    }
                },
                doOpt: function() {

                    var self = this;
                    var stackExecOpt = function(){
                        if(self.optArray.length > 0){
                            var o = self.optArray.shift();
                            return o.doOpt().then(stackExecOpt);
                        }

                        return $.Deferred(function(def){
                                    def.resolve();
                                },function(err){
                                    self.optArray = [];
                                    throw err;
                                }).promise();
                    };

                    var opt = self.optArray.shift();

                    return opt.doOpt().then(stackExecOpt);
                }
            };
            Return.init();
            return Return;
        };
        return reFun(opts);
    };

    YIUI.UICheckOpt = function (form) {
        var ViewException = YIUI.ViewException;
        var Return = {
            showError: function (errorMsg) {

                throw new Error(errorMsg);

            },

            _doOpt: function () {
                
                var getFormError = function () {
                    var msg = form.getErrorMsg();
                    if( !msg ) {
                        msg = ViewException.formatMessage(ViewException.FORM_CHECK_ERROR, form.caption);
                    }
                    return msg;
                }
                
                var getRowError = function (grid,rowData,lineNo) {
                    var msg = grid.getErrorMsg(rowData.error);
                    if( !msg ) {
                        msg = ViewException.formatMessage(ViewException.GRID_ROW_ERROR, grid.caption, lineNo);
                    }
                    return msg;
                }
                
                var getCellError = function (grid,cell,column,lineNo) {
                    var msg = "";
                    if ( cell[4] ) {
                        msg = cellData[5];
                        if( !msg ) {
                            msg = ViewException.formatMessage(ViewException.GRID_CELL_ERROR, grid.caption, lineNo, column.label);
                        }
                    } else if ( cellData[3] ) {
                        msg = ViewException.formatMessage(ViewException.GRID_CELL_REQUIRED, grid.caption, lineNo, column.label);
                    }
                    return msg;
                }
                
                var getComError = function (com) {
                    var msg = "";
                    if (com.errorInfo && com.errorInfo.error) {
                        msg = com.errorInfo.msg;
                        if( !msg ) {
                            msg = ViewException.formatMessage(ViewException.COMPONENT_CHECK_ERROR, com.caption);
                        }
                    } else if (com.isRequired() ) {
                        msg = ViewException.formatMessage(ViewException.COMPONENT_REQUIRED, com.caption);
                    }
                    return msg;
                }

                var self = this;
                if ( form.isError() ) {
                    self.showError(getFormError());
                }

                var rowData,
                    cellData,
                    com,
                    cm;

                for (var i in form.getComponentList()) {
                    com = form.getComponentList()[i];
                    if (com.type == YIUI.CONTROLTYPE.GRID) {
                        for (var ri = 0, size = com.getRowCount(); ri < size; ri++) {
                            rowData = com.getRowDataAt(ri);
                            if( rowData.rowType === 'Fix' || (rowData.rowType === 'Detail' && !YIUI.GridUtil.isEmptyRow(rowData)) ) {
                                if( !$.isEmptyObject(rowData.error) ) {
                                    self.showError(getRowError(com, rowData, ri + 1));
                                }

                                for (var ci = 0, length = com.getColumnCount(); ci < length; ci++) {
                                    cellData = com.getCellDataAt(ri, ci), cm = com.dataModel.colModel.columns[ci];
                                    if( cellData[3] || cellData[4] ) {
                                        self.showError(getCellError(com, cellData, cm, ri + 1));
                                    }
                                }
                            }
                        }
                    } else {
                        if( (com.errorInfo && com.errorInfo.error) || com.isRequired() ) {
                            self.showError(getComError(com));
                        }
                    }
                }
                return true;
            },

            doOpt: function(){
                var self = this;
                return $.Deferred(function(def){
                            self._doOpt();
                            def.resolve(true);
                        }).promise();
            }


        };
        return Return;
    };
    YIUI.EditOpt = function (form,checkUI) {

        var MASK = YIUI.FormUIStatusMask.ENABLE |
            YIUI.FormUIStatusMask.VISIBLE | YIUI.FormUIStatusMask.OPERATION;

        var MASKCHECK = YIUI.FormUIStatusMask.ENABLE| YIUI.FormUIStatusMask.VISIBLE |
            YIUI.FormUIStatusMask.OPERATION | YIUI.FormUIStatusMask.CHECKRULE;

        var Return = {
            doOpt: function(){
                return $.Deferred(function(def){
                            form.setInitOperationState(YIUI.Form_OperationState.Edit);
                            //设置操作状态
                            form.setOperationState(YIUI.Form_OperationState.Edit);
                            //重置界面状态
                            form.resetUIStatus(checkUI ? MASKCHECK : MASK);
                            //在表单进入编辑状态的时候为orderIndex为1的首个组件设定焦点
                            form.initFirstFocus();
                            def.resolve(true);
                        }).promise();
            }
        };
        return Return;
    };

    YIUI.SaveOpt = function (form) {
        var Return = {
            doOpt: function(){
                return $.Deferred(function(def){
                            var metaForm = form.metaForm;

                            var scriptCollection = metaForm.scriptCollection;
                            var saveScript = scriptCollection["save"];

                            if(saveScript){
                                var cxt = new View.Context(form);
                                form.eval(saveScript, cxt, null);
                            }

                            form.setOperationState(YIUI.Form_OperationState.Default);

                            def.resolve(true);
                        }).promise();
            }
        };
        return Return;
    };


    YIUI.LoadOpt = function (form) {
        var Return = {
            doOpt: function(){
                return $.Deferred(function(def){
                            var metaForm = form.metaForm;

                            var scriptCollection = metaForm.scriptCollection;
                            var loadScript = scriptCollection["load"];

                            if(loadScript){
                                var cxt = new View.Context(form);
                                form.eval(loadScript, cxt, null);
                            }

                            def.resolve(true);
                        }).promise();
            }
        };
        return Return;
    };

    YIUI.NewOpt = function (form, refreshUI) {
        var Return = {
            doOpt: function () {

                var docDef = new YIUI.DocService(form).newDocument(form.formKey);
                var oidDef = new YIUI.RemoteService(form).applyNewOID(form.getDataObjectKey());

                return $.when(docDef, oidDef)
                        .then(function(doc, oid){
                            if(!doc){
                                return;
                            }
                            if(form.metaForm.dataObject.primaryType == YIUI.DATAOBJECT_TYPE.ENTITY && doc.mainTableKey){
                                doc.oid = oid;
                                var dt = doc.getByKey(doc.mainTableKey);
                                if( dt.first() ) {
                                    dt.setByKey(YIUI.SystemField.OID_SYS_KEY, oid);
                                }
                            }
                            doc.setNew();
                            form.setDocument(doc);
                            form.setInitOperationState(YIUI.Form_OperationState.New);
                            form.setOperationState(YIUI.Form_OperationState.New);
                            if (refreshUI) {
                                form.showDocument();
                            }
                            return form; 
                        });
            }
        };
        return Return;
    };

    YIUI.CopyNewOpt = function (form) {
        var Return = {
            doOpt: function(){
                new YIUI.DocService(form).copyNew(form).then(function (data) {

                    var doc = YIUI.DataUtil.fromJSONDoc(data.document);

                    form.setSysExpVals("IgnoreKeys", data.ignoreKeys);

                    form.setDocument(doc);
                    form.setInitOperationState(YIUI.Form_OperationState.New);
                    form.setOperationState(YIUI.Form_OperationState.New);
                    form.showDocument();
                });
            }
        };
        return Return;
    };
})();