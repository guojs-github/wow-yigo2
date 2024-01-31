var Svr = Svr || {};
Svr.Request = (function () {
	var transData = function(data){
		if(data == null){
			return data;
		}
	
		var json = $.toJSON(data);
		
		//传送数据 长度 大于 20000 开启压缩   20000长度的数据传输在30K 左右
		if(json.length < 20000){
			return data;
		}
	    var postData = {};
        postData.yigoData = YIUI.Base64.encode64(pako.gzip(json));
        return postData;
	};
	var d_msg = {
		count: 0,
		time: 0,
		size: 0
	};
	var getMSG = function(time, size) {
		var svr_msg = Svr.MSG = Svr.MSG || d_msg
		svr_msg.count++;
		svr_msg.time += time;
		svr_msg.size += size;
		console.log(svr_msg);
	};
    var Return = {
        getSyncData: function (url, params, sucCallback, errorCallback) {
            params.mode = 1;
            var returnObj = null;
            var locale = window.navigator.language || window.navigator.browserLanguage;
            var tz = jstz.determine();
            var timezone = tz.name();
            params.locale = locale;
            params.timezone = timezone;
            
            var old_t = new Date().getTime();
            
            //var syncData;
            $.ajax({
                contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                type: "post",
                url: url,
                data: transData(params),
                async: false,
                dataType: 'json',
                success: function (msg) {
                    if ($.isFunction(sucCallback)) {
                        returnObj = sucCallback(msg.data);
                    } else {
                        returnObj = msg.data;
                    }
                    

                    var cur_t = new Date().getTime();
                    var t = cur_t - old_t;
                    getMSG(t, 0);
                },
                complete: function (xhr, ts) {
                    xhr = null;
                },
                error: function (xhr, textStatus, exception) {
                	if(xhr.readyState == 0) {
                		$.error("请求状态未初始化，检查服务器连接！");
                		return;
                	}
                    if ($.isFunction(errorCallback)) {
                        //重载错误提示方法
                    } else {
                        var error = xhr.responseJSON.error;
                        var jsonObj = xhr.responseJSON.data;
                        if (jsonObj) {
                            for (var i = 0; i < jsonObj.length; i++) {
                                var changedObj = jsonObj[i];
                                var dealCmd = changedObj["cmd"];
                                var pFormID = changedObj["pFormID"];
                                var resultObj = changedObj["value"];
                                if (dealCmd == "diff") {
                                    YIUI.UIUtil.diffForm(pFormID, resultObj);
                                }
                            }
                        }

//                        var showMessage = 'Error occured: error_code=' + error.error_code + ', error_info=' + error.error_info;
                        var showMessage = error.error_info;
                        $.error(showMessage);

//		                var dialog = $("<div></div>").attr("id", "error_dialog");
//		                var showMessage = 'Error occured: error_code=' + error.error_code + ', error_info=' + error.error_info;
//		                dialog.modalDialog(showMessage, {title: "错误", showClose: true, type: "error", height: 200, width: 400});
                        return;
                    }
                }
            });
            return returnObj;
        },

        getAsyncData: function (url, params, sucCallback, errorCallback) {
            params.mode = 1;
            var returnObj = null;
            var locale = window.navigator.language || window.navigator.browserLanguage;
            var tz = jstz.determine();
            var timezone = tz.name();
            params.locale = locale;
            params.timezone = timezone;

            var old_t = new Date().getTime();
            
            $.ajax({
                contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                type: "post",
                url: url,
                data: transData(params),
                async: true,
                dataType: 'json',
                beforeSend: function () {
                    $(".loading").show();
                    $(".image").css({
                        top: $(window).height() / 2,
                        left: $(window).width() / 2
                    });
                },
                success: function (msg) {
                    if ($.isFunction(sucCallback)) {
                        returnObj = sucCallback(msg.data);
                    } else {
                        returnObj = msg.data;
                    }
                    

                    var cur_t = new Date().getTime();
                    var t = cur_t - old_t;
                    getMSG(t, 0);
                },
                complete: function (xhr) {
                    xhr = null;
                    $(".loading").hide();
                },
                error: function (xhr, textStatus, exception) {
                    $(".loading").hide();
                	if(xhr.readyState == 0) {
                		$.error("请求状态未初始化，检查服务器连接！");
                		return;
                	}
                    if ($.isFunction(errorCallback)) {
                        //重载错误提示方法
                    } else {
                        var error = xhr.responseJSON.error;
                        var jsonObj = xhr.responseJSON.data;
                        if (jsonObj) {
                            for (var i = 0; i < jsonObj.length; i++) {
                                var changedObj = jsonObj[i];
                                var dealCmd = changedObj["cmd"];
                                var pFormID = changedObj["pFormID"];
                                var resultObj = changedObj["value"];
                                if (dealCmd == "diff") {
                                    YIUI.UIUtil.diffForm(pFormID, resultObj);
                                }
                            }
                        }

//                        var showMessage = 'Error occured: error_code=' + error.error_code + ', error_info=' + error.error_info;
                        var showMessage = error.error_info;
                        $.error(showMessage);

//		                var dialog = $("<div></div>").attr("id", "error_dialog");
//		                var showMessage = 'Error occured: error_code=' + error.error_code + ', error_info=' + error.error_info;
//		                dialog.modalDialog(showMessage, {title: "错误", showClose: true, type: "error", height: 200, width: 400});
                        return;
                    }
                }
            });
            return returnObj;
        }
    };
    return Return;
})();/**
 * Created with JetBrains WebStorm.
 * User: 陈志盛
 * Date: 14-1-8
 * Time: 下午2:00
 * 向服务器发送相关请求及参数，获取返回值进行处理
 */
 var Svr = Svr || {};
Svr.SvrMgr = (function () {
    var location_pathname = document.location.pathname;
    while (location_pathname.indexOf('/') == 0) location_pathname = location_pathname.substr(1);
    var baseurl = unescape(location_pathname.substr(0));
    var service = baseurl.substring(0, baseurl.indexOf('/'));
    var Return = {
        Service: {
            Authenticate: "Authenticate",
            LoadTreeMenu: "LoadTreeMenu",
            DealWithPureForm: "DealWithPureForm",
            DeleteAttachment: "DeleteAttachment",
            GetPublicKey: "GetPublicKey",
            PureFormData: "PureFormData",
            DelFormData: "DeleteData",
            GoToPage: "GoToPage",
            PureDictView: "PureDictView",
            PureViewMap: "PureViewMap",
            PureTreeEvent: "PureTreeEvent"
        },  //静态公有属性
        EventType: {
        	Click: 0,
            DBLClick: 1,
        	GainFocus: 2,
        	LostFocus: 3,
        	EnterPress: 4,
        	Expand: 5,
        	Collapse: 6,
        	GotoPage: 7,
        	DictViewSearch: 8,
        	CellClick: 9,
        	CellSelect: 10,
        	RowDelete: 11,
        	RowInsert: 12,
        	RowChange: 13,
        	ValueChanged: 14,
        	RowClick: 15,
        	RowDblClick: 16
    	},
        
        doPureTreeEvent: function(paras, success) {
        	paras = $.extend({
                url: Return.ServletURL,
                service: Return.Service.PureTreeEvent
            }, paras);
            return doCmd(paras, null, success);
        },
        loadTreeMenu: function (paras) {
            paras = $.extend({
            	async: false,
                url: Return.ServletURL,
                service: Return.Service.LoadTreeMenu
            }, paras);
            return doCmd(paras);
        },

        dealWithPureForm: function (paras, succuss) {
            paras = $.extend({
            	async: true,
                url: Return.ServletURL,
                service: Return.Service.DealWithPureForm
            }, paras);
            return doCmd(paras, null, succuss);
        },

        deleteAttachment: function (paras) {
            paras = $.extend({
                url: Return.AttachURL,
                service: Return.Service.DeleteAttachment
            }, paras);
            doCmd(paras);
        },

        doLogin: function (username, password, sessionPara, mode, opts) {

            var rsa = new RSAKey();
            var publicKey = Svr.SvrMgr.getPublicKey({async: false});
            rsa.setPublic(publicKey.modulus, publicKey.exponent);


            var loginInfo = {};
            loginInfo.user = username;
            loginInfo.password = password;
            loginInfo.mode = mode;

            var data = rsa.encrypt($.toJSON(loginInfo));
            data = BASE64.encoder(data);


            opts = $.extend({
                url: Return.ServletURL,
                logininfo: data,
                paras: $.toJSON(sessionPara),
                cmd: "Login",
                service: Return.Service.Authenticate
            }, opts);
            var success = function(result) {
                if (result) {
                    if (opts.cmd == "Login") {
                        $.cookie("userName", result.Name);
                        var time = result.Time;
                        var date = new Date(time);
                        var dateStr = date.Format("yyyy/MM/dd HH:mm:ss");
                        $.cookie("login_time", dateStr);
                        if(result.SessionParas) {
                        	$.cookie("sessionParas", result.SessionParas);
                        }
                    }
                    location.reload();
                }
            };
            doCmd(opts, null, success);
        },

        doLogout: function (paras) {
//	        YIUI.Print.delAll();
            paras = $.extend({
                url: Return.ServletURL,
                cmd: "Logout",
                service: Return.Service.Authenticate
            }, paras);
            var success = function(result) {
                if (result) {
                    if (paras.cmd == "Login") {
                        $.cookie("userName", result.Name);
                    }
//                    location.href = $.cookie("url");
                    window.location.reload();
                }
            };
            doCmd(paras, null, success);
        },

        getPublicKey: function (paras) {
            paras = $.extend({
                url: Return.ServletURL,
                isWeb: true,
                service: Return.Service.GetPublicKey
            }, paras);
            return doCmd(paras, null);
        },

        dealWithPureData: function (paras) {
            paras = $.extend({
                url: Return.ServletURL,
                service: Return.Service.PureFormData
            }, paras);
            return doCmd(paras);
        },
        
        delPureData: function(paras) {
        	paras = $.extend({
                url: Return.ServletURL,
                service: Return.Service.DelFormData
            }, paras);
            return doCmd(paras);
        },

        loadFormData: function (paras) {
            paras = $.extend({
                url: Return.ServletURL,
                service: Return.Service.PureFormData
            }, paras);
            return doCmd(paras);
        },
        doGoToPage: function(paras) {
        	paras = $.extend({
                url: Return.ServletURL,
                service: Return.Service.GoToPage
            }, paras);
            return doCmd(paras);
        },
        doDictViewEvent: function(paras) {
        	paras = $.extend({
                url: Return.ServletURL,
                service: Return.Service.PureDictView
            }, paras);
            return doCmd(paras);
        },
        
        doMapEvent: function(paras) {
        	paras = $.extend({
                url: Return.ServletURL,
                service: Return.Service.PureViewMap
            }, paras);
            return doCmd(paras);
        },
        
        cutImg: function(paras) {
        	paras = $.extend({
                url: Return.ServletURL,
                service: "CutImage"
            }, paras);
            return doCmd(paras);
        }
    };
    Return.ServletURL = [window.location.protocol, '//', window.location.host, '/', service, '/', 'servlet'].join('');
    Return.UIProxyURL = [window.location.protocol, '//', window.location.host, '/', service, '/', 'uiproxy'].join('');
    Return.AttachURL = [window.location.protocol, '//', window.location.host, '/', service, '/', 'attach'].join('');
    var doCmd = function (paras, rootDom, success, error) {    //静态私有方法
    	var returnObj;
    	if(paras.async == true) {
    		returnObj = Svr.Request.getAsyncData(paras.url, paras, success, error);
    	} else {
    		returnObj = Svr.Request.getSyncData(paras.url, paras, success, error);
    	}
        return returnObj;
    };
    return Return;
})();YIUI.DictService = (function () {
	var Return = {
		/**
		 * 获取所有父节点ID
		 */
		getAllParentID : function(itemKey, itemDatas, callback){
			var result = true;
			var data = {};
			data.itemKey = itemKey;
			data.itemDatas = $.toJSON(itemDatas);
			data.service = "DictService";
			data.cmd = "GetParentPath";
			var success = function(msg) {
				if ($.isFunction(callback)){
					callback(msg);
				}else{
					result = msg;
				}
			};

			Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, data, success);
			return result;
		},
		
		/**
		 * 根据父节点获取子节点
		 */
		getDictChildren: function(itemKey, itemData, filter, stateMask, callback){
			var result = true;
			var data = {};
			data.itemKey = itemKey;
			data.itemData = $.toJSON(itemData);
			if(filter!=null){
				data.filter = $.toJSON(filter);
			}
			data.service = "WebDictService";
			data.cmd = "GetDictChildren";
			data.stateMask = stateMask;
			
			var success = function(msg) {
				if ($.isFunction(callback)){
					callback(msg);
				}else{
					result = msg;
				}
			};

			Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, data, success);
			return result;
		},
		
		/**
		 * 精确查找
		 */
		locate: function(itemKey, field, value, filter, root, statMask, callback){
			var result = true;
			var data = {};
			data.itemKey = itemKey;
			if(field != null){
				data.field = field;
			}
			data.value = value;
			if(filter != null){
				data.filter = $.toJSON(filter);
			}
			data.root = $.toJSON(root);
			data.statMask = statMask;
			
			data.service = "DictService";
			data.cmd = "Locate";
			
			var success = function(msg) {
				if ($.isFunction(callback)){
					callback(msg);
				}else{
					result = msg;
				}
			};

			Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, data, success);
			return result;
		},
		
		/**
		 * 获取一个字典缓存
		 */
		getItem: function(itemKey, oid, statMask, callback) {
			var data = {};
			data.itemKey = itemKey;
			data.oid = oid;
			data.statMask = statMask;
			data.cmd = "GetItem";
			data.service = "WebDictService";
			
			var result = true;
			var success = function(msg) {
				var item = null;
				if(msg){
					item = YIUI.DataUtil.fromJSONItem(msg);
				}
				if ($.isFunction(callback)){
					callback(item);
				}else{
					result = item;
				}
			};

			Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, data, success);
			return result;
			
			
		},
		
		/**
		 * 模糊查询　用于dictQueryPane 与　链式字典的dictView
		 */
		getQueryData: function(itemKey, startRow, maxRows, pageIndicatorCount, fuzzyValue, stateMask, filter, root, callback){
			var result = true;
			var data = {};
			data.itemKey = itemKey;
			data.startRow = startRow;
			data.maxRows = maxRows;
			data.pageIndicatorCount = pageIndicatorCount;
			data.value = fuzzyValue;
			data.stateMask = stateMask;
			
			if(filter != null){
				data.filter = $.toJSON(filter);
			}
			if(root != null){
				data.root = $.toJSON(root);
			}
			data.service = "WebDictService";
			data.cmd = "GetQueryData";
			
			var success = function(msg) {
				if ($.isFunction(callback)){
					callback(msg);
				}else{
					result = msg;
				}
			};

			Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, data, success);
			return result;
		},
		
		/**
		 * 直接输入文本时智能提示相关数据
		 */
		getSuggestData: function(itemKey, suggestValue, statMask, filter, root, callback){
			var result = true;
			var data = {};
			data.itemKey = itemKey;
			data.value = suggestValue;
			data.statMask = statMask;
			if(filter != null){
				data.filter = $.toJSON(filter);
			}
			if(root != null){
				data.root = $.toJSON(root);
			}
			data.service = "WebDictService";
			data.cmd = "GetSuggestData";
			
			var success = function(msg) {
				if ($.isFunction(callback)){
					callback(msg);
				}else{
					result = msg;
				}
			};
			Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, data, success);
			return result;
		},
		
		/**
		 * 获取当前节点的父节点ID
		 */
		getParentID: function(itemKey, itemData, callback){
			var result = true;
			var data = {};
			data.itemKey = itemKey;
			data.itemData = $.toJSON(itemData);
			data.cmd = "GetParentID";
			data.service = "WebDictService";
			
			var success = function(msg) {
				if ($.isFunction(callback)){
					callback(msg);
				}else{
					result = msg;
				}
			};

			Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, data, success);
			return result;
			
		},
		
		/**
		 * 修改字典使用状态
		 */
		enableDict: function(itemKey, oid, enable, allChildren, callback){
			var result = true;
			var data = {};
			data.itemKey = itemKey;
			data.oid = oid;
			if(typeof(enable) == undefined || enable == null){
				enable = 1;
			} 
			data.enable = enable.toString();
			data.allChildren = allChildren
			data.cmd = "EnableDict";
			data.service = "WebDictService";
			
			var success = function(msg) {
				if ($.isFunction(callback)){
					callback(msg);
				}else{
					result = msg;
				}
			};

			Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, data, success);
			return result;
		},
		
		/**
		 * 根据字典itemKey id取caption
		 */
		getCaption: function(itemKey, oid, callback){
			var result = true;
			var data = {};
			data.itemKey = itemKey;
			data.oids = $.toJSON(oid);

			data.cmd = "getCaption";
			data.service = "WebDictService";
			
			var success = function(msg) {
				if ($.isFunction(callback)){
					callback(msg);
				}else{
					result = msg;
				}
			};

			Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, data, success);
			return result;
		},
		
		getDictValue: function(itemKey, oid, fieldKey, callback){
            if(oid == undefined || oid == null) return null;
			var result = true;
			var data = {};
			data.itemKey = itemKey;
			data.oid = oid.toString();
			data.fieldKey = fieldKey;
			
			data.cmd = "GetDictValue";
			data.service = "WebDictService";
			
			var success = function(msg) {
				if ($.isFunction(callback)){
					callback(msg);
				}else{
					result = msg;
				}
			};

			Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, data, success);
			return result;
		},
        
        getTreePath: function(itemKey, child) {
        	var paras = {
    			service: "DictService",
    			cmd: "GetParentPath",
    			itemKey: itemKey,
    			itemData: $.toJSON(child)
        	};
            var result = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
            return result;
        },
        
        getParentPath: function(itemKey, child) {
        	var paras = {
    			service: "DictService",
    			cmd: "GetParentPath",
    			itemKey: itemKey,
    			itemData: $.toJSON(child)
        	};
            var result = Svr.Request.getSyncData(Svr.SvrMgr.ServletURL, paras);
            return result;
        }
		
	    
	}
	return Return;
})();