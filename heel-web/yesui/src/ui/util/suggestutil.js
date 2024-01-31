YIUI.SuggestUtil = (function () {

    var getMin = function (a, b, c) {
    	return (a < b)?(a < c ? a:c):(b<c? b:c);
    };

    var getMinEditDistance = function (str1, str2) {
    	var sWeight = 1;//s代表substitution:替换
		var iWeight = 1;//i代表insert：插入
		var dWeight = 1;//d代表delete：删除
		
		var m = str1.length;
		var n = str2.length;
		var distance = new Array();
		for (var i = 0; i < m+1; i++) {
			distance[i] = new Array();
		}
		//初始化特殊值
		for (var i = 0; i < m+1; i++) {
			distance[i][0] = i;
		}
		for (var i = 0; i < n+1; i++) {
			distance[0][i] = i;
		}
		
		//递推遍历填充整个距离矩阵
		for (var i = 1; i <= m; i++) {
			for (var j = 1; j <= n; j++) {
				distance[i][j] = getMin(
						distance[i-1][j] + dWeight, 
						distance[i][j-1] + iWeight, 
						distance[i-1][j-1] + (str1.charAt(i-1) == str2.charAt(j-1)? 0:sWeight));
			}
		}
		return distance[m][n];
    };


    var sort = function (items, text) {
    	//获得最小编辑距离数组，第一数组存的是编辑距离，第二个数组存的是文本索引序号
		var minArray = new Array();
		for (var i = 0; i < 2; i++) {
			minArray[i] = new Array();
		}
		for (var i = 0; i < items.length; i++) {
			minArray[0][i] = getMinEditDistance(text, items[i].caption);
			minArray[1][i] = i;
		}
		
		//把数组按照从小到大排序
		var temp1 = 0;
		var temp2 = 0;
		for (var i = 0; i < minArray[0].length; i++) {
			for (var j = 0; j < minArray[0].length - i - 1; j++) {
				if(minArray[0][j] > minArray[0][j+1]){
					temp1 = minArray[0][j+1];
					minArray[0][j+1] = minArray[0][j];
					minArray[0][j] = temp1;
					
					temp2 = minArray[1][j+1];
					minArray[1][j+1] = minArray[1][j];
					minArray[1][j] = temp2;
				}
			}
			
		}
		
		//得到排序后的MenuItem集合
		var index = 0, newItems = [];
		for (var i = 0; i < minArray[1].length; i++) {
			index = minArray[1][i];
			newItems.push(items[index]);
			 if (newItems.length == 5) break;
		}
		return newItems;
    };

    return {
    	sort: sort
    }

})();