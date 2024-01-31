/**
 * Miscellaneous functions 4 yigo2.0
 * 
 * 2023.11.9 created by guojs.
 */

var heelWeb = heelWeb || {};
heelWeb.yigo2 = heelWeb.yigo2 || {};
heelWeb.yigo2.common = heelWeb.yigo2.common || {};
heelWeb.yigo2.common.misc = (new function () {
    this.get_current_form_id = function() { // Get current form id
        // tabs
        let tabs = $('.heel-web > .main > .mainRight.ui-tabcnt > .ui-tabs-header > ul.ui-tabs-nav');
        if (1 != tabs.length) { // Invalid
            return;
        }

        // selected tab
        let selected_tab = tabs.find('> li.aria-selected');
        if (1 != selected_tab.length) { // Invalid
            return;
        }

        // get form id
        let cid = selected_tab.attr('cid');
        let temp = cid.split('_');
        let form_id = parseInt(temp[0]);
        
        // return
        return form_id;
    };

    this.get_current_form = function() { // Get current form object
        // form id
        let form_id = this.get_current_form_id();
        if (!form_id) return; // invalid

        // form object
        let form_object = YIUI.FormStack.getForm(form_id);

        return form_object;
    };    
}());