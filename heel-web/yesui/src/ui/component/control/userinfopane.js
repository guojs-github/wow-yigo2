//父容器  #customView_li
YIUI.CUSTOMVIEW = {};
(function ($) {

	var dropdown = function() {
		
	    self._dropdownItems.slideDown("fast");
	    
	    
	    //下拉内容显示的位置
	    self._dropdownItems.slideDown("fast");

	    self._dropdownItems.css({
	    	width : self.el.width()+ "px",
			height : self.el.height() + "px"
	    });
		
		$(document).on("mousedown",function(e){
	        var target = $(e.target);

	        if((target.closest(self._dropdownItems).length == 0)
	            &&(target.closest(self.buttonLeft).length == 0)
	            &&(target.closest(self.buttonRight).length == 0)){
	        	
	            self.hideDropdownList();
	            $(document).off("mousedown");
	        }
	        self.el.removeClass("datepicker_btnClick");
	    });

	    self._hasShow = true;
	    event.stopPropagation();
	};
	var logout = function() {
		$.cookie("JSESSIONID", null);
		$.cookie("usercode", null);
		location.href = "http://localhost:8089/yes";
	};
	var exit = function() {
		$("#form").remove();
		$.cookie("JSESSIONID", null);
		$.cookie("usercode", null);
	};
	var dropdownbutton = "<div class='btn-group'> " +
							"<button data-toggle='dropdown' class='btn btn-default dropdown-toggle' onclick='dropdown()'>"+YIUI.I18N.getString("USERINFOPANE_ADMIN","系统管理员")+"<span class='caret'></span></button>" +
							"<ul class='dropdown-menu'>" +
								"<li><a class='logout' onclick='logout()'>"+YIUI.I18N.getString("USERINFOPANE_APPLOGOUT","注销")+"</a></li>" +
								"<li><a class='exit' onclick='exit()'>"+YIUI.I18N.getString("USERINFOPANE_APPEXIT","退出")+"</a></li>" +
							"</ul>" +
						"</div>"
	
	YIUI.CUSTOMVIEW.USERINFOPANE = dropdownbutton;
}(jQuery) );
