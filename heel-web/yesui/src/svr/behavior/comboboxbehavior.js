YIUI.ComboBoxBehavior = (function () {
    var Return = {
        checkAndSet:function (options, callback) {
            var oldVal = options.oldVal;
            var newVal = options.newVal;
            if(typeof newVal === 'number') {
                newVal = newVal.toString();
            }
            if (oldVal === newVal) {
                return false;
            }
            if($.isFunction(callback)) {
                callback(newVal);
            }
            return true;
        }
    };
    return $.extend({}, YIUI.BaseBehavior, Return);
})();
