/*
	heel-web component user condition.
	2023.10.13 GuoJS Created
*/
var heelWeb = heelWeb || {};
heelWeb.component = heelWeb.component || {};
heelWeb.component.user_condition = (new (function (){
    // 考虑在指定要自动记录查询条件信息的控件上，添加自定义class，user-condition
    let _interval = 1000;
    let _flag = 'user-condition';
    let _flag_loaded = 'user-condition-loaded';
    let _current_form_id = -1, _previous_form_id = -1;
    let _config_key = 'user_condition';
    let _control_type = [
        'dict', 
        'texteditor', 
        'textarea',
        'datepicker',
        'utcdatepicker', 
        'monthpicker',
        'timepicker',
        'combobox',
        'checklistbox',
        'numbereditor',
        'checkbox'
    ];

    let _get_current_form_id = function() { // Get current form object
        let form_id = heelWeb.yigo2.common.misc.get_current_form_id();
        
        // return
        if (form_id > 0) {
            _previous_form_id = _current_form_id;
            _current_form_id = form_id;

            return form_id;
        }
    };

    let _get_current_form = function() { // Get current form object
        // form id
        let form_id = _get_current_form_id();
        if (!form_id) return; // invalid

        // form object
        let form_object = YIUI.FormStack.getForm(form_id);

        return form_object;
    };

    let _get_user_condition_container = function () { // Get user condition container
        // form object
        let form_object = YIUI.FormStack.getForm(_current_form_id);

        // form components
        let components = form_object.getComponentList();

        // search container
        for (let key in components) {
            if (components[key].cssClass 
                && typeof components[key].cssClass == 'string' 
                && 0 <= components[key].cssClass.indexOf(_flag)) {
                return components[key];
            }
        }
    };

    let _get_controls = function(container) { // Get control list under specified container
        // form object
        let form_object = YIUI.FormStack.getForm(_current_form_id);

        // form components
        let components = form_object.getComponentList();

        // search controls under specified container
        let controls = [];
        for (let key in components) {
            // skip container
            if (key == container.key) continue;

            // this control is child of container
            if (_is_child_of_container(components[key], container)
                && (_is_valid_control(components[key]))) {
                controls.push(components[key]);
            }
        }

        return controls;
    };

    let _is_child_of_container = function(control, container) {
        // check
        if (!container.el) {
            return false;
        }

        // container id
        let id = container.el.attr('id');

        // control parent is container?
        if (!control.container) return false;
        for (let i=0; i<control.container.length; i++) {
            let c = control.container[i];
            let c_id = $(c.offsetParent).attr('id');

            if (id == c_id) {
                return true;
            }
        }

        return false;
    };

    let _is_valid_control = function(control) {
        for (let i=0; i<_control_type.length; i++) {
            if (control.tagName == _control_type[i]) {
                return true;
            }
        }

        return false;
    };

    let _is_loaded = function(container) { // cached condition data already loaded?
        return $(container.el).hasClass(_flag_loaded);
    };

    let _load_condition = function(container, controls) {
        console.log('Load cached conditions');

        // Load config
        let config = _get_conditions_from_config();
        console.log('Cached config=' + JSON.stringify(config));
        let conditions = config.conditions || [];
        for (let i=0; i<controls.length; i++) { // load cached value
            for (let j=0; j<conditions.length; j++) {
                if (conditions[j].name == controls[i].key) { // found
                    if ('dict' == conditions[j].type) {
                        if (conditions[j].value != "null") {
                            let options = JSON.parse(conditions[j].value);
                            let val = null;

                            if (options.concat) { // 数组？多选
                                val = [];
                                for (let i=0; i<options.length; i++) {
                                    let option = new YIUI.ItemData(options[i]);

                                    val.push(option);
                                }
                            } else { // 单选
                                val = new YIUI.ItemData(options);
                            }
                            controls[i].setValue(val, true, true);
                        }
                    } else if ('monthpicker' == conditions[j].type 
                            || 'timepicker' == conditions[j].type) {
                        controls[i].setText(conditions[j].value);                         
                    } else {
                        if (conditions[j].value != null) {
                            controls[i].setValue(conditions[j].value, true, true);
                        }
                    }
                }
            }
        }
        
        // Set loaded flag
        $(container.el).addClass(_flag_loaded);

        // Show hint
        (new heelWeb.component.hint({message: '个性化数据已经加载'})).show();
    };

    let _cache_condition = function(container, controls) {
        console.log('Cache conditions');

        // conditions
        let conditions = [];
        for (let i=0; i<controls.length; i++) {
            let condition = {
                name: controls[i].key,
                type: controls[i].tagName
            };

            if ('dict' == condition.type) {
                condition['value'] = JSON.stringify(controls[i].getValue());
            } else if ('monthpicker' == condition.type 
                    || 'timepicker' == condition.type) {
                let v = controls[i].getText();
                v = v.replace(/[^\d\s]/g, ''); // 移除非数字所有字符

                condition['value'] = v;
            } else {
                condition['value'] = controls[i].getValue();
            }

            conditions.push(condition);
        }

        // settings
        let enabled = _is_enabled(container);

        // cache
        _save_conditions({
            enabled: enabled,
            conditions: conditions
        });
    };

    let _save_conditions = function(value) { 
        let config =  heelWeb.config.get(_config_key);
        let form = _get_current_form();
        let container = _get_user_condition_container();

        if (typeof config != 'object') {
            config = {};
        }

        if (typeof config[form.formKey] != 'object') {
            config[form.formKey] = {};
        }

        if (typeof config[form.formKey][container.key] != 'object') {
            config[form.formKey][container.key] = [];
        }

        config[form.formKey][container.key] = value;

        // update data to config file
        heelWeb.config.set(_config_key, config);
        heelWeb.config.update();        
    };

    let _get_conditions_from_config = function() {
        let config =  heelWeb.config.get(_config_key);
        let form = _get_current_form();
        let container = _get_user_condition_container();

        if (typeof config != 'object') {
            return {};
        }

        if (typeof config[form.formKey] != 'object') {
            return {};
        }

        if (typeof config[form.formKey][container.key] != 'object') {
            return {};
        }

        return config[form.formKey][container.key];         
    };	

    let _show_settings = function(container, controls) {
        // settings already added
        if (container.el.find('.user-condition-settings').length > 0) {
            return;
        }

        // add settings on interface
        let settings = $('<div class="user-condition-settings"> \
                            <div class="setting ui-chk enabled"> \
                                <span class="chk"></span> \
                                <label>自动保存</label> \
                            </div> \
                        </div>');
        settings.find('> .setting.enabled').click(function() {
            let checkbox = $(this).find('span.chk');

            if (checkbox.hasClass('checked')) { 
                checkbox.removeClass('checked');
                // save before disabled
                _cache_condition(container, controls);
            } else {
                checkbox.addClass('checked');
            }
        });
        settings.appendTo(container.el);

        // init value of setting
        let setting_enabled_checkbox = settings.find('> .setting.enabled span.chk');
        let config = _get_conditions_from_config();
        if (config.enabled) {
            setting_enabled_checkbox.addClass('checked');
        } else {
            setting_enabled_checkbox.removeClass('checked');
        }
    };

    let _is_enabled = function(container) {
        let checkbox = $(container.el).find('.user-condition-settings > .setting.enabled span.chk');

        // found
        if (checkbox.length != 1) {
            return false;
        }

        // check value
        if (checkbox.hasClass('checked')) {
            return true;
        } else {
            return false;
        }
    };

    let _worker = function() {
        // 获取当前tab页面
        let form = _get_current_form();
        if (!form) return; // invalid object
        //    if (_previous_form_id == _current_form_id) return; // not a new form
        //    console.log('Switch to form: id=' + form.formID 
        //                 + '; key=' + form.formKey 
        //                 + '; caption=' + form.caption
        //                 + '; entry_caption=' + form.paras.get('EntryCaption')
        //                 + '; entry_path=' + form.entryPath
        //                 + '; OID=' + form.filterMap.getOID());

        // 获取user-condition标记容器
        let container = _get_user_condition_container();
        if (!container) return; // not found

        // 列出user-condition标记下的控件清单
        let controls = _get_controls(container);
        if (0 == controls.length) {
            return;
        }
        // let controls_list = [];
        // controls.forEach(c => { controls_list.push(c.id) });
        // console.log('Controls list:' + controls_list.join('/'));

        // 显示设置界面
        _show_settings(container, controls);

        if (_is_enabled(container)) {
            // // 赋值控件或者保存当前控件值
            if (_is_loaded(container)) {
                _cache_condition(container, controls);
            } else {
                _load_condition(container, controls);
            }
        }
    };

    let _install = function() {
        console.log('install heel-web user condition object');

        setInterval(_worker, _interval);
    };
	
    _install();
})());