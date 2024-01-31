/*
	baidu map functions
    2023.6.13 Created by GuoJS
*/

const baidu_map = function(id) {
    let _map = null;
    let _id = id;
    let _map_zoom = null;
    let _map_scale = null;
    let _map_cities = null;
    let _map_location = null;

    let init = () => {
        console.log('Create baidu map');
        this._map = new BMapGL.Map(_id);            
    };

    let boundary_2_path = (boundary) => {
        let result = [];
        let str = boundary.replace(' ', '');
        let p = str.split(';');
        for (let j=0; j<p.length; j++) {
            let lng = p[j].split(',')[0];
            let lat = p[j].split(',')[1];
            result.push(new BMapGL.Point(lng, lat));
        }

        return result;
    }

    this.show = () => { // 显示地图
        console.log('Show baidu map');

        this._map && this._map.centerAndZoom();
    };

    this.enable_scroll_wheel_zoom = (enable) => { // 允许鼠标滚轮缩放
        if (enable) {
            this._map.enableScrollWheelZoom();
        } else {
            this._map.disableScrollWheelZoom();
        }
    };

    this.set_type = (type) => { // 地图类型
        if (type == 'normal') {
            this._map.setMapType(BMAP_NORMAL_MAP);  
        } if (type == 'earth') {
            this._map.setMapType(BMAP_EARTH_MAP);  
        } if (type == 'satellite') {
            this._map.setMapType(BMAP_SATELLITE_MAP);  
        } else {
            this._map.setMapType(BMAP_NORMAL_MAP);  
        }
    };

    this.set_heading = (heading) => { // 地图旋转角度
        this._map && this._map.setHeading(heading? heading: 0);
    };

    this.set_tilt= (tilt) => { // 地图倾斜角度
        this._map && this._map.setTilt(tilt? tilt: 0);
    };

    this.set_style = (id) => { // 地图样式
        this._map && this._map.setMapStyleV2({
            styleId: id
        });    
    };

    this.get_center = () => { // 获取当前地图中心点
        return this._map.getCenter();
    };

    this.get_point = (lng, lat) =>{ // 创建定点位置对象
        return new BMapGL.Point(lng, lat);
    };

    this.get_bounds = (sw, ne) => { // 根据两个点返回边界对象
        return new BMapGL.Bounds(sw, ne);
    },

    this.get_icon = (param) =>{ // 创建icon对象
        let url = '';
        let width = 10;
        let height = 10;

        // parameters
        if (param && param.url) {
            url = param.url;
        }
        if (param && typeof(param.width) == 'number') {
            width = param.width;
        }
        if (param && typeof(param.height) == 'number') {
            height = param.height;
        }

        // create
        return new BMapGL.Icon(url, new BMapGL.Size(width, height));        
    };

    this.get_boundary = (param) => { // 获取区域边界定义
        let name = '';
        let call_back = null;
        // check
        if (param && param.name) {
            name = param.name;
        }
        if (param && param.call_back) {
            call_back = param.call_back;
        }

        // call
        let boundary = new BMapGL.Boundary();
        boundary.get(name, (result) => {
            if (call_back && typeof call_back == 'function') {
                call_back(result);
            }
        });
    };

    this.get_size = (width, height) => { // 创建矩形尺寸对象
        new BMapGL.Size(width, height);
    };

    this.set_listener = (event, handler) => { // 添加地图事件监控
        if (!event) return;
        if (!handler) return;

        this._map.addEventListener(event, handler);
    };

    this.remove_listener = (event, handler) => { // 移除地图事件监控
        if (!event) return;
        if (!handler) return;

        this._map.removeEventListener(event, handler);
    };

    this.add_control = (param) => {
        let name = '';
        let offset_x = 0;
        let offset_y = 0;
        let style = {
            anchor: BMAP_ANCHOR_TOP_LEFT,
        };

        // parameters
        if (param && param.name) {
            name = param.name;
        }
        if (param && param.style) {
            if (param.style.anchor) {
                if ('top_left' == param.style.anchor) {
                    style.anchor = BMAP_ANCHOR_TOP_LEFT;
                }
                if ('top_right' == param.style.anchor) {
                    style.anchor = BMAP_ANCHOR_TOP_RIGHT;
                }

                if (typeof param.style.offset_x == 'number') {
                    offset_x = param.style.offset_x;
                }

                if (typeof param.style.offset_y == 'number') {
                    offset_y = param.style.offset_y;
                }
            }
        } 

        // create control
        style.offset = new BMapGL.Size(offset_x, offset_y);
        if ((name == 'zoom') && (!this._map_zoom)) {
            this._map_zoom = new BMapGL.ZoomControl(style);
            this._map.addControl(this._map_zoom);            
        } else if ((name == 'scale') && (!this._map_scale)) {
            this._map_scale = new BMapGL.ScaleControl(style);
            this._map.addControl(this._map_scale); 
        } else if ((name == 'cities') && (!this._map_cities)) {
            this._map_cities = new BMapGL.CityListControl(style);
            this._map.addControl(this._map_cities); 
        } else if ((name == 'location') && (!this._map_location)) {
            this._map_location = new BMapGL.LocationControl(style);
            this._map.addControl(this._map_location); 
        }
    };

    this.remove_control = (name) => {
        if ((name == 'zoom') && (this._map_zoom)) {
            this._map.removeControl(this._map_zoom);
            this._map_zoom = null;
        } else if ((name == 'scale') && (this._map_scale)) {
            this._map.removeControl(this._map_scale);
            this._map_scale = null;
        } else if ((name == 'cities') && (this._map_cities)) {
            this._map.removeControl(this._map_cities);
            this._map_cities = null;
        } else if ((name == 'location') && (this._map_location)) {
            this._map.removeControl(this._map_location);
            this._map_location = null;
        }
    };

    this.set_locate = (param) => { // 地图定位
        console.log('Locate in baidu map');
        let point = '';
        let zoom = 15;

        if (param && param.point) {
            point = param.point;
        }
        if (param && param.zoom) {
            zoom = param.zoom;
        }

        this._map && this._map.centerAndZoom(point, zoom);
    };

    this.set_marker = (options) => {
        console.log('Add marker on map');
        let point = null;
        let height = 0;
        let three_dimension = false;
        let element = null;

        // Get parameters
        if (options && options.three_dimension) {
            three_dimension = options.three_dimension;
        }
        if (options && options.point) {
            point = options.point;
        }
        if (options && options.height) {
            height = options.height;
        }

        // Create
        // Set default location
        if (!point) point = this._map.getCenter();
        if (three_dimension) { // 3D
            element = new BMapGL.Marker3D(point, height, options); 
        } else { // 2D
            element = new BMapGL.Marker(point, options); 
        }
        this._map.addOverlay(element);

        return element;
    };

    this.set_polyline = (options) => {
        console.log('Add polyline on map');
        let points = [];
        let element = null;

        // Get parameters
        if (options && options.points && options.points.length > 0) {
            for (let i = 0; i < options.points.length; i++) {
                points.push(new BMapGL.Point(
                    options.points[i].x,
                    options.points[i].y
                ));
            }
        }

        // Create
        element = new BMapGL.Polyline(points, options); 
        this._map.addOverlay(element);

        return element;
    };

    this.set_polygon = (options) => {
        console.log('Add polygon on map');
        let points = [];
        let element = null;

        // Get parameters
        if (options && options.points && options.points.length > 0) {
            for (let i = 0; i < options.points.length; i++) {
                points.push(new BMapGL.Point(
                    options.points[i].x,
                    options.points[i].y
                ));
            }
        }

        // Create
        element = new BMapGL.Polygon(points, options); 
        this._map.addOverlay(element);

        return element;
    };
    
    this.set_area = (options) => {
        console.log('Add area on map');
        let three_dimension = false;
        let points = [];
        let height = 0;
        let element = null;

        // Get parameters
        if (options && options.three_dimension) {
            three_dimension = options.three_dimension;
        }
        if (options && options.points) {
            points = options.points;
        }
        if (options && options.height) {
            height = options.height;
        }

        // Create
        if (three_dimension) { // 3D
            element = [];
            let count = points.length;
            for (let i = 0; i < count; i++) {
                let path = boundary_2_path(points[i]);
                element.push(new BMapGL.Prism(path, height, options));
            }
        } else { // 2D
            element = new BMapGL.Polygon(points, options); 
        }

        // Show
        if (Array.isArray(element)) {
            for (let i=0; i<element.length; i++) {
                this._map.addOverlay(element[i]);
            }
        } else {
            this._map.addOverlay(element);
        }

        return element;
    };

    this.set_overlay = (options) => {
        console.log('Add overlay on map');
        let points = [];
        let element = null;

        // Get parameters
        if (options && options.points) {
            points = options.points;
        }

        // Create
        element = new BMapGL.GroundOverlay(points, options);
        this._map.addOverlay(element);

        return element;
    };

    this.set_label = (options) => {
        console.log('Add label on map');
        let content = '未设置';
        let element = null;

        // Get parameters
        if (options && options.content) {
            content = options.content;
        }

        // Create
        element = new BMapGL.Label(content, options);
        this._map.addOverlay(element);

        return element;
    };

    this.remove_element = (element) => { // 删除地图元素
        if (Array.isArray(element)) {
            for (let i=0; i<element.length; i++) {
                this._map.removeOverlay(element[i]);
            }
        } else {
            this._map.removeOverlay(element);
        }
    };

    this.info_window = (options) => {
        console.log('Show information window');
        let content = '未设置';
        let point = null;
        let dialog = null;

        // Get parameters
        if (options && options.content) {
            content = options.content;
        }
        if (options && options.point) {
            point = options.point;
        }
        
        // Create
        dialog = new BMapGL.InfoWindow(content, options);
        this._map.openInfoWindow(dialog, point);

        return dialog;
    };
    
    init();
};

export default baidu_map;