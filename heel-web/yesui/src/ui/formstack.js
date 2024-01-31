/**
 * Created with JetBrains WebStorm.
 * User: chenzs
 * Date: 14-5-6
 * Time: 下午3:08
 */
YIUI.FormStack = (function () {
    var Return = {
        addForm: function (form) {
            if (typeof this.formList == "undefined") {
                this.formList = new Array();
            }
            this.formList.push(form);
        },
        getForm: function (formID) {
        	for (var i = 0; i < this.formList.length; i++) {
				if(formID == this.formList[i].formID) {
					return this.formList[i];
				}
			}
            return null;
        },
        removeForm: function(formID) {
        	for (var i = 0; i < this.formList.length; i++) {
				if(formID == this.formList[i].formID) {
                    this.formList[i].destroy();
					this.formList.splice(i, 1);
				}
			}
        	
        },
        removeAll: function() {
        	if(!this.formList) return;
        	for (var i = 0; i < this.formList.length; i++) {
                this.formList[i].destroy();
			}
        	this.formList = [];
        }
    };
    return Return;
})();