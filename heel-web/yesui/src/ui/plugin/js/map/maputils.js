// 地图数据格式
// MapInfo: {
// 	overlays: [标记点|折线|多边形]
// }
// 标记点的json暂定(等之后的具体需求)
// {
// 	id: xxx,(点击事件)
// 	type: marker,
// 	position: x,y,
// 	name: xxx,
// 	icon: xxx,(显示图片)
// 	...
// }
// 折线|多边形的json格式
// {
// 	type: polyline|polygon,
// 	path: "x,y;x,y..."
// }
(function() {
	MapType = {
		BAIDU: 0,
		GAODE: 1
	};
	hasApi = false;
	MapUtils = function(options) {
		var Return = {
			type: options.type || MapType.BAIDU,
			map: null,
			init: function() {
				switch(this.type) {
					case MapType.BAIDU:
						var self = this;
						if(hasApi) {
    						self.map = new BDMap(options);
						} else {
							// var initialize = function() {
	    		// 				self.map = new BDMap(options);
				   //      	};
						  	var url = "http://api.map.baidu.com/api?v=2.0&callback=initialize&ak=" + options.ak;
					        $.getScript(url, function() {
					        	self.map = new BDMap(options);
					        	$.getScript("http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js");
					        });
				        	hasApi = true;
						}

					break;
					case MapType.GAODE:
						var self = this;
						if(hasApi) {
							this.map = new GDMap(options);
						} else {
							var url = "http://webapi.amap.com/maps?v=1.3&key=" + options.key;
							$.getScript(url, function() {
								$.getScript("http://cache.amap.com/lbs/static/addToolbar.js");
								self.map = new GDMap(options);
							});
				        	hasApi = true;
						}

					break;
				}
			},
			setMap: function(map, url) {
				this.map = map;
				this.url = url;
				this.createScript(this.url);
			},
			createScript: function(url) {
			  	var script = document.createElement("script");
			  	script.src = url;
		        script.type = "text/javascript";
			  	document.body.appendChild(script);
			},
			/** 设置显示中心 */
			setCenter: function(point) {
				this.map.setCenter(point);
			},
			setZoom: function(zoom) {
				this.map.setZoom(zoom);
			},
			/** 多点定位 */
			addPoints: function(points) {
				this.map.addPoints(points);
			},
			/** 删除多组指定覆盖物 */
			delPoints: function(points) {
				if(points.length <= 0) return;
				for (var i = 0, len = points.length; i < len; i++) {
					var point = points[i];
					this.delPoint(point);
				}
			},
			/** 删除指定覆盖物 */
			delPoint: function(point) {
				this.map.delPoint(point[0], point[1]);
			},
			/** 定位到指定点 */
			SetPoint: function(point) {
				this.map.SetPoint(point);
			},
			/** 清除所有覆盖物 */
			clear: function() {
				this.map.clear();
			},
			/** 行驶路线 */
			setDriveRoute: function(start, end, waypoints) {
				this.map.setDriveRoute(start, end, waypoints);
			},
			/** 开始绘制多边形区域 */
			startDraw: function() {
				this.map.startDraw();
			},
			/** 根据边界坐标集绘制区域 */
			drawPolygon: function(points) {
				this.map.drawPolygon(points);
			},
			/** 对绘制区域进行编辑 */
			editPolygon: function() {
				this.map.editPolygon();
			},
			/** 对绘制区域结束编辑 */
			disablePolygon: function() {
				this.map.disablePolygon();
			},
			/** 获取区域边界坐标集 */
			getDrawPoints: function() {
				return this.map.getDrawPoints();
			},

			setMapDisplay: function(points, type) {
				this.map.setMapDisplay(points, type);
			},

			drawMarker: function(marker) {
				this.map.drawMarker(marker);
			},

			drawPolyline: function(polyline) {
				this.map.drawPolyline(polyline);
			},

			drawPolygon: function(polygon) {
				this.map.drawPolygon(polygon);
			},

			getMapInfo: function() {
				return this.map.getMapInfo();
			},

			showMapInfo: function(mapInfo) {
				this.map.showMapInfo(mapInfo);
			},

		    setEnable: function(enable) {
		    	if(!this.map) return;
		        this.map.setEnable(enable);
		    },

			// showDrawTool: function() {
			// 	this.map.isShowDrawTool(true);
			// },
			// closeDrawTool: function() {
			// 	this.map.isShowDrawTool(false);
			// },
			isInBounds: function(point) {
				return this.map.isInBounds(point);
			}

		};
		// window.setTimeout(function(){Return.init();}, 300);
		Return.init();
		return Return;

	};
	
})();


