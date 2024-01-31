(function () {
	var obj = {
		NoDefineNodeType: "Undefined node type {1} !",
		ParticipatorError: "No participator in node {1} !",
		DelegateRightError: "Cannot modify other delegate data when current user is not admin !",
		CommitRightError: "You con't commit the workitem!",
		InstanceStarted: "Instance has been started !",
		WorkitemDataTimeout: "The workitem has been submitted !",
		NoActiveWorkitem: "No activate workitem !",
		NoMApData: "Node {1} has no data to map !",
		NoProcessDefination: "Process {1} undeployed or not exists !",
		NoBindingProcess: "No process binding to form {1} and dataobject {2} !",
		NoDynamicBindingProcess: " Dynamic process {1} bind to the current form undeployed or not exists !",
		NoProcessDefinationVerID: "Process {1} with versionID {2} undefined!",
		NoInstanceData: "no instance data!",
		DelegateMissSrc: "The current delegate has no source operator !",
		DelegateMissTgt: "The current delegate has no target operator !",
		NoNodeExist: "Node number {1} not found in process {2} !",
		NoBPMContext: "The current context not include the process information,cannot execute the formula !",
		RollbackError: "RollBack error,data overtime !",
		NoStandardForm: "Undefined standard workflow audit form 'WorkflowAudit'  !",
		NoForm: "No form key para!",
		NoPath: "Node {1} has no available path!",
		MissAttachment: "Workflow instance of bill OID {1},attachment named {2} has not register！",
		StartInstance: "Start Instance",
		CommitWorkItem: "Commit WorkItem",
		RevocateCommited: "Cancel Approve",
		StartTimeBeforeEndTime: "Invalid start and stop time!",
		InstancePaused: "The workflow was paused!",
		CommitError: "Can't commit the workitem with state({1}).",
		CommitNOBacksite: "No backsite!",
		CommitNOBacksiteOpt: "no workitem on backsite!",
		TransitTo: "TransitTo",
		OutOfParticipators: "The operator{1} is unavailable!",
		CommitNoTransitTo: "no transit site!",
		ParticipatorsCaclError: "node {1} participator calculate error.。",
		DistributeNotSupport: "Distribution or grab is not supported under the normal pattern"
	};

	if(YIUI.StringTable.BPM) {
		YIUI.StringTable.BPM = $.extend(YIUI.StringTable.BPM, obj);
	} else {
		YIUI.StringTable.BPM = $.extend(YIUI.StringTable, obj);
	}
})();
	