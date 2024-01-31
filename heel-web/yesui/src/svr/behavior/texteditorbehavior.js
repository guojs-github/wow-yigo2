YIUI.TextEditorBehavior = (function () {

    var getSetting = function (options) {
        return {
            trim: options.trim || false,
            textCase: $.isDefined(options.caseType) ? options.caseType : YIUI.TEXTEDITOR_CASE.NONE,
            maxLength: options.maxLength || 255,
            invalidChars: options.invalidChars || ""
        };
    }

    var Return = {
        checkAndSet: function (options, callback) {
            var oldVal = options.oldVal;
            var newVal = options.newVal;
            if (oldVal === newVal) {
                return false;
            }

            var strV = YIUI.TextFormat.format(newVal, getSetting(options));

            if($.isFunction(callback)) {
                callback(strV);
            }
            return oldVal !== strV;
        },
        checkValid: function (editOpt,value) {
            return YIUI.TextFormat.format(value, getSetting(editOpt.editOptions));
        }
    };
    Return = $.extend({}, YIUI.BaseBehavior, Return);
    return Return;
})();