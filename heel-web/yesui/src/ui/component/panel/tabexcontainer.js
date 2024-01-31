/**
 * TabExContainer
 * 以TAB页为显示形式的单据容器，单据为Form
 */
YIUI.Panel.TabExContainer = YIUI.extend(YIUI.Panel.TabPanelEx, {
	
	afterRender: function(){
		this.base();
		var custom;
		switch(this.customTag) {
		case "UserInfoPane":
			custom = YIUI.CUSTOMVIEW.USERINFOPANE;
			break;
			
		default :
			custom = "";
		}
		$(custom).appendTo($(".customView_li"));
	}
});
YIUI.reg('tabexcontainer', YIUI.Panel.TabExContainer);