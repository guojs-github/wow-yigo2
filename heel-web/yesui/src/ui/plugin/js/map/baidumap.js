
(function() {
	BDMap = function(options) {
		var TYPE = {
			MARKER: 0,
			POLYLINE: 1,
			POLYGON: 2
		};
		var OVERLAY_TYPE = {
			MARKER: "marker",
			POLYLINE: "polyline",
			POLYGON: "polygon",
			CIRCLE: "circle"
		};
		
		var _YIUI = parent.YIUI;
		
		var Return = {
			lng: options.lng || 116.404,
			lat: options.lat || 39.915,
			zoom: options.zoom || 11,
			enable: options.enable || false,
			id: options.id || $(document.body),
			enableScroll: options.enableScroll || false,
			enableContinuous: options.enableContinuous || false,
			enableInertial: options.enableInertial || false,
			polyEdit: false,
			drawMgr: null,
			data: [],
			type: TYPE.polygon,
			init: function() {
				//init 初始化		// 创建Map实例
				var map = this.map = new BMap.Map(this.id, {enableMapClick:false});
				var el = options.el = $("#"+this.id);
				el.addClass("bd_map");
				// 初始化地图,设置中心点坐标和地图级别
				var point = new BMap.Point(this.lng, this.lat);
				this.map.centerAndZoom(point, this.zoom);
				//根据IP定位
				var myCity = new BMap.LocalCity();
				var zoom = this.zoom;
				// myCity.get(function(result) {
				// 	var center = result.center;
				// 	var point = new BMap.Point(center.lng, center.lat);
				// 	map.centerAndZoom(point, zoom);
				// });

				// 添加平移缩放控件
				map.addControl(new BMap.NavigationControl());        
		       	// 添加比例尺控件	
				// map.addControl(new BMap.ScaleControl());                    
				//添加缩略地图控件
				map.addControl(new BMap.OverviewMapControl());                
				//添加地图类型控件         
				// map.addControl(new BMap.MapTypeControl());          
				// map.disable3DBuilding();

				// //启用滚轮放大缩小，默认禁用
				// this.setEnableScroll(this.enableScroll);
				// //启用连续缩放效果，默认禁用。
				// this.setEnableContinuous(this.enableContinuous);
				// //启用地图惯性拖拽，默认禁用。
				this.setEnableInertial(this.enableInertial);
				//多边形线条等设置
				this.styleOpts = {
					// strokeColor: "#00DD00",
	            	strokeWeight: 3,             
	                strokeStyle: "solid",
			        strokeOpacity: 0.8,	   //边线透明度，取值范围0 - 1。
			        fillOpacity: 0.6,      //填充的透明度，取值范围0 - 1。
        			fillColor:"lightgreen"      //填充颜色。当参数为空时，圆形将没有填充效果。
	            };

	            options.mapInfo && this.showMapInfo(options.mapInfo);
	            //初始化搜索框
				// this.initSearchBox();
				// this.setEnable(this.enable);
			},

			initSearchBox: function() {
				var map = this.map;
				var self = this;
				
			    var localSearch = new BMap.LocalSearch(map);
			    localSearch.enableAutoViewport(); //允许自动调节窗体大小
			    
				// 定义一个控件类,即function
				var ZoomControl = function(){
				  // 默认停靠位置和偏移量
				  this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
				  this.defaultOffset = new BMap.Size(10, 10);
				}

				// 通过JavaScript的prototype属性继承于BMap.Control
				ZoomControl.prototype = new BMap.Control();

				// 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
				// 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
				ZoomControl.prototype.initialize = function(map){

					// 创建一个DOM元素
					var div = $("<div class='search_box'/>");
					// 添加文字说明
					var input = $("<input class='search_txt' placeholder="+_YIUI.I18N.getString("BAIDUMAP_INPUTPLACE","请输入搜索地点...")+"/>");
					div.append(input);
					var btn = $("<button class='search_btn'/>");
					div.append(btn);
					
					btn.click(function(e) {
						var val = input.val();
						localSearch.setSearchCompleteCallback(function (searchResult) {
							var poi = searchResult.getPoi(0);
							map.centerAndZoom(poi.point, 14);
						});
						localSearch.search(val);
					})
					// 添加DOM元素到地图中s
					map.getContainer().appendChild(div[0]);
					// 将DOM元素返回
					return div[0];
				}
				// 创建控件
				var myZoomCtrl = new ZoomControl();
				// 添加到地图当中
				map.addControl(myZoomCtrl);
			  
			},

			// setMapDisplay: function(points, type) {
			// 	points = eval(points);
			// 	if(type == TYPE.MARKER) {
			// 		this.drawMarker(points);
			// 		return;
			// 	}
			// 	var arr = [];
			// 	for (var i = 0, len = points.length; i < len; i++) {
			// 		var point = points[i];
			// 		var p = new BMap.Point(point[0], point[1]);
			// 		arr.push(p);
			// 	}
			// 	var poly;
			// 	if(type == TYPE.POLYGON) {
			// 		poly = new BMap.Polygon(arr, this.styleOpts);  //创建多边形
			// 	} else if(type == TYPE.POLYLINE) {
			// 		poly = new BMap.Polyline(arr, this.styleOpts);   //创建折线
			// 	}
			// 	this.map.addOverlay(poly);   //增加多边形
			// 	this.overlay = poly;
			// 	this.map.setViewport(arr);
			// },

			/** 初始化地图,设置中心点坐标和地图级别 */
			setCenter: function(center) {
				center = center.split(",");
				var point = new BMap.Point(center[0], center[1]);
				this.map.centerAndZoom(point, this.zoom);
			},
			setZoom: function(zoom) {
				this.zoom = zoom;
				this.map.setZoom(zoom);
			},

			/** 编写自定义函数,创建标注 */
			addMarker: function(point, name, icon) {
				// 创建标注
			  	var marker = new BMap.Marker(point);
			  	// 将标注添加到地图中
			  	this.map.addOverlay(marker); 
			  	this.addMenuItem(marker);
			  	if(name) {
			  		var label = new BMap.Label(name, {offset: new BMap.Size(20,-10)});
					marker.setLabel(label);
			 	}
			  	//注册事件
				marker.addEventListener("click", function(e) {
					var opts = {
					  	width : 200,     // 信息窗口宽度
				  		height: 100,     // 信息窗口高度
				  		title : _YIUI.I18N.getString("BAIDUMAP_EVENTTEST","Event测试") // 信息窗口标题
					}
					var infoWindow = new BMap.InfoWindow(_YIUI.I18N.getString("BAIDUMAP_ADDRESS","地址：XX市XX区XXXXXXX"), opts);  // 创建信息窗口对象 
					
					// this.map.openInfoWindow(infoWindow, e.point); //开启信息窗口
				});
			},
			/** 定位到指定点 */
			setPoint: function(point, name, icon) {
				point = point.split(",");
				var p = new BMap.Point(point[0], point[1]);
				this.addMarker(p, name, icon);
			},

			getPoint: function() {
				//var point = this.markers[0];
				//return $.toJSON(point);
			},

			convertPath: function(path) {
				var vals = [];
				var points = path.split(";");
				for(var i = 0, len = points.length; i < len; i++) {
					var point = points[i];
					var lnglat = point.split(",");
					var lng = lnglat[0];
					var lat = lnglat[1];
					var p = new BMap.Point(lng, lat);
					vals.push(p);
				}
				return vals;
			},

			addMenuItem: function(overlay) {
				var map = this.map;
				var removeMarker = function(e,ee,marker){
					map.removeOverlay(marker);
				}
				var markerMenu=new BMap.ContextMenu();
				markerMenu.addItem(new BMap.MenuItem(_YIUI.I18N.getString("ATTACHMENT_DELETE","删除"),removeMarker.bind(overlay)));
				overlay.addContextMenu(markerMenu);
			},

			drawMarker: function(marker, notView) {
				var points = this.convertPath(marker);
				// 向地图添加多个标注
				for (var i = 0, len = points.length; i < len; i ++) {
					var point = points[i];
					this.addMarker(point);
				}
				//让所有点在视野范围内
				if(!notView) {
					this.map.setViewport(points);
				}
			},
			
			drawPolyline: function(polyline, notView) {
				var points = this.convertPath(polyline);
				var line = new BMap.Polyline(points, this.styleOpts);  //创建多边形
				this.map.addOverlay(line);   //增加多边形
				this.overlay = line;
				this.addMenuItem(line);
				if(!notView) {
					this.map.setViewport(points);
				}
				return line;
			},

			drawPolygon: function(polygon, notView) {
				var points = this.convertPath(polygon);
				var gon = new BMap.Polygon(points, this.styleOpts);  //创建多边形
				this.map.addOverlay(gon);   //增加多边形
				this.overlay = gon;
				this.addMenuItem(gon);
				if(!notView) {
					this.map.setViewport(points);
				}
				return gon;
			},

			drawCircle: function(circle, radius, notView) {
				var points = this.convertPath(circle);
				var circle = new BMap.Circle(points[0], radius, this.styleOpts); //创建圆
				this.map.addOverlay(circle);   //增加多边形
				this.overlay = circle;
				this.addMenuItem(circle);
				if(!notView) {
					this.map.setViewport(points);
				}
			},

			/** 移除指定位置的覆盖物 */
			delPoint: function(lng, lat) {
				var point = new BMap.Point(lng, lat);
				var allOverlay = this.map.getOverlays();
				for (var i = 0, len = allOverlay.length; i < len; i++) {
					if(allOverlay[i].getLabel() == point) {
						//移除指定覆盖物
						this.map.removeOverlay(allOverlay[i]);
						return false;
					}
				}
			},

			/** 清除地图上所有覆盖物。 */
			clear: function() {
				this.map.clearOverlays();
			},

			clearCss: function() {
				var items = $('a[class*=hover]', options.el);
				for (var i = 0, len = items.length; i < len; i++) {
					var item = items.eq(i);
					var className = item.attr("class");
					className = className.replace("_hover", "");
					item.attr("class", className);
				}
			},

			clearBtn: function() {
				var a = $("<a/>");
				a.addClass("BMapLib_box BMapLib_clear");
				a.attr("title", _YIUI.I18N.getString("CURRENCY_CLEAN","清除"));
				var self = this;
				a.click(function() {
					self.clear();
		            self.drawMgr.close();
					self.clearCss();
					a.addClass("BMapLib_clear_hover");
				});
				var div = $(".BMapLib_Drawing_panel", options.el);
				div.append(a);
			},

			boundaryBtn: function() {
				var a = $("<a class='BMapLib_box BMapLib_boundary' title="+_YIUI.I18N.getString("BAIDUMAP_CANTON","行政区")+"/>");
				var self = this;
				var map = this.map;
				var div = $(".BMapLib_Drawing_panel", options.el);
				a.click(function() {
					if($(".Boundary_Box").length == 0) {
						var search = $("<div class='Boundary_Box'/>");
						var input = $("<input type='text' class='txt' placeholder="+_YIUI.I18N.getString("BAIDUMAP_INPUTNAME","请输入行政区名称...")+" />");
						var btn = $("<input type='button' class='btn' value="+_YIUI.I18N.getString("CURRENCY_OK","确定")+" />");
						search.append(input).append(btn);
						$(document.body).append(search);
						var searchFun = function(e) {
							var val = input.val();
							var bdary = new BMap.Boundary();
							bdary.get(val, function(rs){       //获取行政区域
								var count = rs.boundaries.length; //行政区域的点有多少个
								if (count === 0) {
									alert(_YIUI.I18N.getString("BAIDUMAP_FAILTO","未能获取当前输入行政区域"));
									return ;
								}
					          	var pointArray = [];
								for (var i = 0; i < count; i++) {
									var ply = new BMap.Polygon(rs.boundaries[i], self.styleOpts); //建立多边形覆盖物
									pointArray = pointArray.concat(ply.getPath());
									var cPoint = ply.getBounds().getCenter();
									var cStr = cPoint.lng+","+cPoint.lat;
									var isExist = false;
									var overlays = map.getOverlays();
									for(var j = 0, len = overlays.length; j < len; j++) {
										var overlay = overlays[j];
										if(overlay.isBoundary && overlay.center == cStr) {
											isExist = true;
										}
									}
									if(isExist) {
										continue;
									}
									map.addOverlay(ply);  //添加覆盖物
									ply.isBoundary = true;
									ply.center = cStr;
								}
								map.setViewport(pointArray);    //调整视野                 
							});   
						};
						input.keypress(function(e) {
							var keyCode = e.keyCode || e.which;
							if(keyCode == 13) {
								searchFun(e);
							}
						});
						btn.click(function(e) {
							searchFun(e);
						});

						$(document).on("mousedown", function (e) {
			                 var target = $(e.target);
			                 if (target.closest(a).length == 0 && target.hasClass("BMapLib_box")) {
						     	search.hide();
						     	$(".txt", search).val("");
			                 }
			            });
						var offset = a.offset();
						var left = offset.left - div.width() + a.width();
						var top = offset.top + div.height() + 1;
						var width = div.width() - 55;
						search.css({
							position: "absolute",
							left: left,
							top: top,
							width: div.width() + "px"
						});
						input.css({
							width: width + "px"
						});
					} else {
						$(".Boundary_Box").toggle();
					}
		            self.drawMgr.close();
					self.clearCss();
					a.addClass("BMapLib_boundary_hover");
				});
				div.append(a);
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

			/** 根据经纬度查询驾车路线 可设置多个途径点，waypoints为途径点的经纬度数组 [[xxx, xxx], [xxx, xxx], [xxx, xxx]] */
			setDriveRoute: function(start, end, waypoints, path) {
				var map = this.map;
				start = start.split(",");
				end = end.split(",");
				waypoints = waypoints.split(";");
				var p1 = new BMap.Point(start[0], start[1]);
				var p2 = new BMap.Point(end[0], end[1]);
				var s_icon = new BMap.Icon("http://api0.map.bdimg.com/images/dest_markers.png", new BMap.Size(45,35), {
					offset: new BMap.Size(0, 0), // 指定定位位置  
                    imageOffset: new BMap.Size(0, 0) // 设置图片偏移  
				});
				var m_p1 = new BMap.Marker(p1, {icon: s_icon}); 
				map.addOverlay(m_p1);
				var e_icon = new BMap.Icon("http://api0.map.bdimg.com/images/dest_markers.png", new BMap.Size(45,35), {
					offset: new BMap.Size(58, 18), // 指定定位位置  
                    imageOffset: new BMap.Size(0, -32) // 设置图片偏移  
				});
				var m_p2 = new BMap.Marker(p2, {icon: e_icon}); 
				map.addOverlay(m_p2);

				if (waypoints.length > 0) {
					for (var i = 0, len = waypoints.length; i < len; i++) {
						var waypoint = waypoints[i];
						waypoint = waypoint.split(",");
						var point = new BMap.Point(waypoint[0], waypoint[1]);
						var marker1 = new BMap.Marker(point);
						map.addOverlay(marker1);
					}
				}


				var driving = new BMap.DrivingRoute(this.map, {
					renderOptions:{
						// map: this.map, 
						// panel: "id",
						autoViewport: true,
						enableDragging : false //起终点可进行拖拽
					}
				});

				path = path.split(";");
				var points = [], current = null;
				if (path.length > 0) {
					for (var i = 0, len = path.length; i < len; i++) {
						var p = path[i];
						p = p.split(",");
						var point = new BMap.Point(p[0], p[1]);
						points.push(point);
						if(i == 0) {
							driving.search(p1, point);
						} else {
							var prev = path[i - 1];
							prev = prev.split(",");
							var prev_p = new BMap.Point(prev[0], prev[1]);
							driving.search(prev_p, point);
						}
						if(len == 1 || i == len - 1) {
							current = point;
							var marker = new BMap.Marker(point);
					  		var label = new BMap.Label(_YIUI.I18N.getString("BAIDUMAP_CURRENTDOT","当前点"), {offset: new BMap.Size(20,-10)});
							marker.setLabel(label);
							map.addOverlay(marker);
						}
					}
				}


				// driving.search(p1, p2, {waypoints: points});

				var _this = this;
				driving.setSearchCompleteCallback(function(){
					var pts = driving.getResults().getPlan(0).getRoute(0).getPath(); 
			        var polyline = new BMap.Polyline(pts, _this.styleOpts);    
			        map.addOverlay(polyline);
			        
			    });

				var driving2 = new BMap.DrivingRoute(this.map, {
					renderOptions:{
						// map: this.map, 
						// panel: "id",
						autoViewport: true,
						enableDragging : false //起终点可进行拖拽
					}
				});
			    driving2.search(current, p2);
			    driving2.setSearchCompleteCallback(function(){
					var pts = driving2.getResults().getPlan(0).getRoute(0).getPath(); 
					var style = $.extend({}, _this.styleOpts);
					style.strokeStyle = "dashed"; 
			        var polyline = new BMap.Polyline(pts, style);      
			        map.addOverlay(polyline);
			        
			    });
				this.map.setViewport([p1,p2].concat(points));
			},

			// setPanorama: function(x, y) {
			// 	//添加一个自定义地图图层。
			// 	// this.map.addTileLayer(new BMap.PanoramaCoverageLayer());

			// 	var panorama = new BMap.Panorama(this.id); 
			// 	panorama.setPov({heading: -40, pitch: 6});
			// 	//根据经纬度坐标展示全景图	
			// 	panorama.setPosition(new BMap.Point(x, y)); 
			// },

			getLngLat: function(e) {
				return e.point;
			},
			
			createScript: function(url) {
				var script = document.createElement("script");
	        	script.type = "text/javascript";
	        	script.src = url;
	        	$("head").append(script);
			},
			
			createLink: function(href) {
				var link = document.createElement("link");
	        	link.rel = "stylesheet";
	        	link.href = href;
	        	$("head").append(link);
			},

			//初始化作图工具
	        initDrawTools: function() {
	        	// this.clear();
	        	//<!--加载鼠标绘制工具-->
	        	// var url = "http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js";
	        	// this.createScript(url);
	        	// var href = "http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css";
	        	// this.createLink(href);

	        	var self = this;
	            this.drawMgr = new BMapLib.DrawingManager(this.map, {
	                isOpen: false,
	                drawingType: BMAP_DRAWING_POLYGON,
	                enableDrawingTool: true,
	                enableCalculate: false,
	                drawingToolOptions: {
	                    anchor: BMAP_ANCHOR_TOP_RIGHT,
	                    offset: new BMap.Size(5, 5),
	                    drawingTypes: [
	                        //BMAP_DRAWING_MARKER,
	                        //BMAP_DRAWING_CIRCLE,
	                        //BMAP_DRAWING_POLYLINE,
	                        BMAP_DRAWING_POLYGON
	                        //BMAP_DRAWING_RECTANGLE
	                    ]
	                },
	 
	                polygonOptions: this.styleOpts,
	                circleOptions: this.styleOpts,//圆的样式
			        polylineOptions: this.styleOpts, //线的样式
			        polygonOptions: this.styleOpts //多边形的样式
	            });
	 
	            this.drawMgr.setDrawingMode(BMAP_DRAWING_POLYGON) //改为多边形画图
	            //接听多边形完成事件 
	            this.drawMgr.addEventListener("overlaycomplete", function(e) {
            		e.overlay.enableEditing && e.overlay.enableEditing();
	            	self.overlay = e.overlay;
//	            	e.overlay.addEventListener("lineupdate", function(e2) {
//	            		//边界发生变化时触发的事件
//	            	})
	            });

	            this.clearBtn();
	            this.boundaryBtn();
	        },	

	  //       isShowDrawTool: function(isShow) {
	  //       	this.drawMgr.isShowDrawTool(isShow);
			// },

			startDraw: function() {
            	this.drawMgr.open();
			},
			
			editPolygon: function() {
				this.overlay.enableEditing();
			},
			
			disablePolygon: function() {
				this.overlay.disableEditing();
			},

//			getDrawPoints: function() {
//				var data = [];
//				var polygons = this.polygons;
//				for (var i = 0, len = polygons.length; i < len; i++) {
//					var polygon = polygons[i];
//					var points = [];
//					var path = this.overlay.getPath();
//					for (var i = 0, len = path.length; i < len; i++) {
//						var point = path[i];
//						points.push([point.lng, point.lat]);
//					}
//					data.push(points);
//				}
//				return $.toJSON(data);
//			},

			getMarker: function() {

			},

			getPolyline: function() {
				var polyline = {};
				this.polygon
			},

			getPolygon: function() {
				var polygon = {};
			},

			getMapInfo: function() {
				var mapInfo = {};
				var overlays = [];
				var allOverlays = this.map.getOverlays();
				for(var i = 0, len = allOverlays.length; i < len; i++) {
					var overlay = allOverlays[i];
					// var lQ = overlay.lQ;
					// if(lQ) lQ = lQ.toLowerCase();
					// if(lQ == OVERLAY_TYPE.MARKER) {
					if(overlay instanceof BMap.Marker) {
						//点标记
						var position = overlay.getPosition();
						var name = overlay.getLabel();
						var icon = overlay.getIcon().imageUrl;
						var marker = {
							id: "",
							type: "marker",
							position: position.lng + "," + position.lat,
							name: name,
							icon: icon
						};
						overlays.push(marker);
					} else if(overlay instanceof BMap.Polyline) {
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
					} else if(overlay instanceof BMap.Circle) {
						var center = overlay.getCenter();
						var radius = overlay.getRadius();
						var circle = {
							center: center.lng + "," + center.lat,
							radius: radius,
							type: "circle"
						};
						overlays.push(circle);
					} else if(overlay instanceof BMap.Polygon) {
						var points = overlay.getPath();
						var isBoundary = overlay.isBoundary;
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
							type: "polygon",
							center: overlay.center,
							isBoundary: isBoundary
						};
						overlays.push(polygon);
					}
				}
				mapInfo.overlays = overlays;
				var center = this.map.getCenter();
				var lng = center.lng;
				var lat = center.lat;
				var point = lng + "," + lat;
				mapInfo.center = point;
				mapInfo.zoom = this.map.getZoom();
				return $.toJSON(mapInfo);
			},

			showMapInfo: function(mapInfo) {
				this.clear();
				if(!mapInfo) return;
				mapInfo = $.parseJSON(mapInfo);
				var overlays = mapInfo.overlays;
				if(!overlays) return;
				for (var i = 0, len = overlays.length; i < len; i++) {
					var overlay = overlays[i];
					var type = overlay.type;
					if(type == OVERLAY_TYPE.MARKER) {
						var id = overlay.id;
						var position = overlay.position;
						var name = overlay.name;
						var icon = overlay.icon;
						this.setPoint(position, name, icon);
					} else if(type == OVERLAY_TYPE.POLYLINE) {
						var path = overlay.path;
						this.drawPolyline(path, true);
					} else if(type == OVERLAY_TYPE.POLYGON) {
						var path = overlay.path;
						var gon = this.drawPolygon(path, true);
						gon.isBoundary = overlay.isBoundary;
						gon.center = overlay.center;
					} else if(type == OVERLAY_TYPE.CIRCLE) {
						var center = overlay.center;
						var radius = overlay.radius;
						this.drawCircle(center, radius, true);
					}
				}
				var zoom = mapInfo.zoom;
				zoom && this.setZoom(zoom);
				var center = mapInfo.center;
				center && this.setCenter(center);
			},
			
			isInBounds: function(point) {
				point = point.split(",");
	        	var url = "http://api.map.baidu.com/library/GeoUtils/1.2/src/GeoUtils_min.js";
	        	this.createScript(url);
			    var result = BMapLib.GeoUtils.isPointInPolygon(point, map.getBounds());
			    return result;
			},
 
			setEnable: function(enable) {
				if(enable) {
					this.map.enableDragging(); //启用拖拽
					this.map.enableScrollWheelZoom(); //启用滚轮放大缩小
					this.map.enableDoubleClickZoom(); //启用双击放大
					if(!this.initTools) {
		            	this.initDrawTools();
		            	this.initSearchBox();
		            	this.initTools = true;
					}
					$(".BMapLib_Drawing", options.el).show();
					$(".BMap_noprint.search_box", options.el).show();
					var hidePolyline = _YIUI.TypeConvertor.toBoolean(options.hidePolyline);
					var hidePolygon = _YIUI.TypeConvertor.toBoolean(options.hidePolygon);
					var hideMarker = _YIUI.TypeConvertor.toBoolean(options.hideMarker);
					var hideCircle = _YIUI.TypeConvertor.toBoolean(options.hideCircle);
					hidePolyline && $(".BMapLib_box.BMapLib_polyline", options.el).remove();
					hidePolygon && $(".BMapLib_box.BMapLib_polygon", options.el).remove();
					hideMarker && $(".BMapLib_box.BMapLib_marker", options.el).remove();
					hideCircle && $(".BMapLib_box.BMapLib_circle", options.el).remove();
				} else {
					this.map.disableDragging(); //禁止拖拽
					this.map.disableScrollWheelZoom(); //禁止使用滚轮放大缩小
					this.map.disableDoubleClickZoom();//禁止使用双击放大
					$(".BMapLib_Drawing", options.el).hide();
					$(".BMap_noprint.search_box", options.el).hide();
					$(".Boundary_Box").hide();
				}
				this.editOverlays(enable);
			},

			editOverlays: function(enable) {
				var overlays = this.map.getOverlays();
				for (var i = 0, len = overlays.length; i < len; i++) {
					var overlay = overlays[i];
//					if(overlay.isBoundary) continue;
					if(enable && overlay.enableEditing) {
						overlay.enableEditing();
					} else if(!enable && overlay.disableEditing) {
						overlay.disableEditing();
					}
				}
			},

			//重绘地图
			reBuild: function(args) {
				
			},

			/** 注册地图点击事件 */
			install: function() {
				//地图界面的点击事件
				//this.map.addEventListener("click", function(e) {
				//	var point = [e.point.lng, e.point.lat];
				//});
			}

		};
		Return.init();
		Return.install();
		return Return;

	};
	
})();