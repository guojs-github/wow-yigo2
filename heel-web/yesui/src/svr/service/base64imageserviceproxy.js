(function () {

	YIUI.Base64ImageService = (function () {

		function _Base64ImageService(f){
			this.form = f;
			this.request = new Svr.Request(f);
		};

		_Base64ImageService.prototype.loadBase64Image = function(path) {
			var formKey = this.form ? this.form.getFormKey() : "";
			//path = encodeURIComponent(path);
        	
        	var params = {
                    service: "Base64Image",
                    path: path,
                    formKey: formKey,
                    mode: 1,
                    r : Math.random()
                };

        	return this.request.getBase64Image(params);
	       	  
	    };

		return _Base64ImageService;
	})();
})();