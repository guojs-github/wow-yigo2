//字典状态过滤
var DictStateMask = (function () {
    var Return = {
    	//启用
		Enable : 1,
		//停用
		Disable : 2,
		//作废
		Discard : 4,
		//全部
		All : 7,
		//启用+停用
		Enable_Disable : 3,
		//启用+作废
		Enable_Discard : 5,
		//停用+作废
		Disable_Discard : 6
    };
    return Return;
})();