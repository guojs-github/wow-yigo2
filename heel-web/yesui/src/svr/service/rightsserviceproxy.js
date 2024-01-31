(function () {
	var cache = new YIUI.RightsCache();
    var reqMap = {};

    var _default = {
        service: "SessionRights",
        cmd: "LoadFormRights"
	};

	YIUI.RightsService = (function () {

		function _RightsService(f){
			this.form = f;
			this.request = new Svr.Request(f);
		};

		/**
		 * 表单字段，操作权限
		 */
	    _RightsService.prototype.loadFormRights = function(formKey,params) {

	       	if(!reqMap[formKey]){
	       		var req =  this.request;
                reqMap[formKey] = cache.get(formKey)
	                                .then(function(rightsData){
	                                        if(rightsData){
	                                            return rightsData;
	                                        }else{

										        params = $.extend({},_default,params);

	                                            return req.getData(params).then(function(rightsData){
	                                            	if( rightsData.needCache ) {
                                                        cache.put(formKey, rightsData);
													}
	                                                return rightsData;
	                                            }); 
	                                        }
	                                },function(error){
	                                    console.log('error ......'+error);
	                                }).always(function(){
	                                    setTimeout(function(){
	                                        delete reqMap[formKey];
	                                    },100);
	                                });
            }
            return reqMap[formKey];  
	    };

		return _RightsService;
	})();
})();