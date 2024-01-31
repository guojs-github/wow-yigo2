/**
 * 表格单元格多行文本框编辑器
 * @type {*}
 */
 YIUI.CellEditor.CellTextArea = YIUI.extend(YIUI.CellEditor,{
 	yesCom: null,
    maxLength: 10000,
 	
 	init: function(opt){
 		this.options = opt;
 		if (opt.maxLength!=null) {
 			this.maxLength = opt.maxLength;
 		}
 		this.selectOnFocus = opt.selectOnFocus; 
 	},
 	onRender: function(parent){
 		var self = this;
 		this.yesCom = new YIUI.Yes_TextArea({
 			selectOnFocus:self.selectOnFocus,
 			maxLength:self.maxLength,
 			commitValue: function(value){
                 self.saveCell(value);
            }
 		});
 		this.yesCom._input.val(this.options.value).attr('enable', this.options.enable);
		this.yesCom.getEl().addClass("ui-txta cellEditor");
 	},
 	setBorder:function(width){
 		this.yesCom._input.css("border",width);
 	},
 	setResize:function(size){
 		this.yesCom._input.css("resize",size);
 	},
 	getEl:function(){
 		return this.yesCom._input;
 	},
    install: function () {
        this.base();
        var $this = this;
        var editor = this.yesCom._input;
        editor.mousedown(function(e){
        	editor.attr("readonly","readonly");
        	if ($(this).attr('enable')==='true') {
        		editor.removeAttr("readonly");
        	}
        });
        editor.click(function(e){
        	editor.attr("readonly","readonly");
        	if ($(this).attr('enable')==='true') {
        		editor.removeAttr("readonly");
        	}
        	window.setTimeout(function(){
        		editor.focus();
        	},0);
        	return false;

        });

    }
 });