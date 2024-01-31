/**
 * User: chenzs
 * Date: 14-2-14
 * Time: 下午2:58
 * 整个界面对象，包含所有信息
 */
YIUI.Form = YIUI.extend({
    init: function (metaForm, appEnv) {
        this.formID = YIUI.Form_allocFormID();
        this.metaForm = metaForm;
        this.setOperationState(metaForm.initState == YIUI.Form_OperationState.Edit ? metaForm.operationState : metaForm.initState);

        this.type = metaForm.type;
        this.operations = metaForm.operations;
        this.defTbr = metaForm.defTbr;
        this.formKey = metaForm.formKey;
        this.templateKey = metaForm.templateKey;
        this.caption = metaForm.caption;
        this.abbrCaption = metaForm.abbrCaption;
        this.formulaCaption = metaForm.formulaCaption;
        this.formulaAbbrCaption = metaForm.formulaAbbrCaption;
        this.target = metaForm.target;
        this.mainTableKey = metaForm.mainTableKey;
        this.onLoad = metaForm.onLoad;
        this.onClose = metaForm.onClose;
        this.confirmClose = metaForm.confirmClose;
        this.standalone = metaForm.standalone;
        this.relations = metaForm.relations;
        this.macroMap = metaForm.macroMap;
        this.statusItems = metaForm.statusItems;
        this.paraGroups = metaForm.paraGroups;
        this.sysExpVals = metaForm.sysExpVals;
        this.dependency = metaForm.dependency;
        this.paras = metaForm.paras;
        this.callParas = metaForm.callParas;
        this.paraCollection = metaForm.paraCollection;
        this.checkRules = metaForm.checkRules;
        this.subDetailInfo = metaForm.subDetailInfo;
        this.mapGrids = metaForm.mapGrids;
     //   this.errorInfo = metaForm.errorInfo;
        this.dataObjectKey = metaForm.dataObjectKey;
        this.postShow = metaForm.postShow;
        this.parser = new View.Parser(this);
        this.focusManager = new FocusPolicy(this);
        this.viewDataMonitor = new YIUI.ViewDataMonitor(this);
        this.result = null;
        this.useVariant = metaForm.useVariant;
        this.variant = metaForm.variant;
        this.eventList = {};
        this.error = {};
        this.timerTask = metaForm.timerTask;
        this.metaComps = metaForm.metaComps;
        this.buddyKeys = metaForm.buddyKeys || [];

        this.popWidth = metaForm.popWidth;
        this.popHeight = metaForm.popHeight;
        this.topMargin = metaForm.topMargin;
        this.bottomMargin = metaForm.bottomMargin;
        this.leftMargin = metaForm.leftMargin;
        this.rightMargin = metaForm.rightMargin;
        this.projectKey = metaForm.projectKey;
        this.appEnv = appEnv;

        var options = {
            form: this,
            rootObj: metaForm.root,
            focusManager:this.focusManager
        };

        this.mergeOptContainer = null;

        this.formAdapt = new YIUI.FormAdapt(options);
        this.formAdapt.load();

        var fm = new FilterMap();
        var map = this.formAdapt.LVArray.concat(this.formAdapt.gridArray);
        for (var i = 0, len = map.length; i < len; i++) {
            var key = map[i].key;
            var tableKey = map[i].tableKey;

            if( tableKey ){
                var comp = this.getComponent(key);
                var meta = comp.getMetaObj();

                if(meta.pageLoadType == YIUI.PageLoadType.DB) {
                    var tblDetail = new FilterMap.TableFilterDetail();
                    tblDetail.setTableKey(meta.tableKey);
                    tblDetail.setStartRow(0);
                    tblDetail.setMaxRows(meta.pageRowCount || 50);
                    tblDetail.setPageIndicatorCount(meta.pageIndicatorCount || 5);
                    fm.addTblDetail(tblDetail);
                }
            }

        }
        this.filterMap = fm;

        this.timerList = {};

        YIUI.FormStack.addForm(this);
    },

    isError:function () {
        return !$.isEmptyObject(this.error);
    },

    hasEnableRight:function (fieldKey) {
        return fieldKey && this.formRights && (this.formRights.allEnableRights || $.inArray(fieldKey,this.formRights.enableRights) == -1);
    },

    hasVisibleRight:function (fieldKey) {
        return fieldKey && this.formRights && (this.formRights.allVisibleRights || $.inArray(fieldKey,this.formRights.visibleRights) == -1);
    },

    hasOptRight:function (optKey) {
        return optKey && this.formRights && (this.formRights.allOptRights || $.inArray(optKey,this.formRights.optRights) != -1);
    },

    getMergeOptContainer: function () {
        return this.mergeOptContainer;
    },

    getCaption: function() {
        var caption = "";
        var formula = this.formulaCaption;
        if (formula) {
            var cxt = new View.Context(this);
            caption = this.eval(formula, cxt);
        }
        if (!caption && this.caption) {
            caption = this.caption;
        }
        return caption;
    },

    getAbbrCaption: function() {
        var abbr = "";
        var formula = this.formulaAbbrCaption;
        if (formula) {
            var cxt = new View.Context(this);
            abbr = this.eval(formula, cxt);
        }
        if (!abbr) {
            abbr = this.abbrCaption;
        }
        if (!abbr) {
            abbr = this.getCaption();
        }
        return abbr;
    },

    doOnLoad: function() {
        var onLoad = this.onLoad;
        if(onLoad) {
            var cxt = new View.Context(this);
            this.eval(onLoad, cxt);
        }

        return this.doOptQueue();
    },

    setOptQueue: function(optQueue) {
        this.optQueue = optQueue;
    },

    doOptQueue: function() {
        var optQueue = this.optQueue;
        if(optQueue) {
            return optQueue.doOpt();
        }
        return $.Deferred(function(def){
            def.resolve(false);
        });
    },

    setOperationEnable:function (key,enable) {
        if( !this.defaultToolBar || !this.hasOptRight(key) )
            return;
        this.defaultToolBar.setItemEnable(key,enable);
    },

    setOperationVisible:function (key,visible) {
        if( !this.defaultToolBar || !this.hasOptRight(key) )
            return;
        this.defaultToolBar.setItemVisible(key,visible);
    },

    getMetaComp: function(key) {
        return this.metaComps[key];
    },

    setOID: function(oid) {
        this.filterMap.setOID(oid);
    },

    getOID: function() {
        var document = this.getDocument();
        if(document) {
            return document.oid;
        } else {
            return this.filterMap.getOID();
        }
    },

    setSysExpVals: function(key, value) {
        if (!this.sysExpVals) {
            this.sysExpVals = {};
        }
        this.sysExpVals[key] = value;
    },

    getSysExpVals: function(key) {
        if (this.sysExpVals) {
            return this.sysExpVals[key];
        }
        return null;
    },

    removeSysExpVals: function (key) {
        if( this.sysExpVals ) {
            delete this.sysExpVals[key];
        }
    },

    isStandalone: function () {
        return this.standalone;
    },
    setResult: function (result) {
        this.result = result;
    },
    getResult: function () {
        return this.result;
    },

    getFormAdapt: function () {
        return this.formAdapt;
    },

    getErrorMsg: function() {
        return YIUI.UIUtil.getErrorMsg(this.error);
    },

    setError: function (error, errorMsg, errorSource) {
        var source = errorSource || this.formKey;
        if( error ) {
            this.error[source] = errorMsg;
        } else {
            delete this.error[source];
        }

        this.setErrorImpl();
    },

    setErrorImpl: function(){
        if ( !$.isEmptyObject(this.error) ) {
            this.showErrMsg(this.getErrorMsg());
        } else {
            this.hideErrMsg();
        }
    },

    getCellSubDtlComps: function (gridKey, cellKey) {
        var map = this.formAdapt.getCellSubDtlCompMap();
        if (map == null) return null;
        var gridMap = map[gridKey];
        if (gridMap == null) return null;
        return gridMap[cellKey];
    },
    getGridArray: function () {
        return this.formAdapt.getGridArray();
    },

    setFormCaption: function (caption) {
        this.getContainer().setFormCaption(caption)
    },
    getLVArray: function () {
        return this.formAdapt.getLVArray();
    },

    getListView: function (arg) {
        return this.formAdapt.getListView(arg);
    },

    getGrid: function (arg) {
    	return this.formAdapt.getGrid(arg);
    },

    setDefaultToolBar: function (toolBar) {
        this.defaultToolBar = toolBar;
    },

    getComponentList: function () {
        return this.formAdapt.getCompList();
    },
    getComponent: function (comKey) {
        return this.formAdapt.getComp(comKey);
    },
    getCompByDataBinding: function(tableKey,columnKey) {
        var compList = this.formAdapt.compList,com;
        for( var key in compList ){
            com = compList[key];
            if( com.tableKey === tableKey && com.columnKey === columnKey )
                return com;
        }
        return null;
    },
    getPanel: function (key) {
        return this.formAdapt.getPanel(key);
    },
    setFormKey: function (formKey) {
        this.formKey = formKey;
    },
    getFormKey: function () {
        return this.formKey;
    },
    setTemplateKey: function(templateKey) {
        this.templateKey = templateKey;
    },
    getTemplateKey: function() {
        return this.templateKey;
    },
    setCaption: function (caption) {
        this.caption = caption;
    },
    getDataObjectKey: function () {
        return this.dataObjectKey;
    },
    getDataObject: function(){
        return this.metaForm.dataObject;
    },
    getRoot: function () {
        return this.formAdapt.getRoot();
    },
    setDocument: function (document) {
        this.document = document;
    },
    getDocument: function () {
        return this.document;
    },

    showPreference: function (data) {
        if( !data ) {
            return;
        }
        var com,value;
        for( var key in data ) {
            if( data.hasOwnProperty(key) ) {
              com = this.getComponent(key),value = data[key];
              if( com && com.condition && com.condition.loadHistoryInput ) {
                com.setValue(value, false, false, true, false);
            }
          }
        }
    },

    showDocument: function () {

        var _this = this;
    
        if( !_this.impl_show ) {
          _this.impl_show = function () {
            var showData = new YIUI.ShowData(_this);
            showData.show();
    
            if( !_this.rendered ) {
              _this.render();
              _this.initTimerTask();
            }
    
            if( _this.metaForm.initFocus != false ) {
              _this.initFirstFocus();
            }
    
            var eventCB = _this.getEvent(YIUI.FormEvent.ShowDocument);
            if( eventCB ) {
              eventCB(YIUI.FormEvent.ShowDocument, _this);
            }
    
            if(_this.postShow) {
              var cxt = new View.Context(_this);
              _this.eval(_this.postShow, cxt);
            }
            YIUI.LoadingUtil.hide();
          }
        }
    
        // 每次更新权限数据
        var info = this.getSysExpVals(YIUI.BPMKeys.WORKITEM_INFO);
        var workitemID = -1;
        if( info ) {
          workitemID = info.WorkitemID;
          if( info.IgnoreFormState &&
            _this.getSysExpVals(YIUI.BPMConstants.WORKITEM_VIEW) == YIUI.BPMConstants.WORKITEM_VIEW )
            _this.setOperationState(YIUI.Form_OperationState.Edit);
        }
    
        var formKey = _this.metaForm.formKey;
    
        // 权限加载只带头表到中间层,整个document带过去,性能是有问题的!!
        var params = {
          formKey: formKey,
          OID: _this.getOID(),
          workitemID: workitemID,
          parameters: _this.getParas().toJSON(),
          document: $.toJSON(YIUI.DataUtil.toJSONDoc(_this.document,false,true))
        };
    
        // 加载权限在show之前做,不然计算前表格'会有闪烁'延迟
        var rightsDef = new YIUI.RightsService(this).loadFormRights(formKey,params);
    
        rightsDef.then(function (rights) {
          rights && _this.setFormRights(rights);
    
          !_this.isDestroyed && _this.impl_show();
        });
      },
      
    setWillShow: function(show) {
        this.show = show;
    },
    willShow: function() {
        return this.show;
    },
    setComponentValue: function (key, value, fireEvent) {
        this.formAdapt.setCompValue(key, value, fireEvent);
    },
    setCellValByIndex: function (key, rowIndex, colIndex, value, fireEvent) {
        this.formAdapt.setCellValByIndex(key, rowIndex, colIndex, value, fireEvent);
    },
    getCellValByIndex: function (key, rowIndex, colIndex) {
        return this.formAdapt.getCellValByIndex(key, rowIndex, colIndex);
    },
    setCellValByKey: function (key, rowIndex, colKey, value, fireEvent) {
        this.formAdapt.setCellValByKey(key, rowIndex, colKey, value, fireEvent);
    },
    getCellValByKey: function (key, rowIndex, colKey) {
        return this.formAdapt.getCellValByKey(key, rowIndex, colKey);
    },
    setCellBackColor: function (key, rowIndex, colIndex, color) {
        var comp = this.getComponent(key);
        var type = comp == undefined ? -1 : comp.type;
        switch (type) {
            case YIUI.CONTROLTYPE.GRID:
                comp.setCellBackColor(rowIndex, colIndex, color);
                break;
            default:
                break;
        }
    },
    setCellForeColor: function (key, rowIndex, colIndex, color) {
        var comp = this.getComponent(key);
        var type = comp == undefined ? -1 : comp.type;
        switch (type) {
            case YIUI.CONTROLTYPE.GRID:
                comp.setCellForeColor(rowIndex, colIndex, color);
                break;
            default:
                break;
        }
    },
    setFocusCell: function (key, rowIndex, colIndex) {
        var comp = this.getComponent(key);
        var type = comp == undefined ? -1 : comp.type;
        switch (type) {
            case YIUI.CONTROLTYPE.GRID:
                comp.setFocusCell(rowIndex, colIndex);
                break;
            default:
                break;
        }
    },

    getValue: function (key) {
        var com = this.getComponent(key);
        if( !com ) {
            throw new YIUI.ViewException(YIUI.ViewException.COMPONENT_NOT_EXISTS,
                YIUI.ViewException.formatMessage(YIUI.ViewException.COMPONENT_NOT_EXISTS, key));
        }
        return com.getValue();
    },

    getCellValue: function (key,row,column) {
        var com = this.getComponent(key);
        switch ( com.getMetaObj().type ) {
        case YIUI.CONTROLTYPE.GRID:
            return com.getValueAt(row,column);
        case YIUI.CONTROLTYPE.LISTVIEW:
            return com.getValue(row,column);
        }
        return null;
    },

    // 根据key获取值,可能是头控件或者单元格,cxt是unitcontext
    getValueByKey: function (key,cxt) {
        var loc = this.getCellLocation(key);
        if( loc ) {
            return this.getCellValue(loc.key,cxt.getRow(),loc.column);
        }
        return this.getValue(key);
    },

    getCellLocation: function (key) {
        return this.formAdapt.getCellLocation(key);
    },
    getColumnInfo: function (key) {
        return this.formAdapt.getColumnInfo(key);
    },
    setFilterMap: function (filterMap) {
        this.filterMap = filterMap;
    },
    getFilterMap: function () {
        return this.filterMap;
    },
    getMainTableKey: function () {
        return this.mainTableKey;
    },
    setCondParas: function (conParas) {
        this.conParas = conParas;
    },
    getCondParas: function () {
        return this.conParas == null ? {} : this.conParas;
    },
    setInitOperationState: function (initOperationState) {
        this.initOperationState = initOperationState;
    },
    getInitOperationState: function () {
        return this.initOperationState;
    },

    setOperationState: function (operationState) {
        this.operationState = operationState;
    },
    getOperationState: function () {
        return this.operationState;
    },
    resetUIStatus: function (mask) {
        this.getUIProcess().resetUIStatus(mask);
    },
    getUIProcess: function () {
        return this.viewDataMonitor.getUIProcess();
    },
    getViewDataMonitor:function(){
        return this.viewDataMonitor;
    },
    setDefContainer: function (defContainer) {
        this.formAdapt.setDefContainer(defContainer);
    },
    getDefContainer: function () {
        return this.formAdapt.getDefContainer(this.defCtKey);
    },
    setContainer: function (container) {
        this.formAdapt.setContainer(container);
    },
    render: function() {
        var self = this;
        var ct = self.getContainer();
        if( ct && ct.el ) {
            ct.renderDom(self);
            if(self.defCtKey) {
                var ct = self.getComponent(self.defCtKey);
                ct && self.setDefContainer(ct);
            }
            self.rendered = true;

            var errDiv = $('<div class="errorinfo"><label/><span class="closeIcon"></span></div>');
            var rootEl = self.getRoot().getEl();
            errDiv.prependTo(rootEl);
            self.setErrDiv(errDiv);
        }
    },
    reset: function () {
        this.error = {};
        this.setErrorImpl();
    },
    getContainer: function () {
        return this.formAdapt.getContainer();
    },
    newCxt: function () {
        return new View.Context(this);
    },
    setPara: function (key, value) {
        this.paras.put(key, value);
    },
    getPara: function (key) {
        return this.paras.get(key);
    },
    setCallPara: function (key, value) {
        this.callParas.put(key, value);
    },
    getCallPara: function (key) {
        return this.callParas.get(key);
    },
    getParaCollection: function () {
        return this.paraCollection;
    },
    getParas: function () {
        return this.paras;
    },
    getCallParas: function () {
        return this.callParas;
    },
    refreshParas: function () {
        return this.getUIProcess().refreshParas();
    },
    setErrDiv: function (errDiv) {
        this.errDiv = errDiv;
        var self = this;
        window.setTimeout(function () {
            !self.isDestroyed && self.setErrorImpl();
        }, 0);
    },
    showErrMsg: function (msg) {
        if (!this.errDiv) {
            return;
        }
        $("label", this.errDiv).text(msg);

        if( this.errDiv.is(":visible") ) {
            return; // 状态相同,不重新布局
        }

        this.errDiv.show();
        var ct = this.getContainer().el.children(".ui-tabs-body");
        if( ct.length == 0 ) {
            ct = this.getContainer().el;
        }
        var newH = ct.height() - this.errDiv.height();
        var newW = ct.width();
        this.getRoot().doLayout(newW, newH);
    },
    hideErrMsg: function () {
        if (!this.errDiv || !this.errDiv.is(":visible")) {
            return;
        }
        this.errDiv.hide();

        var ct = this.getContainer().el.children(".ui-tabs-body");
        if( ct.length == 0 ) {
            ct = this.getContainer().el;
        }
        var newH = ct.height();
        var newW = ct.width();
        this.getRoot().doLayout(newW, newH);
    },
    reloadTable: function (key) {
        var document = this.getDocument();
        var filterMap = this.getFilterMap();
        filterMap.setType(YIUI.DocumentType.DETAIL);
        var condParas = this.getCondParas();
        var paras = {};
        paras.service = "LoadFormData";
        paras.cmd = "";
        paras.tableKey = key;
        paras.formKey = this.formKey;
        paras.filterMap = $.toJSON(filterMap);
        paras.condParas = $.toJSON(condParas);
        var table = new Svr.Request(this).getSyncData(Svr.SvrMgr.ServletURL, paras);
        if (table) {
            document.remove(key);
            document.add(key, table);
        }
    },
    initFirstFocus: function () {
        var focusOwner = this.focusManager.focusOwner;
        if( focusOwner ) {
            focusOwner.focus();
        } else {
            this.focusManager.requestNextFocus();
        }
    },
    getParentForm: function () {
        return YIUI.FormStack.getForm(this.pFormID);
    },
    fireClose: function () {
        if (this.type != YIUI.Form_Type.Entity) {
            this.close();
            return true;
        }

        if (this.operationState == YIUI.Form_OperationState.Default || this.operationState == YIUI.Form_OperationState.Delete) {
            this.close();
            return true;
        }

        if (!this.confirmClose) {
        	this.close();
            return true;
        }

        var options = {
            msg: YIUI.I18N.getString("FORM_CLOSEINTERFACE","是否确定要关闭界面？"),
            msgType: YIUI.Dialog_MsgType.YES_NO
        };
        var dialog = new YIUI.Control.Dialog(options);
        dialog.render();
        var $form = this;
        dialog.regEvent(YIUI.Dialog_Btn.STR_YES, function () {
            $form.close();
        });
        dialog.regEvent(YIUI.Dialog_Btn.STR_NO, function () {
        });
    },
    close: function () {
        var onClose = this.onClose;
        if(onClose) {
            var cxt = new View.Context(this);
            this.eval(onClose, cxt);
        }

        var callback = this.getEvent(YIUI.FormEvent.Close);
        if (callback) {
            callback(YIUI.FormEvent.Close, this);
        }

        this.closeTimers();
        this.getContainer().removeForm(this);

        var pForm = this.getParentForm();// 模态窗口关闭,父界面获取焦点
        pForm && pForm.initFirstFocus();
    },
    eval: function (formula, context, callback) {
        if (formula) {
            //异步调用可能 form 已destory
            if(this.parser){
                return this.parser.eval(formula, context, callback);
            } else{
                console.error('form is destroyed ' + formula +'  formKey'+this.formKey);
            }
        }
        return null;
    },
    eval2: function(formula, syntaxTree, evalContext, scope) {
        if ( formula ) {
            return this.parser.eval2(formula, syntaxTree, evalContext, scope);
        }
        return null;
    },
    eval3: function (env, formula, cxt) {
        if( formula ) {
            return this.parser.eval3(env, formula, cxt);
        }
        return null;
    },
    evalByTree: function (tree, context, callback) {
        if (tree !== null && tree !== undefined) {
            return this.parser.evalByTree(tree, context, callback);
        }
        return null;
    },
    getSyntaxTree: function (script) {
        if (script.length == 0) {
            return null;
        } else {
            return this.parser.getSyntaxTree(script);
        }
    },
    toJSON: function () {
        var json = {};
        var jsonArr = this.formAdapt.toJSON();
        json.key = this.formKey;
        json.items = jsonArr;
        json.filterMap = this.getFilterMap();
        json.condParas = this.getCondParas();
        json.operationState = this.operationState;
        return $.toJSON(json);
    },
    destroy: function () {
        // this.uiProcess = null;
        this.parser = null;
        this.document = null;
        this.dependency = null;
        this.isDestroyed = true;
        YIUI.Print.del(this.formID);
    },

    regEvent: function (key, callback) {
        if (!this.eventList) {
            this.eventList = {};
        }
        this.eventList[key] = callback;
    },

    getEvent: function (key) {
        var event = null;
        if (this.eventList) {
            event = this.eventList[key]
        }
        return event;
    },

    removeEvent: function (key) {
        if (this.eventList) {
            delete this.eventList[key];
        }
    },

    getFocusManager: function () {
        return this.focusManager;
    },

    setFormDependency: function (depend) {
        this.dependency = depend;
    },

    setFormRights: function (rights){
        this.formRights = rights;
    },

    getFormRights: function (){
        return this.formRights;
    },

    getProjectKey: function(){
        return this.metaForm.projectKey
    },

    initTimerTask: function() {
        var timerTask = this.timerTask;
        if (timerTask != undefined || timerTask != null) {
            var newcxt = new View.Context(this);
            this.startTimers(newcxt, timerTask);
        }
    },
    startTimer: function(cxt, timerInfo, enable) {
        if(!this.timerList[timerInfo.key]) this.timerList[timerInfo.key] = {};
        var timer = this.timerList[timerInfo.key];
        if(timer.started) return;
        var form = this;
        timer.started = true;
        var _this = this;
        if (timerInfo.repeat) {
            setTimeout(function() {
                timer.id = setInterval(function() {
                    try {
                        form.eval(timerInfo.content, cxt, null);
                    } catch(err) {
                        clearInterval(timer.id);
                    }
                }, timerInfo.period);
            }, timerInfo.delay);
        } else {
            setTimeout(function() {
                form.eval(timerInfo.content, cxt, null);
            }, timerInfo.delay);
        }

    },

    startTimers: function(cxt, timerTask) {
        for(var key in timerTask) {
            var timer = timerTask[key];
            if(!timer.startOnload) continue;
            this.startTimer(cxt, timer);
        }
    },

    closeTimer: function(timerInfo) {
        var timer = this.timerList[timerInfo.key];
        if(!timer || !timer.started) return;
        if(!timer.id) {
            setTimeout(function() {
                clearInterval(timer.id);
            }, timerInfo.delay);
        } else {
            clearInterval(timer.id);
        }
        timer.started = false;
    },

    closeTimers: function() {
        var timerTask = this.timerTask;
        for(var key in timerTask) {
            var timerInfo = timerTask[key];
            this.closeTimer(timerInfo);
        }
    },

    getAppEnv: function() {
        return this.appEnv;
    },

    setAppEnv: function(env){
        this.appEnv = env;
    }
});

//自动生成formID
var formID = 1;
YIUI.Form_allocFormID = function () {
    return formID++;
};

YIUI.MetaForm = YIUI.extend({
    init: function (jsonObj) {
        this.operationState = jsonObj["operationState"] ? jsonObj["operationState"] : YIUI.Form_OperationState.Default;
        this.initState = jsonObj["initState"] || YIUI.Form_OperationState.Default;
        this.type = jsonObj["type"] || YIUI.Form_Type.Normal;
        this.operations = jsonObj["operations"];
        // this.metaOpts = jsonObj["metaOpts"];
        this.defTbr = jsonObj["defTbr"];
        this.formKey = jsonObj["key"];
        this.extend = jsonObj["extend"];
        this.caption = jsonObj["caption"];
        this.abbrCaption = jsonObj["abbrCaption"];
        this.formulaCaption = jsonObj["formulaCaption"];
        this.formulaAbbrCaption = jsonObj["formulaAbbrCaption"];
        this.target = jsonObj["target"];
        this.mainTableKey = jsonObj["mainTableKey"];
        this.onLoad = jsonObj["onLoad"];
        this.onClose = jsonObj["onClose"];
        this.scriptCollection = jsonObj["scriptCollection"];
        this.cellTypeGroup = jsonObj["cellTypeGroup"];

        this.templateKey = jsonObj["templateKey"];
        var body = jsonObj["body"];
        var indexOfblock = body["index_of_block"];
        var block = body["items"][indexOfblock];

        var root = block["root"];
        root.topMargin = jsonObj["topMargin"];
        root.bottomMargin = jsonObj["bottomMargin"];
        root.leftMargin = jsonObj["leftMargin"];
        root.rightMargin = jsonObj["rightMargin"];
        root.abbrCaption = jsonObj["abbrCaption"];
        root.hAlign = jsonObj["hAlign"];
        root.height = "100%";
        this.root = root;
        this.authenticate = jsonObj["authenticate"];
        this.standalone = jsonObj["standalone"] || false;
        this.initFocus = jsonObj["initFocus"];
        this.confirmClose = jsonObj["confirmClose"];
        this.relations = jsonObj["relations"];
        this.macroMap = jsonObj["macroMap"];
        this.statusItems = jsonObj["statusItems"];
        this.paraGroups = jsonObj["paraGroups"];
        this.sysExpVals = jsonObj["sysExpVals"];
        this.dependency = jsonObj["dependency"];
        this.paras = new YIUI.Paras(jsonObj["parameters"]);
        this.callParas = new YIUI.Paras(jsonObj["callParameters"]);
        this.paraCollection = jsonObj["paraCollection"];
        this.checkRules = jsonObj["checkRules"];
        this.subDetailInfo = jsonObj["subDetailInfo"];
        this.mapGrids = jsonObj["mapGrids"];
       // this.errorInfo = {error: jsonObj["isError"], errorMsg: jsonObj["errorMsg"], errorSource: jsonObj["errorSource"]};
        this.dataObject = jsonObj["dataObject"] || {};
        this.dataObjectKey = this.dataObject.key || null;
        this.postShow = jsonObj["postShow"] || null;
        this.timerTask = jsonObj["timerTask"];
        this.metaComps = jsonObj["metaComps"] || {};
        this.buddyKeys = jsonObj["buddyKeys"] || [];

        this.popWidth = jsonObj["popWidth"];
        this.popHeight = jsonObj["popHeight"];
        this.topMargin = jsonObj["topMargin"];
        this.bottomMargin = jsonObj["bottomMargin"];
        this.leftMargin = jsonObj["leftMargin"];
        this.rightMargin = jsonObj["rightMargin"];
        this.projectKey = jsonObj["projectKey"];
        this.variant = jsonObj["variant"]
        this.useVariant = jsonObj["useVariant"];
    },

    getComponent: function(key) {
        return this.metaComps[key];
    }
});