var Interop = Interop || {};
(function () {
	Interop.exec = function(formID, formula, args) {
		if ( window.webkit.messageHandlers.eval ) {
			var msg = {
				form: formID,
				script: formula,
				args: args
			};
			window.webkit.messageHandlers.eval.postMessage(JSON.stringify(msg));
		}
	};
})();
