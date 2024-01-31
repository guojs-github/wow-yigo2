YIUI.BPMService = (function () {

	function _BPMService(f){
		this.form = f;
		this.request = new Svr.Request(f);
	}


	/**
	 * 关闭流程
	 */
	_BPMService.prototype.killInstance = function(form, instanceID, userinfo) {
        var params = {
    		service: "BPM",
    		cmd: "KillInstance",
    		instanceID: instanceID,
    		userInfo: userinfo
        };

        form.refreshParas();
    	var parameters = form.getParas();
    	if(parameters){
			params.parameters = parameters.toJSON();
		}

        return this.request.getData(params);
    };

    /**
	 * 重启流程
	 */
	_BPMService.prototype.restartInstance = function(instanceID) {
		this.form.refreshParas();
        var paras = this.form.getParas();
        var params = {
    		service: "BPM",
    		cmd: "RestartInstance",
    		parameters: paras.toJSON(),
    		instanceID: instanceID
        };

        return this.request.getData(params);
    };

	/**
	 * 召回一个流程
	 */
	_BPMService.prototype.recallInstance = function(instanceID, userinfo) {
        var params = {
    		service: "BPM",
    		cmd: "RecallInstance",
    		instanceID: instanceID,
    		userInfo: userinfo
        };

        return this.request.getData(params);
    };

   	/**
	 * 召回一个流程
	 */
	_BPMService.prototype.recallInstanceByOID = function(oid, userinfo) {
        var params = {
    		service: "BPM",
    		cmd: "RecallInstance",
    		OID: oid,
    		userInfo: userinfo
        };

        return this.request.getData(params);
    };

   	/**
	 * 启动流程
	 */
    _BPMService.prototype.startInstance = function(formKey, oid , processKey, formDoc) {
    	var doc = YIUI.DataUtil.toJSONDoc(formDoc);
    	this.form.refreshParas();
        var paras = this.form.getParas();
        var params = {
    		service: "BPM",
    		cmd: "StartInstance",
    		parameters: paras.toJSON(),
    		formKey: formKey,
    		oid: oid,
    		processKey: processKey,
    		document:  $.toJSON(doc)
        };

        return this.request.getData(params);
    };
    
	/**
	 * 重新绑定流程
	 */
    _BPMService.prototype.rebindInstance = function(formKey, oid , processKey, formDoc) {
    	var doc = YIUI.DataUtil.toJSONDoc(formDoc);
        var params = {
    		service: "BPM",
    		cmd: "RebindInstance",
    		formKey: formKey,
    		oid: oid,
    		processKey: processKey,
    		document:  $.toJSON(doc)
        };

        return this.request.getData(params);
    };

   	/**
	 * 重启流程
	 */
    _BPMService.prototype.restartInstanceByOID = function(oid) {
        var params = {
    		service: "BPM",
    		cmd: "RestartInstanceByOID",
    		OID: oid
        };

        return this.request.getData(params);
    };

	/**
	 * 单据对应的流程是否启动
	 */
	_BPMService.prototype.isInstanceStarted = function(oid) {
        var params = {
    		service: "BPM",
    		cmd: "IsInstanceStarted",
    		OID: oid
        };
        return this.request.getSyncData(Svr.SvrMgr.ServletURL, params);
        //return Svr.Request.getData(params);
    };

    /**
	 * 结束一个流程实例
	 */
	_BPMService.prototype.endInstance = function(form, instanceID, userinfo) {
        var params = {
    		service: "BPM",
    		cmd: "EndInstance",
    		instanceID: instanceID,
    		userInfo: userinfo
        };

        form.refreshParas();
    	var parameters = form.getParas();
    	if(parameters){
			params.parameters = parameters.toJSON();
		}
        return this.request.getData(params);
    };

	/**
	 * 批量加签：指的是同时对多人进行加签，并可指定同时或者按顺序执行，默认同时执行。参数【workitemID,operatorList,launchInfo,inOrder】
	 * <ul>
	 * <li> workitemID: 工作项ID
	 * <li> operatorList: 被加签操作员ID集合,支持的参数类型：
	 * <ol>
	 * <li>集合类型，如ArrayList,大多使用于多选字典的值 
	 * <li>以逗号“,”分隔的字符串，如{1,2,3}或“1,2,3”
	 * <li>Long类型，此时指的是单个操作员
	 * </ol>
	 * <li> launchInfo: 加签发起人的意见
	 * <li> inOrder: 可选参数 ，是否顺序执行，默认为false
	 * </ul>
	 * @author wbh
	 *
	 */
	_BPMService.prototype.batchEndorseTask = function(wid, ppObject, launchInfo, inOrder, hide) {
        var params = {
    		service: "BPMExtend",
    		cmd: "BatchEndorseTask",
    		WorkitemID: wid,
    		PPObject: $.toJSON(ppObject.toJSON()),
    		LaunchInfo: launchInfo,
    		InOrder: inOrder,
    		Hide: hide
        };

        return this.request.getData(params);
    };

   	/**
	 * 暂停一个流程实例
	 */
	_BPMService.prototype.pauseInstance = function(form, instanceID, userinfo) {
        var params = {
    		service: "BPM",
    		cmd: "PauseInstance",
    		instanceID: instanceID,
    		userInfo: userinfo
        };

        form.refreshParas();
    	var parameters = form.getParas();
    	if(parameters){
			params.parameters = parameters.toJSON();
		}

        return this.request.getData(params);
    };

    /**
	 * 取消暂停一个流程实例
	 */
	_BPMService.prototype.resume = function(form, instanceID, userinfo) {
        var params = {
    		service: "BPM",
    		cmd: "Resume",
    		instanceID: instanceID,
    		userInfo: userinfo
        };

        form.refreshParas();
    	var parameters = form.getParas();
    	if(parameters){
			params.parameters = parameters.toJSON();
		}

        return this.request.getData(params);
    };

    /**
	 * 提交一个工作项
	 */
	_BPMService.prototype.commitWorkitem = function(workitemInfo, formDoc) {
    	var doc = YIUI.DataUtil.toJSONDoc(formDoc);
        var params = {
    		service: "BPM",
    		cmd: "CommitWorkitem",
    		workitemInfo: $.toJSON(workitemInfo),
    		document:  $.toJSON(doc)
        };

        return this.request.getData(params);
    };

   	/**
	 * 查询一个工作项
	 */
	_BPMService.prototype.loadWorkitemInfo = function(workitemID) {
        var params = {
    		service: "BPM",
    		cmd: "LoadWorkitemInfo",
    		workitemID: workitemID
        };

        return this.request.getData(params);
    };

    /**
	 * 批量提交工作项
	 */
	_BPMService.prototype.batchCommitWorkitem = function(oids, result, userInfo) {
        var params = {
    		service: "BPM",
    		cmd: "BatchCommitWorkitem",
    		OIDListStr: $.toJSON(oids),
    		binaryResult: result,
    		userInfo: userInfo
        };

        return this.request.getData(params);
    };

    /**
	 * 批量提交工作项
	 */
	_BPMService.prototype.batchCommitWorkitemByWID = function(wids, result, userInfo) {
        var params = {
    		service: "BPM",
    		cmd: "BatchCommitWorkitemByWID",
    		WIDListStr:$.toJSON(wids),
    		binaryResult: result,
    		userInfo: userInfo
        };

        return this.request.getData(params);
    };

    /**
	 * 是否转办
     */
    _BPMService.prototype.isTransit = function (WorkitemID) {
        var params = {
			service:"BPM",
			cmd: "IsTransit",
			workitemID: WorkitemID
        };

        return this.request.getData(params);
    };
        
    _BPMService.prototype.revokeWorkitem = function(workitemID, userInfo){
    	var params = {
	    		service: "BPM",
	    		cmd: "RevokeWorkitem",
	    		workitemID: workitemID,
	    		userInfo: userInfo
	        };

            return this.request.getData(params);
    };

    /**
	 * 回滚
	 */
	_BPMService.prototype.rollbackToWorkitem = function(workitemID, logicCheck) {
        var params = {
    		service: "BPM",
    		cmd: "RollbackToWorkitem",
    		workitemID: workitemID,
    		logicCheck: logicCheck
        };

        return this.request.getData(params);
    };	 
	    
	_BPMService.prototype.forcibleMove = function(instanceID, srcNode, tgtNode) {
        var params = {
    		service: "BPM",
    		cmd: "ForcibleMove",
    		instanceID: instanceID,
    		sourceNode: srcNode,
    		targetNode: tgtNode
        };

        return this.request.getData(params);
    };

    /**
	 * 在叙事薄界面为勾选的若个单据，进行批量审批
	 */
	_BPMService.prototype.batchStateAction = function(processKey, actionNodeKey, oids, result, userInfo) {
        var params = {
    		service: "BPM",
    		cmd: "BatchStateAction",
    		OIDListStr: $.toJSON(oids),
    		processKey: processKey,
    		binaryResult: result,
    		userInfo: userInfo,
    		actionNodeKey: actionNodeKey
        };

        return this.request.getData(params);
    };	 

   	/**
	 * 添加代理
	 */
	_BPMService.prototype.addDelegateData = function(delegateType, srcOperatorID, tgtOperatorID, objectType, objectKey, nodeKey, startTime, endTime, alwaysValid,userInfo) {
        var params = {
    		service: "BPM",
    		cmd: "AddDelegateData",
    		delegateType: delegateType,
    		srcOperatorID: srcOperatorID,
    		tgtOperatorID: tgtOperatorID,
    		objectType: objectType,
    		objectKey: objectKey,
    		nodeKey: nodeKey,
    		startTime: startTime.getTime(),
    		endTime: endTime.getTime(),
    		alwaysValid: alwaysValid,
    		userInfo: userInfo
        };

        //return Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, params);
        return this.request.getData(params);
    };

   	/**
	 * 删除代理
	 */
	_BPMService.prototype.deleteDelegateData = function(delegateID,userInfo) {
        var params = {
    		service: "BPM",
    		cmd: "DeleteDelegateData",
    		delegateID: delegateID,
    		userInfo: userInfo
        };

        return this.request.getData(params);
    };

   	/**
	 * 修改代理
	 */
	_BPMService.prototype.updateDelegateDataState = function(delegateID, onUse) {
        var params = {
    		service: "BPM",
    		cmd: "UpdateDelegateDataState",
    		delegateID: delegateID,
    		onUse: onUse
        };

        return this.request.getSyncData(Svr.SvrMgr.ServletURL, params);
    };

    /**
	 * 注册附件
	 */
	_BPMService.prototype.registerAttachment = function(oid, key, attachmentOID, attachmentInfo, attachmentPara) {
        var params = {
    		service: "BPM",
    		cmd: "RegisterAttachment",
    		OID: oid,
    		Key: key,
    		AttachmentOID: attachmentOID,
    		AttachmentInfo: attachmentInfo,
    		AttachmentPara: attachmentPara
        };
		return this.request.getSyncData(Svr.SvrMgr.ServletURL, params);
        //return Svr.Request.getData(params);
    };

    /**
	 * 生成当前流程运转路径
	 */
	_BPMService.prototype.loadProcessPath = function(oid) {
        var params = {
    		service: "BPMDefService",
    		cmd: "LoadProcessPath",
    		OID: oid
        };
		return this.request.getSyncData(Svr.SvrMgr.ServletURL, params);
        //return Svr.Request.getData(params);
    };

    /**
	 * 在指定的工作项上发起加签动作，会产生一个新的加签工作项，只有这个加签工作项被提交了，当前工作项才可以被提交
	 */
	_BPMService.prototype.launchTask = function(wid, nodeKey, ppObject, launchInfo, hideActiveWorkitem) {
        var params = {
    		service: "BPMExtend",
    		cmd: "LaunchTask",
    		WorkitemID: wid,
    		NodeKey: nodeKey,
    		HideActiveWorkitem: hideActiveWorkitem,
    		LaunchInfo: launchInfo,
    		PPObject: $.toJSON(ppObject.toJSON())
        };
		//return Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, params);
        return this.request.getData(params);
    };

    /**
	 * 在指定的工作项上发起加签动作，会产生一个新的加签工作项，只有这个加签工作项被提交了，当前工作项才可以被提交
	 */
	_BPMService.prototype.endorseTask = function(wid, operatorID, launchInfo, hide) {
        var params = {
    		service: "BPMExtend",
    		cmd: "EndorseTask",
    		WorkitemID: wid,
    		OperatorID: operatorID,
    		LaunchInfo: launchInfo,
    		Hide: hide
        };
		//return Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, params);
        return this.request.getData(params);
    };

    /**
	 * 移交工作项
	 */
	_BPMService.prototype.transferTask = function(wid, operatorID, createRecord, userinfo, auditResult, srcOperator, transferType) {
        var params = {
    		service: "BPMExtend",
    		cmd: "TransferTask",
    		WorkitemID: wid,
    		OperatorID: operatorID,
    		CreateRecord: createRecord,
    		UserInfo: userinfo,
    		AuditResult: auditResult,
    		SrcOpt:srcOperator,
    		TransferType:transferType
        };
		//return Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, params);
        return this.request.getData(params);
    };
	    
	_BPMService.prototype.refuseTask = function(wid, auditResult, userInfo){
    	 var params = {
 	    		service: "BPMExtend",
 	    		cmd: "RefuseTask",
 	    		workitemID: wid,
 	    		auditResult: auditResult,
 	    		userInfo: userInfo
 	        };
    	 return this.request.getData(params);
    };
	    
	_BPMService.prototype.refuseToOperator = function(info, operatorID){
    	 var params = {
 	    		service: "BPM",
 	    		cmd: "RefuseToOperator",
 	    		workitemInfo: $.toJSON(info),
 	    		operatorID: operatorID
 	        };
    	 return this.request.getData(params);
    };

    /**
     * 获得可驳回节点
     */
	_BPMService.prototype.getValidNodes = function(nodeID, processKey, instanceid, ignoreDeep, version) {
    	var params = {
    		service:"BPM",
    		cmd:"GetValidNodes",
    		nodeID:nodeID,
    		processKey:processKey,
    		instanceID:instanceid,
    		ignoreDeep:ignoreDeep,
            version: version
    	};
    	return this.request.getSyncData(Svr.SvrMgr.ServletURL, params);
    };

    /**
     * 直送工作项
     */
	_BPMService.prototype.transferToNode = function(workiteminfo, formDoc) {
    	var doc = YIUI.DataUtil.toJSONDoc(formDoc);
    	var params = {
	    		service:"BPM",
	    		cmd:"TransferToNode",
	    		workiteminfo: $.toJSON(workiteminfo),
	    		document: $.toJSON(doc)
	    };
    	return this.request.getData(params);
    };

    /**
     * 直送启动
     */
	_BPMService.prototype.dirStratInstance = function(instanceID, auditResult, formDoc, keepParts){
    	var doc = YIUI.DataUtil.toJSONDoc(formDoc);
    	this.form.refreshParas();
        var paras = this.form.getParas();
    	var params = {
	    		service:"BPM",
	    		cmd:"DirStartInstance",
	    		parameters: paras.toJSON(),
	    		InstanceID: instanceID,
	    		document: $.toJSON(doc),
	    		auditResult: auditResult,
	    		keepParts: keepParts
	    };
	    return this.request.getData(params);
    };
	    
    /**
	 * 从结束状态复活一个流程实例
	 */
	_BPMService.prototype.reviveInstance = function(form, instanceID, userinfo) {
        var params = {
    		service: "BPM",
    		cmd: "ReviveInstance",
    		InstanceID: instanceID,
    		userInfo: userinfo
        };

        form.refreshParas();
    	var parameters = form.getParas();
    	if(parameters){
			params.parameters = parameters.toJSON();
		}
        return this.request.getData(params);
    };
	    
	_BPMService.prototype.distributeWorkitem = function(workitemID, operatorID) {
        var params = {
    		service: "BPM",
    		cmd: "DistributeWorkitem",
    		workitemID: workitemID,
    		operatorID: operatorID
        };

        return this.request.getData(params);
    };
	    
	_BPMService.prototype.cancelDistributeWorkitem = function(workitemID) {
        var params = {
    		service: "BPM",
    		cmd: "CancelDistributeWorkitem",
    		workitemID: workitemID
        };

        return this.request.getData(params);
    };

	_BPMService.prototype.batchDistributeWorkitem = function(wids, operatorID) {
        var params = {
    		service: "BPM",
    		cmd: "BatchDistributeWorkitem",
    		WIDListStr: $.toJSON(wids),
    		operatorID: operatorID
        };

        return this.request.getData(params);
    };

	_BPMService.prototype.manualTransferToNode = function(info) {
        var params = {
    		service: "BPM",
    		cmd: "ManualTransferToNode",
    		manualTransferInfo: $.toJSON(info)
        };

        return this.request.getSyncData(Svr.SvrMgr.ServletURL, params);
    };

    /**
	 * 新增参与者<br>
	 * 参数：【operatorList, nodeKey, instanceID, isInsert】
	 * <ul>
	 * <li> operatorList: 新增人员集合,支持的参数类型：
	 * <ol>
	 * <li>集合类型，如ArrayList,大多使用于多选字典的值 
	 * <li>以逗号“,”分隔的字符串，如{1,2,3}或“1,2,3”
	 * <li>Long类型，此时指的是单个操作员
	 * </ol>	
	 * <li> nodeKey: 目标节点
	 * <li> instanceID: 流程实例ID
	 * <li> isInsert: 是否insert新增人员
	 * </ul>
	 * @author gwj
	 *
	 */
	_BPMService.prototype.addParticipators = function(opList, nodeKey, instanceID, isInsert) {
        var params = {
    		service: "BPM",
    		cmd: "AddParticipators",
    		operatorListStr: $.toJSON(opList),
    		nodeKey: nodeKey,
    		instanceID: instanceID,
    		isInsert: isInsert
        };

        return this.request.getSyncData(Svr.SvrMgr.ServletURL, params);
    };
	return _BPMService;
})();