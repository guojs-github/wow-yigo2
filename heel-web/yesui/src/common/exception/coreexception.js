// YIUI.Exception = (function () {
	
// 	function _Exception(code, message){
// 		this.code = code;
// 		this.message = message;
// 		this.name = 'YIUI.Exception';
// 	};

// 	_Exception.prototype = new Error();

// 	return _Exception;
// })();
(function() {
	YIUI.Exception = (function () {

		function _Exception(code, message){
			if(code == -1 && !message){
				this.code = -1;
				this.message = YIUI.I18N.getString("SERVER_ERROR","服务端错误");
			}else{
				this.code = (parseInt(code,10)>>>0).toString(16).toLocaleUpperCase();
				this.message = message;
			}
	
			this.name = 'YIUI.Exception';
			this.stack = (new Error()).stack;
		};

		_Exception.prototype = Object.create(Error.prototype);

		return _Exception;
	})();
})();

(function() {
	YIUI.CoreException = (function () {

		function _CoreException(code, message){

			this.code = (parseInt(code,10)>>>0).toString(16).toLocaleUpperCase();
			this.message = message;
			this.name = 'YIUI.CoreException';
			this.stack = (new Error()).stack;
		};

		_CoreException.prototype = Object.create(Error.prototype);

		return _CoreException;
	})();
})();

// function Exception2 (code, message){
// 	this.code = code;
// 	this.message = message;
// 	this.name = 'YIUI.Exception';
// 	this.stack = (new Error()).stack;
// }

// Exception2.prototype = Object.create(Error.prototype);
// Exception2.prototype.constructor = Exception2;