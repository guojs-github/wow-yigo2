/**
 * Created by 陈瑞 on 2007/6/5 use WebStorm.
 */
YIUI.CheckListBoxBehavior = (function () {
    var Return = {
        checkAndSet:function (options,callback) {
            var oldVal = options.oldVal,
                newVal = options.newVal;
            oldVal = YIUI.TypeConvertor.toString(oldVal),
            newVal = YIUI.TypeConvertor.toString(newVal);

            if( oldVal === newVal ) {
                return false;
            }

            if( $.isFunction(callback) ) {
                callback(newVal);
            }

            return true;
        }
    }
    return $.extend({},YIUI.BaseBehavior,Return);
})();