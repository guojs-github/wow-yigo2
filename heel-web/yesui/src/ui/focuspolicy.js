var FocusPolicy = FocusPolicy || {};
(function () {
    /**
     * WEB没有做焦点切换到ROOT面板的操作
     */
    FocusPolicy = function (form) {
        var Return = {
            form: form,
            focusOwner: null,
            orderList: [],
            process: function (orderList,unOrderList) {
                orderList.sort(function (comp1, comp2) {
                    return comp1.order - comp2.order;
                });
                orderList = orderList.concat(unOrderList);
                for (var i = 0, len = orderList.length; i < len; i++) {
                    orderList[i].setTabIndex(i);
                }
                this.orderList = orderList;
            },
            requestNextFocus: function () {
                if ( this.focusOwner ) {
                    Return.focusNextNode(this.focusOwner.getTabIndex() + 1,this.orderList.length);
                } else {
                    Return.focusNextNode(0,this.orderList.length);
                }
            },
            focusNextNode: function (begin,end) {
                var com,active;
                for( var i = begin;i < end;i++ ) {
                    com = this.orderList[i];
                    active = true;
                    $(com.el).parents(".ui-tabs-panel").each(function (idx,elem) {
                        if( !$(elem).hasClass('aria-show') ){
                            active = false;
                            return false;
                        }
                    });
                    if (com.el && com.enable && com.visible && active) {
                        com.focus();
                        if( this.focusOwner == com ) { // 焦点拥有者改变,设置成功
                            return;
                        }
                    }
                }
                if( begin > 0 ) {
                    this.focusNextNode(0, begin);// 找到不焦点,从头开始找
                }
            }
        };
        return Return;
    };
})();