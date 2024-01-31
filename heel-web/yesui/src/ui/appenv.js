YIUI.AppEnv = YIUI.extend({
	init: function () {
		this.appKey = null;
	},

	setAppKey: function(appKey){
		this.appKey = appKey;
	},

	getAppKey: function(){
		return this.appKey;
	}
});