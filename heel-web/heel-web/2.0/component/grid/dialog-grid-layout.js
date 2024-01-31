/**
 * dialog control of grid layout.
 * 
 * 2023.9.19 created by guojs.
 */
var heelWeb = heelWeb || {};
heelWeb.component = heelWeb.component || {};
heelWeb.component.dialog_grid_layout = function (param){
	let _self = this;
	let _param = param || {};
	let _form = '未知', _id='未知', _layout={};
	let _dialog;
	let _ok_button, _cancel_button, _show_all_button, _hide_all_button;
	let _fields;
	let _on_ok = null;

	let _init = function(){
		console.log('dialog_grid_layout.init()');
		_params();
		_create();
		_events.call(this);
	};

	let _params = function() {
		if (_param) {
			if (typeof _param.form == 'string') {
				_form = _param.form;
			}
			if (typeof _param.id == 'string') {
				_id = _param.id;
			}
			if (typeof _param.layout == 'object') {
				_layout = _param.layout;
			}
			if (typeof _param.on_ok == 'function') {
				_on_ok = _param.on_ok;
			}			
		}		
	};
	
	let _create = function() {
		// create dialog
		_param.caption = '表格设置【' + _form + '.' + _id + '】';
		_param.ex_class = 'hw-dialog-grid-layout';
		// _param.height = 'auto';
		_dialog = new heelWeb.component.dialog(_param);
		
		// customize dialog
		content = _dialog.content();
		let layout = $('<div class="hw-flex-col hw-grid-layout">\
				<div class="hw-icon">\
					<i class="fa-solid fa-table fa-3x" style="color:#ED6D15"></i>\
				</div>\
				<div class="hw-scroll-x hw-flex-row hw-fields">\
				</div>\
			</div>');
		_fields = layout.find('.hw-fields');
		for (let i=0; i<_layout.fields.length; i++) {
			let field_layout = _layout.fields[i];

			if (field_layout.is_select) { // 勾选列，不加入自定义设置
				continue;
			}

			let field =$('<div class="hw-flex-col hw-field" key="' + field_layout.key + '">'
							+ '<div class="hw-field-setting hw-field-name">' 
								+ '<div class="hw-move-to-first"><i class="fa-solid fa-angles-left"></i></div>'
								+ '<span class="name">' + field_layout.label + '</span>' 
								+ '<div class="hw-move-to-last"><i class="fa-solid fa-angles-right"></i></div>'
							+ '</div>' 
							+ '<div class="hw-flex-row hw-field-setting hw-field-visible">'
							+ 	'<div class="hw-name">显示</div>'
							+ 	'<div class="hw-value">'
									+ '<input type="checkbox" ' + (field_layout.hidden? '' : 'checked') + ' ' + (field_layout.key == 'select' ? 'disabled' : '') + '/>'
								+ '</div>'
							+ '</div>' 
							+ '<div class="hw-flex-row hw-field-setting hw-field-width"><div class="hw-name">宽度</div><div class="hw-value">' + field_layout.width + '</div></div>' 
						+ '</div>');
			if (field_layout.label.length > 10) { // 字段名称超过10个字
				let field_name = field.find('.hw-field-name');
				field_name.width(field_layout.label.length * 14 + 'px');
			}

			_fields.append(field);
		}		
		content.append(layout);
		let tool_bar = $('<div class="hw-flex-row hw-toolbar">\
				<div class="left"> \
					<button class="hw-button show-all">\
						<span class="txt">显示所有</span>\
					</button>\
					<button class="hw-button hide-all">\
						<span class="txt">隐藏所有</span>\
					</button>\
				</div> \
				<div class="right"> \
					<button class="hw-button cancel">\
						<span class="txt">取消</span>\
					</button>\
					<button class="ok">\
						<span class="txt">确认</span>\
					</button>\
				</div> \
			</div>');
		_ok_button = tool_bar.find('.ok');
		_cancel_button = tool_bar.find('.cancel');
		_show_all_button = tool_bar.find('.show-all');
		_hide_all_button = tool_bar.find('.hide-all');
		content.append(tool_bar);

		// Drag & Drop
		Sortable.create(_fields[0], {
			animation: 150,
			// filter: '.hw-field[key="select"]', // 不可拖动的元素
		}); 
	};
	
	let _events = function() {
		let self = this;

		_ok_button.click(function() { // click ok
			_dialog.close();
			_update_layout.call(self);
			if (typeof _on_ok == 'function') {
				_on_ok(_layout);
			}	
		});

		_cancel_button.click(function() { // click cancel
			_dialog.close();
		});

		_show_all_button.click(function() { // click show all fields
			let visible_inputs = _fields.find('.hw-field > .hw-field-visible input');
			
			// select all the checkbox
			for (let i=0; i<visible_inputs.length; i++) {
				$(visible_inputs[i]).prop('checked', true);
			}
		})

		_hide_all_button.click(function() { // click hide all fields
			let visible_inputs = _fields.find('.hw-field > .hw-field-visible input');
			
			// select all the checkbox
			for (let i=0; i<visible_inputs.length; i++) {
				$(visible_inputs[i]).prop('checked', false);
			}
		})

		let move_field = function(pos) { // move field
			// Check
			if (('first' != pos) && ('last' != pos)) {
				return;
			}

			// remve selected field
			let selected_field = $(this).parent().parent();
			selected_field.remove();

			// move
			if ('first' == pos) {
				let fields = _fields.find('> .hw-field');
				$(fields[0]).before(selected_field);	
			}
			if ('last' == pos) {
				_fields.append(selected_field);				
			}

			// rebind events
			_fields.find('.hw-move-to-first').unbind();
			_fields.find('.hw-move-to-first').click(on_move_to_first);
			_fields.find('.hw-move-to-last').unbind();
			_fields.find('.hw-move-to-last').click(on_move_to_last);
		};

		let on_move_to_first = function() { // move to first place of fields
			console.log('move to first place of fields.');
			move_field.call(this, 'first');
		};
		_fields.find('.hw-move-to-first').click(on_move_to_first)

		let on_move_to_last = function() { // move to last place of fields
			console.log('move to last place of fields.');
			move_field.call(this, 'last');
		};
		_fields.find('.hw-move-to-last').click(on_move_to_last);
	};

	let _update_layout = function() {
		console.log('Update laytout.form=' + _form + ';grid=' + _id); 
		let layout = {fields: []};
		let fields = _fields.find('> .hw-field');
		
		for (let i=0; i<fields.length; i++) {
			let field = $(fields[i]);
			let key = field.attr('key');
			let label = field.find('.hw-field-name').text();
			let width =  field.find('.hw-field-width .hw-value').text();
			let hidden = field.find('.hw-field-visible input:checked').length == 1 ? false : true;

			layout.fields.push({
				key: key,
				label: label,
				width: width,
				hidden: hidden
			});
		}

		// 重新加入勾选列，应该只有1列
		for (let i=0; i<_layout.fields.length; i++) {
			if (_layout.fields[i].is_select) {
				// 在指定位置插入过滤掉的勾选字段
				layout.fields.splice(_layout.fields[i].original_index, 0, _layout.fields[i]);
				break;
			};
		}

		// 更新布局信息
		_layout = layout;
	};
	
	this.show = function() {	
		console.log('dialog_grid_layout.show()');
		_dialog.show();
	};
	
	_init();
};