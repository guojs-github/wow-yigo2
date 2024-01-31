/*
	heel-web component input hint.
	2023.8.16 created by guojs.
*/
var heelWeb = heelWeb || {};
heelWeb.component = heelWeb.component || {};
heelWeb.component.input_hint = (new function () {
    let _time_length = 1500; // 消息显示时间
    let _is_show = false; // 是否正在展示？

    let _show = function(ctrl, msg, class_name) {
        // concurrent?
        if (_is_show) return; 
        _is_show = true;

        let input_box = $(ctrl);
        let message = '' + msg;

        // Check
        if (input_box.length != 1) {
            return;
        }

        if (message.trim().length == 0) {
            return;
        }

        let current_value = input_box[0].value;
        let current_placeholder = input_box.attr('placeholder');
        let is_readonly = input_box.prop('readonly');
        // show hint
        input_box.val('');
        input_box.attr('placeholder', message);
        input_box.attr('readonly', '');
        input_box.addClass(class_name);
        setTimeout(() => {
            // restore
            input_box.val(current_value);
            input_box.attr('placeholder', typeof current_placeholder == 'undefined'? '': current_placeholder);
            if (!is_readonly) input_box.removeAttr('readonly');
            input_box.removeClass(class_name);
            
            _is_show = false;
        }, _time_length);
    };

    this.info = function(ctrl, msg) { // 信息
        _show(ctrl, msg, 'hw-input-hint-info');
    };

    this.warn = function(ctrl, msg) { // 告警
        _show(ctrl, msg, 'hw-input-hint-warn');
    };

    this.err = function(ctrl, msg) { // 错误
        _show(ctrl, msg, 'hw-input-hint-error');
    };

    console.log('Create input hint.');
}());

