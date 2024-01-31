(function () {
	var v = '?v=20191126';
	var root = "yesui/dist/";
	
	var getCookie = function(key){
		var arr,reg = new RegExp("(^| )"+key+"=([^;]*)(;|$)");
		if(arr = document.cookie.match(reg)){
			return unescape(arr[2]);
		}
		return null;
	}

	var myStyle = getCookie("myStyle");
	if(!myStyle){
		myStyle = 'default';
	}

	window.cssPath = root + "css/" + myStyle;

	var local = getCookie("locale");
	if(!local){
		local = 'zh-CN';
	}
	
	//IE 下兼容console
	if(/msie/.test(navigator.userAgent.toLowerCase()) || /rv:([\d.]+)\) like gecko/.test(navigator.userAgent.toLowerCase())){
		document.write("<script type='text/javascript' src='"+root+"js/fauxconsole.js"+v+"'></script>");
	}

	var file = "<link rel='stylesheet' href='"+root+"css/plugin/fullcalendar/fullcalendar.css"+v+"'>" + 
				"<link rel='stylesheet' href='"+root+"css/plugin/bootstrap/bootstrap.css"+v+"'>" +
				"<link rel='stylesheet' href='"+root+"css/plugin/datepicker/css/datepicker.css"+v+"'/>" +
				"<link rel='stylesheet' href='"+root+"css/plugin/smartspin/smartspinner.css"+v+"'/>" +
				"<link rel='stylesheet' href='"+root+"css/plugin/modaldialog/css/jquery.modaldialog.css"+v+"'/>" +
				"<link rel='stylesheet' href='"+root+"css/plugin/paginationjs/pagination.css"+v+"'/>" +
				"<link rel='stylesheet' href='"+root+"css/plugin/wangEditor/wangEditor-1.4.0.css"+v+"'/>" +
				"<link rel='stylesheet' href='"+root+"css/plugin/treetable/stylesheets/jquery.treetable.theme.default.css"+v+"' />" +
				"<link rel='stylesheet' href='"+root+"css/plugin/scrollbar/scrollbar.css"+v+"' />" +
				
				"<link rel='stylesheet' href='"+root+"css/"+myStyle+"/main.css"+v+"'>" +
				"<link rel='stylesheet' href='"+root+"css/"+myStyle+"/core.css"+v+"'>" +
				"<link rel='stylesheet' href='"+root+"css/"+myStyle+"/grid.css"+v+"'>" +
				
				"<script type='text/javascript' src='"+root+"js/yigo-base.js"+v+"'></script>" +
				"<script type='text/javascript' src='"+root+"js/yigo-parser.js"+v+"'></script>" +
				"<script type='text/javascript' src='"+root+"js/yigo-ui.js"+v+"'></script>" +
				"<script type='text/javascript' src='"+root+"js/yigo-ui-control.js"+v+"'></script>" +
				"<script type='text/javascript' src='"+root+"js/yigo-plugin.js"+v+"'></script>" +

				"<script type='text/javascript' src='"+root+"js/language/i18n.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"js/language/"+local+"/i18N.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"js/language/"+local+"/plug-in.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"js/exception/bpm/"+local+"/stringtable.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='"+root+"js/exception/view/"+local+"/stringtable.js"+v+"' defer='defer'></script>" +
				"<script type='text/javascript' src='project/extend.js"+v+"' defer='defer'></script>";

	document.write(file);
}());
