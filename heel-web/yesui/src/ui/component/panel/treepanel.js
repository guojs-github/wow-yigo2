/**
 *treepanel中显示CHECKBOX时，的选择模式
 *YIUI.TREEPANEL_CKBOXTYPE_NORMAL_SELECT ：当父节点选中时，子节点选中， 反之也是
 *YIUI.TREEPANEL_CKBOXTYPE_SINGLE_SELECT ：父节点和子节点独立， 互不影响
 */
YIUI.TREEPANEL_CKBOXTYPE_NORMAL_SELECT = {"Y":"ps","N":"ps"};

YIUI.TREEPANEL_CKBOXTYPE_SINGLE_SELECT = {"Y":"","N":""};

/**
 *树控件，封装zTree控件的接口， treeMenu为真实的树。
 */
YIUI.TreePanel = YIUI.extend(YIUI.Panel, {
	//是否显示节点图标
	showIcon: true,

	//是否显示节点连线
	showLine: true,
	
	//宽度
	width : null,
	
	//高度
	height : null,
	
	//显示复选框
    showCheckBox : false,
	
	//复选框的选择模式   勾选时父子关联， 勾选时 父子不关联
	checkBoxType : YIUI.TREEPANEL_CKBOXTYPE_NORMAL_SELECT,
	
	//双击展开节点
    dblClickExpand : true,
	
	//树的数据
	dataSource : null,

    tree : null,

    addDiyDom : null,

    async :{
        autoParam : [],
        dataFilter : null,
        enable : false,
        otherParam:[],
        type : "post",
        url : ""
    },
    callback : {
        beforeAsync:null,
        beforeClick:null,
        beforeDblClick:null,
        beforeRightClick:null,
        beforeMouseDown:null,
        beforeMouseUp:null,
        beforeExpand:null,
        beforeCollapse:null,
        beforeRemove:null,

        onAsyncError:null,
        onAsyncSuccess:null,
        onNodeCreated:null,
        onClick:null,
        onDblClick:null,
        onRightClick:null,
        onMouseDown:null,
        onMouseUp:null,
        onExpand:null,
        onCollapse:null,
        onRemove:null
    } ,
	initEvert: function(){
		
	},		
			
    init: function (options) {
    	this.base(options);
    },

    onRender: function (ct) {
 		this.base(ct);

        this.el.addClass("ztree");

 		var setting = {
            check: {
                enable: this.showCheckBox,
                chkboxType: this.checkBoxType
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            view: {
				showLine: this.showLine,
                showIcon: this.showIcon,
				selectedMulti: false,
				dblClickExpand: this.dblClickExpand ,
                addDiyDom : this.addDiyDom
			},
            callback : this.callback,
            async : this.async
		};
		
 		$.fn.zTree.init(this.el, setting, this.dataSource);
        this.tree = $.fn.zTree.getZTreeObj(this.id);
    },

    /**
     * 展开/折叠指定节点
     * @param node 节点数据
     * @param expandFlag true 展开 false 折叠
     * @param sonSign true 影响和所有子孙节点， false 当前节点
     * @param focus true 设置焦点
     * @param callbackFlag 是否调用回调函数
     * @returns {*} true 展开 false 折叠
     */
    expandNode: function(node, expandFlag, sonSign, focus, callbackFlag) {
    	return this.tree.expandNode(node, expandFlag, sonSign, focus, callbackFlag);
    },

	/**
	 * 选中指定节点
	 * @param node 节点数据
	 * @param addFlag 当多选的时候 是否 同时被选中，即 如果有001节点被选择， 调用方法选中002 当为true 时 001 002 节点都被选中。
	 */
    selectNode : function(node, addFlag) {
    	this.tree.selectNode(node,addFlag);
    },

	/**
	 * 获取所有的节点数据
	 */
    getNodes : function() {
    	return this.tree.getNodes()
    },

    /**
     * 获取打勾或不打勾的节点
     * @param checked
     * @returns {*}
     */
    getCheckedNodes : function(checked){
    	return this.tree.getCheckedNodes(checked);
    }
});
YIUI.reg('treepanel', YIUI.TreePanel);