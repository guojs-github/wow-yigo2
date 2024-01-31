YIUI.DatePickerBehavior = (function () {
    var Return = {
		checkAndSet: function (options, callback) {
            var oldVal = options.oldVal;
            var newVal = options.newVal;

            oldVal = YIUI.TypeConvertor.toDate(oldVal);
            newVal = YIUI.TypeConvertor.toDate(newVal);

            if(newVal && options.onlyDate){
                var yyyy = newVal.getFullYear();
                var mm = newVal.getMonth();
                var dd = newVal.getDate();
                newVal = new Date(yyyy, mm, dd, 0, 0, 0);
            }

            var oldTime = oldVal ? oldVal.getTime() : 0,
                newTime = newVal ? newVal.getTime() : 0;

            if(oldTime == newTime) {
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
