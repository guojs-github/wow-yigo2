/**
 * WEB打印服务代理
 */
YIUI.PrintService = (function () {

	function _PrintService(){

	}
	
	_PrintService.prototype.print = function(form, reportKey, fillEmptyPrint, doc){
    	form.refreshParas();

    	var paras = {
    		service: "WebPrintService",
    		cmd: "PrintPDF",
    		formKey: form.getFormKey(),
    		reportKey: reportKey,
    		fillEmptyPrint: fillEmptyPrint,
    		doc: $.toJSON(doc)
        };
    	paras.parameters = form.getParas().toJSON();

		var formID = form.formID;
		return new Svr.Request(form).getData(paras)
			.then(function(data){
				YIUI.Print.print(data, formID);
			});
    };

	_PrintService.prototype.batchPrint = function(form, formKey, reportKey, OIDs){
    	form.refreshParas();

    	var paras = {
    		service: "WebPrintService",
    		cmd: "BatchPrintPDF",
    		formKey: formKey,
    		reportKey: reportKey,
    		OIDs: $.toJSON(OIDs)
        };
    	paras.parameters = form.getParas().toJSON();

    	var formID = form.formID;
        return new Svr.Request(form).getData(paras)
        			.then(function(data){
                        YIUI.Print.print(data, formID);
                    });
    };

	_PrintService.prototype.printPreview = function(form, reportKey, fillEmptyPrint, doc){
		form.refreshParas();
        var formKey = form.getFormKey();

        var paras = {
    		service: "WebPrintService",
    		cmd: "PrintPDF",
    		formKey: formKey,
    		reportKey: reportKey,
    		fillEmptyPrint: fillEmptyPrint,
    		doc: $.toJSON(doc)
        };

        paras.parameters = form.getParas().toJSON();

        return new Svr.Request(form).getData(paras)
			.then(function(data){
				new YIUI.PrintPreview(data);
			});
    };
	    
	_PrintService.prototype.printGridPreview = function(form, section){
        var formKey = form.getFormKey();

        var paras = {
    		service: "WebPrintService",
    		cmd: "PrintGridPDF",
    		formKey: formKey,
    		section: $.toJSON(section)
        };

        return new Svr.Request(form).getData(paras)
        			.then(function(data){
				        new YIUI.PrintPreview(data);
                    });
    };

	return _PrintService;
})();