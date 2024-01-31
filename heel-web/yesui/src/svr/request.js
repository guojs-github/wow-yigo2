var Svr = Svr || {};
Svr.Request = (function () {

    function _Request(f){
        this.form = f;
    };

    var convertResult = function(msg){
        var ret = msg.data;
        if(msg.type === YIUI.JavaDataType.STR_USER_DATATABLE){
            ret = YIUI.DataUtil.fromJSONDataTable(ret);
        }else if(msg.type === YIUI.JavaDataType.STR_USER_DOCUMENT){
            ret = YIUI.DataUtil.fromJSONDoc(ret);
        }
        return ret;
    };

    _Request.prototype.transData = function(data){
        if(data == null){
            return data;
        }
           
        data.mode = 1;
        data.isYES2 = true;

        var json = $.toJSON(data);
        
        //传送数据 长度 大于 20000 开启压缩   20000长度的数据传输在30K 左右
        if(json.length < 20000){
            return data;
        }
        var postData = {};
        postData.yigoData = YIUI.Base64.encode64(pako.gzip(json));
        return postData;
    };

    _Request.prototype.getNormalizedUri = function(params, url, form){
        var _formKey, _projectKey;
        if(form){
            _formKey = form.getFormKey();
            _projectKey = form.getProjectKey();
        }

        if(form){
            if(!form.getAppEnv()){
                console.log("...................appEnv is null..............");
            }
        }

        var service  = params['service'];
        var cmd = params['cmd'] || 'do';
        var projectKey = _projectKey || 'global';
        var key = params['itemKey'] || params['dataObjectKey'] || params['formKey'] || _formKey || '';

        if(!url){
            url = Svr.SvrMgr.ServletURL;
        }

        if(service){
            url = url + '/' + service + '/' + cmd + '/' + projectKey;
            url = key ? url + '/' + key : url; 
            return url;      
        }
 
        return url;
    };

    _Request.prototype.addHeader = function(key, value){
        this._header = this._header || {};
        this._header[key] = value;
    };

    _Request.prototype.getRequestHeader = function(url, postData, async, timeout, form){
        var header = {
                    contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                    type: "post",
                    url: url,
                    data: postData,
                    async: async,
                    dataType: 'json',
                    timeout: timeout
                };
        var appKey = 'Global';
        if(form){
            appEnv = form.getAppEnv();
            if(appEnv){
                appKey = appEnv.getAppKey();
            }  
        }
        
       
        header.headers = $.extend({'appKey':appKey}, this._header);
        return header;
    };

    _Request.prototype.getData = function(params, url, notConvert){

        if (!YIUI.HeadInfos.empty()) {
            params.headinfos = YIUI.HeadInfos.toJSON();
        }

        url = this.getNormalizedUri(params, url, this.form);

        var timeout = 0;
        if(window.timeout > 0) {
            timeout = window.timeout;
        }

        var postData = this.transData(params);

        var self = this;
        if(self.encryptData){
            postData = self.encryptData(postData);
        }

        var header = self.getRequestHeader(url, postData, true, timeout, this.form);
        return $.ajax(header).then(function(data){
                        if(self.decryptData){
                            data = self.decryptData(data);
                        }

                        if(notConvert){
                            return data.data;
                        }

                        var ret = convertResult(data);
                            //defer.resolve(ret);
                        return ret;
                },function(err){
                        if(YIUI.LoadingUtil){
                            YIUI.LoadingUtil.hide();  
                        }

                        var ret;
                        if(self.decryptData){
                            ret = self.decryptData(err.responseJSON);
                        }else{
                            ret = err.responseJSON;
                        }

                        var error =ret.error;
                        var e = new YIUI.Exception(error.error_code, error.error_info);
                        
                        setTimeout(function(){
                            if(err.readyState == 0) {
                                $.error(YIUI.I18N.getString("REQUEST_CHECK","请求状态未初始化，检查服务器连接！"));
                            } else {
                                // $.error($.toJSON(error));
                                throw e;
                            }
                        },10);
                        return err;
                });
    };

    _Request.prototype.getSyncData = function (url, params, sucCallback, errorCallback) {
        params.mode = 1;

        url = this.getNormalizedUri(params, url, this.form);

        if (!YIUI.HeadInfos.empty()) {
            params.headinfos = YIUI.HeadInfos.toJSON();
        }

        var returnObj = null;
    
        var tz = jstz.determine();
        var timezone = tz.name();

        params.timezone = timezone;
        var timeout = 0;
        if(window.timeout > 0) {
            timeout = window.timeout;
        }

        var postData = this.transData(params);

        var self = this;
        if(self.encryptData){
            postData = self.encryptData(postData);
        }

        var header = self.getRequestHeader(url, postData, false, timeout, this.form);
        header.success = function (msg) {
                                if(self.decryptData){
                                    msg = self.decryptData(msg);
                                }
                                returnObj = convertResult(msg);
                                if ($.isFunction(sucCallback)) {
                                    returnObj = sucCallback(returnObj);
                                } 
                            };

        header.error = function (xhr, textStatus, exception) {
                                if(xhr.readyState == 0) {
                                    $.error(YIUI.I18N.getString("REQUEST_CHECK","请求状态未初始化，检查服务器连接！"));
                                    return;
                                }

                                var ret;
                                if(self.decryptData){
                                    ret = self.decryptData(xhr.responseJSON);
                                }else{
                                    ret = xhr.responseJSON;
                                }

                                if ($.isFunction(errorCallback)) {
                                    //重载错误提示方法
                                } else {
                                    var error = ret.error;
                                    throw new YIUI.Exception(error.error_code, error.error_info);
                                }
                            };
        $.ajax(header);
        return returnObj;
    };

    _Request.prototype.getAsyncData = function (url, params, sucCallback, errorCallback) {
        params.mode = 1;
        if (!YIUI.HeadInfos.empty()) {
            params.headinfos = YIUI.HeadInfos.toJSON();
        }
        var returnObj = null;
        var tz = jstz.determine();
        var timezone = tz.name();
        //var locale = window.navigator.language || window.navigator.browserLanguage;
        //params.locale = locale;
        params.timezone = timezone;
        var timeout = 0;
        if(window.timeout > 0) {
            timeout = window.timeout;
        }
        
        url = this.getNormalizedUri(params, url, this.form);

        var postData = this.transData(params);
        var self = this;
        if(self.encryptData){
            postData = self.encryptData(postData);
        }
        
        var header = self.getRequestHeader(url, postData, true, timeout, this.form);
        header.beforeSend = function () {
                                YIUI.LoadingUtil.show();
                            };
        header.success = function (msg) {
                                if(self.decryptData){
                                    msg = self.decryptData(msg);
                                }
                                returnObj = convertResult(msg);
                                if ($.isFunction(sucCallback)) {
                                    returnObj = sucCallback(returnObj);
                                }
                            };
        header.complete = function (xhr) {
                                xhr = null;
                                YIUI.LoadingUtil.hide();
                            };
        header.error = function (xhr, textStatus, exception) {
                                YIUI.LoadingUtil.hide();
                                if(xhr.readyState == 0) {
                                    $.error(YIUI.I18N.getString("REQUEST_CHECK","请求状态未初始化，检查服务器连接！"));
                                    return;
                                }
                                var ret;
                                if(self.decryptData){
                                    ret = self.decryptData(xhr.responseJSON);
                                }else{
                                    ret = xhr.responseJSON;
                                }
                                if ($.isFunction(errorCallback)) {
                                    //重载错误提示方法
                                } else {
                                    var error = ret.error;
                                    throw new YIUI.Exception(error.error_code, error.error_info);
                                }
                            };

        $.ajax(header);

        return returnObj;
    };
    
    _Request.prototype.getBase64Image = function (params, url) {

        if (!YIUI.HeadInfos.empty()) {
            params.headinfos = YIUI.HeadInfos.toJSON();
        }

        url = this.getNormalizedUri(params, url, this.form);

        var timeout = 0;
        if(window.timeout > 0) {
            timeout = window.timeout;
        }

        var postData = this.transData(params);

        var self = this;
        if(self.encryptData){
            postData = self.encryptData(postData);
        }

        var header = self.getRequestHeader(url, postData, true, timeout, this.form);
        return $.ajax(header).then(function(data){
                        if(self.decryptData){
                            data = self.decryptData(data);
                        }

                        return data.data;
                },function(err){
                        return err;
                });
    };

	_Request.prototype.downloadFile = function (options, calllback) {
		var xhr = new XMLHttpRequest();
        xhr.open('post', Svr.SvrMgr.AttachURL, true);
        xhr.responseType="blob";

        xhr.onload = function(){
            if(this.status ==200){
            	
            	calllback(this.response, decodeURIComponent(this.getResponseHeader("filename")));

            }
        };

        var toData = function(json){
			var arr = new Array();
			var i = 0;
			for(var attr in json){
				arr[i] = attr + "=" + encodeURIComponent(json[attr]);
				i++;
			}

			return arr.join("&");
		}
		xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
        xhr.send(toData(options));
	};

	_Request.prototype.uploadFile = function (options) {
		var params = {};
        for( var p in options ) {
            if( typeof options[p] === 'function' || typeof options[p] === 'object' )
                continue;
            params[p] = options[p];
        }
		
		$.ajaxFileUpload({
            url: Svr.SvrMgr.AttachURL,
            fileElement: options.file,
            data: params,
            type: "post",
            success: function (data) {
                        if( !data ) return;
                        var result = JSON.parse(data).data;
                        if( typeof options.success === 'function' ) {
                            options.success.call(this,result);
                        }
                    },
            error: function () {
                    	$.error(YIUI.I18N.getString("UPLOADFILE_ERROR","导入失败！"));
                    }
        });
	};
	
	return _Request;
})();