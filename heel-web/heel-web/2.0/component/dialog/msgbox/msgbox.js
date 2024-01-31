/*
	heel-web component message-box.
	2023.3.30 created by GuoJS.
*/
var heelWeb = heelWeb || {};
heelWeb.component = heelWeb.component || {};
heelWeb.component.msgbox = function (param){
	let _this = this;
	let _param = param;
	let _message = '';
	let _width = '400px', _height = '250px', _toolbar_height = '50px';
	let _dialog;
	let _ok_button;

	let _params = function() {
		if (_param) {
			if (typeof _param.message == 'string') {
				_message = _param.message;
			}
			if (typeof _param.width == 'string') {
				_width = _param.width;
			}
			if (typeof _param.height == 'string') {
				_height = _param.height;
			}
		}		
	};
	
	let _create = function() {
		// create dialog
		_param.ex_class = 'hw-msgbox';
		_param.height = 'auto';
		_dialog = new heelWeb.component.dialog(_param);
		
		// customize dialog
		let msg_height = 'calc(' + _height + ' - ' + _toolbar_height + ')';
		content = _dialog.content();
		let msg = $('<div class="hw-flex-row hw-msg">\
				<div class="hw-msg-icon">\
					<i class="fa-solid fa-circle-info fa-3x" style="color:#ED6D15"></i>\
				</div>\
				<div class="hw-scroll-y hw-msg-text"><span>' + _message + '</span></div>\
			</div>');
		msg.width(_width); msg.height(msg_height);
		let msg_icon = msg.find('.hw-msg-icon');
		let msg_text = msg.find('.hw-msg-text');
		msg_text.height(msg_height); msg_text.css(msg_height);
		content.append(msg);
		let msg_tool_bar = $('<div class="hw-msg-toolbar">\
				<button class="hw-button hw-primary hw-ok">\
					<span class="txt">了解</span>\
				</button>\
			</div>');
		_ok_button = msg_tool_bar.find('.hw-ok');
		content.append(msg_tool_bar);
	};
	
	let _events = function() {
		_ok_button.click(function() {
			_dialog.close();
		});
	};
	
	let _init = function(){
		console.log('msgbox.init()');
		_params();
		_create();
		_events();
	};

	this.show = function() {	
		console.log('message-box.show()');
		_dialog.show();
	};
	
	_init();
};