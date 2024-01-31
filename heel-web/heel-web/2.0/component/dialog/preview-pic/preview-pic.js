/*
	heel-web component preview picture
	2023.4.20 created by guojs
*/
var heelWeb = heelWeb || {};
heelWeb.component = heelWeb.component || {};
heelWeb.component.preview_pic = (new function (){
    console.log('Create object preview_pic');
    let _this = this;
    let _preview_default_width = 300;
    let _dialog, _preview, _pic, _resize_bar, _resize_box;

	let _create = function() {
		// create dialog
        let param = {};
		param.ex_class = 'hw-preview-pic';
        param.caption = '图片预览';
        param.destroy_on_close = false;
        param.have_mask = false;
		_dialog = new heelWeb.component.dialog(param);
		
		// customize dialog
		content = _dialog.content();
		_preview = $('<div class="hw-flex-col hw-preview-pic-content"><img decoding="async"></div>');
        _pic = _preview.find('img');
        _resize_bar = $('<div class="hw-flex-row resize-bar"><div class="resize-box"></div></div>');
        _resize_box = _resize_bar.find('.resize-box');
        _preview.append(_resize_bar);
		content.append(_preview);

        _preview.width(_preview_default_width + 'px');
	};

    let _set_pos_offset = (reset, x, y) => { // 依据移动量设置位置
        let dialog_el = _dialog.el();
        let dialog_width = dialog_el.width();
        let dialog_height = dialog_el.height();
        let container_width = $(document).width();
        let container_height = $(document).height();

        if (reset) {
            dialog_el.css({
                'top': 'auto',
                'right': 'auto',
                'bottom': '10px',
                'left': '10px',
            });            
            return;
        }

        x = x < 0 ? 0 : x > container_width - dialog_width ? container_width - dialog_width : x;
        y = y < 0 ? 0 : y > container_height - dialog_height ? container_height - dialog_height : y;

        dialog_el.css({
            'top': y + 'px',
            'right': 'auto',
            'bottom': 'auto',
            'left': x + 'px',
        });
    };

    let _drag_dialog = () => {
        let dialog_el = _dialog.el();
        let dialog_header = dialog_el.find('.dialog-header');
        let drag_start_x, drag_start_y; // 开始拖动，鼠标位置x、y
        let drag_start_x_dialog, drag_start_y_dialog; // 开始拖动，窗口位置x、y

        // 拖动事件
        dialog_header.mousedown((event) => {
            console.log('Preview dialog mousedown');
            drag_start_x = event.pageX; 
            drag_start_y = event.pageY; 
            console.log('Drag start position (' + drag_start_x + ', ' + drag_start_y +')');
            drag_start_x_dialog = dialog_el.offset().left; 
            drag_start_y_dialog = dialog_el.offset().top; 
            console.log('Dialog position (' + drag_start_x_dialog + ', ' + drag_start_y_dialog +')');

            let on_mouse_up = function(event) { // 拖动结束
                console.log('Preview dialog mouseup');
                let offset_x = event.pageX - drag_start_x; // X移动量
                let offset_y = event.pageY - drag_start_y; // Y移动量
                console.log('Drag offset (' + offset_x + ', ' + offset_y +')');
        
                _set_pos_offset(false, drag_start_x_dialog + offset_x, drag_start_y_dialog + offset_y);

                $(document).off('mouseup', on_mouse_up);
                $(document).off('mousemove', on_mouse_move);

                myApi.display.tricks.play({
                    domEl: dialog_el, 
                    styleName: 'heel-web-drop-down-with-shake'
                });            
            };

            let on_mouse_move = function(event) { // 拖动结束
                // console.log('Preview dialog mousemove');
                let offset_x = event.pageX - drag_start_x; // X移动量
                let offset_y = event.pageY - drag_start_y; // Y移动量
                // console.log('Drag offset (' + offset_x + ', ' + offset_y +')');

                if ((Math.abs(offset_x) > 10) || (Math.abs(offset_y) > 10)) {
                    _set_pos_offset(false, drag_start_x_dialog + offset_x, drag_start_y_dialog + offset_y);
                }
            };
            
            $(document).on('mouseup', on_mouse_up);
            $(document).on('mousemove', on_mouse_move);
        });
    };

    let _set_size = (reset, end_x, end_y) => { // 依据拖动鼠标位置，设置对话框大小
        let x = _preview.offset().left;
        let y = _preview.offset().top;

        if (reset) {
            _preview.css('width', _preview_default_width + 'px');
            return;
        }

        let min_width = 150;
        let width = (end_x - x) >= min_width ? end_x - x : min_width;
        _preview.width(width + 'px');

        // let min_height = 300;
        // let height = (end_y - y) >= min_height ? end_y - y : min_height;
        // _preview.height(height + 'px');

        // 应对dialog位置偏出显示区域
        _set_pos_offset(false, _dialog.el().offset().left, _dialog.el().offset().top);
    };    

    let _resize_dialog = () => {
        // 改变窗口大小
        _resize_box.mousedown((event) => {
            console.log('Preview dialog resize mousedown');

            let on_mouse_move = function(event) { // 拖动结束
                // console.log('Preview dialog resize mousemove');
                let end_x = event.pageX; // X坐标
                let end_y = event.pageY; // Y坐标
                // console.log('Drag end position (' + end_x + ', ' + end_y +')');

                _set_size(false, end_x, end_y);
            };

            let on_mouse_up = function(event) { // 改变窗口大小结束
                console.log('Preview dialog resize mouseup');
                let end_x = event.pageX; // X坐标
                let end_y = event.pageY; // Y坐标
                console.log('Drag end position (' + end_x + ', ' + end_y +')');
        
                _set_size(false, end_x, end_y);

                $('body').off('mouseup', on_mouse_up);
                $('body').off('mousemove', on_mouse_move);
                $('body').css('cursor', 'default');
            };
            
            $('body').on('mouseup', on_mouse_up);
            $('body').on('mousemove', on_mouse_move);
            $('body').css('cursor', 'nw-resize');
        });
    };

    let _events = function() {
        _drag_dialog();
        _resize_dialog();
    };

    let _init = function(){
		console.log('preview_pic.init()');

        _create();
		_events();
	};

    let _set_pic = function(url) { // 更新图片
        _pic.attr('src', url);
    };

	this.show = function(param) {	
		console.log('preview_pic.show()');
        console.log('param=' + JSON.stringify(param));
        let file_name = '', url = '';

        // check
        if (typeof param != 'object') {
            console.log('Invalid param object');
            return;
        }

        if (typeof param.file_name == 'string' & param.file_name.trim().length > 0) {
            file_name = param.file_name;
        } else {
            console.log('Invalid file name');
            return;
        }

        if (typeof param.url == 'string' & param.url.trim().length > 0) {
            url = param.url;
        } else {
            console.log('Invalid file url');
            return;
        }

        // update
        _dialog.caption().text(file_name);
        _set_pic(url);
        if (_dialog.el().is(':hidden')) {
            _set_pos_offset(true);
            _set_size(true);
        }

        // show
		_dialog.show();
	};

    _init();
}());