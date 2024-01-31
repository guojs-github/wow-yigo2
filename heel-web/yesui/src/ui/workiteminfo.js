(function () {
    YIUI.WorkitemInfo = function(options){
    	return $.extend({},{
    		// 用于构造界面操作的属性
    		/** 工作项编号 */
    		WorkitemID: -1,
    		/** 实例编号 */
    		InstanceID: -1,
    		/** 单据编号 */
    		OID: -1,
    		/** 嵌入节点的ID */
    		InlineNodeID: -1,
    		/** 节点的ID */
    		NodeID: -1,
    		/** 工作项状态*/
    		State: -1,
    		/** 驳回位置*/
    		BackSite: -1,
    		/** 驳回位置的可选操作员 */
    		BackSiteOpt:-1,
    		/** 重新计算参与者*/
    		KeepParts: false,
    		/** 表单的KEY */
    		FormKey: "",
    		/** 忽略表单状态*/
    		IgnoreFormState: false,
    		/** 工作项对应需要添加的界面操作 */
    		ItemList: [],
    		/** 当前工作项存在权限设置 */
    		ExistPerm: false,
    		/** 可用操作 */
    		OptList: [],
    		/** 可用组件 */
    		EnableList: [],
    		/** 不可见组件 */
    		UnVisibleList: [],
    		// 附件的信息
    		/** 附件的OID */
    		AttachmentOID: -1,
    		/** 附件的类型 */
    		AttachmentType: -1,
    		/** 附件的信息 */
    		AttachmentInfo: "",
    		/** 附件的打开参数 */
    		AttachmentPara: "",
    		/** 附件的打开参数 */
    		AttachmentKey: "",
    		/** 附件的操作类型 */
    		AttachmentOperateType: -1,
    		// 用于提交工作项的属性
    		AuditResult: -1,
    		UserInfo: "",
    		OperationKey: "",
    		NextOpStr: "",
    		Status: -1,
            SrcOperator: -1
    		
        },options);
    }
    	
    	
    	
})();