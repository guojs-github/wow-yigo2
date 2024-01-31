YIUI.UTCDatePickerBehavior = (function () {
    var Return = {
		checkAndSet: function (options, callback) {
			var oldVal = options.oldVal;
        	var newVal = options.newVal;
            if(oldVal instanceof Date && $.isNumeric(newVal)){
                oldVal = oldVal.getTime();
            }
            newVal = YIUI.UTCDateFormat.format(newVal, options);
            
            if((oldVal == 0 || oldVal == undefined) && (newVal == 0 || newVal == undefined)) {
                return false;
            }
            
            if (oldVal == newVal) {
                return false;
            }

            if($.isFunction(callback)) {
            	callback(newVal);
            }
            return true;
        },
        checkValid: function (editOpt,value) {
            if( $.isNumeric(value) ) {
                return value;
            } else if ( !isNaN(Date.parse(value)) ) {
                return value;
            }
            return '';
        }
    };
    Return = $.extend({}, YIUI.BaseBehavior, Return);
    return Return;
})();
