/**
 * {
 * 		categories : ['2000','2001','2002','2003','2004'],
 *      
 * 		series : [{
 * 			name : '产量',
 * 			data : [1,2,3,4,5]
 * 		},{
 * 			name : '销售额',
 * 			data : [1,2,3,4,5]
 * 		}]
 * 
 *      转化后的数据格式
 * 		[
		    [[2000,1],[2001,2],[2002,3],[2003,4],[2004,5]],
			[[2000,1],[2001,2],[2002,3],[2003,4],[2004,5]]
		]
 * 
 * 		series : ['产量','销售额'],
 * 		data : [
 * 			[1,2,3,4],
 * 			[1,2,3,4]
 * 		]
 * }
 */



YIUI.Control.Chart = YIUI.extend(YIUI.Control, {
	autoEl: '<div></div>',
	
	/** 图表标题 */
	title : null,
	/** 柱状图分组显示 */
	grouped : true,
	/** 柱状图形的宽度，默认为0.5 */
	barWidth : 0.5,
	/** y轴刻度的最小值 */
	yMin : 0,
	/** x轴刻度的最小值 */
	xMin : null,
	/** 点状显示时内部的填充颜色，为null时内部填充颜色会与外部颜色一致 */
	fillColor : '#FFFFFF',
	
	series : null,
	
	categories : null,
	
	height: 500,
	
	width: 500,
	
	fistStraw: true,
	/*Y轴坐标*/
	yScale : [], 
	/*X轴坐标*/
	xScale : [],
	
	init: function (options) {
		this.base(options);

		this.xScale = [];
        this.yScale = [];
    },

	
	setDataModel: function(dataModel) {
		
		/** 系列数据 */
		var xyData = [];

		if(dataModel) {
			this.series = dataModel.series;
			this.categories = dataModel.categories;
		}

		switch (this.getMetaObj().chartType) {
			case 1 :
				this.horizontal = false;
				this.bars = true;
				this.stacked = true;
				this.grouped = false;
				this.track = false;
				break;
			case 2 :
				this.horizontal = true;
				this.bars = true;
				this.track = true;
				break;
			case 3 :
				this.horizontal = true;
				this.bars = true;
				this.stacked = true;
				this.grouped = false;
				this.track = false;
				break;
			case 4 :
				this.fill = true;
				this.showPoint = true;
				this.showLine = true;
				break;
			case 5 :
				this.fill = false;
				this.showPoint= true;
				this.showLine = true;
				break;
			case 6 :
				this.showPoint= true;
				break;
			case 7 :
				this.pie = true;
				break;
			case 0 : 
			default :
				this.horizontal = false;
				this.bars = true;
				this.track = true;
				break;
		}

		if($.isNumeric(this.categories[0])) {
			for(var i=0, len=this.series.length; i<len; i++) {
				var data = [];
				for(var j=0, len2=this.categories.length; j<len2; j++) {
					if(this.horizontal) {
						data.push([this.series[i].data[j], parseInt(this.categories[j])]);
					} else {
						data.push([parseInt(this.categories[j]), this.series[i].data[j]]);
					}
				}
				data.sort(function(a,b){return a[0]-b[0]});
				 //fill: 是否为区域面积显示  showLine: 是否显示线条  showPoint: 是否显示为点状 
				var datas = {data : data , label : this.series[i].name, 
						     lines : {fill : this.fill, show : this.showLine}, 
						     points : {show : this.showPoint, fillColor : this.fillColor}};
				xyData.push(datas);
				
			}
			if(this.horizontal) {
				for(var i=0,len=xyData[0].data.length;i<len;i++) {
					//this.yScale.push(parseInt(xyData[0].data[i][1]))
					var arrData = parseInt(xyData[0].data[i][1]),
						arr = [arrData,arrData];
					this.yScale.push(arr)
				}		
				this.xScale = null;
			} else {
				for(var i=0,len=xyData[0].data.length;i<len;i++) {
					//this.xScale.push(parseInt(xyData[0].data[i][0]))	
					var arrData = parseInt(xyData[0].data[i][0]),
					    arr = [arrData,arrData];
					this.xScale.push(arr)
				}
				this.yScale = null;
				
			}
		} else {
			for(var i=0, len=this.series.length; i<len; i++) {
				var data = [];
				var len2 = Math.min(this.categories.length, this.series[i].data.length);
				for(var j=0; j<len2; j++) {
					if(this.horizontal) {
						data.push([this.series[i].data[j],j+1]);
					} else {
						data.push([j+1,this.series[i].data[j]]);
					}
				}
				
				if(this.series[i].data.length > 0) {
					//设置Y轴最小值
					//Y轴最小值永久为0
/*					var min = Math.min.apply(this.yMin, this.series[i].data);
					if(min < 0) {
						min += min/10;
					}
					if (this.yMin>min){
						this.yMin = min;
					}*/
					//设置Y轴最大值
					var max = Math.max.apply(null, this.maxData);
				    this.yMax = max + max/10;
				}
				var datas = {data : data , label : this.series[i].name, 
				lines : {fill : this.fill, show : this.showLine}, 
				points : {show : this.showPoint, fillColor : this.fillColor}};
		   		xyData.push(datas);
			}

			if(this.horizontal) {
				for(var i=0;i<this.categories.length;i++) {
					this.yScale.push([i+1,this.categories[i]])
				}			
				this.xScale = null;
			} else {
				this.xScale = [];
				for(var i=0;i<this.categories.length;i++) {
					this.xScale.push([i+1,this.categories[i]])
				}
				this.yScale = null;
			}
		}

		this.xyData = xyData;
		//饼图数据
	    if(this.pie) {
	    	var pieData = [];
	    	for(var j=0, len2=this.categories.length; j<len2; j++) {
	    		var tmpData = this.series[0].data[j];
	    		var pie = {data: [[0, tmpData]], label: this.categories[j]};
	    		pieData.push(pie);
	    	}
	    	this.pieData = pieData;
	    	
	    }
	    if(this.isDraw) {
	    	this.setDraw();
	    } else {
	    	this.isDraw = true;
	    }


	},
	
	onRender: function(ct) {
		this.base(ct);
		this.el.addClass("ui-chart");
		this.dataModel && this.setDataModel(this.dataModel);
	},
	
	onSetWidth : function(width) {
		if(width > 20) {
			this.el.css("width", width-20);
			this.el.css("margin-right", 20);
			this._hasSetWidth = true;
			this.reSetDraw(this._hasSetWidth, this._hasSetHeight);
		}
	},
	
	onSetHeight : function(height) {
		if(height > 30) {
			this.el.css("height", height-30);
			this._hasSetHeight = true;
			this.reSetDraw(this._hasSetWidth, this._hasSetHeight);
		}
	},
	
	reSetDraw: function(hasSetWidth, hasSetHeight) {
		if(hasSetWidth && hasSetHeight) {
			this.setDraw();
		}
	},
	
	/** 画出图表控件 */
	setDraw : function(){
		/** 柱状图为水平方向*/
		if(this.horizontal){
			/** x轴刻度值为null */
			//this.categories = null;
			/** y轴最小刻度 */
			this.yMin = null;
			/** x轴最小刻度值 */
			this.xMin = 0;
		}
		if(this.pie) {
		    Flotr.draw(this.el[0], this.pieData, {
		    	HtmlText:false,
				grid : {
					/** 表格外边框的粗细 */
					outlineWidth : 0,
					/** 表格内部是否显示垂直线条 */
					verticalLines : false,
					/** 表格内部是否显示水平线条 */
					horizontalLines : false
				},
				xaxis : {
					title : this.categoryAxisTitle,
					/** 刻度值 */
					//ticks : this.categories,
					/** 是否显示刻度值 */
					showLabels : false
				},
				yaxis : {
					title: this.seriesAxisTitle,
					showLabels : false
				},
				pie : {
					/** 以饼状图显示 */
					show : true,
					/** 透明度 */
					fillOpacity:1,
					/*间距*/
					explode : 5
				},
				mouse : {
					/** 为true时，当鼠标移动到每个折点时，会显示折点的坐标 */
					track : false,
					/** 当为true时，鼠标移动时，即使不在线条上，也会显示相应的数据 */
					relative : false,
					/** 小数点位数 */
					trackDecimals:0
					
				},
				title : this.title
		    });
		} else if(this.bars) {		
			Flotr.draw(this.el[0], this.xyData, {
				xaxis : {
					title : this.categoryAxisTitle,
					min : this.xMin,
					/** 刻度值 */
					ticks : this.xScale
		
				},
				yaxis : {
					title: this.seriesAxisTitle,
					/** 刻度的最小值 */
					min : this.yMin,
					/** 刻度值小数点后几位数 */
					tickDecimals : 0,
					ticks : this.yScale
				},
				legend : {
					/** 图标默认位置为图表的下方 */
					position : 'bottom'
				},
				bars : {
					/** 以柱状图形的方式显示 */
					show : true,
					/** 以累加的形式显示 */
					stacked : this.stacked,
					/** 柱状图以水平方式显示 */
					horizontal : this.horizontal,
					/** 柱状图型的宽度 */
					barWidth : this.barWidth,
					/** 是否以分组形式显示，当设置柱状图堆叠显示时，此值必须设置为false*/
					grouped : this.grouped,
					/** 透明度 */
					fillOpacity:1
				},
				grid:{
					color:'#aaa'
				},
				mouse : {
					/** 为true时，当鼠标移动到每个折点时，会显示折点的坐标 */
					track : false,
					/** 当为true时，鼠标移动时，即使不在线条上，也会显示相应的数据 */
					relative : false,
					/** 小数点位数 */
					trackDecimals:0
				},
				/** 图表的标题 */
				title : this.title
			});
		} else if(this.fill) {
			Flotr.draw(this.el[0], this.xyData, {
				xaxis : {
					title : this.categoryAxisTitle,
					/** 刻度值 */
					ticks : this.xScale
				},
				yaxis : {
					title: this.seriesAxisTitle,
					/** 刻度值小数点后几位数 */
					tickDecimals : 0,
					ticks : this.yScale
				},
				legend : {
					/** 图标默认位置为图表的下方 */
					position : 'bottom'
				},
				grid:{
					color:'#aaa'
				},
				mouse : {
					/** 为true时，当鼠标移动到每个折点时，会显示折点的坐标 */
					track : false,
					/** 当为true时，鼠标移动时，即使不在线条上，也会显示相应的数据 */
					relative : false,
					/** 小数点位数 */
					trackDecimals:0
				},
				/** 图表的标题 */
				title : this.title
			});
		} else if(this.points) {
			Flotr.draw(this.el[0], this.xyData, {
				xaxis : {
					title : this.categoryAxisTitle,
					min : this.xMin,
					max : this.xMax,
					/** 刻度值 */
					ticks : this.xScale
				},
				yaxis : {
					title: this.seriesAxisTitle,
					/** 刻度的最小值 */
					min : this.yMin,
					max : this.yMax,
					/** 刻度值小数点后几位数 */
					tickDecimals : 0,
					ticks : this.yScale
				},
				legend : {
					/** 图标默认位置为图表的下方 */
					position : 'bottom'
				},
				grid:{
					color:'#aaa'
				},
				mouse : {
					/** 为true时，当鼠标移动到每个折点时，会显示折点的坐标 */
					track : false,
					/** 当为true时，鼠标移动时，即使不在线条上，也会显示相应的数据 */
					relative : false,
					/*小数点位数*/
					trackDecimals:0
				},
				/** 图表的标题 */
				title : this.title
			});
		} else if(this.showPoint) {
			Flotr.draw(this.el[0], this.xyData, {
				xaxis : {
					title : this.categoryAxisTitle,
					/** 刻度值 */
					ticks : this.xScale
				},
				yaxis : {
					title: this.seriesAxisTitle,
					/** 刻度值小数点后几位数 */
					tickDecimals : 0,
					ticks : this.yScale
				},
				legend : {
					/** 图标默认位置为图表的下方 */
					position : 'bottom'
				},
				grid:{
					color:'#aaa'
				},
				mouse : {
					/** 为true时，当鼠标移动到每个折点时，会显示折点的坐标 */
					track : false,
					/** 当为true时，鼠标移动时，即使不在线条上，也会显示相应的数据 */
					relative : false,
					/** 小数点位数 */
					trackDecimals:0
				},
				/** 图表的标题 */
				title : this.title,
				markers:{
					show: true,
					position: 'ct',
					verticalMargin: 5
				}
				
			});
		}
		if(this.fistStraw) {
			this.height = -1;
			this.width = -1;
			this.fistStraw = false;
		} 
	},
	
	setSeriesAxisTitle: function(sTitle) {
		this.seriesAxisTitle = sTitle;
	},
	
	setCategoryAxisTitle: function(cTitle) {
		this.categoryAxisTitle = cTitle;
	},
	
	setTitle: function(title) {
		this.title = title;
	},
	
	afterRender: function(ct){
        this.base(ct);
        var metaObj = this.getMetaObj();

    	this.setSeriesAxisTitle(metaObj.seriesAxisTitle);
    	this.setCategoryAxisTitle(metaObj.categoryAxisTitle);
    	this.setTitle(metaObj.title);
        
        this.setDraw();
	}


});

YIUI.reg('chart', YIUI.Control.Chart);