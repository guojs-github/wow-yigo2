/**
 * keyboard routines.
 * 
 * 2023/8/29 created by guojs.
 */

var myApi = myApi || {};
myApi.keys = (new function () {
    let _keys = {
        tab: 9,
        enter: 13
    }

    this.is_tab = (key) => {
        if (_keys['tab'] == key) return true;
        else return false;
    };

    this.is_enter = (key) => {
        if (_keys['enter'] == key) return true;
        else return false;
    };
}());
