/** 
 * heel-web component hint control.
 * 
 * 2023.9.19 created by GuoJS.
 */

var heelWeb = heelWeb || {};
heelWeb.component = heelWeb.component || {};
heelWeb.component.hint = function (param){
	let _param = param || {};
	let _message = '未设置提示信息', _type='info';

    let _el;

    let _init = function(){
		console.log('hint.init()');

        _params();
		_create();
	};

	let _params = function() {
		if (_param) {
			if (typeof _param.message == 'string') {
				_message = _param.message;
			}
			if (typeof _param.type == 'string') {
				_type = _param.type.trim().toLowerCase();
			}
		}		
	};

	let _create = function() {
        let icon_style = 'fa-circle-info';
        if (_type == 'warning') icon_style = 'fa-circle-exclamation';
        if (_type == 'error') icon_style = 'fa-bomb';
        let _html = '<div class="hw-hint ' + _type + '">'
            + '  <div class="hw-hint-content">'
            + '    <i class="fa-solid ' + icon_style + ' icon"></i>'
            + '    <span class="message">' + _message + '</span>'
			+ '  </div>';
			+ '</div>';
		_el = $(_html);
		$('body').append(_el);
	};

	this.show = function(duration=3000) {	
		console.log('hint.show()');

        _el.show(); // 显示
		setTimeout(() => {
            _el.remove(); // 隐藏
        }, duration);
	};

    _init();
};