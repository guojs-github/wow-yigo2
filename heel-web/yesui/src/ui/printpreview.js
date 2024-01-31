(function () {
	var _win = window;
	var PDFData = "";
	if(!_win.getPDFData) {
		_win.getPDFData = function() {
			return PDFData;
		};
	}
	var PrintPreviewHTML = "";
	var service = Svr.baseurl.substring(0, Svr.baseurl.indexOf('/'));
	if(service) {
        PrintPreviewHTML = [window.location.protocol, '//', window.location.host, '/', service, '/'].join('');
    } else {
        PrintPreviewHTML = [window.location.protocol, '//', window.location.host, '/'].join('');
	}
	PrintPreviewHTML += "yesui/src/ui/plugin/js/pdfjs/web/viewer.html";
	
	var printForIE = function(data) {
		function _base64ToArray(dataURI) {
			var BASE64_MARKER = ",;base64";
			var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;

			var binary_string = window.atob(dataURI);
			var len = binary_string.length;
			//转换成pdf.js能直接解析的Uint8Array类型
			var bytes = new Uint8Array(len);
			for (var i = 0; i < len; i++) {
				bytes[i] = binary_string.charCodeAt(i);
				
			}
			return bytes;
		}
		var bstr = atob(data);
		var n = bstr.length;
		var u8arr = new Uint8Array(n);
		while(n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		var blob = new Blob([u8arr]);
		var fileName = 'document(' + YIUI.DateFormat.format(new Date()) + '.'+(new Date()).getMilliseconds()+').pdf';
		window.navigator.msSaveOrOpenBlob(blob, fileName);
	};

	YIUI.Print = {
		print: function(data, formID) {
			if($.browser.isIE) {
				printForIE(data);
			} else {
				PDFData = data;
				var iframe = $("<iframe class='print' id='print_" + formID + "' src='" + PrintPreviewHTML + "' '></iframe>");
				iframe.appendTo(_win.document.body);
				var win = iframe[0].contentWindow;
				win.getPDFData = _win.getPDFData;
				win.isPrint = true;
			}
		},
		del: function(formID) {
			var iframe = $("iframe[id='print_" + formID + "']", document.body);
   			iframe.remove();
		},
		delAll: function() {
			$("iframe.print").remove();
		}
	};
    YIUI.PrintPreview = function (data) {
		if($.browser.isIE) {
			printForIE(data);
		} else {
			PDFData = data;
			var newWindow = _win.open(PrintPreviewHTML, Math.random());
			newWindow.getPDFData = _win.getPDFData;
		}
    }
})();