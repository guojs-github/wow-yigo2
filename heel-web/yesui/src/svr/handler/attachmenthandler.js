YIUI.AttachmentHandler = (function () {
    var Return = {

        deleteAttachment: function (paras) {
            Svr.SvrMgr.deleteAttachment(paras);
        },
        
        preview: function(path, name) {
        	
        }

    };
    Return = $.extend({}, YIUI.Handler, Return);
    return Return;
})();