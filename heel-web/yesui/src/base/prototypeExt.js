(function ($) {
	if(!Array.prototype.indexOf) {
		Array.prototype.indexOf = function(obj) {
			for (var i = 0; i < this.length; i++) {
				if(this[i] == obj) return i;
			}
			return -1;
		}
	}
	if(!Array.dim) {
		Array.dim = function (dimension,initial) {
			var a = [],i;
			for( i = 0;i < dimension;i++ ) {
				a[i] = initial;
			}
			return a;
        }
	} 
	if(!String.prototype.trim) {
		String.prototype.trim = function() {
			return this.replace(/^\s+|\s+$/g, "");
		}
	}
	if(!String.prototype.isEmpty) {
		String.prototype.isEmpty = function() {
			return this.length == 0;
		}
	}
	if(!String.prototype.equalsIgnoreCase) {
		String.prototype.equalsIgnoreCase = function(str) {
			var equals = false;
			if(str == null) {
				equals = this == str;
			} else {
				str = str.toString();
				equals = this.toLowerCase() == str.toLowerCase();
			}
			return equals;
		}
	}
	if(!String.prototype.startsWith) {
		String.prototype.startsWith = function (prefix) {
			return this.slice(0,prefix.length) === prefix;
		}
	}
	if(!String.prototype.endsWith) {
		String.prototype.endsWith = function (suffix) {
			return this.indexOf(suffix,this.length - suffix.length) !== -1;
		}
	}
	if(!String.prototype.deleteCharAt) {
		String.prototype.deleteCharAt = function (idx) {
			if( idx < 0 || idx >= this.length ) {
                return this.valueOf();
			} else if ( idx == 0 ) {
				return this.substring(1);
			} else if ( idx == this.length - 1 ) {
				return this.substring(0,this.length - 1);
			} else {
				return this.substring(0,idx) + this.substring(idx + 1);
			}
        }
	}
	if(!String.prototype.insert) {
		String.prototype.insert = function (idx,str) {
			if( !str ) return this.valueOf();
			if( idx == 0 ) return str + this.valueOf();
			if( idx == this.length - 1 ) return this.valueOf() + str;
			return this.substring(0,idx) + str + this.substring(idx);
        }
	}
	if(!window.console) {
		window.console = {};
		console.log = function() {
			return;
		}
	}

	Date.prototype.Format = function(fmt) {
		var o = {
			"M+" : this.getMonth()+1, //月份
			"d+" : this.getDate(), //日
			"h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时
			"H+" : this.getHours(), //小时
			"m+" : this.getMinutes(), //分
			"s+" : this.getSeconds(), //秒
			"q+" : Math.floor((this.getMonth()+3)/3), //季度
			"S" : this.getMilliseconds() //毫秒
		};
		if(/(y+)/.test(fmt)){
			fmt = fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
		}
		for(var k in o){
			if(new RegExp("("+ k +")").test(fmt)){
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
			}
		}
		return fmt;
	};

	/** 重写Date的toJSON方法,解决JSON.stringify差8个小时的问题*/
	Date.prototype.toJSON = function () {
		return this.toLocaleString();
    }

    if(!Object.create){
    	Object.create = function(proto){
    		function F(){};
    		F.prototype = proto;
    		return new F;
    	}
    }
})(jQuery);