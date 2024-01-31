
/** 
 * heel-web component listview user style object.
 * 
 * 2023.10.9 created by GuoJS.
 */

var heelWeb = heelWeb || {};
heelWeb.component = heelWeb.component || {};
heelWeb.component.listview = heelWeb.component.listview || {};
heelWeb.component.listview.user_style = function (listview, container) {
    let _listview = listview;
    let _container = container;
	let _menu, _menu_container, _menu_list, _icon;
	let _config_key = 'layout';

    let _setting_of_layout = function() { // setting of grid
		let self = this;

		// 获取布局配置
        let layout = _get_layout_from_config.call(self);
        if (!layout) {
            layout = {... _listview.original_user_layout};
        }

        // 设置
        let dialog_settings = new heelWeb.component.dialog_grid_layout({
            form: _form_key(),
            id: _control_key(),
			// select_field_index: _grid.selectFieldIndex, // 选择字段，最好不要移动，此处无用
            layout: layout,
            on_ok: (layout) => {
                console.log('update layout.layout=' + JSON.stringify(layout));

                _save_layout.call(self, layout); // 保存新的显示布局
				_refresh_control.call(self); // 刷新显示
            }
        });
        dialog_settings.show();
    };    

    let _set_display_page_idx = function(idx) { // update page index on interface
        let page_idxes = $('#' + _control_id() + '.ui-lv .paginationjs-pages .paginationjs-page');
        
        idx = idx < 1 ? 1 : idx;
        for (let i=0; i<page_idxes.length; i++) {
            let index = Number($(page_idxes[i]).attr('data-num'));
            
            // reset
            page_idxes[i].className = 'paginationjs-page paginationjs-first paginationjs-page';
            // select
            if (index == idx) {
                page_idxes[i].className = 'paginationjs-page paginationjs-page active';
            }
        }
    };

    let _get_control_size = function () {
        let result = {
            width: 500,
            height: 300 
        };

        // Get information
        let control = $('#' + _control_id() + '.ui-lv');
        if (control.length == 1) {
            result.width = Number(control.css('width').replace('px', ''));
            result.height = Number(control.css('height').replace('px', ''));
        }

        return result;
    };

	let _refresh_control = function() { // repaint
        // get layout information
        let size = _get_control_size();
        let page_idx = _listview.curPageIndex;

        // reset control
        _container.empty();
        _listview.container = null;
        _listview.rendered = false;
        _listview.$table = null;
        _listview.el = null;
        _listview.lastSize = {
            width: -1,
            height: -1
        };
        _listview.user_style = null; // unbind control
        _listview.curPageIndex = 0;

        // repaint control
        _listview.doRender(_container);
        _listview.setWidth(size.width);
        _listview.setHeight(size.height);

        // restore page index
        _set_display_page_idx(page_idx);
	};

    let _remove_layout_from_config = function() { // remove layout config
        let config =  heelWeb.config.get(_config_key);
        let form = _form_key();
        let listview = _control_key();

        // 配置是否存在？
        if (typeof config != 'object') {
            return;
        }

        // 找界面配置位置
        if (typeof config[form] != 'object') {
            return;
        }

        // 找界面中表格配置数组
        if (typeof config[form]['listviews'] != 'object') {
            return;
        }

        // 找界面中指定表格配置
        if (typeof config[form]['listviews'][listview] == 'undefined') {
            return;
        }

        // 移除配置
        delete config[form]['listviews'][listview];

        // 保存配置
        heelWeb.config.set(_config_key, config);
        heelWeb.config.update();
    };
    
    let _save_layout = function(layout) { // 保存grid个性化外观配置
        let config =  heelWeb.config.get(_config_key);
        let form = _form_key();
        let listview = _control_key();
		
        // 配置是否存在？
        if (typeof config != 'object') {
            config = {};
        }

        // 找界面配置位置
        if (typeof config[form] != 'object') {
            config[form] = {};
        }

        // 找界面中表格配置数组
        if (typeof config[form]['listviews'] != 'object') {
            config[form]['listviews'] = {};
        }

        // 找界面中指定表格配置
        if (typeof config[form]['listviews'][listview] != 'object') {
            config[form]['listviews'][listview] = {};
        }

        // 更新配置
        config[form]['listviews'][listview] = layout;

        // 保存配置
        heelWeb.config.set(_config_key, config);
        heelWeb.config.update();
    };
    
	let _get_layout = function() { // Get current layout
		console.log('Git current layout of listview ' + _control_id());
		let layout = {};

        // 列信息
        layout['fields'] = []
        let configs = _listview.getMetaObj().columnInfo;
        let displays = _listview.$table.find('tr.head table.tbl-head th');
		configs.forEach((config, idx) => {
			let field = {}; // 字段信息

			// field key
			field['key'] = config.key;
			// field name
			field['label'] = config.caption;
			// field width            
			field['width'] = config.width;
            for (let i=0; i<displays.length; i++) {
                if ($(displays[i]).attr('colindex') == idx) { // found
                    field['width'] = $(displays[i]).css('width');
                    break;
                }
            }
			// visibility
			field['hidden'] = !config.visible;

            layout['fields'].push(field);			
		});

		return layout;
	};

    let _get_original_layout = function() { // Get layout before customize
		console.log('Git original layout of listview ' + _control_id());
		let layout = {};

        // 只保存一次
        if (_listview.original_user_layout) return;

        // 列信息
        layout['fields'] = []
        let configs = _listview.getMetaObj().columnInfo;
		configs.forEach((config, idx) => {
			let field = {}; // 字段信息

			// field key
			field['key'] = config.key;
			// field name
			field['label'] = config.caption;
			// field width            
			field['width'] = config.width;
			// visibility
			field['hidden'] = !config.visible;

            layout['fields'].push(field);			
		});

		_listview.original_user_layout = layout;
	};

    let _get_layout_from_config = function() { // 从配置中获取布局信息
        let config =  heelWeb.config.get(_config_key);
        let form = _form_key();
        let listview = _control_key();

        // 配置是否存在？
        if (typeof config != 'object') {
            return;
        }

        // 找界面配置位置
        if (typeof config[form] != 'object') {
            return;
        }

        // 找界面中表格配置数组
        if (typeof config[form]['listviews'] != 'object') {
            return;
        }

        // 找界面中指定表格配置
        if (typeof config[form]['listviews'][listview] != 'object') {
            return;
        }

        // 返回配置
        return config[form]['listviews'][listview];         
    };	

    let _form_key = function() {
        return _listview.ofFormKey;
    };

    let _control_key = function() {
        return _listview.key;
    };

    let _control_id = function() {
        return _listview.id;
    };

    let _get_root = function() {
        return $('#' + _control_id());
    };

    let _add_menu = function() { // add menu
        // Get control key
        let control_key = _control_key();
        if (!control_key) { // invalid 
            return;
        }
        // Get from key
        let form_key = _form_key();

        // Create menu
        _menu = $('<div class="listview-customize-menu" form="' + form_key + '" listview="' + control_key + '">'
					+ '<div class="menu-container">'
						+ '<div class="menu">'
							+ '<div class="menu-item reset">'
								+ '<i class="fa-solid fa-paw hw-def-button-color menu-item-icon"/><div class="menu-item-text">重置样式</div>' // fa-hand-point-right
							+ '</div>'
							+ '<div class="menu-item settings">'
								+ '<i class="fa-solid fa-paw hw-def-button-color menu-item-icon"/><div class="menu-item-text">设置样式</div>'
							+ '</div>'
						+ '</div>'
					+ '</div>'
					+ '<div class="icon">'
						+ '<i class="fa-solid fa-share-nodes hw-def-button-color hw-scale"></i>' // fa-bookmark fa-hand-holding-heart fa-heart
					+ '</div>'
				+ '</div>');
        _menu_container = _menu.find('.menu-container');
        _menu_list = _menu.find('.menu');
        _icon = _menu.find('.icon');

		// Add menu
        _menu.appendTo(_get_root());		
    };

	let _event = function() { // add events handler
		let self = this;

        _icon.click(function() {
            _menu_container.show();

            myApi.display.tricks.play({
                domEl: _menu_list, 
                styleName: 'show-listview-customize-menu',
				timeout: 200
            });        
        });  

        _menu.mouseleave(function() {
            myApi.display.tricks.play({
                domEl: _menu_list, 
                styleName: 'hide-listview-customize-menu',
                callback: function() {
                    _menu_container.hide();
                },
				timeout: 200
            });
        });
        
        _menu_list.find('.reset').click(function() {
            console.log('Reset customized style of ' + _control_id());

			_remove_layout_from_config.apply(self); // 清除自定义显示设置
		    _refresh_control.call(self); // 刷新显示
			(new heelWeb.component.hint({message: '已清除个性化设置'})).show();
        });

        _menu_list.find('.settings').click(function() {
            console.log('Set customized style of ' + _control_id());

			_setting_of_layout.call(self);
        });

        // 监控grid控件改变字段宽度
        _get_root().delegate('div.rc-handle', 'mouseup', function() {
            setTimeout(() => { // 等显示更新完毕
				console.log('On resize column of grid ' + _control_id());

				let layout = _get_layout.apply(self); console.log('listview layout:' + JSON.stringify(layout));
				_save_layout.apply(self, [layout]);
            }, 1000);
        });
	};

    let _install = function() { // Install object for current listview
        console.log('Install user style object of listview "' + _control_id() + '"');

        _add_menu();
        _event();
        _get_original_layout(); // 保存原始布局
    };
    
    this.apply = function() {
        console.log('Apply user style of listview "' + _control_id() + '"');

		// 读取设置
		let user_style = _get_layout_from_config.apply(this);
		if (!user_style) { // 无自定义设置？使用默认显示
            if (!_listview.original_user_layout)
                return;
            user_style = {... _listview.original_user_layout};
		}

		// 更新列显示，匹配自定义样式        
        let columns = _listview.getMetaObj().columnInfo;
		columns.forEach((col) => {
            user_style['fields'].forEach((field, idx) => {
                if (col.key == field['key']) {
                    // field width
                    col.width = field['width'];
                    // visibility
                    col.visible = !field['hidden'];
                    // display order
                    col.display_index = idx;
                }
            });
		});

		// 按照当前index值决定显示顺序
		columns = columns.sort((a, b) => {
			return a.display_index - b.display_index;
		});
    };

    this.is_col_hidden = function(col) {
        let result;
        let layout = _get_layout_from_config();

        layout && layout['fields'] && layout['fields'].forEach((field) => {
            if (col.trim().toLowerCase() == field['key'].trim().toLowerCase()) {
                if (field['hidden'] == true) {
                    result = true;
                }
                if (field['hidden'] == false) {
                    result = false;
                }
            }
        });

        return result;
    };

    this.get_col_index_by_name = function(name) { // find column location by column name
        let result;
        let layout = _get_layout_from_config();

        layout && layout['fields'] && layout['fields'].forEach((field, idx) => {
            if (name.trim().toLowerCase() == field['key'].trim().toLowerCase()) {
                result = idx;
            }
        });

        return result;
    };

	// console.log('Create user style object of listview "' + _control_id() + '"');
    _install();
};