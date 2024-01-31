/**
 * Created with JetBrains WebStorm.
 * User: 陈志盛
 * Date: 14-1-8
 * Time: 下午2:00
 * 向服务器发送相关请求及参数，获取返回值进行处理
 */
var Svr = Svr || {};
Svr.baseurl = (function(){
    var location_pathname = document.location.pathname;
    while (location_pathname.indexOf('/') == 0) location_pathname = location_pathname.substr(1);
    return unescape(location_pathname.substr(0));
})();
Svr.SvrMgr = (function () {
    var service = Svr.baseurl.substring(0, Svr.baseurl.indexOf('/'));
    var request = new Svr.Request();
    var Return = {
        Service: {
            Authenticate: "Authenticate",
            DealWithPureForm: "DealWithPureForm",
            // DeleteAttachment: "DeleteAttachment",
            GetPublicKey: "GetPublicKey",
            //PureFormData: "PureFormData",
            //DelFormData: "DeleteData",
            //GoToPage: "GoToPage",
            //PureDictView: "PureDictView",
            PureViewMap: "ViewMap",
            GetAppList: "GetAppList",
            DealWithDocument: "DealWithDocument"
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
    
    	getAppList: function(paras){
    		paras = $.extend({
            	async: false,
                url: Return.ServletURL,
                service: Return.Service.GetAppList
            }, paras);
    		return doCmd(paras);
    	},

        deleteAttachment: function (paras) {
            paras = $.extend({
                url: Return.AttachURL
            }, paras);
            doCmd(paras);
        },

        deleteImage: function (paras) {
            paras = $.extend({
                url: Return.AttachURL
            }, paras);
            doCmd(paras);
        },

        doLogin: function (username, password, sessionPara, validateCode, tmpClientID) {

            var rsa = new RSAKey();

            Svr.SvrMgr.getPublicKey().then(function(publicKey) {
                rsa.setPublic(publicKey.modulus, publicKey.exponent);

                var loginInfo = {};
                loginInfo.user = username;
                loginInfo.password = password;
                loginInfo.validatecode = validateCode;

                var data = rsa.encrypt_b64($.toJSON(loginInfo));

                var opts = {
                    url: Return.ServletURL,
                    logininfo: data,
                    tmpclientid: tmpClientID,
                    paras: $.toJSON(sessionPara),
                    cmd: "Login",
                    service: Return.Service.Authenticate
                }
                var success = function(result) {
                    if (result) {
                        $.cookie("userName", result.Name);
                        $.cookie("oldURL",window.location.href);
                        $.cookie("tmpClientID",null);
                        $.cookie("userID", result.UserID);
                        $.cookie("clusterid", result.clusterID);
                        var time = result.Time;
                        var date = new Date(time);
                        var dateStr = date.Format("yyyy/MM/dd HH:mm:ss");
                        $.cookie("login_time", dateStr);
                        if(result.SessionParas) {
                          $.cookie("sessionParas", result.SessionParas);
                        }
                        location.reload();
                    }
                };
                doCmd(opts, null, success);
                
            });
        },

        // 默认异步注销
        doLogout: function (paras,callback) {
            paras = $.extend({
                cmd: "Logout",
                async: true,
                service: Return.Service.Authenticate
            }, paras);
            if( paras.async ) {
                return request.getData(paras);
            }
            return request.getSyncData(Svr.SvrMgr.ServletURL,paras,callback);
        },

        getPublicKey: function (paras) {
            paras = $.extend({
                isWeb: true,
                service: Return.Service.GetPublicKey
            }, paras);
            return request.getData(paras);
        },

        cutImg: function(paras) {
        	paras = $.extend({
                url: Return.ServletURL,
                service: "CutImage"
            }, paras);
            return doCmd(paras);
        },

        loadGanttData: function(paras, success) {
            paras = $.extend({
                url: Return.ServletURL,
                service: "Gantt",
                cmd: "LoadGanttData"
            }, paras);
            return doCmd(paras, null, success);
        },

        saveGanttData: function(paras, success) {
            paras = $.extend({
                url: Return.ServletURL,
                service: "Gantt",
                cmd: "SaveGanttData"
            }, paras);
            return doCmd(paras, null, success);
        },

        loadForm: function(paras, success) {
            paras = $.extend({
                url: Return.ServletURL,
                service: "LoadForm"
            }, paras);
            return doCmd(paras, null, success);
        }
    };

    if(service){
        Return.ServletURL = [window.location.protocol, '//', window.location.host, '/', service, '/', 'servlet'].join('');
        Return.AttachURL = [window.location.protocol, '//', window.location.host, '/', service, '/', 'attach'].join(''); 
    }else{
        Return.ServletURL = [window.location.protocol, '//', window.location.host, '/', 'servlet'].join('');
        Return.AttachURL = [window.location.protocol, '//', window.location.host, '/', 'attach'].join('');  
    }

    var doCmd = function (paras, rootDom, success, error) {    //静态私有方法
    	var returnObj;
    	if(paras.async == true) {
    		returnObj = request.getAsyncData(paras.url, paras, success, error);
    	} else {
    		returnObj = request.getSyncData(paras.url, paras, success, error);
    	}
        return returnObj;
    }
    return Return;
})();