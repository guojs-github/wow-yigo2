YIUI.BPM_TAG = YIUI.BPM_TAG || {};
YIUI.InplaceToolBar = function(options) {
	var Return = {
		tag: options.tag || "BPM",
		init: function(options) {
			$.extend(this, options);
		},
		replace: function(form, metaOperation) {
			var instance = YIUI.BPM_TAG[this.tag];
			if(instance) {
				return instance.replace.apply(instance, arguments);
			}
			return null;
		}
	}
	return Return;
};