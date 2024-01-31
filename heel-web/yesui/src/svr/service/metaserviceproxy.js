(function () {

	var cache = new YIUI.MetaCache();
	var dataObjCache = new YIUI.DataObjCache();
    var reqMap = {};

    var impl_getForm = function (form, key, formKey, templateKey) {
        var params = {
            cmd: "GetForm",
            service: "WebMetaService",
            formKey: formKey,
            templateKey: templateKey
        };

        return new Svr.Request(form).getData(params).then(function(metaForm){
            cache.put(key, metaForm);
            return metaForm;
        },function(err){
            console.log('error ......'+err);
            setTimeout(function(){
                delete reqMap[key];
            },100);
        });
    }

    YIUI.MetaService = (function () {
		function _MetaService(f){
			this.form = f;	

	        if(f){
	            var appEnv = f.getAppEnv();
	            if(appEnv){
	                this.appKey = appEnv.getAppKey();
	            }  
	        }

	        this.request = new Svr.Request(f);
		};

		

		/**
		 * 获取web配置对象
		 */
	    _MetaService.prototype.getMetaForm = function(formKey, templateKey) {

	        var key = this.appKey + "_" + "getMetaForm_" + formKey+"_" + (templateKey || '');

	       	if(!reqMap[key]){

	       		var cacheDef = cache.get(key);
                var versionDef = this.getFormVersion(formKey);
                var form = this.form;
                reqMap[key] = $.when(cacheDef, versionDef)
                    .then(function(metaForm, version){
                            if(metaForm && version == metaForm.version){
                                return metaForm;
                            }else{
                                return impl_getForm(form, key,formKey,templateKey);
                            }
                    },function(error){
                        console.log('error ......'+error);
                    }).always(function(){
                        setTimeout(function(){
                            delete reqMap[key];
                        },100);
                    });
            }

            return reqMap[key];
	    };

	    /**
		 * 根据EntryPath获取web配置对象
		 */
	    _MetaService.prototype.getMetaFormByEntry = function(entryPath, appKey) {
			var params = {
				cmd: "GetFormByEntry",
				service: "WebMetaService",
			    path: entryPath
			};

			var r = new Svr.Request();
			if(appKey){
				r.addHeader("appKey", appKey);
			}
			return r.getData(params);
	    };

	    /**
		 * 获取预加载表单列表
		 */
	    _MetaService.prototype.getPreLoadItems = function() {
	        var params = {
	    		service: "GetPreLoadForm"
	        };
	        return new Svr.Request().getData(params);
	    };

	   	/**
		 * 获取菜单
		 */
	    _MetaService.prototype.getEntry = function(rootEntry, appKey) {
	        var params = {
	    		cmd: "GetEntry",
	    		service: "WebMetaService",
	    		rootEntry: rootEntry,
	    		appKey: appKey
	        };
	        return this.request.getData(params);
	    };

	   	/**
		 * 获取ParaGroup
		 */ 
	    _MetaService.prototype.getParaGroup = function(groupKey, formKey){
	        var paras = {
	                service: "WebMetaService",
	                cmd: "GetParaGroup",
	                formKey: formKey,
	                groupKey: groupKey
	            };
	        return this.request.getSyncData(Svr.SvrMgr.ServletURL, paras);
	    };

	    /**
		 * 获取web配置对象
		 */
	    _MetaService.prototype.getDataObject = function(dataObjectKey, formKey) {
	        var key = this.appKey + "_" + "getDataObject_"+dataObjectKey;

	       	if(!reqMap[key]){
	       		var rq = this.request;
                reqMap[key] = dataObjCache.get(key)
	                                .then(function(dataObj){
	                                        if(dataObj){
	                                            return dataObj;
	                                        }else{
										        var paras = {
									                service: "WebMetaService",
									                cmd: "GetDataObject",
									                key: dataObjectKey
									            };

	                                            return rq.getData(paras).then(function(data){
	                                                dataObjCache.put(key, data);
	                                                return data;
	                                            }); 
	                                        }
	                                },function(error){
	                                    console.log('error ......'+error);
	                                }).always(function(){
	                                    setTimeout(function(){
	                                        delete reqMap[key];
	                                    },100);
	                                });
            }
            return reqMap[key];  
	    };

	    _MetaService.prototype.getClientAppStatusInfo = function(){
	    	var params = {
	    		cmd: "GetClientAppStatusInfo",
	    		service: "WebMetaService"
	        };
	        return this.request.getData(params);
	    };
	    
	    _MetaService.prototype.getAppList = function(){
	    	var params = {
	    		service: "GetAppList"
	        };
	        return this.request.getData(params);
	    };

      _MetaService.prototype.reBuildDepend = function(projectKey,formKey,paras) {
        var params = {
          service: "WebMetaService",
          cmd: "ReBuildDepend",
          projectKey: projectKey,
          formKey: formKey
        };

        if (paras) {
          params.paras = $.toJSON(paras);
        }

        return new Svr.Request().getData(params);
      }
	    
	    _MetaService.prototype.getAliasKey = function(platform, formkey) {
	    	var params = {
	    		cmd:"GetAliasKey",
	    		service:"WebMetaService",
	    		platForm:platform,
	    		formKey:formkey
	    	}
	    	return this.request.getData(params);
	    };

	    _MetaService.prototype.getBPMProcess = function(formKey){
    	    var paras = {
                service: "WebMetaService",
                cmd: "GetBPMProcess",
                formKey: formKey
            };
	        return this.request.getSyncData(Svr.SvrMgr.ServletURL, paras);
	    };

	    _MetaService.prototype.getFormVersion = function(formKey) {
	    	var key = this.appKey + "_" + "getFormVersion_"+formKey;

	    	var params = {
	    		cmd:"GetFormVersion",
	    		service:"WebMetaService",
	    		formKey:formKey
	    	}

	    	if(!reqMap[key]){
                reqMap[key] = this.request.getData(params)
									.always(function(){
	                                    setTimeout(function(){
	                                        delete reqMap[key];
	                                    },5000);
	                                });
            }

	    	return reqMap[key];
	    };

	    _MetaService.prototype.getDataObjectVersion = function(dataObjectKey) {
	    	var key = this.appKey + "_" + "getDataObjectVersion_"+dataObjectKey;

	    	var params = {
	    		cmd:"GetDataObjectVersion",
	    		service:"WebMetaService",
	    		dataObjectKey:dataObjectKey
	    	}

	    	if(!reqMap[key]){
                reqMap[key] = this.request.getData(params)
									.always(function(){
	                                    setTimeout(function(){
	                                        delete reqMap[key];
	                                    },5000);
	                                });
            }

	    	return reqMap[key];
	    };

	    _MetaService.prototype.getDataObjectVersionByFormKey = function(formKey) {
	    	var key = this.appKey + "_" + "getDataObjectVersionByFormKey_"+formKey;

	    	var params = {
	    		cmd:"GetDataObjectVersion",
	    		service:"WebMetaService",
	    		formKey:formKey
	    	}

	    	if(!reqMap[key]){
                reqMap[key] = this.request.getData(params)
									.always(function(){
	                                    setTimeout(function(){
	                                        delete reqMap[key];
	                                    },5000);
	                                });
            }

	    	return reqMap[key];
	    };

		return _MetaService;
	})();
})(); 