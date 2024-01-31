YIUI.RemoteService = (function () {

    function _RemoteService(f){
        this.request = new Svr.Request(f);
    };
    /**
     * 获取一个新增的oid
     */
    _RemoteService.prototype.applyNewOID = function(dataObjectKey) {
        var params = {
                service: "ApplyNewOID",
                dataObjectKey: dataObjectKey
            };
        return this.request.getData(params).then(function(data){
                    return data.OID;
                }).promise();
    };

    /**
     * 获取平台公共密钥
     */
    _RemoteService.prototype.getPublicKey = function (success) {
        var paras = {
                isWeb: true,
                service: "GetPublicKey"
            };

        if(success) {
            return this.request.getSyncData(null, paras, success);
        } else {
            return this.request.getData(paras);
        }
    };

    /**
     * 修改密码
     */
    _RemoteService.prototype.changePWD = function (operatorID, password, newPassword) {
        var paras = {
                service: "SessionRights",
                cmd: "ChangePWD",
                operatorID: operatorID,
                password: password,
                newPassword: newPassword
            };
        return this.request.getSyncData(null, paras);
    };

    /**
     * 设置sessionParas，存放在服务器端
     */
    _RemoteService.prototype.setSessionParas = function(paras) {
        var params = {
                cmd: "SetSessionParas",
                service: "HttpAuthenticate",
                paras: $.toJSON(YIUI.YesJSONUtil.toJSONObject(paras))
            };

        return this.request.getData(params);
    };

    /**
     * 重新迁移
     * @param dataObjectKey 数据对象标识
     */
    _RemoteService.prototype.reMigrate = function (dataObjectKey) {
        var params = {
                service: "Migration",
                cmd: "ReMigrate",
                dataObjectKey: dataObjectKey
            };
        return this.request.getData(params);
    };
    
    _RemoteService.prototype.savePreference = function(formKey,data){
        var params = {
                service: "Preference",
                cmd: "SavePreference",
                formKey: formKey,
                prefData: $.toJSON(data)
            };
        return this.request.getData(params);
    };

    _RemoteService.prototype.loadPreference = function(formKey){
        var params = {
                service: "Preference",
                cmd: "LoadPreference",
                formKey: formKey,
            };
        return this.request.getData(params);
    };

	return _RemoteService;
})();