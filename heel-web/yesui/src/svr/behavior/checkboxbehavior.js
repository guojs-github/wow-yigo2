YIUI.CheckBoxBehavior = (function () {
    var Return = {
		checkAndSet: function (options, callback) {
			var oldVal = options.oldVal;
        	var newVal = options.newVal;
            if (oldVal == newVal) {
                return false;
            }
            var v = YIUI.TypeConvertor.toBoolean(newVal);
            if($.isFunction(callback)) {
            	callback(v);
            }
            return true;
        }
    };
    Return = $.extend({}, YIUI.BaseBehavior, Return);
    return Return;
})();
