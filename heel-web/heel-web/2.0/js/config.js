/*
	Yigo2.0 config.
	2022.12.7 GuoJS created.
*/

var heelWeb = heelWeb || {};

heelWeb.config = (new function () {
	let _key = 'yigo2.0';
	let _defaultConfig = {
		mourningDay: ['2022-12-01']
	};
	let _config = {};
	
	this.load = function() {
		console.log('yigo2.0 config load');
		let val = myApi.storage.getItem(_key);
		
		if ('' == val){
			_config = {};
		} else {
			_config = JSON.parse(val);
		}		
		
		// 合并自定义配置与默认配置
		Object.assign(_config, _defaultConfig);
	};
	
	this.update = function() {
		// console.log('yigo2.0 config update');
		myApi.storage.setItem(_key, JSON.stringify(_config));
	};

	this.get = function(name) {
		// console.log('yigo2.0 config get:' + name);
		return _config[name];
	};
	
	this.set = function(name, val) {
		// console.log('yigo2.0 config set:' + name + ',' + val);
		_config[name] = val; 
	};

	this.isMourningDay = function() {
		let today = myApi.time.formatDate(new Date());

		for (let i = 0; i < _config.mourningDay.length; i++) {
			if (_config.mourningDay[i] == today) {
				return true;
			}
		}
			
		return false;
	};
}());	