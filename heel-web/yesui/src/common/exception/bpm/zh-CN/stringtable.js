(function () {
			
	var obj = {
		NoDefineNodeType: "未定义的节点类型{1}！",
		ParticipatorError: "节点{1}参与者数量为0！",
		DelegateRightError: "当前用户不是管理员，不能修改其他操作员的代理数据！",
		CommitRightError: "当前用户不可提交工作项！",
		InstanceStarted: "流程已启动",
		WorkitemDataTimeout: "工作项已被提交",
		NoActiveWorkitem: "当前环境没有可用的工作项",
		NoMApData: "映射节点{1}的中间层自动映射没有可映射数据",
		NoProcessDefination: "需求启动的流程{1}不存在或未部署",
		NoBindingProcess: "当前表单{1}和数据对象{2}均不存在绑定流程",
		NoDynamicBindingProcess: "当前表单的动态绑定流程{1}不存在或未部署",
		NoProcessDefinationVerID: "流程{1}的版本{2}的定义不存在",
		NoInstanceData: "流程数据缺失",
		DelegateMissSrc: "当前代理未设置源操作员",
		DelegateMissTgt: "当前代理未设置目标操作员",
		NoNodeExist: "编号为{1}的节点在流程{2}定义中不存在",
		NoBPMContext: "当前上下文不包含流程信息，无法执行公式{1}",
		RollbackError: "撤销失败，数据已超时",
		NoStandardForm: "标准审批对话框“WorkflowAudit”未定义",
		NoForm: "缺少表单参数",
		NoPath: "节点“{1}”没有可用路径!",
		MissAttachment: "编号{1}的表单的流程，主键为{2}的附件尚未注册！",
		StartInstance: "启动流程",
		CommitWorkItem: "提交工作项",
		RevocateCommited: "撤销已提交审批",
		StartTimeBeforeEndTime: "无效的起止时间",
		InstancePaused: "流程已经暂停",
		CommitError: "工作项当前状态({1})无法提交。",
		CommitNOBacksite: "驳回位置不可用！",
		CommitNOBacksiteOpt: "未找到驳回位置操作员的工作项！",
		TransitTo: "直送",
		OutOfParticipators: "操作员{1}不在候选操作员列表中。",
		CommitNoTransitTo: "直送工作项没有可用直送位置。",
		ParticipatorsCaclError: "节点:{1},参与者计算错误。",
		DistributeNotSupport: "普通模式下不支持分配或抢占操作"
	};
	
	if(YIUI.StringTable.BPM) {
		YIUI.StringTable.BPM = $.extend(YIUI.StringTable.BPM, obj);
	} else {
		YIUI.StringTable.BPM = $.extend(YIUI.StringTable, obj);
	}
})();
	
		