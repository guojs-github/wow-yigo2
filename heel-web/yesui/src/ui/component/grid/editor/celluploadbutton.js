/**
 * 表格单元格上传文件组件
 * @type {*}
 */
YIUI.CellEditor.CellUploadButton = YIUI.extend(YIUI.CellEditor, {
	 /** 允许上传的文件的类型, 用";"隔开*/
	allowedTypes: '',
    
	/** 上传文件的大小,-1表示无限制 */
    maxSize: -1,
    
    /**  是否覆盖已经存在的文件 **/
    deleteOld:false,
    
    /** 后台完成事件(定义的是一个Name, 通过Name
	 * 在Enhance的ExtAttachmentProcess中去取实现方法) **/
    postProcess: '',
    
    /** 前台完成事件 **/
    finishedEvent: '',
    
    /**  是多文件上传 （暂时没有处理）**/
    isMultiFile: false,
    
    /** 
	 *  绑定的表格标识，主要用于实现文件以下相关信息的展示
	 *  SystemField.UPLOAD_FILENAME,
	 *	SystemField.UPLOAD_PATH,
	 *  SystemField.UPLOAD_TIME,
	 *  SystemField.UPLOAD_OPERATOR 
	 **/
    tableKey: '',
    
    /**  表格当前行索引，主要用于实现文件以下相关信息（明细表当前行）的展示
	 *  SystemField.UPLOAD_FILENAME,
	 *	SystemField.UPLOAD_PATH,
	 *  SystemField.UPLOAD_TIME,
	 *  SystemField.UPLOAD_OPERATOR
	 *   **/
    rowIndex: -1,
	
    init: function (opt) {
        this.options = opt;
        this.allowedTypes = opt.Allowedtypes || this.allowedTypes;
        this.maxSize = opt.MaxSize || this.maxSize;
        this.deleteOld = opt.DeleteOld || this.deleteOld;
        this.postProcess = opt.PostProcess ||  this.postProcess;
        this.finishedEvent = $.isUndefined(opt.FinishedEvent) ? "" : opt.FinishedEvent.trim();
    },
    
    onRender: function (parent) {
    	this.base(parent);
    	var $this = this,
    		form = YIUI.FormStack.getForm($this.options.ofFormID);
        this.yesCom = new YIUI.Yes_UploadButton({
             el: $this.el,
             id: $this.options.id,
             enable: $this.options.enable,
             uploadFile: function($file){
             	var self = this;
             	var datas = {
             			file: $file,
             			tableKey: $this.options.tableKey,
             			rowIndex: $this.options.rowIndex,
             			fieldKey: $this.options.key,
             			maxSize: $this.maxSize,
             			allowedTypes: $this.allowedTypes,
             			finishedEvent: self.finishedEvent
                	};
             	YIUI.UploadButtonHandler.upload(form, datas);
             },
        });
        
        this.yesCom.el.addClass("ui-upload cellEditor");
	   $("span.txt", this.yesCom.el).css("line-height", parent.height()+"px");
    },
    
    getEl: function () {
        return this.yesCom.getEl();
    },
    setEnable: function (enable) {
        this.yesCom.setEnable(enable);
    },
    
    install: function () {
    }

});