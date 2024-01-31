(function () {
    YIUI.FormAdapt = function (options) {
        var Return = {
            form: null,
            compList: {},
            cellMap: {},
            gridArray: [],
            cellSubDtlCompMap: {},
            LVArray: [],
            panelMap: [],
            rootPanel: null, 
            metaComps: {},
            defContainer: null,

            init: function (rootObj) {
                if (!rootObj) return;
                this.formID = this.form.formID;
                this.formKey = this.form.formKey;
                this.metaComps = this.form.metaComps;
                this.rootPanel = YIUI.create(rootObj);
            },

            load: function () {

                var _this = this,
                    orderList = [],
                    unOrderList = [],
                    radioHeadMap = {},
                    radioMap = {};

                var loadComp = function (array, com) {
                	if(com.ofFormID > 0) return;
                    com.ofFormID = _this.formID;
                    com.ofFormKey = _this.formKey;
                    com.id = com.ofFormID + "_" + com.key;
                    if (com.type == YIUI.CONTROLTYPE.LISTVIEW || com.type == YIUI.CONTROLTYPE.LISTLAYOUTVIEW) {
                        _this.loadListView(com);
                        YIUI.GridLookupUtil.buildCellLookup(_this.form,com);
                    } else if (com.type == YIUI.CONTROLTYPE.GRID) {
                        _this.loadGrid(com);
                        YIUI.GridLookupUtil.buildCellLookup(_this.form,com);
                    } else if (com.type == YIUI.CONTROLTYPE.RADIOBUTTON) {
                        if( com.isGroupHead ) {
                            radioHeadMap[com.groupKey] = com.key;
                        }
                        var radios = radioMap[com.groupKey];
                        if( !radios ) {
                            radios = [];
                            radioMap[com.groupKey] = radios;
                        }
                        radios.push(com);
                    } else if ( com.type == YIUI.CONTROLTYPE.CONTAINER ) {
                        if( com.mergeOperation ) {
                            _this.form.mergeOptContainer = com.key;
                        }
                        if( com.isDefault ) {
                            _this.form.defCtKey = com.key;
                        }
                    }
                    if (com.items && (com instanceof YIUI.Panel)) {
                        _this.panelMap[com.key] = com;
                        for (var i = 0; i < com.items.length; i++) {
                            loadComp(array, com.items[i]);
                        }
                    } else {
                        if (com.type == YIUI.CONTROLTYPE.TOOLBAR && com.isDefault ) {
                            _this.form.defaultToolBar = com;
                        }
                    }
                    array[com.key] = com;
                    com.setFocusManager(_this.focusManager);
                    if( com.receiveFocus ) {
                        if( $.isNumeric(com.order) && com.order != -1 ) {
                            orderList.push(com); // tabOrder不为-1的
                        } else {
                            unOrderList.push(com);// tabOrder为-1的
                        }
                    }
                    _this.metaComps[com.key] = com.getMetaObj();
                    var cellKey = com.bindingCellKey;
                    var p_gridKey = com.parentGridKey;
                    if (cellKey != null && p_gridKey != null) {
                        var gridMap = _this.cellSubDtlCompMap[p_gridKey];
                        if (gridMap == null) {
                            gridMap = {};
                            _this.cellSubDtlCompMap[p_gridKey] = gridMap;
                        }
                        if (gridMap[cellKey] == null) {
                            gridMap[cellKey] = [];
                        }
                        gridMap[cellKey].push(com);
                    }
                }

                var processRadios = function () {
                    var radios,radio,headKey;
                    for( var key in radioHeadMap ) {
                        if( radioHeadMap.hasOwnProperty(key) ) {
                            radios = radioMap[key];
                            headKey = radioHeadMap[key];
                            for( var i = 0,size = radios.length;i < size;i++ ) {
                                radios[i].headKey = headKey;
                            }
                        }
                    }
                }

                // 加载组件
                loadComp(this.compList, this.rootPanel);

                // 分配headKey
                processRadios();

                // 焦点初始化
                this.focusManager.process(orderList,unOrderList);
            },

            loadGrid: function (grid) {
                var gridInfo = {
                    key: grid.key,
                    tableKey: grid.tableKey
                };
                this.gridArray.push(gridInfo);
            },

            loadListView: function(listView) {
                var lvInfo = {
                    key: listView.key,
                    tableKey: listView.tableKey
                };
                this.LVArray.push(lvInfo);
            },

            addCellLocation: function (key, cellLocation) {
                this.cellMap[key] = cellLocation;
            },

            getCellLocation: function (key) {
                return this.cellMap[key];
            },

            getListView: function (arg) {
                var key,lv;
                if ($.isNumeric(arg)) {
                    var index = YIUI.TypeConvertor.toInt(arg),
                        lv = this.LVArray[index];
                    key = lv && lv.key;
                } else {
                    for (var i = 0;lv = this.LVArray[i]; i++) {
                        if (lv.tableKey == arg) {
                            key = lv.key;
                            break;
                        }
                    }
                }
                return key ? this.getComp(key) : null;
            },

            getGrid: function (arg) {
            	var key, grid;
            	if ($.isNumeric(arg)) {
            		var index = YIUI.TypeConvertor.toInt(arg),
            			grid = this.gridArray[index];
            		key = grid && grid.key;
            	} else {
            		for (var i = 0; grid = this.gridArray[i]; i++) {
            			if (grid.tableKey == arg) {
            				key = grid.key;
            				break;
            			}
            		}
            	}
            	return key ? this.getComp(key) : null;
            },

            getPanel: function (key) {
                return this.panelMap[key];
            },
            getCellSubDtlCompMap: function () {
                return this.cellSubDtlCompMap;
            },
            getGridArray: function () {
                return this.gridArray;
            },
            getLVArray: function () {
                return this.LVArray;
            },
            getCompList: function () {
                return this.compList;
            },
            getComp: function (comKey) {
                return this.compList[comKey];
            },
            getRoot: function () {
                return this.rootPanel;
            },
            setRootPanel: function (rootPanel) {
                this.rootPanel = rootPanel;
            },

            setCompValue: function (key, value, fireEvent) {
                var com = this.getComp(key);
                if ( !com  ) {
                    throw new YIUI.ViewException(YIUI.ViewException.NO_COMPONENT_KEY,
                            YIUI.ViewException.formatMessage(YIUI.ViewException.NO_COMPONENT_KEY, key));
                }
                com.setValue(value, true, fireEvent);
            },
            setCellValByIndex: function (key, rowIndex, colIndex, value, fireEvent) {
                var comp = this.getComp(key);
                var type = comp == undefined ? -1 : comp.type;
                switch (type) {
                case YIUI.CONTROLTYPE.LISTVIEW:
                case YIUI.CONTROLTYPE.LISTLAYOUTVIEW:
                    comp.setValByIndex(rowIndex, colIndex, value, fireEvent);
                    break;
                case YIUI.CONTROLTYPE.GRID:
                    comp.setValueAt(rowIndex, colIndex, value, true, fireEvent);
                    break;
                default:
                    throw new YIUI.ViewException(YIUI.ViewException.NO_CELL_CANNOT_SET_VALUE,
                        YIUI.ViewException.formatMessage(YIUI.ViewException.NO_CELL_CANNOT_SET_VALUE));
                }
            },
            getCellValByIndex: function (key, rowIndex, colIndex) {
                var comp = this.getComp(key);
                var type = comp == undefined ? -1 : comp.type, value;
                switch (type) {
                case YIUI.CONTROLTYPE.LISTVIEW:
                case YIUI.CONTROLTYPE.LISTLAYOUTVIEW:
                    value = comp.getValue(rowIndex, colIndex);
                    break;
                case YIUI.CONTROLTYPE.GRID:
                    value = comp.getValueAt(rowIndex, colIndex);
                    break;
                default:
                    throw new YIUI.ViewException(YIUI.ViewException.CANNNOT_GET_NO_CELL_VALUE,
                        YIUI.ViewException.formatMessage(YIUI.ViewException.CANNNOT_GET_NO_CELL_VALUE));
                }
                return value;
            },
            setCellValByKey: function (key, rowIndex, colKey, value, fireEvent) {
                var comp = this.getComp(key);
                var type = comp == undefined ? -1 : comp.type;
                switch (type) {
                case YIUI.CONTROLTYPE.LISTVIEW:
                case YIUI.CONTROLTYPE.LISTLAYOUTVIEW:
                    comp.setValByKey(rowIndex, colKey, value, fireEvent);
                    break;
                case YIUI.CONTROLTYPE.GRID:
                    comp.setValueByKey(rowIndex, colKey, value, true, fireEvent);
                    break;
                default:
                    throw new YIUI.ViewException(YIUI.ViewException.NO_CELL_CANNOT_SET_VALUE,
                        YIUI.ViewException.formatMessage(YIUI.ViewException.NO_CELL_CANNOT_SET_VALUE));
                }
            },
            getCellValByKey: function (key, rowIndex, colKey) {
                var comp = this.getComp(key);
                var type = comp == undefined ? -1 : comp.type, value;
                switch (type) {
                case YIUI.CONTROLTYPE.LISTVIEW:
                case YIUI.CONTROLTYPE.LISTLAYOUTVIEW:
                    value = comp.getValByKey(rowIndex, colKey);
                    break;
                case YIUI.CONTROLTYPE.GRID:
                    value = comp.getValueByKey(rowIndex, colKey);
                    break;
                default:
                    throw new YIUI.ViewException(YIUI.ViewException.CANNNOT_GET_NO_CELL_VALUE,
                        YIUI.ViewException.formatMessage(YIUI.ViewException.CANNNOT_GET_NO_CELL_VALUE));
                }
                return value;
            },
            setDefContainer: function (defContainer) {
                this.defContainer = defContainer;
            },
            getDefContainer: function (defCtKey) {
                if (defCtKey) {
                    return this.getComp(defCtKey);
                }
                return null;
            },
            setContainer: function (container) {
                this.container = container;
            },
            getContainer: function () {
                return this.container;
            },
            toJSON: function () {
                var jsonArr = [],
                    rootPanel = this.rootPanel;
                this.compToJson(rootPanel, jsonArr);
                return jsonArr;
            },
            compToJson: function (panel, comps) {
                var items = panel.items, item, comp;
                for (var i = 0, len = items.length; i < len; i++) {
                    item = items[i];
                    if (item instanceof YIUI.Panel) {
                        this.compToJson(item, comps);
                    } else if (!(item.type == YIUI.CONTROLTYPE.LISTVIEW || item.type == YIUI.CONTROLTYPE.LISTLAYOUTVIEW || item.type == YIUI.CONTROLTYPE.GRID)) {
                        comp = {};
                        comp.key = item.key;
                        if (item.type == YIUI.CONTROLTYPE.DATEPICKER) {
                            if (item.getValue()) {
                                comp.value = item.getValue().getTime();
                            } else {
                                comp.value = null;
                            }
                        } else {
                            comp.value = item.getValue();
                        }
                        comp.caption = item.caption;
                        comps.push(comp);
                    }
                }
            }
        };
        Return = $.extend(Return, options);
        Return.init(Return.rootObj);
        return Return;
    };
})();
