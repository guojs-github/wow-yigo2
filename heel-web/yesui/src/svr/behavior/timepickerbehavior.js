YIUI.TimePickerBehavior = (function(){
	var Return ={
		checkAndSet	: function(options, callback){
			var oldVal = options.oldVal;
        	var newVal = options.newVal;
        	
        	options.oldVal == 0 ? oldVal = null : oldVal;

            if(options.dataBinding){
                if(newVal　&&　options.dataBinding.defaultFormulaValue  && newVal instanceof Date){
                    newVal = newVal.Format(options.format);
                    newVal= parseInt(newVal.replace(/:/g,""));
                }
            }
        	
        	if (oldVal === newVal) {
                return false;
            }
            if($.isFunction(callback)) {
            	if(newVal){
            		newVal = YIUI.TypeConvertor.toInt(newVal);
				}
                callback(newVal);
            }
            return true;
		}
	};
	Return = $.extend({}, YIUI.BaseBehavior, Return);
	return Return;
})();