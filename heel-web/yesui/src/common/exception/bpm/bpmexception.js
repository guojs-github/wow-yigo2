YIUI.BPMException = (function () {

	_BPMException.serialVersionUID = 1;

	_BPMException.NO_DEFINE_NODE_TYPE = 0x0001;

	_BPMException.PARTICIPATOR_ERROR = 0x0002;

	_BPMException.DELEGATE_RIGHT_ERROR = 0x0003;

	_BPMException.INSTANCE_STARTED = 0x0004;

	_BPMException.WORKITEM_DATA_TIME_OUT = 0x0005;

	_BPMException.NO_ACTIVE_WORKITEM = 0x0006;

	_BPMException.NO_MAP_DATA = 0x0007;

	_BPMException.NO_PROCESS_DEFINATION = 0x0008;

	_BPMException.NO_BINDING_PROCESS = 0x0009;

	_BPMException.NO_DYNAMIC_BINDING_PROCESS = 0x000A;

	_BPMException.NO_PROCESS_DEFINATION_VERID = 0x000B;

	_BPMException.NO_INSTANCE_DATA = 0x000C;

	_BPMException.DELEGATE_MISS_SRC = 0x000D;

	_BPMException.DELEGATE_MISS_TGT = 0x000E;

	_BPMException.NO_NODE_EXIST = 0x000F;

	_BPMException.NO_BPM_CONTEXT = 0x0010;
	
	_BPMException.MISS_FORM = 0x0011;
	
    var StringTable = YIUI.StringTable.BPM;

    var errorInfoMap = new HashMap();
	errorInfoMap.put(_BPMException.NO_DEFINE_NODE_TYPE, StringTable.NoDefineNodeType);
	errorInfoMap.put(_BPMException.PARTICIPATOR_ERROR, StringTable.ParticipatorError);
	errorInfoMap.put(_BPMException.DELEGATE_RIGHT_ERROR, StringTable.DelegateRightError);
	errorInfoMap.put(_BPMException.INSTANCE_STARTED, StringTable.InstanceStarted);
	errorInfoMap.put(_BPMException.WORKITEM_DATA_TIME_OUT, StringTable.WorkitemDataTimeout);
	errorInfoMap.put(_BPMException.NO_ACTIVE_WORKITEM, StringTable.NoActiveWorkitem);
	errorInfoMap.put(_BPMException.NO_MAP_DATA, StringTable.NoMApData);
	errorInfoMap.put(_BPMException.NO_PROCESS_DEFINATION, StringTable.NoProcessDefination);
	errorInfoMap.put(_BPMException.NO_BINDING_PROCESS, StringTable.NoBindingProcess);
	errorInfoMap.put(_BPMException.NO_DYNAMIC_BINDING_PROCESS, StringTable.NoDynamicBindingProcess);
	errorInfoMap.put(_BPMException.NO_PROCESS_DEFINATION_VERID, StringTable.NoProcessDefinationVerID);
	errorInfoMap.put(_BPMException.NO_INSTANCE_DATA, StringTable.NoInstanceData);
	errorInfoMap.put(_BPMException.DELEGATE_MISS_SRC, StringTable.DelegateMissSrc);
	errorInfoMap.put(_BPMException.DELEGATE_MISS_TGT, StringTable.DelegateMissTgt);
	errorInfoMap.put(_BPMException.NO_NODE_EXIST, StringTable.NoNodeExist);
	errorInfoMap.put(_BPMException.NO_BPM_CONTEXT, StringTable.NoBPMContext);
	errorInfoMap.put(_BPMException.ROLLBACK_ERROR, StringTable.RollbackError);
	errorInfoMap.put(_BPMException.NO_STANDARD_FORM, StringTable.NoStandardForm);
	errorInfoMap.put(_BPMException.NO_FORM, StringTable.NoForm);
	errorInfoMap.put(_BPMException.NO_PATH, StringTable.NoPath);
	errorInfoMap.put(_BPMException.MISS_ATTACHMENT, StringTable.MissAttachment);
	errorInfoMap.put(_BPMException.DELEGATE_ENDTIME_BEFORE_STARTTIME, StringTable.EndTimeBeforeStartTime);
	errorInfoMap.put(_BPMException.INSTANCE_PAUSED, StringTable.InstancePaused);
	errorInfoMap.put(_BPMException.COMMIT_RIGHT_ERROR, StringTable.CommitRightError);
	errorInfoMap.put(_BPMException.COMMIT_ERROR, StringTable.CommitError);
	errorInfoMap.put(_BPMException.COMMIT_NO_BACKSITE, StringTable.CommitNOBacksite);
	errorInfoMap.put(_BPMException.COMMIT_NO_BACKSITE_OPT, StringTable.CommitNOBacksiteOpt);
	errorInfoMap.put(_BPMException.OUT_OF_PARTICIPATORS, StringTable.OutOfParticipators);
	errorInfoMap.put(_BPMException.COMMIT_NO_TRANSITTO, StringTable.CommitNoTranstTo);
	errorInfoMap.put(_BPMException.PARTICIPATORS_CACL_ERROR, StringTable.ParticipatorsCaclError);
	errorInfoMap.put(_BPMException.DISTRIBUTE_NOT_SUPPORT, StringTable.DistributeNotSupport);

	var getGroupCode = function() {
		return 0x8009;
	};

    function _BPMException(code, message){
        var c = getGroupCode() << 16 | code;  
        YIUI.CoreException.call(this, c, message);
        this.name = 'YIUI.BPMException';
    };

    _BPMException.prototype = new YIUI.CoreException();

    _BPMException.formatMessage = function(/*locale, */code) {
                                        var key = errorInfoMap.get(code);
                                        var format = StringTable.getString(/*locale, */key);
                                        var msg = StringTable.format(format, arguments, 1);
                                        return msg;
                                    };
		
	return _BPMException;
})();