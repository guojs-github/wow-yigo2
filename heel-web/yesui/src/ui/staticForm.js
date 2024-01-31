YIUI.StaticForm = YIUI.extend({
    formID: -1,
    formKey: "",
    caption: "",
    container: "",
    document: null,
    parser: null,
    rootPanel: null,
    filterMap: null,
    conditionParas: null,
    init: function (option) {
    	this.formID = YIUI.Form_allocFormID();
        this.formKey = option.formKey;
        this.caption = option.caption;
        this.container = option.container;
        this.parser = new View.Parser(this);
        this.compList = [];
        this.uiProcess = new YIUI.UIProcess(this);
        YIUI.FormStack.addForm(this);
    },
    addComponent: function(comp) {
    	this.compList[comp.key] = comp;
    	
    },
    getcompList: function() {
    	return this.compList;
    },
    getComponent: function (key) {
    	return this.compList[key];
    },
    loadCellMap: function(array, parentCom) {
    	if(parentCom instanceof YIUI.Control.ListView) {
    		for (var i = 0, len = parentCom.columnInfo.length; i < len; i++) {
    			var columnInfo = parentCom.columnInfo[i];
    			columnInfo.tableKey = parentCom.tableKey;
    			this.addCellLocation(columnInfo.key, columnInfo);
    		}
    	} 
    },
    addCellLocation: function(key, cellLocation) {
    	if(this.cellMap[key]) {
    		this.cellMap[key].push(cellLocation);
    	} else {
    		this.cellMap[key] = new Array(cellLocation);
    	}
    },
    setDocument: function(document) {
    	this.document = document;
    },
    getDocument: function() {
    	return this.document;
    },
    setFormKey: function (formKey) {
        this.formKey = formKey;
    },
    getFormKey: function () {
        return this.formKey;
    },
    setCaption: function (caption) {
        this.caption = caption;
    },
    getCaption: function () {
        return this.caption;
    },
    setComponentValue: function(key, value){
    	this.getComponent(key).setValue(value);
    },
    getComponentValue: function(key){
    	return this.getComponent(key).getValue();
    },
    setRootPanel: function(rootPanel) {
    	this.rootPanel = rootPanel;
    },
    getRoot: function() {
    	return this.rootPanel;
    },
    setFilterMap: function(filterMap) {
    	this.filterMap = filterMap;
    },
    getFilterMap: function() {
    	return this.filterMap;
    },
    setConditionParas: function(conditionParas) {
    	this.conditionParas = conditionParas;
    },
    getConditionParas: function() {
    	return this.conditionParas;
    },
    resetUIStatus: function (mask) {
        this.uiProcess.resetUIStatus(mask);
    },
    getUIProcess: function () {
        return this.uiProcess;
    },
    eval: function(formula, context, callback) {
    	if(formula) {
    		return this.parser.eval(formula, context, callback);
    	}
    }
});
