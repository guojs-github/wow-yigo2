/** 
 * heel-web component grid user style object.
 * 
 * 2023.9.14 created by GuoJS.
 */

var heelWeb = heelWeb || {};
heelWeb.component = heelWeb.component || {};
heelWeb.component.grid = heelWeb.component.grid || {};
heelWeb.component.grid.user_style = function (grid) {
	let _grid = grid;
	let _menu, _menu_container, _menu_list, _icon;
	let _user_style, _original_user_style, _display_data;
	let _config_key = 'layout';

    this.grid_id = function() { // Get grid id information
        // 当前选中tab
        let current_tab = $('li.ui-tabcontainer.aria-selected');
        if (current_tab.length != 1) {
            return null;
        }

        return {
            form: current_tab.attr('formkey'),
            grid: _grid.tableKey
        };
    };

	this.grid_id_str = function() { // Get grid id string
		let id = this.grid_id();
		if (!id) {
			return '';
		} else {
			return id.form + '\\' + id.grid;
		}
	};

	let _apply_column = function() { // apply user style for current grid columns		
		_grid.options.colModel.forEach((val, idx) => {
			// 匹配自定义配置
			for (let i=0; i<_user_style.fields.length; i++) {
				if (val.key == _user_style.fields[i].key) {
					val.label = _user_style.fields[i].label; // 改变标题显示
					val.width = _user_style.fields[i].width; // 改变列宽
					val.hidden = _user_style.fields[i].hidden; // 隐藏状态
					val.display_index = i; // 记录显示顺序

					break;
				}
			}
		});

		// 按照当前index值决定显示顺序
		_grid.options.colModel = _grid.options.colModel.sort((a, b) => {
			return a.display_index - b.display_index;
		});

		// 记录新字段顺序
		_display_cols = [];
		_grid.options.colModel.forEach(val => {
			_display_cols.push(val.key);
		});

		// 过滤隐藏字段
		_grid.options.colModel = _grid.options.colModel.sort((val, idx) => {
			if (val.hidden) {
				return false;
			}
			return true;
		});
	};

	let _apply_data = function() { // apply user style for current grid data/resultset		
		// 数据顺序调整映射表
		if (!_grid.dataModel.display_cols_map) { // 只生成一次，第二次就不灵了
			let cols_map = [..._display_cols]; // 初始化

			for (let i=0; i<cols_map.length; i++) { // new column display sequence
				for (let j=0; j<_original_user_style.fields.length; j++) { // original column display sequence
					if (cols_map[i] == _original_user_style.fields[j].key) { // found
						cols_map[i] = j; // key => data index
						break;
					}
				}
			}
			
			_grid.dataModel.display_cols_map = cols_map; // 保存映射表
		}

		// 遍历数据集，更新数据显示顺序
		for (let i=0; i<_display_data.length; i++) {
			// 似乎对编辑状态下，字段的正确对应显示，有影响
			_display_data[i].cellKeys = _display_cols;

			// 是否已经自定义过位置？
			if (_display_data[i].data[0].customized) {
				continue;
			}

			// 重新设置数据
			let original_data = [..._display_data[i].data]; // 保存原有数据定义
			_display_data[i].data = []; // 重置数据信息
			let cols_map = _grid.dataModel.display_cols_map; // 映射表
			for (let j=0; j<cols_map.length; j++) { // new column display sequence
				_display_data[i].data.push(original_data[cols_map[j]]);
			}
			_display_data[i].data[0].customized = true;
		}
	};

	this.apply = function() { // apply user style for current grid control
        let id = this.grid_id_str();
        if (id == '') { // invalid id
            return;
        }
        console.log('Apply user style 4 grid ' + id);

        // 初始化
		_user_style = [];
		_display_cols = [];
        _display_data = [..._grid.dataModel.data];

        // 取消固定列
        // _grid.options.freezeColCnt = 0;

		// 保存原始显示信息
		if (!_original_user_style) { 
			_original_user_style = _get_grid_layout.apply(this); 
		}

		// 读取设置
		_user_style = _get_grid_layout_from_config.apply(this);		
		if (!_user_style) { // 无自定义设置？使用默认显示
			_user_style = _original_user_style;
		}

		// 更新列显示，匹配自定义样式
		_apply_column();

		// 更新结果集显示，匹配自定义样式
		_apply_data();

        // 更新数据结果
        _grid.dataModel.data = _display_data;
	};

    let _save_grid_layout = function(layout) { // 保存grid个性化外观配置
        let config =  heelWeb.config.get(_config_key);
		let id = this.grid_id();
		
        // 配置是否存在？
        if (typeof config != 'object') {
            config = {};
        }

        // 找界面配置位置
        if (typeof config[id.form] != 'object') {
            config[id.form] = {};
        }

        // 找界面中表格配置数组
        if (typeof config[id.form]['grids'] != 'object') {
            config[id.form]['grids'] = {};
        }

        // 找界面中指定表格配置
        if (typeof config[id.form]['grids'][id.grid] != 'object') {
            config[id.form]['grids'][id.grid] = {};
        }

        // 更新配置
        config[id.form]['grids'][id.grid] = layout;

        // 保存配置
        heelWeb.config.set(_config_key, config);
        heelWeb.config.update();
    };

    let _get_grid_layout_from_config = function() { // 从配置中获取表格布局信息
        let config =  heelWeb.config.get(_config_key);
		let id = this.grid_id();

        // 配置是否存在？
        if (typeof config != 'object') {
            return;
        }

        // 找界面配置位置
        if (typeof config[id.form] != 'object') {
            return;
        }

        // 找界面中表格配置数组
        if (typeof config[id.form]['grids'] != 'object') {
            return;
        }

        // 找界面中指定表格配置
        if (typeof config[id.form]['grids'][id.grid] != 'object') {
            return;
        }

        // 返回配置
        return config[id.form]['grids'][id.grid];         
    };	

    let _remove_grid_layout_from_config = function() { // 移除grid外观配置
        let config =  heelWeb.config.get(_config_key);
		let id = this.grid_id();

        // 配置是否存在？
        if (typeof config != 'object') {
            return;
        }

        // 找界面配置位置
        if (typeof config[id.form] != 'object') {
            return;
        }

        // 找界面中表格配置数组
        if (typeof config[id.form]['grids'] != 'object') {
            return;
        }

        // 找界面中指定表格配置
        if (typeof config[id.form]['grids'][id.grid] == 'undefined') {
            return;
        }

        // 移除配置
        delete config[id.form]['grids'][id.grid];

        // 保存配置
        heelWeb.config.set(_config_key, config);
        heelWeb.config.update();
    };

	let _get_grid_layout = function() { // Get current layout of grid
		console.log('Get current layout of grid ' + this.grid_id_str());
		let layout = {};

        // 列信息
        layout['fields'] = []
		_grid.dataModel.colModel.columns.forEach((val, idx) => {
			let field = {}; // 字段信息

			// field key
			field['key'] = val.key;
			// field name
			field['label'] = val.label;
			// field width
			field['width'] = val.width;
			// visibility
			field['hidden'] = val.hidden;

			if (_original_user_style) { // we have original style？
				for (let i=0; i<_original_user_style.fields.length; i++) {
					if (field['key'] == _original_user_style.fields[i].key) {
						field['original_index'] = i; // original field index
						if (_grid.selectFieldIndex == i) field['is_select'] = true; // is select field flag
						break;
					}
				}
			}

			layout['fields'].push(field);			
		});

		return layout;
	};

	let _refresh_grid = function() { // show grid new layout
		// 重置列数据映射 
		_grid.dataModel.display_cols_map = null;

		// 去除数据自定义显示标志
		let rows = _grid.dataModel.data;
		for (let i=0; i<rows.length; i++) {
			rows[i].data[0].customized = false;
		}

		if (_grid.pageInfo.pageLoadType == 0) { // 不分页
			_grid.pageInfo.pageRowCount = 0;
		}

		_grid.gridHandler.doGoToPage(_grid, _grid.pageInfo.curPageIndex, true); // 刷新显示和数据
		// _grid.refreshGrid(); // 只刷新显示不刷新数据
	};

    let _setting_of_grid_layout = function() { // setting of grid
		let self = this;

		// 获取识别id
		let id = this.grid_id();
		if (!id) {
			console.log('Invalid grid id');
			return;
		}

		// 获取grid布局配置
        let layout = _get_grid_layout_from_config.call(self);
        if (!layout) {
            layout = _get_grid_layout.call(self);
        }

        // 设置
        let dialog_settings = new heelWeb.component.dialog_grid_layout({
            form: id.form,
            id: id.grid,
			select_field_index: _grid.selectFieldIndex, // 选择字段，最好不要移动
            layout: layout,
            on_ok: (layout) => {
                console.log('update grid layout.layout=' + JSON.stringify(layout));

                _save_grid_layout.call(self, layout); // 保存新的显示布局
				_refresh_grid.call(self); // 刷新表格显示
            }
        });
        dialog_settings.show();
    };    

	let _event = function() { // add events handler
		let self = this;

        _icon.click(function() {
            _menu_container.show();

            myApi.display.tricks.play({
                domEl: _menu_list, 
                styleName: 'show-grid-customize-menu',
				timeout: 200
            });        
        });  

        _menu.mouseleave(function() {
            myApi.display.tricks.play({
                domEl: _menu_list, 
                styleName: 'hide-grid-customize-menu',
                callback: function() {
                    _menu_container.hide();
                },
				timeout: 200
            });
        });
        
        _menu_list.find('.reset').click(function() {
            let id = self.grid_id_str();
            console.log('Reset customized style of ' + id);

			_remove_grid_layout_from_config.apply(self); // 清除自定义显示设置
			_refresh_grid.call(self); // 刷新表格显示
			(new heelWeb.component.hint({message: '已清除个性化设置'})).show();
        });

        _menu_list.find('.settings').click(function() {
            let id = self.grid_id_str();
            console.log('Set customized style of ' + id);

			_setting_of_grid_layout.call(self);
        });

        // 监控grid控件改变字段宽度
		_grid.getOuterEl().delegate('div.ui-ygrid-resize-mark', 'mouseup', function() {
            setTimeout(() => { // 等显示更新完毕
				console.log('On resize column of grid ' + self.grid_id_str());

				let grid_layout = _get_grid_layout.apply(self); console.log('grid layout:' + JSON.stringify(grid_layout));
				_save_grid_layout.apply(self, [grid_layout]);
            }, 1000);
        });

	};

    let _add_menu = function() { // add menu
        // Get grid id
        let id = this.grid_id();
        if (!id) { // invalid id
            return;
        }

        // Create menu
        _menu = $('<div class="grid-customize-menu" form="' + id.form + '" grid="' + id.grid + '">'
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
        _menu.appendTo(_grid.getOuterEl());		
    };

	this.install = function() { // Install object for current grid
		_add_menu.apply(this);
		_event.apply(this);
	};

	console.log('Create user style of grid ' + this.grid_id_str());
};
