/**
 * Created with IntelliJ IDEA.
 * User: zhufw
 * Date: 14-3-20
 * Time: 下午4:30
 * To change this template use File | Settings | File Templates.
 */
(function () {
	YIUI.Yes_Dict2 = function(options){
		var Return = {
			
			independent : true,

    	    getDictChildren: function(node) {
    	    	console.log('getDictChildren2...');
    	    	var _this = this;
    	    	var def;
    	    	if (_this.secondaryType != 5) {
              		def = _this.getDictService().getAllItems2(_this.getItemKey(), 
                                                     _this.getDictTree().getNodeValue(node), 
                                                     _this.getDictTree().dictFilter,
                                                     _this.getStateMask(),
                                                     _this.formKey,
                                                     _this.fieldKey).then(function(data){
                                                    	 return {data: data};
                                                     });
    	    	} else {
    	    		var pageMaxNum = options.pageMaxNum;
    	    		if (pageMaxNum == null) {
    	    			pageMaxNum = 10;
    	    		}
        	    	def = _this.getDictService().getQueryData(_this.getItemKey(),
        	    								  _this.getDictTree().startRow,
        	    								  pageMaxNum,
        	    								  _this.getDictTree().pageIndicatorCount,
        	    								  _this.getDictTree().fuzzyValue,
        	    								  _this.getStateMask(),
        	    								  _this.getDictTree().dictFilter,
        	    								  _this.getDictTree().getNodeValue(node),
        	    								  _this.formKey,
        	    								  _this.fieldKey);
    	    	}
    	    	return def;
    	    }
		};

    	Return = $.extend(options,Return);
    	Return = new YIUI.Yes_BaseDict(Return);

    	return Return;
	}
})();