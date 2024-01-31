(function () {
	var cache = new YIUI.DocCache();
    var reqMap = {};

    YIUI.DocService = (function () {
        function _DocService(f){
            this.form = f;
            this.request = new Svr.Request(f);
            if(f){
                var appEnv = f.getAppEnv();
                if(appEnv){
                    this.appKey = appEnv.getAppKey();
                }  
            }
        };

        /**
         * 创建一个doc，头表新增一行。
         */
        _DocService.prototype.newDocument = function(formKey) {

            var key = this.appKey + "_" + formKey;

            if(!reqMap[key]){

                var cacheDef = cache.get(key);
                var versionDef = new YIUI.MetaService(this.form).getDataObjectVersionByFormKey(formKey);
                var request = this.request;
                reqMap[key] = $.when(cacheDef, versionDef)
                                .then(function(doc, version){
                                        if(doc && version == doc.version){
                                            return doc;
                                        }else{
                                                var params = {
                                                    cmd: "NewDocument",
                                                    service: "DealWithDocument",
                                                    formKey: formKey
                                                };

                                                return request.getData(params, null, true).then(function(data){
                                                    cache.put(key, data);
                                                    return data;
                                                }); 
                                        }
                                },function(error){
                                    console.log('error ......'+error);
                                }).then(function(doc){
                                    return YIUI.DataUtil.fromJSONDoc(doc);
                                }).always(function(){
                                    setTimeout(function(){
                                        delete reqMap[key];
                                    },100);
                                });
            }

            return reqMap[key];  
        };

        // sync 同步加载
        _DocService.prototype.loadFormData = function(form, oid, filterMap, condParas, sync) {
            if(!form){
                throw new Error(YIUI.I18N.getString("DOCSERVICEPROXY_NOFORMDEFINED","form 不能为空"));
            }

            form.refreshParas();
            var parameters = form.getParas();
            var params = {
                cmd: "",
                service: "LoadFormData",
                oid: oid,
                formKey: form.getFormKey()
            };

            if(parameters){
                params.parameters = parameters.toJSON();
            }
            if(filterMap){
                params.filterMap = $.toJSON(filterMap);
            }
            if(condParas){
                params.condition = $.toJSON(condParas);
            }

            var templateKey = form.getTemplateKey();
            if(templateKey){
                params.templateKey = templateKey;
            }

            var _loadInfo = form.getSysExpVals(YIUI.BPMKeys.LOAD_WORKITEM_INFO);
            if( _loadInfo != undefined ) {
                params.loadWorkItemInfo = _loadInfo;
            }

            if( !sync ) {
              return this.request.getData(params).then(function(doc){
                    if(form.metaForm.dataObject.version != doc.version){
                        throw new Error(" version is error, refresh.");
                    }
                    return doc;
              });
            } else {
              return this.request.getSyncData(Svr.SvrMgr.ServletURL,params);
            }
        };

        // see remoteService.deletebyform
        _DocService.prototype.deleteFormData = function(formKey, oid) {
            var params = {
                cmd: "DeleteFormData",
                service: "DeleteData",
                formKey: formKey,
                oid: oid

            };
            //return Svr.Request.getData(params);
            return this.request.getSyncData(Svr.SvrMgr.ServletURL, params);
        };

        _DocService.prototype.batchDeleteData = function(objectKey,OIDList){
            var params = {
                service: "DeleteData",
                cmd: "BatchDeleteData",
                dataObjectKey: objectKey,
                OIDListStr: $.toJSON(OIDList)
            };

            return this.request.getSyncData(Svr.SvrMgr.ServletURL, params);
        };

        _DocService.prototype.saveFormData = function(form) {

            form.refreshParas();

            var paras = form.getParas(),
                formDoc = form.getDocument();

            formDoc = YIUI.DataUtil.toJSONDoc(formDoc);

            var params = {
                service: "SaveFormData",
                parameters: paras.toJSON(),
                document: $.toJSON(formDoc),
                formKey: form.getFormKey()
            };

            var success = function(doc) {
                var dataObj = form.getDataObject();
                if(dataObj && dataObj.secondaryType != YIUI.SECONDARYTYPE.DATAOBJECTLIST){
                    form.setDocument(doc);
                    var newOID = doc.oid;
                    form.getFilterMap().setOID(newOID);
                    if((form.type == YIUI.Form_Type.Dict ||
                        form.type == YIUI.Form_Type.ChainDict) &&
                        form.operationState != YIUI.Form_OperationState.New){ // 如果修改字典 清空字典缓存
                        new YIUI.DictService().removeCache(dataObj.key, newOID);
                        new YIUI.DictCacheProxy().removeCache(dataObj.key, newOID);
                    }
                }
                form.setOperationState(YIUI.Form_OperationState.Default);
                form.showDocument();
            };
            return this.request.getSyncData(Svr.SvrMgr.ServletURL, params, success);
        };

        _DocService.prototype.copyNew = function (form) {
            var formDoc = form.getDocument();
            var docJson = YIUI.DataUtil.toJSONDoc(formDoc);

            var params = {
                formKey: form.getFormKey(),
                service: "CopyNew",
                document: $.toJSON(docJson)
            };

            return this.request.getData(params);
        };

        _DocService.prototype.loadData = function(objectKey, oid, filterMap, condParas, paras) {
            var params = {
                cmd: "",
                service: "LoadData",
                OID: oid,
                dataObjectKey: objectKey
            };

            if(paras) {
                params.parameters = paras.toJSON();
            }

            if(filterMap){
                params.filterMap = $.toJSON(filterMap);
            }

            if(condParas){
                params.condition = $.toJSON(condParas);
            }

            return this.request.getData(params);
        };

        return _DocService;
    })();
})(); 