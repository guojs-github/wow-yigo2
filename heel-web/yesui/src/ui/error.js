
(function() {
    YIUI.Error = (function() {

        var rt = {
            throwE: function(error) {
            	console.log(error);
                console.log(error.stack);
            	if(error.stack){
            		var msg = error.message;
            	}else{
            		var index = error.indexOf(":");
            		var msg = error.substring(index + 1, error.length);
            	}
                
                var dialog = $("<div></div>").attr("id", "error_dialog");
                dialog.modalDialog(msg, {title: YIUI.I18N.getString("TITLE_ERROR","错误"), showClose: true, type: "error", height: 170, width: 460});
            }
        };
        return rt;
    })();
})();
