/**
 * 下推服务代理
 *  WebMapData 为 临时 后台服务， 之后会与MapData 合并。
 */
YIUI.DataMapService = (function () {

	function _DataMapService(f){
		this.request = new Svr.Request(f);
	}

	/**
	 * 中间层批量下推
	 */
	_DataMapService.prototype.batchMidMap = function(mapKey, oids) {
        var paras = {
            service: "MapData",
            cmd: "BatchMidMap",
            MapKey: mapKey,
            OIDListStr: $.toJSON(oids)
        };
        this.request.getSyncData(null, paras);
        return true;
    };

	_DataMapService.prototype.mapData = function(mapKey, srcFormKey, tgtFormKey, srcDoc, tgtDoc){
    	var paras = {
    		service: "WebMapData",
    		cmd: "Map",
    		mapKey: mapKey,
            tgtFormKey: tgtFormKey,
            srcFormKey: srcFormKey,
            srcDoc: $.toJSON(srcDoc),
            tgtDoc: tgtDoc ? $.toJSON(tgtDoc) : ""
        };

        return this.request.getData(paras);
    };

	_DataMapService.prototype.midMap = function(mapKey, oid){
    	var paras = {
    		service: "MapData",
    		cmd: "MidMap",
    		mapKey: mapKey,
            srcOID: oid
        };

        return this.request.getData(paras);
    };

	_DataMapService.prototype.autoMap = function(mapKey, srcDoc){
    	var paras = {
    		service: "MapData",
    		cmd: "MidMap",
    		mapKey: mapKey,
    		srcOrignalDocument: $.toJSON(srcDoc),
            saveTarget: true
        };

        return this.request.getData(paras);
    };

	return _DataMapService;
})();