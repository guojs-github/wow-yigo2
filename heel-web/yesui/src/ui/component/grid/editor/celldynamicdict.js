/**
 * 表格单元格字典编辑器
 * @type {*}
 */
YIUI.CellEditor.CellDynamicDict = YIUI.extend(YIUI.CellEditor.CellDict, {

    getItemKey: function(){
        // 可在依赖变化时算
        if(!this.itemKey){
        	var formID = this.ofFormID;
        	var form = YIUI.FormStack.getForm(formID);
        	this.itemKey = this.handler.getItemKey(form, this.metaObj.refKey);
        }
    
        return this.itemKey;
    }
});