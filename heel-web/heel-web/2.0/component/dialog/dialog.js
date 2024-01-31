/*
	heel-web component dialog.
	2023.3.28 GuoJS Created
*/
var heelWeb = heelWeb || {};
heelWeb.component = heelWeb.component || {};
heelWeb.component.dialog = function (param){
	let _this = this;

	let _param = param;
	let _caption = '未设置', _ex_class = '', _destroy_on_close = true, _have_mask = true;
	let _on_close = null;

	let _el;
	let _cap, _content;

	let _params = function() {
		if (_param) {
			if (typeof _param.ex_class == 'string') {
				_ex_class = _param.ex_class;
			}
			if (typeof _param.caption == 'string') {
				_caption = _param.caption;
			}			
			if (typeof _param.on_close == 'function') {
				_on_close = _param.on_close;
			}			
			if (typeof _param.destroy_on_close == 'boolean') {
				_destroy_on_close = _param.destroy_on_close;
			}
			if (typeof _param.have_mask == 'boolean') {
				_have_mask = _param.have_mask;
			}
		}		
	};
	
	let _create = function() {
		let _html = '<div class="hw-dialog ' + _ex_class + '">'
			+ '  <div class="dialog show">'
			+ '    <div class="dialog-header">'
			+ '      <div class="dialog-title">' + _caption + '</div>'
			+ '      <div class="dialog-close"></div>'
			+ '    </div>'
			+ '    <div class="dialog-content"></div>'
			+ '  </div>';
			+ '</div>';
		_el = $(_html);
		_content = _el.find('.dialog-content');
		_cap = _el.find('.dialog-title');
		$('body').append(_el);
	};

	let _events = function() {
		let _close_button = _el.find('div.dialog-close');
		_close_button.click(() =>{
			_this.close();
		});
	};
	
	let _init = function(){
		console.log('dialog.init()');
		_params();
		_create();
		_events();
		_el.hide();
	};
	
	this.content = function() {
		return _content;
	};

	this.caption = function() {
		return _cap;
	};

	this.el = function() {
		return _el;
	};
			
	this.close = function() {
		heelWeb.component.mask.hide();
		if (_destroy_on_close) {
			_el.remove(); // 删除
		} else {
			_el.hide(); // 隐藏
		}
		if (typeof _on_close == 'function') {
			_on_close();
		}
	};
	
	this.show = function() {	
		console.log('dialog.show()');

		if (_have_mask) {
			heelWeb.component.mask.show();
		}
		_el.show();
	};
	
	_init();
};