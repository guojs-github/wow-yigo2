"use strict";
YIUI.NumberEditorBehavior = (function () {
    var Return = {
		checkAndSet: function (options, callback) {
			var oldVal = options.oldVal;
        	var newVal = options.newVal;

            oldVal = YIUI.TypeConvertor.toDecimal(oldVal);

            var isChange = false;

            if( options.byZero ) {
                newVal = new Decimal(0);

                isChange = !oldVal.eq(newVal);

                if(isChange && $.isFunction(callback)) {
                    callback(newVal);
                }

                return isChange;
            }

            var decScale = $.isDefined(options.scale) ? options.scale : 2;
        	var roundingMode = $.isDefined(options.roundingMode) ? options.roundingMode : YIUI.NUMBEREDITOR_ROUNDINGMODE.HALF_UP;

            var d = null;
    		if (newVal != null) {
    		    d = YIUI.TypeConvertor.toDecimal(newVal);
    			newVal = d.round(decScale, roundingMode);
    		}else{
                newVal = new Decimal(0);
            }

            isChange = !oldVal.eq(newVal);
            
            if (options.stripTrailingZeros && $.isFunction(callback)) {
            	callback(newVal);
                return isChange;
            }

            if(isChange && $.isFunction(callback)) {
            	callback(newVal);
            }
            
            return isChange;
        },
        checkValid: function (editOpt,value) {
		    if( value ) {
		        value = value.replace(/,/g,''); // 替换所有的","
                if( $.isNumeric(value) || value == '-' ) {
                    return value;
                }
            }
            return '';
        }
    };
    Return = $.extend({}, YIUI.BaseBehavior, Return);
    return Return;
})();
