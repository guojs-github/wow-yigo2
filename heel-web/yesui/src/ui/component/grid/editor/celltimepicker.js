YIUI.CellEditor.CellTimePicker = YIUI.extend(YIUI.CellEditor, {
	isSecond : false,
	
	init: function(opt){
		this.id = opt.id;
		var meta = opt.editOptions;
        this.isSecond = $.isUndefined(meta.second) ? this.isSecond : meta.second;
	},
	
	onRender : function(parent){
		this.base(parent);
		var _this = this;
		this.yesCom = new YIUI.Yes_TimePicker({
	            id:_this.id,
	            isSecond: _this.isSecond,
	            commitValue: function(value) {
	                _this.saveCell(value, true, true);
	            },
	            
	            doFocusOut: function(){
	                return _this.doFocusOut();
	            }

	     });
		 this.yesCom.getEl().addClass("ui-tp");
	     this.yesCom.setWidth(parent.width());
	     this.yesCom.setHeight(parent.height());
	},
	
	setValue : function(value){
		this.yesCom.setValue(value);
	},
	
	getValue: function () {
        return this.yesCom.getValue();
    },
    
	focus : function(){
		this.yesCom.focus();
	},
	
	getDropBtn: function(){
		return this.yesCom.getBtn();
	},
	
	getDropView: function(){
		return this.yesCom.getDropView();
	},
	
	getInput: function () {
        return this.yesCom.getInput();
    },
	
	beforeDestroy: function(){
		this.yesCom.getDropView().remove();
	},
	
	setText: function(text){
		this.yesCom.setText(text);
	},
	
	getText: function(){
		return this.yesCom.getInput().val();
	},
	
	install: function(){
		
	}
});