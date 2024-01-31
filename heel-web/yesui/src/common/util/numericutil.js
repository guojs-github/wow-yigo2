YIUI.NumericUtil = (function () {
    var fraction = ['角', '分'],
        digit = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"],
        unit = [['圆', '万', '亿'],['', '拾', '佰', '仟']];

    var Return = {
        getAmountInWords:function(n) {
            var head = n < 0 ? '负' : '';
            n = Math.abs(n);
            var s = '';
            
            var numJiao = 0 , numFen = 0;            
            
            var parts = n.toString().split(".");
            if (parts.length > 1) {
            	var decimal = parts[1].substr(0, 2);
            	numJiao = parseInt(decimal[0]);
            	if (decimal.length > 1) {
            		numFen = parseInt(decimal[1]);
            	}
            }
            
            n = Math.floor(n);
            for (var i = 0; i < unit[0].length && n > 0; i++) {
                var p = '';
                for (var j = 0; j < unit[1].length && n > 0; j++) {
                    p = digit[n % 10] + unit[1][j] + p;
                    n = Math.floor(n / 10);
                }
                s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
            }

            if (s.length > 0) {
            	s = s.replace(/(零.)*零圆/, '圆').replace(/(零.)+/g, '零');
            } else {
            	s = '零圆';
            }
           
            if (numFen == 0 && numJiao == 0) {
            	s = s + '整';
            } else if (numFen == 0) {
            	s = s + digit[numJiao] + '角整'; 
            } else {
            	if (numJiao == 0) {
            		s = s + '零' + digit[numFen] + '分';
            	} else {
            		s = s + digit[numJiao] + '角' + digit[numFen] + '分'; 
            	}
            }
            
            return head + s.replace(/^整$/, '零圆整');
        }
    };

    return Return;
})();