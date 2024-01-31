/**
 * TabExContainer
 * 以TAB页为显示形式的单据容器，单据为Form
 */
YIUI.Control.Custom = YIUI.extend(YIUI.Control, {
	
	autoEl: "<div/>",
	
	height: "100%",
	
	onSetHeight: function(height) {
		this.el.css("height", height);
		this.custom.setHeight(height);
	},
	
	onSetWidth: function(width) {
		this.el.css("width", width);
		this.custom.setWidth(width);
	},
	
	afterRender: function(ct){
		this.base(ct);
		var custom;
		switch(this.tag) {
		case YIUI.Custom_tag.UserInfoPane:
			custom = YIUI.CUSTOMVIEW.USERINFOPANE;
			break;
		case YIUI.Custom_tag.RoleRights:
		case YIUI.Custom_tag.OperatorRights:
			var options = {
				tag: this.tag,
				userID: $.cookie("userID"),
				formKey: YIUI.FormStack.getForm(this.ofFormID).formKey
			};
			custom = YIUI.CUSTOM_ROLERIGHTS(options);
			break;
		default :
			custom = "";
		}
		this.custom = custom;
		this.el.append(custom.el);
	}
});
YIUI.reg('custom', YIUI.Control.Custom);