/** 
 * heel-web component combobox recent object.
 * 
 * 2023.11.9 created by GuoJS.
 */

var heelWeb = heelWeb || {};
heelWeb.component = heelWeb.component || {};
heelWeb.component.combobox = heelWeb.component.combobox || {};
heelWeb.component.combobox.recent = function(combobox) {
    let _combobox = combobox;
    let _el = null;

    let _get_current_form_key = function() {
        let form_object = heelWeb.yigo2.common.misc.get_current_form();

        return form_object? form_object.formKey: '';
    }

    let _get_control_key = function() {
        let sep = '_';
        let id = _combobox.el.attr("id");

        let items = id.split(sep);
        if (0 >= items.length) {
            return '';
        }

        items.shift(); // remove first item
        return items.join(sep);
    };

    let _get_object_name = function() {
        return  'recent object of combobox ' + _get_current_form_key() + '.' + _get_control_key();
    };

    let _create = function() {
        _el = $('<div class="combobox-recent">\
                    <div class="prompt">上次选择:</div>\
                    <div class="recent"></div>\
                </div>');
        _el.appendTo(_combobox._dropView);
    };

    this.init = function() {
        console.log('Initialize ' + _get_object_name());

        _create();
    };

    console.log('Create ' + _get_object_name());
}