YIUI.TextEditorHandler = (function () {
    var Return = {
        doEnterPress: function (formID, keyEnter) {
            var form = YIUI.FormStack.getForm(formID);
            var cxt = new View.Context(form);
            if (keyEnter) {
                form.eval(keyEnter, cxt, null);
            }
        }
    };
    Return = $.extend({}, YIUI.Handler, Return);
    return Return;
})();