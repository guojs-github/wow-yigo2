<script setup lang="ts">
</script>

<template>
    <div class='-content baidu-map'>
        <div class='title'>百度地图演示</div>
        <div class='sub-title'>效果</div>
        <div ref='baidu-map-container' id='baidu-map-container' :type='_type'></div> 
        <div class='sub-title'>功能</div>
        <div class='functions'>
            <div class='-section'>
                <div class='-scale button reset-map' @click='on_reset_map'>重置</div>
                <div class='-scale button switch-map-type' @click='on_swith_map_type'>切换地图类型</div>
                <div class='-scale button switch-map-customized-style' @click='on_switch_map_customized_style'>自定义样式</div>
                <div class='-scale button switch-map-heading' @click='on_switch_map_heading'>切换地图旋转角度</div>
                <div class='-scale button switch-map-tilt' @click='on_switch_map_tilt'>切换地图倾斜角度</div>
                <div class='-scale button switch-map-function' @click='on_switch_map_function'>切换地图功能控件</div>
            </div>
            <div class='-section'>
                <div class='-scale button switch-map-marker' @click='on_switch_map_marker'>地图中心标记</div>
                <div class='-scale button switch-map-marker-3d' @click='on_switch_map_marker_3d'>地图中心3D标记</div>
                <div class='-scale button switch-map-polyline' @click='on_switch_map_polyline'>折线演示</div>
                <div class='-scale button switch-map-polygon' @click='on_switch_map_polygon'>多边形演示</div>
                <div class='-scale button switch-map-area' @click='on_switch_map_area'>显示区域</div>
                <div class='-scale button switch-map-area-3d' @click='on_switch_map_area_3d'>显示3D区域</div>
                <div class='-scale button switch-ground-pic' @click='on_switch_map_ground_pic'>显示手绘图片</div>
                <div class='-scale button switch-ground-canvas' @click='on_switch_map_ground_canvas'>显示canvas</div>
                <div class='-scale button switch-ground-video' @click='on_switch_map_ground_video'>显示视频</div>
            </div>
            <div class='-section'>
                <div class='-scale button switch-map-marker' @click='on_switch_map_label'>显示标签</div>
            </div>
        </div>
    </div>
</template>

<script language='ts'>
    export default {
		name: 'BaiduMap',

		components: {
		},

		data() {
			return {
                _baidu_map: null,
                _type: 0,
                _types: ['normal', 'earth', 'satellite'],
                _customized_style: false,
                _heading: false,
                _tilt: false,
                _function: false,
                _marker: null,
                _marker_3d: null,
                _polyline: null,
                _polygon: null,
                _area: null,
                _area_3d: null,
                _ground_pic: null,
                _ground_video: null,
                _ground_canvas: null,
                _label: null,
			};
		},

		created() {
			this.init();
		},

		mounted () {
            this.init_map();
		},

		beforeDestroy() {
			this.uninit();
		},

        watch: { 
            _type: {
                deep: true,
                immediate: false,
                handler: function(val) {
                    this._baidu_map.set_type(this._types[this._type]);
                }
            },

            _heading: {
                deep: true,
                immediate: false,
                handler: function(val) {
                    if (val) this._baidu_map.set_heading(64.5);
                    else this._baidu_map.set_heading();
                }
            },

            _tilt: {
                deep: true,
                immediate: false,
                handler: function(val) {
                    if (val) this._baidu_map.set_tilt(73);
                    else this._baidu_map.set_tilt();
                }
            },

            _customized_style: {
                deep: true,
                immediate: false,
                handler: function(val) {
                    if (val) this._baidu_map.set_style('218ab067da15b7d22a83bd3459eec1d0');
                    else this._baidu_map.set_style();;
                }
            },

            _function: {
                deep: true,
                immediate: false,
                handler: function(val) {
                    this.switch_map_function();
                }
            },
        },

		methods: {
            on_reset_map() {
                console.log('On click reset map');
                this.reset_map();
            },

            on_swith_map_type() { // 切换地图类型
                console.log('On switch map type');

                this._type = (this._type + 1) % this._types.length;
            },

            on_switch_map_customized_style() {
                console.log('On set customized map style.');
                
                this._customized_style = this._customized_style ? false : true;
            },

            on_switch_map_heading() {
                console.log('On click set map heading');

                this._heading = this._heading ? false : true;
            },

            on_switch_map_tilt() {
                console.log('On click set map tilt');

                this._tilt = this._tilt ? false : true;
            },

            on_switch_map_function() {
                console.log('On add map function');

                this._function = this._function ? false : true;
            },

            on_switch_map_marker() {
                console.log('On switch map marker');

                this.switch_map_marker();
            },

            on_switch_map_marker_3d() {
                console.log('On switch map marker 3D');

                this.switch_map_marker_3d();
            },

            on_switch_map_polyline() {
                console.log('On switch map polyline');

                this.switch_map_polyline();
            },

            on_switch_map_polygon() {
                console.log('On switch map polygon');

                this.switch_map_polygon();
            },

            on_switch_map_area() {
                console.log('On switch map area');

                this.switch_map_area();
            },

            on_switch_map_area_3d() {
                console.log('On switch map area 3D');

                this.switch_map_area_3d();
            },

            on_switch_map_ground_pic() {
                console.log('On switch ground picture');

                this.switch_map_ground_pic();
            },

            on_switch_map_ground_canvas() {
                console.log('On switch ground picture');

                this.switch_map_ground_canvas();
            },

            on_switch_map_ground_video() {
                console.log('On switch ground video');

                this.switch_map_ground_video();
            },

            on_switch_map_label() {
                console.log('On switch label');

                this.switch_map_label();
            },
            
            /*************************/
			init() {
                console.log('Initialize baidu map');
            },

			uninit() {
				console.log('Uninitialize baidu map');
			},

            init_map() {
                console.log('Initialize baidu map');

                this._baidu_map = new this.$utils.baidu_map('baidu-map-container');
                this._baidu_map.show();
                this.reset_map();                    
            },

            reset_map() {
                console.log('Reset baidu map');

                let point = this._baidu_map.get_point(116.404, 39.915);
                this._baidu_map.enable_scroll_wheel_zoom(true);
                this._baidu_map.set_locate({
                    point: point
                });

                // 测试特性重置
                this._heading = false;
                this._tilt = false;
                this._customized_style = false;
                this._type = 0;
                this._function = false;

                // 事件重置
                let click_map_handler = (e) => {
                    console.log('点击位置经纬度：' + e.latlng.lng + ',' + e.latlng.lat);
                };
                this._baidu_map.remove_listener('click', click_map_handler);
                this._baidu_map.set_listener('click', click_map_handler);
            },

            switch_map_function() { // 添加地图功能按钮
                if (this._function) {
                    // 缩放控件
                    this._baidu_map.add_control({
                        name: 'zoom', 
                        style: { anchor: 'top_left', offset_x: 10, offset_y: 10 }
                    });

                    // 比例尺
                    this._baidu_map.add_control({
                        name: 'scale', 
                        style: { anchor: 'top_left', offset_x: 50, offset_y: 10 }
                    });

                    // 城市列表
                    this._baidu_map.add_control({
                        name: 'cities', 
                        style: { anchor: 'top_right', offset_x: 60, offset_y: 10 }
                    });

                    // 定位
                    this._baidu_map.add_control({
                        name: 'location', 
                        style: { anchor: 'top_right', offset_x: 10, offset_y: 10 }
                    });
                } else {
                    // 缩放控件
                    this._baidu_map.remove_control('zoom');
                    // 比例尺
                    this._baidu_map.remove_control('scale');
                    // 城市列表
                    this._baidu_map.remove_control('cities');
                    // 定位
                    this._baidu_map.remove_control('location');
                }
            },

            switch_map_marker() { // 当前地图中心点进行标记
                let _this = this;
                if (this._marker) {
                    this._baidu_map.remove_element(this._marker);
                    this._marker = null;
                } 

                // 重新定位
                this._marker = this._baidu_map.set_marker({title: '地图中心'});
                let point = this._marker.getPosition();
                this._marker && this._marker.addEventListener('click', function(){   
                    // alert('您点击了地图中心');

                    let options = {
                        width : 200,     // 信息窗口宽度
                        height: 100,     // 信息窗口高度
                        title : "地图中心" , // 信息窗口标题
                        content: "这里是定位地图视窗的中心点"
                    };
                    options['point'] = point;
                    _this._baidu_map.info_window(options);
                });
            },

            switch_map_marker_3d() { // 当前地图中心点进行3D标记
                if (this._marker_3d) {
                    this._baidu_map.remove_element(this._marker_3d);
                    this._marker_3d = null;
                } 

                // 重新定位
                this._marker_3d = this._baidu_map.set_marker({
                    three_dimension: true,
                    height: 2000,
                    size: 100,
                    fillColor: '#454399',
                    fillOpacity: 0.6,
                    icon: this._baidu_map.get_icon({url: './image/green_turtle.png', width: 40, height: 40})
                });
                this._marker_3d && this._marker_3d.addEventListener("click", function(){   
                    alert("您点击了3D标注");   
                });
            },

            switch_map_polyline() { // 显/隐折线
                if (this._polyline) {
                    this._baidu_map.remove_element(this._polyline);
                    this._polyline = null;
                }
                
                // 重绘
                let center_point = this._baidu_map.get_center(); // console.log(center_point);
                this._polyline = this._baidu_map.set_polyline({
                    points: [{
                        x: center_point.lng - Math.random() / 100,
                        y: center_point.lat - Math.random() / 100
                    }, {
                        x: center_point.lng + Math.random() / 100, 
                        y: center_point.lat - Math.random() / 100
                    }, {
                        x: center_point.lng, 
                        y: center_point.lat + Math.random() / 100
                    }],
                    strokeColor: 'blue',
                    strokeWeight: 3,
                    strokeOpacity: 0.5,
                    strokeStyle: 'dashed',                    
                });
            },

            switch_map_polygon() { // 显/隐多边形
                if (this._polygon) {
                    this._baidu_map.remove_element(this._polygon);
                    this._polygon = null;
                }
                
                // 重绘
                let center_point = this._baidu_map.get_center(); // console.log(center_point);
                this._polygon = this._baidu_map.set_polygon({
                    points: [{
                        x: center_point.lng + (Math.random() * 2 - 1) / 100, 
                        y: center_point.lat + (Math.random() * 2 - 1) / 100
                    }, {
                        x: center_point.lng + (Math.random() * 2 - 1) / 100, 
                        y: center_point.lat + (Math.random() * 2 - 1) / 100
                    }, {
                        x: center_point.lng + (Math.random() * 2 - 1) / 100, 
                        y: center_point.lat + (Math.random() * 2 - 1) / 100
                    }, {
                        x: center_point.lng + (Math.random() * 2 - 1) / 100, 
                        y: center_point.lat + (Math.random() * 2 - 1) / 100
                    }],
                    strokeColor: 'red',
                    strokeWeight: 1,
                    strokeOpacity: 0.5,
                    fillColor: 'red',
                    fillOpacity: 0.3,
                    enableEditing: true,
                });
            },

            switch_map_area() { // 显/隐区域
                let _this = this;

                if (this._area) {
                    this._baidu_map.remove_element(this._area);
                    this._area = null;
                } else {
                    this._baidu_map.set_locate({
                        point: '上海',
                        zoom: 11
                    });

                    this._baidu_map.get_boundary({
                        name: '闵行区',
                        call_back: (result) => {
                            _this._area = _this._baidu_map.set_area({
                                three_dimension: false,
                                points: result.boundaries,
                                fillColor: 'blue',
                                fillOpacity: 0.2
                            });
                        }
                    });
                }
            },
            
            switch_map_area_3d() { // 显/隐3D区域
                let _this = this;
                let area_name = '闵行区';

                if (this._area_3d) {
                    this._baidu_map.remove_element(this._area_3d);
                    this._area_3d = null;
                } else {
                    this._baidu_map.set_locate({
                        point: '上海',
                        zoom: 11
                    });

                    this._baidu_map.get_boundary({
                        name: area_name,
                        call_back: (result) => {
                            _this._area_3d = _this._baidu_map.set_area({
                                three_dimension: true,
                                points: result.boundaries,
                                height: 500,
                                topFillColor: 'red',
                                topFillOpacity: 0.1,
                                sideFillColor: 'red',
                                sideFillOpacity: 0.8
                            });

                            // 绑定鼠标事件
                            var events = ['click', 'mouseover', 'mouseout'];
                            for (let i = 0; i < events.length; i++) {
                                _this._area_3d[0].addEventListener(events[i], (e) => {
                                    switch (events[i]) {
                                        case 'click':
                                            // alert(area_name);
                                            break;
                                        case 'mouseover':
                                            e.target.setTopFillColor('red');
                                            e.target.setTopFillOpacity(0.3);
                                            break;
                                        case 'mouseout':
                                            e.target.setTopFillColor('red');
                                            e.target.setTopFillOpacity(0.1);
                                            break;
                                    }
                                }); 
                            }
                        } // call_back 
                    });
                }
            },

            switch_map_ground_pic() { // 显/隐手绘图片
                if (this._ground_pic) {
                    this._baidu_map.remove_element(this._ground_pic);
                    this._ground_pic = null;
                } else {
                    this._baidu_map.set_locate({
                        point: this._baidu_map.get_point(117.200, 36.2437),
                        zoom: 17
                    });

                    let pStart = this._baidu_map.get_point(117.19635, 36.24093);
                    let pEnd = this._baidu_map.get_point(117.20350, 36.24764);
                    let bounds = this._baidu_map.get_bounds(
                        this._baidu_map.get_point(pStart.lng, pEnd.lat),
                        this._baidu_map.get_point(pEnd.lng, pStart.lat),
                    );
                    this._ground_pic = this._baidu_map.set_overlay({
                        points: bounds,
                        type: 'image',
                        url: './image/shouhuimap.png',
                        opacity: 0.3
                    });
                }   
            },

            switch_map_ground_canvas() { // 显/隐画板
                if (this._ground_canvas) {
                    this._baidu_map.remove_element(this._ground_canvas);
                    this._ground_canvas = null;
                } else {
                    this._baidu_map.set_locate({
                        point: this._baidu_map.get_point(116.450484, 39.921283),
                        zoom: 17
                    });

                    let get_canvas = () => {
                        let canvas = document.createElement('canvas');
                        canvas.width = canvas.height = 200;
                        let ctx = canvas.getContext('2d');
                        ctx && (ctx.fillStyle = 'blue');
                        ctx && (ctx.strokeStyle = 'white');
                        ctx && (ctx.lineWidth = 6);
                        ctx && (ctx.lineCap = 'square');
                        ctx && (ctx.fillRect(0, 0, 200, 200));
                        ctx && (ctx.moveTo(50, 50));
                        ctx && (ctx.lineTo(150, 50));
                        ctx && (ctx.lineTo(150, 150));
                        ctx && (ctx.lineTo(50, 150));
                        ctx && (ctx.lineTo(50, 50));
                        ctx && ctx.stroke();

                        return canvas;
                    };
                    let pStart = this._baidu_map.get_point(116.447717, 39.919173);
                    let pEnd = this._baidu_map.get_point(116.453125, 39.923475);
                    let bounds = this._baidu_map.get_bounds(
                        this._baidu_map.get_point(pStart.lng, pEnd.lat), 
                        this._baidu_map.get_point(pEnd.lng, pStart.lat)
                    );
                    this._ground_canvas = this._baidu_map.set_overlay({
                        points: bounds,
                        type: 'canvas',
                        url: get_canvas(),
                        opacity: 0.2
                    });
                }   
            },

            switch_map_ground_video() { // 显/隐视频
                if (this._ground_video) {
                    this._baidu_map.remove_element(this._ground_video);
                    this._ground_video = null;
                } else {
                    this._baidu_map.set_locate({
                        point: this._baidu_map.get_point(119.308, 25.668),
                        zoom: 4
                    });

                    let pStart = this._baidu_map.get_point(94.582033, -7.989754);
                    let pEnd = this._baidu_map.get_point(145.358572, 30.813867);
                    let bounds = this._baidu_map.get_bounds(
                        this._baidu_map.get_point(pStart.lng, pEnd.lat), 
                        this._baidu_map.get_point(pEnd.lng, pStart.lat)
                    );
                    this._ground_video = this._baidu_map.set_overlay({
                        points: bounds,
                        type: 'video',
                        url: './video/cloud.mov',
                        opacity: 0.3
                    });
                }   
            },

            switch_map_label() { // 显/隐标签
                if (this._label) {
                    this._baidu_map.remove_element(this._label);
                    this._label = null;
                } else {
                    this._label = this._baidu_map.set_label({
                        content: '地图文本标签',
                        position: this._baidu_map.get_center(),
                        offset: this._baidu_map.get_size(10, 20),
                    });
                    this._label.setStyle({
                        padding: '3px 10px',
                        color: '#101010',
                        fontSize: '14px', 
                        fontWeight: 'bold',
                        letterSpacing: '2px',
                        border: '1px solid #c0c0c0',
                        borderRadius: '5px',
                        opacity: '0.7',
                    });
                    this._label.addEventListener('mouseover', () => {
                        this._label.setStyle({
                            border: '0',
                            boxShadow: '0 0 8px 0 rgba(0, 0, 0, 0.8)',
                            opacity: '1',
                        });
                    });
                    this._label.addEventListener('mouseout', () => {
                        this._label.setStyle({
                            border: '1px solid #c0c0c0',
                            boxShadow: 'none',
                            opacity: '0.7',
                        });
                    });
                }   
            },
        }
	}
</script>

<style src='./BaiduMap.less' lang='less' scoped/>
<style scoped>
</style>
