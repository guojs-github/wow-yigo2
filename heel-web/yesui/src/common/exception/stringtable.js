
(function(){
	YIUI.StringTable = {
		getString: function(/*locale, */key) {
			if(this.hasOwnProperty(key)){
				return this[key];
			}
			return key;
		},

		format: function(format, args, startPos) {

			var isLetterOrDigit = function(c) {
			    if($.isNumeric(c)) return true;
			    // A-Z: 65-90  a-z: 97-122
			    if((c.charCodeAt() > 65 && c.charCodeAt() < 90) || (c.charCodeAt() > 97 && c.charCodeAt() < 122)) return true;
			};

			var split = function(format) {
			    var length = format.length;
			    var v = new Array();
			    var l_i = 0;
			    var i = 0;
			    while ( i < length ) {
			        var c = format.charAt(i);
			        if ( c == '{' ) {
			            var s_b = i;
			            var s_e = -1;
			            // 潜在的参数
			            ++i;
			            if ( i < length ) {
			                c = format.charAt(i);
			                // 判断是否为字母或数字
			                if ( isLetterOrDigit(c) ) {
			                    while ( (isLetterOrDigit(c) || c == '_')  && i < length ) {
			                        ++i;
			                        c = format.charAt(i);
			                    }
			                    if ( i < length ) {
			                        if ( c == '}' ) {
			                            s_e = i;
			                        }
			                        ++i;
			                    }
			                } else {
			                    ++i;
			                }
			            }
			            if ( s_e != -1 ) {
			                // 生成之前的字符串
			                if ( l_i < s_b ) {
			                    v.add(format.substring(l_i, s_b));
			                }
			                
			                // 找到一个参数
			                var s = format.substring(s_b + 1, s_e);
			                var p = {tag: s};
			                v.add(p);
			                
			                l_i = s_e + 1;
			            }
			        } else {
			            ++i;
			        }
			    }
			    if ( l_i < i ) {
			        v.add(format.substring(l_i));
			    }
			    return v;
			};

		    var v = split(format);
		    var temp = new Array();
		    var index = 1;
		    for (var i = 0, len = v.length; i < len; i++) {
		        var obj = v[i];
		        if (typeof obj == "object") {
		            index = parseInt(obj.tag) - 1 + startPos;
		            if(index < args.length){
		                temp.add(args[index]); 
		            }
		        } else {
		            temp.add(obj);
		        }
		    }
		    var result = temp.join("");
		    return result;
		}
	}
		
})();