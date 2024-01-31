/**
 * 界面逻辑处理
 * @author 陈瑞
 */
(function () {
    YIUI.UIProcess = function (form) {
        this.form = form;
        this.enableProcess = new YIUI.UIEnableProcess(form);
        this.visibleProcess = new YIUI.UIVisibleProcess(form);
        this.calcProcess = new YIUI.UICalcProcess(form);
        this.checkRuleProcess = new YIUI.UICheckRuleProcess(form);

        this.init = function () {
          this.calcProcess.calcTree = this.form.dependency.calcTree;
          this.enableProcess.enableTree = this.form.dependency.enableTree;
          this.visibleProcess.visibleTree = this.form.dependency.visibleTree;
          this.checkRuleProcess.checkRuleTree = this.form.dependency.checkRuleTree;
        }

        this.resetUIStatus = function (mask) {

            var start = Date.now();

            var calcEnable = (mask & YIUI.FormUIStatusMask.ENABLE) != 0;
            var calcVisible = (mask & YIUI.FormUIStatusMask.VISIBLE) != 0;
            var calcCheckRule = (mask & YIUI.FormUIStatusMask.CHECKRULE) != 0;
            var addOperation = (mask & YIUI.FormUIStatusMask.OPERATION) != 0;
            if (calcEnable) {
                this.enableProcess.calcAll();
            }
            if (calcVisible) {
                this.visibleProcess.calcAll();
            }
            if (calcCheckRule) {
                this.checkRuleProcess.calcAll();
            }
            if (addOperation) {
                this.addOperation();
            }

            var end = Date.now();

            console.log("UIProcess:" + (end -start) + "ms");
        };

        this.addOperation = function (defaultToolbar) {

            var toolbar = defaultToolbar || this.form.defaultToolBar;

            if(!toolbar || toolbar.isDestroyed)
                return;

            var container = this.form.getContainer();
            if( !container.mergeOperation ) {
                toolbar.items.length = 0;
            }

            var _this = this;

            function addOneOperation(toolbar,item) {
                if( !item.managed && !_this.form.hasOptRight(item.key) )
                    return;
                var cxt = new View.Context(_this.form),
                    visibleCnt = item.visibleCnt,
                    enableCnt = item.enableCnt;

                item.visible = visibleCnt ? _this.form.eval(visibleCnt, cxt, null) : true;
                item.enable = enableCnt ? _this.form.eval(enableCnt, cxt, null) : true;

                initRecorder(item);
                item.formID = _this.form.formID;
                toolbar.items.push(item);
            }

            function initRecorder(item) {
                var shortcuts = item.shortcuts;
                if( !shortcuts ) {
                    return;
                }
                var keys = shortcuts.split("+");
                var r = {},key;
                for( var i = 0,length = keys.length;i < length;i++ ) {
                    key = keys[i].trim().toLowerCase();
                    if( key ) {
                        switch ( key ){
                        case "shift":
                            r.shift = true;
                            break;
                        case "ctrl":
                            r.ctrl = true;
                            break;
                        case "alt":
                            r.alt = true;
                            break;
                        case "meta":
                            r.meta = true;
                            break;
                        default:
                            r.code = key;
                            break;
                        }
                    }
                }
                item.recorder = r;
            }

            function addOneMenuOperation(toolbar,item) {
                if( !_this.form.hasOptRight(item.key) )
                    return;
                if (!item.items)
                    return;
                var cxt = new View.Context(_this.form),
                    visibleCnt = item.visibleCnt,
                    enableCnt = item.enableCnt;

                item.visible = visibleCnt ? _this.form.eval(visibleCnt, cxt, null) : true;
                if( !item.selfDisable ) {
                    item.enable = enableCnt ? _this.form.eval(enableCnt, cxt, null) : true;
                }

                item.formID = _this.form.formID;

                var itemList = [],
                    _item;
                for (var m = 0;_item = item.items[m]; m++) {
                    if ( !_this.form.hasOptRight(_item.key)) {
                        //item.items.splice(m,1);
                        continue;
                    }

                    visibleCnt = _item.visibleCnt, enableCnt = _item.enableCnt;
                    _item.visible = visibleCnt ? _this.form.eval(visibleCnt, cxt, null) : true;
                    _item.enable = enableCnt ? _this.form.eval(enableCnt, cxt, null) : true;
                    _item.formID = _this.form.formID;
                    if(_item.expand){
                        var expandSource = _item.expandSource;
                        if(expandSource){
                            var source = _this.form.eval(expandSource, cxt, null);
                            var v = source.split(";");
                            var len = v.length;
                            for(var i = 0; i< len ; i ++){
                                var s = v[i].split(",");
                                if(s.length == 2){
                                    var tmp = $.extend({}, _item);
                                    tmp.tag = s[0];
                                    tmp.caption = s[1];
                                    tmp.expand = false;
                                    tmp.expandSource = null;
                                    itemList.push(tmp);  
                                }
                            }
                        }
                    }else{
                        itemList.push(_item); 
                    }
                }
                item.items = itemList;
                toolbar.items.push(item);
            }
            
            function replaceInplaceToolBar(item) {
                var instance = new YIUI.InplaceToolBar({tag: item.tag}),
                    opts = instance.replace(form, item),items = [];
                if( !opts )
                    return items;
                for (var n = 0, length = opts.length; n < length; n++) {
                    items.push({
                        type: YIUI.OPERATIONTYPE.OPERATION,
                        key: opts[n].key,
                        caption: opts[n].caption,
                        action: opts[n].action,
                        preAction: opts[n].preAction,
                        managed: true, // 受管理,有权限
                        enableCnt:opts[n].enable,
                        visibleCnt:opts[n].visible,
                        formID: item.formID
                    });
                }
                return items;
            }

            function addDefaultOperation(form,toolbar) {
                var item,i,len,m,size,items;
                for (i = 0, len = form.operations.length; i < len; i++) {
                    item = $.extend({}, form.operations[i]);
                    if( item.type == YIUI.OPERATIONTYPE.OPERATION ) {
                        if( item.tag ) {
                            items = replaceInplaceToolBar(item);
                            if( items != null && items.length > 0 ) {
                                for(m = 0,size = items.length;m < size;m++){
                                    addOneOperation(toolbar,items[m]);
                                }
                            }
                        } else {
                            addOneOperation(toolbar,item);
                        }
                    } else {
                        addOneMenuOperation(toolbar,item);
                    }
                }
                //处理合并 如果界面没有SHOW 在containershow的时候 加到父界面工具栏
                var mergeOptContainer = form.getMergeOptContainer();
                if( mergeOptContainer ) {
                    var ctn = form.getComponent(mergeOptContainer);
                    var activePane = ctn.getActivePane();
                    if( activePane && activePane.rendered) {
                        activePane.getUIProcess().addOperation(toolbar);
                    }
                }
            }

            addDefaultOperation(this.form,toolbar);

            if(toolbar.rendered) {
                toolbar.repaint();
            }
        };

        // 由postShow引起的计算值改变,不计算后续影响项
        this.postShow = false;

        this.doPostShowData = function () {
            this.postShow = true;
            this.calcProcess.calcAll();
            this.enableProcess.calcAll();
            this.visibleProcess.calcAll();
            this.checkRuleProcess.calcAll();
            YIUI.UIParaProcess.calcAll(this.form);
            this.postShow = false;
        };

        // 刷新所有表格
        // this.doRefreshGrid = function () {
        //   var gm = form.getGridArray(), grid;
        //   for( var i = 0,size = gm.length;i < size;i++ ) {
        //      grid = form.getComponent(gm[i].key);
        //      grid.refreshGrid();
        //   }
        // };

        // 刷新子明细表格
        // this.doRefreshSubGrid = function (gridKey) {
        //   var gm = form.getGridArray(), grid;
        //   for( var i = 0,size = gm.length;i < size;i++ ) {
        //     grid = form.getComponent(gm[i].key);
        //     if( YIUI.SubDetailUtil.isSubDetail(form,grid,gridKey) ) {
        //       grid.refreshGrid();
        //     }
        //   }
        // }

        this.doPreCellValueChanged = function (grid, rowIndex, colIndex, cellKey) {
            YIUI.UIDependencyProcess.cellValueChanged(form, grid, rowIndex, colIndex, cellKey);
        };
        this.doCellValueChanged = function (grid, rowIndex, colIndex, cellKey) {
            this.calcProcess.cellValueChanged(grid, rowIndex, colIndex, cellKey);
        };
        this.doPostCellValueChanged = function (grid, rowIndex, colIndex, cellKey) {
            if( this.postShow ) {
                return;
            }
            this.enableProcess.cellValueChanged(grid, rowIndex, colIndex, cellKey);
            this.visibleProcess.cellValueChanged(grid, rowIndex, colIndex, cellKey);
            this.checkRuleProcess.cellValueChanged(grid, rowIndex, colIndex, cellKey);
        };
        this.calcSubDetail = function (gridKey) {
            this.calcProcess.calcSubDetail(gridKey);
            this.enableProcess.calcSubDetail(gridKey);
            this.visibleProcess.calcSubDetail(gridKey);
            this.checkRuleProcess.calcSubDetail(gridKey);
        };
        this.doCalcOneRow = function (grid, rowIndex) {
            this.calcProcess.doCalcOneRow(grid, rowIndex);
            this.enableProcess.doCalcOneRow(grid, rowIndex);
            this.visibleProcess.doCalcOneRow(grid,rowIndex);
            this.checkRuleProcess.doCalcOneRow(grid, rowIndex);
            YIUI.UIDependencyProcess.doCalcOneRow(grid,rowIndex);
        };
        this.doPostDeleteRow = function (grid) {
            this.calcProcess.doAfterDeleteRow(grid);
            this.enableProcess.doAfterDeleteRow(grid);
            this.visibleProcess.doAfterDeleteRow(grid);
            this.checkRuleProcess.doAfterDeleteRow(grid);
        };
        this.resetComponentStatus = function (component) {
            this.calcProcess.reCalcComponent(component);
            this.enableProcess.reCalcComponent(component);
            this.visibleProcess.reCalcComponent(component);
            this.checkRuleProcess.reCalcComponent(component);
        };
        this.doPostClearAllRow = function (grid) {
            this.enableProcess.doAfterDeleteRow(grid, -1);
        };
        this.preFireValueChanged = function (component) {
            YIUI.UIDependencyProcess.valueChanged(this.form,component);
        };
        this.fireValueChanged = function (component) {
            this.calcProcess.valueChanged(component);
        };
        this.postFireValueChanged = function (component) {
            if( this.postShow ) {
                return;
            }
            this.enableProcess.valueChanged(component);
            this.visibleProcess.valueChanged(component);
            this.checkRuleProcess.valueChanged(component);
            YIUI.UIParaProcess.valueChanged(this.form,component);
        };

        this.refreshParas = function () {
            YIUI.UIParaProcess.calcAll(this.form);
        };
        this.doAfterRowChanged = function (component) {
            this.enableProcess.doAfterRowChanged(component);
            this.visibleProcess.doAfterRowChanged(component);
        };
        this.calcItems = function (items) {
            this.calcProcess.calcAllItems(items,true,false);
        };
        this.calcAll = function () {
            this.calcProcess.calcAll();
            this.enableProcess.calcAll();
            this.visibleProcess.calcAll();
            this.checkRuleProcess.calcAll();
        }
    };

})();