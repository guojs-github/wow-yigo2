(function() {
	YIUI.RTS_Service = function() {
		var rt = {
				getUserData: function(pageNum, maxRows, pageIndicatorCount, fuzzyValue, itemKey) {
					var paras = {
							service: "DictService",
							cmd: "GetQueryData",
							itemKey: itemKey,
							startRow: pageNum*maxRows,
						 	maxRows: maxRows,
							pageIndicatorCount: pageIndicatorCount,
							value: fuzzyValue
					};
					return new Svr.Request().getData(paras);
				},
				LoadRightsList: function(operatorID, roleID) {
					var paras = {
							cmd: "LoadSetRightsList",
							service: "SetRightsService",
							operatorID: operatorID,
							roleID: roleID
					};
					return new Svr.Request().getData(paras);
				},
				LoadEntryRightsData: function(operatorID, roleID) {
					var paras = {
						cmd: "LoadEntryRightsData",
						service: "SetRightsService",
						operatorID: operatorID,
						roleID: roleID
					};
					return new Svr.Request().getData(paras);
				},
				SaveEntryRights: function(operatorID, roleID, entryKeys, allRights) {
					var paras = {
							operatorID: operatorID,
							roleID: roleID,
							rights: entryKeys,
							allRights: allRights,
							cmd: "SaveEntryRights",
							service: "SetRightsService"
					};
					return new Svr.Request().getData(paras);
				},
				LoadFormRightsData: function(operatorID, roleID, formKey) {
					var paras = {
							cmd: "LoadFormRightsData",
							service: "SetRightsService",
							formKey: formKey,
							operatorID: operatorID,
							roleID: roleID
					};
					return new Svr.Request().getData(paras);
						
				},
				SaveFormRights: function(operatorID, roleID, formKey, optRts, allOptRts, enableRts, allEnableRts, visibleRts, allVisibleRts) {
					var paras = {
							operatorID: operatorID,
							roleID: roleID,
							cmd: "SaveFormRights",
							service: "SetRightsService",
							allOptRights: allOptRts,
							optRights: optRts,
							allEnableRights: allEnableRts,
							enableRights: enableRts,
							allVisibleRights: allVisibleRts,
							visibleRights: visibleRts,
							formKey: formKey
					};
					return new Svr.Request().getData(paras);
				},
				LoadDictRightsData: function(operatorID, roleID, itemKey, isChain, startRow, fuzzyValue, maxRows, pageIndicatorCount) {
					var paras = {
							cmd: "LoadDictRightsData",
							service: "SetRightsService",
							itemKey: itemKey,
							operatorID: operatorID,
							roleID: roleID
					};
					if(isChain) {
						paras.cmd = "LoadChainDictRightsData";
						paras.startRow = startRow;
						paras.maxRows = maxRows;
						paras.pageIndicatorCount = pageIndicatorCount;
						paras.value = fuzzyValue;
					}
					return new Svr.Request().getData(paras);
				},
				dictExpand: function(operatorID, roleID, itemKey, parentID) {
					var paras = {
						cmd: "LoadDictRightsData",
						service: "SetRightsService",
						itemKey: itemKey,
						parentID: parentID,
						operatorID: operatorID,
						roleID: roleID
					};
					return new Svr.Request().getData(paras);
				},
				getChainDictData: function(operatorID, roleID, itemKey, startRow, maxRows, pageIndicatorCount, fuzzyValue) {
					var paras = {
							cmd: "LoadChainDictRightsData",
							service: "SetRightsService",
							itemKey: itemKey,
							startRow: startRow,
							maxRows: maxRows,
							pageIndicatorCount: pageIndicatorCount,
							value: fuzzyValue,
							operatorID: operatorID,
							roleID: roleID
					};
					return new Svr.Request().getData(paras);
				},
				SaveDictRights: function(operatorID, roleID, isChain, halfCheckRts, delRts, addRts, allRts, saveType, itemKey, emptRts) {
					var paras = {
							operatorID: operatorID,
							roleID: roleID,
							allRights: allRts,
							delRights: delRts,
							addRights: addRts,
							saveType: saveType,
							itemKey: itemKey,
							emptRights: emptRts,
							cmd: "SaveDictRights",
							service: "SetRightsService"
					};
					if(!isChain) {
						paras.halfCheckRights = halfCheckRts;
					}
					return new Svr.Request().getData(paras);
				}
		};
		return rt;
	}();
})();