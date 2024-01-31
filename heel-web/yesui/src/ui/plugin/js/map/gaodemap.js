
(function() {
	var OVERLAY_TYPE = {
		MARKER: "marker",
		POLYLINE: "polyline",
		POLYGON: "polygon"
	};
	GDMap = function(options) {
		var Return = {
			// lng: options.lng || 116.404,
			// lat: options.lat || 39.915,
			zoom: options.zoom || 11,
			id: options.id || $(document.body),
			enableScroll: options.enableScroll || false,
			enableContinuous: options.enableContinuous || false,
			enableInertial: options.enableInertial || false,
			polyEdit: false,
			drawMgr: null,
			drawPoints: [],
			isDraw: false,
			init: function() {
				//init 初始化		// 创建Map实例
				var map = this.map = new AMap.Map(this.id);
				// 初始化地图,设置中心点坐标和地图级别
				// this.setCenterAndZoom(this.lng, this.lat);

				this.map.plugin(["AMap.ToolBar"], function() {
					this.map.addControl(new AMap.ToolBar());
				});

				this.styleOpts = {
					strokeWeight: 2,             
	                strokeStyle: 'solid',
			        strokeOpacity: 0.8,	   //边线透明度，取值范围0 - 1。
			        fillOpacity: 0.6,      //填充的透明度，取值范围0 - 1。
        			fillColor:"lightgreen"      //填充颜色。当参数为空时，圆形将没有填充效果。
				};

			    // this.map.plugin(["AMap.CitySearch"], function() {
			    //     //实例化城市查询类
			    //     var citysearch = new AMap.CitySearch();
			    //     //自动获取用户IP，返回当前城市
			    //     citysearch.getLocalCity(function(status, result) {
			    //         if (status === 'complete' && result.info === 'OK') {
			    //             if (result && result.city && result.bounds) {
			    //                 var citybounds = result.bounds;
			    //                 map.setBounds(citybounds);
			    //             }
			    //         } else {
			    //             document.getElementById('tip').innerHTML = result.info;
			    //         }
			    //     });
		    	// });

			},

			setCenter: function(point) {
				this.setCenterAndZoom(point[0], point[1]);
			},
			setZoom: function(zoom) {
				this.map.setZoom(zoom);
			},
			
			/** 初始化地图,设置中心点坐标和地图级别 */
			setCenterAndZoom: function(lng, lat) {
				var point = new AMap.LngLat(lng, lat);
				this.map.setZoomAndCenter(this.zoom, point);
				this.addMarker(point);          
			},

			/** 编写自定义函数,创建标注 */
			addMarker: function(point, name, icon) {
				// 创建标注
			  	var  marker = new AMap.Marker({
		            icon: icon,
		            position: point
		        });
			  	// 将标注添加到地图中
        		marker.setMap(this.map);

			  	// this.map.addOverlay(marker); 
			  	if(name) {
					marker.setLabel({
						//修改label相对于maker的位置
        				offset: new AMap.Pixel(20, -10),
				        content: name
				    });
			  	}
			  	//注册事件
			 	marker.on('click', function(e) {
			        //构建信息窗体中显示的内容
			        var info = [];
			        info.push(parent.YIUI.I18N.getString("BAIDUMAP_ADDRESS","地址：XX市XX区XXXXXXX"));

					var infoWindow = new AMap.InfoWindow({
			            content: info.join("<br/>")  //使用默认信息窗体框样式，显示信息内容
			        });
			        // infoWindow.open(map, e.point);
				});
			},

			/** 定位到指定点 */
			setPoint: function(point, name, icon) {
				point = this.convertPath(point);
				this.addMarker(point, name, icon);
			},
			/** 批量添加覆盖物 */
			addPoints: function(items) {
				items = this.convertPath(items);
				// 向地图添加多个标注
				for (var i = 0, len = items.length; i < len; i ++) {
					var item = items[i];
					var point = new AMap.LngLat(item.x, item.y);
					this.addMarker(point);
					//让所有点在视野范围内
					// map.setViewport(point);
				}
				//让所有点在视野范围内
				//this.map.setViewport(items);
			},

			/** 移除指定位置的覆盖物 */
			delPoint: function(x, y) {
				var point = new AMap.LngLat(x, y);
				var allOverlay = this.map.getAllOverlays();
				this.map.remove(allOverlay);
				// for (var i = 0, len = allOverlay.length -1; i < len; i++) {
				// 	if(allOverlay[i].getLabel() == point) {
				// 		//移除指定覆盖物
				// 		map.removeOverlay(allOverlay[i]);
				// 		return false;
				// 	}
				// }

			},

			/** 清除地图上所有覆盖物。 */
			clear: function() {
				this.map.clearMap();
			},

			/** 是否开启鼠标滚轮缩放 */
			setEnableScroll: function(enableScroll) {
				this.enableScroll = enableScroll;
				this.map.enableScrollWheelZoom(enableScroll); 
			},

			/** 启用连续缩放效果，默认禁用。 */
			setEnableContinuous: function(enableContinuous) {
				this.enableContinuous = enableContinuous;
				this.map.enableContinuousZoom(this.enableContinuous);   
			},

			/** 启用地图惯性拖拽，默认禁用。 */
			setEnableInertial: function(enableInertial) {
				this.enableInertial = enableInertial;
				this.map.enableInertialDragging(this.enableInertial);
			},

			/** 根据经纬度查询驾车路线 可设置多个途径点，waypoints为途径点的经纬度数组 [[xxx, xxx], [xxx, xxx], [xxx, xxx]]*/
			setDriveRoute: function(start, end, waypoints) {/*
				var p1 = new AMap.LngLat(start[0], start[1]);
				var p2 = new AMap.LngLat(end[0], end[1]);

				 //构造路线导航类
			    var driving = new AMap.Driving({
			        map: this.map
			        //指定区域显示导航信息
			        // panel: "panel"
			    }); 
			    // 根据起终点经纬度规划驾车导航路线
			    driving.search(p1, p2);
*/
				
				var paths = [];	
				paths.push(start);
				if(waypoints.length > 0) {
					paths = paths.concat(waypoints);
				}
				paths.push(end);	
				var $this = this;
				$this.map.plugin("AMap.DragRoute", function() {
			        route = new AMap.DragRoute($this.map, paths, AMap.DrivingPolicy.LEAST_FEE); //构造拖拽导航类
			        route.search(); //查询导航路径并开启拖拽导航
			    });

			},
			
			getLngLat: function(e) {
				return e.lnglat;
			},

			// setPanorama: function(x, y) {
			// 	//添加一个自定义地图图层。
			// 	// this.map.addTileLayer(new BMap.PanoramaCoverageLayer());

			// 	var panorama = new BMap.Panorama(this.id); 
			// 	panorama.setPov({heading: -40, pitch: 6});
			// 	//根据经纬度坐标展示全景图	
			// 	panorama.setPosition(new AMap.LngLat(x, y)); 
			// },

			startDraw: function() {
				var self = this;
			 	self.map.plugin(["AMap.MouseTool"], function() {
		         	//在地图中添加MouseTool插件
					self.drawMgr = new AMap.MouseTool(self.map);
		            //多边形线条等设置
					self.drawMgr.polygon(self.styleOpts);
					AMap.event.addListener(self.drawMgr, "draw", function(e) {
						self.overlay = e.obj;
						if(self.polyEdit) {
							self.editPolygon();
						}
					});
				});
			},

			editPolygon: function() {
				var self = this;
				if(!self.polygonEditor) {
				    //构造折线编辑对象，并开启折线的编辑状态
					self.map.plugin(["AMap.PolyEditor"],function(){
						self.polygonEditor = new AMap.PolyEditor(self.map, self.overlay);
				    }); 
				}  
				self.polygonEditor.open();
			},
			
			disablePolygon: function() {
				self.polygonEditor.close();
			},
			
			convertPath: function(path) {
				var vals = [];
				var points = path.split(";");
				for(var i = 0, len = points.length; i < len; i++) {
					var point = points[i];
					var lnglat = point.split(",");
					var lng = lnglat[0];
					var lat = lnglat[1];
					vals.push([lng, lat]);
				}
				return vals;
			},

			drawMarker: function(marker) {
				// map.drawMarker(marker)
				var points = this.convertPath(marker);
				// 向地图添加多个标注
				for (var i = 0, len = points.length; i < len; i ++) {
					var point = points[i];
					this.addMarker(point);
				}
				//让所有点在视野范围内
				this.map.setFitView();
			},
			
			drawPolyline: function(polyLine) {
				var points = this.convertPath(polyLine);
				var opt = {};
				$.extend(opt, this.styleOpts);
				opt.path = points;
				opt.map = this.map;
				var polyline = new AMap.Polyline(opt);  
				this.map.setFitView(polyline);
			},

			drawPolygon: function(polygon) {
				var points = this.convertPath(polygon);
				var opt = {};
				$.extend(opt, this.styleOpts);
				opt.path = points;
				opt.map = this.map;
				var polygon = new AMap.Polygon(opt);
			    this.map.setFitView(polygon);
			},

			getMapInfo: function() {
				var mapInfo = {};
				var overlays = [];
				var markers = this.map.getAllOverlays("marker");
				var lines = this.map.getAllOverlays("polyline");
				var gons = this.map.getAllOverlays("polygon");
				for(var i = 0, len = markers.length; i < len; i++) {
					var overlay = markers[i];
					//点标记
					var position = overlay.getPosition();
					var name = overlay.getLabel();
					var icon;
					if(overlay.getIcon()) {
						icon = overlay.getIcon().image;
					}
					var marker = {
						id: "",
						type: "marker",
						position: position.lng + "," + position.lat,
						name: name,
						icon: icon
					};
					overlays.push(marker);
				}
				for(var i = 0, len = lines.length; i < len; i++) {
					var overlay = lines[i];
					var points = overlay.getPath();
					var path = "";
					for(var j = 0, length = points.length; j < length; j++) {
						var point = points[j];
						if(j > 0) {
							path += ";";
						}
						path += point.lng + "," + point.lat;
					}
					var polyline = {
						path: path,
						type: "polyline"
					};
					overlays.push(polyline);
				}
				for(var i = 0, len = gons.length; i < len; i++) {
					var overlay = gons[i];
					var points = overlay.getPath();
					var path = "";
					for(var j = 0, length = points.length; j < length; j++) {
						var point = points[j];
						if(j > 0) {
							path += ";";
						}
						path += point.lng + "," + point.lat;
					}
					var polygon = {
						path: path,
						type: "polygon"
					};
					overlays.push(polygon);
				}


				mapInfo.overlays = overlays;
				var center = this.map.getCenter();
				var lng = center.lng;
				var lat = center.lat;
				var point = lng + "," + lat;
				mapInfo.center = point;
				mapInfo.zoom = this.zoom;
				return $.toJSON(mapInfo);
			},

			showMapInfo: function(mapInfo) {
				var center = mapInfo.center;
				center && this.setCenter(center);
				var zoom = mapInfo.zoom;
				zoom && this.setZoom(zoom);
				var overlays = mapInfo.overlays;
				if(!overlays) return;
				for (var i = 0, len = overlays.length; i < len; i++) {
					var overlay = overlays[i];
					if(overlay.type == OVERLAY_TYPE.MARKER) {
						var id = overlay.id;
						var position = overlay.position;
						var name = overlay.name;
						var icon = overlay.icon;
						// this.setPoint(position, name, icon);
						this.drawMarker(position);
					} else if(overlay.type == OVERLAY_TYPE.POLYLINE) {
						var path = overlay.path;
						this.drawPolyline(path);
					} else if(overlay.type == OVERLAY_TYPE.POLYGON) {
						var path = overlay.path;
						this.drawPolygon(path);
					}
				}
			},

			setEnable: function(enable) {
				if(enable) {
					// this.map.enableDragging(); //启用拖拽
					// this.map.enableScrollWheelZoom(); //启用滚轮放大缩小
					// this.map.enableDoubleClickZoom(); //启用双击放大
	    //         	this.initDrawTools();
	    //         	this.initSearchBox();
					// $(".BMapLib_Drawing").show();
					// $(".BMap_noprint.search_box").show();
				} else {
					// this.map.disableDragging(); //禁止拖拽
					// this.map.disableScrollWheelZoom(); //禁止使用滚轮放大缩小
					// this.map.disableDoubleClickZoom();//禁止使用双击放大
					// $(".BMapLib_Drawing").hide();
					// $(".BMap_noprint.search_box").hide();
				}
			},
			
			isInBounds: function(point) {
				var result = this.map.getBounds().contains(point);
				return result;
			},
			
			getDrawPoints: function() {
				var path = this.overlay.getPath();
				var points = [];
				for (var path = 0, len = path.length; path < len; path++) {
					var point = path[i];
					points.push([point.lng, point.lat]);
				}
				return points;
			},
			
			//重绘地图
			reBuild: function(args) {
				
			},

			/** 注册地图点击事件 */
			install: function() {
				//地图界面的点击事件
				this.map.on("click", function(e) {
			        // var point = [e.lnglat.getLng(), e.lnglat.getLat()];
			        // drawPoints.push(point);
				});
			}

		};
		Return.init();
		Return.install();
		return Return;

	};
	
})();