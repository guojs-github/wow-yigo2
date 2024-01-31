/**
 * Extend array object.
 * 
 * 2023/9/26 created by guojs.
 */

Array.prototype.indexOf = function(val) {
    for (let i=0; i< this.length; i++) {
        if (this[i] == val) return i;
    }

    return -1;
};

Array.prototype.remove = function(val) {
    let idx = this.indexOf(val);
    if (idx != -1) {
        this.splice(idx, 1);
    }
}
