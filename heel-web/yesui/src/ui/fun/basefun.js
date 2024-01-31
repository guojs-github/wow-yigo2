UI.BaseFuns = (function () {
    var funs = {};
    var splitPara = function (para) {
        if (!para) {
            return null;
        }
        para = YIUI.TypeConvertor.toString(para);
        var mapCallback = {}, len = para.length,
            key = "", deep = 0, start = 0;
        for (var i = 0; i < len; i++) {
            var c = para.charAt(i);
            if (c == ':' && deep === 0) {
                key = para.substring(start, i).trim();
            } else if (c == ',' && deep === 0) {
                start = ++i;
            } else if (c == '{') {
                if (deep === 0) {
                    start = ++i;
                }
                deep++;
            } else if (c == '}') {
                deep--;
                if (deep == 0) {
                    mapCallback[key] = para.substring(start, i);
                }
            }
        }

        return mapCallback;
    };

    var keys = [  YIUI.Attachment_Data.NAME,
                YIUI.Attachment_Data.PATH,
                YIUI.Attachment_Data.UPLOAD_TIME,
                YIUI.Attachment_Data.UPLOAD_OPERATOR ];

    var cacheParas = {};
    var SetCacheSession = function(value){
        cacheParas = value;
    };

    var getCacheSession = function(){
        return cacheParas;
    };

    funs.Confirm = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        //提示框显示样式
        var type = YIUI.Dialog_MsgType.DEFAULT;
        if (args.length > 1) {
            if (args[1] == "YES_NO") {
                type = YIUI.Dialog_MsgType.YES_NO;
            } else if (args[1] == "YES_NO_CANCEL") {
                type = YIUI.Dialog_MsgType.YES_NO_CANCEL;
            }
        }

        var infos = YIUI.HeadInfoUtil.getAll();

        var options = {
            msg: YIUI.TypeConvertor.toString(args[0]),
            msgType: type
        };
        var dialog = new YIUI.Control.Dialog(options);
        dialog.render();

        dialog.regExcp(cxt.getExpAction());

        var mapCallback = {};
        if (args.length > 2) {
            if (args[2]) {
                mapCallback = splitPara(args[2]);
            }
        }
        var form = cxt.form;
        dialog.setOwner(form);
        for (var o in mapCallback) {
            dialog.regEvent(o, function (opt) {
                try {
                    YIUI.HeadInfoUtil.putAll(infos);
                    form.eval(mapCallback[opt].trim(), cxt, null);
                } catch (e) {
                    console.log(e.stack);
                    throw e;
                } finally {
                    YIUI.HeadInfoUtil.clear();
                }
            });
        }
    };

    funs.GetFormByType = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var paras = {
            cmd: "GetFormByType",
            service: "WebMetaService",
            filter: args[0]
        };
        var list = new Svr.Request(cxt.form).getSyncData(Svr.SvrMgr.ServletURL, paras);
        return list.items;
    };

    funs.GetDictValue = function (name, cxt, args) {
        if(args.length < 3) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var itemKey = args[0];
        var oid = args[1];
        var fieldKey = args[2];
        return new YIUI.DictService(cxt.form).getDictValue(itemKey, oid, fieldKey);
    };

    funs.GetDictOID = function (name, cxt, args) {
        if(args.length < 3) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var itemKey = args[0];
        var fieldKey = args[1];
        var value = args[2];

        var oid = 0;
        var item = new YIUI.DictService(cxt.form).locate(itemKey, fieldKey, value);
        if (item) {
            oid = item.oid;
        }

        return oid;
    };

    funs.ClearSelection = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var controlKey = args[0];
        var form = cxt.form;
        var cmp = form.getComponent(controlKey);
        if(cmp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, controlKey));
        }
        if (cmp.type == YIUI.CONTROLTYPE.DICTVIEW) {
            cmp.clearSelection();
        }
    };

    funs.CopyNew = function (name, cxt, args) {
        var form = cxt.form;
        var opt = new YIUI.CopyNewOpt(form);
        opt.doOpt();
        return true;
    };

    funs.ClearAllRows = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form, key = args[0], comp = form.getComponent(key);
        if(comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        var retainEmpty = true;
        if (args.length > 1) {
            retainEmpty = args[1];
        }
        switch (comp.type) {
            case YIUI.CONTROLTYPE.LISTVIEW:
                comp.clearAllRows();
                if( comp.tableKey ) {
                    var table = form.getDocument().getByKey(comp.tableKey);
                    table.clear();
                }
                comp.repaint();
                break;
            case YIUI.CONTROLTYPE.GRID:
                var grid = comp, gotEmpty = false;
                var row, len = grid.getRowCount();
                for (var i = len - 1; i >= 0; i--) {
                    row = grid.getRowDataAt(i);
                    if (!row.isDetail)
                        continue;
                    if (retainEmpty && row.bkmkRow == undefined && !gotEmpty) {
                        gotEmpty = true;
                        continue;
                    }
                    grid.deleteRow(i,false);
                }

                // 触发事件
                grid.gridHandler.rowDeleteAll(form,grid,true);
                break;
            default:
                break;
        }
    };

    funs.ToLongArray = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        //参数
        var arrs = [];
        var obj = args[0];
        if ($.isString(obj)) {
            var str = obj.split(",");
            for (var i = 0, len = str.length; i < len; i++) {
                var arr = YIUI.TypeConvertor.toLong(str[i]);
                arrs.push(arr);
            }
        } else if ($.isArray(obj)) {
            for (var i = 0, len = obj.length; i < len; i++) {
                var arr;
                var o = obj[i];
                if (o instanceof YIUI.ItemData) {
                    arr = o.getOID();
                }
                arrs.push(arr);
            }
        }
        return arrs;
    };

    funs.ToJSONArray = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var arrs = [];
        var obj = args[0];
        if ($.isString(obj)) {
            var str = obj.split(",");
            for (var i = 0, len = str.length; i < len; i++) {
                var arr = $.toJSON(str[i]);
                arrs.push(arr);
            }
        } else if ($.isArray(obj)) {
            for (var i = 0, len = obj.length; i < len; i++) {
                var arr;
                var o = obj[i];
                if (o instanceof YIUI.ItemData) {
                    arr = o.toJSON();
                }
                arrs.push(arr);
            }
        }
        return arrs;
    };

    funs.UICheck = function (name, cxt, args) {
        var form = cxt.form, uiCheckOpt = new YIUI.UICheckOpt(form);
        uiCheckOpt.doOpt();
    };

    funs.ChangePWD = function (name, cxt, args) {
        if(args.length < 3) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var operatorID = YIUI.TypeConvertor.toLong(args[0]);
        var password = YIUI.TypeConvertor.toString(args[1]);
        var newPassword = YIUI.TypeConvertor.toString(args[2]);

        // YIUI.RemoteService.getPublicKey().then(function(publicKey){
        //     var rsa = new RSAKey();
        //     rsa.setPublic(publicKey.modulus, publicKey.exponent);
        //     password = rsa.encrypt_b64(password);
        //     newPassword = rsa.encrypt_b64(newPassword);
        //     YIUI.RemoteService.changePWD(operatorID, password, newPassword);
        // });

        var success = function(publicKey) {
            var rsa = new RSAKey();
            rsa.setPublic(publicKey.modulus, publicKey.exponent);
            password = rsa.encrypt_b64(password);
            newPassword = rsa.encrypt_b64(newPassword);
            new YIUI.RemoteService().changePWD(operatorID, password, newPassword);
        };
        new YIUI.RemoteService().getPublicKey(success);

    };

    funs.New = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var formKey = args[0];
        var target = YIUI.FormTarget.NEWTAB;
        if (args.length > 1) {
            target = YIUI.FormTarget.parse(args[1]);
        }
        var tsParas;
        if (args.length > 2) {
            tsParas = args[2];
        }

        var form = cxt.form;

        if (tsParas) {
            tsParas = splitPara(tsParas);
            for (var key in tsParas) {
                var value = form.eval(tsParas[key], cxt);
                form.setCallPara(key, value);
            }
        }

        if(target != YIUI.FormTarget.SELF) {
            var container = form.getContainer();

            var builder = new YIUI.YIUIBuilder(formKey);
            builder.setContainer(container);
            builder.setTarget(target);
            builder.setParentForm(form);

            builder.newEmpty().then(function(emptyForm){
                YIUI.FormParasUtil.processCallParas(form, emptyForm);
                emptyForm.setOptQueue(new YIUI.OptQueue(new YIUI.NewOpt(emptyForm)));
                builder.builder(emptyForm);
            });
        }else{
            var opt = new YIUI.NewOpt(form, true);
            opt.doOpt();
        }
    };

    funs.Show = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var formKey = args[0];
        var container = form.getContainer();
        var target = YIUI.FormTarget.NEWTAB;
        if (args.length > 1) {
            target = YIUI.FormTarget.parse(args[1]);
        }

        var container = form.getContainer();
        var builder = new YIUI.YIUIBuilder(formKey);
        builder.setContainer(container);
        builder.setTarget(target);
        builder.setParentForm(form);

        builder.newEmpty().then(function(emptyForm){
            YIUI.FormParasUtil.processCallParas(form, emptyForm);
            builder.builder(emptyForm);
        });
        return true;
    };

    funs.Load = function (name, cxt, args) {
        var form = cxt.form;
        var loadOpt = new YIUI.LoadOpt(form);
        loadOpt.doOpt();
    };

    funs.Edit = function (name, cxt, args) {
        var form = cxt.form;
        var checkUI = false;
        if (args.length > 0) {
            checkUI = YIUI.TypeConvertor.toBoolean(args[0]);
        }
        var editOpt = new YIUI.EditOpt(form, checkUI);
        editOpt.doOpt();
    };

    funs.IsEdit = function (name, cxt, args) {
        var form = cxt.form;
        var state = -1;
        if (form != null) {
            state = form.getOperationState();
        }
        return state == YIUI.Form_OperationState.Edit ;
    };

    funs.Open = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var formKey = args[0],
            OID = YIUI.TypeConvertor.toLong(args[1]);
        var container = form.getContainer();
        var target = YIUI.FormTarget.NEWTAB;
        if (args.length > 2) {
            target = YIUI.FormTarget.parse(args[2]);
        }

        var tsParas;
        if (args.length > 3) {
            tsParas = args[3];
        }

        if (tsParas) {
            tsParas = splitPara(tsParas);
            for (var key in tsParas) {
                var value = form.eval(tsParas[key], cxt);
                form.setCallPara(key, value);
            }
        }

        var container = form.getContainer();
        var builder = new YIUI.YIUIBuilder(formKey);
        builder.setContainer(container);
        builder.setTarget(target);
        builder.setParentForm(form);
        builder.setOperationState(YIUI.Form_OperationState.Default);

        builder.newEmpty().then(function(emptyForm){

            var filterMap = emptyForm.getFilterMap();
            filterMap.setOID(OID);

            emptyForm.setOptQueue(new YIUI.OptQueue(new YIUI.LoadOpt(emptyForm)));
            YIUI.FormParasUtil.processCallParas(form, emptyForm);

            builder.builder(emptyForm);
        });

        return true;
    };

    funs.Save = function (name, cxt, args) {
        var saveOpt = YIUI.SaveOpt(cxt.form);
        saveOpt.doOpt();
    };

    funs.SaveData = function (name, cxt, args) {
        var form = cxt.form;
        var checkUI = true;
        if (args.length > 0) {
            checkUI = YIUI.TypeConvertor.toBoolean(args[0]);
        }
        if( checkUI ) {
            var opt = new YIUI.UICheckOpt(form);
            opt.doOpt();
        }

        new YIUI.DocService(form).saveFormData(form);
    };

    funs.LoadData = function (name, cxt, args) {
        var form = cxt.form;
        form.setWillShow(true);
        var fm = form.getFilterMap();
        fm.reset();
        YIUI.LoadingUtil.show();
        new YIUI.DocService(form).loadFormData(form, fm.OID, fm, form.getCondParas())
            .then(function(doc){
                form.setDocument(doc);
                if(doc.getExpData(YIUI.BPMKeys.WORKITEM_INFO))
                    form.setSysExpVals(YIUI.BPMConstants.WORKITEM_INFO,doc.getExpData(YIUI.BPMKeys.WORKITEM_INFO));
                form.showDocument();
            });
    };

    funs.ShowData = function (name, cxt, args) {

    };

    // 计算查询条件默认值
    funs.CalcCondition = function (name, cxt, args) {
        var form = cxt.form;
        if( !form.getUIProcess() )
            return;
        var items = [],component;
        var exps = form.dependency.calcTree.items;
        for( var i = 0,size = exps.length;i < size;i++ ) {
            if( exps[i].objectType !== YIUI.ExprItem_Type.Item )
                continue;
            component = form.getComponent(exps[i].source);
            if(component == null) {
                throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, exps[i].source));
            }
            if( component.condition ) {
                items.push(exps[i]);
            }
        }
        form.getUIProcess().calcItems(items);
    }

    funs.DealCondition = function (name, cxt, args) {
        var isParent = false;
        if (args.length > 0) {
            isParent = args[0];
        }
        var form = cxt.form;
        var target = (isParent && form.getParentForm() != null) ? form.getParentForm() : form;
        var condFomKey = null;
        condFomKey = form.getFormKey();
        var paras = target.getCondParas();
        if ($.isEmptyObject(paras)) {
            paras = new ConditionParas();
            target.setCondParas(paras);
        } else {
            paras.clear();
        }
        paras.setCondFormKey(condFomKey);
        var condition = null;
        var highCondition = null;
        var condItem = null;
        var value = null;
        var compList = form.getComponentList();
        for (var i in compList) {
            var cmp = compList[i];

            // 处理特殊查询
            if ( cmp.type == YIUI.CONTROLTYPE.GRID && cmp.condition) {
                for( var i = 0,size = cmp.getRowCount();i < size;i++ ) {
                    highCondition = {
                        lBrac: 0,
                        key: "",
                        sign: -1,
                        value: "",
                        rBrac: 0,
                        logical: 0,
                        tableKey: "",
                        columnKey: "",
                        type: -1,
                        onlyDate: true,
                        itemKey: "",
                        stateMask: 7,
                        filter: {}
                    };

                    highCondition.lBrac = YIUI.TypeConvertor.toInt(cmp.getValueByKey(i,"LBrac"));

                    // 去除无key
                    var tableColumn =  YIUI.TypeConvertor.toString(cmp.getValueByKey(i,"Field"));
                    if (tableColumn.isEmpty()) {
                        continue;
                    }

                    var loc = form.getCellLocation("Value");
                    var editOpt = cmp.getCellEditOpt(i,loc.column);

                    var typeFormula = editOpt.editOptions.typeFormula;
                    cxt.updateLocation(cmp.key,i,-1);
                    var typeDefKey = form.eval(typeFormula, cxt);
                    if(!typeDefKey){
                        continue ;
                    }

                    highCondition.tableKey = form.metaForm.cellTypeGroup[typeDefKey].tableKey;
                    highCondition.columnKey = form.metaForm.cellTypeGroup[typeDefKey].columnKey;
                    var options = form.metaForm.cellTypeGroup[typeDefKey].editOptions;
                    var cellType = options.cellType;

                    value = cmp.getValueByKey(i,"Value");
                    if (value == null) {
                        continue;
                    }

                    if (cellType == YIUI.CONTROLTYPE.DATEPICKER) {
                        value = value.getTime();
                        highCondition.onlyDate = $.isUndefined(options.onlyDate) ? false : options.onlyDate;
                    } else if (cellType == YIUI.CONTROLTYPE.COMPDICT
                        || cellType == YIUI.CONTROLTYPE.DICT
                        || cellType == YIUI.CONTROLTYPE.DYNAMICDICT) {

                        if (options.allowMultiSelection) {
                            if (value.length == 1 && value[0].oid == 0) {
                                continue;
                            }

                            var itemFilters = options.itemFilters;
                            var filter = null;
                            if (itemFilters) {
                                var itemFilter = itemFilters[options.itemKey];
                                if (itemFilter != null && itemFilter != undefined && itemFilter.length > 0) {
                                    for (var m = 0, len = itemFilter.length; m < len; m++) {
                                        var cond = itemFilter[m].cond;
                                        // 暂时处理
                                        if (cond && cond.length > 0) {
                                            if(!cxt) {
                                                cxt = new View.Context(form);
                                            }
                                            var ret = form.eval(cond, cxt, null);
                                            if (ret == true) {
                                                filter = itemFilter[m];
                                                break;
                                            }
                                        } else {
                                            filter = itemFilter[m];
                                            break;
                                        }
                                    }
                                }
                            }

                            if (filter) {
                                var filterVal, fparas = [];
                                if (filter.filterVals !== null && filter.filterVals !== undefined && filter.filterVals.length > 0) {
                                    for (var j in filter.filterVals) {
                                        filterVal = filter.filterVals[j];
                                        // 暂时处理
                                        switch (filterVal.type) {
                                            case YIUI.FILTERVALUETYPE.CONST:
                                                fparas.push(filterVal.refVal);
                                                break;
                                            case YIUI.FILTERVALUETYPE.FORMULA:
                                            case YIUI.FILTERVALUETYPE.FIELD:
                                                if(!cxt) {
                                                    cxt = new View.Context(form);
                                                }
                                                fparas.push(form.eval(filterVal.refVal, cxt, null));
                                                break;
                                        }
                                    }
                                }
                                var dictFilter = {};
                                dictFilter.itemKey = options.itemKey;
                                dictFilter.formKey = form.formKey;
                                dictFilter.sourceKey = "";
                                dictFilter.fieldKey = "";
                                dictFilter.filterIndex = filter.filterIndex;
                                dictFilter.values = fparas;
                                dictFilter.dependency = filter.dependency;
                                dictFilter.typeDefKey = typeDefKey;

                                highCondition.filter = dictFilter;
                            }

                        }

                        highCondition.itemKey = options.itemKey;
                        highCondition.stateMask = $.isUndefined(options.stateMask) ? 7 : options.stateMask;
                    }

                    highCondition.type = cellType;
                    highCondition.value = value;
                    highCondition.key = tableColumn;

                    highCondition.sign = YIUI.TypeConvertor.toInt(cmp.getValueByKey(i,"Sign"));

                    highCondition.rBrac = YIUI.TypeConvertor.toInt(cmp.getValueByKey(i,"RBrac"));

                    highCondition.logical = YIUI.TypeConvertor.toInt(cmp.getValueByKey(i,"Logical"));

                    paras.addHighCond(highCondition);
                }
            }

            // 普通查询处理
            if ( cmp.value && !cmp.isNull() && cmp.condition) {
                condition = cmp.condition;
                value = cmp.value;
                if (cmp.type == YIUI.CONTROLTYPE.DATEPICKER) {
                    value = cmp.getValue().getTime();
                    condition.onlyDate = YIUI.TypeConvertor.toBoolean(cmp.isOnlyDate);
                } else if (cmp.type == YIUI.CONTROLTYPE.NUMBEREDITOR) {
                    if (value == 0) continue;
                } else if (cmp.type == YIUI.CONTROLTYPE.COMPDICT
                    || cmp.type == YIUI.CONTROLTYPE.DICT) {

                    if (cmp.multiSelect) {
                        if (value.length == 1 && value[0].oid == 0) {
                            continue;
                        }
                        //多选的情况 添加界面过滤条件。 汇总节点选中， 并非所有子节点 都显示。
                        var filter = YIUI.DictHandler.getDictFilter(form, cmp.key, cmp.getMetaObj().itemFilters, cmp.itemKey);
                        if (filter != null) {
                            condition.filter = filter;
                        }
                    }
                    condition.itemKey = cmp.itemKey;
                    condition.stateMask = cmp.stateMask;
                }
                condition.value = value;
                paras.add(condition);
            } else if (cmp.condition && cmp.condition.limitToSource) {
                condition = cmp.condition;
                if (cmp.type == YIUI.CONTROLTYPE.COMPDICT
                    || cmp.type == YIUI.CONTROLTYPE.DICT) {

                    var filter = YIUI.DictHandler.getDictFilter(form, cmp.key, cmp.getMetaObj().itemFilters, cmp.itemKey);
                    if (filter == null) {
                        continue;
                    }

                    condition.filter = filter;
                    condition.itemKey = cmp.itemKey;
                    condition.stateMask = cmp.stateMask;
                    paras.add(condition);
                }

            }
        }

        var filterMap = form.getFilterMap().filterMap;
        for (var i = 0, len = filterMap.length; i < len; i++) {
          filterMap[i].startRow = 0;
        }

        //保存查询条件到指定文件
        var preference = {};
        for(var j in compList){
              var cond = compList[j].condition;
              var cmp = compList[j];
              if (cond){
                if(cond.loadHistoryInput){
                  if (cond.type == YIUI.CONTROLTYPE.DATEPICKER){
                    var key = cmp.key;
                    var value = "";
                    if (cmp.value){
                      var time = new Date(cmp.value);
                      value = time.Format("yyyy-MM-dd HH:mm:ss");
                    }
                    preference[key] = value;
                  }else if (cond.type == YIUI.CONTROLTYPE.DICT){
                      var str = "";
                      var key = cmp.key;
                      if (cmp.value){
                        if(cmp.value instanceof Array){
                          for(var k = 0;k<cmp.value.length;k++){
                              var value = cmp.value[k].oid;
                              if(k==0){
                                  str = value + "";
                              }else{
                                  str = str + "," + value
                              }
                          }
                        }else{
                          var value = cmp.value.oid;
                          str = value;
                        }
                      }
                      preference[key] = str;
                  }else{
                      var key = cmp.key;
                      var value = cmp.value;
                      if (value == undefined){
                        value = "";
                      }
                      preference[key] = value;
                  }
                }
              }
		    }
      
		    new YIUI.RemoteService(form).savePreference(form.getFormKey(),preference);
    };

    funs.GetCondSignItems = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var formKey = args[0];
        var field = args[1];

        var paras = {
            service: "WebMetaService",
            cmd: "GetCondSignItems",
            formKey: formKey,
            field: field
        };

        return new Svr.Request(cxt.form).getSyncData(Svr.SvrMgr.ServletURL, paras);
    };

    funs.GetDynamicCellKey = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var pForm = cxt.form, formKey = args[0], tsParas = args[1], field = "", sign = -1;
        var paras = {formKey: formKey}, callBack = {};

        if (tsParas) {
            tsParas = splitPara(tsParas);
            field = tsParas["Field"] ? YIUI.TypeConvertor.toString(pForm.eval(tsParas["Field"], cxt)): "";
            sign = tsParas["Sign"] ? YIUI.TypeConvertor.toInt(pForm.eval(tsParas["Sign"],cxt)): -1;
        }

        var paras = {
            service: "WebMetaService",
            cmd: "GetDynamicCellKey",
            formKey: formKey,
            field: field,
            sign: sign
        };

        return new Svr.Request(pForm).getSyncData(Svr.SvrMgr.ServletURL, paras);
    };

    funs.GetAllCondition = function (name, cxt, args) {

        if(!this.condItemCache){
            this.condItemCache = new LRUCache(5);
        }

        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var formKey = args[0];

        var paras = {
            service: "WebMetaService",
            cmd: "GetConditionItems",
            formKey: formKey
        };

        var condItems = null;
        if(this.condItemCache.contains(formKey)) {
            condItems = this.condItemCache.get(formKey);
        } else {
            condItems = new Svr.Request(cxt.form).getSyncData(Svr.SvrMgr.ServletURL, paras)
            this.condItemCache.set(formKey, condItems);
        }
        return condItems;
    };

    funs.ReadOnly = function (name, cxt, args) {
        var form = cxt.form;
        var operationState = -1;
        if (form != null) {
            operationState = form.getOperationState();
        }
        return operationState == YIUI.Form_OperationState.Default;
    };

    funs.Cancel = function (name, cxt, args) {
        var form = cxt.form;
        if (form.getOperationState() == YIUI.Form_OperationState.New) {
            form.close();
        } else if (form.getOperationState() == YIUI.Form_OperationState.Edit) {
            new YIUI.DocService(form).loadFormData(form, form.getFilterMap().OID, form.getFilterMap(), form.getCondParas())
                .then(function(doc){
                    form.setOperationState(YIUI.Form_OperationState.Default);
                    form.setDocument(doc);
                    form.showDocument();
                });
        }
    };

    funs.ContainsKey = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = YIUI.TypeConvertor.toString(args[0]);
        var comp = form.getComponent(key);
        if (comp) return true;

        var location = form.getCellLocation(key);
        if (location)
            return true;

        return false;
    };

    funs.SetEnable = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            controlKey = args[0],
            enable = args[1],
            cmp = form.getComponent(controlKey);
        if(cmp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, controlKey));
        }
        cmp.setEnable(enable);
    };

    funs.GetClusterID = function (name, cxt, args) {
        var id = $.cookie("clusterid") || -1;
        return parseInt(id);
    };

    funs.OpenDict = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var pForm = cxt.form;
        var formKey = args[0],
            OID = YIUI.TypeConvertor.toString(args[1]);
        //参数3保留

        var tsParas;
        if (args.length > 3) {
            tsParas = args[3];
        }

        if (tsParas) {
            tsParas = splitPara(tsParas);
            for (var key in tsParas) {
                var value = pForm.eval(tsParas[key], cxt);
                pForm.setCallPara(key, value);
            }
        }

        var container = pForm.getDefContainer();
        if (container == null) {
            container = pForm.getContainer();
        }

        var builder = new YIUI.YIUIBuilder(formKey);
        builder.setContainer(container);
        builder.setParentForm(pForm);
        builder.setOperationState(YIUI.Form_OperationState.Default);

        builder.newEmpty().then(function(emptyForm){

            if(OID > 0){
                var filterMap = emptyForm.getFilterMap();
                filterMap.setOID(OID);
                emptyForm.setOptQueue(new YIUI.OptQueue(new YIUI.LoadOpt(emptyForm)));
            }

            YIUI.FormParasUtil.processCallParas(pForm, emptyForm);

            emptyForm.regEvent(YIUI.FormEvent.ShowDocument, function(){
                pForm.resetUIStatus(YIUI.FormUIStatusMask.OPERATION);
            });

            return builder.builder(emptyForm);
        });
    };

    funs.NewDict = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var formKey = args[0];
        var pForm = cxt.form;
        //参数2保留
        var tsParas;
        if (args.length > 2) {
            tsParas = args[2];
        }

        if (tsParas) {
            tsParas = splitPara(tsParas);
            for (var key in tsParas) {
                var value = pForm.eval(tsParas[key], cxt);
                pForm.setCallPara(key, value);
            }
        }

        var container = pForm.getDefContainer();
        if (container == null) {
            container = pForm.getContainer();
        }

        var builder = new YIUI.YIUIBuilder(formKey);
        builder.setContainer(container);
        builder.setParentForm(pForm);

        builder.newEmpty().then(function(emptyForm){

            YIUI.FormParasUtil.processCallParas(pForm, emptyForm);
            emptyForm.setOptQueue(new YIUI.OptQueue(new YIUI.NewOpt(emptyForm)));

            emptyForm.regEvent(YIUI.FormEvent.ShowDocument, function(){
                pForm.resetUIStatus(YIUI.FormUIStatusMask.OPERATION);
            });

            return builder.builder(emptyForm);
        });
    };

    var doMap = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            mapKey = YIUI.TypeConvertor.toString(args[0]),
            tgtFormKey = YIUI.TypeConvertor.toString(args[1]);

        var mapWorkitemInfo = false;
        if (args.length > 2) {
            mapWorkitemInfo = YIUI.TypeConvertor.toBoolean(args[2]);
        }

        var postFormula = '';
        if (args.length > 3) {
            postFormula = YIUI.TypeConvertor.toString(args[3]);
        }

        mapData(form, null, tgtFormKey, mapKey, mapWorkitemInfo, postFormula);
    };

    var mapData = function (srcForm, tgtForm, tgtFormKey, mapKey, mapWorkitemInfo, postFormula) {
        var srcFormKey = srcForm.formKey,
            formDoc = srcForm.getDocument();

        var srcDoc = YIUI.DataUtil.toJSONDoc(formDoc, true);

        var tgtDoc = tgtForm ? tgtForm.getDocument() : null;
        if( tgtDoc ) {
            tgtDoc = YIUI.DataUtil.toJSONDoc(tgtDoc);
        }

        new YIUI.DataMapService(srcForm).mapData(mapKey, srcFormKey, tgtFormKey, srcDoc, tgtDoc)
            .done(function(json) {
                afterDoMap(srcForm, tgtForm, tgtFormKey, json, mapWorkitemInfo, postFormula);
            });
    };

    var afterDoMap = function(srcForm, tgtForm, tgtFormKey, json, mapWorkitemInfo, postFormula) {

        var show = function (tgtForm) {

            var document = YIUI.DataUtil.fromJSONDoc(json.document),
                ignoreKeys = json.ignoreKeys,
                gridKeys = json.gridKeys;

            if( ignoreKeys ) {
                tgtForm.setSysExpVals("IgnoreKeys", ignoreKeys);
            }

            tgtForm.regEvent(YIUI.FormEvent.ShowDocument, function(){
                if( gridKeys ) {
                  gridKeys.forEach(function (key) {
                    var grid = tgtForm.getComponent(key);
                    grid && grid.getHandler().dealWithSequence(tgtForm,grid,0);
                  });
                }
            });

            tgtForm.setDocument(document);
            tgtForm.showDocument();

            if (mapWorkitemInfo) {
                if(srcForm){
                    var info = srcForm.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
                    if (info != null){
                        document.putExpData(YIUI.BPMKeys.SaveBPMMap_KEY, info.WorkitemID);
                        document.expDataType[YIUI.BPMKeys.SaveBPMMap_KEY] = YIUI.ExpandDataType.LONG;
                    }
                }
            }

            if (postFormula) {
                var cxt = new View.Context(tgtForm);
                tgtForm.eval(postFormula, cxt, null);
            }
        }

        if( !tgtForm ) {

            var container = srcForm.getContainer();
            var builder = new YIUI.YIUIBuilder(tgtFormKey);
            builder.setContainer(container);
            builder.setParentForm(srcForm);

            builder.newEmpty().then(function(emptyForm){

                emptyForm.setOptQueue(new YIUI.OptQueue(new YIUI.NewOpt(emptyForm)));

                emptyForm.setWillShow(true);

                return builder.builder(emptyForm);

            }).then(function (form) {

                show(form);

            });

        } else {

            show(tgtForm);

        }
    };

    funs.Map = function (name, cxt, args) {
        doMap(name, cxt, args);
    };

    funs.MidMap = function (name, cxt, args) {
        doMap(name, cxt, args);
    };

    funs.MapEx = function (name, cxt, args) {
        if(args.length < 3) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var mapKey = YIUI.TypeConvertor.toString(args[0]);
        var formKey = YIUI.TypeConvertor.toString(args[1]);
        if (formKey.isEmpty()) {
            throw new YIUI.ViewException(YIUI.ViewException.MAP_MISS_FORMKEY,
                YIUI.ViewException.formatMessage(YIUI.ViewException.MAP_MISS_FORMKEY));
        }
        var srcOID = YIUI.TypeConvertor.toLong(args[2]);

        var container = form.getContainer();
        var builder = new YIUI.YIUIBuilder(formKey);
        builder.setContainer(container);
        builder.setParentForm(form);
        builder.setTarget(YIUI.FormTarget.NEWTAB);
        var tgtFormDef = builder.newEmpty().then(function(emptyForm){
            emptyForm.setOptQueue(new YIUI.OptQueue(new YIUI.NewOpt(emptyForm)));
            return builder.builder(emptyForm);
        });

        var tgtDocDef = new YIUI.DataMapService(form).midMap(mapKey, srcOID);
        $.when(tgtFormDef, tgtDocDef).then(function(tgtForm, tgtDoc){
            tgtForm.setDocument(tgtDoc);
            tgtForm.showDocument();
            return tgtForm;
        });
        return true;
    };

    funs.AutoMap = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var mapKey = YIUI.TypeConvertor.toString(args[0]);
        var form = cxt.form,
            formKey = form.formKey,
            formDoc = form.getDocument();

        var doc = YIUI.DataUtil.toJSONDoc(formDoc, true);

        new YIUI.DataMapService(form).autoMap(mapKey, doc);
        return true;
    };

    funs.ViewMap = function (name, cxt, args) {
        if (args.length > 1) {
            var toNewForm = YIUI.TypeConvertor.toBoolean(args[1]);
            if (toNewForm) {
                throw new YIUI.ViewException(YIUI.ViewException.DATA_BINDING_ERROR,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.DATA_BINDING_ERROR));
            }
        }
        return UI.BaseFuns.MapToForm(name, cxt, args);
    };

    funs.MapToForm = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            mapKey = YIUI.TypeConvertor.toString(args[0]),
            srcFormKey = form.formKey,
            tgtForm = form.getParentForm(),
            tgtFormKey = tgtForm.formKey;

        mapData(form, tgtForm, tgtFormKey, mapKey);

        return true;
    };

    funs.HasDataMaped = function (name, cxt, args) {
        var form = cxt.form;
        var doc = form.getDocument();
        if (doc.isNew())
            return false;
        var tbls = doc.tbls;
        for (var i = 0, len = tbls.length; i < len; i++) {
            var tbl = tbls[i];
            if (!tbl) continue;
            tbl.beforeFirst();
            while (tbl.next()) {
                var count = tbl.getByKey(YIUI.SystemField.MAPCOUNT_SYS_KEY);
                if (count && count > 0)
                    return true;
            }
        }
        return false;
    };

    {
        //ViewBatchProcessFunction
        funs.BatchDeleteData = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form;
            var objectKey = YIUI.TypeConvertor.toString(args[0]);
            var tableKey = YIUI.TypeConvertor.toString(args[1]);
            var OIDFieldKey = YIUI.SystemField.OID_SYS_KEY;
            if (args.length > 2)
                OIDFieldKey = YIUI.TypeConvertor.toString(args[2]);
            var OIDList = YIUI.BatchUtil.getSelectOIDs(form, tableKey, OIDFieldKey, false);

            var docService = new YIUI.DocService(form);
            docService.batchDeleteData(objectKey,OIDList);

            var com = form.getListView(tableKey) || form.getGrid(tableKey);
            if( !com ) return;

            var _doc = form.getDocument();
            
            var fm = form.getFilterMap(); // 重置filterMap
            fm.reset();

            docService.loadFormData(form, _doc.oid, fm, form.getCondParas())
                .then(function(doc){

                    var keys = _doc.shadowKeys(),table; // 转移其他影子表
                    keys.forEach(function(key){
                        table = _doc.getShadow(key);
                        doc.addShadow(key,table);
                        if( key == tableKey ) {
                            table.clear();
                        }
                    });

                    form.setDocument(doc); // 替换表,expData还要特殊处理,索性直接替换doc

                    com.reset(); // 删完回第一页
                    com.load(); // 不需要构建
                });
            return true;
        };

        funs.BatchMap = function (name, cxt, args) {
            if(args.length < 3) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var mapKey = args[0];
            var tblKey = args[1];
            var fieldKey = args[2];
            var form = cxt.form;

            var comp;
            var lv = form.getListView(tblKey);
            var grid = form.getGrid(tblKey);
            var oids = [];
            if (lv) {
                oids = lv.getFieldArray(form, fieldKey);
            } else if (grid) {
                oids = grid.getFieldArray(form, fieldKey);
            }

            new YIUI.DataMapService(form).batchMidMap(mapKey, oids);
        };
    }

    funs.ShowModal = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var pForm = cxt.form, formKey = args[0], tsParas = args[1], callbackList = args[2];
        var paras = {formKey: formKey}, callBack = {};
        if (callbackList) {
            paras.callbackList = callbackList;
            callBack = splitPara(callbackList);
        }
        if (tsParas) {
            tsParas = splitPara(tsParas);
            for (var key in tsParas) {
                var value = pForm.eval(tsParas[key], cxt);
                pForm.setCallPara(key, value);
            }
        }

        var container = pForm.getContainer();
        var builder = new YIUI.YIUIBuilder(formKey);
        builder.setContainer(container);
        builder.setParentForm(pForm);
        builder.setTarget(YIUI.FormTarget.MODAL);

        builder.newEmpty().then(function(emptyForm){

            YIUI.FormParasUtil.processCallParas(pForm, emptyForm);
            for (var o in callBack) {
                var cxt1 = new View.Context(emptyForm);
                emptyForm.regEvent(o, function (opt) {
                    emptyForm.eval(callBack[opt].trim(), cxt1, null);
                });
            }

            builder.builder(emptyForm);
        });

        return true;
    };

    funs.DoEventCallback = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0];
        if(key){
            var event = form.getEvent(key);
            if(event){
                event(key, form, args);
            }
        }
    };

    funs.CloseTo = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var targetKey = args[0];
        var container = form.getContainer();
        container.closeTo(targetKey);
    };

    funs.Close = function (name, cxt, args) {
        var form = cxt.form;
        form.fireClose();
    };

    funs.GetDataObjectKey = function (name, cxt, args) {
        var form = cxt.form;
        var formKey = form.formKey;
        if (args.length > 0) {
            formKey = args[0];
        } else {
            return form.getDataObject().key;
        }
        var params = {formKey: formKey, cmd: "GetDataObjectKey", service: "WebMetaService"};
        var result = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, params);
        return result;
    };

    funs.GetOID = function (name, cxt, args) {
        var form = cxt.form;
        var oid = -1;
        if (form) {
            oid = form.getOID();
        }
        return oid;
    };

    funs.GetInitOperationState = function (name, cxt, args) {
        var form = cxt.form;
        var state = -1;
        if (form) {
            state = form.getInitOperationState();
        }

        return state;
    };

    funs.DeleteData = function (name, cxt, args) {
        var form = cxt.form;
        var formDoc = form.getDocument();
        var doc = YIUI.DataUtil.toJSONDoc(formDoc);
        var oid = doc.oid;
        if (args.length > 0) {
            oid = YIUI.TypeConvertor.toLong(args[0]);
        }

        new YIUI.DocService(form).deleteFormData(form.getFormKey(), oid);
//            .then(function(){
        //删除后 应该清空字典缓存，不清空理论上不会有问题。
        form.setInitOperationState(YIUI.Form_OperationState.Delete);
        form.setOperationState(YIUI.Form_OperationState.Delete);
//            });
        return true;
    };

    funs.DeleteDocument = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var objectKey = YIUI.TypeConvertor.toString(args[0]);

        var OIDList = [];
        OIDList.push(YIUI.TypeConvertor.toLong(args[1]));

        new YIUI.DocService(cxt.form).batchDeleteData(objectKey, OIDList);

        return true;
    };

    funs.ShowDictView = function (name, cxt, args) {
        var form = cxt.form;

    };

    funs.EnabledDict = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var itemKey = args[0];
        var oid = args[1];
        var enable = 1;
        var allChildren = true;

        if (args.length > 2) {
            enable = args[2];
        }

        if (args.length > 3) {
            allChildren = args[3];
        }

        new YIUI.DictService(form).enabledDict(itemKey, oid, enable, allChildren);
        form.setInitOperationState(YIUI.Form_OperationState.Edit);
        return true;

    };

    funs.IsNew = function (name, cxt, args) {
        var form = cxt.form;
        var state = -1;
        if (form) {
            state = form.getOperationState();
        }
        return state == YIUI.Form_OperationState.New;
    };

    funs.IsNewOrEdit = function (name, cxt, args) {
        var form = cxt.form;
        var state = -1;
        if (form) {
            state = form.getOperationState();
        }
        return state == YIUI.Form_OperationState.Edit || state == YIUI.Form_OperationState.New;

    };

    funs.SetValue = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var controlKey = args[0], value = args[1];

        var fireEvent = false;
        if (args.length > 2) {
            if (args[2] === true || args[2] === "true") fireEvent = true;
        }
        form.setComponentValue(controlKey, value, fireEvent);
        return true;
    };

    funs.GetValue = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var controlKey = args[0];
        var com = form.getComponent(controlKey);
        if(com == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS,controlKey));
        }
        return YIUI.ExprUtil.convertValue(com.getValue());
    };

    funs.GetOldValue = function (name, cxt, args){
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
    	var form = cxt.form;
    	var controlKey = args[0];
    	var com = form.getComponent(controlKey);
    	if(com == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS,controlKey));
        }
    	return YIUI.ExprUtil.convertValue(com.getOldValue());
    }
    funs.GetText = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            controlKey = args[0];

        var com = form.getComponent(controlKey);
        if(com == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, controlKey));
        }

        return com.getShowText();
    };

    funs.GetJSONValue = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var controlKey = args[0];
        return YIUI.ExprUtil.getJSONValue(form, controlKey);
    };

    funs.CommitValue = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = YIUI.TypeConvertor.toString(args[0]);
        var comp = form.getComponent(key);
        if(comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        comp.commitValue();
        return true;
    };

    funs.RollbackValue = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = YIUI.TypeConvertor.toString(args[0]);
        var comp = form.getComponent(key);
        if(comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        comp.rollbackValue();
        return true;
    };

    funs.SumExpand = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var count = new Decimal(0),
            form = cxt.form,
            cellKey = args[0],
            loc = form.getCellLocation(cellKey),
            grid = form.getComponent(loc.key);
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, loc.key));
        }

        var condition = args.length > 1 ? args[1] : '';

        var locInfo = cxt.getLoc(grid.key),
            colIndex = locInfo.getColumn(),
            rowIndex = locInfo.getRow();

        var row = grid.getRowDataAt(rowIndex),
            metaRow = grid.getMetaObj().rows[row.metaRowIndex];

        var multiKey;
        if( colIndex != -1 ) {
            var metaCell = metaRow.cells[colIndex];
            if( metaCell.isColExpand ) {
                multiKey = metaCell.crossValue;
            }
        }

        var context = new View.Context(form),
            metaCell,
            result = true;
        for (var i = 0, len = metaRow.cells.length; i < len; i++) {
            metaCell = metaRow.cells[i];
            if (metaCell.isColExpand && metaCell.key == cellKey) {
                var curMultiKey = metaCell.crossValue;
                if( !multiKey || curMultiKey.contains(multiKey) ) {
                    if( condition ) {
                        context.updateLocation(grid.key,rowIndex,i);
                        result = YIUI.TypeConvertor.toBoolean(form.eval(condition,context));
                    }
                    if( result ) {
                        count = count.plus(YIUI.TypeConvertor.toDecimal(row.data[i][0]));
                    }
                }
            }
        }
        return count;
    };

    funs.SumAccu = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            cellKey = YIUI.TypeConvertor.toString(args[0]),
            groupKey = YIUI.TypeConvertor.toString(args[1]);

        var loc = form.getCellLocation(cellKey),
            column = loc.column,
            locInfo = cxt.getLoc(loc.getKey()),
            rowIndex = locInfo.getRow();

        var column = loc.column;
        if( column == -1 ) {
            column = locInfo.column;
        }

        var grid = form.getComponent(loc.key);
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, loc.key));
        }
        var row = grid.getRowDataAt(rowIndex);

        var sumValue = new Decimal(0);

        var index = grid.getGroupIndex(groupKey);

        var groupValue = row.groupValue;
        if( !groupValue ) {
            return;
        }

        var newValue = new YIUI.MultiKey();
        for( var i = 0;i <= index;i++ ) {
            newValue.addValue(groupValue.getValue(i));
        }

        var curRow = null;
        if( row.isGroupHead ) { // 如果是分组头,从上往下循环
            for( var i = rowIndex + 1,size = grid.getRowCount();i < size;i++ ) {
                curRow = grid.getRowDataAt(i);
                if( curRow.rowType == 'Group' ) {
                    var tmpValue = curRow.groupValue;
                    if( !tmpValue.contains(newValue) ) {
                        break;
                    }
                }
                if( curRow.rowType == 'Detail' ) {
                    sumValue = sumValue.plus(YIUI.TypeConvertor.toDecimal(grid.getValueAt(i,column)));
                }
            }
        } else { // 如果是分组尾,从下往上循环
            for( var i = rowIndex - 1;i >= 0;i-- ) {
                curRow = grid.getRowDataAt(i);
                if( curRow.rowType == 'Group' ) {
                    var tmpValue = curRow.groupValue;
                    if( !tmpValue.contains(newValue) ) {
                        break;
                    }
                }
                if( curRow.rowType == 'Detail' ) {
                    sumValue = sumValue.plus(YIUI.TypeConvertor.toDecimal(grid.getValueAt(i,column)));
                }
            }
        }

        return sumValue;
    }

    funs.Sum = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        if( !funs.sumInGrid ) {
            funs.sumInGrid = function (form, grid, cellKey, rowIndex, colIndex, condition) {
                var sumValue = new Decimal(0),
                    rowData = grid.getRowDataAt(rowIndex),
                    value,
                    row,
                    afterDetail = false;// 相邻汇总行可能groupLevel一致

                var cxt = new View.Context(form);

                switch (rowData.rowType) {
                    case "Fix":
                    case "Total":
                        if( grid.hasRowAreaExpand ) { // 如果有行区域拓展,那么汇总指定的行
                            var loc = form.getCellLocation(cellKey);
                            for( var i = 0,length = loc.rows.length;i < length;i++ ) {
                                row = grid.getRowDataAt(loc.rows[i]);
                                cxt.updateLocation(grid.key,i,colIndex);
                                sumValue = sumValue.plus(funs.oneValue(form,cxt,condition,row,colIndex));
                            }
                        } else if ( grid.multiple ) { // 多明细,汇总指定明细
                            var metaCell,
                                rows = grid.getMetaObj().rows;
                            for( var i = 0,size = grid.getRowCount();i < size;i++ ) {
                                row = grid.getRowDataAt(i);
                                if( row.rowType === 'Detail' && row.bkmkRow ) {
                                    metaCell = rows[row.metaRowIndex].cells[colIndex];
                                    if( metaCell.key === cellKey ) {
                                        cxt.updateLocation(grid.key, i, colIndex);
                                        sumValue = sumValue.add(funs.oneValue(form, cxt, condition, row, colIndex));
                                    }
                                }
                            }
                        } else { // 常规表格汇总
                            for (var i = 0, length = grid.getRowCount(); i < length; i++) {
                                row = grid.getRowDataAt(i);
                                if ( row.rowType === 'Detail' && row.bkmkRow ) {
                                    cxt.updateLocation(grid.key,i,colIndex);
                                    sumValue = sumValue.plus(funs.oneValue(form,cxt,condition,row,colIndex));
                                }
                            }
                        }
                        break;
                    case "Group":
                        if (rowData.isGroupHead) {
                            var len = grid.getRowCount();
                            for (var p = rowIndex + 1; p < len; p++) {
                                row = grid.getRowDataAt(p);
                                if ( afterDetail && row.rowGroupLevel == rowData.rowGroupLevel )
                                    break;
                                if (row.rowType === 'Detail' && !YIUI.GridUtil.isEmptyRow(row)) {
                                    cxt.updateLocation(grid.key,p,colIndex);
                                    sumValue = sumValue.plus(funs.oneValue(form,cxt,condition,row,colIndex));
                                    afterDetail = true;
                                }
                            }
                        } else if (rowData.isGroupTail) {
                            for (var k = rowIndex - 1; k >= 0; k--) {
                                row = grid.getRowDataAt(k);
                                if ( afterDetail && row.rowGroupLevel == rowData.rowGroupLevel )
                                    break;
                                if (row.rowType === 'Detail' && !YIUI.GridUtil.isEmptyRow(row)) {
                                    cxt.updateLocation(grid.key,k,colIndex);
                                    sumValue = sumValue.plus(funs.oneValue(form,cxt,condition,row,colIndex));
                                    afterDetail = true;
                                }
                            }
                        }
                        break;
                }
                return sumValue;
            }
        };
        if( !funs.sumOutGrid ) {
            funs.sumOutGrid = function (form, grid, cxt, colIndex, condition) {

                var sumValue = new Decimal(0);

                if( grid.isSubDetail ) {
                    var parGrid = YIUI.SubDetailUtil.getBindingGrid(form, grid);
                    var loc = cxt.getLoc(parGrid.key);
                    if( loc.getRow() != parGrid.getFocusRowIndex() ) {
                        return sumValue;
                    }
                }

                var cxt2 = new View.Context(form),
                    row;

                for( var i = 0,size = grid.getRowCount();i < size;i++ ) {
                    row = grid.getRowDataAt(i);
                    if( row.rowType === 'Detail' && !YIUI.GridUtil.isEmptyRow(row) ) {
                        cxt2.updateLocation(grid.key,i,colIndex);
                        sumValue = sumValue.plus(funs.oneValue(form,cxt2,condition,row,colIndex));
                    }
                }
                return sumValue;
            }
        }
        if( !funs.oneValue ) {
            funs.oneValue = function (form, cxt, condition, row, colIndex) {
                var result = true;
                if( condition ) {
                    result = YIUI.TypeConvertor.toBoolean(form.eval(condition,cxt));
                }
                var value = new Decimal(0);
                if( result ) {
                    var value = row.data[colIndex][0];
                    value = YIUI.TypeConvertor.toDecimal(value);
                }
                return value;
            }
        }
        if( !funs.sumTreeGrid ) {
            funs.sumTreeGrid = function (form, grid, cellKey, rowIndex, colIndex, condition) {
                var sumValue = new Decimal(0),
                    row = grid.getRowDataAt(rowIndex),
                    cell,
                    gridRow,
                    value;
                if( row.rowType === 'Detail' ) {
                    var childRows = row.childRows,idx;
                    if( childRows ) {
                        for( var i = 0,size = childRows.length;i < size;i++ ) {
                            idx = grid.getRowIndexByID(childRows[i]);
                            gridRow = grid.getRowDataAt(idx);
                            value = gridRow.data[colIndex][0];
                            sumValue = sumValue.plus(YIUI.TypeConvertor.toDecimal(value));
                        }
                    }
                } else {
                    var cxt = new View.Context(form);
                    for( var i = 0,size = grid.getRowCount();i < size;i++ ) {
                        gridRow = grid.getRowDataAt(i);
                        if( gridRow.rowType === 'Detail' && !YIUI.GridUtil.isEmptyRow(gridRow) ) {
                            cxt.updateLocation(grid.key,i,colIndex);
                            sumValue = sumValue.plus(funs.oneValue(form,cxt,condition,gridRow,colIndex));
                        }
                    }
                }
                return sumValue;
            }
        }

        if( !funs.sumRanges ) {
            funs.sumRanges = function (form,grid,rowIndex,ranges) {
                var sumValue = new Decimal(0),
                    range;
                for( var i = 0;range = ranges[i];i++ ) {
                    var sepIndex = range.indexOf(":");
                    if( sepIndex != -1 ) {
                        var first = range.substring(0,sepIndex),
                            second = range.substring(sepIndex + 1);

                        var loc = form.getCellLocation(first);
                        var firstRow = loc.getRow();
                        var firstColumn = loc.getColumn();

                        loc = form.getCellLocation(second);
                        var secondRow = loc.getRow();
                        var secondColumn = loc.getColumn();

                        for (var i = firstRow; i <= secondRow; ++i) {
                            var row = grid.getRowDataAt(i);
                            for (var j = firstColumn; j <= secondColumn; ++j) {
                                var cell = row.data[j];
                                sumValue = sumValue.add(YIUI.TypeConvertor.toDecimal(row.data[j][0]));
                            }
                        }
                    } else {
                        var loc = form.getCellLocation(range),
                            cellData = grid.getCellDataAt(rowIndex,loc.column);
                        sumValue = sumValue.plus(YIUI.TypeConvertor.toDecimal(cellData[0]));
                    }
                }
                return sumValue;
            }
        }

        var form = cxt.form,
            cellKey = YIUI.TypeConvertor.toString(args[0]);

        var condition = "";
        if (args.length > 1) {
            condition = YIUI.TypeConvertor.toString(args[1]);
        }

        var sumValue = new Decimal(0);

        var sepIndex = cellKey.indexOf(",");
        if( sepIndex == -1 ) {
            sepIndex = cellKey.indexOf(":");
        }

        if( sepIndex > 0 ) {
            var ranges = cellKey.split(","),
                firstKey = ranges[0].split(":")[0];
            var loc = form.getCellLocation(firstKey),
                grid = form.getComponent(loc.key);
            if(grid == null) {
                throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, loc.key));
            }

            var locInfo = cxt.getLoc(grid.key);
            var rowIndex = locInfo.getRow();

            sumValue = funs.sumRanges(form, grid, rowIndex, ranges);
        } else {
            var loc = form.getCellLocation(cellKey),
                grid = form.getComponent(loc.key),
                locInfo = cxt.getLoc(loc.key);
            if(grid == null) {
                throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, loc.key));
            }

            if ( cxt.inSide ) {
                var colIndex = loc.column;
                if( colIndex == -1 ) { // 如果能取到唯一有效的列(拓展没有),则取该列,如果没有,则上下文中有列
                    colIndex = locInfo.getColumn();
                }
                if( grid.treeIndex != -1 ) {
                    sumValue = funs.sumTreeGrid(form, grid, cellKey, locInfo.getRow(), colIndex, condition);
                } else {
                    sumValue = funs.sumInGrid(form, grid, cellKey, locInfo.getRow(), colIndex, condition);
                }
            } else { // 取到唯一有效的列
                sumValue = funs.sumOutGrid(form, grid, cxt, loc.column, condition);
            }
        }
        return sumValue;
    };

    funs.UpdateView = function (name, cxt, args) {
        var idx = -1;
        if( args.length > 0 ) {
            idx = YIUI.TypeConvertor.toInt(args[0]);
        }
        updateView(cxt.form,idx);
    };

    var getInsertPos = function (grid,idx) {
        // 只有明细,往最后插
        if( !grid.hasFixRow && !grid.hasTotalRow ) {
            return idx;
        }

        // 找到明细行,根据位置插
        if( idx < 0 ) {
            for( var size = grid.getRowCount(), i = size - 1;i >= 0;--i ) {
                if( grid.getRowDataAt(i).rowType == 'Detail' ) { // 从下插的情况
                    return i == size - 1 ? -1 : i + 1;
                }
            }
        } else {
            for( var size = grid.getRowCount(),i = 0;i < size;i++ ) {
                if( grid.getRowDataAt(i).rowType == 'Detail' ) { // 从上插的情况
                    return i;
                }
            }
        }

        // 没有明细行,根据数据区域位置插
        return grid.getMetaObj().rowLayer.areaIndex;
    }

    var updateGrid = function (form, grid, idx) {
        var viewForm = YIUI.FormStack.getForm(form.pFormID);
        var doc = form.getDocument();

        var row = -1, colKey, metaCell;
        // 获取OID
        metaCell = grid.getMetaCellByColumnKey(YIUI.SystemField.OID_SYS_KEY);
        if( metaCell ) {
            colKey = metaCell.key;
        }

        if (!colKey)
            return;

        // 检查是否有该行
        var rowCount = grid.getRowCount();
        for (var i = 0; i < rowCount; i++) {
            if (grid.getValueByKey(i, colKey) == doc.oid) {
                row = i;
                break;
            }
        }

        var viewDoc = viewForm.getDocument(),
            tableKey = grid.tableKey,
            table = doc.getByKey(tableKey),
            viewTable = viewDoc.getByKey(tableKey);

        table.first();

        // 修改数据
        if ( row == -1 ) {
            //没有该行，添加

            var newIdx = getInsertPos(grid,idx);

            row = grid.insertRow(newIdx, true);
            viewTable.addRow(true);

            grid.dataModel.data[row].bkmkRow = new YIUI.DetailRowBkmk(viewTable.getBkmk());

            var colInfo,value;
            for(var i = 0,size = table.cols.length;i < size;i++){
                colInfo = table.getCol(i);

                if( !colInfo.key )
                    continue;

                value = table.getByKey(colInfo.key);
                viewTable.setByKey(colInfo.key,value == undefined ? null : value);
            }
            viewTable.setState(DataDef.R_Normal);
        } else {
            // 修改
            var bkmkRow = grid.dataModel.data[row].bkmkRow;
            viewTable.setByBkmk(bkmkRow.getBookmark());
            for(var i = 0,size = viewTable.cols.length;i < size;i++){
                colInfo = viewTable.getCol(i);

                if( !colInfo.key )
                    continue;

                value = table.getByKey(colInfo.key);
                viewTable.setByKey(colInfo.key,value == undefined ? null : value);
            }
        }

        // 修改界面
        if (form.getOperationState() == YIUI.Form_OperationState.Delete) {
            grid.deleteRow(row,true);
        } else {

            // 显示一行
            grid.getHandler().showDetailRowData(viewForm, grid, row);

            // 计算一行
            viewForm.getUIProcess().doCalcOneRow(grid, row);

            // 刷新背景色
            //grid.refreshBackColor(row);
        }

    };

    var updateListView = function (form, listView, idx) {
        var viewForm = YIUI.FormStack.getForm(form.pFormID);
        var doc = form.getDocument();

        var row = -1, colKey;

        for (var cInfo, ci = 0, len = listView.columnInfo.length; ci < len; ci++) {
            cInfo = listView.columnInfo[ci];
            if (cInfo.columnKey == YIUI.SystemField.OID_SYS_KEY) {
                colKey = cInfo.key;
                break;
            }
        }
        if (!colKey)
            return;

        var rowCount = listView.getRowCount();
        for (var i = 0; i < rowCount; i++) {
            if (listView.getValByKey(i, colKey) == doc.oid) {
                row = i;
                break;
            }
        }

        var viewDoc = viewForm.getDocument(),
            tableKey = listView.tableKey,
            table = doc.getByKey(tableKey),
            viewTable = viewDoc.getByKey(tableKey);

        table.first();

        if ( row == -1 ) {
            row = listView.insertRow(idx, false);
            viewTable.addRow(true);
            listView.data[row].bkmkRow = new YIUI.DetailRowBkmk(viewTable.getBkmk());

            var colInfo,
                value;
            for(var i = 0,size = table.cols.length;i < size;i++){
                colInfo = table.getCol(i);

                if( !colInfo.key )
                    continue;

                value = table.getByKey(colInfo.key);
                viewTable.setByKey(colInfo.key,value == undefined ? null : value);
            }
            viewTable.setState(DataDef.R_Normal);
        } else {
            var bkmkRow = listView.data[row].bkmkRow;
            viewTable.setByBkmk(bkmkRow.getBookmark());
            for(var i = 0,size = viewTable.cols.length;i < size;i++){
                colInfo = viewTable.getCol(i);

                if( !colInfo.key )
                    continue;

                value = table.getByKey(colInfo.key);
                viewTable.setByKey(colInfo.key,value == undefined ? null : value);
            }
        }

        if (form.getOperationState() == YIUI.Form_OperationState.Delete) {
            listView.deleteRow(row);
        } else {
            // 显示一行
            listView.handler.showDetailRow(viewForm, listView, row);

            // 计算一行
            viewForm.getUIProcess().doCalcOneRow(listView, row);

            // 刷新背景色
            listView.refreshBackColor(row);
        }
    };


    // idx : 插行的位置
    var updateView = function (form,idx) {
        var tag = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_VIEW);
        if (tag == YIUI.BPMConstants.WORKITEM_VIEW) {
            return;
        }
        var pFormID = form.pFormID;
        if (!pFormID) {
            return true;
        }
        var viewForm = YIUI.FormStack.getForm(pFormID);
        if (!viewForm || viewForm.type != YIUI.Form_Type.View) {
            return;
        }

        if (form.getDataObjectKey() != viewForm.getDataObjectKey()) {
            return;
        }

        var mTblKey = viewForm.mainTableKey,
            listView, grid,
            doc = form.getDocument();

        if (mTblKey) {
            listView = viewForm.getListView(mTblKey);
        } else {
            listView = viewForm.getListView(0);
        }

        if (listView) {
            updateListView(form, listView, idx);
        } else {
            if (mTblKey) {
                grid = viewForm.getGrid(mTblKey);
            } else {
                grid = viewForm.getGrid(0);
            }

            if (grid) {
                updateGrid(form, grid, idx);
            }
        }
    };

    funs.GetSelectedValue = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var controlKey = args[0];
        var colKey = null;
        if (args.length > 1) {
            colKey = args[1];
        }
        var comp = form.getComponent(controlKey);
        if(comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, controlKey));
        }
        if (comp.type == YIUI.CONTROLTYPE.DICTVIEW) {
            var value = comp.getSelectedValue(colKey);
            return value;
        }
        return null;
    };

    funs.RefreshDictView = function (name, cxt, args) {
        if(args.length < 3) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var controlKey = args[0];
        var itemKey = args[1];
        var oid = args[2];
        var optState = args[3] || YIUI.Form_OperationState.Default;
        var dictView = form.getComponent(controlKey);
        if(dictView == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, controlKey));
        }
        var itemData = {
            itemKey: itemKey,
            oid: YIUI.TypeConvertor.toLong(oid)
        };

        if (dictView.type == YIUI.CONTROLTYPE.DICTVIEW) {
            switch (optState) {
                case YIUI.Form_OperationState.New:
                    dictView.addNode(itemData);
                    break;
                case YIUI.Form_OperationState.Delete:
                    // 修改previd属性
                    dictView.removeNode(itemData.itemKey + '_' + itemData.oid);
                    break;
                default:
                    dictView.refreshNode(itemData);
            }
        }
    };


    funs.LocateDictView = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var controlKey = args[0];
        var oid = args[1];
        var dictView = form.getComponent(controlKey);
        if(dictView == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, controlKey));
        }
        var itemData = {
            itemKey: dictView.itemKey,
            oid: YIUI.TypeConvertor.toLong(oid)
        };

        var curID = itemData.itemKey + '_' + itemData.oid;
        new YIUI.DictService(form).getParentPath(dictView.itemKey, itemData).then(function(parents) {
            if(parents.length > 0) {
                dictView.isMultiExpand = true;
                dictView._expand(parents[0], curID, 1);
            }
        });
    };



    funs.IsEnable = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0];
        var comp = form.getComponent(key);
        if(comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        var enable = false;
        if (comp != null) {
            enable = comp.enable;
        }
        return enable;
    };

    // 支持ListView,Grid
    funs.GetFocusRow = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = YIUI.TypeConvertor.toString(args[0]);
        var com = form.getComponent(key);
        if (com == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        return com.getFocusRowIndex();
    };

    funs.SetFocusRow = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            key = args[0],
            rowIndex = parseInt(args[1]),
            com = form.getComponent(key);
        if(com == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        if (com.type == YIUI.CONTROLTYPE.GRID) {
            com.setFocusRowIndex(rowIndex,true);
        }
    };

    funs.GetRowIndex = function (name,cxt,args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var key = args[0];
        var locInfo = cxt.getLoc(key);
        return locInfo.getRow();
    }

    funs.SetRowIndex = function (name,cxt,args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var key = args[0],
            rowIndex = parseInt(args[1]);
        cxt.updateLocation(key,rowIndex,-1);
    }

    funs.GetRowCount = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0];
        var comp = form.getComponent(key);
        if(comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        var includeEmpty = true;
        if (args.length > 1) {
            includeEmpty = YIUI.TypeConvertor.toBoolean(args[1]);
        }
        var count = 0;
        switch (comp.type) {
            case YIUI.CONTROLTYPE.GRID:
                var grid = comp;
                if (includeEmpty) {
                    count = grid.getRowCount();
                } else {
                    var rowData;
                    for (var i = 0, len = grid.getRowCount(); i < len; i++) {
                        rowData = grid.getRowDataAt(i);
                        if (rowData.rowType === "Detail" && !YIUI.GridUtil.isEmptyRow(rowData)) {
                            count++;
                        }
                    }
                }
                break;
            case YIUI.CONTROLTYPE.LISTVIEW:
                count = comp.data.length;
                break;
        }
        return count;
    };

    funs.SetVisible = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0];
        var visible = YIUI.TypeConvertor.toBoolean(args[1]);
        var comp = form.getComponent(key);
        if(comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        comp.setVisible(visible);
        var ownerCt = comp.ownerCt;
        if (ownerCt.type == YIUI.CONTROLTYPE.FLUIDTABLELAYOUTPANEL) {
            ownerCt.reLayout();
        }
        return true;
    };
    funs.IsVisible = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0];
        var comp = form.getComponent(key);
        if(comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        var visible = comp.visible;
        return visible;
    };
    funs.SetActiveTab = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            key = args[0],
            com = form.getComponent(key);
        if(com == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }

        if( !com.visible ) {
            return;
        }

        var ownerCt = com.ownerCt;
        if( !ownerCt || ownerCt.type !== YIUI.CONTROLTYPE.TABPANEL ) {
            return;
        }

        ownerCt.setTabSel2(com);
    };
    funs.SetFocus = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            com = form.getComponent(args[0]);
        if(com == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, args[0]));
        }
        com.focus();
        return true;
    };
    funs.IsControlNull = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var key = args[0];
        var form = cxt.form;
        var com = form.getComponent(key);
        if (com != null) {
            return com.isNull();
        }
        var loc = form.getCellLocation(key);
        if( loc == null ) {
            return true;
        }
        var grid = form.getComponent(loc.key),
            locInfo = cxt.getLoc(grid.key),
            row = locInfo.getRow();
        if (row == null || row < 0) {
            row = grid.getFocusRowIndex();
        }
        if (row == -1) {
            return true;
        }
        return grid.isNullValue(grid.getValueAt(row,loc.column));
    };
    funs.SetFocusCell = function (name, cxt, args) {
        if(args.length < 3) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0];
        var rowIndex = parseInt(args[1].toString());
        var comp = form.getComponent(key);
        if(comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        if (rowIndex == undefined || rowIndex == null || rowIndex == -1) {
            rowIndex = cxt.rowIndex;
        }
        if (rowIndex == undefined || rowIndex == null || rowIndex == -1) {
            rowIndex = comp.getFocusRowIndex();
        }
        var col = YIUI.TypeConvertor.toString(args[2]);
        if ($.isNumeric(col)) {
            form.setFocusCell(key, rowIndex, parseInt(col));
        } else {
            form.setFocusCell(key, rowIndex, form.getCellLocation(col).column);
        }
    };
    funs.SetCellValue = function (name, cxt, args) {
        if(args.length < 4) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0];
        var rowIndex = parseInt(args[1].toString());
        var comp = form.getComponent(key);
        if(comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        if (rowIndex == undefined || rowIndex == null || rowIndex == -1) {
            rowIndex = cxt.getLoc(key).getRow();
        }
        if (rowIndex == undefined || rowIndex == null || rowIndex == -1) {
            rowIndex = comp.getFocusRowIndex();
        }

        var col = YIUI.TypeConvertor.toString(args[2]);

        var value = args[3];

        var fireEvent = true;
        if (args.length > 4) {
            fireEvent = YIUI.TypeConvertor.toBoolean(args[4]);
        }

        if ($.isNumeric(col)) {
            form.setCellValByIndex(key, rowIndex, parseInt(col), value, fireEvent);
        } else {
            form.setCellValByKey(key, rowIndex, col, value, fireEvent);
        }
        return true;
    };

    funs.GetCellValue = function (name, cxt, args) {
        if(args.length < 3) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0];
        var rowIndex = parseInt(args[1]);
        var comp = form.getComponent(key);
        if(comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        if (rowIndex == -1) {
            rowIndex = cxt.getLoc(key).getRow();
        }

        if ((rowIndex == undefined || rowIndex == null || rowIndex == -1)) {
            rowIndex = comp.getFocusRowIndex();
        }

        if( rowIndex == -1 ) {
            return null;
        }

        var column = args[2],
            colIndex = -1;
        if( $.isNumeric(column) ) {
            colIndex = parseInt(column);
        } else { // 按照列名称取值
            colIndex = form.getCellLocation(column).column; // 这里没有考虑自定义显示的情况，所以是原始序号

            let comp = form.getComponent(key); // 取得指定控件
            if (comp) { // 找到了
                if (comp.tagName == 'listview' && comp.user_style) { // listview控件，且已经自定义
                    // console.log('Customized listview control');
                    let col_index = comp.user_style.get_col_index_by_name(column);
                    console.log('index of columne "' + column + '"(customized listview) is ' + col_index);
                    if ($.isNumeric(col_index)) colIndex = col_index;
                }
            }
        }

        var result = form.getCellValByIndex(key,rowIndex,colIndex);

        return YIUI.ExprUtil.convertValue(result);
    };

    // 获取分组单元格的值,分组行使用
    funs.GetGroupValue = funs.GetGroupCellValue = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var cellKey = YIUI.TypeConvertor.toString(args[0]),
            location = form.getCellLocation(cellKey);

        var grid = form.getComponent(location.key);
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, location.key));
        }
        var rowIndex = cxt.getLoc(grid.key).getRow(),
            groupRow = grid.getRowDataAt(rowIndex);

        var groupValue = groupRow.groupValue;
        if( !groupValue ) {
            return null;
        }

        var index = grid.getGroupIndex(cellKey);
        if( index != -1 ) {
            return groupValue.getValue(index).getValue();
        }

        return null;
    };

    // 获取拓展单元格的拓展值
    funs.GetExpandValue = function(name,cxt,args) {
        if(args.length < 3) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var grid = form.getComponent(args[0]);
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, args[0]));
        }
        var colIndex = parseInt(args[1]),
            columnKey = args[2];

        var loc = cxt.getLoc(grid.key);

        var rowIndex = loc.getRow();

        if( colIndex == -1 ) {
            colIndex = cxt.getLoc(grid.key).getColumn();
        }

        if( colIndex == -1 ) {
            return null;
        }

        var metaRow = grid.getDetailMetaRow();
        if( !metaRow ) {
            return null;
        }

        var metaCell = metaRow.cells[colIndex];

        var crossValueMap = metaCell.crossValueMap;
        if( crossValueMap && columnKey in crossValueMap ) {
            return crossValueMap[columnKey].value;
        }
        return null;
    }

    funs.FirstValue = function (name,cxt,args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            cellKey = YIUI.TypeConvertor.toString(args[0]),
            loc = form.getCellLocation(cellKey),
            controlKey = loc.getKey(),
            locInfo = cxt.getLoc(controlKey),
            grid = form.getComponent(controlKey);
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, controlKey));
        }

        var rowIndex = locInfo.getRow(),
            row = grid.getRowDataAt(rowIndex),
            value;

        var curRow = null;
        if( row.isGroupHead ) {// 由于存在两个分组行同一个分组标识的情况,所以还是循环去取得
            for( var i = rowIndex + 1,size = grid.getRowCount();i < size;i++ ) {
                curRow = grid.getRowDataAt(i);
                if( curRow.rowType == "Detail" ) {
                    value = curRow.data[loc.column][0];
                    break;
                }
            }
        } else {
            for( var i = rowIndex - 1;i >= 0;i-- ) {
                curRow = grid.getRowDataAt(i);
                if( curRow.rowType == "Detail" ) {
                    if( i - 1 >= 0 ) {
                        var nextRow = grid.getRowDataAt(i - 1);
                        if( nextRow.rowType != "Detail" ) {
                            value = curRow.data[loc.column][0];
                            break;
                        }
                    } else {
                        value = curRow.data[loc.column][0];
                        break;
                    }
                }
            }
        }

        return YIUI.ExprUtil.convertValue(value);
    };

    funs.LastValue = function (name,cxt,args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            cellKey = YIUI.TypeConvertor.toString(args[0]),
            loc = form.getCellLocation(cellKey),
            controlKey = loc.getKey(),
            locInfo = cxt.getLoc(controlKey),
            grid = form.getComponent(controlKey);
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, controlKey));
        }

        var rowIndex = locInfo.getRow(),
            row = grid.getRowDataAt(rowIndex),
            value;

        var curRow = null;
        if( row.isGroupHead ) {// 由于存在两个分组行同一个分组标识的情况,所以还是循环去取得
            for( var i = rowIndex + 1,size = grid.getRowCount();i < size;i++ ) {
                curRow = grid.getRowDataAt(i);
                if( curRow.rowType == "Detail" ) {
                    if( i + 1 < size ) {
                        var nextRow = grid.getRowDataAt(i + 1);
                        if( nextRow.rowType != "Detail" ) {
                            value = curRow.data[loc.column][0];
                            break;
                        }
                    } else {
                        value = curRow.data[loc.column][0];
                        break;
                    }
                }
            }
        } else {
            for( var i = rowIndex - 1;i >= 0;i-- ) {
                curRow = grid.getRowDataAt(i);
                if( curRow.rowType == "Detail" ) {
                    value = curRow.data[loc.column][0];
                    break;
                }
            }
        }

        return YIUI.ExprUtil.convertValue(value);
    };
    
    // 明细行合并单元格,可以增加分组条件
    funs.SetCellMerge = function (name,cxt,args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            grid = form.getComponent(YIUI.TypeConvertor.toString(args[0]));
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, args[0]));
        }

        var cellKeys,groupKeys;

        var cellKeyDef = YIUI.TypeConvertor.toString(args[1]);
        if( !cellKeyDef ) return;

        cellKeys = cellKeyDef.split(",");

        var groupKeyDef = YIUI.TypeConvertor.toString(args[2]);
        if( groupKeyDef ) groupKeys = groupKeyDef.split(",");

        grid.mergeCell2(cellKeys,groupKeys);
    }

    // 设置表格过滤条件并过滤
    funs.SetGridFilter = function (name,cxt,args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            grid = form.getComponent(YIUI.TypeConvertor.toString(args[0])),
            filter = YIUI.TypeConvertor.toString(args[1]);
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, args[0]));
        }
        var table = form.getDocument().getByKey(grid.tableKey);

        // 解析环境
        if( !View.TblEnv ) {
            View.TblEnv = function (table) {
                this.table = table;
            }

            Lang.impl(View.TblEnv,{
                get: function (cxt, id, scope, obj) {
                    return this.table.getByKey(id);
                },
                set: function () {
                    // TODO
                }
            });
        }

        table.setFilterEval(function () {
            return YIUI.TypeConvertor.toBoolean(form.eval3(new View.TblEnv(table),filter,cxt));
        });
        table.filter();

        grid.load(false);

        table.clearFilter();
        table.filter();
    };

    funs.GetOperationState = function (name, cxt, args) {
        var form = cxt.form;
        var state = -1;
        if (form) {
            state = form.getOperationState();
        }
        return state;
    };

    funs.ApplyNewOID = function (name, cxt, args) {
        var form = cxt.form, dataObjectKey;

        if(form){
           dataObjectKey = form.getDataObjectKey(); 
        }

        var paras = {};
        paras.service = "ApplyNewOID";
        paras.dataObjectKey = dataObjectKey;

        var result = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, paras);
        var oid = result.OID;
        return oid;
    };

    funs.SetOID = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var filterMap = form.getFilterMap();
        var OID = YIUI.TypeConvertor.toInt(args[0]);
        filterMap.setOID(OID);
        return true;
    };
    funs.ResetCondition = function (name, cxt, args) {
        var form = cxt.form;

        var tableKey;
        if( args.length > 0 ) {
            tableKey = YIUI.TypeConvertor.toString(args[0]);
        }

        var compList = form.getComponentList(),
            com,
            meta;

        for (var i in compList) {
            com = compList[i];
            meta = com.getMetaObj();

            if( meta.clearable === false ) {
                com.setValue(null, true, false);
            } else if ( com.condition && com.condition.needReset !== false ) {
                if( !tableKey || tableKey === com.condition.tableKey ) {
                    com.setValue(null, true, false);
                }
            }
        }
        return true;
    };

    funs.GetGroupItems = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var groupKey = YIUI.TypeConvertor.toString(args[0]);
        var formKey = form.getFormKey();
        return new YIUI.MetaService(form).getParaGroup(groupKey, formKey);
    };

    funs.SysPara = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var group = YIUI.TypeConvertor.toString(args[0]);
        var key = YIUI.TypeConvertor.toString(args[1]);

        var paraGroup = new YIUI.MetaService(form).getParaGroup(group, form.getFormKey(), form.getProjectKey());
        for(var i = 0, len = paraGroup.length; i < len; i++){
            if(paraGroup[i].key == key){
                return paraGroup[i].value;
            }
        }
        return null;
    };

    funs.SetClose = function (name, cxt, args) {
        var form = cxt.form;
        form.showFlag = YIUI.FormShowFlag.Close;
        return true;
    };

    funs.GetFormKey = function (name, cxt, args) {
        var form = cxt.form;
        return form.getFormKey();
    };

    funs.GetRelationFormKey = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var formKey = YIUI.TypeConvertor.toString(args[0]);
        var dataObjKey = YIUI.TypeConvertor.toString(args[1]);
        var paras = {
            cmd: "GetRelationFormKey",
            service: "WebMetaService",
            dataObjKey: dataObjKey,
            formKey: formKey
        };
        return new Svr.Request(cxt.form).getSyncData(Svr.SvrMgr.ServletURL, paras);
    };

    funs.GetFormRelation = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var formKey = YIUI.TypeConvertor.toString(args[0]);
        var paras = {
            cmd: "GetRelationForm",
            service: "WebMetaService",
            formKey: formKey
        };
        return new Svr.Request(cxt.form).getSyncData(Svr.SvrMgr.ServletURL, paras);
    };

    funs.GetTag = function (name, cxt, args) {
        return cxt.tag;
    };

    funs.GetCellCaption = function (name, cxt, args) {
        if(args.length < 3) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = YIUI.TypeConvertor.toString(args[0]);
        var rowIndex = YIUI.TypeConvertor.toInt(args[1]);
        var grid = form.getComponent(key);
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }

        if( rowIndex == -1 ) {
            rowIndex = cxt.getLoc(grid.key).getRow();
        }

        if( rowIndex == null || rowIndex == -1 ) {
            rowIndex = grid.getFocusRowIndex();
        }

        if(rowIndex == -1 ) {
            return '';
        }

        var column = args[2],
            colIndex;
        if ($.isNumeric(column)) {
            colIndex = parseInt(column);
        } else {
            colIndex = form.getCellLocation(column).column;
        }
        var cellData = grid.getCellDataAt(rowIndex,colIndex);
        return cellData[1];
    };

    funs.GetFocusColumn = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var gridKey = YIUI.TypeConvertor.toString(args[0]);
        var grid = form.getComponent(gridKey);
        if (grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, gridKey));
        }
        return grid.getFocusColIndex();
    };

    var sDateDiff = 0;
    funs.ServerDate = function (name, cxt, args) {
        var form = cxt.form;
        var time = (new Date()).getTime();
        if(sDateDiff > 0) {
            time += sDateDiff;
        } else {
            var paras = {};
            paras.service = "DateService";
            paras.cmd = "ServerDate";
            var result = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, paras);
            sDateDiff = result - time;
            time = result;
        }
        return new Date(time);
    };

    var sDBDateDiff = 0;
    funs.ServerDBDate = function (name, cxt, args) {
        var form = cxt.form;
        var time = (new Date()).getTime();
        if(sDBDateDiff > 0) {
            time += sDBDateDiff;
        } else {
            var paras = {};
            paras.service = "DateService";
            paras.cmd = "ServerDBDate";
            var result = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, paras);
            sDBDateDiff = result - time;
            time = result;
        }
        return new Date(time);
    };

    funs.LocalDate = function (name, cxt, args) {
        return new Date();
    };

    funs.GetLocale = function (name, cxt, args) {
        return $.cookie("locale");
    };

    funs.GetStatus = function (name, cxt, args) {
        var form = cxt.form, doc = form.getDocument(), mtKey = form.mainTableKey, mtTable = doc.getByKey(mtKey);
        var status = null;
        if (mtTable && mtTable.getRowCount() > 0) {
            mtTable.first();
            status = mtTable.getByKey("Status");
        }
        return status;
    };

    funs.ReloadEntry = function () {
        return YIUI.MenuTree.reload("");
    };

    funs.CloseAll = function () {
        return YIUI.MainContainer.closeAll();
    };

    funs.RefreshStatusInfo = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = YIUI.TypeConvertor.toString(args[0]);
        YIUI.AppDef.refreshStatusInfo(key);
        return true;
    };

    funs.UpdateStatusInfo = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = YIUI.TypeConvertor.toString(args[0]);
        var text = YIUI.TypeConvertor.toString(args[1]);
        YIUI.AppDef.updateStatusInfo(key, text);
        return true;
    };

    funs.ConvertStatus = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var status = args[0];
        var refresh = true;
        if (args.length > 1) {
            refresh = YIUI.TypeConvertor.toBoolean(args[1]);
        }

        var isKey = !$.isNumeric(status);
        var dataObjKey = form.getDataObject().key;
        var document = form.getDocument();
        var docJson = YIUI.DataUtil.toJSONDoc(document);
        var params = {
            service: "ConvertStatus",
            dataObjectKey: dataObjKey,
            document: $.toJSON(docJson),
            isKey: isKey,
            status: status
        };
        var newDoc = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, params)
        form.setDocument(newDoc);
        if (refresh) {
            form.showDocument();
        }
        return newDoc;
    };

    funs.SetPara = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form, key = args[0], value = args[1];
        form.setPara(key, value);
    };

    funs.PushPara = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form, key = YIUI.TypeConvertor.toString(args[0]), value = args[1];
        form.setCallPara(key, value);
    };

    funs.GetPara = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form, key = args[0];
        return form.getPara(key);
    };

    funs.Para = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form, key = args[0];
        return form.getPara(key);
    };

    funs.GetParentOID = function (name, cxt, args) {
        var form = cxt.form, ptForm = YIUI.FormStack.getForm(form.pFormID);
        if (ptForm) {
            return ptForm.getOID();
        }
        return -1;
    };

    funs.ReMigrate = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var dataObjectKey = args[0], form = cxt.form;
        new YIUI.RemoteService(form).reMigrate(dataObjectKey);
        return true;
    };

    funs.RollData = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form, objectKey = args[0], endPeriod = "";
        if (args.length > 1) {
            endPeriod = args[1];
        }

        var tsParas = args[2], group;
        if (tsParas) {
            tsParas = splitPara(tsParas);
            var map = {};
            for (var key in tsParas) {
                var value = form.eval(tsParas[key], cxt);
                map[key] = value;
            }
            group = YIUI.YesJSONUtil.toJSONObject(map);
        }

        var paras = {};
        paras.service = "Migration";
        paras.cmd = "RollData";
        paras.dataObjectKey = objectKey;
        paras.endPeriod = endPeriod;
        paras.group = $.toJSON(group);

        var sEndPeriod=null;
        if(endPeriod instanceof Date){
            paras.endPeriod = endPeriod.Format("yyyy-MM-dd");
        }

        new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, paras);
    };

    funs.IsEmptyRow = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            key = args[0],
            rowIndex = parseInt(args[1].toString() || 0),
            com = form.getComponent(key);
        if(com == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        if (com.type == YIUI.CONTROLTYPE.GRID) {
            if (rowIndex == -1) {
                rowIndex = com.getFocusRowIndex();
            }
            var gr = com.getRowDataAt(rowIndex);
            return YIUI.GridUtil.isEmptyRow(gr);
        }
        return false;
    };

    funs.CheckDuplicate = function (name, cxt, args) {
        var form = cxt.form;
        if (args.length > 0) {
            var cellKey = args[0],
                cl = form.getCellLocation(cellKey),
                grid = form.getComponent(cl.key);

            if (grid == null) {
                throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, cl.key));
            }

            var containsValue = function (datas,data) {
                if( datas.length == 0 )
                    return false;

                var equals = function (dataA,dataB) {
                    for( var i = 0,o1,o2,length = dataA.length;i < length;i++ ) {
                        if( !grid.checkEquals(dataA[i],dataB[i]) )
                            return false;
                    }
                    return true;
                }

                for( var i = 0,length = datas.length;i < length;i++ ) {
                    if( equals(datas[i],data) )
                        return true;
                }
                return false;
            }

            var datas = [], values;
            for (var i = 0,row;row = grid.getRowDataAt(i);i++) {

                values = [];

                if (row.isDetail && !YIUI.GridUtil.isEmptyRow(row)) {
                    for (var j = 0,key;key = args[j];j++) {
                        values.push(grid.getValueByKey(i,key));
                    }

                    if( containsValue(datas,values) )
                        return true;

                    datas.push(values);
                }
            }
        }
        return false;
    };

    // 插在最后一行,行号写GetRowCount()
    funs.InsertRow = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var com = form.getComponent(args[0]);
        if(com == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, args[0]));
        }

        var rowIndex = -1;
        if ( args.length > 1 ) {
            rowIndex = parseInt(args[1].toString(), 10);
        }
        if( com.type == YIUI.CONTROLTYPE.GRID ) {
            if( rowIndex == -1 ) {
                rowIndex = com.getFocusRowIndex();
            }
            rowIndex = com.insertRow(rowIndex,true);
        }
        return rowIndex;
    };

    funs.DeleteRow = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form, rowIndex = -1;
        var com = form.getComponent(args[0]);
        if(com == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, args[0]));
        }
        if ( args.length > 1 ) {
            rowIndex = parseInt(args[1].toString(), 10);
        }
        switch (com.type) {
            case YIUI.CONTROLTYPE.LISTVIEW:
                // TODO
                break;
            case YIUI.CONTROLTYPE.GRID:
                return com.deleteRow(rowIndex, true);
        }
        return true;
    };

    funs.CopyGridRow = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form, gridKey = args[0],
            rowIndex = parseInt(args[1].toString());

        var grid = form.getComponent(gridKey);
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, gridKey));
        }
        var rowIndex = rowIndex == -1 ? grid.getFocusRowIndex() : rowIndex;

        if (rowIndex == -1) {
            return -1;
        }

        var row = grid.getRowDataAt(rowIndex);
        if( row.rowType !== 'Detail' || !row.bkmkRow ) {
            return -1;
        }

        var excludeKeys = [];
        if (args.length > 2) {
            excludeKeys = args[2].split(",");
        }

        var newIndex = grid.insertRow(rowIndex + 1,true); // 插行

        var detailRow = grid.getDetailMetaRow(),
            selIndex = grid.selectFieldIndex;
        for( var i = 0,size = detailRow.cells.length;i < size;i++ ) { // 先跳过选择字段
            if( i !== selIndex && excludeKeys.indexOf(detailRow.cells[i].key) == -1 ) {
                grid.setValueAt(newIndex,i,grid.getValueAt(rowIndex,i), true, true);
            }
        }
        if( selIndex != -1 ) { // 再设置选择字段
            grid.setValueAt(newIndex,selIndex,grid.getValueAt(rowIndex,selIndex), true, true);
        }
        return newIndex; // 复制成功,返回index
    };

    funs.SetNewEmptyRow = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            gridKey = YIUI.TypeConvertor.toString(args[0]),
            newValue = YIUI.TypeConvertor.toBoolean(args[1]),
            grid = form.getComponent(gridKey);
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, gridKey));
        }

        if( grid.newEmptyRow === newValue )
            return;

        grid.newEmptyRow = newValue;

        if( newValue ) {
            var state = form.operationState;
            if ( grid.enable &&
                state == YIUI.Form_OperationState.Edit || state == YIUI.Form_OperationState.New ) {
                grid.appendAutoRowAndGroup();
            }
        } else {
            grid.removeAutoRowAndGroup();
        }
        return true;
    };

    funs.SetSingleSelect = function (name,cxt,args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            gridKey = YIUI.TypeConvertor.toString(args[0]),
            newValue = YIUI.TypeConvertor.toBoolean(args[1]),
            grid = form.getComponent(gridKey);

        if( grid == null ) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, gridKey));
        }

        var sIndex = grid.selectFieldIndex;

        if( sIndex == -1 || grid.singleSelect === newValue )
            return;

        grid.setSingleSelect(newValue);

        var _row;
        for( var i = 0,size = grid.getRowCount();i < size;i++ ) {
            _row = grid.getRowDataAt(i);
            if( _row.rowType === 'Detail' && !YIUI.GridUtil.isEmptyRow(_row) ){
                grid.setValueAt(i,sIndex,false,true,true);
            }
        }
        var doc = form.getDocument(),
            table = doc.getShadow(grid.tableKey);
        if( table ) {
            table.clear();
        }

        return true;
    }

    funs.IsInBounds = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0];
        var point = args[1];
        var map = form.getComponent(key);
        if(map == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        map.IsInBounds(point);
    };

    funs.ClearMap = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0];
        var map = form.getComponent(key);
        if(map == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        map.clear();
    };

    funs.SetDriveRoute = function (name, cxt, args) {
        if(args.length < 5) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0];
        var map = form.getComponent(key);
        if(map == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        var start = args[1];
        var end = args[2];
        var waypoints = args[3];
        var path = args[4];
        map.setDriveRoute(start, end, waypoints, path);
    };

    funs.DrawMarker = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0];
        var map = form.getComponent(key);
        if(map == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        var marker = YIUI.TypeConvertor.toString(args[1]);
        map.drawMarker(marker);
    };

    funs.DrawPolyline = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0];
        var map = form.getComponent(key);
        if(map == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        var polyline = YIUI.TypeConvertor.toString(args[1]);
        map.drawPolyline(polyline);
    };

    funs.DrawPolygon = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0];
        var map = form.getComponent(key);
        if(map == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        var polygon = YIUI.TypeConvertor.toString(args[1]);
        map.drawPolygon(polygon);
    };


    funs.GetMapInfo = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0];
        var map = form.getComponent(key);
        if(map == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        var mapInfo = map.getMapInfo();
        return mapInfo;
    };

    funs.ShowMapInfo = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0];
        var map = form.getComponent(key);
        if(map == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        var mapInfo = YIUI.TypeConvertor.toString(args[1]);
        map.showMapInfo(mapInfo);
    };

    funs.GetFormCaption = function (name, cxt, args) {
        var form = cxt.form;
        return form.getCaption();
    };

    funs.GetFormAbbrCaption = function (name, cxt, args) {
        var form = cxt.form;
        return form.getAbbrCaption();
    };

    funs.StatusValue = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        //这个地方的缓存 为临时处理， 2.1中将做成异步
        if(!this.statusCache){
            this.statusCache = new LRUCache(5);
        }


        var form = cxt.form;
        var formKey = form.getFormKey();
        var statusKey = args[0];
        if (args.length > 1){
            formKey = YIUI.TypeConvertor.toString(args[1]);
        }
        var paras = {
            service: "WebMetaService",
            cmd: "GetStatusCollection",
            formKey: formKey
        };

        var statusCollection = null;
        if(this.statusCache.contains(formKey)){
            statusCollection = this.statusCache.get(formKey);
        }else{
            statusCollection = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, paras)
            this.statusCache.set(formKey, statusCollection);
        }

        if(statusCollection){
            for (var i = 0, len = statusCollection.length; i < len; i++) {
                if (statusCollection[i].key == statusKey) {
                    return statusCollection[i].value;
                }
            }
        }
        /*//var status = form.statusItems;
         if (args.length > 1) {
         var formKey = YIUI.TypeConvertor.toString(args[1]);
         var paras = {
         service: "PureStatus",
         cmd: "GetStatusItems",
         formKey: formKey
         };
         status = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
         }
         if(status){
         for (var i = 0, len = status.length; i < len; i++) {
         if (status[i].key == statusKey) {
         return status[i].value;
         }
         }
         }*/
        return null;
    };

    funs.GetStatusItems = function (name, cxt, args) {
        //这个地方的缓存 为临时处理， 2.1中将做成异步
        if(!this.statusCache){
            this.statusCache = new LRUCache(5);
        }

        var form = cxt.form;
        var result = form.statusItems;
        var formKey = "";
        if (args.length > 0) {
            formKey = args[0];
        } else {
            formKey = form.formKey;
        }
        var paras = {
            service: "WebMetaService",
            cmd: "GetStatusCollection",
            formKey: formKey
        };

        if(!this.statusCache){
            this.statusCache = new LRUCache(5);
        }

        var statusItems = null;
        if(this.statusCache.contains(formKey)) {
            statusItems = this.statusCache.get(formKey);
        } else {
            statusItems = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, paras)
            this.statusCache.set(formKey, statusItems);
        }
        return statusItems;
    };

    funs.SetResult = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var result = args[0];
        form.setResult(result);
        return true;
    };

    funs.GetResult = function (name, cxt, args) {
        var form = cxt.form;
        var result = form.getResult();
        return result;
    };

    funs.GetCaption = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var key = args[0];
        var form = cxt.form;
        var comp = form.getComponent(key);
        if(comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        var caption = comp.getShowText();
        return caption;
    };

    funs.SetCaption = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var comp = form.getComponent(args[0]),
            caption = args[1];
        if(comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, args[0]));
        }
        comp.setCaption(caption);

        return true;
    };

    funs.SetFormCaption = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
            caption = args[0];

        form.setFormCaption(caption);

        return true;
    };
    
    
    funs.ReplaceTable = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var document = form.getDocument(),
            key = args[0],
            newTable = args[1];

        var table = document.getByKey(key),
            info,
            newInfo,
            columnKey;

        table.clear();

        newTable.beforeFirst();
        while (newTable.next()) {
            table.addRow(true);
            table.setState(newTable.getState());
            for (var i = 0, len = newTable.cols.length; i < len; i++) {
                newInfo = newTable.getCol(i);
                columnKey = newInfo.key;
                info = table.getColByKey(columnKey);
                if( info ) {
                    table.setByKey(columnKey, YIUI.TypeConvertor.toDataType(info.type,newTable.getByKey(columnKey)));
                }
            }
        }
        return true;
    };

    funs.ReloadTable = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var tableKey = args[0];
        var form = cxt.form;
        form.reloadTable(tableKey);
    };

    funs.RefreshControl = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0];
        var comp = form.getComponent(key);
        if(comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        var type = comp.type;
        switch (type) {
            case YIUI.CONTROLTYPE.GRID:
                comp.load(true);
                break;
            case YIUI.CONTROLTYPE.LISTVIEW:
                comp.repaint();
                break;
            default:
                var tableKey = comp.tableKey;
                var table = form.getDocument().getByKey(tableKey);
                if (table != null) {
                    var value = YIUI.UIUtil.getCompValue(comp, table);
                    comp.setValue(value, false, false);
                }
                break;
        }
        return true;
    };

    funs.GetOperator = function (name, cxt, args) {
        return $.cookie("userID");
    };

    funs.DBUpdate = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var SQL = args[0];
        var values = [];
        for (var i = 1, len = args.length; i < len; i++) {
            values.push(args[i]);
        }

        var paras = YIUI.YesJSONUtil.toJSONArray(values);

        var params = {
            service: "DBUpdate",
            cmd: "DBUpdate",
            sql: SQL,
            paras: $.toJSON(paras)
        };
        var result = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, params);
        return result;
    };

    funs.DBNamedUpdate = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var SQLName = YIUI.TypeConvertor.toString(args[0]);
        var values = [];
        for (var i = 1, len = args.length; i < len; i++) {
            values.push(args[i]);
        }

        var paras = YIUI.YesJSONUtil.toJSONArray(values);

        var params = {
            service: "DBUpdate",
            cmd: "DBNamedUpdate",
            formKey: form.getFormKey(),
            sql: SQLName,
            paras: $.toJSON(paras)
        };
        var result = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, params);
        return result;
    };

    funs.DBQuery = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var SQL = args[0];
        var values = [];
        for (var i = 1; i < args.length; i++) {
            values.push(args[i]);
        }
        var paras = YIUI.YesJSONUtil.toJSONArray(values);

        var params = {
            service: "DBQuery",
            cmd: "DBQuery",
            sql: SQL,
            paras: $.toJSON(paras)
        };
        var dataTable = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, params);

        if (dataTable) {
            dataTable.first();
        }
        return dataTable;

    };

    funs.DBNamedQuery = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var sqlName = args[0];
        var values = [];
        for (var i = 1, len = args.length; i < len; i++) {
            values.push(args[i]);
        }

        var paras = YIUI.YesJSONUtil.toJSONArray(values);

        var params = {
            service: "DBQuery",
            cmd: "DBNamedQuery",
            sql: sqlName,
            formKey: form.getFormKey(),
            paras: $.toJSON(paras)
        };
        var dataTable = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, params);

        if (dataTable) {
            dataTable.first();
        }
        return dataTable;
    };

    funs.DBQueryValue = function (name, cxt, args) {

        var table = funs.DBQuery(name, cxt, args);
        var obj = null;
        if (table.first()) {
            obj = table.get(0);
        }
        return obj;
    };

    funs.DBNamedQueryValue = function (name, cxt, args) {
        var table = funs.DBNamedQuery(name, cxt, args);
        var obj = null;
        if (table.first()) {
            obj = table.get(0);
        }
        return obj;
    };

    funs.SetColumnCaption = function (name, cxt, args) {
        if(args.length < 3) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form, key = args[0],
            columnKey = args[1], caption = args[2],
            comp = form.getComponent(key);
        if(comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        if (comp.type == YIUI.CONTROLTYPE.GRID || comp.type == YIUI.CONTROLTYPE.LISTVIEW) {
            comp.setColumnCaption(columnKey, caption);
        }
    };

    funs.SetColumnVisible = function (name, cxt, args) {
        if(args.length < 3) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form, key = args[0],
            columnKey = args[1], visible = args[2],
            com = form.getComponent(key);
        if(com == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        switch (com.type) {
            case YIUI.CONTROLTYPE.GRID:
                var loc = form.getCellLocation(columnKey);
                com.setColumnVisible(loc.column, visible, true);
                break;
            case YIUI.CONTROLTYPE.LISTVIEW:
                com.setColumnVisible(columnKey, visible, true);
                break;
        }
    };

    funs.IsLeafRow = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            key = args[0].toString()
            grid = form.getComponent(key);
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        var rowIndex = -1;
        if( args.length > 1 ) {
            rowIndex = parseInt(args[1]);
        }
        if( rowIndex == -1 ) {
            rowIndex = cxt.getLoc(grid.key).getRow();
        }
        var rowData = grid.getRowDataAt(rowIndex);
        return !rowData.childRows || rowData.childRows.length == 0;
    };

    funs.LoadSubDetailData = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            doc = form.getDocument();

        var parent = form.getParentForm(),
            parentDoc = parent.getDocument();

        var parentKey = YIUI.TypeConvertor.toString(args[0]),
            grid = parent.getComponent(parentKey);
        
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        var tableKey = grid.tableKey;

        var rowIndex = grid.getFocusRowIndex();
        if( rowIndex == -1 ) {
            return false;
        }

        var row = grid.getRowDataAt(rowIndex),
            bkmkRow = row.bkmkRow;
        if( !bkmkRow ) {
            return false;
        }

        var tables = parentDoc.getByParentKey(tableKey),pTable,table,columnKey;
        for( var i = 0,size = tables.length;i < size;i++ ) {
            table = doc.getByKey(tables[i].key);
            YIUI.SubDetailUtil.filterByParent(parent,grid,table.key);
            pTable = parentDoc.getByKey(table.key);
            pTable.beforeFirst();
            while( pTable.next() ) {
                table.addRow();
                for( var k = 0,length = pTable.getColumnCount();k < length;k++ ) {
                    columnKey = pTable.getCol(k).key;
                    if( table.indexByKey(columnKey) != -1 ) {
                        table.setByKey(columnKey,pTable.getByKey(columnKey));
                    }
                }
                table.setParentBkmk(pTable.getBkmk());
            }
            // 设置为NORMAL状态
            table.batchUpdate();
            // 清除过滤条件
            pTable.clearFilter();
        }
        return true;
    };

    funs.SaveSubDetailData = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            doc = form.getDocument();

        var parent = form.getParentForm(),
            parentDoc = parent.getDocument();

        var parentKey = YIUI.TypeConvertor.toString(args[0]),
            grid = parent.getComponent(parentKey);
            
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        var tableKey = grid.tableKey;

        var rowIndex = grid.getFocusRowIndex();
        if( rowIndex == -1 ) {
            return false;
        }

        var row = grid.getRowDataAt(rowIndex),
            bkmkRow = row.bkmkRow;
        if( !bkmkRow ) {
            return false;
        }

        var pTable = parentDoc.getByKey(tableKey);
        var bookmark = pTable.getBkmk();

        var tables = parentDoc.getByParentKey(tableKey),pTable,table,columnKey;
        for( var i = 0,size = tables.length;i < size;i++ ) {
            table = doc.getByKey(tables[i].key);
            pTable = parentDoc.getByKey(table.key);

            table.setShowDelete(true);

            table.beforeFirst();
            while( table.next() ) {
                switch ( table.getState() ) {
                    case DataDef.R_New:
                        pTable.addRow();
                        for( var i = 0,size = table.getColumnCount();i < size;i++ ) {
                            columnKey = table.getCol(i).key;
                            if( pTable.indexByKey(columnKey) != -1 ) {
                                pTable.setByKey(columnKey,table.getByKey(columnKey));
                            }
                        }
                        pTable.setParentBkmk(bookmark);
                        break;
                    case DataDef.R_Modified:
                        pTable.setByBkmk(table.getParentBkmk());
                        for( var i = 0,size = table.getColumnCount();i < size;i++ ) {
                            columnKey = table.getCol(i).key;
                            if( pTable.indexByKey(columnKey) != -1 ) {
                                pTable.setByKey(columnKey,table.getByKey(columnKey));
                            }
                        }
                        break;
                    case DataDef.R_Deleted:
                        pTable.setByBkmk(table.getParentBkmk());
                        pTable.delRow();
                        break;
                }
            }
        }
        return true;
    };

    funs.ReloadGrid = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form, doc = form.getDocument(), gridKey = YIUI.TypeConvertor.toString(args[0]), sourceKey = "", state = 0;
        if (doc == null) return;
        if (args.length > 3) {
            if ("new" == YIUI.TypeConvertor.toString(args[3]).toLowerCase()) {
                state = 1;
            }
        }
        var grid = form.getComponent(gridKey);
        if (grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, gridKey));
        }

        var tableKey = grid.getMetaObj().tableKey;
        if( !grid.tableKey )
            return;

        // 表的查询条件
        var filterMap = form.getFilterMap();

        var type = filterMap.getType();

        filterMap.setType(YIUI.DocumentType.DETAIL);
        var filterDetail = filterMap.getTblFilter(tableKey);

        var construct = false;
        if( args.length > 1 ) {
            construct = YIUI.TypeConvertor.toBoolean(args[1]);
        }

        if (args.length > 2) {
            sourceKey = YIUI.TypeConvertor.toString(args[2]);
            filterDetail.setSourceKey(sourceKey);
        }

        new YIUI.DocService(form).loadFormData(form, form.getFilterMap().OID, form.getFilterMap(), form.getCondParas())
            .then(function(doc){

                var table = doc.getByKey(tableKey);
                form.getDocument().remove(tableKey);
                form.getDocument().add(tableKey, table);

                var totalRowCount = YIUI.TotalRowCountUtil.getRowCount(doc, tableKey);
                YIUI.TotalRowCountUtil.setRowCount(form.getDocument(), tableKey, totalRowCount);

                filterMap.setType(type);

                grid.load(construct);
            });
    };

    funs.SetForeColor = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var key = YIUI.TypeConvertor.toString(args[0]);
        var color = YIUI.TypeConvertor.toString(args[1]);
        var form = cxt.form;
        var comp = form.getComponent(key);
        if(comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        comp.setForeColor(color);
    };

    funs.SetBackColor = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var key = YIUI.TypeConvertor.toString(args[0]);
        var color = YIUI.TypeConvertor.toString(args[1]);
        var form = cxt.form;
        var comp = form.getComponent(key);
        if(comp == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        comp.setBackColor(color);
    };

    funs.SetRowBackColor = function (name, cxt, args) {
        if(args.length < 3) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var key = YIUI.TypeConvertor.toString(args[0]);
        var grid = cxt.form.getComponent(key);
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }

        var rowIndex = YIUI.TypeConvertor.toInt(args[1]);

        if( rowIndex == -1 ) {
            rowIndex = cxt.getLoc(grid.key).getRow();
        }

        if( rowIndex == -1 ) {
            rowIndex = grid.getFocusRowIndex();
        }

        if( rowIndex == -1 ) {
            return;
        }

        var color = YIUI.TypeConvertor.toString(args[2]);

        grid.setRowBackColor(rowIndex, color);
    };

    funs.SetCellBackColor = function (name, cxt, args) {
        if(args.length < 4) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = YIUI.TypeConvertor.toString(args[0]);
        var rowIndex = parseInt(args[1].toString());
        var grid = form.getComponent(key);
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }

        if( rowIndex == null || rowIndex == -1 ) {
            rowIndex = cxt.getLoc(grid.key).getRow();
        }

        if( rowIndex == null || rowIndex == -1 ) {
            rowIndex = grid.getFocusRowIndex();
        }

        if( rowIndex == -1 ) {
            return;
        }

        var column = args[2],
            colIndex;
        if( $.isNumeric(column) ) {
            colIndex = parseInt(column);
            if( colIndex == -1 ) {
                colIndex = grid.getFocusColIndex();
            }
        } else {
            colIndex = form.getCellLocation(column).column;
        }

        var color = YIUI.TypeConvertor.toString(args[3]);

        grid.setCellBackColor(rowIndex, colIndex, color);

        return true;
    };

    funs.SetCellForeColor = function (name, cxt, args) {
        if(args.length < 4) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = YIUI.TypeConvertor.toString(args[0]);
        var rowIndex = parseInt(args[1].toString());
        var grid = form.getComponent(key);
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }

        if( rowIndex == null || rowIndex == -1 ) {
            rowIndex = cxt.getLoc(grid.key).getRow();
        }

        if( rowIndex == null || rowIndex == -1 ) {
            rowIndex = grid.getFocusRowIndex();
        }

        if( rowIndex == -1 ) {
            return;
        }

        var column = args[2],
            colIndex;
        if( $.isNumeric(column) ) {
            colIndex = parseInt(column);
            if( colIndex == -1 ) {
                colIndex = grid.getFocusColIndex();
            }
        } else {
            colIndex = form.getCellLocation(column).column;
        }

        var color = YIUI.TypeConvertor.toString(args[3]);

        grid.setCellForeColor(rowIndex, colIndex, color);

        return true;
    };
    funs.RefreshUIFormula = function (name, cxt, args) {
        var form = cxt.form;

        var calcAll = false;
        if (args.length > 0) {
            calcAll = YIUI.TypeConvertor.toString(args[0]);
        }

        form.setSysExpVals("calcAll",calcAll);

        cxt.form.getUIProcess().calcAll();

        form.removeSysExpVals("calcAll");

        return true;
    };
    funs.RefreshUIStatus = function (name, cxt, args) {
        cxt.form.resetUIStatus(YIUI.FormUIStatusMask.ENABLE | YIUI.FormUIStatusMask.VISIBLE | YIUI.FormUIStatusMask.OPERATION);
        return true;
    };
    funs.RefreshOperation = function (name, cxt, args) {
        cxt.form.resetUIStatus(YIUI.FormUIStatusMask.OPERATION);
        return true;
    };
    funs.GetDocument = function (name, cxt, args) {
        var form = cxt.form;
        return form.getDocument();
    };
    funs.SetDocument = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        if (args[0] instanceof DataDef.Document) {
            form.setDocument(args[0]);
            return true;
        }
        return false;
    };

    funs.EvalMidExp = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var withDoc = YIUI.TypeConvertor.toBoolean(args[0]);
        var exp = YIUI.TypeConvertor.toString(args[1]);
        var doc = null;
        if (withDoc) {
            doc = form.getDocument();
        }
        var count = args.length - 2;
        if (count < 0) {
            count = 0;
        }

        var newArgs = [];
        for (var i = 2, size = args.length; i < size; ++i) {
            newArgs.push(args[i]);
        }
        doc = YIUI.DataUtil.toJSONDoc(doc);
        var formParas = form != null ? form.getParas() : null;

        var paras = {
            service: "EvalMidExp",
            cmd: "EvalMidExp",
            exp: exp,
            document: $.toJSON(doc),
            paras: $.toJSON(newArgs),
            parameters: formParas.toJSON()
        };
        return new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, paras);

    };

    funs.Eval = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form,
            script = YIUI.TypeConvertor.toString(args[0]);
        return form.eval(script,new View.Context(form));
    };

    funs.InvokeService = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var serviceName = YIUI.TypeConvertor.toString(args[0]);
        var withDoc = false;
        if (args.length > 1) {
            withDoc = YIUI.TypeConvertor.toBoolean(args[1]);
        }
        var refresh = false;
        if (args.length > 2) {
            refresh = YIUI.TypeConvertor.toBoolean(args[2]);
        }

        var data = {
            service: "InvokeService",
            extSvrName: serviceName,
        };

        // 如果只有一个参数,需要使用{}方式传递,使用List方式传递会执行解析,如GetJsonValue,会解析出一个错误的结构
        var mapParas = null;
        if ( args.length == 4 && args[3] ) {
            mapParas = splitPara(args[3]);
        }

        var paras,cmd;
        if ($.isEmptyObject(mapParas)) {
            paras = [];
            for (var i = 3; i < args.length; i++) {
                paras.push(args[i]);
            }
            paras = YIUI.YesJSONUtil.toJSONArray(paras);
            cmd = "InvokeExtService";
        } else {
            paras = {};
            for (var key in mapParas) {
                var value = form.eval(mapParas[key], cxt);
                paras[key] = value;
            }
            paras = YIUI.YesJSONUtil.toJSONObject(paras);
            cmd = "InvokeExtService2";
        }

        data.cmd = cmd;
        data.paras = $.toJSON(paras);

        var doc = null;
        if (withDoc) {
            doc = form.getDocument();
            doc = YIUI.DataUtil.toJSONDoc(doc,true);
            data.document = $.toJSON(doc);
        }

        //返回值为document
        var result = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, data);
        if (refresh && result instanceof DataDef.Document) {
            form.setDocument(result);
            form.showDocument();
        }
        return result;
    };

    funs.InvokeUnsafeService = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var serviceName = YIUI.TypeConvertor.toString(args[0]);
        var withDoc = false;
        if (args.length > 1) {
            withDoc = YIUI.TypeConvertor.toBoolean(args[1]);
        }
        var refresh = false;
        if (args.length > 2) {
            refresh = YIUI.TypeConvertor.toBoolean(args[2]);
        }

        var data = {
            service: "InvokeUnsafeService",
            extSvrName: serviceName
        };

        // 如果只有一个参数,需要使用{}方式传递,使用List方式传递会执行解析,如GetJsonValue,会解析出一个错误的结构
        var mapParas = null;
        if ( args.length == 4 && args[3] ) {
            mapParas = splitPara(args[3]);
        }

        var paras,cmd;
        if ($.isEmptyObject(mapParas)) {
            paras = [];
            for (var i = 3; i < args.length; i++) {
                paras.push(args[i]);
            }
            paras = YIUI.YesJSONUtil.toJSONArray(paras);
            cmd = "InvokeExtService";
        } else {
            paras = {};
            for (var key in mapParas) {
                var value = form.eval(mapParas[key], cxt);
                paras[key] = value;
            }
            paras = YIUI.YesJSONUtil.toJSONObject(paras);
            cmd = "InvokeExtService2";
        }

        data.cmd = cmd;
        data.paras = $.toJSON(paras);

        var doc = null;
        if (withDoc) {
            doc = form.getDocument();
            doc = YIUI.DataUtil.toJSONDoc(doc,true);
            data.document = $.toJSON(doc);
        }

        //返回值为document
        var result = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, data);
        if (refresh && result instanceof DataDef.Document) {
            form.setDocument(result);
            form.showDocument();
        }
        return result;
    };

    funs.NewJSONObject = function (name, cxt, args) {
        var content = "";
        if (args.length > 0) {
            content = YIUI.TypeConvertor.toString(args[0]);
        }
        var obj = null;
        if (content) {
            obj = $.parseJSON(content);
        } else {
            obj = {};
        }
        return obj;
    };

    funs.NewJSONArray = function (name, cxt, args) {
        var content = "";
        if (args.length > 0) {
            content = YIUI.TypeConvertor.toString(args[0]);
        }
        var obj = null;
        if (content) {
            obj = $.parseJSON(content);
        } else {
            obj = [];
        }
        return obj;
    };

    funs.SetSessionPara = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var key = YIUI.TypeConvertor.toString(args[0]);
        var value = args[1];
        var paras = getCacheSession();
        paras[key] = value;
        SetCacheSession(paras);

        var map = {};
        map[key] = value;

        new YIUI.RemoteService().setSessionParas(map);

        return true;
    };

    funs.SessionPara = funs.GetSessionPara = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var key = YIUI.TypeConvertor.toString(args[0]);
        var paras = getCacheSession();
        return paras[key];
    };

    funs.ImportDictionary = function(name, cxt, args) {
        var form = cxt.form;
        var needResult = false;
        var isDocTypeDict = true;
        if (args.length > 0) {
            needResult = YIUI.TypeConvertor.toBoolean(args[0]);
        }

        var success = null;
        if ( needResult ) {
            success = function () {
                var options = {
                    msg: "导入成功！",
                    msgType: YIUI.Dialog_MsgType.DEFAULT
                };
                var dialog = new YIUI.Control.Dialog(options);
                dialog.render();
            };
        }
        var clearOriginalData = true;
        if (args.length > 1) {
            clearOriginalData = YIUI.TypeConvertor.toBoolean(args[1]);
        }

        var importServiceName = "";
        if (args.length > 2) {
            importServiceName = YIUI.TypeConvertor.toString(args[2])
        }

        var formKey = cxt.form.formKey;
        if (cxt.form.paras.get("FormKey")) {
            formKey = cxt.form.paras.get("FormKey");
        }

        var parameters = form != null ? form.getParas() : null;

        var options = {
            clearOriginalData: clearOriginalData,
            importServiceName: importServiceName,
            isDocTypeDict: isDocTypeDict,
            formKey: formKey,
            service: "DTS",
            cmd: "ImportExcel",
            mode: 1,
            success:success,
            parameters:parameters.toJSON()
        }

        if( window.up_target ) {
            // Jquery写法IE无法触发
            window.up_target.onchange = function () {
                // alert(this.value);
                options.file = $(this);
                YIUI.FileUtil.ajaxFileUpload(options);
            }
        } else {
            YIUI.FileUtil.uploadFile(options);
        }
    };

    funs.ImportExcel = function (name, cxt, args) {
    	var form = cxt.form;
        var needResult = false;
        if (args.length > 0) {
            needResult = YIUI.TypeConvertor.toBoolean(args[0]);
        }

        var success = null;
        if ( needResult ) {
            success = function () {
                var options = {
                    msg: "导入成功！",
                    msgType: YIUI.Dialog_MsgType.DEFAULT
                };
                var dialog = new YIUI.Control.Dialog(options);
                dialog.render();
            };
        }
        var clearOriginalData = true;
        if (args.length > 1) {
            clearOriginalData = YIUI.TypeConvertor.toBoolean(args[1]);
        }

        var importServiceName = "";
        if (args.length > 2) {
            importServiceName = YIUI.TypeConvertor.toString(args[2])
        }

        var formKey = cxt.form.formKey;
        if (cxt.form.paras.get("FormKey")) {
            formKey = cxt.form.paras.get("FormKey");
        }
        
        var parameters = form != null ? form.getParas() : null;

        var options = {
            clearOriginalData: clearOriginalData,
            importServiceName: importServiceName,
            formKey: formKey,
            service: "DTS",
            cmd: "ImportExcel",
            mode: 1,
            success:success,
            parameters:parameters.toJSON()
        }

        if( window.up_target ) {
            // Jquery写法IE无法触发
            window.up_target.onchange = function () {
                // alert(this.value);
                options.file = $(this);
                YIUI.FileUtil.ajaxFileUpload(options);
            }
        } else {
            YIUI.FileUtil.uploadFile(options);
        }
    };

    funs.SingleImportExcel = function (name, cxt, args) { 
        var clearOriginalData = false;
        var postServiceName = "";
        var importServiceName = "";
        var postFormula = "";
        var async = false;

        if (args.length > 0) {
            clearOriginalData = YIUI.TypeConvertor.toBoolean(args[0]);
        }

        if (args.length > 1) {
            postServiceName = YIUI.TypeConvertor.toString(args[1]);
        }

        if (args.length > 2) {
            importServiceName = YIUI.TypeConvertor.toString(args[2]);
        }

        if (args.length > 3) {
            postFormula = YIUI.TypeConvertor.toString(args[3]);
        }

        if (args.length > 4) {
            async = YIUI.TypeConvertor.toBoolean(args[4]);
        }

        var form = cxt.form,
            document = form.getDocument(),
            doc = YIUI.DataUtil.toJSONDoc(document),
            parameters = form != null ? form.getParas() : null;

        var callback = function (data) {
            if(!data){
                return;
            }

            if (data.document) {
                var newDoc = YIUI.DataUtil.fromJSONDoc(data.document);

                form.setSysExpVals("IgnoreKeys", data.IgnoreKeys);

                form.setDocument(newDoc);
                form.showDocument();

                if (postFormula) {
                    var cxt = new View.Context(form);
                    form.eval(postFormula, cxt, null);
                }
            }
        };

        var options = {
            clearOriginalData: clearOriginalData,
            importServiceName: importServiceName,
            postImportServiceName: postServiceName,
            formKey: form.formKey,
            document: $.toJSON(doc),
            service: "DTS",
            cmd: "SingleImportExcel",
            mode: 1,
            success: callback,
            parameters:parameters.toJSON()
        };

        if( window.up_target ) {
            window.up_target.onchange = function () {
                options.file = $(this);
                YIUI.FileUtil.ajaxFileUpload(options);
            }
        } else {
            YIUI.FileUtil.uploadFile(options);
        }
    };

    funs.ExportExcel = function (name, cxt, args) {
        var form = cxt.form;
        var needDownload = true;
        var exportTables = "";
        var exportCurPage = false;
        var postExportServiceName = "";
        var exportServiceName = "";
        var exportFileName="";
        if (args.length > 0) {
            needDownload = YIUI.TypeConvertor.toBoolean(args[0]);
        }
        if (args.length > 1) {
            exportTables = YIUI.TypeConvertor.toString(args[1]);
        }

        if (args.length > 2) {
            exportCurPage = YIUI.TypeConvertor.toBoolean(args[2]);
        }

        if (args.length > 3) {
            postExportServiceName = YIUI.TypeConvertor.toString(args[3]);
        }

        if (args.length > 4) {
            exportServiceName = YIUI.TypeConvertor.toString(args[4]);
        }
        if (args.length > 5) {
            exportFileName = YIUI.TypeConvertor.toString(args[5]);
        }

        var document = form.getDocument();
        var doc = YIUI.DataUtil.toJSONDoc(document);
        var parameters = form != null ? form.getParas() : null;
        var filterMap = form.getFilterMap();
        filterMap.setType(YIUI.DocumentType.DATAOBJECT);
        var paras = {};
        paras.service = "ExportFile";
        paras.cmd = "ExportExcel";
        paras.formKey = form.formKey;
        paras.document = $.toJSON(doc);
        paras.parameters = parameters.toJSON();
        paras.exportTables = exportTables;
        paras.filterMap = $.toJSON(filterMap);
        paras.condition = $.toJSON(form.getCondParas());
        paras.onlyCurrentPage = exportCurPage;
        paras.exportServiceName = exportServiceName;
        paras.postExportServiceName = postExportServiceName;
        paras.exportFileName=exportFileName;

        var result = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, paras);
        if (needDownload) {
            var options = {
                formKey: form.formKey,
                filePath: result.filePath.replace(/\\/g, "/"),
                fileMD5: result.fileMD5,
                fileName: result.fileName,
                mode:1,
                service: 'DownloadExcel'
            };
            YIUI.FileUtil.downLoadFile(options);
        }
        return true;

    };

    funs.BatchExportExcel = function (name, cxt, args) {
        if(args.length < 3) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;

        var exportFormKey = YIUI.TypeConvertor.toString(args[0]);
        var tableKey = YIUI.TypeConvertor.toString(args[1]);
        var OIDFieldKey = YIUI.TypeConvertor.toString(args[2]);

        var templateKey = "";
        if (args.length > 3) {
            templateKey = YIUI.TypeConvertor.toString(args[3]);
        }

        var needDownload = true;
        if (args.length > 4) {
            needDownload = YIUI.TypeConvertor.toBoolean(args[4]);
        }

        var postExportServiceName = "";
        if (args.length > 5) {
            postExportServiceName = YIUI.TypeConvertor.toString(args[5]);
        }
        var exportFileName="";
        if (args.length > 6) {
            exportFileName = YIUI.TypeConvertor.toString(args[6]);
        }
        var document = form.getDocument();
        var doc = YIUI.DataUtil.toJSONDoc(document);
        var parameters = form != null ? form.getParas() : null;
        var filterMap = form.getFilterMap();
        filterMap.setType(YIUI.DocumentType.DATAOBJECT);
        var paras = {};
        paras.service = "ExportFile";
        paras.cmd = "BatchExportExcel";
        paras.parameters = parameters.toJSON();
        paras.formKey = form.formKey;
        paras.exportFormKey = exportFormKey;
        paras.tableKey = tableKey;
        paras.OIDFieldKey = OIDFieldKey;
        paras.templateKey = templateKey;
        paras.postExportServiceName = postExportServiceName;
        paras.exportFileName=exportFileName;
        paras.document = $.toJSON(doc);
        paras.filterMap = $.toJSON(filterMap);
        paras.condition = $.toJSON(form.getCondParas());

        var result = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, paras);
        if (needDownload) {
            var options = {
                formKey: form.formKey,
                filePath: result.filePath.replace(/\\/g, "/"),
                fileMD5: result.fileMD5,
                fileName: result.fileName,
                mode:1,
                service: 'DownloadExcel'
            };
            YIUI.FileUtil.downLoadFile(options);
        }
        return true;

    };

    funs.ExportDict = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var exportFormKey = YIUI.TypeConvertor.toString(args[0]);

        var templateKey = "";
        if (args.length > 1) {
            templateKey = YIUI.TypeConvertor.toString(args[1]);
        }

        var needDownload = true;
        if (args.length > 2) {
            needDownload = YIUI.TypeConvertor.toBoolean(args[2]);
        }

        var postExportServiceName = "";
        if (args.length > 3) {
            postExportServiceName = YIUI.TypeConvertor.toString(args[3]);
        }

        var exportFileName="";
        if (args.length > 4) {
            exportFileName = YIUI.TypeConvertor.toString(args[4]);
        }

        var paras = {};
        paras.service = "ExportFile";
        paras.cmd = "ExportDict";
        paras.exportFormKey = exportFormKey;
        paras.templateKey = templateKey;
        paras.postExportServiceName = postExportServiceName;
        paras.exportFileName=exportFileName;
        var result = new Svr.Request(cxt.form).getSyncData(Svr.SvrMgr.ServletURL, paras);
        if (needDownload) {
            var options = {
                formKey: exportFormKey,
                filePath:result.filePath.replace(/\\/g, "/"),
                fileMD5: result.fileMD5,
                fileName:result.fileName,
                mode:1,
                service:'DownloadExcel'
            };
            YIUI.FileUtil.downLoadFile(options);
        }
        return true;
    };

    funs.ExportExcelWithTemplate = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var templateKey = YIUI.TypeConvertor.toString(args[0]);
        var needDownload = true;
        var postExportServiceName = "";
        var exportFileName="";
        if (args.length > 1) {
            needDownload = YIUI.TypeConvertor.toBoolean(args[1]);
        }

        if (args.length > 2) {
            postExportServiceName = YIUI.TypeConvertor.toString(args[2]);
        }

        if (args.length > 3) {
            exportFileName = YIUI.TypeConvertor.toString(args[3]);
        }
        var document = form.getDocument();
        var doc = YIUI.DataUtil.toJSONDoc(document);
        var parameters = form != null ? form.getParas() : null;
        var filterMap = form.getFilterMap();
        filterMap.setType(YIUI.DocumentType.DATAOBJECT);
        if (needDownload) {
            var options = {
                formKey: form.formKey,
                document: $.toJSON(doc),
                parameters: parameters.toJSON(),
            	templateKey :templateKey,
            	filterMap: $.toJSON(filterMap),
            	condition: $.toJSON(form.getCondParas()),
            	postExportServiceName: postExportServiceName,
            	exportFileName: exportFileName,
                mode:1,
                service:'ExportFile',
                cmd:'ExportExcelWithTemplate'
            };
            YIUI.FileUtil.downLoadFile(options);
        }
        return true;
    };

    funs.ExportCSV = function (name, cxt, args) {
        var form = cxt.form;
        var needDownload = true;
        var exportTables = "";
        var exportCurPage="";
        var postExportServiceName="";
        var exportFileName="";
        if (args.length > 0) {
            needDownload = YIUI.TypeConvertor.toBoolean(args[0]);
        }

        if (args.length > 1) {
            exportTables = YIUI.TypeConvertor.toString(args[1]);
        }

        if (args.length > 2) {
            exportCurPage = YIUI.TypeConvertor.toString(args[2]);
        }

        if (args.length > 3) {
            postExportServiceName = YIUI.TypeConvertor.toString(args[3]);
        }

        if (args.length > 4) {
            exportFileName = YIUI.TypeConvertor.toString(args[4]);
        }
        var document = form.getDocument();
        var doc = YIUI.DataUtil.toJSONDoc(document);
        var parameters = form != null ? form.getParas() : null;
        var filterMap = form.getFilterMap();
        filterMap.setType(YIUI.DocumentType.DATAOBJECT);
        var paras = {};
        paras.service = "ExportFile";
        paras.cmd = "ExportCSV";
        paras.formKey = form.formKey;
        paras.document = $.toJSON(doc);
        paras.parameters = parameters.toJSON();
        paras.exportTables = exportTables;
        paras.exportCurPage=exportCurPage;
        paras.postExportServiceName=postExportServiceName;
        paras.exportFileName=exportFileName;
        paras.filterMap = $.toJSON(filterMap);
        paras.condition = $.toJSON(form.getCondParas());
        var result = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, paras);
        if (needDownload) {
            var options = {
                formKey: form.formKey,
                filePath: result.filePath.replace(/\\/g, "/"),
                fileMD5: result.fileMD5,
                fileName: result.fileName,
                mode:1,
                service:'DownloadExcel'
            };
            YIUI.FileUtil.downLoadFile(options);
        }

        return true;
    };
    
    funs.ImportData = function (name, cxt, args) { 
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var importServiceName = YIUI.TypeConvertor.toString(args[0]);
        var form = cxt.form,
            document = form.getDocument(),
            doc = YIUI.DataUtil.toJSONDoc(document),
            parameters = form != null ? form.getParas() : null;

        var callback = function (doc) {
            if (doc) {
                var newDoc = YIUI.DataUtil.fromJSONDoc(doc);
                form.setDocument(newDoc);
                form.showDocument();
            }
        };

        var options = {
            importServiceName: importServiceName,
            formKey: form.formKey,
            document: $.toJSON(doc),
            service: "DTS",
            cmd: "ImportData",
            mode: 1,
            success: callback,
            parameters:parameters.toJSON()
        };

        if( window.up_target ) {
            window.up_target.onchange = function () {
                options.file = $(this);
                YIUI.FileUtil.ajaxFileUpload(options);
            }
        } else {
            YIUI.FileUtil.uploadFile(options);
        }
    };

    funs.Print = function (name, cxt, args) {
        var form = cxt.form;

        var reportKey = "";
        if (args.length > 0) {
            reportKey = YIUI.TypeConvertor.toString(args[0]);
        }

        var fillEmptyPrint = false;
        if (args.length > 1) {
            fillEmptyPrint = YIUI.TypeConvertor.toBoolean(args[1]);
        }

        var doc = form.getDocument();
        var jsonDoc = YIUI.DataUtil.toJSONDoc(doc);

        new YIUI.PrintService().print(form, reportKey, fillEmptyPrint, jsonDoc);
    };

    funs.PrintEx = function(name, cxt, args) {
        if(args.length < 3) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;

        var objectKey = YIUI.TypeConvertor.toString(args[0]);
        var OID = YIUI.TypeConvertor.toString(args[1]);

        var reportKey = YIUI.TypeConvertor.toString(args[2]);

        var fillEmptyPrint = false;
        if (args.length > 3) {
            fillEmptyPrint = YIUI.TypeConvertor.toBoolean(args[3]);
        }

        form.refreshParas();
        var parameters = form.getParas();

        var fm = new FilterMap();
        fm.setOID(OID);

        new YIUI.DocService(form).loadData(objectKey, OID, fm, null, parameters).then(function (doc) {
            var jsonDoc = YIUI.DataUtil.toJSONDoc(doc);
            new YIUI.PrintService().print(form, reportKey, fillEmptyPrint, jsonDoc);
        });
    };

    funs.PrintPreview = function (name, cxt, args) {
        var form = cxt.form;

        var reportKey = "";
        if (args.length > 0) {
            reportKey = YIUI.TypeConvertor.toString(args[0]);
        }

        var fillEmptyPrint = false;
        if (args.length > 1) {
            fillEmptyPrint = YIUI.TypeConvertor.toBoolean(args[1]);
        }

        var doc = form.getDocument();
        var jsonDoc = YIUI.DataUtil.toJSONDoc(doc);

        new YIUI.PrintService().printPreview(form, reportKey, fillEmptyPrint, jsonDoc);
    };

    funs.PrintPreviewEx = function (name, cxt, args) {
        if(args.length < 3) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;

        var objectKey = YIUI.TypeConvertor.toString(args[0]);
        var OID = YIUI.TypeConvertor.toString(args[1]);
        var reportKey = YIUI.TypeConvertor.toString(args[2]);

        var fillEmptyPrint = false;
        if (args.length > 3) {
            fillEmptyPrint = YIUI.TypeConvertor.toBoolean(args[3]);
        }

        form.refreshParas();
        var parameters = form.getParas();

        var fm = new FilterMap();
        fm.setOID(OID);

        new YIUI.DocService(form).loadData(objectKey,OID,fm,null,parameters).then(function (doc) {
            var jsonDoc = YIUI.DataUtil.toJSONDoc(doc);
            new YIUI.PrintService().printPreview(form, reportKey, fillEmptyPrint, jsonDoc);
        });
    };

    funs.AutoPrint = function (name, cxt, args) {
        var form = cxt.form;
        var paras = {};
        paras.service = "WebPrintService";
        paras.cmd = "AutoPrintPDF";
        paras.formKey = form.formKey;
        var fillEmptyPrint = false;
        if (args.length > 0) {
            fillEmptyPrint = YIUI.TypeConvertor.toBoolean(args[0]);
        }
        paras.fillEmptyPrint = fillEmptyPrint;
        var doc = form.getDocument();
        var jsonDoc = YIUI.DataUtil.toJSONDoc(doc);
        paras.doc = $.toJSON(jsonDoc);
        paras.parameters = form.getParas().toJSON();

        var data = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, paras);
        new YIUI.PrintPreview(data);
    };

    funs.PrintHtml = function (name, cxt, args) {
        var $el;
        var form = cxt.form;
        if (args.length > 0) {
            var selector = YIUI.TypeConvertor.toString(args[0]);
            var id = form.formID + "_" + selector;
            $el = $("#" + id);
        } else {
            $el = form.formAdapt.getRoot().el;
            form.defaultToolBar && form.defaultToolBar.el.addClass('noneedprint');
        }
        var cssPath = '';
        if (args.length > 1) {
            cssPath = YIUI.TypeConvertor.toString(args[1]);
        }
        // 第二个参数cssPath指向的文件的样式内容:
        // .ui-lv .paginationjs-content, .ui-lv .lv-head {
        //      overflow: visible;
        //}
        // .ui-lv {
        //      overflow: visible;
        // }
        $el.printArea({extraHead: '<style media="print" type="text/css"> .noneedprint {display: none} </style>', extraCss: cssPath});
    };

    funs.BatchPrint = function (name, cxt, args) {
        if(args.length < 2) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;

        var formKey = YIUI.TypeConvertor.toString(args[0]);
        var reportKey = YIUI.TypeConvertor.toString(args[1]);

        var _OIDs = null;
        if(args.length > 2) {
            _OIDs = args[2];
        }

        var OIDs = [];
        if( typeof _OIDs === 'string' && _OIDs ) {
            var array = _OIDs.split(",");
            for( var i = 0,oid; oid = array[i];i++ ) {
                OIDs.push(parseInt(oid));
            }
        } else if ( $.isArray(_OIDs) ) {
            OIDs = OIDs.concat(_OIDs);
        } else {
            OIDs = YIUI.BatchUtil.getViewSelectOIDs(form,true);
        }

        new YIUI.PrintService().batchPrint(form, formKey, reportKey, OIDs);
    };

    funs.PrintGridPreview = function (name, cxt, args) {
        if(args.length < 1) {
            throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
        }
        var form = cxt.form;
        var key = args[0].toString();
        var grid = form.getComponent(key);
        if(grid == null) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }

        var section = YIUI.PrintGridUtil.toJSONSection(form , grid);

        new YIUI.PrintService().printGridPreview(form, section);
    };

    {  //BPM函数
        funs.GetProcessKey = function (name, cxt, args) {
            var form = cxt.form, processKey = "",
                doc = form.getDocument(),
                expData = doc.getExpDataInfo("BPM").data,
                table = YIUI.DataUtil.fromJSONDataTable(expData);
            if (table && table.getRowCount() > 0) {
                table.first();
                processKey = table.getByKey("ProcessKey");
            }
            return processKey;
        };

        funs.GetProcessVer = function (name, cxt, args) {
            var form = cxt.form, processVer = -1, tempVer = -1,
                doc = form.getDocument(),
                expData = doc.getExpDataInfo("BPM").data,
                table = YIUI.DataUtil.fromJSONDataTable(expData);
            if (table && table.getRowCount() > 0) {
                table.first();
                tempVer = table.getByKey("Version");
                if (tempVer) {
                    processVer = parseInt(tempVer);
                }
            }
            return processVer;
        };

        funs.GetInstanceState = function (name, cxt, args) {
            var form = cxt.form, state = -1,
                doc = form.getDocument(),
                expData = doc.getExpDataInfo("BPM").data,
                table = YIUI.DataUtil.fromJSONDataTable(expData);
            if (table && table.getRowCount() > 0) {
                table.first();
                state = table.getByKey("State");
            }
            return state;
        };

        funs.AddDelegateData = function (name, cxt, args) {
            if(args.length < 9) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var delegateType = args[0],
                srcOperatorID = args[1],
                tgtOperatorID = args[2],
                objectType = args[3],
                objectKey = args[4],
                nodeKey = args[5],
                alwaysValid = args[7];

            var startTime = alwaysValid ? new Date(0) : args[6];
            var endTime = alwaysValid ? new Date(0) : args[8];
            
            var userInfo = "";
            if (args.length > 9) {
            	userInfo = args[9];
            }

            new YIUI.BPMService(cxt.form).addDelegateData(delegateType,
                srcOperatorID,
                tgtOperatorID,
                objectType,
                objectKey,
                nodeKey,
                startTime,
                endTime,
                alwaysValid,
                userInfo);
        };

        funs.DeleteDelegateData = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
        	var userInfo;
        	if (args.length > 1) {
				userInfo = args[1];
			}
            new YIUI.BPMService(cxt.form).deleteDelegateData(args[0],userInfo);
        };

        funs.IsTransit = function(name, cxt, args){
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var workitemID = YIUI.TypeConvertor.toLong(args[0]);
            if (workitemID == -1) {
                var fromParent = false;
                if (args.length > 1) {
                    fromParent = YIUI.TypeConvertor.toBoolean(args[1]);
                }

                var form = cxt.form;
                if (fromParent) {
                    form = YIUI.FormStack.getForm(form.pFormID);
                }

                var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
                if (info == null) {
                    return false;
                }
                workitemID = info.WorkitemID;
            }
            return new YIUI.BPMService(cxt.form).isTransit(workitemID);
        };

        funs.GetActiveWorkitemID = function (name, cxt, args) {
            var info = getActiveWorkitem(cxt, args);
            var WID = -1;
            if(info){
                WID = info.WorkitemID;
            }
            return WID;
        };

        funs.GetActiveNodeID = function (name, cxt, args) {
            var nodeID = -1;
            var info = getActiveWorkitem(cxt, args);
            if (info) {
                nodeID= info.NodeID;
            }
            return nodeID;
        };

        funs.GetActiveInstanceID = function (name, cxt, args) {
            var info = getActiveWorkitem(cxt, args);
            var instanceID = -1;
            if (info) {
                instanceID = info.InstanceID;
            }
            return instanceID;
        };

        var getActiveWorkitem = function (cxt, args) {
            var fromParent = false;
            if (args.length > 0) {
                fromParent = YIUI.TypeConvertor.toBoolean(args[0]);
            }
            var form = cxt.form;
            if (fromParent) {
                form = YIUI.FormStack.getForm(form.pFormID);
            }
            return form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
        };

        funs.GetActiveWorkitemFormKey = function (name, cxt, args) {
            var info = getActiveWorkitem(cxt, args);
            var formKey = "";
            if (info) {
                formKey = info.FormKey;
            }
            return formKey;
        };

        funs.RestartInstanceByOID = function (name, cxt, args) {
            var oid = null, form = cxt.form;
            if (args.length > 0) {
                oid = YIUI.TypeConvertor.toLong(args[0]);
                new YIUI.BPMService(form).restartInstanceByOID(oid);
            } else {
                var form = cxt.form;

                new YIUI.BPMService(form).restartInstanceByOID(form.getOID())
                    .then(function(data){
                        form.setSysExpVals(YIUI.BPMConstants.WORKITEM_INFO, null);

                        var b = form.getDocument().getExpData(YIUI.BPMKeys.WORKITEM_INFO);
                        if (b != null) {
                            form.getDocument().putExpData(YIUI.BPMKeys.WORKITEM_INFO, null);
                        }

                        viewReload(cxt.form);
                    });

            }
        };

        funs.IsInstanceStarted = function (name, cxt, args) {
            var oid = null;
            if (args.length > 0) {
                oid = YIUI.TypeConvertor.toInt(args[0]);
            } else {
                oid = cxt.form.getOID();
            }

            var json = new YIUI.BPMService(cxt.form).isInstanceStarted(oid);
            var started = YIUI.TypeConvertor.toBoolean(json.result);
            return started;
        };

        funs.EndInstance = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var instanceID = YIUI.TypeConvertor.toLong(args[0]);
            var userInfo = "";
            if(args.length > 2) {
                userInfo = YIUI.TypeConvertor.toString(args[2]);
            }

            if (instanceID == -1) {
                var fromParent = false;
                if (args.length > 1) {
                    fromParent = YIUI.TypeConvertor.toBoolean(args[1]);
                }

                var form = cxt.form;
                if (fromParent) {
                    form = YIUI.FormStack.getForm(form.pFormID);
                }

                var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
                instanceID = info.InstanceID;

                new YIUI.BPMService(form).endInstance(form, instanceID, userInfo).then(function(data){
                    form.setSysExpVals(YIUI.BPMConstants.WORKITEM_INFO, null);
                    var doc = form.getDocument();
                    var b = doc.getExpData(YIUI.BPMKeys.WORKITEM_INFO);
                    if (b != null) {
                        form.getDocument().putExpData(YIUI.BPMKeys.WORKITEM_INFO, null);
                    }
                    viewReload(form);
                });
            } else {
                new YIUI.BPMService(cxt.form).endInstance(cxt.form, instanceID, userInfo);
            }

            return true;
        };

        funs.ReviveInstance = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var instanceID = YIUI.TypeConvertor.toLong(args[0]);
            var userInfo = "";
            if(args.length > 2) {
                userInfo = YIUI.TypeConvertor.toString(args[2]);
            }

            if (instanceID == -1) {
                var fromParent = false;
                if (args.length > 1) {
                    fromParent = YIUI.TypeConvertor.toBoolean(args[1]);
                }

                var form = cxt.form;
                if (fromParent) {
                    form = YIUI.FormStack.getForm(form.pFormID);
                }

                var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
                instanceID = info.InstanceID;

                new YIUI.BPMService(form).reviveInstance(form, instanceID, userInfo).then(function(data){
                    form.setSysExpVals(YIUI.BPMConstants.LOAD_WORKITEM_INFO, true);
                    viewReload(form);
                });
            } else {
                new YIUI.BPMService(cxt.form).reviveInstance(cxt.form, instanceID, userInfo);
            }

            return true;
        };

        funs.PauseInstance = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var instanceID = YIUI.TypeConvertor.toLong(args[0]);
            var userInfo = "";
            if(args.length > 2) {
                userInfo = YIUI.TypeConvertor.toString(args[2]);
            }

            if (instanceID == -1) {
                var fromParent = false;
                if (args.length > 1) {
                    fromParent = YIUI.TypeConvertor.toBoolean(args[1]);
                }

                var form = cxt.form;
                if (fromParent) {
                    form = YIUI.FormStack.getForm(form.pFormID);
                }

                var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
                instanceID = info.InstanceID;

                new YIUI.BPMService(form).pauseInstance(form, instanceID, userInfo).then(function(data){
                    viewReload(form);
                });
            } else {
                new YIUI.BPMService(cxt.form).pauseInstance(cxt.form, instanceID, userInfo).then(function(data){
                    viewReload(cxt.form);
                });
            }
            return true;
        };

        funs.Resume = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var instanceID = YIUI.TypeConvertor.toLong(args[0]);
            var userInfo = "";
            if(args.length > 2) {
                userInfo = YIUI.TypeConvertor.toString(args[2]);
            }

            if (instanceID == -1) {
                var fromParent = false;
                if (args.length > 1) {
                    fromParent = YIUI.TypeConvertor.toBoolean(args[1]);
                }

                var form = cxt.form;
                if (fromParent) {
                    form = YIUI.FormStack.getForm(form.pFormID);
                }

                var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
                instanceID = info.InstanceID;

                new YIUI.BPMService(form).resume(form, instanceID, userInfo).then(function(data){
                    viewReload(form);
                });
            } else {
                new YIUI.BPMService(cxt.form).resume(cxt.form, instanceID, userInfo).then(function(data){
                    viewReload(cxt.form);
                });
            }
            return true;
        };

        funs.DisableDelegateData = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form;
            var delegateID = YIUI.TypeConvertor.toInt(args[0]);
            new YIUI.BPMService(form).updateDelegateDataState(delegateID, false);
            return true;
        };

        funs.SetDelegateDataInUse = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form;
            var delegateID = YIUI.TypeConvertor.toInt(args[0]);
            new YIUI.BPMService(form).updateDelegateDataState(delegateID, true);
            return true;
        };

        funs.OpenWorkitem = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form;
            var WID = args[0].toString();
            var onlyOpen = false;
            var loadInfo = true;
            if (args.length > 1) {
                onlyOpen = YIUI.TypeConvertor.toBoolean(args[1]);
            }
            if (args.length > 2) {
                loadInfo = YIUI.TypeConvertor.toBoolean(args[2]);
            }

            var tsParas;
            if (args.length > 3) {
                tsParas = args[3];
            }

            if (tsParas) {
                tsParas = splitPara(tsParas);
                for (var key in tsParas) {
                    form.setCallPara(key, form.eval(tsParas[key], cxt));
                }
            }

            new YIUI.BPMService(form).loadWorkitemInfo(WID).then(function(info){
                if(!info){
                    $.error("工作项不可用");
                }
                var formKey = info.FormKey;
                var OID = info.OID;
                var container = form.getDefContainer();
                if (container == null) {
                    container = form.getContainer();
                }

                var existsAttachment = info.AttachmentType >= 0;
                if (existsAttachment) {
                    OID = info.AttachmentOID;
                    formKey = info.AttachmentPara;
                    if (info.AttachmentOperateType == YIUI.AttachmentOperateType.NEW && OID < 0) {

                        var builder = new YIUI.YIUIBuilder(formKey);
                        builder.setContainer(container);
                        builder.setParentForm(form);
                        builder.setTarget(YIUI.FormTarget.NEWTAB);
                        builder.setTemplateKey(onlyOpen ? "" : info.TemplateKey);
                        builder.newEmpty().then(function(emptyForm){

                            emptyForm.setSysExpVals(YIUI.BPMConstants.WORKITEM_VIEW, YIUI.BPMConstants.WORKITEM_VIEW);

                            emptyForm.setOptQueue(new YIUI.OptQueue(new YIUI.NewOpt(emptyForm)));

                            YIUI.FormParasUtil.processCallParas(form, emptyForm);

                            if( info.State === YIUI.WorkItem_State.NEW && loadInfo) {
                                emptyForm.setSysExpVals(YIUI.BPMKeys.WORKITEM_INFO, info);
                            }
                            emptyForm.setSysExpVals(YIUI.BPMKeys.LOAD_WORKITEM_INFO, false);

                            return builder.builder(emptyForm);
                        }).then(function(data){
                            var doc = data.getDocument();
                            doc.putExpData(YIUI.BPMKeys.REGISTER_ATTACHMENT, WID);
                        });
                        return true;
                    }
                }

                var builder = new YIUI.YIUIBuilder(formKey);
                builder.setContainer(container);
                builder.setParentForm(form);
                builder.setTemplateKey(onlyOpen ? "" : info.TemplateKey);
                builder.setOperationState(YIUI.Form_OperationState.Default);
                builder.newEmpty().then(function(emptyForm){

                    emptyForm.setSysExpVals(YIUI.BPMConstants.WORKITEM_VIEW, YIUI.BPMConstants.WORKITEM_VIEW);

                    emptyForm.getFilterMap().setOID(OID);
                    emptyForm.setOptQueue(new YIUI.OptQueue(new YIUI.LoadOpt(emptyForm)));
                    YIUI.FormParasUtil.processCallParas(form, emptyForm);

                    if( info.State === YIUI.WorkItem_State.NEW && loadInfo ) {
                        emptyForm.setSysExpVals(YIUI.BPMKeys.WORKITEM_INFO, info);
                    }
                    emptyForm.setSysExpVals(YIUI.BPMKeys.LOAD_WORKITEM_INFO, false);
                    return builder.builder(emptyForm);
                }).then(function(newForm){
                    newForm.setSysExpVals(YIUI.BPMKeys.LOAD_WORKITEM_INFO, true);
                });

            });

            return true;
        };

        var CommitWorkitem = function (cxt, args) {
            var form = cxt.form;
            var doc = form.getDocument();
            var WID = args[0].toString();
            var info = null;
            if (WID == -1) {
                info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
                WID = info.WorkitemID;
                info.AuditResult = args[1];
                info.UserInfo = YIUI.TypeConvertor.toString(args[2]);
            } else {

                var options = {
                    WorkitemID:args[0],
                    AuditResult:args[1],
                    UserInfo:YIUI.TypeConvertor.toString(args[2])
                };

                info = new YIUI.WorkitemInfo(options);

            }
            //解析动态驳回和单据保存相关参数
            var tsParas;
            if(args.length > 3) {
                tsParas = args[3];
            }
            if(tsParas) {
                tsParas = splitPara(tsParas);
            }

            var pattern,
                backSite = -1,
                backSiteOpt=-1,
                saveDoc = false,
                keepParts = false,
                status = -1,
                srcOperator = -1,
                allowTransit = true;

            if(tsParas) {
                if(tsParas["pattern"]){
                    pattern = tsParas["pattern"];
                }
                if(tsParas["backSite"]){
                    backSite = YIUI.TypeConvertor.toInt(form.eval(tsParas["backSite"], cxt));
                }
                if (tsParas["backSiteOpt"]) {
                    backSiteOpt=YIUI.TypeConvertor.toInt(form.eval(tsParas["backSiteOpt"], cxt));
                }
                if(tsParas["saveDoc"]){
                    saveDoc = YIUI.TypeConvertor.toBoolean(tsParas["saveDoc"]);
                }
                if(tsParas["keepParts"]){
                    keepParts = YIUI.TypeConvertor.toBoolean(tsParas["keepParts"]);
                }
                if(tsParas["status"]){
                    status = YIUI.TypeConvertor.toInt(tsParas["status"]);
                }
                if (tsParas["srcOpt"]) {
                    srcOperator = YIUI.TypeConvertor.toLong(form.eval(tsParas["srcOpt"], cxt));
                }
                if (tsParas["allowTransit"]) {
                    allowTransit = YIUI.TypeConvertor.toBoolean(tsParas["allowTransit"]);
                }
            }

            if(saveDoc){
                var Opt = new YIUI.UICheckOpt(form);
                Opt.doOpt();
            }
            if(srcOperator > 0){
                info.SrcOperator = srcOperator;
            }

            form.setSysExpVals(YIUI.BPMKeys.LOAD_WORKITEM_INFO, true);

            if(pattern) {
                if(pattern == "Transit") {
                    info.KeepParts = keepParts;
                    info.OperationType = YIUI.BPMOperationType.OPT_TRANSIT;
                } else if(pattern == "Return") {
                    if(backSite != -1) {
                        info.BackSite = backSite;
                        info.BackSiteOpt=backSiteOpt;
                        info.Status=status;
                        info.AllowTransit = allowTransit;
                        info.OperationType = YIUI.BPMOperationType.OPT_RETURN;
                    } else {
                        $.error("驳回位置不可用!");
                    }
                }
            } else {
                info.OperationType = YIUI.BPMOperationType.OPT_COMMIT;
            }

            new YIUI.BPMService(form).commitWorkitem(info, (saveDoc ? doc : null)).then(function(data){
                form.setSysExpVals(YIUI.BPMKeys.WORKITEM_INFO, null);
                var b = form.getDocument().getExpData(YIUI.BPMKeys.WORKITEM_INFO);
                if (b != null) {
                    form.getDocument().rmExpData(YIUI.BPMKeys.WORKITEM_INFO);
                }
                viewReload(form);
            });
        };

        funs.AuditWorkitem = function (name, cxt, args) {
            if(args.length < 3) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            CommitWorkitem(cxt, args);
        };

        funs.CommitWorkitem = function (name, cxt, args) {
            if(args.length < 3) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            CommitWorkitem(cxt, args);
        };

        funs.BatchCommitWorkitem = function (name, cxt, args) {
            if(args.length < 3) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form;
            var OIDList = null;
            var result = 1;
            var userInfo = "";
            if (args.length == 3) {
                OIDList = [];
                var list = args[0];

                if(typeof list == "string"){
                    OIDList = list.split(",");
                }else{
                    for (var i = 0, len = list.length; i < len; i++) {
                        OIDList.push(YIUI.TypeConvertor.toLong(list[i]));
                    }
                }
                
                result = YIUI.TypeConvertor.toInt(args[1]);
                userInfo = YIUI.TypeConvertor.toString(args[2]);
            } else {
                var tableKey = YIUI.TypeConvertor.toString(args[0]);
                var OIDFieldKey = YIUI.TypeConvertor.toString(args[1]);
                OIDList = YIUI.BatchUtil.getSelectOIDs(form, tableKey, OIDFieldKey, true);
                result = YIUI.TypeConvertor.toInt(args[2]);
                userInfo = YIUI.TypeConvertor.toString(args[3]);
            }

            new YIUI.BPMService(form).batchCommitWorkitem(OIDList, result, userInfo);
            return true;
        };

        funs.BatchCommitWorkitemByWID = function (name, cxt, args) {
            if(args.length < 3) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form;
            var WIDList = null;
            var result = 1;
            var userInfo = "";
            if (args.length == 3) {
                WIDList = [];
                var list = args[0];

                if(typeof list == "string"){
                    WIDList = list.split(",");
                }else{
                    for (var i = 0, len = list.length; i < len; i++) {
                        WIDList.push(YIUI.TypeConvertor.toLong(list[i]));
                    }
                }

                result = YIUI.TypeConvertor.toInt(args[1]);
                userInfo = YIUI.TypeConvertor.toString(args[2]);
            } else {
                var tableKey = YIUI.TypeConvertor.toString(args[0]);
                var WIDFieldKey = YIUI.TypeConvertor.toString(args[1]);
                WIDList = YIUI.BatchUtil.getSelectOIDs(form, tableKey, WIDFieldKey, true);
                result = YIUI.TypeConvertor.toInt(args[2]);
                userInfo = YIUI.TypeConvertor.toString(args[3]);
            }

            new YIUI.BPMService(form).batchCommitWorkitemByWID(WIDList, result, userInfo);
            return true;
        };

        funs.DistributeWorkitem = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var WID = args[0];
            var operatorID = args[1];
            var form = cxt.form;
//            if (args.length == 3) {
//                WIDList = [];
//                var list = args[0];
//                for (var i = 0, len = list.length; i < len; i++) {
//                    WIDList.push(YIUI.TypeConvertor.toLong(list[i]));
//                }
//                result = YIUI.TypeConvertor.toInt(args[1]);
//                userInfo = YIUI.TypeConvertor.toString(args[2]);
//            } else {
//                var tableKey = YIUI.TypeConvertor.toString(args[0]);
//                var WIDFieldKey = YIUI.TypeConvertor.toString(args[1]);
//                WIDList = YIUI.BatchUtil.getSelectOIDs(form, tableKey, WIDFieldKey, true);
//                result = YIUI.TypeConvertor.toInt(args[2]);
//                userInfo = YIUI.TypeConvertor.toString(args[3]);
//            }
            if(WID == -1){
                var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
                WID = info.WorkitemID;
            }

            new YIUI.BPMService(cxt.form).distributeWorkitem(WID, operatorID);
            return true;
        };

        funs.BatchDistributeWorkitem = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var WIDList = [];
            var list = args[0], operatorID = YIUI.TypeConvertor.toLong(args[1]);

            if(typeof list == "string"){
                WIDList = list.split(",");
            }else{
                for (var i = 0, len = list.length; i < len; i++) {
                    WIDList.push(YIUI.TypeConvertor.toLong(list[i]));
                }
            }

            new YIUI.BPMService(cxt.form).batchDistributeWorkitem(WIDList, operatorID);
            return true;
        };

        funs.CancelDistributeWorkitem = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var WID = args[0];
            var form = cxt.form;
//            var operatorID = args[1];
//            if (args.length == 3) {
//                WIDList = [];
//                var list = args[0];
//                for (var i = 0, len = list.length; i < len; i++) {
//                    WIDList.push(YIUI.TypeConvertor.toLong(list[i]));
//                }
//                result = YIUI.TypeConvertor.toInt(args[1]);
//                userInfo = YIUI.TypeConvertor.toString(args[2]);
//            } else {
//                var tableKey = YIUI.TypeConvertor.toString(args[0]);
//                var WIDFieldKey = YIUI.TypeConvertor.toString(args[1]);
//                WIDList = YIUI.BatchUtil.getSelectOIDs(form, tableKey, WIDFieldKey, true);
//                result = YIUI.TypeConvertor.toInt(args[2]);
//                userInfo = YIUI.TypeConvertor.toString(args[3]);
//            }
            if(WID == -1){
                var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
                WID = info.WorkitemID;
            }

            new YIUI.BPMService(cxt.form).cancelDistributeWorkitem(WID);
            return true;
        };

        funs.StartInstance = function (name, cxt, args) {
            var form = cxt.form;
            var doc = form.getDocument();
            var table = doc.getExpData(YIUI.BPMKeys.LoadBPM_KEY);
            if(table != null){
                table = YIUI.DataUtil.fromJSONDataTable(table);
            }
            var processKey = args[0];
            var tsParas;
            if(args.length > 1) {
                tsParas = args[1];
            }
            if(tsParas) {
                tsParas = splitPara(tsParas);
            }

            var pattern;
            var saveDoc = false, keepParts = true;
            var auditResult = 1;
            if(tsParas) {
                if(tsParas["pattern"]){
                    pattern = tsParas["pattern"];
                }
                if(tsParas["saveDoc"]){
                    saveDoc = YIUI.TypeConvertor.toBoolean(tsParas["saveDoc"]);
                }
                if(tsParas["auditResult"]){
                    auditResult = YIUI.TypeConvertor.toInt(tsParas["auditResult"]);
                }
                if(tsParas["keepParts"]){
                    keepParts = YIUI.TypeConvertor.toBoolean(tsParas["keepParts"]);
                }
            }

            if(pattern == "Transit") {
                var instanceID = table.getByKey(YIUI.BPMConstants.BPM_INSTANCE_ID);

                new YIUI.BPMService(form).dirStratInstance(instanceID, auditResult, saveDoc ? doc : null, keepParts)
                        .then(function(data){
                            form.setSysExpVals(YIUI.BPMKeys.WORKITEM_INFO, null);

                            var b = form.getDocument().getExpData(YIUI.BPMKeys.WORKITEM_INFO);
                            if (b != null) {
                                form.getDocument().rmExpData(YIUI.BPMKeys.WORKITEM_INFO);
                            }
                            viewReload(form);
                        });
            } else {
                new YIUI.BPMService(form).startInstance(form.formKey, form.getOID(), args[0], saveDoc ? doc : null)
                    .then(function(data){
                        form.setSysExpVals(YIUI.BPMKeys.WORKITEM_INFO, null);

                        var b = form.getDocument().getExpData(YIUI.BPMKeys.WORKITEM_INFO);
                        if (b != null) {
                            form.getDocument().rmExpData(YIUI.BPMKeys.WORKITEM_INFO);
                        }
                        viewReload(form);
                    });
            }
        };
        
        funs.RebindInstance = function(name, cxt, args){
        	 var form = cxt.form;
             var doc = form.getDocument();
             var processKey;
             var saveDoc = false;
             if(args.length > 0) {
            	 processKey = args[0];
             }
             if(args.length > 1) {
            	 saveDoc = YIUI.TypeConvertor.toBoolean(args[1]);
             }
             
             new YIUI.BPMService(form).rebindInstance(form.formKey, form.getOID(), processKey, saveDoc ? doc : null)
             .then(function(data){
                 form.setSysExpVals(YIUI.BPMKeys.WORKITEM_INFO, null);

                 var b = form.getDocument().getExpData(YIUI.BPMKeys.WORKITEM_INFO);
                 if (b != null) {
                     form.getDocument().rmExpData(YIUI.BPMKeys.WORKITEM_INFO);
                 }
                 viewReload(form);
             });
             
        };

        funs.RestartInstance = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form;
            var instanceID = YIUI.TypeConvertor.toInt(args[0]);
            if (instanceID == -1) {

                var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
                instanceID = info.InstanceID;

                new YIUI.BPMService(form).restartInstance(instanceID).then(function(data){
                    form.setSysExpVals(YIUI.BPMConstants.WORKITEM_INFO, null);

                    var b = form.getDocument().getExpData(YIUI.BPMKeys.WORKITEM_INFO);
                    if (b != null) {
                        form.getDocument().putExpData(YIUI.BPMKeys.WORKITEM_INFO, null);
                    }

                    viewReload(form);
                });
            }else{
                new YIUI.BPMService(form).restartInstance(instanceID);
            }
        };

        funs.RecallInstance = function (name, cxt, args) {
            var form = cxt.form;
            var instanceID = -1, userInfo="";

            if(args.length > 0){
                nstanceID = YIUI.TypeConvertor.toLong(args[0]);
            }

            if(args.length > 1){
                userInfo = YIUI.TypeConvertor.toString(args[1]);
            }

            if (instanceID == -1) {

                var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
                instanceID = info.InstanceID;

                new YIUI.BPMService(form).recallInstance(instanceID, userInfo).then(function(data){
                    form.setSysExpVals(YIUI.BPMConstants.WORKITEM_INFO, null);

                    var b = form.getDocument().getExpData(YIUI.BPMKeys.WORKITEM_INFO);
                    if (b != null) {
                        form.getDocument().putExpData(YIUI.BPMKeys.WORKITEM_INFO, null);
                    }

                    viewReload(form);
                });
            }else{
                new YIUI.BPMService(form).recallInstance(instanceID, userInfo);
            }
        };

        funs.RecallInstanceByOID = function (name, cxt, args) {
            var form = cxt.form;
            var OID = -1, userInfo="";

            if(args.length > 0){
                OID = YIUI.TypeConvertor.toLong(args[0]);
            }

            if(args.length > 1){
                userInfo = YIUI.TypeConvertor.toString(args[1]);
            }

            if (OID > 0) {
                new YIUI.BPMService(form).recallInstanceByOID(OID, userInfo);
            }else{
                if(form){
                    OID = form.getOID();
                }

                new YIUI.BPMService(form).recallInstanceByOID(OID, userInfo).then(function(data){
                    form.setSysExpVals(YIUI.BPMConstants.WORKITEM_INFO, null);

                    var b = form.getDocument().getExpData(YIUI.BPMKeys.WORKITEM_INFO);
                    if (b != null) {
                        form.getDocument().putExpData(YIUI.BPMKeys.WORKITEM_INFO, null);
                    }

                    viewReload(form);
                });
            }
        };

        funs.KillInstance = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var instanceID = args[0].toString();
            var userInfo = "";
            if (args.length > 2) {
                userInfo = YIUI.TypeConvertor.toString(args[2]);
            }

            if (instanceID == -1) {
                var fromParent = false;
                if (args.length > 1) {
                    fromParent = YIUI.TypeConvertor.toBoolean(args[1]);
                }

                var form = cxt.form;
                if (fromParent) {
                    form = form.getParentForm();
                }
                var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
                instanceID = info.InstanceID;

                new YIUI.BPMService(form).killInstance(form, instanceID, userInfo).then(function(data){
                    form.setSysExpVals(YIUI.BPMConstants.WORKITEM_INFO, null);

                    var b = form.getDocument().getExpData(YIUI.BPMKeys.WORKITEM_INFO);
                    if (b != null) {
                        form.getDocument().putExpData(YIUI.BPMKeys.WORKITEM_INFO, null);
                    }

                    viewReload(form);
                });
            } else {
                new YIUI.BPMService(form).killInstance(cxt.form, instanceID, userInfo);
            }
            return true;
        };

        funs.GetValidNodes = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form;
            var instanceId = -1;
            if(form.getSysExpVals(YIUI.BPMKeys.WORKITEM_INFO))
                instanceId = form.getSysExpVals(YIUI.BPMKeys.WORKITEM_INFO).InstanceID;
            if(instanceId == -1){
                form = form.getParentForm();
                if(form.getSysExpVals(YIUI.BPMKeys.WORKITEM_INFO))
                    instanceId = form.getSysExpVals(YIUI.BPMKeys.WORKITEM_INFO).InstanceID;
            }
            var nodeID = YIUI.TypeConvertor.toInt(args[0]);
            var processKey = YIUI.TypeConvertor.toString(args[1]);
            var ignoreDeep = false;
            if (args.length > 2) {
                ignoreDeep = YIUI.TypeConvertor.toBoolean(args[2]);
            }

            var version = -1;
            if( args.length > 3 ) {
                version = YIUI.TypeConvertor.toInt(args[3]);
            }

            if( version == -1 ) {
                var getProcessVer = function () {
                    var processVer = -1,
                        doc = form.getDocument(),
                        table;
                    var tableJSON = doc.getExpData(YIUI.BPMKeys.LoadBPM_KEY);
                    if( tableJSON ) {
                        table = YIUI.DataUtil.fromJSONDataTable(tableJSON);
                    }
                    if( table && table.first() ) {
                        var tempVer = table.getByKey("Version");
                        if( tempVer ) {
                            processVer = YIUI.TypeConvertor.toInt(tempVer);
                        }
                    }
                    return processVer;
                }

                version = getProcessVer();
            }

            return new YIUI.BPMService(form).getValidNodes(nodeID, processKey, instanceId, ignoreDeep, version);
        };

        funs.GetAliasKey = function(name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var platform = YIUI.TypeConvertor.toInt(args[0]),
                formKey = YIUI.TypeConvertor.toString(args[1]);
            return new YIUI.MetaService(cxt.form).getAliasKey(platform, formKey);
        }

        var viewReload = function (form) {
            var container = form.getDefContainer();
            if (container == null) {
                container = form.getContainer();
            }

            //需要重新向后台加载工作项信息
            if(form.getSysExpVals(YIUI.BPMKeys.LOAD_WORKITEM_INFO) != null){
                form.setSysExpVals(YIUI.BPMKeys.LOAD_WORKITEM_INFO,true);
            }

            var tag = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_VIEW);
            // 如果这个工作项是代办页面打开的，提交工作项之后刷新代办页面
            if (tag == YIUI.BPMConstants.WORKITEM_VIEW) {
                var pFormID = form.pFormID;
                var viewForm = YIUI.FormStack.getForm(pFormID);
                if (!viewForm || viewForm.type != YIUI.Form_Type.View) {
                    return;
                }
                var old = viewForm.getOperationState();

                var loadParent = new YIUI.LoadOpt(viewForm);
                loadParent.doOpt();
                viewForm = YIUI.FormStack.getForm(pFormID);
                viewForm.setOperationState(old);
                viewForm.showDocument();
            }
            // 获取载入前数据的版本号
            var originDocContainVerID = false;
            var originVerID = -1;
            var originDoc = form.getDocument();
            if (originDoc) {
                //MainTable
                var mtKey = form.mainTableKey;
                var mt = originDoc.getByKey(mtKey);
                if (mt && mt.first() > 0) {
                    originVerID = mt.getByKey(YIUI.SystemField.VERID_SYS_KEY);
                    if (originVerID >= 0)
                        originDocContainVerID = true;
                }
            }

            form.setOperationState(YIUI.Form_OperationState.Default);
            var loadParent = new YIUI.LoadOpt(form);
            loadParent.doOpt();

            // 原始数据无版本信息，那么就不要执行UpdateView
            if (!originDocContainVerID)
                return;

            // 获取载入后数据的版本号，如果发生了变化,那么执行UpdateView
            var activeDoc = form.getDocument();
            if (activeDoc != null) {
                var mtKey = form.mainTableKey;
                var mt = activeDoc.getByKey(mtKey);
                if (mt && mt.first() > 0) {
                    var newVerID = mt.getByKey(YIUI.SystemField.VERID_SYS_KEY);
                    if (parseInt(newVerID) > parseInt(originVerID)) {
                        updateView(form);
                    }
                }
            }

        };
        
        funs.RevokeWorkitem = function (name, cxt, args){
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
        	var form = cxt.form;
            var wid = YIUI.TypeConvertor.toInt(args[0]);
            var userInfo;
            if (args.length > 1) {
                userInfo = args[1];
            }

            new YIUI.BPMService(form).revokeWorkitem(wid, userInfo)
                .then(function(data){

                    form.setSysExpVals(YIUI.BPMConstants.WORKITEM_INFO, null);
                    form.setSysExpVals(YIUI.BPMKeys.LOAD_WORKITEM_INFO, true);
                    var b = form.getDocument().getExpData(YIUI.BPMKeys.WORKITEM_INFO);
                    if (b != null) {
                        form.getDocument().putExpData(YIUI.BPMKeys.WORKITEM_INFO, null);
                    }

                    viewReload(form);
                });
            return true;
        };

        funs.RollbackToWorkitem = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form;
            var wid = YIUI.TypeConvertor.toInt(args[0]);
            var logicCheck = false;
            if (args.length > 1) {
                logicCheck = YIUI.TypeConvertor.toBoolean(args[1]);
            }

            new YIUI.BPMService(form).rollbackToWorkitem(wid, logicCheck)
                .then(function(data){

                    form.setSysExpVals(YIUI.BPMConstants.WORKITEM_INFO, null);
                    form.setSysExpVals(YIUI.BPMKeys.LOAD_WORKITEM_INFO, true);
                    var b = form.getDocument().getExpData(YIUI.BPMKeys.WORKITEM_INFO);
                    if (b != null) {
                        form.getDocument().putExpData(YIUI.BPMKeys.WORKITEM_INFO, null);
                    }

                    viewReload(form);
                });
            return true;
        };

        funs.ForcibleMove = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form;
            var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
            if (!info) {
                throw new YIUI.BPMException(YIUI.BPMException.NO_ACTIVE_WORKITEM,
                    YIUI.BPMException.formatMessage(YIUI.BPMException.NO_ACTIVE_WORKITEM));
            }
            var instanceID = info.InstanceID,
                srcNode = YIUI.TypeConvertor.toInt(args[0]),
                tgtNode = YIUI.TypeConvertor.toInt(args[1]);

            new YIUI.BPMService(form).forcibleMove(instanceID, srcNode, tgtNode)
                .then(function(data){

                    form.setSysExpVals(YIUI.BPMConstants.WORKITEM_INFO, null);

                    var b = form.getDocument().getExpData(YIUI.BPMKeys.WORKITEM_INFO);
                    if (b != null) {
                        form.getDocument().putExpData(YIUI.BPMKeys.WORKITEM_INFO, null);
                    }

                    viewReload(form);
                });
            return true;
        };

        funs.AssignNextNodeParticipator = function (name, cxt, args) {
            var info = getActiveWorkitem(cxt, args);
            if (!info) {
                throw new YIUI.BPMException(YIUI.BPMException.NO_ACTIVE_WORKITEM,
                    YIUI.BPMException.formatMessage(YIUI.BPMException.NO_ACTIVE_WORKITEM));
            }
            var role = false;
            if (args.length > 2) {
                role = YIUI.TypeConvertor.toBoolean(args[2]);
            }
            var table = new DataDef.DataTable();
            var user_type = YIUI.DataUtil.dataType2JavaDataType(YIUI.DataType.STRING);
            table.addCol(YIUI.PPObject_Type.ColumnType, YIUI.DataType.STRING, user_type);
            table.addCol(YIUI.PPObject_Type.ColumnInfo, YIUI.DataType.STRING, user_type);

            var pp = new YIUI.PPObject(table);

            var opStr = YIUI.TypeConvertor.toString(args[1]);
            table.addRow();

            table.setByKey(YIUI.PPObject_Type.ColumnType, role ? YIUI.PPObject_Type.DicRole : YIUI.PPObject_Type.DicOperator);
            table.setByKey(YIUI.PPObject_Type.ColumnInfo, opStr);

            info.NextOpStr = $.toJSON(pp.toJSON());
            return true;
        };
        
        funs.SetCustomKey = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var customKey = YIUI.TypeConvertor.toString(args[0]);
            var form = cxt.form;
            var info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
            info.OperationKey = customKey;
            return true;
        };

        funs.BatchStateAction = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form;
            var processKey = YIUI.TypeConvertor.toString(form.getPara(YIUI.BatchBPM.BPM_PROCESS_KEY));
            var actionNodeKey = YIUI.TypeConvertor.toString(form.getPara(YIUI.BatchBPM.BPM_ACTION_NODE_KEY));
            var lv = null;
            var mTblKey = form.mainTableKey;
            if (mTblKey) {
                lv = form.getListView(mTblKey);
            } else {
                lv = form.getListView(0);
            }
            var oids = lv.getFieldArray(form, YIUI.SystemField.OID_SYS_KEY);
            var result = YIUI.TypeConvertor.toInt(args[0]);
            var userInfo = YIUI.TypeConvertor.toString(args[1]);

            new YIUI.BPMService(form).batchStateAction(processKey, actionNodeKey, oids, result, userInfo);
            return true;
        };

        funs.GetProcessPath = function (name, cxt, args) {
            var oid = null, form = cxt.form;
            if (args.length > 0) {
                oid = YIUI.TypeConvertor.toInt(args[0]);
            } else {
                if (form) {
                    oid = form.getOID();
                }
            }

            var rs = new YIUI.BPMService(form).loadProcessPath(oid);
            return rs;
        };

        funs.RegisterAttachment = function (name, cxt, args) {
            if(args.length < 3) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var oid = YIUI.TypeConvertor.toLong(args[0]);
            var key = YIUI.TypeConvertor.toString(args[1]);
            var attachmentOID = YIUI.TypeConvertor.toLong(args[2]);

            var attachmentPara = "";
            if (args.length > 3)
                attachmentPara = YIUI.TypeConvertor.toString(args[3]);
            var attachmentInfo = "";
            if (args.length > 4)
                attachmentInfo = YIUI.TypeConvertor.toString(args[4]);

            new YIUI.BPMService(cxt.form).registerAttachment(oid, key, attachmentOID, attachmentInfo, attachmentPara);
            return true;
        };
    }

    {
        // 获取ListView或者Grid行数据的公式
        funs.GetValueArray = function (name,cxt,args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form,
                doc = form.getDocument(),
                tableKey = YIUI.TypeConvertor.toString(args[0]),
                columnKey = YIUI.TypeConvertor.toString(args[1]);
            var table = doc.getShadow(tableKey);
            if( !table ) {
                table = doc.getByKey(tableKey);
            }
            var values = [];
            table.beforeFirst();
            while (table.next()) {
                if( !YIUI.TypeConvertor.toBoolean(table.getByKey(YIUI.SystemField.SELECT_FIELD_KEY)) )
                    continue;
                values.push(table.getByKey(columnKey));
            }
            return values;
        }

        funs.GetUIArray = function (name,cxt,args) {
            // TODO
        }
    }


    { //Detail相关
        funs.OpenDetail = function (name, cxt, args) {
            $.error("OpenDetail有误！");
        };
        funs.EditDetail = function (name, cxt, args) {
            $.error("EditDetail有误！");
        };
        funs.EditDetailInGrid = function (name, cxt, args) {
            $.error("EditDetailInGrid有误！");
        };
        funs.NewDetail = function (name, cxt, args) {
            $.error("NewDetail有误！");
        };
        funs.NewDetailInGrid = function (name, cxt, args) {
            $.error("NewDetailInGrid有误！");
        };
    }

    { //BPMExtendFunction BPM扩展公式
        funs.TransferTask = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var WID = parseFloat(args[0].toString()) ,
                form = cxt.form, wiInfo = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO),
                operatorID = parseFloat(args[1].toString()),
                createRecord = false, userinfo,
                auditResult = -1,
                srcOperator = -1,
                transferType = -1;

            if (WID == -1) {
                WID = wiInfo.WorkitemID;
            }
            if (args.length > 2) {
                createRecord = args[2];
            }
            if (args.length > 3) {
                userinfo = YIUI.TypeConvertor.toString(args[3]);
            }
            if (args.length > 4) {
                auditResult = args[4];
            }
            if (args.length > 5) {
                srcOperator = args[5];
            }
            if (args.length > 6) {
                transferType = args[6];
            }

            new YIUI.BPMService(form).transferTask(WID, operatorID, createRecord, userinfo, auditResult, srcOperator, transferType);
        };

        funs.RefuseTask = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var WID = YIUI.TypeConvertor.toLong(args[0]) ,
                form = cxt.form, wiInfo = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO),
//                operatorID = parseFloat(args[1].toString()),
                createRecord = false, userInfo,
                auditResult = -1;
            if (WID == -1) {
                WID = wiInfo.WorkitemID;
            }
//            if (args.length > 2) {
//                createRecord = args[2];
//            }
            if (args.length > 2) {
                userInfo = YIUI.TypeConvertor.toString(args[2]);
            }
            if (args.length > 1) {
                auditResult = YIUI.TypeConvertor.toInt(args[1]);
            }

            new YIUI.BPMService(form).refuseTask(WID, auditResult, userInfo);
        };

        funs.RefuseToOperator = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var operatorID = YIUI.TypeConvertor.toLong(args[0]) ,
                form = cxt.form, wiInfo = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
//                createRecord = false, userinfo,
//                auditResult = -1;
//            if (WID == -1) {
//                WID = wiInfo.WorkitemID;
//            }
//            if (args.length > 2) {
//            	userinfo = YIUI.TypeConvertor.toString(args[2]);
//            }
//            if (args.length > 1) {
//            	auditResult = YIUI.TypeConvertor.toInt(args[1]);
//            }
//
            new YIUI.BPMService(form).refuseToOperator(wiInfo, operatorID);
        };

        funs.EndorseTask = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var WID = parseFloat(args[0].toString()) ,
                form = cxt.form, wiInfo = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO),
                operatorID = parseFloat(args[1].toString()),
                launchInfo = "",
                hide = true;
            if (WID == -1) {
                WID = wiInfo.WorkitemID;
            }
            if (args.length > 2) {
                launchInfo = YIUI.TypeConvertor.toString(args[2]);
            }
            if (args.length > 3) {
				hide = YIUI.TypeConvertor.toBoolean(args[3]);
			}

            new YIUI.BPMService(form).endorseTask(WID, operatorID, launchInfo, hide)
                    .then(function(data){
                        form.setSysExpVals(YIUI.BPMConstants.WORKITEM_INFO, null);

                        var b = form.getDocument().getExpData(YIUI.BPMKeys.WORKITEM_INFO);
                        if (b != null) {
                            form.getDocument().putExpData(YIUI.BPMKeys.WORKITEM_INFO, null);
                        }

                        viewReload(cxt.form);
                    });
        };

        funs.BatchEndorseTask = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var WID = parseFloat(args[0].toString()) ,
                form = cxt.form, launchInfo = "", inOrder = false, hide = true;

            if (WID == -1) {
                var wiInfo = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
                if(wiInfo){
                    WID = wiInfo.WorkitemID;  
                }  
            }
            
            var pp = new YIUI.PPObject(args[1]);

            if (args.length > 2) {
                launchInfo = YIUI.TypeConvertor.toString(args[2]);
            }
            if (args.length > 3) {
                inOrder = YIUI.TypeConvertor.toBoolean(args[3]);
            }
            if (args.length > 4) {
				hide = YIUI.TypeConvertor.toBoolean(args[4]);
			}

            new YIUI.BPMService(form).batchEndorseTask(WID, pp, launchInfo, inOrder, hide)
                    .then(function(data){
                        form.setSysExpVals(YIUI.BPMConstants.WORKITEM_INFO, null);

                        var b = form.getDocument().getExpData(YIUI.BPMKeys.WORKITEM_INFO);
                        if (b != null) {
                            form.getDocument().putExpData(YIUI.BPMKeys.WORKITEM_INFO, null);
                        }

                        viewReload(cxt.form);
                    });

        };

        funs.LaunchTask = function (name, cxt, args) {
            if(args.length < 5) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var WID = parseFloat(args[0].toString()) ,
                form = cxt.form, wiInfo = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO),
                nodeKey = args[1].toString(),
                operatorID = args[2],
                launchInfo = YIUI.TypeConvertor.toString(args[3]),
                hideActiveWorkitem = args[4];

            var pp = new YIUI.PPObject(operatorID);
//            pp.type = 1;

            if (WID == -1) {
                WID = wiInfo.WorkitemID;
            }
            new YIUI.BPMService(form).launchTask(WID, nodeKey, pp, launchInfo, hideActiveWorkitem);
        };

        funs.ManualTransferByWID = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var WID = YIUI.TypeConvertor.toLong(args[0]),
            tgtNodeId = YIUI.TypeConvertor.toInt(args[1]), info = {};

            var auditResult = args.length > 2 ? YIUI.TypeConvertor.toInt(args[2]) : -1;
            var userInfo = args.length > 3 ? args[3] : "";
            var lock = args.length > 4 ? YIUI.TypeConvertor.toBoolean(args[4]) : true;

            if(WID == -1){
                var form = cxt.form, info = form.getSysExpVals(YIUI.BPMConstants.WORKITEM_INFO);
                WID = info == null ? -1 : info.WorkitemID;
            }

            info.WorkitemID = WID;
            info.TransferTo = tgtNodeId;
            info.AuditResult = auditResult;
            info.UserInfo = userInfo;
            info.Lock = lock;

            new YIUI.BPMService(cxt.form).manualTransferToNode(info);
            return true;
        };

        funs.ManualTransferByNodeID = function (name, cxt, args) {
            if(args.length < 3) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var instanceID = YIUI.TypeConvertor.toLong(args[0]),
            nodeID = YIUI.TypeConvertor.toInt(args[1]), 
            tgtNodeId = YIUI.TypeConvertor.toInt(args[2]),
            info = {};

            if(instanceID == -1){
                var form = cxt.form, doc = form.getDocument(), table = doc.getExpData(YIUI.BPMKeys.LoadBPM_KEY);
                if(table != null){
                    table = YIUI.DataUtil.fromJSONDataTable(table);
                }
                if (table != null && table.first()) {
                    instanceID = table.getByKey(YIUI.BPMConstants.BPM_INSTANCE_ID);
                }
            }

            var auditResult = args.length > 3 ? YIUI.TypeConvertor.toInt(args[3]) : -1;
            var userInfo = args.length > 4 ? args[4] : "";
            var lock = args.length > 5 ? YIUI.TypeConvertor.toBoolean(args[5]) : true;

            info.InstanceID = instanceID;
            info.NodeID = nodeID;
            info.TransferTo = tgtNodeId;
            info.AuditResult = auditResult;
            info.UserInfo = userInfo;
            info.Lock = lock;

            new YIUI.BPMService(cxt.form).manualTransferToNode(info);
            return true;
        };
        
        funs.AddParticipators = function (name, cxt, args) {
            if(args.length < 3) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var operatorList,
            nodeKey = YIUI.TypeConvertor.toString(args[1]),
            instanceID = YIUI.TypeConvertor.toLong(args[2]),
            isInsert = false;

            var pp = new YIUI.PPObject(args[0]);
            if (pp) {
				operatorList = pp.operatorList;
			}

            if(instanceID == -1){
                var form = cxt.form, doc = form.getDocument(), table = doc.getExpData(YIUI.BPMKeys.LoadBPM_KEY);
                if(table != null){
                    table = YIUI.DataUtil.fromJSONDataTable(table);
                }
                if (table != null && table.first()) {
                    instanceID = table.getByKey(YIUI.BPMConstants.BPM_INSTANCE_ID);
                }  
            }

            if (args.length > 3) {
                isInsert = YIUI.TypeConvertor.toBoolean(args[3]);
            }


            new YIUI.BPMService(cxt.form).addParticipators(operatorList, nodeKey, instanceID, isInsert);
            return true;
        };

        // 使用FillGridData代替!
        funs.FillGrid = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form,
                grid = form.getComponent(args[0].toString());

            if( grid == null ) {
                throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, args[0].toString()));
            }

            var tableKey = grid.tableKey;
            if( !tableKey ){
                return;
            }

            var ignoreKeys = [],
                newTable = args[1],
                doc = form.getDocument();

            var oldTable = doc.getByKey(tableKey);

            var parentKey = oldTable.parentKey,
                parentBkmk = -1;
            if( parentKey ) {
                parentBkmk = doc.getByKey(parentKey).getBkmk();
            }

            YIUI.DataUtil.append(newTable, oldTable, parentBkmk);

            for (var i = 2, len = args.length; i < len; i++) {
                ignoreKeys.push(args[i].toString());
            }
            form.setSysExpVals("IgnoreKeys", ignoreKeys);

            // 需要重新构造表格结构,因为可能先改变列拓展,再插行
            grid.load(true);

            grid.getHandler().dealWithSequence(form,grid,0);
        };

        funs.FillGridData = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form,
                clearOldData = false,
                grid = form.getComponent(args[0].toString());

            if (grid == null) {
                throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, args[0].toString()));
            }

            if (args.length > 2) {
                clearOldData = YIUI.TypeConvertor.toBoolean(args[2]);
            }

            var tableKey = grid.tableKey;
            if( !tableKey ){
                return;
            }

            var dataTable = args[1],
                doc = form.getDocument();

            var oldTable = doc.getByKey(tableKey);

            // 如果是新增状态的行,直接删除
            if (clearOldData) {
                oldTable.delAll();
            }
            var parentKey = oldTable.parentKey,
                parentBkmk = -1;
            if( parentKey ) {
                parentBkmk = doc.getByKey(parentKey).getBkmk();
            }

            YIUI.DataUtil.append(dataTable, oldTable, parentBkmk);

            var ignoreKeys = [],
                metaCell;
            for( var i = 0,count = dataTable.getColumnCount();i < count;i++ ) {
                metaCell = grid.getMetaCellByColumnKey(dataTable.getCol(i).getKey());
                if( metaCell ) {
                    ignoreKeys.push(metaCell.key);
                }
            }
            form.setSysExpVals("IgnoreKeys", ignoreKeys);

            // 需要重新构造表格结构,因为可能先改变列拓展,再插行
            grid.load(true);

            grid.getHandler().dealWithSequence(form,grid,0);
        }
    }

    {
        funs.GetSvrUsers = function (name,cxt,args) {
            var form = cxt.form;
            var mode = -1;
            if( args.length > 0  ) {
                mode = YIUI.TypeConvertor.toInt(args[1]);
            }

            YIUI.RemoteService.getSvrUser(form.formKey,mode).then(function (doc) {
                form.setDocument(doc);
                var totalCount = YIUI.TotalRowCountUtil.getRowCount(doc,"AMOUNT");
                form.setPara("AMOUNT",totalCount);
                form.showDocument();
            });
        };

        funs.KickOffOperator = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var mode = YIUI.TypeConvertor.toInt(args[0]),
                clientID = YIUI.TypeConvertor.toString(args[1]);

            var params = {
                service: "SessionRights",
                cmd: "KickOffOperator",
                loginMode: mode,
                client: clientID
            };

            new Svr.Request(cxt.form).getSyncData(Svr.SvrMgr.ServletURL, params);
        };

        funs.UnlockOperator = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var operatorID = args[0];
            var mode = args[1];
            var params = {
                service: "SessionRights",
                cmd: "UnlockOperator",
                mode: mode,
                operatorID: operatorID
            };
            new Svr.Request(cxt.form).getSyncData(Svr.SvrMgr.ServletURL, params);
        };
    }

    {// 附件相关公式
        funs.UploadAttachment = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var fileOID = YIUI.TypeConvertor.toLong(args[0]);
            var tableKey = YIUI.TypeConvertor.toString(args[1]);
            var maxSize = -1;
            if (args.length > 2) {
                maxSize = YIUI.TypeConvertor.toLong(args[2]);
            }
            var allowedTypes;
            if (args.length > 3 && args[3]) {
                allowedTypes = YIUI.TypeConvertor.toString(args[3]).split(";");
            }
            // var quickSave = false;
            // if (args.length > 4) {
            //     quickSave = YIUI.TypeConvertor.toBoolean(args[4]);
            // }
            // var refresh = true;
            // if (args.length > 5) {
            //     refresh = YIUI.TypeConvertor.toBoolean(args[5]);
            // }
            var seriesPath = "";
            if (args.length > 6) {
                seriesPath = YIUI.TypeConvertor.toString(args[6]);
            }
            var callback = "";
            if (args.length > 7) {
                callback = YIUI.TypeConvertor.toString(args[7]);
            }
            var provider = "";
            if (args.length > 8) {
                provider = YIUI.TypeConvertor.toString(args[8]);
            }
            var deleteOld = true;
            if ( args.length > 9 ) {
                deleteOld = YIUI.TypeConvertor.toBoolean(args[9]);
            }

            var form = cxt.form,
                doc = form.getDocument(),
                table = doc.getByKey(tableKey);

            var oid = form.getOID(); // 附件所在表单OID
            if( oid == -1 ) {
                oid = form.getPara("OID"); // 参数取
            }

            var grid,
                rowIndex = -1,
                path = ""; // 取到当前行数据的附件path,用于删除
            if( table.tableMode == YIUI.TableMode.DETAIL ) {
                grid = form.getGrid(tableKey);
                rowIndex = cxt.getLoc(grid.key).getRow();
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

            var success = function (o) {
                if( table.tableMode == YIUI.TableMode.DETAIL ) {
                    for( var i = 0;i < keys.length;i++ ) {
                        var metaCell = grid.getMetaCellByColumnKey(keys[i]);
                        if( metaCell ) {
                            grid.setValueByKey(rowIndex,metaCell.key,o[keys[i]],true,true);
                        }
                    }
                } else {
                    for( var i = 0,size = keys.length;i < size;i++ ) {
                        var com = form.getCompByDataBinding(tableKey,keys[i]);
                        if( com ) {
                            com.setValue(o[keys[i]],true,true);
                        }
                    }
                }
                if( callback ) {
                    form.eval(callback,new View.Context(form));
                }
            }

            var options = {
                service: "UploadAttachment",
                formKey: form.formKey,
                deleteOld: deleteOld,
                oid: oid || -1,
                tableKey: tableKey,
                provider:provider,
                path: encodeURIComponent(path),// 不是完整的URI,使用encodeURIComponent,可能含有保留字符"+"等
                seriesPath: seriesPath,
                mode: 1,
                maxSize:maxSize,
                types: allowedTypes,
                success: success
            }

            if( window.up_target ) {
                window.up_target.onchange = function () {
                    options.file = $(this);
                    YIUI.FileUtil.ajaxFileUpload(options);
                }
            } else {
                YIUI.FileUtil.uploadFile(options);
            }
            return true;
        };

        funs.DownloadAttachment = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form;

            var tableKey = YIUI.TypeConvertor.toString(args[1]);

            var path = "";
            if( args.length > 2 ) {
                path = YIUI.TypeConvertor.toString(args[2]);
            }

            var provider = "";
            if (args.length > 3) {
                provider = YIUI.TypeConvertor.toString(args[3]);
            }

            // 如果给定路径,使用给定路径,否则从数据表中取得
            if( !path ) {
                var doc = form.getDocument(),
                    tbl = doc.getByKey(tableKey);
                if( tbl.tableMode == YIUI.TableMode.DETAIL ) {
                    var grid = form.getGrid(tableKey),
                        rowIndex = cxt.getLoc(grid.key).getRow();
                    if( rowIndex == -1 ) {
                        return false;
                    }
                    var row = grid.getRowDataAt(rowIndex);
                    if (YIUI.GridUtil.isEmptyRow(row)) {
                        return false;
                    }
                    tbl.setByBkmk(row.bkmkRow.getBookmark());
                } else {
                    tbl.first();
                }
                path = tbl.getByKey(YIUI.Attachment_Data.PATH);
            }

            if( !path ) {
                return false;
            }

            var options = {
                formKey: form.formKey,
                tableKey: tableKey,
                provider: provider,
                path: path,
                mode: 1,
                service: 'DownloadAttachment'
            };

            YIUI.FileUtil.downLoadFile(options);

            return true;
        };

        funs.DeleteAttachment = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form;

            var fileOID = YIUI.TypeConvertor.toLong(args[0]);

            var tableKey = YIUI.TypeConvertor.toString(args[1]);

            // 如果给定路径,使用给定路径,否则从数据表中取得
            var path = "";
            if( args.length > 2 ) {
                path = YIUI.TypeConvertor.toString(args[2]);
            }

            var provider = "";
            if (args.length > 3) {
                provider = YIUI.TypeConvertor.toString(args[3]);
            }

          var doc = form.getDocument(),
              tbl = doc.getByKey(tableKey);

          var grid = form.getGrid(tableKey),
              rowIndex = -1;
          if( grid ) {
            rowIndex = cxt.getLoc(grid.key).getRow();
          }

          // 如果给定路径,使用给定路径,否则从数据表中取得
          if( !path ) {
            if( tbl.tableMode == YIUI.TableMode.DETAIL ) {

              if( rowIndex == -1 ) {
                return false;
              }
              var row = grid.getRowDataAt(rowIndex);
              if (YIUI.GridUtil.isEmptyRow(row)) {
                return false;
              }
              tbl.setByBkmk(row.bkmkRow.getBookmark());
            } else {
              tbl.first();
            }
            path = tbl.getByKey(YIUI.Attachment_Data.PATH);
          }

            if( !path ) {
                return false;
            }

            var paras = {
                formKey: form.formKey,
                provider: provider,
                path: path,
                service: "DeleteAttachment"
            };

            Svr.SvrMgr.deleteAttachment(paras);

            if( tbl.tableMode == YIUI.TableMode.HEAD ) {
                for( var i = 0,size = keys.length;i < size;i++ ) {
                    var com = form.getCompByDataBinding(tableKey,keys[i]);
                    if( com ) {
                        com.setValue(null, true, true);
                    }
                }
            } else {
                grid.deleteRow(rowIndex,true); // 只能删除行,分别不出是纯附件表格还是和明细结合
            }

            return true;
        };


        //启动单个定时器
        funs.StartTimerTask = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form, timerKey = args[0];
            var timerTask = form.timerTask;
            if (timerKey != null && timerTask[timerKey]) {
                form.startTimer(cxt, timerTask[timerKey]);
            }

        };

        //获取定时器的状态
        funs.IsTimerTaskStarted = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form, timerKey = args[0];
            var isStarted = false;
            if (timerKey != null) {
                var timer = form.timerList[timerKey];
                if(timer) {
                    isStarted = timer.started;
                }
            }
            return isStarted;

        };

        //停止单个定时器
        funs.StopTimerTask = function (name,cxt,args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form, timerKey = args[0];
            if (timerKey != null) {
                var timerTask = form.timerTask;
                form.closeTimer(timerTask[timerKey], form);
            }
        };

        funs.ApplyNewSequence = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var form = cxt.form;
            var dataObjectKey = args[0];
            var NoPrefix = args[1];
            var paras = {
                service: "ApplyNewSequence",
                dataObjectKey: dataObjectKey,
                NoPrefix: NoPrefix
            }
            var newSequence = new Svr.Request(form).getSyncData(Svr.SvrMgr.ServletURL, paras);
            return newSequence;

        };

        funs.GetUIAgent = function (name, cxt, args) {
            return "webbrowser";
        };

        funs.LocaleString = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var formKey = "";
            if (cxt) {
                formKey = cxt.form.getFormKey();
            }
            var group = args[0];
            var key = args[1];
            var values = [];
            var params = {
                service: "LocaleString",
                formKey: formKey,
                group: group,
                key : key,
                paras: $.toJSON(values)
            }
            var str = new Svr.Request(cxt.form).getSyncData(Svr.SvrMgr.ServletURL, params);
            return str;
        };

        funs.LocaleParaFormat = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var formKey = "";
            if (cxt) {
                formKey = cxt.form.getFormKey();
            }
            var group = args[0];
            var key = args[1];
            var values = [];
            for (var i = 2, len = args.length; i < len; i++) {
                values.push(args[i]);
            }
            var params = {
                service: "LocaleString",
                formKey: formKey,
                group: group,
                key : key,
                paras: $.toJSON(values)
            }
            var str = new Svr.Request(cxt.form).getSyncData(Svr.SvrMgr.ServletURL, params);
            return str;
        };

        funs.LocaleFormat = funs.LocaleParaFormat;

        funs.GetHeadInfo = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var global;
            if (args.length > 1) {
                global = args[1];
            }
            return YIUI.HeadInfos.get(args[0], global);
        };

        funs.PutHeadInfo = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var key = args[0];
            var value = args[1];
            var global;
            if (args.length > 2) {
                global = args[2];
            }
            YIUI.HeadInfos.put(key, value, global);
            return true;
        };

        funs.RemoveHeadInfo = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var global;
            if (args.length > 1) {
                global = args[1];
            }
            return YIUI.HeadInfos.remove(args[0], global);
        };

        funs.SetClusterID = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var clusterID = YIUI.TypeConvertor.toLong(args[0]);
            var params = {
                service: "HttpAuthenticate",
                cmd: "SetClusterID",
                clusterID: clusterID
            };
            new Svr.Request(cxt.form).getSyncData(Svr.SvrMgr.ServletURL, params, function (o) {
                    $.cookie("clusterid", o.clusterid);
            });
        };

        funs.SetOrderBy = function (name, cxt, args) {
            if(args.length < 2) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var tableKey = YIUI.TypeConvertor.toString(args[0]);
            var columnKey = YIUI.TypeConvertor.toString(args[1]);
            var asc = true;
            if (args.length > 2) {
                asc = YIUI.TypeConvertor.toBoolean(args[2]);
            }
            var filterMap = cxt.form.getFilterMap();
            filterMap.getTblFilter(tableKey).addOrderField(columnKey, asc);
        };

        funs.ClearOrderBy = function (name, cxt, args) {
            if(args.length < 1) {
                throw new YIUI.ViewException(YIUI.ViewException.UNEQUAL_PARAM_NUM,
                    YIUI.ViewException.formatMessage(YIUI.ViewException.UNEQUAL_PARAM_NUM, name));
            }
            var tableKey = YIUI.TypeConvertor.toString(args[0]);
            var filterMap = cxt.form.getFilterMap();
            filterMap.getTblFilter(tableKey).clearOrderField();
        };
    }
	
	// 打开指定菜单
	funs.OpenEntry = function (name, cxt, args) {
		console.log("OpenEntry()");
		// Input
		if (args.length < 1) 
			return false;
		var path = args[0].trim();
		if (path.length == 0)
			return false;
		console.log("Path = " + path);
		
		// open specified menu
		var pattern = "div#listBox > ul.tm li.tm-node[path='" + path + "'] > a";
		var menu = $(pattern);
		menu.dblclick();

		return true;
	}
	
	// 新窗口打开指定URL
	funs.hw_open_url = function (name, cxt, args) {
		console.log('hw_open_url()'); // alert('hw_open_url()');
		// Initialize
		if (0 == args.length) { // 没有参数
			return true;
		}
		url = ('' + args[0]).trim(); console.log('url:' + url);
		name = '';
		if (2 <= args.length) { // 有第二个参数
			name = ('' + args[1]).trim();
		}
				
		// Open
		window.open(url, name);
	};

	// 打开自定义对话框
	funs.hw_upload_file = function (name, cxt, args, callback) {
		console.log('hw_upload_file()');
		upload = new heelWeb.component.upload({
			type:'pic',
            multiple: false,
            on_close: (files) => {
                console.log(JSON.stringify(files));
                if (files.length <= 0) { // there's no files uploaded
                    console.log('No file uploaded.')
                    return;
                }
                
                let arguments = [];
                arguments.push(JSON.stringify(files));
                let attachments = funs.hw_invoke_service("AttachmentAdd", cxt, arguments);
                let attachment_list = JSON.parse(attachments);

                // 如果需要回调
                if (typeof callback == 'function') {
                    callback(attachment_list)
                }

            }
		});
		upload.show();
	};

    // 上传试题选项附件
	funs.hw_question_attachment = function (name, cxt, args) {
		console.log('hw_question_attachment()');
        console.log('args: ' + JSON.stringify(args));
        let question_id = '';
        let option_id = '';
        let grid_name = '';
        let row_num = '';

        if (!args || args.length < 4) {
            console.log('Need question id & option id & grid row number.');
            return;
        }

        question_id += args[0];
        option_id += args[1];
        grid_name += args[2];
        row_num += args[3];

        funs.hw_upload_file("hw_upload_file", cxt, args, (attachment_list)=>{
            console.log('Question attachment: ' + JSON.stringify(attachment_list));
            // Check
            if (attachment_list.length <= 0) {
                console.log('No attachment to be bound.');
                return;
            }

            // Get attachment information
            let arguments = [];
            arguments.push(''+ attachment_list[0]); // 问题选项只绑定一个文件
            let info = JSON.parse(funs.hw_invoke_service("AttachmentGetById", cxt, arguments));
            console.log('info=' + JSON.stringify(info));

            // Update interface
            if (typeof info.oid == 'number' && info.oid > 0) {
                funs.SetCellValue('SetCellValue', cxt, [grid_name, row_num, "PictureId", info.oid])
                funs.SetCellValue('SetCellValue', cxt, [grid_name, row_num, "Picture", info.filename])
                funs.SetCellValue('SetCellValue', cxt, [grid_name, row_num, "PictureUrl", info.url])
            }
        });
    };

	// 自定义，图片预览
	funs.hw_preview_pic = function (name, cxt, args) {
		console.log('hw_preview_pic()'); // alert('hw_preview_pic()');
		// Initialize
		if (args.length < 2) { // 没有足够参数
			return true;
		}
        let filename = '' + args[0]; console.log('filename=' + filename);
        let url = window.location + args[1]; console.log('url=' + url);

        heelWeb.component.preview_pic.show({
            file_name: filename, 
            url: url
        });
	};

    // 自定义，调用二开公式
	funs.hw_invoke_service = function (name, cxt, args) {
        let service_name = 'InvokeService';
        let api_name = name;

        // 组织参数
        let service_arguments = [];
        service_arguments.push(api_name);
        service_arguments.push(false);
        service_arguments.push(false);        
        if (args && args.length > 0) {
            // 要么两个参数，要么至少两个自定义参数，否则字符串会被错误解析
            service_arguments.push(api_name); // 额外添加的参数
            for (let i = 0; i < args.length; i++) {
                service_arguments.push(args[i]);
            }
        }

        // 调用二开公式
        let result = funs.InvokeService(service_name, cxt, service_arguments);

        return result;
    };
	
    return funs;
})();
// 注册表达式
Expr.regCluster(View.FuncMap, UI.BaseFuns);
