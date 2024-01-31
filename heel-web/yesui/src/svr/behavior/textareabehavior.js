YIUI.TextAreaBehavior = (function () {
    var Return = {};
    
    var Return = {
		checkAndSet: function (options, callback) {
			var oldVal = options.oldVal;
        	var newVal = options.newVal;
            if (oldVal == null) {
                oldVal = "";
            }
            if (oldVal == newVal) {
                return false;
            }
            var maxLength = options.maxLength;
            var settings = {maxLength: options.maxLength};
            var strV = YIUI.TextFormat.format(newVal, settings);
            var isChange = (oldVal !== strV);
            if($.isFunction(callback)) {
            	callback(strV);
            }
            return true;
        }
    };
    Return = $.extend({}, YIUI.BaseBehavior, Return);
    return Return;
})();
